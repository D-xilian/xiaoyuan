from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from flask_cors import CORS
import datetime
import functools
import os
import uuid
import io
import base64
import qrcode

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///campus_activity.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

CORS(app, supports_credentials=True, resources={r"/api/*": {"origins": "*"}, r"/uploads/*": {"origins": "*"}})
db = SQLAlchemy(app)
login_manager = LoginManager(app)

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def get_user_from_request():
    user_id = request.headers.get('X-User-ID')
    if user_id:
        return User.query.get(int(user_id))
    return None

def custom_login_required(f):
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_user_from_request()
        if not user:
            return jsonify({'message': '请先登录'}), 401
        return f(user, *args, **kwargs)
    return decorated_function

def admin_required(f):
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_user_from_request()
        if not user:
            return jsonify({'message': '请先登录'}), 401
        if user.role != 'admin':
            return jsonify({'message': '无权限访问，需要管理员权限'}), 403
        return f(user, *args, **kwargs)
    return decorated_function

# 数据库模型
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    role = db.Column(db.String(20), nullable=False, default='user')  # user=普通用户, admin=管理员

class Activity(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    time = db.Column(db.DateTime, nullable=False)
    location = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=False, default='other')
    image_url = db.Column(db.String(500), nullable=True)
    publisher_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    publisher = db.relationship('User', backref=db.backref('activities', lazy=True))

class JoinActivity(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    activity_id = db.Column(db.Integer, db.ForeignKey('activity.id'), nullable=False)
    join_time = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    # 参与者信息
    participant_name = db.Column(db.String(50), default='')
    participant_phone = db.Column(db.String(20), default='')
    participant_email = db.Column(db.String(100), default='')
    participant_department = db.Column(db.String(50), default='')
    participant_student_id = db.Column(db.String(20), default='')
    participant_introduction = db.Column(db.Text, default='')

class Collection(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    activity_id = db.Column(db.Integer, db.ForeignKey('activity.id'), nullable=False)
    collect_time = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    activity_id = db.Column(db.Integer, db.ForeignKey('activity.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    comment_time = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    user = db.relationship('User', backref=db.backref('comments', lazy=True))

class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    type = db.Column(db.String(50), nullable=False)
    message = db.Column(db.Text, nullable=False)
    activity_id = db.Column(db.Integer, nullable=True)
    related_user_id = db.Column(db.Integer, nullable=True)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class ActivityQRCode(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    activity_id = db.Column(db.Integer, db.ForeignKey('activity.id'), nullable=False)
    token = db.Column(db.String(64), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    activity = db.relationship('Activity', backref=db.backref('qrcodes', lazy=True))

class CheckIn(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    activity_id = db.Column(db.Integer, db.ForeignKey('activity.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    checkin_time = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    activity = db.relationship('Activity', backref=db.backref('checkins', lazy=True))
    user = db.relationship('User', backref=db.backref('checkins', lazy=True))

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# API路由
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')
    
    if User.query.filter_by(username=username).first():
        return jsonify({'message': '用户名已存在'}), 400
    
    if User.query.filter_by(email=email).first():
        return jsonify({'message': '邮箱已被注册'}), 400
    
    new_user = User(username=username, password=password, email=email)
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({'message': '注册成功'}), 200

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    user = User.query.filter_by(username=username).first()
    if not user or user.password != password:
        return jsonify({'message': '用户名或密码错误'}), 401
    
    login_user(user)
    return jsonify({
        'message': '登录成功',
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role
        }
    }), 200

@app.route('/api/logout', methods=['POST'])
@custom_login_required
def logout(user):
    return jsonify({'message': '登出成功'}), 200

@app.route('/api/activities', methods=['GET'])
def get_activities():
    activities = Activity.query.all()
    return jsonify([{
        'id': activity.id,
        'title': activity.title,
        'description': activity.description,
        'time': activity.time.strftime('%Y-%m-%d %H:%M'),
        'location': activity.location,
        'category': activity.category,
        'image_url': activity.image_url,
        'publisher': activity.publisher.username
    } for activity in activities]), 200

@app.route('/api/activities', methods=['POST'])
@admin_required
def create_activity(user):
    data = request.get_json()
    title = data.get('title')
    description = data.get('description')
    time = datetime.datetime.strptime(data.get('time'), '%Y-%m-%dT%H:%M')
    location = data.get('location')
    category = data.get('category', 'other')
    image_url = data.get('image_url')
    
    new_activity = Activity(
        title=title,
        description=description,
        time=time,
        location=location,
        category=category,
        image_url=image_url,
        publisher_id=user.id
    )
    db.session.add(new_activity)
    db.session.commit()
    
    return jsonify({'message': '活动创建成功', 'activity_id': new_activity.id}), 200

@app.route('/api/upload', methods=['POST'])
@custom_login_required
def upload_file(user):
    if 'file' not in request.files:
        return jsonify({'message': '没有文件部分'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'message': '没有选择文件'}), 400
    
    if file and allowed_file(file.filename):
        filename = str(uuid.uuid4()) + '.' + file.filename.rsplit('.', 1)[1].lower()
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        file_url = f'http://localhost:5000/uploads/{filename}'
        return jsonify({'message': '文件上传成功', 'file_url': file_url}), 200
    
    return jsonify({'message': '不支持的文件类型'}), 400

@app.route('/api/activities/<int:id>', methods=['GET'])
def get_activity(id):
    activity = Activity.query.get(id)
    if not activity:
        return jsonify({'message': '活动不存在'}), 404
    
    comments = Comment.query.filter_by(activity_id=id).all()
    
    return jsonify({
        'id': activity.id,
        'title': activity.title,
        'description': activity.description,
        'time': activity.time.strftime('%Y-%m-%d %H:%M'),
        'location': activity.location,
        'category': activity.category,
        'image_url': activity.image_url,
        'publisher': activity.publisher.username,
        'comments': [{
            'id': comment.id,
            'user': comment.user.username,
            'content': comment.content,
            'time': comment.comment_time.strftime('%Y-%m-%d %H:%M:%S')
        } for comment in comments]
    }), 200

@app.route('/api/activities/<int:id>', methods=['PUT'])
@admin_required
def update_activity(user, id):
    activity = Activity.query.get(id)
    if not activity:
        return jsonify({'message': '活动不存在'}), 404
    
    data = request.get_json()
    activity.title = data.get('title', activity.title)
    activity.description = data.get('description', activity.description)
    activity.time = datetime.datetime.strptime(data.get('time'), '%Y-%m-%dT%H:%M')
    activity.location = data.get('location', activity.location)
    activity.category = data.get('category', activity.category)
    
    db.session.commit()
    return jsonify({'message': '活动更新成功'}), 200

@app.route('/api/activities/<int:id>', methods=['DELETE'])
@admin_required
def delete_activity(user, id):
    activity = Activity.query.get(id)
    if not activity:
        return jsonify({'message': '活动不存在'}), 404
    
    db.session.delete(activity)
    db.session.commit()
    return jsonify({'message': '活动删除成功'}), 200

@app.route('/api/activities/<int:id>/join', methods=['POST'])
@custom_login_required
def join_activity(user, id):
    activity = Activity.query.get(id)
    if not activity:
        return jsonify({'message': '活动不存在'}), 404
    
    # 允许同一用户使用不同参与者信息多次报名，不做重复限制

    data = request.get_json() or {}

    new_join = JoinActivity(
        user_id=user.id,
        activity_id=id,
        participant_name=data.get('name', ''),
        participant_phone=data.get('phone', ''),
        participant_email=data.get('email', ''),
        participant_department=data.get('department', ''),
        participant_student_id=data.get('studentId', ''),
        participant_introduction=data.get('introduction', '')
    )
    db.session.add(new_join)
    
    create_notification(
        user_id=activity.publisher_id,
        type='join',
        message=f'{user.username} 报名了你的活动 "{activity.title}"',
        activity_id=activity.id,
        related_user_id=user.id
    )

    db.session.commit()
    
    return jsonify({'message': '报名成功'}), 200

@app.route('/api/activities/<int:id>/cancel', methods=['POST'])
@custom_login_required
def cancel_join_activity(user, id):
    activity = Activity.query.get(id)
    if not activity:
        return jsonify({'message': '活动不存在'}), 404
    
    join_record = JoinActivity.query.filter_by(user_id=user.id, activity_id=id).first()
    if not join_record:
        return jsonify({'message': '未报名此活动'}), 400
    
    db.session.delete(join_record)
    
    create_notification(
        user_id=activity.publisher_id,
        type='cancel',
        message=f'{user.username} 取消了报名活动 "{activity.title}"',
        activity_id=activity.id,
        related_user_id=user.id
    )

    db.session.commit()
    return jsonify({'message': '取消报名成功'}), 200

@app.route('/api/activities/<int:id>/collect', methods=['POST'])
@custom_login_required
def collect_activity(user, id):
    activity = Activity.query.get(id)
    if not activity:
        return jsonify({'message': '活动不存在'}), 404
    
    if Collection.query.filter_by(user_id=user.id, activity_id=id).first():
        return jsonify({'message': '已经收藏此活动'}), 400
    
    new_collection = Collection(user_id=user.id, activity_id=id)
    db.session.add(new_collection)
    db.session.commit()
    
    return jsonify({'message': '收藏成功'}), 200

@app.route('/api/activities/<int:id>/uncollect', methods=['POST'])
@custom_login_required
def uncollect_activity(user, id):
    collection = Collection.query.filter_by(user_id=user.id, activity_id=id).first()
    if not collection:
        return jsonify({'message': '未收藏此活动'}), 400
    
    db.session.delete(collection)
    db.session.commit()
    return jsonify({'message': '取消收藏成功'}), 200

@app.route('/api/activities/<int:id>/comment', methods=['POST'])
@custom_login_required
def add_comment(user, id):
    activity = Activity.query.get(id)
    if not activity:
        return jsonify({'message': '活动不存在'}), 404
    
    data = request.get_json()
    content = data.get('content')
    if not content:
        return jsonify({'message': '评论内容不能为空'}), 400
    
    new_comment = Comment(user_id=user.id, activity_id=id, content=content)
    db.session.add(new_comment)
    
    create_notification(
        user_id=activity.publisher_id,
        type='comment',
        message=f'{user.username} 评论了你的活动 "{activity.title}": {content[:50]}{"..." if len(content) > 50 else ""}',
        activity_id=activity.id,
        related_user_id=user.id
    )

    db.session.commit()
    
    return jsonify({'message': '评论成功'}), 200

@app.route('/api/user/activities', methods=['GET'])
@custom_login_required
def get_my_activities(user):
    activities = Activity.query.filter_by(publisher_id=user.id).all()
    return jsonify([{
        'id': activity.id,
        'title': activity.title,
        'description': activity.description,
        'time': activity.time.strftime('%Y-%m-%d %H:%M'),
        'location': activity.location,
        'category': activity.category,
        'image_url': activity.image_url,
        'publisher': activity.publisher.username
    } for activity in activities]), 200

@app.route('/api/user/join', methods=['GET'])
@custom_login_required
def get_my_join(user):
    joins = JoinActivity.query.filter_by(user_id=user.id).all()
    activities = [Activity.query.get(join.activity_id) for join in joins if Activity.query.get(join.activity_id)]
    return jsonify([{
        'id': activity.id,
        'title': activity.title,
        'description': activity.description,
        'time': activity.time.strftime('%Y-%m-%d %H:%M'),
        'location': activity.location,
        'category': activity.category,
        'publisher': activity.publisher.username
    } for activity in activities]), 200

@app.route('/api/registrations', methods=['GET'])
@custom_login_required
def get_all_registrations(user):
    my_activities = Activity.query.filter_by(publisher_id=user.id).all()
    my_activity_ids = [a.id for a in my_activities]
    joins = JoinActivity.query.filter(JoinActivity.activity_id.in_(my_activity_ids)).all()
    registrations = []
    for join in joins:
        activity = Activity.query.get(join.activity_id)
        join_user = User.query.get(join.user_id)
        if activity and join_user:
            registrations.append({
                'id': join.id,
                'user_id': join.user_id,
                'username': join_user.username,
                'activity_id': join.activity_id,
                'activity_title': activity.title,
                'join_time': join.join_time.strftime('%Y-%m-%d %H:%M:%S'),
                'participant_name': join.participant_name,
                'participant_phone': join.participant_phone,
                'participant_email': join.participant_email,
                'participant_department': join.participant_department,
                'participant_student_id': join.participant_student_id,
                'participant_introduction': join.participant_introduction
            })
    return jsonify(registrations), 200

@app.route('/api/activities/<int:id>/registrations', methods=['GET'])
@custom_login_required
def get_activity_registrations(user, id):
    activity = Activity.query.get(id)
    if not activity:
        return jsonify({'message': '活动不存在'}), 404
    if activity.publisher_id != user.id:
        return jsonify({'message': '无权限查看此活动的报名记录'}), 403
    joins = JoinActivity.query.filter_by(activity_id=id).all()
    registrations = []
    for join in joins:
        join_user = User.query.get(join.user_id)
        if join_user:
            registrations.append({
                'id': join.id,
                'user_id': join.user_id,
                'username': join_user.username,
                'email': join_user.email,
                'activity_id': join.activity_id,
                'activity_title': activity.title,
                'join_time': join.join_time.strftime('%Y-%m-%d %H:%M:%S'),
                'participant_name': join.participant_name,
                'participant_phone': join.participant_phone,
                'participant_email': join.participant_email,
                'participant_department': join.participant_department,
                'participant_student_id': join.participant_student_id,
                'participant_introduction': join.participant_introduction
            })
    return jsonify(registrations), 200

@app.route('/api/registration/<int:id>', methods=['GET'])
@custom_login_required
def get_registration_detail(user, id):
    join = JoinActivity.query.get(id)
    if not join:
        return jsonify({'message': '报名记录不存在'}), 404

    activity = Activity.query.get(join.activity_id)
    if not activity:
        return jsonify({'message': '活动不存在'}), 404

    join_user = User.query.get(join.user_id)
    if not join_user:
        return jsonify({'message': '用户不存在'}), 404

    return jsonify({
        'id': join.id,
        'user_id': join.user_id,
        'username': join_user.username,
        'email': join_user.email,
        'activity_id': join.activity_id,
        'activity_title': activity.title,
        'join_time': join.join_time.strftime('%Y-%m-%d %H:%M:%S'),
        'participant_name': join.participant_name,
        'participant_phone': join.participant_phone,
        'participant_email': join.participant_email,
        'participant_department': join.participant_department,
        'participant_student_id': join.participant_student_id,
        'participant_introduction': join.participant_introduction
    }), 200

@app.route('/api/registration/<int:id>/status', methods=['PUT'])
@custom_login_required
def update_registration_status(user, id):
    join = JoinActivity.query.get(id)
    if not join:
        return jsonify({'message': '报名记录不存在'}), 404

    activity = Activity.query.get(join.activity_id)
    if not activity:
        return jsonify({'message': '活动不存在'}), 404

    if activity.publisher_id != user.id:
        create_notification(
            user_id=join.user_id,
            type='rejected',
            message=f'你在 "{activity.title}" 中的报名已被拒绝',
            activity_id=activity.id,
            related_user_id=user.id
        )

    db.session.commit()
    return jsonify({'message': '状态更新成功'}), 200

@app.route('/api/user/collection', methods=['GET'])
@custom_login_required
def get_my_collection(user):
    collections = Collection.query.filter_by(user_id=user.id).all()
    activities = [Activity.query.get(collection.activity_id) for collection in collections if Activity.query.get(collection.activity_id)]
    return jsonify([{
        'id': activity.id,
        'title': activity.title,
        'description': activity.description,
        'time': activity.time.strftime('%Y-%m-%d %H:%M'),
        'location': activity.location,
        'category': activity.category,
        'publisher': activity.publisher.username
    } for activity in activities]), 200

@app.route('/api/user/<int:user_id>', methods=['PUT'])
@custom_login_required
def update_user_profile(user, user_id):
    if user_id != user.id:
        return jsonify({'message': '无权限修改他人信息'}), 403
    
    data = request.get_json()
    email = data.get('email')
    current_password = data.get('currentPassword')
    new_password = data.get('newPassword')
    
    if current_password and user.password != current_password:
        return jsonify({'message': '当前密码错误'}), 401
    
    if email:
        existing_user = User.query.filter_by(email=email).first()
        if existing_user and existing_user.id != user_id:
            return jsonify({'message': '邮箱已被使用'}), 400
        user.email = email
    
    if new_password:
        if len(new_password) < 6:
            return jsonify({'message': '新密码长度不能少于6位'}), 400
        user.password = new_password
    
    db.session.commit()
    
    return jsonify({
        'message': '个人信息更新成功',
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role
        }
    }), 200


@app.route('/api/notifications/unread', methods=['GET'])
@custom_login_required
def get_unread_notification_count(user):
    count = Notification.query.filter_by(user_id=user.id, is_read=False).count()
    return jsonify({'count': count}), 200

@app.route('/api/notifications', methods=['GET'])
@custom_login_required
def get_notifications(user):
    page = request.args.get('page', 1, type=int)
    per_page = 20
    pagination = Notification.query.filter_by(user_id=user.id).order_by(Notification.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
    notifications = pagination.items
    return jsonify({
        'notifications': [{
            'id': n.id,
            'type': n.type,
            'message': n.message,
            'activity_id': n.activity_id,
            'is_read': n.is_read,
            'created_at': n.created_at.strftime('%Y-%m-%d %H:%M:%S')
        } for n in notifications],
        'pages': pagination.pages,
        'total': pagination.total
    }), 200

@app.route('/api/notifications/read-all', methods=['POST'])
@custom_login_required
def mark_all_notifications_read(user):
    Notification.query.filter_by(user_id=user.id, is_read=False).update({'is_read': True})
    db.session.commit()
    return jsonify({'message': '已全部标为已读'}), 200

@app.route('/api/notifications/<int:id>/read', methods=['POST'])
@custom_login_required
def mark_notification_read(user, id):
    notification = Notification.query.get(id)
    if not notification:
        return jsonify({'message': '通知不存在'}), 404
    if notification.user_id != user.id:
        return jsonify({'message': '无权限操作此通知'}), 403
    notification.is_read = True
    db.session.commit()
    return jsonify({'message': '已标记为已读'}), 200


@app.route('/api/activities/<int:id>/qrcode', methods=['GET'])
@custom_login_required
def get_activity_qrcode(user, id):
    activity = Activity.query.get(id)
    if not activity:
        return jsonify({'message': '活动不存在'}), 404

    # 只有活动发布者才能生成二维码
    if activity.publisher_id != user.id:
        return jsonify({'message': '只有活动发布者才能生成签到二维码'}), 403

    qr = ActivityQRCode.query.filter_by(activity_id=id).first()
    if not qr:
        token = str(uuid.uuid4())
        qr = ActivityQRCode(activity_id=id, token=token)
        db.session.add(qr)
        db.session.commit()

    # 生成二维码图片
    img = qrcode.make(qr.token)
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    img_base64 = base64.b64encode(buf.getvalue()).decode()

    return jsonify({
        'token': qr.token,
        'qrcode_base64': f'data:image/png;base64,{img_base64}',
        'created_at': qr.created_at.strftime('%Y-%m-%d %H:%M:%S')
    }), 200


@app.route('/api/checkin', methods=['POST'])
@custom_login_required
def checkin(user):
    data = request.get_json()
    token = data.get('token')

    if not token:
        return jsonify({'message': '请提供签到码'}), 400

    qr = ActivityQRCode.query.filter_by(token=token).first()
    if not qr:
        return jsonify({'message': '无效的签到码'}), 400

    activity = Activity.query.get(qr.activity_id)
    if not activity:
        return jsonify({'message': '活动不存在'}), 404

    # 验证用户已报名该活动
    join_record = JoinActivity.query.filter_by(activity_id=qr.activity_id, user_id=user.id).first()
    if not join_record and activity.publisher_id != user.id:
        return jsonify({'message': '您尚未报名此活动，请先报名后再签到'}), 403

    existing = CheckIn.query.filter_by(activity_id=qr.activity_id, user_id=user.id).first()
    if existing:
        return jsonify({'message': '您已签到过了'}), 400

    checkin_record = CheckIn(activity_id=qr.activity_id, user_id=user.id)
    db.session.add(checkin_record)
    db.session.commit()

    return jsonify({
        'message': '签到成功',
        'activity_title': activity.title,
        'checkin_time': checkin_record.checkin_time.strftime('%Y-%m-%d %H:%M:%S')
    }), 200


@app.route('/api/activities/<int:id>/checkins', methods=['GET'])
def get_activity_checkins(id):
    activity = Activity.query.get(id)
    if not activity:
        return jsonify({'message': '活动不存在'}), 404

    checkins = CheckIn.query.filter_by(activity_id=id).order_by(CheckIn.checkin_time.desc()).all()
    return jsonify([{
        'id': c.id,
        'user_id': c.user_id,
        'username': c.user.username,
        'checkin_time': c.checkin_time.strftime('%Y-%m-%d %H:%M:%S')
    } for c in checkins]), 200


@app.route('/api/user/checkins', methods=['GET'])
@custom_login_required
def get_user_checkins(user):
    checkins = CheckIn.query.filter_by(user_id=user.id).order_by(CheckIn.checkin_time.desc()).all()
    return jsonify([{
        'id': c.id,
        'activity_id': c.activity_id,
        'activity_title': c.activity.title,
        'checkin_time': c.checkin_time.strftime('%Y-%m-%d %H:%M:%S')
    } for c in checkins]), 200


@app.route('/api/activities/<int:id>/join-status', methods=['GET'])
@custom_login_required
def get_join_status(user, id):
    """检查当前用户是否已报名某活动"""
    activity = Activity.query.get(id)
    if not activity:
        return jsonify({'message': '活动不存在'}), 404
    join_record = JoinActivity.query.filter_by(activity_id=id, user_id=user.id).first()
    is_publisher = (activity.publisher_id == user.id)
    checkin_record = CheckIn.query.filter_by(activity_id=id, user_id=user.id).first()
    return jsonify({
        'joined': join_record is not None,
        'is_publisher': is_publisher,
        'checked_in': checkin_record is not None
    }), 200


def create_notification(user_id, type, message, activity_id=None, related_user_id=None):
    try:
        notification = Notification(
            user_id=user_id,
            type=type,
            message=message,
            activity_id=activity_id,
            related_user_id=related_user_id
        )
        db.session.add(notification)
        db.session.commit()
        print(f'[通知] 已创建: type={type}, user_id={user_id}, message="{message}"')
    except Exception as e:
        print(f'[通知] 创建失败: {e}')
        db.session.rollback()


# ==================== 管理员 API ====================

@app.route('/api/admin/users', methods=['GET'])
@admin_required
def get_all_users(admin):
    """获取所有用户列表（仅管理员可访问）"""
    users = User.query.all()
    return jsonify([{
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'role': user.role
    } for user in users]), 200

@app.route('/api/admin/users/<int:user_id>/role', methods=['PUT'])
@admin_required
def update_user_role(admin, user_id):
    """更新用户角色（仅管理员可访问）"""
    if admin.id == user_id:
        return jsonify({'message': '不能修改自己的角色'}), 400
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': '用户不存在'}), 404
    
    data = request.get_json()
    new_role = data.get('role')
    
    if new_role not in ['user', 'admin']:
        return jsonify({'message': '无效的角色值'}), 400
    
    user.role = new_role
    db.session.commit()
    
    return jsonify({'message': f'已将 {user.username} 的角色更新为 {new_role}'}), 200

@app.route('/api/admin/activities', methods=['GET'])
@admin_required
def get_all_activities_admin(admin):
    """获取所有活动列表（仅管理员可访问）"""
    activities = Activity.query.all()
    return jsonify([{
        'id': activity.id,
        'title': activity.title,
        'description': activity.description,
        'time': activity.time.strftime('%Y-%m-%d %H:%M'),
        'location': activity.location,
        'category': activity.category,
        'publisher': activity.publisher.username,
        'participants_count': JoinActivity.query.filter_by(activity_id=activity.id).count()
    } for activity in activities]), 200

@app.route('/api/admin/volunteers', methods=['GET'])
@admin_required
def get_all_volunteers(admin):
    """获取所有志愿者列表（仅管理员可访问）"""
    # 获取所有报名过活动的用户
    joins = JoinActivity.query.all()
    volunteer_data = {}
    
    for join in joins:
        user = User.query.get(join.user_id)
        activity = Activity.query.get(join.activity_id)
        if user and activity:
            if user.id not in volunteer_data:
                volunteer_data[user.id] = {
                    'user_id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'activities_count': 0,
                    'activities': []
                }
            volunteer_data[user.id]['activities_count'] += 1
            volunteer_data[user.id]['activities'].append({
                'id': activity.id,
                'title': activity.title,
                'time': activity.time.strftime('%Y-%m-%d %H:%M'),
                'location': activity.location
            })
    
    return jsonify(list(volunteer_data.values())), 200


@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
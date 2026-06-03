from app import app, db
from app import User

with app.app_context():
    # 确保数据库表存在
    db.create_all()
    
    # 检查是否已有admin用户
    admin = User.query.filter_by(username='admin').first()
    
    if admin:
        print("管理员用户已存在，更新角色...")
        admin.role = 'admin'
    else:
        print("创建管理员用户...")
        admin = User(
            username='admin',
            password='admin123',
            email='admin@example.com',
            role='admin'
        )
        db.session.add(admin)
    
    db.session.commit()
    print("管理员账户设置成功！")
    print(f"用户名: {admin.username}")
    print(f"密码: admin123")
    print(f"角色: {admin.role}")
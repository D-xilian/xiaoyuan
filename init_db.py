from app import app, db
from app import User, Activity

with app.app_context():
    print("正在创建数据库...")
    db.create_all()
    print("数据库表创建成功！")
    
    # 检查是否已有admin用户
    admin = User.query.filter_by(username='admin').first()
    if not admin:
        print("创建管理员用户...")
        admin = User(
            username='admin',
            password='admin123',
            email='admin@example.com',
            role='admin'
        )
        db.session.add(admin)
        db.session.commit()
        print("管理员用户创建成功！")
    else:
        print("管理员用户已存在")
    
    print("\n数据库初始化完成！")
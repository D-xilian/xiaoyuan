from app import app, db

with app.app_context():
    print("正在更新数据库结构...")
    
    try:
        # 添加 role 列到 user 表
        db.session.execute(db.text('ALTER TABLE user ADD COLUMN role VARCHAR(20) DEFAULT "user"'))
        db.session.commit()
        print("数据库更新成功！已添加 role 列")
    except Exception as e:
        print(f"数据库更新失败: {e}")
        print("可能该列已存在，请忽略此错误")
    
    # 验证更新是否成功
    try:
        from app import User
        users = User.query.all()
        print(f"当前数据库中有 {len(users)} 个用户")
        for user in users:
            print(f"用户: {user.username}, 邮箱: {user.email}, 角色: {user.role}")
    except Exception as e:
        print(f"验证失败: {e}")
from app import app, db

with app.app_context():
    print("正在更新数据库结构...")
    
    try:
        # 添加 category 列到 activity 表
        db.session.execute(db.text('ALTER TABLE activity ADD COLUMN category VARCHAR(50) DEFAULT "other"'))
        db.session.commit()
        print("已添加 category 列")
    except Exception as e:
        print(f"添加 category 列失败: {e}")
        print("可能该列已存在，请忽略此错误")
    
    try:
        # 添加 role 列到 user 表
        db.session.execute(db.text('ALTER TABLE user ADD COLUMN role VARCHAR(20) DEFAULT "user"'))
        db.session.commit()
        print("已添加 role 列")
    except Exception as e:
        print(f"添加 role 列失败: {e}")
        print("可能该列已存在，请忽略此错误")
    
    print("\n数据库更新完成！")
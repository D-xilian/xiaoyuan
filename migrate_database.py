from app import app, db

with app.app_context():
    print("正在更新数据库结构...")
    
    try:
        db.session.execute(db.text('ALTER TABLE activity ADD COLUMN category VARCHAR(50) DEFAULT "other"'))
        db.session.commit()
        print("数据库更新成功！已添加 category 列")
    except Exception as e:
        print(f"数据库更新失败: {e}")
        print("可能该列已存在，请忽略此错误")
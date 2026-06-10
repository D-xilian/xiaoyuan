from app import app, db

with app.app_context():
    print("正在创建志愿者报名表...")
    db.create_all()
    print("数据库表创建/更新成功！")

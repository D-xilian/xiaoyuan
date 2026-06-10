"""
数据库迁移脚本：为VolunteerRegistration表添加activity_id字段
"""
from app import app, db
from sqlalchemy import text

with app.app_context():
    try:
        # 检查activity_id列是否已存在
        result = db.session.execute(text("PRAGMA table_info(volunteer_registration)"))
        columns = [row[1] for row in result.fetchall()]
        
        if 'activity_id' not in columns:
            print("正在添加activity_id列...")
            # 添加activity_id列
            db.session.execute(text("ALTER TABLE volunteer_registration ADD COLUMN activity_id INTEGER"))
            db.session.commit()
            print("activity_id列添加成功！")
        else:
            print("activity_id列已存在，跳过迁移")
        
        # 删除不再需要的列（SQLite不支持DROP COLUMN，所以保留这些列但不使用）
        print("数据库迁移完成！")
        
    except Exception as e:
        print(f"迁移出错: {e}")
        db.session.rollback()

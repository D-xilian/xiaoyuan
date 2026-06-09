from app import app, db

with app.app_context():
    print("正在更新 join_activity 表结构...")
    
    columns_to_add = [
        'participant_name VARCHAR(100)',
        'participant_phone VARCHAR(20)',
        'participant_email VARCHAR(100)',
        'participant_department VARCHAR(100)',
        'participant_student_id VARCHAR(50)',
        'participant_introduction TEXT'
    ]
    
    for column in columns_to_add:
        try:
            db.session.execute(db.text(f'ALTER TABLE join_activity ADD COLUMN {column}'))
            db.session.commit()
            print(f"已添加列: {column}")
        except Exception as e:
            print(f"添加列失败 {column}: {e}")
            print("可能该列已存在，请忽略此错误")
    
    print("\n数据库更新完成！")
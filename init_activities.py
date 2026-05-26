from app import app, db, Activity, User
import datetime

with app.app_context():
    print("检查数据库中的活动...")
    activities = Activity.query.all()
    print(f"当前活动数量: {len(activities)}")
    
    if len(activities) == 0:
        print("数据库中没有活动，正在创建示例活动...")
        
        users = User.query.all()
        if len(users) == 0:
            print("没有用户，请先注册用户")
        else:
            user = users[0]
            
            sample_activities = [
                Activity(
                    title='新生见面会',
                    description='欢迎新生加入我们的大家庭，这里有精彩的表演和丰富的互动环节。',
                    time=datetime.datetime(2026, 9, 1, 14, 0),
                    location='大礼堂',
                    publisher_id=user.id
                ),
                Activity(
                    title='校园音乐节',
                    description='一年一度的校园音乐节，邀请知名乐队和校园歌手共同演出。',
                    time=datetime.datetime(2026, 9, 15, 19, 0),
                    location='体育场',
                    publisher_id=user.id
                ),
                Activity(
                    title='科技创新大赛',
                    description='展示学生科技创新成果，激发创新思维，培养实践能力。',
                    time=datetime.datetime(2026, 10, 1, 9, 0),
                    location='科技楼报告厅',
                    publisher_id=user.id
                ),
                Activity(
                    title='篮球友谊赛',
                    description='院系之间的篮球友谊赛，增进友谊，强身健体。',
                    time=datetime.datetime(2026, 9, 20, 15, 0),
                    location='体育馆',
                    publisher_id=user.id
                )
            ]
            
            for activity in sample_activities:
                db.session.add(activity)
            
            db.session.commit()
            print(f"已创建 {len(sample_activities)} 个示例活动")
    else:
        print("现有活动列表:")
        for activity in activities:
            print(f"  - ID: {activity.id}, 标题: {activity.title}, 时间: {activity.time}, 地点: {activity.location}")
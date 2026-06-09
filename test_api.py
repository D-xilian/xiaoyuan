from app import app, db
from app import User, Activity, JoinActivity
from datetime import datetime

with app.app_context():
    try:
        # 测试获取所有活动
        print("测试获取所有活动...")
        activities = Activity.query.all()
        print(f"活动数量: {len(activities)}")
        
        # 测试获取所有报名
        print("\n测试获取所有报名...")
        joins = JoinActivity.query.all()
        print(f"报名数量: {len(joins)}")
        
        # 测试获取用户
        print("\n测试获取用户...")
        users = User.query.all()
        print(f"用户数量: {len(users)}")
        
        # 测试志愿者数据
        print("\n测试志愿者数据...")
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
        print(f"志愿者数量: {len(volunteer_data)}")
        
        print("\n✅ 所有测试通过!")
        
    except Exception as e:
        print(f"\n❌ 错误: {e}")
        import traceback
        traceback.print_exc()
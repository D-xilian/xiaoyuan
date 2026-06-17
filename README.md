# 校园活动发布平台

## 项目结构

```
校园活动/
├── src/                  # 前端Vue代码
│   ├── views/            # 页面组件
│   │   ├── Home.vue      # 首页
│   │   ├── Login.vue     # 登录页面
│   │   ├── Register.vue  # 注册页面
│   │   ├── Profile.vue   # 个人中心
│   │   ├── CreateActivity.vue  # 创建活动
│   │   ├── ActivityDetail.vue  # 活动详情
│   │   ├── EditActivity.vue    # 编辑活动
│   │   ├── MyActivities.vue    # 我发布的活动
│   │   ├── MyJoin.vue          # 我报名的活动
│   │   └── MyCollection.vue    # 我的收藏
│   ├── router/           # 路由配置
│   │   └── index.js
│   ├── App.vue           # 根组件
│   └── main.js           # 入口文件
├── app.py                # 后端Flask应用
├── requirements.txt      # 后端依赖
├── package.json          # 前端依赖
├── vite.config.js        # Vite配置
└── index.html            # 前端入口HTML
```

## 运行项目

### 前端

1. 安装依赖：
   ```bash
   npm install
   ```

2. 启动开发服务器：
   ```bash
   npm run dev
   ```

### 后端

1. 安装依赖：
   ```bash
   pip install -r requirements.txt
   ```

2. 启动Flask服务器：
   ```bash
   python app.py
   ```

## 功能模块

1. **用户管理**：登录、注册、个人信息管理
2. **活动管理**：发布活动、编辑活动、删除活动
3. **活动报名**：用户报名活动、查看报名信息
4. **评论互动**：用户评论活动
5. **收藏模块**：收藏感兴趣的活动

## 技术栈

- 前端：Vue 3 + Vue Router
- 后端：Flask + SQLAlchemy
- 数据库：SQLite
#npm run test:ui
<template>
  <div class="home">
    <header class="header">
      <h1>校园活动发布平台</h1>
      <nav>
        <router-link to="/">首页</router-link>
        <router-link to="/activity/create" v-if="isLoggedIn">创建活动</router-link>
        <router-link to="/my-activities" v-if="isLoggedIn">我发布的活动</router-link>
        <router-link to="/activity/register" v-if="isLoggedIn">报名活动</router-link>
        <router-link to="/registration/list" v-if="isLoggedIn">报名列表</router-link>
        <router-link to="/login" v-if="!isLoggedIn">登录</router-link>
        <router-link to="/register" v-if="!isLoggedIn">注册</router-link>
        <router-link to="/profile" v-if="isLoggedIn">个人中心</router-link>
        <a v-if="isLoggedIn" @click="logout" class="logout-link">退出登录</a>
      </nav>
    </header>
    
    <main class="main">
      <!-- 活动列表 -->
      <div class="activities-section">
        <h2>所有活动</h2>
        <div v-if="loading" class="loading">加载中...</div>
        <div v-else-if="error" class="error">{{ error }}</div>
        <div v-else class="activity-list">
          <div class="activity-item" v-for="activity in activities" :key="activity.id">
            <div v-if="activity.image_url" class="activity-image">
              <img :src="activity.image_url" alt="活动图片">
            </div>
            <h3>{{ activity.title }}</h3>
            <p><strong>时间:</strong> {{ activity.time }}</p>
            <p><strong>地点:</strong> {{ activity.location }}</p>
            <p><strong>描述:</strong> {{ truncateContent(activity.description) }}</p>
            <p><strong>主办方:</strong> {{ activity.publisher }}</p>
            <div class="activity-actions">
              <router-link :to="`/activity/${activity.id}`" class="btn btn-detail">查看详情</router-link>
              <router-link :to="`/activity/register/${activity.id}`" class="btn btn-join" v-if="isLoggedIn">报名参加</router-link>
            </div>
          </div>
        </div>
        <div v-if="!loading && activities.length === 0" class="no-data">
          暂无活动
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { apiGet, isLoggedIn } from '../utils/api'

export default {
  data() {
    return {
      isLoggedIn: false,
      activities: [],
      loading: false,
      error: ''
    }
  },
  mounted() {
    this.checkLoginStatus()
    this.loadActivities()
  },
  methods: {
    checkLoginStatus() {
      this.isLoggedIn = isLoggedIn()
    },
    async loadActivities() {
      this.loading = true
      this.error = ''
      
      try {
        const response = await apiGet('/activities')
        if (!response.ok) {
          throw new Error('获取活动列表失败')
        }
        const data = await response.json()
        this.activities = data
      } catch (err) {
        this.error = '加载活动失败'
        this.activities = []
      } finally {
        this.loading = false
      }
    },
    truncateContent(content) {
      return content.length > 100 ? content.substring(0, 100) + '...' : content
    },
    logout() {
      localStorage.removeItem('user')
      this.isLoggedIn = false
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.header {
  background-color: #4CAF50;
  color: white;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h1 {
  font-size: 24px;
}

nav a {
  color: white;
  text-decoration: none;
  margin-left: 20px;
}

.main {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 活动列表部分样式 */
.activities-section {
  margin-top: 30px;
}

.activities-section h2 {
  margin-bottom: 20px;
  color: #333;
}

.activity-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.activity-item {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.activity-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.activity-image {
  margin-bottom: 15px;
  text-align: center;
}

.activity-image img {
  max-width: 100%;
  max-height: 200px;
  border-radius: 4px;
  object-fit: contain;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.activity-item h3 {
  margin-bottom: 15px;
  color: #333;
  font-size: 18px;
}

.activity-item p {
  margin-bottom: 10px;
  color: #666;
  font-size: 14px;
  line-height: 1.6;
}

.activity-actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  text-decoration: none;
  display: inline-block;
  text-align: center;
  transition: background-color 0.3s;
}

.btn-detail {
  background-color: #2196F3;
  color: white;
}

.btn-detail:hover {
  background-color: #0b7dda;
}

.btn-join {
  background-color: #4CAF50;
  color: white;
}

.btn-join:hover {
  background-color: #45a049;
}

.logout-link {
  color: white;
  text-decoration: none;
  margin-left: 20px;
  cursor: pointer;
}

.logout-link:hover {
  text-decoration: underline;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

.error {
  text-align: center;
  padding: 40px;
  color: #f44336;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #999;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  nav {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
  
  nav a {
    margin-left: 0;
  }
  
  .main {
    padding: 10px;
  }
  
  .activity-list {
    grid-template-columns: 1fr;
  }
}
</style>
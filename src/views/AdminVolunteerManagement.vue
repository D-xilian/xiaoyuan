<template>
  <div class="admin-volunteers">
    <header class="header">
      <h1>校园活动发布平台</h1>
      <nav>
        <router-link to="/">首页</router-link>
        
        <!-- 管理员菜单 -->
        <router-link to="/admin/users" v-if="isLoggedIn && isAdmin">用户管理</router-link>
        <router-link to="/admin/volunteers" v-if="isLoggedIn && isAdmin">志愿者管理</router-link>
        <router-link to="/activity/create" v-if="isLoggedIn && isAdmin">创建活动</router-link>
        <router-link to="/admin/activities" v-if="isLoggedIn && isAdmin">管理活动</router-link>
        <router-link to="/registration/list" v-if="isLoggedIn && isAdmin">查看报名</router-link>
        
        <!-- 普通用户菜单 -->
        <router-link to="/activity/register" v-if="isLoggedIn && !isAdmin">报名活动</router-link>
        <router-link to="/volunteer/recruitment" v-if="isLoggedIn && !isAdmin">志愿者招募</router-link>
        <router-link to="/my-join" v-if="isLoggedIn && !isAdmin">我的报名</router-link>
        
        <!-- 通用菜单 -->
        <router-link to="/login" v-if="!isLoggedIn">登录</router-link>
        <router-link to="/register" v-if="!isLoggedIn">注册</router-link>
        <router-link to="/profile" v-if="isLoggedIn">个人中心</router-link>
        <a v-if="isLoggedIn" @click="logout" class="logout-link">退出登录</a>
      </nav>
    </header>

    <main class="main">
      <div class="page-header">
        <h2>志愿者管理</h2>
        <button @click="loadVolunteers" class="refresh-btn">刷新列表</button>
      </div>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>加载中...</p>
      </div>

      <div v-else-if="error" class="error">{{ error }}</div>

      <div v-else class="volunteers-list">
        <div v-if="volunteers.length === 0" class="no-data">
          暂无志愿者数据
        </div>
        
        <div v-else class="volunteer-cards">
          <div v-for="volunteer in volunteers" :key="volunteer.user_id" class="volunteer-card">
            <div class="volunteer-header">
              <div class="avatar">
                {{ volunteer.username?.charAt(0) || '?' }}
              </div>
              <div class="volunteer-info">
                <h3>{{ volunteer.username }}</h3>
                <p class="email">{{ volunteer.email }}</p>
              </div>
              <div class="stats">
                <span class="stat-number">{{ volunteer.activities_count }}</span>
                <span class="stat-label">参与活动</span>
              </div>
            </div>
            
            <div class="activities-section">
              <h4>参与的活动</h4>
              <div class="activities-list">
                <div v-for="activity in volunteer.activities" :key="activity.id" class="activity-item">
                  <div class="activity-info">
                    <span class="activity-title">{{ activity.title }}</span>
                    <span class="activity-meta">
                      📅 {{ activity.time }} | 📍 {{ activity.location }}
                    </span>
                  </div>
                  <router-link :to="`/activity/${activity.id}`" class="view-btn">
                    查看详情
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { apiGet, isAdmin, isLoggedIn } from '../utils/api'

export default {
  name: 'AdminVolunteerManagement',
  data() {
    return {
      volunteers: [],
      loading: false,
      error: ''
    }
  },
  computed: {
    isLoggedIn() {
      return isLoggedIn()
    },
    isAdmin() {
      return isAdmin()
    }
  },
  mounted() {
    if (!isAdmin()) {
      alert('无权限访问此页面')
      this.$router.push('/')
      return
    }
    this.loadVolunteers()
  },
  methods: {
    async loadVolunteers() {
      this.loading = true
      this.error = ''
      
      try {
        const response = await apiGet('/admin/volunteers')
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.message || '获取志愿者列表失败')
        }
        const data = await response.json()
        this.volunteers = data
      } catch (err) {
        this.error = err.message || '加载志愿者列表失败'
      } finally {
        this.loading = false
      }
    },
    
    logout() {
      localStorage.removeItem('user')
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.admin-volunteers {
  min-height: 100vh;
  background-color: #f5f5f5;
}

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

.logout-link {
  color: white;
  text-decoration: none;
  margin-left: 20px;
  cursor: pointer;
}

.main {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-header h2 {
  color: #333;
  margin: 0;
}

.refresh-btn {
  padding: 10px 20px;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.refresh-btn:hover {
  background-color: #0b7dda;
}

.loading {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top-color: #4CAF50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error {
  text-align: center;
  padding: 40px;
  background-color: #f8d7da;
  color: #721c24;
  border-radius: 8px;
  margin-bottom: 20px;
}

.volunteer-cards {
  display: grid;
  gap: 20px;
}

.volunteer-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: box-shadow 0.3s;
}

.volunteer-card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.volunteer-header {
  display: flex;
  align-items: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  margin-right: 20px;
}

.volunteer-info {
  flex: 1;
}

.volunteer-info h3 {
  margin: 0 0 5px 0;
  color: #333;
  font-size: 18px;
}

.email {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.stats {
  text-align: center;
  padding: 15px 20px;
  background-color: #e8f5e9;
  border-radius: 8px;
}

.stat-number {
  display: block;
  font-size: 28px;
  font-weight: bold;
  color: #4CAF50;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.activities-section {
  padding: 20px;
}

.activities-section h4 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 16px;
}

.activities-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.activity-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background-color: #f8f9fa;
  border-radius: 6px;
  transition: background-color 0.3s;
}

.activity-item:hover {
  background-color: #e9ecef;
}

.activity-info {
  flex: 1;
}

.activity-title {
  display: block;
  color: #333;
  font-weight: 500;
  margin-bottom: 4px;
}

.activity-meta {
  display: block;
  font-size: 12px;
  color: #666;
}

.view-btn {
  padding: 6px 12px;
  background-color: #2196F3;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 12px;
  transition: background-color 0.3s;
}

.view-btn:hover {
  background-color: #0b7dda;
}

.no-data {
  text-align: center;
  padding: 60px 20px;
  background-color: white;
  border-radius: 8px;
  color: #999;
}

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
  
  nav a, .logout-link {
    margin-left: 0;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .volunteer-header {
    flex-direction: column;
    text-align: center;
  }
  
  .avatar {
    margin-right: 0;
    margin-bottom: 15px;
  }
  
  .stats {
    margin-top: 15px;
  }
  
  .activity-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .view-btn {
    width: 100%;
    text-align: center;
  }
}
</style>

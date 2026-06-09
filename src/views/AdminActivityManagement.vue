<template>
  <div class="admin-activities">
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
        <h2>活动管理</h2>
        <button @click="loadActivities" class="refresh-btn">刷新列表</button>
      </div>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>加载中...</p>
      </div>

      <div v-else-if="error" class="error">{{ error }}</div>

      <div v-else class="activities-list">
        <div v-if="activities.length === 0" class="no-data">
          暂无活动数据
        </div>
        
        <div v-else class="activity-cards">
          <div v-for="activity in activities" :key="activity.id" class="activity-card">
            <div class="card-header">
              <h3>{{ activity.title }}</h3>
              <span class="category-badge">{{ activity.category }}</span>
            </div>
            
            <div class="card-content">
              <p class="description">{{ truncateText(activity.description, 150) }}</p>
              
              <div class="meta-info">
                <div class="meta-item">
                  <span class="label">时间:</span>
                  <span class="value">{{ activity.time }}</span>
                </div>
                <div class="meta-item">
                  <span class="label">地点:</span>
                  <span class="value">{{ activity.location }}</span>
                </div>
                <div class="meta-item">
                  <span class="label">主办方:</span>
                  <span class="value">{{ activity.publisher }}</span>
                </div>
                <div class="meta-item">
                  <span class="label">报名人数:</span>
                  <span class="value highlight">{{ activity.participants_count }}人</span>
                </div>
              </div>
            </div>
            
            <div class="card-actions">
              <router-link :to="`/activity/${activity.id}`" class="action-btn view-btn">
                查看详情
              </router-link>
              <router-link :to="`/activity/${activity.id}/edit`" class="action-btn edit-btn">
                编辑活动
              </router-link>
              <router-link :to="`/activity/${activity.id}/registrations`" class="action-btn participants-btn">
                查看报名者
              </router-link>
              <button @click="deleteActivity(activity.id)" class="action-btn delete-btn">
                删除活动
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { apiGet, apiDelete, isAdmin, isLoggedIn } from '../utils/api'

export default {
  name: 'AdminActivityManagement',
  data() {
    return {
      activities: [],
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
    this.loadActivities()
  },
  methods: {
    async loadActivities() {
      this.loading = true
      this.error = ''
      
      try {
        const response = await apiGet('/admin/activities')
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.message || '获取活动列表失败')
        }
        const data = await response.json()
        this.activities = data
      } catch (err) {
        this.error = err.message || '加载活动列表失败'
      } finally {
        this.loading = false
      }
    },
    
    async deleteActivity(activityId) {
      if (!confirm('确定要删除这个活动吗？此操作不可恢复！')) return
      
      try {
        const response = await apiDelete(`/activities/${activityId}`)
        const data = await response.json()
        
        if (response.ok) {
          alert(data.message || '删除成功')
          this.loadActivities()
        } else {
          alert(data.message || '删除失败')
        }
      } catch (err) {
        alert('网络错误，请稍后重试')
      }
    },
    
    truncateText(text, maxLength) {
      if (!text) return ''
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
    },
    
    logout() {
      localStorage.removeItem('user')
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.admin-activities {
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

.activity-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.activity-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: box-shadow 0.3s;
}

.activity-card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.card-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
  flex: 1;
}

.category-badge {
  padding: 4px 12px;
  background-color: #e3f2fd;
  color: #1976d2;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.card-content {
  padding: 20px;
}

.description {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
  margin: 0 0 15px 0;
}

.meta-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.meta-item {
  display: flex;
  font-size: 14px;
}

.label {
  color: #666;
  min-width: 70px;
}

.value {
  color: #333;
}

.value.highlight {
  color: #4CAF50;
  font-weight: 600;
}

.card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 15px 20px;
  background-color: #fafafa;
  border-top: 1px solid #dee2e6;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  text-decoration: none;
  transition: background-color 0.3s;
}

.view-btn {
  background-color: #2196F3;
  color: white;
}

.view-btn:hover {
  background-color: #0b7dda;
}

.edit-btn {
  background-color: #ff9800;
  color: white;
}

.edit-btn:hover {
  background-color: #f57c00;
}

.participants-btn {
  background-color: #9c27b0;
  color: white;
}

.participants-btn:hover {
  background-color: #7b1fa2;
}

.delete-btn {
  background-color: #f44336;
  color: white;
}

.delete-btn:hover {
  background-color: #d32f2f;
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
  
  .activity-cards {
    grid-template-columns: 1fr;
  }
  
  .card-actions {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
    text-align: center;
  }
}
</style>

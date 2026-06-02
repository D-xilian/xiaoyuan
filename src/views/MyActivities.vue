<template>
  <div class="my-activities-page">
    <header class="header">
      <h1>校园活动发布平台</h1>
      <nav>
        <router-link to="/">首页</router-link>
        <router-link to="/activity/register">报名活动</router-link>
        <router-link to="/registration/list">报名列表</router-link>
        <notification-bell v-if="isLoggedIn" />
        <router-link to="/profile">个人中心</router-link>
        <a @click="logout" class="logout-link">退出登录</a>
      </nav>
    </header>
    
    <main class="main">
      <div class="my-activities">
        <div class="header">
          <h2>我发布的活动</h2>
          <div class="search-box">
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="搜索活动名称、地点或内容..." 
              class="search-input"
              @input="handleSearch"
            >
            <span v-if="searchQuery" class="search-count">找到 {{ filteredActivities.length }} 个活动</span>
          </div>
        </div>
        
        <div v-if="loading" class="loading">加载中...</div>
        <div v-else-if="error" class="error">{{ error }}</div>
        <div v-else-if="!isLoggedIn" class="not-logged-in">
          <p>请先登录查看您发布的活动</p>
          <router-link to="/login" class="btn">去登录</router-link>
        </div>
        <div v-else-if="filteredActivities.length === 0" class="no-data">
          {{ searchQuery ? '未找到匹配的活动' : '您还没有发布任何活动' }}
        </div>
        <div v-else class="activity-list">
          <div class="activity-item" v-for="activity in filteredActivities" :key="activity.id">
            <h3>{{ activity.title }}</h3>
            <p><strong>描述:</strong> {{ activity.description }}</p>
            <p><strong>时间:</strong> {{ activity.time }}</p>
            <p><strong>地点:</strong> {{ activity.location }}</p>
            <p><strong>主办方:</strong> {{ activity.publisher }}</p>
            <div class="activity-actions">
              <router-link :to="`/activity/${activity.id}`" class="btn">查看详情</router-link>
              <router-link :to="`/activity/${activity.id}/edit`" class="btn edit-btn">编辑</router-link>
              <button class="btn delete-btn" @click="confirmDelete(activity.id)">删除</button>
            </div>
          </div>
        </div>
        
        <!-- 删除确认对话框 -->
        <div v-if="showDeleteConfirm" class="modal-overlay">
          <div class="modal-content">
            <h3>确认删除</h3>
            <p>确定要删除这个活动吗？此操作无法撤销。</p>
            <div class="modal-actions">
              <button class="btn btn-cancel" @click="cancelDelete">取消</button>
              <button class="btn btn-confirm-delete" @click="confirmDeleteAction">确认删除</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { apiGet, apiDelete, isLoggedIn, getCurrentUser } from '../utils/api'
import NotificationBell from '../components/NotificationBell.vue'

export default {
  components: {
    NotificationBell
  },
  data() {
    return {
      activities: [],
      loading: false,
      error: '',
      searchQuery: '',
      isLoggedIn: false,
      currentUser: null,
      showDeleteConfirm: false,
      activityToDelete: null
    }
  },
  computed: {
    filteredActivities() {
      if (!this.searchQuery.trim()) {
        return this.activities
      }
      
      const query = this.searchQuery.toLowerCase()
      return this.activities.filter(activity => {
        return activity.title.toLowerCase().includes(query) ||
               activity.location.toLowerCase().includes(query) ||
               activity.description.toLowerCase().includes(query) ||
               activity.publisher.toLowerCase().includes(query)
      })
    }
  },
  mounted() {
    this.checkLoginStatus()
    this.loadActivities()
  },
  methods: {
    checkLoginStatus() {
      this.isLoggedIn = isLoggedIn()
      this.currentUser = getCurrentUser()
    },
    async loadActivities() {
      this.loading = true
      this.error = ''
      
      try {
        const response = await apiGet('/user/activities')
        if (!response.ok) {
          if (response.status === 401) {
            this.error = '请先登录'
            this.$router.push('/login')
            return
          }
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
    handleSearch() {
    },
    confirmDelete(activityId) {
      this.activityToDelete = activityId
      this.showDeleteConfirm = true
    },
    async confirmDeleteAction() {
      if (this.activityToDelete) {
        try {
          const response = await apiDelete(`/activities/${this.activityToDelete}`)
          
          if (!response.ok) {
            const data = await response.json()
            throw new Error(data.message || '删除失败')
          }
          
          this.activities = this.activities.filter(
            activity => activity.id !== this.activityToDelete
          )
          
          this.activityToDelete = null
          this.showDeleteConfirm = false
          alert('删除成功')
        } catch (error) {
          console.error('删除活动失败:', error)
          alert(error.message || '删除失败，请稍后重试')
        }
      }
    },
    cancelDelete() {
      this.activityToDelete = null
      this.showDeleteConfirm = false
    },
    logout() {
      localStorage.removeItem('user')
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.my-activities-page {
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
}

.my-activities {
  max-width: 1000px;
  margin: 50px auto;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.my-activities .header {
  background-color: transparent;
  color: #333;
  padding: 0;
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.my-activities .header h2 {
  margin: 0;
  color: #333;
}

.search-box {
  flex: 1;
  max-width: 500px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-input {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 14px;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.search-count {
  color: #666;
  font-size: 14px;
  white-space: nowrap;
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

.not-logged-in {
  text-align: center;
  padding: 40px;
}

.not-logged-in p {
  font-size: 18px;
  color: #666;
  margin-bottom: 20px;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #999;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.activity-item {
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  transition: box-shadow 0.3s, transform 0.3s;
}

.activity-item:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

.activity-item h3 {
  margin-bottom: 15px;
  color: #333;
  font-size: 20px;
}

.activity-item p {
  margin-bottom: 10px;
  color: #666;
  font-size: 14px;
  line-height: 1.6;
}

.activity-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
  flex-wrap: wrap;
}

.btn {
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  font-size: 14px;
  transition: background-color 0.3s;
}

.btn:hover {
  background-color: #45a049;
}

.edit-btn {
  background-color: #2196F3;
}

.edit-btn:hover {
  background-color: #0b7dda;
}

.delete-btn {
  background-color: #f44336;
}

.delete-btn:hover {
  background-color: #d32f2f;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-content h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 20px;
}

.modal-content p {
  margin: 0 0 20px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn-cancel {
  background-color: #9e9e9e;
  padding: 10px 20px;
  font-size: 14px;
  width: auto;
}

.btn-cancel:hover {
  background-color: #757575;
}

.btn-confirm-delete {
  background-color: #f44336;
  padding: 10px 20px;
  font-size: 14px;
  width: auto;
}

.btn-confirm-delete:hover {
  background-color: #d32f2f;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .my-activities {
    margin: 20px auto;
    padding: 15px;
  }
  
  .header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .search-box {
    max-width: 100%;
    width: 100%;
  }
  
  .activity-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>
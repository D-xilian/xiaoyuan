<template>
  <div class="profile-page">
    <header class="header">
      <h1>校园活动发布平台</h1>
      <nav>
        <router-link to="/">首页</router-link>
        <router-link to="/activity/register">报名活动</router-link>
        <router-link to="/registration/list">报名管理</router-link>
        <notification-bell v-if="isLoggedIn" />
        <a @click="logout" class="logout-link">退出登录</a>
      </nav>
    </header>
    
    <main class="main">
      <div v-if="!user" class="not-logged-in">
        <p>请先登录</p>
        <router-link to="/login" class="btn">去登录</router-link>
      </div>
      
      <div v-else class="profile-container">
        <!-- 个人信息区域 -->
        <div class="profile-info">
          <div class="avatar-section">
            <div class="avatar">
              <span>{{ user.username?.charAt(0) || '?' }}</span>
            </div>
            <h2>{{ user.username }}</h2>
            <p class="user-email">{{ user.email }}</p>
          </div>
          <div class="info-stats">
            <div class="stat-item">
              <span class="stat-value">{{ myActivities.length }}</span>
              <span class="stat-label">发布活动</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ myRegistrations.length }}</span>
              <span class="stat-label">报名活动</span>
            </div>
          </div>
          <button @click="showEditModal = true" class="edit-btn">修改个人信息</button>
        </div>
        
        <!-- 活动列表区域 -->
        <div class="activities-section">
          <!-- 我发布的活动 -->
          <div class="activity-tab">
            <div class="tab-header">
              <h3>📋 我发布的活动</h3>
              <div class="tab-actions">
                <button 
                  class="tab-btn" 
                  :class="{ active: activeTab === 'published' }"
                  @click="activeTab = 'published'"
                >
                  我发布的 ({{ myActivities.length }})
                </button>
                <button 
                  class="tab-btn" 
                  :class="{ active: activeTab === 'registered' }"
                  @click="activeTab = 'registered'"
                >
                  我报名的 ({{ myRegistrations.length }})
                </button>
              </div>
            </div>
            
            <!-- 搜索和筛选 -->
            <div v-show="activeTab === 'published'" class="search-filter">
              <div class="search-box">
                <input 
                  type="text" 
                  v-model="publishedSearch" 
                  placeholder="搜索活动名称..."
                  class="search-input"
                >
                <button class="search-btn" @click="handlePublishedSearch">
                  🔍
                </button>
              </div>
              <select v-model="publishedStatusFilter" class="filter-select">
                <option value="">全部状态</option>
                <option value="upcoming">即将开始</option>
                <option value="ongoing">进行中</option>
                <option value="ended">已结束</option>
              </select>
            </div>
            
            <!-- 我发布的活动列表 -->
            <div v-show="activeTab === 'published'" class="activity-list-container">
              <div v-if="isLoading" class="loading">
                <div class="spinner"></div>
                <p>加载中...</p>
              </div>
              <div v-else-if="filteredPublishedActivities.length === 0" class="empty-state">
                <span class="empty-icon">📭</span>
                <p>暂无发布的活动</p>
              </div>
              <div v-else class="activity-list">
                <div 
                  v-for="activity in paginatedPublishedActivities" 
                  :key="activity.id" 
                  class="activity-card"
                >
                  <div class="card-header">
                    <h4>{{ activity.name || activity.title }}</h4>
                    <span :class="['status-badge', getActivityStatus(activity)]">
                      {{ getActivityStatusText(activity) }}
                    </span>
                  </div>
                  <div class="card-content">
                    <p class="description">{{ truncateText(activity.content || activity.description, 100) }}</p>
                    <div class="meta-info">
                      <span class="meta-item">📅 {{ activity.date || activity.time }}</span>
                      <span class="meta-item">📍 {{ activity.location }}</span>
                      <span class="meta-item">👥 {{ getActivityParticipants(activity.id) }}人参与</span>
                      <span class="meta-item">📝 {{ activity.organizer || '未知' }}</span>
                    </div>
                  </div>
                  <div class="card-footer">
                    <span class="publish-time">发布于 {{ formatDate(activity.createdAt) }}</span>
                    <div class="card-actions">
                      <router-link :to="`/activity/${activity.id}`" class="action-btn view-btn">查看</router-link>
                      <router-link :to="`/activity/${activity.id}/edit`" class="action-btn edit-btn">编辑</router-link>
                      <button class="action-btn delete-btn" @click="deleteActivity(activity.id)">删除</button>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 分页 -->
              <div v-if="publishedTotalPages > 1" class="pagination">
                <button 
                  class="pagination-btn" 
                  :disabled="publishedCurrentPage === 1"
                  @click="publishedCurrentPage--"
                >
                  ←
                </button>
                <span>第 {{ publishedCurrentPage }} / {{ publishedTotalPages }} 页</span>
                <button 
                  class="pagination-btn" 
                  :disabled="publishedCurrentPage === publishedTotalPages"
                  @click="publishedCurrentPage++"
                >
                  →
                </button>
              </div>
            </div>
            
            <!-- 我报名的活动搜索和筛选 -->
            <div v-show="activeTab === 'registered'" class="search-filter">
              <div class="search-box">
                <input 
                  type="text" 
                  v-model="registeredSearch" 
                  placeholder="搜索活动名称..."
                  class="search-input"
                >
                <button class="search-btn" @click="handleRegisteredSearch">
                  🔍
                </button>
              </div>
              <select v-model="registeredStatusFilter" class="filter-select">
                <option value="">全部状态</option>
                <option value="pending">待审核</option>
                <option value="approved">已通过</option>
                <option value="rejected">已拒绝</option>
              </select>
            </div>
            
            <!-- 我报名的活动列表 -->
            <div v-show="activeTab === 'registered'" class="activity-list-container">
              <div v-if="isLoading" class="loading">
                <div class="spinner"></div>
                <p>加载中...</p>
              </div>
              <div v-else-if="filteredRegistrations.length === 0" class="empty-state">
                <span class="empty-icon">📋</span>
                <p>暂无报名的活动</p>
              </div>
              <div v-else class="activity-list">
                <div 
                  v-for="registration in paginatedRegistrations" 
                  :key="registration.id" 
                  class="activity-card"
                >
                  <div class="card-header">
                    <h4>{{ registration.activityName }}</h4>
                    <span :class="['status-badge', registration.status]">
                      {{ getRegistrationStatusText(registration.status) }}
                    </span>
                  </div>
                  <div class="card-content">
                    <div class="meta-info">
                      <span class="meta-item">📅 {{ getActivityById(registration.activity)?.date || '未知' }}</span>
                      <span class="meta-item">📍 {{ getActivityById(registration.activity)?.location || '未知' }}</span>
                      <span class="meta-item">👤 {{ registration.name }}</span>
                      <span class="meta-item">📞 {{ registration.phone }}</span>
                    </div>
                    <p class="description">个人简介：{{ truncateText(registration.introduction, 80) }}</p>
                  </div>
                  <div class="card-footer">
                    <span class="publish-time">报名于 {{ formatDate(registration.createdAt) }}</span>
                    <div class="card-actions">
                      <router-link 
                        :to="`/activity/${registration.activity}`" 
                        class="action-btn view-btn"
                      >
                        查看活动
                      </router-link>
                      <router-link 
                        :to="`/registration/${registration.id}`" 
                        class="action-btn detail-btn"
                      >
                        报名详情
                      </router-link>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 分页 -->
              <div v-if="registeredTotalPages > 1" class="pagination">
                <button 
                  class="pagination-btn" 
                  :disabled="registeredCurrentPage === 1"
                  @click="registeredCurrentPage--"
                >
                  ←
                </button>
                <span>第 {{ registeredCurrentPage }} / {{ registeredTotalPages }} 页</span>
                <button 
                  class="pagination-btn" 
                  :disabled="registeredCurrentPage === registeredTotalPages"
                  @click="registeredCurrentPage++"
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    
    <!-- 修改个人信息弹窗 -->
    <div v-if="showEditModal" class="modal">
      <div class="modal-content">
        <h3>修改个人信息</h3>
        <form @submit.prevent="updateProfile">
          <div class="form-group">
            <label for="editEmail">邮箱</label>
            <input type="email" id="editEmail" v-model="editForm.email" required>
          </div>
          <div class="form-group">
            <label for="currentPassword">当前密码</label>
            <input type="password" id="currentPassword" v-model="editForm.currentPassword" required>
          </div>
          <div class="form-group">
            <label for="newPassword">新密码（留空则不修改）</label>
            <input type="password" id="newPassword" v-model="editForm.newPassword">
          </div>
          <div class="form-group">
            <label for="confirmNewPassword">确认新密码</label>
            <input type="password" id="confirmNewPassword" v-model="editForm.confirmNewPassword">
          </div>
          <div class="modal-buttons">
            <button type="submit" class="btn" :disabled="loading">
              {{ loading ? '保存中...' : '保存' }}
            </button>
            <button type="button" class="btn cancel-btn" @click="showEditModal = false">取消</button>
          </div>
          <p v-if="error" class="error">{{ error }}</p>
          <p v-if="success" class="success">{{ success }}</p>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { apiGet, apiDelete, getCurrentUser } from '../utils/api'
import NotificationBell from '../components/NotificationBell.vue'

export default {
  name: 'Profile',
  components: {
    NotificationBell
  },
  data() {
    return {
      user: null,
      showEditModal: false,
      editForm: {
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      },
      loading: false,
      error: '',
      success: '',

      // 活动列表数据
      myActivities: [],
      myRegistrations: [],
      allActivities: [],
      isLoading: false,

      // Tab切换
      activeTab: 'published',

      // 我发布的活动分页和搜索
      publishedSearch: '',
      publishedStatusFilter: '',
      publishedCurrentPage: 1,
      publishedPageSize: 5,

      // 我报名的活动分页和搜索
      registeredSearch: '',
      registeredStatusFilter: '',
      registeredCurrentPage: 1,
      registeredPageSize: 5
    }
  },
  computed: {
    // 我发布的活动过滤结果
    filteredPublishedActivities() {
      let result = [...this.myActivities]

      if (this.publishedSearch) {
        const keyword = this.publishedSearch.toLowerCase()
        result = result.filter(a =>
          (a.name || a.title)?.toLowerCase().includes(keyword)
        )
      }

      if (this.publishedStatusFilter) {
        result = result.filter(a => this.getActivityStatus(a) === this.publishedStatusFilter)
      }

      return result.sort((a, b) => new Date(b.createdAt || b.time) - new Date(a.createdAt || a.time))
    },

    paginatedPublishedActivities() {
      const start = (this.publishedCurrentPage - 1) * this.publishedPageSize
      const end = start + this.publishedPageSize
      return this.filteredPublishedActivities.slice(start, end)
    },

    publishedTotalPages() {
      return Math.ceil(this.filteredPublishedActivities.length / this.publishedPageSize)
    },

    // 我报名的活动过滤结果
    filteredRegistrations() {
      let result = [...this.myRegistrations]

      if (this.registeredSearch) {
        const keyword = this.registeredSearch.toLowerCase()
        result = result.filter(r =>
          r.activityName?.toLowerCase().includes(keyword) ||
          r.name?.toLowerCase().includes(keyword)
        )
      }

      if (this.registeredStatusFilter) {
        result = result.filter(r => r.status === this.registeredStatusFilter)
      }

      return result.sort((a, b) => new Date(b.createdAt || b.time) - new Date(a.createdAt || a.time))
    },

    paginatedRegistrations() {
      const start = (this.registeredCurrentPage - 1) * this.registeredPageSize
      const end = start + this.registeredPageSize
      return this.filteredRegistrations.slice(start, end)
    },

    registeredTotalPages() {
      return Math.ceil(this.filteredRegistrations.length / this.registeredPageSize)
    }
  },
  mounted() {
    this.loadUser()
    this.loadActivities()
    this.loadRegistrations()
  },
  methods: {
    loadUser() {
      this.user = getCurrentUser()
    },

    async loadActivities() {
      this.isLoading = true
      try {
        const response = await apiGet('/user/activities')
        if (response.ok) {
          const data = await response.json()
          this.myActivities = data.map(activity => ({
            id: activity.id,
            title: activity.title,
            name: activity.title,
            description: activity.description,
            content: activity.description,
            date: activity.time,
            time: activity.time,
            location: activity.location,
            organizer: activity.publisher,
            publisher: activity.publisher,
            image_url: activity.image_url,
            createdAt: activity.created_at || activity.time
          }))
          this.allActivities = [...this.myActivities]
        } else {
          console.error('加载活动失败:', response.status)
          this.myActivities = []
          this.allActivities = []
        }
      } catch (error) {
        console.error('加载活动失败:', error)
        this.myActivities = []
        this.allActivities = []
      } finally {
        this.isLoading = false
      }
    },

    async loadRegistrations() {
      try {
        const response = await apiGet('/user/join')
        if (response.ok) {
          const data = await response.json()
          this.myRegistrations = data.map(activity => ({
            id: activity.id,
            activity: activity.id,
            activityName: activity.title,
            name: activity.publisher || '未知',
            phone: '',
            introduction: activity.description,
            status: 'approved',
            createdAt: activity.time,
            date: activity.time,
            location: activity.location
          }))
        } else {
          console.error('加载报名记录失败:', response.status)
          this.myRegistrations = []
        }
      } catch (error) {
        console.error('加载报名记录失败:', error)
        this.myRegistrations = []
      }
    },
    
    getActivityById(activityId) {
      return this.allActivities.find(a => a.id === activityId)
    },
    
    getActivityStatus(activity) {
      const activityDate = new Date(activity.date || activity.time)
      const now = new Date()
      
      if (activityDate < now) {
        return 'ended'
      } else if (activityDate - now < 24 * 60 * 60 * 1000) {
        return 'ongoing'
      } else {
        return 'upcoming'
      }
    },
    
    getActivityStatusText(activity) {
      const status = this.getActivityStatus(activity)
      const statusMap = {
        upcoming: '即将开始',
        ongoing: '进行中',
        ended: '已结束'
      }
      return statusMap[status] || status
    },
    
    getRegistrationStatusText(status) {
      const statusMap = {
        pending: '待审核',
        approved: '已通过',
        rejected: '已拒绝'
      }
      return statusMap[status] || status
    },
    
    getActivityParticipants(activityId) {
      return this.myRegistrations.filter(r => r.activity === activityId && r.status === 'approved').length
    },
    
    truncateText(text, maxLength) {
      if (!text) return ''
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
    },
    
    formatDate(dateString) {
      if (!dateString) return '未知'
      const date = new Date(dateString)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    handlePublishedSearch() {
      this.publishedCurrentPage = 1
    },
    
    handleRegisteredSearch() {
      this.registeredCurrentPage = 1
    },
    
    deleteActivity(activityId) {
      if (confirm('确定要删除这个活动吗？')) {
        try {
          let activities = JSON.parse(localStorage.getItem('activities') || '[]')
          activities = activities.filter(a => a.id !== activityId)
          localStorage.setItem('activities', JSON.stringify(activities))
          
          // 同时删除相关报名记录
          let registrations = JSON.parse(localStorage.getItem('registrations') || '[]')
          registrations = registrations.filter(r => r.activity !== activityId)
          localStorage.setItem('registrations', JSON.stringify(registrations))
          
          // 更新页面数据
          this.myActivities = activities
          this.myRegistrations = registrations
          this.allActivities = activities
          
          alert('删除成功')
        } catch (error) {
          console.error('删除活动失败:', error)
          alert('删除失败，请稍后重试')
        }
      }
    },
    
    logout() {
      localStorage.removeItem('user')
      this.user = null
      this.$router.push('/login')
    },
    
    async updateProfile() {
      this.error = ''
      this.success = ''
      
      if (this.editForm.newPassword && this.editForm.newPassword !== this.editForm.confirmNewPassword) {
        this.error = '两次输入的新密码不一致'
        return
      }
      
      if (this.editForm.newPassword && this.editForm.newPassword.length < 6) {
        this.error = '新密码长度不能少于6位'
        return
      }
      
      this.loading = true
      try {
        this.user.email = this.editForm.email
        if (this.editForm.newPassword) {
          this.user.password = this.editForm.newPassword
        }
        localStorage.setItem('user', JSON.stringify(this.user))
        
        this.success = '个人信息更新成功！'
        setTimeout(() => {
          this.showEditModal = false
          this.success = ''
        }, 1500)
      } catch (err) {
        this.error = '更新失败，请稍后重试'
      } finally {
        this.loading = false
      }
    }
  },
  watch: {
    showEditModal(newVal) {
      if (newVal && this.user) {
        this.editForm.email = this.user.email
        this.editForm.currentPassword = ''
        this.editForm.newPassword = ''
        this.editForm.confirmNewPassword = ''
        this.error = ''
        this.success = ''
      }
    },
    publishedStatusFilter() {
      this.publishedCurrentPage = 1
    },
    registeredStatusFilter() {
      this.registeredCurrentPage = 1
    }
  }
}
</script>

<style scoped>
.profile-page {
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

.not-logged-in {
  background-color: white;
  border-radius: 8px;
  padding: 60px 20px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.not-logged-in p {
  font-size: 18px;
  color: #666;
  margin-bottom: 20px;
}

.profile-container {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 20px;
}

.profile-info {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: sticky;
  top: 20px;
  height: fit-content;
}

.avatar-section {
  text-align: center;
  margin-bottom: 20px;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: bold;
  margin: 0 auto 15px;
}

.avatar-section h2 {
  margin: 0 0 5px 0;
  color: #333;
}

.user-email {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.info-stats {
  display: flex;
  justify-content: center;
  gap: 30px;
  padding: 15px 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
  margin: 20px 0;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #4CAF50;
}

.stat-label {
  font-size: 12px;
  color: #999;
}

.edit-btn {
  width: 100%;
  background-color: #2196F3;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.edit-btn:hover {
  background-color: #0b7dda;
}

.activities-section {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
}

.tab-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tab-header h3 {
  margin: 0;
  color: #333;
}

.tab-actions {
  display: flex;
  gap: 10px;
}

.tab-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.tab-btn.active {
  background-color: #4CAF50;
  color: white;
  border-color: #4CAF50;
}

.search-filter {
  padding: 15px 20px;
  background-color: #fafafa;
  border-bottom: 1px solid #eee;
  display: flex;
  gap: 15px;
  align-items: center;
}

.search-box {
  display: flex;
  flex: 1;
  max-width: 300px;
}

.search-input {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px 0 0 4px;
  font-size: 14px;
}

.search-btn {
  padding: 10px 15px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
}

.filter-select {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  min-width: 150px;
}

.activity-list-container {
  padding: 20px;
}

.loading {
  text-align: center;
  padding: 40px;
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

.empty-state {
  text-align: center;
  padding: 40px;
  color: #999;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 15px;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.activity-card {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 0.3s;
}

.activity-card:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.card-header {
  padding: 15px;
  background-color: #f8f9fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h4 {
  margin: 0;
  color: #333;
  font-size: 16px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.upcoming {
  background-color: #e3f2fd;
  color: #1976d2;
}

.status-badge.ongoing {
  background-color: #e8f5e9;
  color: #388e3c;
}

.status-badge.ended {
  background-color: #f5f5f5;
  color: #757575;
}

.status-badge.pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-badge.approved {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.rejected {
  background-color: #f8d7da;
  color: #721c24;
}

.card-content {
  padding: 15px;
}

.description {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 10px 0;
}

.meta-info {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  font-size: 13px;
  color: #666;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.card-footer {
  padding: 12px 15px;
  background-color: #fafafa;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.publish-time {
  font-size: 12px;
  color: #999;
}

.card-actions {
  display: flex;
  gap: 8px;
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
  background-color: #f0f0f0;
  color: #333;
}

.view-btn:hover {
  background-color: #e0e0e0;
}

.edit-btn {
  background-color: #2196F3;
  color: white;
}

.edit-btn:hover {
  background-color: #0b7dda;
}

.delete-btn {
  background-color: #f44336;
  color: white;
}

.delete-btn:hover {
  background-color: #d32f2f;
}

.detail-btn {
  background-color: #ff9800;
  color: white;
}

.detail-btn:hover {
  background-color: #f57c00;
}

.pagination {
  padding: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  border-top: 1px solid #eee;
  margin-top: 15px;
}

.pagination-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #f0f0f0;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 弹窗样式 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
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
  max-width: 500px;
  width: 90%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-content h3 {
  margin-bottom: 20px;
  color: #333;
  text-align: center;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #666;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.modal-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.modal-buttons .btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.btn {
  background-color: #4CAF50;
  color: white;
}

.btn:hover:not(:disabled) {
  background-color: #45a049;
}

.cancel-btn {
  background-color: #9e9e9e;
}

.cancel-btn:hover {
  background-color: #757575;
}

.error {
  color: #f44336;
  text-align: center;
  margin-top: 10px;
}

.success {
  color: #4CAF50;
  text-align: center;
  margin-top: 10px;
}

.btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
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
  
  nav a, .logout-link {
    margin-left: 0;
  }
  
  .profile-container {
    grid-template-columns: 1fr;
  }
  
  .profile-info {
    position: static;
  }
  
  .search-filter {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    max-width: 100%;
  }
  
  .meta-info {
    flex-direction: column;
    gap: 8px;
  }
  
  .card-footer {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .card-actions {
    width: 100%;
  }
  
  .action-btn {
    flex: 1;
    text-align: center;
  }
  
  .tab-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .tab-actions {
    justify-content: flex-start;
  }
}
</style>
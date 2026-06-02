<template>
  <div class="registration-detail-page">
    <header class="header">
      <h1>报名详情</h1>
      <nav>
        <router-link to="/">首页</router-link>
        <router-link to="/registration/list">报名列表</router-link>
        <router-link to="/profile" v-if="isLoggedIn">个人中心</router-link>
        <a v-if="isLoggedIn" @click="logout" class="logout-link">退出登录</a>
      </nav>
    </header>
    
    <main class="main">
      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>加载中...</p>
      </div>
      
      <div v-else-if="registration" class="detail-container">
        <div class="detail-header">
          <h2>{{ registration.activityName }}</h2>
          <span :class="['status-badge', registration.status]">
            {{ getStatusText(registration.status) }}
          </span>
        </div>
        
        <div class="detail-content">
          <!-- 基本信息卡片 -->
          <div class="info-card">
            <h3 class="card-title">
              <span class="card-icon">👤</span>
              基本信息
            </h3>
            <div class="info-grid">
              <div class="info-item">
                <label>姓名</label>
                <span>{{ registration.name }}</span>
              </div>
              <div class="info-item">
                <label>联系方式</label>
                <span>{{ registration.phone }}</span>
              </div>
              <div class="info-item">
                <label>邮箱</label>
                <span>{{ registration.email || '-' }}</span>
              </div>
              <div class="info-item">
                <label>学号</label>
                <span>{{ registration.studentId || '-' }}</span>
              </div>
              <div class="info-item">
                <label>院系</label>
                <span>{{ registration.department || '-' }}</span>
              </div>
              <div class="info-item">
                <label>报名时间</label>
                <span>{{ formatDate(registration.createdAt) }}</span>
              </div>
            </div>
          </div>
          
          <!-- 报名项目卡片 -->
          <div class="info-card">
            <h3 class="card-title">
              <span class="card-icon">📋</span>
              报名项目
            </h3>
            <div class="info-grid">
              <div class="info-item">
                <label>活动名称</label>
                <span>{{ registration.activityName }}</span>
              </div>
              <div class="info-item">
                <label>活动ID</label>
                <span>{{ registration.activity }}</span>
              </div>
            </div>
          </div>
          
          <!-- 个人简介卡片 -->
          <div class="info-card">
            <h3 class="card-title">
              <span class="card-icon">📝</span>
              个人简介
            </h3>
            <p class="introduction-text">{{ registration.introduction }}</p>
          </div>
          
          <!-- 审核状态卡片 -->
          <div class="info-card">
            <h3 class="card-title">
              <span class="card-icon">✅</span>
              审核状态
            </h3>
            <div class="status-section">
              <div class="current-status">
                <span class="status-label">当前状态</span>
                <span :class="['status-value', registration.status]">
                  {{ getStatusText(registration.status) }}
                </span>
              </div>
              <div class="status-history">
                <span class="status-label">报名时间</span>
                <span class="status-value">{{ formatDate(registration.createdAt) }}</span>
              </div>
            </div>
            
            <!-- 状态操作按钮（模拟管理员功能） -->
            <div class="action-buttons" v-if="registration.status === 'pending'">
              <button class="btn btn-approve" @click="updateStatus('approved')">
                审核通过
              </button>
              <button class="btn btn-reject" @click="updateStatus('rejected')">
                拒绝报名
              </button>
            </div>
          </div>
        </div>
        
        <!-- 返回按钮 -->
        <div class="footer-actions">
          <button class="btn btn-secondary" @click="goBack">返回列表</button>
        </div>
      </div>
      
      <!-- 未找到报名记录 -->
      <div v-else class="not-found">
        <span class="not-found-icon">🔍</span>
        <h3>未找到报名记录</h3>
        <p>该报名记录不存在或已被删除</p>
        <button class="btn btn-primary" @click="goBack">返回列表</button>
      </div>
    </main>
  </div>
</template>

<script>
import { apiGet, apiPut, isLoggedIn } from '../utils/api'

export default {
  name: 'RegistrationDetail',
  data() {
    return {
      isLoggedIn: false,
      registration: null,
      loading: false,
      updating: false
    }
  },
  mounted() {
    this.checkLoginStatus()
    this.loadRegistration()
  },
  methods: {
    checkLoginStatus() {
      this.isLoggedIn = isLoggedIn()
      if (!this.isLoggedIn) {
        this.$router.push('/login')
      }
    },

    async loadRegistration() {
      this.loading = true
      const registrationId = this.$route.params.id

      try {
        const response = await apiGet(`/registration/${registrationId}`)
        if (response.ok) {
          const data = await response.json()
          this.registration = {
            id: data.id,
            name: data.username,
            phone: data.email || '',
            email: data.email,
            activity: data.activity_id,
            activityName: data.activity_title,
            status: 'approved',
            createdAt: data.join_time
          }
        } else if (response.status === 404) {
          this.registration = null
        } else {
          console.error('加载报名详情失败:', response.status)
          this.registration = null
        }
      } catch (error) {
        console.error('加载报名详情失败:', error)
        this.registration = null
      } finally {
        this.loading = false
      }
    },

    getStatusText(status) {
      const statusMap = {
        pending: '待审核',
        approved: '已通过',
        rejected: '已拒绝'
      }
      return statusMap[status] || status
    },
    formatDate(dateString) {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    },
    async updateStatus(newStatus) {
      if (this.updating) return

      this.updating = true

      try {
        const response = await apiPut(`/registration/${this.registration.id}/status`, { status: newStatus })
        if (response.ok) {
          this.registration.status = newStatus
          alert(`状态已更新为${this.getStatusText(newStatus)}`)
        } else {
          const data = await response.json()
          alert(data.message || '更新状态失败')
        }
      } catch (error) {
        console.error('更新状态失败:', error)
        alert('更新状态失败，请稍后重试')
      } finally {
        this.updating = false
      }
    },
    goBack() {
      this.$router.push('/registration/list')
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
.registration-detail-page {
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
  max-width: 800px;
  margin: 0 auto;
}

.loading-container {
  padding: 80px;
  text-align: center;
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
  to {
    transform: rotate(360deg);
  }
}

.detail-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  overflow: hidden;
}

.detail-header {
  background-color: #f8f9fa;
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-header h2 {
  margin: 0;
  color: #333;
}

.status-badge {
  padding: 6px 16px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
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

.detail-content {
  padding: 20px;
}

.info-card {
  background-color: #fafafa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.info-card:last-of-type {
  margin-bottom: 0;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 15px 0;
  color: #333;
  font-size: 16px;
}

.card-icon {
  font-size: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-item label {
  font-size: 13px;
  color: #999;
}

.info-item span {
  font-size: 15px;
  color: #333;
}

.introduction-text {
  margin: 0;
  padding: 10px;
  background-color: white;
  border-radius: 4px;
  line-height: 1.6;
  color: #333;
  min-height: 80px;
}

.status-section {
  display: flex;
  gap: 30px;
  margin-bottom: 20px;
}

.status-label {
  display: block;
  font-size: 13px;
  color: #999;
  margin-bottom: 5px;
}

.status-value {
  font-size: 15px;
  font-weight: 500;
}

.status-value.pending {
  color: #856404;
}

.status-value.approved {
  color: #155724;
}

.status-value.rejected {
  color: #721c24;
}

.action-buttons {
  display: flex;
  gap: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 15px;
  transition: background-color 0.3s;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
}

.btn-primary:hover {
  background-color: #45a049;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background-color: #e0e0e0;
}

.btn-approve {
  background-color: #4CAF50;
  color: white;
}

.btn-approve:hover {
  background-color: #45a049;
}

.btn-reject {
  background-color: #f44336;
  color: white;
}

.btn-reject:hover {
  background-color: #d32f2f;
}

.footer-actions {
  padding: 20px;
  border-top: 1px solid #eee;
  text-align: center;
}

.not-found {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 60px 20px;
  text-align: center;
}

.not-found-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 20px;
}

.not-found h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.not-found p {
  margin: 0 0 20px 0;
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
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .status-section {
    flex-direction: column;
    gap: 15px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>
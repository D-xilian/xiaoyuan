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
        <router-link to="/my-activities" v-if="isLoggedIn && isAdmin">我发布的活动</router-link>
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
      <!-- 统计概览卡片 -->
      <div class="stats-section" v-if="statistics">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-info">
              <span class="stat-value">{{ statistics.overview.total }}</span>
              <span class="stat-label">总报名数</span>
            </div>
          </div>
          <div class="stat-card pending">
            <div class="stat-icon">⏳</div>
            <div class="stat-info">
              <span class="stat-value">{{ statistics.overview.pending }}</span>
              <span class="stat-label">待审核</span>
            </div>
          </div>
          <div class="stat-card approved">
            <div class="stat-icon">✅</div>
            <div class="stat-info">
              <span class="stat-value">{{ statistics.overview.approved }}</span>
              <span class="stat-label">已通过</span>
            </div>
          </div>
          <div class="stat-card rejected">
            <div class="stat-icon">❌</div>
            <div class="stat-info">
              <span class="stat-value">{{ statistics.overview.rejected }}</span>
              <span class="stat-label">已拒绝</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 状态筛选 -->
      <div class="page-header">
        <div class="header-left">
          <h2>志愿者报名管理</h2>
          <p class="subtitle">管理志愿者报名申请，审核用户加入志愿者团队</p>
        </div>
        <div class="header-actions">
          <div class="filter-group">
            <select v-model="statusFilter" @change="loadVolunteers">
              <option value="all">全部状态</option>
              <option value="pending">待审核</option>
              <option value="approved">已通过</option>
              <option value="rejected">已拒绝</option>
            </select>
          </div>
          <button @click="loadVolunteers" class="refresh-btn">刷新列表</button>
        </div>
      </div>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>加载中...</p>
      </div>

      <div v-else-if="error" class="error">{{ error }}</div>

      <div v-else class="volunteers-list">
        <div v-if="volunteers.length === 0" class="no-data">
          暂无志愿者报名数据
        </div>
        
        <div v-else class="volunteer-cards">
          <div v-for="volunteer in volunteers" :key="volunteer.id" class="volunteer-card">
            <div class="card-header">
              <div class="volunteer-info">
                <div class="avatar">
                  {{ volunteer.name?.charAt(0) || '?' }}
                </div>
                <div class="basic-info">
                  <h3>{{ volunteer.name }}</h3>
                  <div class="meta-row">
                    <span class="meta-item">👤 {{ volunteer.username }}</span>
                    <span class="meta-item">📧 {{ volunteer.email }}</span>
                  </div>
                </div>
              </div>
              <div class="status-badge" :class="volunteer.status">
                {{ getStatusText(volunteer.status) }}
              </div>
            </div>
            
            <div class="card-body">
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">报名活动</span>
                  <span class="value activity-title">{{ volunteer.activity_title }}</span>
                </div>
                <div class="info-item">
                  <span class="label">活动时间</span>
                  <span class="value">{{ volunteer.activity_time }}</span>
                </div>
                <div class="info-item">
                  <span class="label">学号</span>
                  <span class="value">{{ volunteer.student_id }}</span>
                </div>
                <div class="info-item">
                  <span class="label">性别</span>
                  <span class="value">{{ volunteer.gender }}</span>
                </div>
                <div class="info-item">
                  <span class="label">院系</span>
                  <span class="value">{{ volunteer.department }}</span>
                </div>
                <div class="info-item">
                  <span class="label">联系电话</span>
                  <span class="value">{{ volunteer.phone || '-' }}</span>
                </div>
              </div>
              
              <div v-if="volunteer.admin_note" class="admin-note-section">
                <h4>管理员备注</h4>
                <p>{{ volunteer.admin_note }}</p>
              </div>
              
              <div class="time-info">
                <span>报名时间：{{ volunteer.registration_time }}</span>
                <span v-if="volunteer.review_time">审核时间：{{ volunteer.review_time }}</span>
              </div>
            </div>
            
            <div class="card-footer">
              <div v-if="volunteer.status === 'pending'" class="actions">
                <button @click="approveVolunteer(volunteer.id)" class="action-btn approve-btn">
                  <span class="btn-icon">✓</span>
                  通过审核
                </button>
                <button @click="openRejectModal(volunteer)" class="action-btn reject-btn">
                  <span class="btn-icon">✗</span>
                  拒绝申请
                </button>
              </div>
              <div v-else class="status-info">
                <span>{{ getStatusText(volunteer.status) }}</span>
                <span v-if="volunteer.admin_note" class="note-badge">有备注</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 拒绝申请弹窗 -->
    <div v-if="showRejectModal" class="modal-overlay" @click.self="closeRejectModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>拒绝志愿者申请</h3>
          <button @click="closeRejectModal" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <p>确认拒绝 <strong>{{ rejectVolunteer?.name }}</strong> 的志愿者申请吗？</p>
          <div class="form-group">
            <label for="reject-note">拒绝理由（可选）</label>
            <textarea id="reject-note" v-model="rejectNote" rows="3" placeholder="请输入拒绝理由..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeRejectModal" class="btn btn-secondary">取消</button>
          <button @click="rejectVolunteerAction" class="btn btn-danger">确认拒绝</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { adminApiGet, adminApiPut, adminApiPost, isAdmin, isLoggedIn } from '../utils/api'

export default {
  name: 'AdminVolunteerManagement',
  data() {
    return {
      volunteers: [],
      statistics: null,
      loading: false,
      error: '',
      statusFilter: 'all',
      showRejectModal: false,
      rejectVolunteer: null,
      rejectNote: ''
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
    this.loadStatistics()
  },
  methods: {
    async loadVolunteers() {
      this.loading = true
      this.error = ''
      
      try {
        const url = `/admin/volunteer-registrations${this.statusFilter !== 'all' ? `?status=${this.statusFilter}` : ''}`
        const response = await adminApiGet(url)
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.message || '获取志愿者报名列表失败')
        }
        const data = await response.json()
        this.volunteers = data
      } catch (err) {
        this.error = err.message || '加载志愿者报名列表失败'
      } finally {
        this.loading = false
      }
    },
    
    async loadStatistics() {
      try {
        const response = await adminApiGet('/admin/volunteer-statistics')
        if (response.ok) {
          const data = await response.json()
          this.statistics = data
        }
      } catch (error) {
        console.error('加载统计数据失败:', error)
      }
    },
    
    getStatusText(status) {
      const statusMap = {
        'pending': '待审核',
        'approved': '已通过',
        'rejected': '已拒绝'
      }
      return statusMap[status] || status
    },
    
    async approveVolunteer(id) {
      if (!confirm('确定通过此志愿者申请吗？')) return
      
      try {
        const response = await adminApiPut(`/admin/volunteer-registrations/${id}/status`, {
          status: 'approved'
        })
        if (response.ok) {
          alert('审核通过')
          this.loadVolunteers()
          this.loadStatistics()
        } else {
          const data = await response.json()
          alert(data.message || '操作失败')
        }
      } catch (error) {
        alert('网络错误，请稍后重试')
      }
    },
    
    openRejectModal(volunteer) {
      this.rejectVolunteer = volunteer
      this.rejectNote = ''
      this.showRejectModal = true
    },
    
    closeRejectModal() {
      this.showRejectModal = false
      this.rejectVolunteer = null
      this.rejectNote = ''
    },
    
    async rejectVolunteerAction() {
      if (!this.rejectVolunteer) return
      
      try {
        const response = await adminApiPut(`/admin/volunteer-registrations/${this.rejectVolunteer.id}/status`, {
          status: 'rejected',
          admin_note: this.rejectNote
        })
        if (response.ok) {
          alert('已拒绝申请')
          this.closeRejectModal()
          this.loadVolunteers()
          this.loadStatistics()
        } else {
          const data = await response.json()
          alert(data.message || '操作失败')
        }
      } catch (error) {
        alert('网络错误，请稍后重试')
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
  padding: 15px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header h1 {
  font-size: 24px;
  margin: 0;
}

nav {
  display: flex;
  align-items: center;
  gap: 5px;
}

nav a {
  color: white;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 4px;
  transition: background-color 0.3s;
  font-size: 14px;
}

nav a:hover {
  background-color: rgba(255,255,255,0.2);
}

nav a.router-link-active {
  background-color: rgba(255,255,255,0.3);
  font-weight: 600;
}

.logout-link {
  color: white;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.logout-link:hover {
  background-color: rgba(255,255,255,0.2);
}

.main {
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 统计概览 */
.stats-section {
  margin-bottom: 30px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  border-left: 4px solid #4CAF50;
}

.stat-card.pending {
  border-left-color: #ffc107;
}

.stat-card.approved {
  border-left-color: #28a745;
}

.stat-card.rejected {
  border-left-color: #dc3545;
}

.stat-icon {
  font-size: 36px;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header-left h2 {
  margin: 0 0 5px 0;
  color: #333;
}

.subtitle {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.filter-group select {
  padding: 10px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
}

.refresh-btn {
  padding: 10px 20px;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
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
  gap: 25px;
}

.volunteer-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.volunteer-info {
  display: flex;
  gap: 15px;
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
}

.basic-info h3 {
  margin: 0 0 8px 0;
  color: white;
  font-size: 18px;
}

.meta-row {
  display: flex;
  gap: 15px;
}

.meta-item {
  font-size: 13px;
  color: rgba(255,255,255,0.8);
}

.status-badge {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

.status-badge.pending {
  background: #ffc107;
  color: #333;
}

.status-badge.approved {
  background: #28a745;
  color: white;
}

.status-badge.rejected {
  background: #dc3545;
  color: white;
}

.card-body {
  padding: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  padding: 10px 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.info-item .label {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.info-item .value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.section {
  margin-bottom: 20px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.section h4 {
  margin: 0 0 12px 0;
  font-size: 15px;
  color: #333;
}

.detail-item {
  display: flex;
  gap: 15px;
  margin-bottom: 10px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
}

.detail-item.full {
  flex-direction: column;
}

.detail-label {
  font-size: 12px;
  color: #999;
  min-width: 100px;
}

.detail-value {
  font-size: 14px;
  color: #333;
}

.admin-note-section {
  margin-bottom: 15px;
  padding: 15px;
  background: #fff3cd;
  border-radius: 8px;
  border-left: 4px solid #ffc107;
}

.admin-note-section h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #856404;
}

.admin-note-section p {
  margin: 0;
  font-size: 14px;
  color: #856404;
}

.time-info {
  display: flex;
  gap: 20px;
  font-size: 13px;
  color: #999;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  padding: 15px 20px;
  background: #fafafa;
  border-top: 1px solid #eee;
}

.actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.approve-btn {
  background: #28a745;
  color: white;
}

.approve-btn:hover {
  background: #218838;
  transform: translateY(-1px);
}

.reject-btn {
  background: #dc3545;
  color: white;
}

.reject-btn:hover {
  background: #c82333;
  transform: translateY(-1px);
}

.btn-icon {
  font-size: 14px;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #666;
}

.note-badge {
  padding: 3px 10px;
  background: #ffc107;
  color: #333;
  border-radius: 10px;
  font-size: 12px;
}

.no-data {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  color: #999;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 450px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #dc3545;
  color: white;
}

.modal-header h3 {
  margin: 0;
}

.modal-header .close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
}

.modal-body {
  padding: 20px;
}

.modal-body p {
  margin: 0 0 15px 0;
  color: #333;
}

.modal-body .form-group {
  display: flex;
  flex-direction: column;
}

.modal-body .form-group label {
  margin-bottom: 8px;
  font-size: 14px;
  color: #333;
}

.modal-body .form-group textarea {
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 15px 20px;
  border-top: 1px solid #eee;
}

.modal-footer .btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-secondary {
  background: #e0e0e0;
  color: #666;
}

.btn-secondary:hover {
  background: #d0d0d0;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 15px;
    padding: 15px;
  }
  
  nav {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  nav a, .logout-link {
    margin-left: 0;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .card-header {
    flex-direction: column;
    gap: 15px;
  }
  
  .volunteer-info {
    width: 100%;
  }
  
  .actions {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
    justify-content: center;
  }
  
  .time-info {
    flex-direction: column;
    gap: 5px;
  }
}
</style>
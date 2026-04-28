<template>
  <div class="registration-list-page">
    <header class="header">
      <h1>报名管理</h1>
      <nav>
        <router-link to="/">首页</router-link>
        <router-link to="/activity/register">报名活动</router-link>
        <router-link to="/profile" v-if="isLoggedIn">个人中心</router-link>
        <a v-if="isLoggedIn" @click="logout" class="logout-link">退出登录</a>
      </nav>
    </header>
    
    <main class="main">
      <div class="list-container">
        <h2>报名记录列表</h2>
        
        <!-- 搜索和筛选区域 -->
        <div class="search-filter-bar">
          <div class="search-box">
            <input 
              type="text" 
              v-model="searchKeyword" 
              placeholder="搜索姓名、联系方式或活动名称..."
              class="search-input"
            >
            <button class="search-btn" @click="handleSearch">
              <span class="search-icon">🔍</span>
            </button>
          </div>
          
          <div class="filter-section">
            <select v-model="filterActivity" class="filter-select">
              <option value="">全部活动</option>
              <option v-for="act in availableActivities" :key="act.id" :value="act.id">
                {{ act.name }}
              </option>
            </select>
            
            <select v-model="filterStatus" class="filter-select">
              <option value="">全部状态</option>
              <option value="pending">待审核</option>
              <option value="approved">已通过</option>
              <option value="rejected">已拒绝</option>
            </select>
          </div>
          
          <button class="btn btn-secondary" @click="resetFilters">重置筛选</button>
        </div>
        
        <!-- 统计信息 -->
        <div class="stats-bar">
          <span>共 {{ totalCount }} 条记录</span>
          <span>待审核: {{ pendingCount }}</span>
          <span>已通过: {{ approvedCount }}</span>
          <span>已拒绝: {{ rejectedCount }}</span>
        </div>
        
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
          <div class="spinner"></div>
          <p>加载中...</p>
        </div>
        
        <!-- 报名列表 -->
        <div v-else-if="filteredRegistrations.length > 0" class="registration-list">
          <div class="list-header">
            <div class="col-name">姓名</div>
            <div class="col-activity">报名项目</div>
            <div class="col-phone">联系方式</div>
            <div class="col-status">状态</div>
            <div class="col-date">报名时间</div>
            <div class="col-actions">操作</div>
          </div>
          
          <div 
            v-for="registration in paginatedRegistrations" 
            :key="registration.id" 
            class="list-item"
          >
            <div class="col-name">{{ registration.name }}</div>
            <div class="col-activity">{{ registration.activityName }}</div>
            <div class="col-phone">{{ registration.phone }}</div>
            <div class="col-status">
              <span :class="['status-badge', registration.status]">
                {{ getStatusText(registration.status) }}
              </span>
            </div>
            <div class="col-date">{{ formatDate(registration.createdAt) }}</div>
            <div class="col-actions">
              <button class="btn btn-sm btn-info" @click="viewDetail(registration.id)">
                详情
              </button>
            </div>
          </div>
        </div>
        
        <!-- 空数据状态 -->
        <div v-else class="empty-state">
          <span class="empty-icon">📋</span>
          <p>暂无报名记录</p>
        </div>
        
        <!-- 分页组件 -->
        <div v-if="totalPages > 1" class="pagination">
          <button 
            class="pagination-btn" 
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            ←
          </button>
          <span class="pagination-info">
            第 {{ currentPage }} / {{ totalPages }} 页
          </span>
          <button 
            class="pagination-btn" 
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          >
            →
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'RegistrationList',
  data() {
    return {
      isLoggedIn: false,
      registrations: [],
      availableActivities: [],
      searchKeyword: '',
      filterActivity: '',
      filterStatus: '',
      currentPage: 1,
      pageSize: 10,
      loading: false
    }
  },
  computed: {
    filteredRegistrations() {
      let result = [...this.registrations]
      
      // 搜索筛选
      if (this.searchKeyword.trim()) {
        const keyword = this.searchKeyword.toLowerCase()
        result = result.filter(r => 
          r.name.toLowerCase().includes(keyword) ||
          r.phone.includes(keyword) ||
          (r.activityName && r.activityName.toLowerCase().includes(keyword))
        )
      }
      
      // 活动筛选
      if (this.filterActivity) {
        result = result.filter(r => r.activity === this.filterActivity)
      }
      
      // 状态筛选
      if (this.filterStatus) {
        result = result.filter(r => r.status === this.filterStatus)
      }
      
      // 按报名时间倒序排序
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      
      return result
    },
    paginatedRegistrations() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredRegistrations.slice(start, end)
    },
    totalCount() {
      return this.filteredRegistrations.length
    },
    totalPages() {
      return Math.ceil(this.filteredRegistrations.length / this.pageSize)
    },
    pendingCount() {
      return this.registrations.filter(r => r.status === 'pending').length
    },
    approvedCount() {
      return this.registrations.filter(r => r.status === 'approved').length
    },
    rejectedCount() {
      return this.registrations.filter(r => r.status === 'rejected').length
    }
  },
  mounted() {
    this.checkLoginStatus()
    this.loadRegistrations()
    this.loadActivities()
  },
  methods: {
    checkLoginStatus() {
      const user = localStorage.getItem('user')
      this.isLoggedIn = !!user
      if (!this.isLoggedIn) {
        this.$router.push('/login')
      }
    },
    loadRegistrations() {
      this.loading = true
      try {
        // 模拟加载延迟
        setTimeout(() => {
          const storedRegistrations = localStorage.getItem('registrations')
          this.registrations = storedRegistrations ? JSON.parse(storedRegistrations) : []
          this.loading = false
        }, 500)
      } catch (error) {
        console.error('加载报名记录失败:', error)
        this.registrations = []
        this.loading = false
      }
    },
    loadActivities() {
      const storedActivities = localStorage.getItem('activities')
      this.availableActivities = storedActivities ? JSON.parse(storedActivities) : []
    },
    handleSearch() {
      this.currentPage = 1
    },
    resetFilters() {
      this.searchKeyword = ''
      this.filterActivity = ''
      this.filterStatus = ''
      this.currentPage = 1
    },
    viewDetail(id) {
      this.$router.push(`/registration/${id}`)
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
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    logout() {
      localStorage.removeItem('user')
      this.isLoggedIn = false
      this.$router.push('/login')
    }
  },
  watch: {
    searchKeyword() {
      this.currentPage = 1
    },
    filterActivity() {
      this.currentPage = 1
    },
    filterStatus() {
      this.currentPage = 1
    }
  }
}
</script>

<style scoped>
.registration-list-page {
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

.list-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  overflow: hidden;
}

.list-container h2 {
  background-color: #f8f9fa;
  padding: 20px;
  margin: 0;
  color: #333;
  border-bottom: 1px solid #eee;
}

.search-filter-bar {
  padding: 15px 20px;
  background-color: #fafafa;
  border-bottom: 1px solid #eee;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
}

.search-box {
  display: flex;
  flex: 1;
  min-width: 200px;
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

.filter-section {
  display: flex;
  gap: 10px;
}

.filter-select {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  min-width: 150px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background-color: #e0e0e0;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-info {
  background-color: #2196F3;
  color: white;
}

.btn-info:hover {
  background-color: #0b7dda;
}

.stats-bar {
  padding: 12px 20px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #eee;
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #666;
}

.loading-container {
  padding: 60px;
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

.registration-list {
  overflow-x: auto;
}

.list-header {
  display: grid;
  grid-template-columns: 100px 200px 150px 100px 150px 100px;
  gap: 10px;
  padding: 15px 20px;
  background-color: #f8f9fa;
  font-weight: bold;
  color: #555;
  font-size: 14px;
}

.list-item {
  display: grid;
  grid-template-columns: 100px 200px 150px 100px 150px 100px;
  gap: 10px;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  align-items: center;
  transition: background-color 0.2s;
}

.list-item:hover {
  background-color: #fafafa;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
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

.empty-state {
  padding: 60px;
  text-align: center;
  color: #999;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 15px;
}

.pagination {
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  border-top: 1px solid #eee;
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

.pagination-info {
  font-size: 14px;
  color: #666;
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
  
  .search-filter-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    max-width: 100%;
  }
  
  .filter-section {
    flex-direction: column;
  }
  
  .filter-select {
    min-width: 100%;
  }
  
  .stats-bar {
    flex-wrap: wrap;
  }
  
  .list-header,
  .list-item {
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  
  .col-activity,
  .col-phone,
  .col-date {
    display: none;
  }
}
</style>
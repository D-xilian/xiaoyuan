<template>
  <div class="admin-users">
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
      <div class="page-header">
        <h2>用户管理</h2>
        <button @click="loadUsers" class="refresh-btn">刷新列表</button>
      </div>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>加载中...</p>
      </div>

      <div v-else-if="error" class="error">{{ error }}</div>

      <div v-else class="users-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>用户名</th>
              <th>邮箱</th>
              <th>角色</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.id }}</td>
              <td>{{ user.username }}</td>
              <td>{{ user.email }}</td>
              <td>
                <span :class="['role-badge', user.role]">
                  {{ user.role === 'admin' ? '管理员' : '普通用户' }}
                </span>
              </td>
              <td>
                <button 
                  v-if="user.role === 'user'"
                  @click="grantAdmin(user.id)"
                  class="action-btn grant-btn"
                  :disabled="actionLoading === user.id"
                >
                  {{ actionLoading === user.id ? '授权中...' : '设为管理员' }}
                </button>
                <button 
                  v-if="user.role === 'admin'"
                  @click="revokeAdmin(user.id)"
                  class="action-btn revoke-btn"
                  :disabled="actionLoading === user.id"
                >
                  {{ actionLoading === user.id ? '撤销中...' : '撤销管理员' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="!loading && users.length === 0" class="no-data">
        暂无用户数据
      </div>
    </main>
  </div>
</template>

<script>
import { apiGet, apiPut, isAdmin, isLoggedIn } from '../utils/api'

export default {
  name: 'AdminUserManagement',
  data() {
    return {
      users: [],
      loading: false,
      error: '',
      actionLoading: null
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
    this.loadUsers()
  },
  methods: {
    async loadUsers() {
      this.loading = true
      this.error = ''
      
      try {
        const response = await apiGet('/admin/users')
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.message || '获取用户列表失败')
        }
        const data = await response.json()
        this.users = data
      } catch (err) {
        this.error = err.message || '加载用户列表失败'
      } finally {
        this.loading = false
      }
    },
    
    async grantAdmin(userId) {
      if (!confirm('确定要将该用户设为管理员吗？')) return
      
      this.actionLoading = userId
      try {
        const response = await apiPut(`/admin/users/${userId}/role`, { role: 'admin' })
        const data = await response.json()
        
        if (response.ok) {
          alert(data.message || '授权成功')
          this.loadUsers()
        } else {
          alert(data.message || '授权失败')
        }
      } catch (err) {
        alert('网络错误，请稍后重试')
      } finally {
        this.actionLoading = null
      }
    },
    
    async revokeAdmin(userId) {
      if (!confirm('确定要撤销该用户的管理员权限吗？')) return
      
      this.actionLoading = userId
      try {
        const response = await apiPut(`/admin/users/${userId}/role`, { role: 'user' })
        const data = await response.json()
        
        if (response.ok) {
          alert(data.message || '撤销成功')
          this.loadUsers()
        } else {
          alert(data.message || '撤销失败')
        }
      } catch (err) {
        alert('网络错误，请稍后重试')
      } finally {
        this.actionLoading = null
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
.admin-users {
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

.users-table {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background-color: #f8f9fa;
}

th {
  padding: 15px;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #dee2e6;
}

td {
  padding: 15px;
  border-bottom: 1px solid #dee2e6;
  color: #666;
}

tbody tr:hover {
  background-color: #f8f9fa;
}

.role-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.role-badge.admin {
  background-color: #d4edda;
  color: #155724;
}

.role-badge.user {
  background-color: #e3f2fd;
  color: #1976d2;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.3s;
  margin-right: 8px;
}

.grant-btn {
  background-color: #4CAF50;
  color: white;
}

.grant-btn:hover:not(:disabled) {
  background-color: #45a049;
}

.revoke-btn {
  background-color: #ff9800;
  color: white;
}

.revoke-btn:hover:not(:disabled) {
  background-color: #f57c00;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  
  table {
    font-size: 12px;
  }
  
  th, td {
    padding: 10px;
  }
}
</style>

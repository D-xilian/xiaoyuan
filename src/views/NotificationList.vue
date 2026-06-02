<template>
  <div class="notification-page">
    <header class="header">
      <h1>校园活动发布平台</h1>
      <nav>
        <router-link to="/">首页</router-link>
        <router-link to="/activity/register" v-if="isLoggedIn">报名活动</router-link>
        <router-link to="/notifications" v-if="isLoggedIn" class="active-link">消息通知</router-link>
        <router-link to="/profile" v-if="isLoggedIn">个人中心</router-link>
        <a v-if="isLoggedIn" @click="logout" class="logout-link">退出登录</a>
        <router-link to="/login" v-if="!isLoggedIn">登录</router-link>
      </nav>
    </header>

    <main class="main">
      <div v-if="!isLoggedIn" class="not-logged-in">
        <p>请先登录查看通知</p>
        <router-link to="/login" class="btn">去登录</router-link>
      </div>

      <div v-else class="notification-container">
        <div class="notification-header">
          <h2>消息通知</h2>
          <div class="header-actions">
            <button
              v-if="notifications.length > 0 && unreadCount > 0"
              class="btn btn-mark-all"
              @click="markAllRead"
            >
              全部标为已读
            </button>
          </div>
        </div>

        <div v-if="loading" class="loading">加载中...</div>
        <div v-else-if="error" class="error">{{ error }}</div>
        <div v-else-if="notifications.length === 0" class="empty-state">
          <span class="empty-icon">🔔</span>
          <p>暂无通知</p>
          <p class="empty-hint">当有人报名你的活动、评论或审核你的报名时，你会收到通知</p>
        </div>
        <div v-else class="notification-list">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="notification-item"
            :class="{ unread: !notification.is_read }"
            @click="handleClick(notification)"
          >
            <div class="notification-icon">
              <span v-if="notification.type === 'join'">📋</span>
              <span v-else-if="notification.type === 'cancel'">🚫</span>
              <span v-else-if="notification.type === 'comment'">💬</span>
              <span v-else-if="notification.type === 'approved'">✅</span>
              <span v-else-if="notification.type === 'rejected'">❌</span>
              <span v-else>📢</span>
            </div>
            <div class="notification-content">
              <p class="notification-message">{{ notification.message }}</p>
              <p class="notification-time">{{ notification.created_at }}</p>
            </div>
            <div v-if="!notification.is_read" class="unread-dot"></div>
          </div>
        </div>

        <div v-if="totalPages > 1" class="pagination">
          <button
            class="pagination-btn"
            :disabled="currentPage === 1"
            @click="changePage(currentPage - 1)"
          >
            ← 上一页
          </button>
          <span>第 {{ currentPage }} / {{ totalPages }} 页</span>
          <button
            class="pagination-btn"
            :disabled="currentPage === totalPages"
            @click="changePage(currentPage + 1)"
          >
            下一页 →
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { getNotifications, markNotificationRead, markAllNotificationsRead, isLoggedIn } from '../utils/api'

export default {
  data() {
    return {
      isLoggedIn: false,
      notifications: [],
      loading: false,
      error: '',
      currentPage: 1,
      totalPages: 1,
      unreadCount: 0
    }
  },
  mounted() {
    this.isLoggedIn = isLoggedIn()
    if (this.isLoggedIn) {
      this.loadNotifications()
    }
  },
  methods: {
    async loadNotifications() {
      this.loading = true
      this.error = ''
      try {
        const response = await getNotifications(this.currentPage)
        if (!response.ok) throw new Error('获取通知失败')
        const data = await response.json()
        this.notifications = data.notifications
        this.totalPages = data.pages
        this.unreadCount = this.notifications.filter(n => !n.is_read).length
      } catch (err) {
        this.error = '获取通知失败，请稍后重试'
      } finally {
        this.loading = false
      }
    },
    async handleClick(notification) {
      if (!notification.is_read) {
        await markNotificationRead(notification.id)
        notification.is_read = true
        this.unreadCount--
      }
      if (notification.activity_id) {
        this.$router.push(`/activity/${notification.activity_id}`)
      }
    },
    async markAllRead() {
      try {
        await markAllNotificationsRead()
        this.notifications.forEach(n => { n.is_read = true })
        this.unreadCount = 0
      } catch (err) {
        // 静默失败
      }
    },
    changePage(page) {
      this.currentPage = page
      this.loadNotifications()
    },
    logout() {
      localStorage.removeItem('user')
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

nav a.active-link {
  font-weight: bold;
  text-decoration: underline;
}

.main {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.notification-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 24px;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
}

.notification-header h2 {
  color: #333;
  font-size: 20px;
}

.btn-mark-all {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.btn-mark-all:hover {
  background-color: #388E3C;
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  padding: 14px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;
}

.notification-item:hover {
  background-color: #f5f5f5;
}

.notification-item.unread {
  background-color: #f0f8f0;
}

.notification-item.unread:hover {
  background-color: #e8f5e8;
}

.notification-icon {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  background: #f5f5f5;
  border-radius: 50%;
  margin-right: 12px;
}

.notification-item.unread .notification-icon {
  background: #e8f5e8;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-message {
  color: #333;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 4px;
}

.notification-item.unread .notification-message {
  font-weight: 600;
}

.notification-time {
  color: #999;
  font-size: 12px;
}

.unread-dot {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  background-color: #4CAF50;
  border-radius: 50%;
  margin-left: 8px;
  margin-top: 6px;
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

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
}

.empty-state p {
  font-size: 16px;
  margin-bottom: 8px;
}

.empty-hint {
  font-size: 13px !important;
  color: #bbb;
}

.not-logged-in {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.not-logged-in p {
  margin-bottom: 20px;
  color: #666;
  font-size: 16px;
}

.btn {
  display: inline-block;
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 14px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.pagination-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  color: #333;
  font-size: 14px;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #4CAF50;
  color: white;
  border-color: #4CAF50;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination span {
  color: #666;
  font-size: 14px;
}
</style>

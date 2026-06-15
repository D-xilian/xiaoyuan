<template>
  <router-link to="/notifications" class="notification-bell" :class="{ 'has-unread': unreadCount > 0 }">
    <span class="bell-icon">🔔</span>
    <span v-if="unreadCount > 0" class="badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
  </router-link>
</template>

<script>
import { getUnreadCount, isLoggedIn } from '../utils/api'

export default {
  data() {
    return {
      unreadCount: 0,
      pollTimer: null
    }
  },
  mounted() {
    if (isLoggedIn()) {
      this.fetchUnreadCount()
      this.pollTimer = setInterval(() => {
        this.fetchUnreadCount()
      }, 30000)
    }
  },
  beforeUnmount() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer)
    }
  },
  methods: {
    async fetchUnreadCount() {
      try {
        const response = await getUnreadCount()
        if (response.ok) {
          const data = await response.json()
          this.unreadCount = data.count
        } else if (response.status === 401) {
          this.unreadCount = 0
        }
      } catch (e) {
        this.unreadCount = 0
      }
    },
    refresh() {
      this.fetchUnreadCount()
    }
  }
}
</script>

<style scoped>
.notification-bell {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.9);
  padding: 10px 15px;
  border-radius: 8px;
  cursor: pointer;
  opacity: 0.7;
  transition: all 0.3s ease;
}

.notification-bell:hover {
  opacity: 1;
}

.notification-bell.has-unread {
  opacity: 1;
}

.bell-icon {
  font-size: 18px;
}

.badge {
  position: absolute;
  top: -8px;
  right: -10px;
  background-color: #ff4444;
  color: white;
  font-size: 11px;
  font-weight: bold;
  min-width: 18px;
  height: 18px;
  line-height: 18px;
  text-align: center;
  border-radius: 9px;
  padding: 0 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}
</style>

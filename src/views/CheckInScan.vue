<template>
  <div class="checkin-scan-page">
    <main class="main">
      <div v-if="!isLoggedIn" class="not-logged-in">
        <p>请先登录</p>
        <router-link to="/login" class="btn">去登录</router-link>
      </div>

      <div v-else class="checkin-container">
        <!-- 签到选项卡 -->
        <div class="tabs">
          <button :class="['tab', { active: activeTab === 'checkin' }]" @click="activeTab = 'checkin'">
            ✏️ 签到
          </button>
          <button :class="['tab', { active: activeTab === 'history' }]" @click="activeTab = 'history'; loadHistory()">
            📋 我的签到记录
          </button>
        </div>

        <!-- 签到面板 -->
        <div v-if="activeTab === 'checkin'" class="panel">
          <div class="panel-header">
            <h3>输入签到码</h3>
            <p>请向活动主办方获取签到码，或扫描活动二维码</p>
          </div>
          <div class="checkin-form">
            <input
              v-model="checkinToken"
              placeholder="请粘贴或输入签到码"
              class="token-input"
              @keyup.enter="submitCheckin"
            />
            <button class="btn btn-checkin" @click="submitCheckin" :disabled="checkinSubmitting">
              {{ checkinSubmitting ? '签到中...' : '立即签到' }}
            </button>
          </div>
          <div v-if="checkinMessage" :class="['message', checkinSuccess ? 'success' : 'error']">
            <span class="message-icon">{{ checkinSuccess ? '✅' : '❌' }}</span>
            <span>{{ checkinMessage }}</span>
          </div>
        </div>

        <!-- 签到历史面板 -->
        <div v-if="activeTab === 'history'" class="panel">
          <div class="panel-header">
            <h3>我的签到记录</h3>
          </div>
          <div v-if="historyLoading" class="loading">加载中...</div>
          <div v-else-if="checkinHistory.length === 0" class="empty">
            <span class="empty-icon">📭</span>
            <p>暂无签到记录</p>
          </div>
          <div v-else class="history-list">
            <div v-for="item in checkinHistory" :key="item.id" class="history-item">
              <div class="history-info">
                <p class="history-title">{{ item.activity_title }}</p>
                <p class="history-time">{{ item.checkin_time }}</p>
              </div>
              <span class="history-badge">已签到</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { isLoggedIn } from '../utils/api'

export default {
  name: 'CheckInScan',
  data() {
    return {
      isLoggedIn: false,
      activeTab: 'checkin',
      checkinToken: '',
      checkinSubmitting: false,
      checkinMessage: '',
      checkinSuccess: false,
      checkinHistory: [],
      historyLoading: false
    }
  },
  mounted() {
    this.isLoggedIn = isLoggedIn()
    if (!this.isLoggedIn) {
      this.$router.push('/login')
    }
  },
  methods: {
    async submitCheckin() {
      if (!this.checkinToken.trim()) {
        this.checkinMessage = '请输入签到码'
        this.checkinSuccess = false
        return
      }
      this.checkinSubmitting = true
      this.checkinMessage = ''
      try {
        const response = await fetch('/api/checkin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-ID': JSON.parse(localStorage.getItem('user')).id.toString()
          },
          body: JSON.stringify({ token: this.checkinToken.trim() })
        })
        const data = await response.json()
        if (response.ok) {
          this.checkinMessage = `签到成功！活动：${data.activity_title}，时间：${data.checkin_time}`
          this.checkinSuccess = true
          this.checkinToken = ''
        } else {
          this.checkinMessage = data.message || '签到失败'
          this.checkinSuccess = false
        }
      } catch (error) {
        this.checkinMessage = '网络错误，请稍后重试'
        this.checkinSuccess = false
      } finally {
        this.checkinSubmitting = false
      }
    },
    async loadHistory() {
      this.historyLoading = true
      try {
        const response = await fetch('/api/user/checkins', {
          headers: {
            'X-User-ID': JSON.parse(localStorage.getItem('user')).id.toString()
          }
        })
        if (response.ok) {
          this.checkinHistory = await response.json()
        }
      } catch (error) {
        console.error('加载签到记录失败:', error)
      } finally {
        this.historyLoading = false
      }
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
.checkin-scan-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  max-width: 600px;
  margin: 30px auto;
  padding: 0 20px;
}

.not-logged-in {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.not-logged-in p {
  margin-bottom: 20px;
  color: #666;
}

/* 选项卡 */
.tabs {
  display: flex;
  gap: 0;
  margin-bottom: 20px;
}

.tab {
  flex: 1;
  padding: 12px;
  border: none;
  background: #eee;
  cursor: pointer;
  font-size: 15px;
  color: #666;
  transition: all 0.3s;
}

.tab:first-child {
  border-radius: 10px 0 0 10px;
}

.tab:last-child {
  border-radius: 0 10px 10px 0;
}

.tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: bold;
}

/* 面板 */
.panel {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  overflow: hidden;
}

.panel-header {
  padding: 24px;
  text-align: center;
  border-bottom: 1px solid #eee;
}

.panel-header h3 {
  margin-bottom: 8px;
  color: #333;
}

.panel-header p {
  color: #999;
  font-size: 14px;
}

/* 签到表单 */
.checkin-form {
  padding: 30px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
}

.token-input {
  width: 100%;
  max-width: 400px;
  padding: 14px 18px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.3s;
  text-align: center;
  font-family: monospace;
}

.token-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
}

.btn-checkin {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 40px;
  border-radius: 25px;
  font-size: 16px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-checkin:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-checkin:disabled {
  background: #ccc;
  transform: none;
  box-shadow: none;
  cursor: not-allowed;
}

/* 消息提示 */
.message {
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
}

.message.success {
  background: #e8f5e9;
  color: #2e7d32;
}

.message.error {
  background: #fbe9e7;
  color: #c62828;
}

.message-icon {
  font-size: 18px;
}

/* 历史记录 */
.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

.empty {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

.history-list {
  padding: 16px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #f5f5f5;
  transition: background 0.2s;
}

.history-item:hover {
  background: #fafafa;
}

.history-item:last-child {
  border-bottom: none;
}

.history-info {
  flex: 1;
}

.history-title {
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.history-time {
  font-size: 13px;
  color: #999;
}

.history-badge {
  background: #e8f5e9;
  color: #2e7d32;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.btn {
  display: inline-block;
  padding: 10px 24px;
  background-color: #4CAF50;
  color: white;
  text-decoration: none;
  border-radius: 4px;
}
</style>

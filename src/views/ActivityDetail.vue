<template>
  <div class="activity-detail">
    <header class="header">
      <h1>校园活动详情</h1>
      <nav>
        <router-link to="/">首页</router-link>
        <router-link to="/activity/register" v-if="isLoggedIn">报名活动</router-link>
        <router-link to="/registration/list" v-if="isLoggedIn">报名列表</router-link>
        <router-link to="/checkin" v-if="isLoggedIn">签到</router-link>
        <router-link to="/login" v-if="!isLoggedIn">登录</router-link>
        <router-link to="/profile" v-if="isLoggedIn">个人中心</router-link>
        <a v-if="isLoggedIn" @click="logout" class="logout-link">退出登录</a>
      </nav>
    </header>
    
    <main class="main">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="activity">
        <div v-if="activity.image_url" class="activity-image">
          <img :src="activity.image_url" :alt="activity.title">
        </div>
        <h2>{{ activity.name || activity.title }}</h2>
        <div class="activity-info">
          <p><strong>时间:</strong> {{ activity.date || activity.time }}</p>
          <p><strong>地点:</strong> {{ activity.location }}</p>
          <p><strong>主办方:</strong> {{ activity.organizer || activity.publisher }}</p>
          <p><strong>活动容量:</strong> {{ activity.participants_count || 0 }} / {{ activity.capacity || 100 }} 人</p>
        </div>
        <div class="activity-description">
          <h3>活动内容</h3>
          <p>{{ activity.content || activity.description }}</p>
        </div>
        <div class="action-buttons">
          <router-link :to="`/activity/register/${activity.id}`" class="btn join-btn">
            报名参加
          </router-link>
          <button class="btn collect-btn" @click="collectActivity" :class="{ collected: isCollected }">
            {{ isCollected ? '已收藏' : '收藏' }}
          </button>
          <router-link :to="`/activity/${activity.id}/edit`" class="btn edit-btn">编辑活动</router-link>
          <button class="btn delete-btn" @click="deleteActivity">删除活动</button>
        </div>

        <!-- 二维码签到区域 -->
        <div v-if="isLoggedIn" class="checkin-section">
          <div class="checkin-header">
            <h3>📱 活动签到</h3>
          </div>
          <div class="checkin-body">
            <!-- 已签到 -->
            <div v-if="checkedIn" class="checked-in-badge">
              <span class="badge-icon">✅</span>
              <span>您已签到</span>
            </div>

            <!-- 发布者：生成签到二维码 -->
            <div v-if="isPublisher">
              <div class="checkin-qrcode" v-if="qrCodeData">
                <img :src="qrCodeData.qrcode_base64" alt="签到二维码">
                <p class="token-text">签到码：<strong>{{ qrCodeData.token }}</strong></p>
                <p class="checkin-hint">出示此二维码或签到码供参与者签到</p>
              </div>
              <div class="checkin-actions">
                <button class="btn btn-qrcode" @click="loadQRCode" :disabled="qrLoading">
                  {{ qrLoading ? '生成中...' : qrCodeData ? '🔄 刷新签到码' : '📱 生成签到码' }}
                </button>
              </div>
              <div v-if="checkins.length > 0" class="checkin-records">
                <h4>签到记录 ({{ checkins.length }})</h4>
                <div class="checkin-list">
                  <div v-for="c in checkins" :key="c.id" class="checkin-item">
                    <span class="checkin-user">{{ c.username }}</span>
                    <span class="checkin-time">{{ c.checkin_time }}</span>
                  </div>
                </div>
              </div>
              <div v-else class="no-checkins">
                <p>暂无签到记录</p>
              </div>
            </div>

            <!-- 已报名未签到 -->
            <div v-else-if="hasJoined">
              <p class="checkin-hint">请输入活动主办方提供的签到码完成签到</p>
              <div class="checkin-input-area">
                <input v-model="checkinToken" placeholder="请输入签到码" class="checkin-input" />
                <button class="btn btn-primary" @click="submitCheckin" :disabled="checkinSubmitting">
                  {{ checkinSubmitting ? '签到中...' : '签到' }}
                </button>
              </div>
              <p v-if="checkinMessage" :class="checkinSuccess ? 'success-text' : 'error-text'">
                {{ checkinMessage }}
              </p>
            </div>

            <!-- 未报名 -->
            <div v-else>
              <p class="checkin-hint">请先报名此活动，报名后方可签到</p>
              <router-link :to="`/activity/register/${activity.id}`" class="btn btn-join-small">报名参加</router-link>
            </div>
          </div>
        </div>

        <div class="comments">
          <h3>评论</h3>
          <div class="comment-form">
            <textarea v-model="commentContent" placeholder="写下你的评论..."></textarea>
            <button class="btn" @click="addComment">发表评论</button>
          </div>
          <div class="comment-list">
            <div class="comment-item" v-for="comment in comments" :key="comment.id">
              <p class="comment-user">{{ comment.user }}</p>
              <p class="comment-content">{{ comment.content }}</p>
              <p class="comment-time">{{ comment.time }}</p>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="not-found">
        <p>活动不存在或已被删除</p>
        <router-link to="/" class="btn">返回首页</router-link>
      </div>
    </main>
  </div>
</template>

<script>
import { apiGet, apiPost, apiDelete, isLoggedIn, getCurrentUser } from '../utils/api'

export default {
  data() {
    return {
      isLoggedIn: false,
      activity: null,
      isCollected: false,
      commentContent: '',
      comments: [],
      loading: false,
      // 签到相关
      qrCodeData: null,
      qrLoading: false,
      showCheckinInput: false,
      checkinToken: '',
      checkinSubmitting: false,
      checkinMessage: '',
      checkinSuccess: false,
      checkins: [],
      hasJoined: false,
      isPublisher: false,
      checkedIn: false
    }
  },
  mounted() {
    this.checkLoginStatus()
    this.loadActivity()
    this.loadComments()
  },
  methods: {
    checkLoginStatus() {
      const user = localStorage.getItem('user')
      this.isLoggedIn = !!user
    },
    async loadActivity() {
      this.loading = true
      const activityId = this.$route.params.id
      
      try {
        const response = await apiGet(`/activities/${activityId}`)
        if (!response.ok) {
          throw new Error('获取活动详情失败')
        }
        const data = await response.json()
        this.activity = data
        this.checkCollectionStatus()
        this.loadCheckins()
        this.checkJoinStatus()
      } catch (error) {
        console.error('加载活动详情失败:', error)
        this.activity = null
      } finally {
        this.loading = false
      }
    },
    // 签到方法
    async loadQRCode() {
      if (!this.activity) return
      this.qrLoading = true
      try {
        const response = await apiGet(`/activities/${this.activity.id}/qrcode`)
        if (response.ok) {
          const data = await response.json()
          this.qrCodeData = data
        } else if (response.status === 401) {
          this.$router.push('/login')
        } else {
          const data = await response.json()
          alert(data.message || '生成二维码失败')
        }
      } catch (error) {
        console.error('生成二维码失败:', error)
        alert('生成二维码失败')
      } finally {
        this.qrLoading = false
      }
    },
    async loadCheckins() {
      if (!this.activity) return
      try {
        const response = await fetch(`/api/activities/${this.activity.id}/checkins`)
        if (response.ok) {
          this.checkins = await response.json()
        }
      } catch (error) {
        console.error('加载签到记录失败:', error)
      }
    },
    async checkJoinStatus() {
      if (!this.activity || !this.isLoggedIn) return
      try {
        const response = await fetch(`/api/activities/${this.activity.id}/join-status`, {
          headers: {
            'X-User-ID': JSON.parse(localStorage.getItem('user')).id.toString()
          }
        })
        if (response.ok) {
          const data = await response.json()
          this.hasJoined = data.joined
          this.isPublisher = data.is_publisher
          this.checkedIn = data.checked_in
        }
      } catch (error) {
        console.error('检查报名状态失败:', error)
      }
    },
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
          this.checkinMessage = `签到成功！${data.activity_title}`
          this.checkinSuccess = true
          this.checkinToken = ''
          this.loadCheckins()
        } else {
          this.checkinMessage = data.message || '签到失败'
          this.checkinSuccess = false
        }
      } catch (error) {
        this.checkinMessage = '网络错误，签到失败'
        this.checkinSuccess = false
      } finally {
        this.checkinSubmitting = false
      }
    },
    loadComments() {
      if (this.activity && this.activity.comments) {
        this.comments = this.activity.comments
      } else {
        this.comments = []
      }
    },
    checkCollectionStatus() {
      if (!this.isLoggedIn || !this.activity) return
      
      apiGet('/user/collection')
        .then(response => response.json())
        .then(data => {
          this.isCollected = data.some(item => item.id === this.activity.id)
        })
        .catch(error => {
          console.error('检查收藏状态失败:', error)
        })
    },
    async collectActivity() {
      if (!this.isLoggedIn) {
        alert('请先登录')
        this.$router.push('/login')
        return
      }
      
      try {
        const endpoint = this.isCollected ? `/activities/${this.activity.id}/uncollect` : `/activities/${this.activity.id}/collect`
        const response = await apiPost(endpoint, {})
        
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.message || '操作失败')
        }
        
        this.isCollected = !this.isCollected
        alert(this.isCollected ? '收藏成功' : '取消收藏成功')
      } catch (error) {
        console.error('收藏操作失败:', error)
        alert(error.message || '操作失败，请稍后重试')
      }
    },
    async deleteActivity() {
      if (!this.isLoggedIn) {
        alert('请先登录')
        this.$router.push('/login')
        return
      }
      
      if (confirm('确定要删除这个活动吗？')) {
        try {
          const response = await apiDelete(`/activities/${this.activity.id}`)
          
          if (!response.ok) {
            const data = await response.json()
            throw new Error(data.message || '删除失败')
          }
          
          alert('删除成功')
          this.$router.push('/')
        } catch (error) {
          console.error('删除活动失败:', error)
          alert(error.message || '删除失败，请稍后重试')
        }
      }
    },
    async addComment() {
      if (!this.isLoggedIn) {
        alert('请先登录')
        this.$router.push('/login')
        return
      }
      
      if (this.commentContent.trim()) {
        try {
          const response = await apiPost(`/activities/${this.activity.id}/comment`, {
            content: this.commentContent
          })
          
          if (!response.ok) {
            const data = await response.json()
            throw new Error(data.message || '评论失败')
          }
          
          const newComment = {
            id: Date.now(),
            user: getCurrentUser().username,
            content: this.commentContent,
            time: new Date().toLocaleString('zh-CN')
          }
          this.comments.push(newComment)
          this.commentContent = ''
          alert('评论成功')
        } catch (error) {
          console.error('发表评论失败:', error)
          alert(error.message || '评论失败，请稍后重试')
        }
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
.activity-detail {
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
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
}

.loading {
  text-align: center;
  padding: 50px;
  color: #666;
}

.not-found {
  text-align: center;
  padding: 50px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.not-found p {
  margin-bottom: 20px;
}

.main h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.activity-image {
  width: 100%;
  max-height: 400px;
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 20px;
}

.activity-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.activity-info {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.activity-info p {
  margin-bottom: 5px;
}

.activity-description {
  margin-bottom: 30px;
}

.activity-description h3 {
  margin-bottom: 10px;
  color: #555;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.join-btn {
  background-color: #4CAF50;
  color: white;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.join-btn:hover {
  background-color: #45a049;
}

.collect-btn {
  background-color: #f0f0f0;
  color: #333;
}

.collect-btn:hover {
  background-color: #e0e0e0;
}

.collect-btn.collected {
  background-color: #ff9800;
  color: white;
}

.edit-btn {
  background-color: #2196F3;
  color: white;
  text-decoration: none;
  display: inline-block;
  text-align: center;
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

.comments {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.comments h3 {
  margin-bottom: 20px;
  color: #555;
}

.comment-form {
  margin-bottom: 30px;
}

.comment-form textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  height: 100px;
  margin-bottom: 10px;
}

.comment-list {
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.comment-item {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.comment-user {
  font-weight: bold;
  margin-bottom: 5px;
}

.comment-content {
  margin-bottom: 10px;
}

.comment-time {
  font-size: 12px;
  color: #999;
}

.btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

/* 签到区域样式 */
.checkin-section {
  margin-top: 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
}

.checkin-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px 20px;
}

.checkin-header h3 {
  margin: 0;
  font-size: 16px;
}

.checkin-body {
  padding: 20px;
  text-align: center;
}

.checkin-qrcode img {
  width: 200px;
  height: 200px;
  border: 2px solid #eee;
  border-radius: 8px;
  padding: 8px;
  background: white;
}

.token-text {
  margin-top: 10px;
  font-size: 13px;
  color: #666;
  word-break: break-all;
  font-family: monospace;
  background: #f5f5f5;
  padding: 6px 12px;
  border-radius: 4px;
  display: inline-block;
}

.checkin-hint {
  margin-top: 6px;
  font-size: 12px;
  color: #999;
}

.checkin-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 16px;
  flex-wrap: wrap;
}

.btn-qrcode {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
}

.btn-checkin {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
}

.checkin-input-area {
  margin-top: 16px;
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

.checkin-input {
  padding: 8px 12px;
  border: 2px solid #ddd;
  border-radius: 20px;
  font-size: 14px;
  width: 280px;
  max-width: 100%;
  outline: none;
  transition: border-color 0.3s;
}

.checkin-input:focus {
  border-color: #667eea;
}

.btn-primary {
  background: #667eea;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary:disabled {
  background: #ccc;
}

.success-text {
  color: #4CAF50;
  font-weight: bold;
  margin-top: 8px;
  width: 100%;
}

.error-text {
  color: #f44336;
  margin-top: 8px;
  width: 100%;
}

.checkin-records {
  border-top: 1px solid #eee;
  padding: 16px 20px;
}

.checkin-records h4 {
  margin-bottom: 12px;
  color: #333;
  font-size: 15px;
}

.checkin-list {
  max-height: 200px;
  overflow-y: auto;
}

.checkin-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid #f5f5f5;
  font-size: 13px;
}

.checkin-user {
  font-weight: bold;
  color: #333;
}

.checkin-time {
  color: #999;
}

.checked-in-badge {
  text-align: center;
  padding: 20px;
  font-size: 18px;
  font-weight: bold;
  color: #2e7d32;
}

.checked-in-badge .badge-icon {
  font-size: 28px;
  display: block;
  margin-bottom: 8px;
}

.btn-join-small {
  display: inline-block;
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  border: none;
  padding: 10px 30px;
  border-radius: 20px;
  text-decoration: none;
  font-size: 15px;
  margin-top: 10px;
}

.no-checkins {
  padding: 12px;
  text-align: center;
  color: #999;
  font-size: 13px;
  border-top: 1px solid #eee;
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
  
  .action-buttons {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>
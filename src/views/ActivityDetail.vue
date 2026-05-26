<template>
  <div class="activity-detail">
    <header class="header">
      <h1>校园活动详情</h1>
      <nav>
        <router-link to="/">首页</router-link>
        <router-link to="/registration/list" v-if="isLoggedIn">报名列表</router-link>
        <router-link to="/login" v-if="!isLoggedIn">登录</router-link>
        <router-link to="/profile" v-if="isLoggedIn">个人中心</router-link>
        <a v-if="isLoggedIn" @click="logout" class="logout-link">退出登录</a>
      </nav>
    </header>
    
    <main class="main">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="activity">
        <h2>{{ activity.name || activity.title }}</h2>
        <div class="activity-info">
          <p><strong>时间:</strong> {{ activity.date || activity.time }}</p>
          <p><strong>地点:</strong> {{ activity.location }}</p>
          <p><strong>主办方:</strong> {{ activity.organizer || activity.publisher }}</p>
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
      loading: false
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
      } catch (error) {
        console.error('加载活动详情失败:', error)
        this.activity = null
      } finally {
        this.loading = false
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
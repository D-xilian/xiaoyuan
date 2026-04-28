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
    loadActivity() {
      this.loading = true
      const activityId = this.$route.params.id
      
      setTimeout(() => {
        try {
          const storedActivities = localStorage.getItem('activities')
          if (storedActivities) {
            const activities = JSON.parse(storedActivities)
            this.activity = activities.find(a => a.id === activityId)
          }
        } catch (error) {
          console.error('加载活动详情失败:', error)
        } finally {
          this.loading = false
        }
      }, 500)
    },
    loadComments() {
      this.comments = [
        {
          id: 1,
          user: '张三',
          content: '期待这次活动！',
          time: '2026-08-20 10:00'
        },
        {
          id: 2,
          user: '李四',
          content: '我会准时参加的',
          time: '2026-08-21 09:00'
        }
      ]
    },
    collectActivity() {
      this.isCollected = !this.isCollected
      console.log('收藏活动', this.isCollected)
    },
    deleteActivity() {
      if (confirm('确定要删除这个活动吗？')) {
        try {
          const storedActivities = localStorage.getItem('activities')
          if (storedActivities) {
            let activities = JSON.parse(storedActivities)
            activities = activities.filter(a => a.id !== this.activity.id)
            localStorage.setItem('activities', JSON.stringify(activities))
          }
          this.$router.push('/')
        } catch (error) {
          console.error('删除活动失败:', error)
          alert('删除失败，请稍后重试')
        }
      }
    },
    addComment() {
      if (this.commentContent) {
        const newComment = {
          id: Date.now(),
          user: '当前用户',
          content: this.commentContent,
          time: new Date().toLocaleString()
        }
        this.comments.push(newComment)
        this.commentContent = ''
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
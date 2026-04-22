<template>
  <div class="home">
    <header class="header">
      <h1>校园活动发布平台</h1>
      <nav>
        <router-link to="/">首页</router-link>
        <router-link to="/login" v-if="!isLoggedIn">登录</router-link>
        <router-link to="/register" v-if="!isLoggedIn">注册</router-link>
        <router-link to="/profile" v-if="isLoggedIn">个人中心</router-link>
        <router-link to="/activity/create" v-if="isLoggedIn">发布活动</router-link>
        <a v-if="isLoggedIn" @click="logout" class="logout-link">退出登录</a>
      </nav>
    </header>
    
    <main class="main">
      <h2>最新活动</h2>
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else class="activity-list">
        <div class="activity-item" v-for="activity in activities" :key="activity.id">
          <h3>{{ activity.title }}</h3>
          <p>{{ activity.description }}</p>
          <p>时间: {{ activity.time }}</p>
          <p>地点: {{ activity.location }}</p>
          <p>发布者: {{ activity.publisher }}</p>
          <router-link :to="`/activity/${activity.id}`">查看详情</router-link>
        </div>
      </div>
      <div v-if="!loading && activities.length === 0" class="no-data">
        暂无活动
      </div>
    </main>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isLoggedIn: false,
      activities: [],
      loading: false,
      error: ''
    }
  },
  mounted() {
    this.checkLoginStatus()
    this.loadActivities()
  },
  methods: {
    checkLoginStatus() {
      const user = localStorage.getItem('user')
      this.isLoggedIn = !!user
    },
    async loadActivities() {
      this.loading = true
      this.error = ''
      try {
        const response = await fetch('http://localhost:5000/api/activities')
        if (response.ok) {
          this.activities = await response.json()
        } else {
          this.error = '加载活动失败'
        }
      } catch (err) {
        this.error = '网络错误，请稍后重试'
      } finally {
        this.loading = false
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

.main {
  padding: 20px;
}

.activity-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.activity-item {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.activity-item h3 {
  margin-bottom: 10px;
  color: #333;
}

.activity-item p {
  margin-bottom: 8px;
  color: #666;
}

.activity-item a {
  display: inline-block;
  margin-top: 10px;
  color: #4CAF50;
  text-decoration: none;
}

.logout-link {
  color: white;
  text-decoration: none;
  margin-left: 20px;
  cursor: pointer;
}

.logout-link:hover {
  text-decoration: underline;
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

.no-data {
  text-align: center;
  padding: 40px;
  color: #999;
}
</style>
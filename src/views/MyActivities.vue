<template>
  <div class="my-activities-page">
    <header class="header">
      <h1>校园活动发布平台</h1>
      <nav>
        <router-link to="/">首页</router-link>
        <router-link to="/activity/register">报名活动</router-link>
        <router-link to="/registration/list">报名列表</router-link>
        <router-link to="/profile">个人中心</router-link>
        <a @click="logout" class="logout-link">退出登录</a>
      </nav>
    </header>
    
    <main class="main">
      <div class="my-activities">
        <h2>我发布的活动</h2>
        
        <div v-if="loading" class="loading">加载中...</div>
        
        <div v-else-if="activities.length === 0" class="no-data">
          暂无发布的活动
        </div>
        
        <div v-else class="activity-list">
          <div class="activity-item" v-for="activity in activities" :key="activity.id">
            <h3>{{ activity.name || activity.title }}</h3>
            <p>{{ activity.content || activity.description }}</p>
            <p>时间: {{ activity.date || activity.time }}</p>
            <p>地点: {{ activity.location }}</p>
            <p>主办方: {{ activity.organizer || '未知' }}</p>
            <div class="activity-actions">
              <router-link :to="`/activity/${activity.id}`" class="btn">查看详情</router-link>
              <router-link :to="`/activity/${activity.id}/edit`" class="btn edit-btn">编辑</router-link>
              <button class="btn delete-btn" @click="deleteActivity(activity.id)">删除</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  data() {
    return {
      activities: [],
      loading: false
    }
  },
  mounted() {
    this.loadActivities()
  },
  methods: {
    loadActivities() {
      this.loading = true
      setTimeout(() => {
        try {
          const storedActivities = localStorage.getItem('activities')
          this.activities = storedActivities ? JSON.parse(storedActivities) : []
        } catch (error) {
          console.error('加载活动失败:', error)
          this.activities = []
        } finally {
          this.loading = false
        }
      }, 500)
    },
    deleteActivity(id) {
      if (confirm('确定要删除这个活动吗？')) {
        try {
          const storedActivities = localStorage.getItem('activities')
          if (storedActivities) {
            let activities = JSON.parse(storedActivities)
            activities = activities.filter(activity => activity.id !== id)
            localStorage.setItem('activities', JSON.stringify(activities))
            this.activities = activities
          }
        } catch (error) {
          console.error('删除活动失败:', error)
          alert('删除失败，请稍后重试')
        }
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
.my-activities-page {
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
}

.my-activities {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.my-activities h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.loading {
  text-align: center;
  padding: 50px;
  color: #666;
}

.no-data {
  text-align: center;
  padding: 50px;
  color: #999;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.activity-item {
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  transition: box-shadow 0.3s;
}

.activity-item:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.activity-item h3 {
  margin-bottom: 10px;
  color: #333;
}

.activity-item p {
  margin-bottom: 8px;
  color: #666;
}

.activity-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
  flex-wrap: wrap;
}

.btn {
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  font-size: 14px;
  transition: background-color 0.3s;
}

.btn:hover {
  background-color: #45a049;
}

.edit-btn {
  background-color: #2196F3;
}

.edit-btn:hover {
  background-color: #0b7dda;
}

.delete-btn {
  background-color: #f44336;
}

.delete-btn:hover {
  background-color: #d32f2f;
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
  
  .activity-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    text-align: center;
  }
}
</style>
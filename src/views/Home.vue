<template>
  <div class="home">
    <header class="header">
      <h1>校园活动发布平台</h1>
      <nav>
        <router-link to="/">首页</router-link>
        <router-link to="/login" v-if="!isLoggedIn">登录</router-link>
        <router-link to="/register" v-if="!isLoggedIn">注册</router-link>
        <router-link to="/profile" v-if="isLoggedIn">个人中心</router-link>
        <a v-if="isLoggedIn" @click="logout" class="logout-link">退出登录</a>
      </nav>
    </header>
    
    <main class="main">
      <!-- 活动发布表单 -->
      <div class="form-section" v-if="isLoggedIn">
        <h2>{{ editingActivity ? '修改活动' : '发布活动' }}</h2>
        <form @submit.prevent="submitActivity">
          <div class="form-group">
            <label for="activityName">活动名称 *</label>
            <input type="text" id="activityName" v-model="form.name" required maxlength="50">
            <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
          </div>
          <div class="form-group">
            <label for="activityDate">活动日期 *</label>
            <input type="date" id="activityDate" v-model="form.date" required>
            <span v-if="errors.date" class="error-message">{{ errors.date }}</span>
          </div>
          <div class="form-group">
            <label for="activityLocation">活动地点 *</label>
            <input type="text" id="activityLocation" v-model="form.location" required maxlength="100">
            <span v-if="errors.location" class="error-message">{{ errors.location }}</span>
          </div>
          <div class="form-group">
            <label for="activityContent">活动内容 *</label>
            <textarea id="activityContent" v-model="form.content" required></textarea>
            <span v-if="errors.content" class="error-message">{{ errors.content }}</span>
          </div>
          <div class="form-group">
            <label for="activityOrganizer">活动主办方 *</label>
            <input type="text" id="activityOrganizer" v-model="form.organizer" required maxlength="50">
            <span v-if="errors.organizer" class="error-message">{{ errors.organizer }}</span>
          </div>
          <div class="form-buttons">
            <button type="button" class="btn btn-cancel" v-if="editingActivity" @click="cancelEdit">取消编辑</button>
            <button type="submit" class="btn" :disabled="submitting">{{ submitting ? '提交中...' : (editingActivity ? '保存修改' : '发布') }}</button>
          </div>
        </form>
      </div>
      
      <!-- 已发布活动列表 -->
      <div class="activities-section">
        <h2>已发布活动</h2>
        <div v-if="loading" class="loading">加载中...</div>
        <div v-else-if="error" class="error">{{ error }}</div>
        <div v-else class="activity-list">
          <div class="activity-item" v-for="activity in activities" :key="activity.id">
            <h3>{{ activity.name }}</h3>
            <p>日期: {{ activity.date }}</p>
            <p>地点: {{ activity.location }}</p>
            <p>内容: {{ truncateContent(activity.content) }}</p>
            <p>主办方: {{ activity.organizer }}</p>
            <p>发布时间: {{ activity.createdAt }}</p>
            <div class="activity-actions">
              <button class="btn btn-edit" @click="editActivity(activity)">修改</button>
            </div>
          </div>
        </div>
        <div v-if="!loading && activities.length === 0" class="no-data">
          暂无活动
        </div>
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
      error: '',
      form: {
        name: '',
        date: '',
        location: '',
        content: '',
        organizer: ''
      },
      errors: {
        name: '',
        date: '',
        location: '',
        content: '',
        organizer: ''
      },
      submitting: false,
      editingActivity: null
    }
  },
  watch: {
    editingActivity(newVal) {
      // 当编辑完成或取消时，清除URL中的editId参数
      if (!newVal && this.$route.query.editId) {
        this.$router.replace({ query: {} })
      }
    }
  },
  mounted() {
    this.checkLoginStatus()
    this.loadActivities()
    
    // 检查是否从"我发布的活动"页面跳转回来进行编辑
    const editId = this.$route.query.editId
    if (editId) {
      this.loadActivityForEdit(editId)
    }
  },
  methods: {
    checkLoginStatus() {
      const user = localStorage.getItem('user')
      this.isLoggedIn = !!user
    },
    loadActivities() {
      this.loading = true
      this.error = ''
      try {
        // 从本地存储加载活动数据
        const storedActivities = localStorage.getItem('activities')
        if (storedActivities) {
          this.activities = JSON.parse(storedActivities).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        } else {
          this.activities = []
        }
      } catch (err) {
        this.error = '加载活动失败'
        this.activities = []
      } finally {
        this.loading = false
      }
    },
    loadActivityForEdit(activityId) {
      const activity = this.activities.find(a => a.id === activityId)
      if (activity) {
        this.editActivity(activity)
        // 滚动到表单位置
        this.$nextTick(() => {
          const formSection = document.querySelector('.form-section')
          if (formSection) {
            formSection.scrollIntoView({ behavior: 'smooth' })
          }
        })
      }
    },
    validateForm() {
      let isValid = true
      this.errors = {
        name: '',
        date: '',
        location: '',
        content: '',
        organizer: ''
      }
      
      if (!this.form.name.trim()) {
        this.errors.name = '活动名称不能为空'
        isValid = false
      } else if (this.form.name.length > 50) {
        this.errors.name = '活动名称不能超过50个字符'
        isValid = false
      }
      
      if (!this.form.date) {
        this.errors.date = '活动日期不能为空'
        isValid = false
      } else if (new Date(this.form.date) < new Date().setHours(0, 0, 0, 0)) {
        this.errors.date = '活动日期必须是未来日期'
        isValid = false
      }
      
      if (!this.form.location.trim()) {
        this.errors.location = '活动地点不能为空'
        isValid = false
      } else if (this.form.location.length > 100) {
        this.errors.location = '活动地点不能超过100个字符'
        isValid = false
      }
      
      if (!this.form.content.trim()) {
        this.errors.content = '活动内容不能为空'
        isValid = false
      }
      
      if (!this.form.organizer.trim()) {
        this.errors.organizer = '活动主办方不能为空'
        isValid = false
      } else if (this.form.organizer.length > 50) {
        this.errors.organizer = '活动主办方不能超过50个字符'
        isValid = false
      }
      
      return isValid
    },
    submitActivity() {
      if (!this.validateForm()) {
        return
      }
      
      this.submitting = true
      
      setTimeout(() => {
        const userStr = localStorage.getItem('user')
        const user = userStr ? JSON.parse(userStr) : null
        
        if (this.editingActivity) {
          // 修改活动
          const index = this.activities.findIndex(activity => activity.id === this.editingActivity.id)
          if (index !== -1) {
            this.activities[index] = {
              ...this.form,
              id: this.editingActivity.id,
              createdAt: this.editingActivity.createdAt,
              publisherId: this.editingActivity.publisherId,
              publisherName: this.editingActivity.publisherName
            }
          }
          this.editingActivity = null
        } else {
          // 发布新活动
          const newActivity = {
            ...this.form,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            publisherId: user ? user.id : null,
            publisherName: user ? user.username : '匿名用户'
          }
          this.activities.unshift(newActivity)
        }
        
        // 保存到本地存储
        localStorage.setItem('activities', JSON.stringify(this.activities))
        
        // 重置表单
        this.resetForm()
        this.submitting = false
      }, 500)
    },
    editActivity(activity) {
      this.editingActivity = activity
      this.form = {
        name: activity.name,
        date: activity.date,
        location: activity.location,
        content: activity.content,
        organizer: activity.organizer
      }
    },
    cancelEdit() {
      this.resetForm()
    },
    resetForm() {
      this.form = {
        name: '',
        date: '',
        location: '',
        content: '',
        organizer: ''
      }
      this.errors = {
        name: '',
        date: '',
        location: '',
        content: '',
        organizer: ''
      }
      this.editingActivity = null
    },
    truncateContent(content) {
      return content.length > 50 ? content.substring(0, 50) + '...' : content
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
  max-width: 1200px;
  margin: 0 auto;
}

/* 表单部分样式 */
.form-section {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 30px;
}

.form-section h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #666;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group textarea {
  height: 150px;
  resize: vertical;
}

.error-message {
  color: #f44336;
  font-size: 12px;
  margin-top: 5px;
  display: block;
}

.form-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.form-buttons .btn {
  flex: 1;
}

.btn {
  width: 100%;
  padding: 12px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.btn:hover {
  background-color: #45a049;
}

.btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.btn-cancel {
  background-color: #9e9e9e;
}

.btn-cancel:hover {
  background-color: #757575;
}

/* 活动列表部分样式 */
.activities-section {
  margin-top: 30px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.section-header h2 {
  margin: 0;
  color: #333;
}

.search-box {
  flex: 1;
  max-width: 500px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-input {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 14px;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.search-count {
  color: #666;
  font-size: 14px;
  white-space: nowrap;
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
  transition: transform 0.3s, box-shadow 0.3s;
}

.activity-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.activity-item h3 {
  margin-bottom: 10px;
  color: #333;
  font-size: 18px;
}

.activity-item p {
  margin-bottom: 8px;
  color: #666;
  font-size: 14px;
}

.activity-actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

.btn-edit {
  background-color: #2196F3;
  padding: 8px 16px;
  font-size: 14px;
  width: auto;
}

.btn-edit:hover {
  background-color: #0b7dda;
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

/* 响应式设计 */
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
  
  nav a {
    margin-left: 0;
  }
  
  .main {
    padding: 10px;
  }
  
  .activity-list {
    grid-template-columns: 1fr;
  }
}
</style>
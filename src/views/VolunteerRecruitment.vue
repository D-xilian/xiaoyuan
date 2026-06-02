<template>
  <div class="volunteer-recruitment">
    <header class="header">
      <div class="header-content">
        <h1>志愿者招募</h1>
        <p class="subtitle">用行动传递温暖，让爱心点亮未来</p>
      </div>
      <nav class="nav-bar">
        <router-link to="/">首页</router-link>
        <router-link to="/activity/create" v-if="isLoggedIn">创建活动</router-link>
        <router-link to="/my-activities" v-if="isLoggedIn">我发布的活动</router-link>
        <router-link to="/my-join" v-if="isLoggedIn">我的报名</router-link>
        <router-link to="/login" v-if="!isLoggedIn">登录</router-link>
        <notification-bell v-if="isLoggedIn" />
        <router-link to="/profile" v-if="isLoggedIn">个人中心</router-link>
        <a v-if="isLoggedIn" @click="logout" class="logout-link">退出登录</a>
      </nav>
    </header>
    
    <main class="main-content">
      <div class="form-container">
        <div class="form-card">
          <div class="card-header">
            <h3>志愿者报名</h3>
            <p>请填写以下信息完成报名</p>
          </div>
          
          <!-- 成功提示 -->
          <div v-if="submitSuccess" class="success-alert">
            <div class="success-icon-wrapper">
              <span class="success-icon">✓</span>
            </div>
            <div class="success-content">
              <h4>报名成功！</h4>
              <p>感谢您的志愿精神，我们会尽快与您联系。</p>
            </div>
            <button class="close-btn" @click="resetForm">×</button>
          </div>
          
          <form @submit.prevent="submitForm" class="volunteer-form" :class="{ submitted: submitSuccess }">
            <!-- 个人信息区域 -->
            <div class="form-section">
              <div class="section-title">
                <span class="section-icon">👤</span>
                <h4>个人信息</h4>
              </div>
              
              <div class="form-grid">
                <div class="form-group">
                  <label for="name">
                    姓名 <span class="required">*</span>
                  </label>
                  <input 
                    type="text" 
                    id="name" 
                    v-model="form.name" 
                    :class="{ error: errors.name }"
                    placeholder="请输入您的姓名"
                    maxlength="50"
                    @blur="validateField('name')"
                    @focus="clearError('name')"
                  >
                  <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
                </div>
                
                <div class="form-group">
                  <label>
                    性别 <span class="required">*</span>
                  </label>
                  <div class="radio-group">
                    <label class="radio-label">
                      <input type="radio" name="gender" v-model="form.gender" value="男" @change="validateField('gender')">
                      <span class="radio-custom"></span>
                      男
                    </label>
                    <label class="radio-label">
                      <input type="radio" name="gender" v-model="form.gender" value="女" @change="validateField('gender')">
                      <span class="radio-custom"></span>
                      女
                    </label>
                  </div>
                  <span v-if="errors.gender" class="error-message">{{ errors.gender }}</span>
                </div>
                
                <div class="form-group">
                  <label for="studentId">
                    学号 <span class="required">*</span>
                  </label>
                  <input 
                    type="number" 
                    id="studentId" 
                    v-model="form.studentId" 
                    :class="{ error: errors.studentId }"
                    placeholder="请输入您的学号"
                    maxlength="20"
                    @blur="validateField('studentId')"
                    @focus="clearError('studentId')"
                  >
                  <span v-if="errors.studentId" class="error-message">{{ errors.studentId }}</span>
                </div>
                
                <div class="form-group">
                  <label for="department">
                    院系 <span class="required">*</span>
                  </label>
                  <select 
                    id="department" 
                    v-model="form.department" 
                    :class="{ error: errors.department }"
                    @change="validateField('department')"
                  >
                    <option value="">请选择院系</option>
                    <option v-for="dept in departments" :key="dept" :value="dept">{{ dept }}</option>
                  </select>
                  <span v-if="errors.department" class="error-message">{{ errors.department }}</span>
                </div>
              </div>
            </div>
            
            <!-- 活动选择区域 -->
            <div class="form-section">
              <div class="section-title">
                <span class="section-icon">🎯</span>
                <h4>选择活动</h4>
                <small class="section-hint">请选择您要报名的志愿活动（限选一项）</small>
              </div>
              
              <div class="activity-grid">
                <label 
                  v-for="activity in activities" 
                  :key="activity.id" 
                  class="activity-card"
                  :class="{ selected: form.activity === activity.id, error: errors.activity }"
                >
                  <input 
                    type="radio" 
                    name="activity" 
                    :value="activity.id" 
                    v-model="form.activity"
                    @change="validateField('activity')"
                  >
                  <div class="activity-content">
                    <h5>{{ activity.title }}</h5>
                    <p class="activity-desc">{{ activity.description }}</p>
                    <div class="activity-meta">
                      <span class="meta-item">📅 {{ activity.date }}</span>
                      <span class="meta-item">📍 {{ activity.location }}</span>
                    </div>
                    <span class="activity-tags">
                      <span v-for="tag in activity.tags" :key="tag" class="tag">{{ tag }}</span>
                    </span>
                  </div>
                </label>
              </div>
              <span v-if="errors.activity" class="error-message activity-error">{{ errors.activity }}</span>
            </div>
            
            <!-- 表单操作按钮 -->
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" @click="resetForm">
                <span class="btn-icon">↺</span>
                重置
              </button>
              <button type="submit" class="btn btn-primary" :disabled="submitting">
                <span v-if="submitting" class="btn-spinner"></span>
                <span class="btn-icon">✦</span>
                {{ submitting ? '提交中...' : '提交报名' }}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <footer class="footer">
        <p>&copy; 2024 校园志愿者服务平台 版权所有</p>
      </footer>
    </main>
  </div>
</template>

<script>
import { apiGet, apiPost, isLoggedIn, getCurrentUser } from '../utils/api'
import NotificationBell from '../components/NotificationBell.vue'

export default {
  name: 'VolunteerRecruitment',
  components: {
    NotificationBell
  },
  data() {
    return {
      isLoggedIn: false,
      form: {
        name: '',
        gender: '',
        studentId: '',
        department: '',
        activity: null
      },
      errors: {
        name: '',
        gender: '',
        studentId: '',
        department: '',
        activity: ''
      },
      departments: [
        '计算机学院',
        '电子信息工程学院',
        '经济管理学院',
        '文学院',
        '法学院',
        '外国语学院',
        '艺术学院',
        '理学院',
        '生命科学学院',
        '化学工程学院',
        '机械工程学院',
        '建筑学院',
        '医学院',
        '教育学院',
        '体育学院'
      ],
      activities: [],
      submitting: false,
      submitSuccess: false
    }
  },
  mounted() {
    this.checkLoginStatus()
    this.loadActivities()
  },
  methods: {
    checkLoginStatus() {
      this.isLoggedIn = isLoggedIn()
      if (!this.isLoggedIn) {
        this.$router.push('/login')
      }
    },
    async loadActivities() {
      try {
        const response = await apiGet('/activities')
        if (!response.ok) {
          if (response.status === 401) {
            this.$router.push('/login')
            return
          }
          throw new Error('获取活动列表失败')
        }
        const data = await response.json()
        this.activities = data.map(act => ({
          id: act.id,
          title: act.title,
          description: act.description,
          date: act.date,
          location: act.location,
          tags: act.tags ? act.tags.split(',').map(t => t.trim()) : []
        }))
      } catch (error) {
        console.error('加载活动列表失败:', error)
        this.activities = [
          { id: 1, title: '社区关爱老人活动', description: '前往社区敬老院，为老人提供陪伴和帮助', date: '2024-01-15', location: '幸福社区敬老院', tags: ['关爱', '社区'] },
          { id: 2, title: '校园环保志愿者', description: '参与校园环境整治，维护美丽校园', date: '2024-01-18', location: '校园各区域', tags: ['环保', '校园'] },
          { id: 3, title: '图书馆整理志愿者', description: '协助图书馆进行书籍整理和分类工作', date: '2024-01-20', location: '校图书馆', tags: ['图书', '整理'] },
          { id: 4, title: '公益义卖活动', description: '参与校园公益义卖，为贫困儿童筹集善款', date: '2024-01-22', location: '校园广场', tags: ['义卖', '公益'] }
        ]
      }
    },
    validateField(field) {
      switch(field) {
        case 'name':
          if (!this.form.name.trim()) {
            this.errors.name = '请输入您的姓名'
          } else if (this.form.name.length > 50) {
            this.errors.name = '姓名不能超过50个字符'
          } else {
            this.errors.name = ''
          }
          break
        case 'gender':
          if (!this.form.gender) {
            this.errors.gender = '请选择您的性别'
          } else {
            this.errors.gender = ''
          }
          break
        case 'studentId':
          if (!this.form.studentId) {
            this.errors.studentId = '请输入您的学号'
          } else if (!/^\d{8,12}$/.test(this.form.studentId.toString())) {
            this.errors.studentId = '学号格式不正确（应为8-12位数字）'
          } else {
            this.errors.studentId = ''
          }
          break
        case 'department':
          if (!this.form.department) {
            this.errors.department = '请选择您的院系'
          } else {
            this.errors.department = ''
          }
          break
        case 'activity':
          if (!this.form.activity) {
            this.errors.activity = '请选择一个志愿活动'
          } else {
            this.errors.activity = ''
          }
          break
      }
    },
    clearError(field) {
      this.errors[field] = ''
    },
    validateForm() {
      let isValid = true
      this.errors = {
        name: '',
        gender: '',
        studentId: '',
        department: '',
        activity: ''
      }
      
      if (!this.form.name.trim()) {
        this.errors.name = '请输入您的姓名'
        isValid = false
      } else if (this.form.name.length > 50) {
        this.errors.name = '姓名不能超过50个字符'
        isValid = false
      }
      
      if (!this.form.gender) {
        this.errors.gender = '请选择您的性别'
        isValid = false
      }
      
      if (!this.form.studentId) {
        this.errors.studentId = '请输入您的学号'
        isValid = false
      } else if (!/^\d{8,12}$/.test(this.form.studentId.toString())) {
        this.errors.studentId = '学号格式不正确（应为8-12位数字）'
        isValid = false
      }
      
      if (!this.form.department) {
        this.errors.department = '请选择您的院系'
        isValid = false
      }
      
      if (!this.form.activity) {
        this.errors.activity = '请选择一个志愿活动'
        isValid = false
      }
      
      return isValid
    },
    async submitForm() {
      if (this.submitting) return
      
      if (!this.validateForm()) {
        return
      }
      
      this.submitting = true
      
      try {
        const response = await apiPost(`/activities/${this.form.activity}/join`, {
          name: this.form.name,
          gender: this.form.gender,
          studentId: this.form.studentId.toString(),
          department: this.form.department
        })
        
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.message || '报名失败')
        }
        
        this.submitSuccess = true
        
      } catch (error) {
        console.error('报名提交失败:', error)
        alert(error.message || '报名提交失败，请稍后重试')
      } finally {
        this.submitting = false
      }
    },
    resetForm() {
      this.form = {
        name: '',
        gender: '',
        studentId: '',
        department: '',
        activity: null
      }
      this.errors = {}
      this.submitSuccess = false
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
.volunteer-recruitment {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4efe9 100%);
}

.header {
  background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
  color: white;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(46, 204, 113, 0.3);
}

.header-content {
  text-align: center;
  margin-bottom: 15px;
}

.header-content h1 {
  font-size: 32px;
  margin-bottom: 8px;
  font-weight: 700;
}

.subtitle {
  font-size: 16px;
  opacity: 0.9;
}

.nav-bar {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.nav-bar a, .logout-link {
  color: white;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.nav-bar a:hover, .logout-link:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.main-content {
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.form-container {
  display: flex;
  justify-content: center;
}

.form-card {
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 900px;
  overflow: hidden;
}

.card-header {
  background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
  color: white;
  padding: 24px 30px;
}

.card-header h3 {
  font-size: 22px;
  margin-bottom: 4px;
}

.card-header p {
  opacity: 0.9;
  font-size: 14px;
}

.success-alert {
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
  border-left: 4px solid #28a745;
  margin: 20px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
  border-radius: 8px;
}

.success-icon-wrapper {
  width: 50px;
  height: 50px;
  background-color: #28a745;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.success-icon {
  color: white;
  font-size: 28px;
  font-weight: bold;
}

.success-content h4 {
  color: #155724;
  margin-bottom: 4px;
}

.success-content p {
  color: #155724;
  opacity: 0.8;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 15px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #155724;
  opacity: 0.6;
  transition: opacity 0.3s;
}

.close-btn:hover {
  opacity: 1;
}

.volunteer-form {
  padding: 30px;
}

.volunteer-form.submitted {
  pointer-events: none;
  opacity: 0.7;
}

.form-section {
  margin-bottom: 30px;
  padding-bottom: 25px;
  border-bottom: 1px solid #eee;
}

.form-section:last-of-type {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.section-icon {
  font-size: 20px;
}

.section-title h4 {
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.section-hint {
  margin-left: auto;
  font-size: 12px;
  color: #999;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.form-group {
  position: relative;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
  font-size: 14px;
}

.required {
  color: #e74c3c;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  background-color: #fafafa;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #2ecc71;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(46, 204, 113, 0.1);
}

.form-group input.error,
.form-group select.error {
  border-color: #e74c3c;
}

.radio-group {
  display: flex;
  gap: 25px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 10px 15px;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
  transition: all 0.3s ease;
}

.radio-label:hover {
  border-color: #2ecc71;
  background-color: rgba(46, 204, 113, 0.05);
}

.radio-label input[type="radio"] {
  display: none;
}

.radio-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #ccc;
  border-radius: 50%;
  position: relative;
  transition: all 0.3s ease;
}

.radio-label input[type="radio"]:checked + .radio-custom {
  border-color: #2ecc71;
  background-color: #2ecc71;
}

.radio-label input[type="radio"]:checked + .radio-custom::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background-color: white;
  border-radius: 50%;
}

.error-message {
  color: #e74c3c;
  font-size: 12px;
  margin-top: 6px;
  display: block;
}

.activity-error {
  margin-top: 10px;
}

.activity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 15px;
}

.activity-card {
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.activity-card:hover {
  border-color: #2ecc71;
  box-shadow: 0 4px 15px rgba(46, 204, 113, 0.15);
}

.activity-card.selected {
  border-color: #2ecc71;
  background-color: rgba(46, 204, 113, 0.05);
}

.activity-card.error {
  border-color: #e74c3c;
}

.activity-card input[type="radio"] {
  display: none;
}

.activity-content h5 {
  color: #333;
  margin-bottom: 8px;
  font-size: 15px;
}

.activity-desc {
  color: #666;
  font-size: 13px;
  margin-bottom: 12px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.activity-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 12px;
}

.meta-item {
  font-size: 12px;
  color: #888;
}

.activity-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  font-size: 11px;
  padding: 3px 8px;
  background-color: #f0f0f0;
  border-radius: 10px;
  color: #666;
}

.activity-card.selected .tag {
  background-color: rgba(46, 204, 113, 0.2);
  color: #27ae60;
}

.form-actions {
  display: flex;
  gap: 15px;
  margin-top: 30px;
  padding-top: 25px;
  border-top: 1px solid #eee;
}

.btn {
  padding: 14px 28px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.btn-icon {
  font-size: 16px;
}

.btn-primary {
  background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
  color: white;
  flex: 1;
  box-shadow: 0 4px 15px rgba(46, 204, 113, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(46, 204, 113, 0.4);
}

.btn-primary:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #666;
  border: 1px solid #ddd;
}

.btn-secondary:hover {
  background-color: #e8e8e8;
}

.btn-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.footer {
  text-align: center;
  padding: 30px;
  color: #999;
  font-size: 14px;
}

@media (max-width: 768px) {
  .header-content h1 {
    font-size: 24px;
  }
  
  .subtitle {
    font-size: 14px;
  }
  
  .nav-bar {
    gap: 10px;
  }
  
  .nav-bar a, .logout-link {
    padding: 6px 12px;
    font-size: 14px;
  }
  
  .hero-section {
    padding: 25px 20px;
  }
  
  .hero-content h2 {
    font-size: 22px;
  }
  
  .stats-row {
    gap: 30px;
  }
  
  .stat-number {
    font-size: 28px;
  }
  
  .form-card {
    margin: 0 10px;
  }
  
  .volunteer-form {
    padding: 20px;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .radio-group {
    flex-direction: column;
    gap: 10px;
  }
  
  .activity-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .header-content h1 {
    font-size: 20px;
  }
  
  .hero-content h2 {
    font-size: 18px;
  }
  
  .stats-row {
    flex-direction: column;
    gap: 15px;
  }
}
</style>
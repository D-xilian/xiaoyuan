<template>
  <div class="registration-page">
    
    <main class="main">
      <div class="registration-container">
        <h2>{{ activityName || '活动报名' }}</h2>
        
        <!-- 成功提示 -->
        <div v-if="submitSuccess" class="success-message">
          <span class="success-icon">✓</span>
          <p>报名成功！您的报名信息已提交。</p>
        </div>
        
        <form @submit.prevent="submitForm" class="registration-form" :class="{ submitted: submitSuccess }">
          <div class="form-section">
            <h3>基本信息</h3>
            
            <div class="form-group">
              <label for="name">姓名 <span class="required">*</span></label>
              <input 
                type="text" 
                id="name" 
                v-model="form.name" 
                :class="{ error: errors.name }"
                placeholder="请输入您的姓名"
                maxlength="50"
              >
              <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
            </div>
            
            <div class="form-group">
              <label for="phone">联系方式 <span class="required">*</span></label>
              <input 
                type="tel" 
                id="phone" 
                v-model="form.phone" 
                :class="{ error: errors.phone }"
                placeholder="请输入您的手机号码"
                maxlength="11"
              >
              <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
            </div>
            
            <div class="form-group">
              <label for="email">邮箱</label>
              <input 
                type="email" 
                id="email" 
                v-model="form.email" 
                :class="{ error: errors.email }"
                placeholder="请输入您的邮箱（选填）"
                maxlength="100"
              >
              <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
            </div>
          </div>
          
          <div class="form-section">
            <h3>报名信息</h3>
            
            <div class="form-group">
              <label for="category">活动类型</label>
              <select id="category" v-model="selectedCategory" :disabled="!!activityId">
                <option value="">请选择活动类型</option>
                <option value="sports">体育运动</option>
                <option value="academic">学术科技</option>
                <option value="art">文化艺术</option>
                <option value="social">社会实践</option>
                <option value="entertainment">娱乐休闲</option>
                <option value="other">其他</option>
              </select>
            </div>

            <div class="form-group">
              <label for="activity">报名项目 <span class="required">*</span></label>
              <select id="activity" v-model="form.activity" :class="{ error: errors.activity }" :disabled="!!activityId">
                <option :value="null">请选择活动</option>
                <option v-for="act in filteredActivities" :key="act.id" :value="act.id">
                  {{ act.title }} ({{ getCategoryText(act.category) }})
                </option>
              </select>
              <span v-if="errors.activity" class="error-message">{{ errors.activity }}</span>
              <small v-if="filteredActivities.length === 0 && selectedCategory" style="color: #999;">该类型下没有活动</small>
              <small v-else-if="filteredActivities.length === 0" style="color: #999;">暂无可用活动</small>
              <small v-else style="color: #999;">共 {{ filteredActivities.length }} 个活动</small>
            </div>
            
            <div class="form-group">
              <label for="department">所在院系</label>
              <input 
                type="text" 
                id="department" 
                v-model="form.department" 
                placeholder="请输入您的院系（选填）"
                maxlength="50"
              >
            </div>
            
            <div class="form-group">
              <label for="studentId">学号</label>
              <input 
                type="text" 
                id="studentId" 
                v-model="form.studentId" 
                placeholder="请输入您的学号（选填）"
                maxlength="20"
              >
            </div>
          </div>
          
          <div class="form-section">
            <h3>个人简介</h3>
            
            <div class="form-group">
              <label for="introduction">个人简介 <span class="required">*</span></label>
              <textarea 
                id="introduction" 
                v-model="form.introduction" 
                :class="{ error: errors.introduction }"
                placeholder="请简要介绍您自己，包括相关经历、特长等（至少50字）"
                rows="5"
              ></textarea>
              <span class="char-count">{{ form.introduction.length }}/500</span>
              <span v-if="errors.introduction" class="error-message">{{ errors.introduction }}</span>
            </div>
          </div>
          
          <div class="form-section">
            <h3>其他信息</h3>
            
            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="form.agreeTerms">
                <span>我已阅读并同意活动相关条款和隐私政策</span>
              </label>
              <span v-if="errors.agreeTerms" class="error-message">{{ errors.agreeTerms }}</span>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="submitting">
              <span v-if="submitting" class="spinner"></span>
              {{ submitting ? '提交中...' : '提交报名' }}
            </button>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script>
import { apiGet, apiPost, isLoggedIn, getCurrentUser } from '../utils/api'
import NotificationBell from '../components/NotificationBell.vue'

export default {
  name: 'ActivityRegistration',
  components: {
    NotificationBell
  },
  data() {
    return {
      isLoggedIn: false,
      activityName: '',
      activityId: null,
      selectedCategory: '',
      form: {
        name: '',
        phone: '',
        email: '',
        activity: null,
        department: '',
        studentId: '',
        introduction: '',
        agreeTerms: false
      },
      errors: {
        name: '',
        phone: '',
        email: '',
        activity: '',
        introduction: '',
        agreeTerms: ''
      },
      availableActivities: [],
      submitting: false,
      submitSuccess: false,
      submittedOnce: false
    }
  },
  computed: {
    filteredActivities() {
      if (!this.selectedCategory) {
        return this.availableActivities
      }
      return this.availableActivities.filter(act => act.category === this.selectedCategory)
    }
  },
  mounted() {
    this.checkLoginStatus()
    this.loadAvailableActivities()
    this.loadFormData()
    
    const activityId = this.$route.params.activityId
    if (activityId) {
      this.activityId = activityId
      this.form.activity = parseInt(activityId)
    }
  },
  methods: {
    getCategoryText(category) {
      const categoryMap = {
        'sports': '体育运动',
        'academic': '学术科技',
        'art': '文化艺术',
        'social': '社会实践',
        'entertainment': '娱乐休闲',
        'other': '其他'
      }
      return categoryMap[category] || '其他'
    },
    checkLoginStatus() {
      this.isLoggedIn = isLoggedIn()
      if (!this.isLoggedIn) {
        this.$router.push('/login')
      }
    },
    async loadAvailableActivities() {
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
        this.availableActivities = data
        
        if (this.form.activity) {
          const activity = this.availableActivities.find(a => a.id === parseInt(this.form.activity))
          if (activity) {
            this.activityName = activity.title
            this.selectedCategory = activity.category || ''
          }
        }
      } catch (error) {
        console.error('加载活动列表失败:', error)
        this.availableActivities = []
      }
    },
    loadFormData() {
      const storedForm = localStorage.getItem('registrationForm')
      if (storedForm && !this.submittedOnce) {
        const savedForm = JSON.parse(storedForm)
        Object.keys(savedForm).forEach(key => {
          if (this.form[key] !== undefined && !this.form[key]) {
            this.form[key] = savedForm[key]
          }
        })
      }
    },
    saveFormData() {
      localStorage.setItem('registrationForm', JSON.stringify(this.form))
    },
    validateForm() {
      let isValid = true
      this.errors = {
        name: '',
        phone: '',
        email: '',
        activity: '',
        introduction: '',
        agreeTerms: ''
      }
      
      if (!this.form.name.trim()) {
        this.errors.name = '请输入您的姓名'
        isValid = false
      } else if (this.form.name.length > 50) {
        this.errors.name = '姓名不能超过50个字符'
        isValid = false
      }
      
      if (!this.form.phone.trim()) {
        this.errors.phone = '请输入您的手机号码'
        isValid = false
      } else if (!/^1[3-9]\d{9}$/.test(this.form.phone)) {
        this.errors.phone = '请输入有效的手机号码'
        isValid = false
      }
      
      if (this.form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email)) {
        this.errors.email = '请输入有效的邮箱地址'
        isValid = false
      }
      
      if (!this.form.activity) {
        this.errors.activity = '请选择报名项目'
        isValid = false
      }
      
      if (!this.form.introduction.trim()) {
        this.errors.introduction = '请填写个人简介'
        isValid = false
      } else if (this.form.introduction.length < 50) {
        this.errors.introduction = '个人简介至少需要50字'
        isValid = false
      } else if (this.form.introduction.length > 500) {
        this.errors.introduction = '个人简介不能超过500字'
        isValid = false
      }
      
      if (!this.form.agreeTerms) {
        this.errors.agreeTerms = '请同意活动条款和隐私政策'
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
          phone: this.form.phone,
          email: this.form.email,
          department: this.form.department,
          studentId: this.form.studentId,
          introduction: this.form.introduction
        })
        
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.message || '报名失败')
        }
        
        localStorage.removeItem('registrationForm')
        this.submittedOnce = true
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
        phone: '',
        email: '',
        activity: this.activityId || null,
        department: '',
        studentId: '',
        introduction: '',
        agreeTerms: false
      }
      this.errors = {}
      this.submitSuccess = false
      localStorage.removeItem('registrationForm')
    },
    logout() {
      localStorage.removeItem('user')
      this.isLoggedIn = false
      this.$router.push('/login')
    }
  },
  watch: {
    form: {
      deep: true,
      handler() {
        if (!this.submitSuccess) {
          this.saveFormData()
        }
      }
    }
  }
}
</script>

<style scoped>
.registration-page {
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
  max-width: 800px;
  margin: 0 auto;
}

.registration-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  overflow: hidden;
}

.registration-container h2 {
  background-color: #f8f9fa;
  padding: 20px;
  margin: 0;
  color: #333;
  border-bottom: 1px solid #eee;
}

.success-message {
  background-color: #d4edda;
  border-color: #c3e6cb;
  color: #155724;
  padding: 15px 20px;
  margin: 20px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.success-icon {
  font-size: 24px;
  font-weight: bold;
}

.registration-form {
  padding: 20px;
}

.registration-form.submitted {
  pointer-events: none;
  opacity: 0.7;
}

.form-section {
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.form-section:last-of-type {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.form-section h3 {
  margin-bottom: 15px;
  color: #555;
  font-size: 16px;
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

.required {
  color: #f44336;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #4CAF50;
}

.form-group input.error,
.form-group select.error,
.form-group textarea.error {
  border-color: #f44336;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.char-count {
  display: block;
  text-align: right;
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.checkbox-group {
  margin-bottom: 0;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
  margin-top: 2px;
}

.error-message {
  color: #f44336;
  font-size: 12px;
  margin-top: 5px;
  display: block;
}

.form-actions {
  display: flex;
  gap: 15px;
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
  flex: 1;
}

.btn-primary:hover:not(:disabled) {
  background-color: #45a049;
}

.btn-primary:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background-color: #e0e0e0;
}

.spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid #fff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
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
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>

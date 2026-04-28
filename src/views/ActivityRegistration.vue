<template>
  <div class="registration-page">
    <header class="header">
      <h1>校园活动报名</h1>
      <nav>
        <router-link to="/">首页</router-link>
        <router-link to="/my-join" v-if="isLoggedIn">我的报名</router-link>
        <router-link to="/login" v-if="!isLoggedIn">登录</router-link>
        <router-link to="/profile" v-if="isLoggedIn">个人中心</router-link>
        <a v-if="isLoggedIn" @click="logout" class="logout-link">退出登录</a>
      </nav>
    </header>
    
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
              <label for="activity">报名项目 <span class="required">*</span></label>
              <select id="activity" v-model="form.activity" :class="{ error: errors.activity }">
                <option value="">请选择报名项目</option>
                <option v-for="act in availableActivities" :key="act.id" :value="act.id">
                  {{ act.name }}
                </option>
              </select>
              <span v-if="errors.activity" class="error-message">{{ errors.activity }}</span>
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
            <button type="button" class="btn btn-secondary" @click="resetForm">重置表单</button>
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
export default {
  name: 'ActivityRegistration',
  data() {
    return {
      isLoggedIn: false,
      activityName: '',
      form: {
        name: '',
        phone: '',
        email: '',
        activity: '',
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
  mounted() {
    this.checkLoginStatus()
    this.loadAvailableActivities()
    this.loadFormData()
    
    // 获取URL参数中的活动ID
    const activityId = this.$route.params.activityId
    if (activityId) {
      this.form.activity = activityId
    }
  },
  methods: {
    checkLoginStatus() {
      const user = localStorage.getItem('user')
      this.isLoggedIn = !!user
      if (!this.isLoggedIn) {
        this.$router.push('/login')
      }
    },
    loadAvailableActivities() {
      // 从本地存储加载活动列表
      const storedActivities = localStorage.getItem('activities')
      if (storedActivities) {
        this.availableActivities = JSON.parse(storedActivities).filter(act => 
          new Date(act.date) >= new Date().setHours(0, 0, 0, 0)
        )
        
        // 如果有活动ID参数，设置活动名称
        if (this.form.activity) {
          const activity = this.availableActivities.find(a => a.id === this.form.activity)
          if (activity) {
            this.activityName = activity.name
          }
        }
      }
    },
    loadFormData() {
      // 加载本地暂存的表单数据
      const storedForm = localStorage.getItem('registrationForm')
      if (storedForm && !this.submittedOnce) {
        const savedForm = JSON.parse(storedForm)
        // 只恢复未提交过的表单数据
        Object.keys(savedForm).forEach(key => {
          if (this.form[key] !== undefined && !this.form[key]) {
            this.form[key] = savedForm[key]
          }
        })
      }
    },
    saveFormData() {
      // 本地暂存表单数据
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
      
      // 姓名验证
      if (!this.form.name.trim()) {
        this.errors.name = '请输入您的姓名'
        isValid = false
      } else if (this.form.name.length > 50) {
        this.errors.name = '姓名不能超过50个字符'
        isValid = false
      }
      
      // 手机号验证
      if (!this.form.phone.trim()) {
        this.errors.phone = '请输入您的手机号码'
        isValid = false
      } else if (!/^1[3-9]\d{9}$/.test(this.form.phone)) {
        this.errors.phone = '请输入有效的手机号码'
        isValid = false
      }
      
      // 邮箱验证（可选字段）
      if (this.form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email)) {
        this.errors.email = '请输入有效的邮箱地址'
        isValid = false
      }
      
      // 报名项目验证
      if (!this.form.activity) {
        this.errors.activity = '请选择报名项目'
        isValid = false
      }
      
      // 个人简介验证
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
      
      // 条款同意验证
      if (!this.form.agreeTerms) {
        this.errors.agreeTerms = '请同意活动条款和隐私政策'
        isValid = false
      }
      
      return isValid
    },
    async submitForm() {
      // 防重复提交
      if (this.submitting) return
      
      if (!this.validateForm()) {
        return
      }
      
      this.submitting = true
      
      try {
        // 模拟API提交
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // 创建报名记录
        const registration = {
          id: Date.now().toString(),
          ...this.form,
          activityName: this.availableActivities.find(a => a.id === this.form.activity)?.name || '',
          createdAt: new Date().toISOString(),
          status: 'pending'
        }
        
        // 保存到本地存储
        const registrations = JSON.parse(localStorage.getItem('registrations') || '[]')
        registrations.push(registration)
        localStorage.setItem('registrations', JSON.stringify(registrations))
        
        // 清除本地暂存的表单数据
        localStorage.removeItem('registrationForm')
        this.submittedOnce = true
        
        // 显示成功提示
        this.submitSuccess = true
        
      } catch (error) {
        console.error('报名提交失败:', error)
        alert('报名提交失败，请稍后重试')
      } finally {
        this.submitting = false
      }
    },
    resetForm() {
      this.form = {
        name: '',
        phone: '',
        email: '',
        activity: '',
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
        // 实时保存表单数据到本地存储
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
<template>
  <div class="registration-page">
    <main class="main">
      <!-- 页面标题区域 -->
      <div class="page-header-section">
        <div class="header-icon">📋</div>
        <h1 class="page-title">活动报名</h1>
        <p class="page-subtitle">选择您感兴趣的活动，开启精彩校园生活</p>
        
        <!-- 活动容量信息 -->
        <div v-if="selectedActivity" class="activity-capacity-info">
          <div class="capacity-bar">
            <div class="capacity-fill" :style="{ width: capacityPercent + '%' }"></div>
          </div>
          <p class="capacity-text">活动名额：<strong>{{ selectedActivity.participants_count || 0 }}</strong> / {{ selectedActivity.capacity || 100 }} 人</p>
          <p v-if="isActivityFull" class="capacity-warning">⚠️ 活动名额已满，无法报名</p>
        </div>
        
        <!-- 成功提示 -->
        <div v-if="submitSuccess" class="success-message">
          <span class="success-icon">✓</span>
          <p>报名成功！您的报名信息已提交。</p>
        </div>
      </div>

      <div class="registration-container">
        <div class="form-card">
          <div class="card-header">
            <div class="header-badge">
              <span class="badge-icon">📋</span>
              <span class="badge-text">活动报名</span>
            </div>
            <h3>{{ activityName || '选择活动报名' }}</h3>
            <p>请填写以下信息完成活动报名</p>
          </div>
          
          <!-- 成功提示 -->
          <div v-if="submitSuccess" class="success-alert">
            <div class="success-icon-wrapper">
              <span class="success-icon">✓</span>
            </div>
            <div class="success-content">
              <h4>报名成功！</h4>
              <p>您的报名信息已提交，活动详情将通过通知告知您。</p>
            </div>
            <button class="close-btn" @click="resetForm">×</button>
          </div>
          
          <form @submit.prevent="submitForm" class="registration-form">
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
                    {{ act.title }} ({{ getCategoryText(act.category) }}) - 名额: {{ act.participants_count || 0 }}/{{ act.capacity || 100 }}
                  </option>
                </select>
                <span v-if="errors.activity" class="error-message">{{ errors.activity }}</span>
                <small v-if="filteredActivities.length === 0 && selectedCategory" style="color: #999;">该类型下没有活动</small>
                <small v-else-if="filteredActivities.length === 0" style="color: #999;">暂无可用活动</small>
                <small v-else style="color: #999;">共 {{ filteredActivities.length }} 个活动</small>
              </div>
            </div>
            
            <div class="form-section">
              <div class="section-title">
                <span class="section-icon">📝</span>
                <h3>个人简介</h3>
                <span class="section-badge">必填</span>
              </div>
              
              <div class="form-group">
                <label for="introduction">自我介绍 <span class="required">*</span></label>
                <textarea 
                  id="introduction" 
                  v-model="form.introduction" 
                  :class="{ error: errors.introduction }"
                  placeholder="请简要介绍您自己，包括相关经历、特长等（至少50字）"
                  rows="5"
                  @blur="validateField('introduction')"
                  @focus="clearError('introduction')"
                ></textarea>
                <span class="char-count">{{ form.introduction.length }}/500</span>
                <span v-if="errors.introduction" class="error-message">{{ errors.introduction }}</span>
              </div>
            </div>
            
            <div class="form-section">
              <div class="section-title">
                <span class="section-icon">📄</span>
                <h3>其他信息</h3>
              </div>
              
              <div class="form-group checkbox-group">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="form.agreeTerms">
                  <span class="checkbox-custom"></span>
                  我已阅读并同意活动相关条款和隐私政策
                </label>
                <span v-if="errors.agreeTerms" class="error-message">{{ errors.agreeTerms }}</span>
              </div>
            </div>
            
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
    </main>
  </div>
</template>

<script>
import { apiGet, apiPost, isLoggedIn, isAdmin } from '../utils/api'
import NotificationBell from '../components/NotificationBell.vue'

export default {
  name: 'ActivityRegistration',
  components: {
    NotificationBell
  },
  data() {
    return {
      isLoggedIn: false,
      isAdmin: false,
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
      availableActivities: [],
      submitting: false,
      submitSuccess: false,
      categoryMap: {
        sports: '体育运动',
        academic: '学术科技',
        art: '文化艺术',
        social: '社会实践',
        entertainment: '娱乐休闲',
        other: '其他'
      }
    }
  },
  computed: {
    filteredActivities() {
      if (!this.selectedCategory) {
        return this.availableActivities
      }
      return this.availableActivities.filter(act => act.category === this.selectedCategory)
    },
    selectedActivity() {
      if (!this.form.activity) return null
      return this.availableActivities.find(act => act.id === this.form.activity)
    },
    capacityPercent() {
      if (!this.selectedActivity) return 0
      const capacity = this.selectedActivity.capacity || 100
      const count = this.selectedActivity.participants_count || 0
      return Math.min((count / capacity) * 100, 100)
    },
    isActivityFull() {
      if (!this.selectedActivity) return false
      const capacity = this.selectedActivity.capacity || 100
      const count = this.selectedActivity.participants_count || 0
      return count >= capacity
    }
  },
  mounted() {
    this.checkLoginStatus()
    this.loadActivities()
    
    // 如果URL中有活动ID参数
    if (this.$route.params.activityId) {
      this.activityId = parseInt(this.$route.params.activityId)
    }
  },
  methods: {
    checkLoginStatus() {
      this.isLoggedIn = isLoggedIn()
      this.isAdmin = isAdmin()
      if (!this.isLoggedIn) {
        this.$router.push('/login')
      }
    },
    async loadActivities() {
      try {
        const response = await apiGet('/activities')
        if (!response.ok) {
          throw new Error('获取活动列表失败')
        }
        const data = await response.json()
        this.availableActivities = data
        
        // 如果有活动ID，自动选择
        if (this.activityId) {
          const activity = this.availableActivities.find(act => act.id === this.activityId)
          if (activity) {
            this.activityName = activity.title
            this.form.activity = this.activityId
            this.selectedCategory = activity.category
          }
        }
      } catch (error) {
        console.error('加载活动列表失败:', error)
      }
    },
    getCategoryText(category) {
      return this.categoryMap[category] || category
    },
    validateField(field) {
      switch(field) {
        case 'activity':
          if (!this.form.activity) {
            this.errors.activity = '请选择一个活动'
          } else {
            this.errors.activity = ''
          }
          break
        case 'introduction':
          if (!this.form.introduction.trim()) {
            this.errors.introduction = '请填写自我介绍'
          } else if (this.form.introduction.length < 50) {
            this.errors.introduction = '自我介绍至少需要50字'
          } else if (this.form.introduction.length > 500) {
            this.errors.introduction = '自我介绍不能超过500字'
          } else {
            this.errors.introduction = ''
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
        activity: '',
        introduction: '',
        agreeTerms: ''
      }
      
      if (!this.form.activity) {
        this.errors.activity = '请选择一个活动'
        isValid = false
      }
      
      if (!this.form.introduction.trim()) {
        this.errors.introduction = '请填写自我介绍'
        isValid = false
      } else if (this.form.introduction.length < 50) {
        this.errors.introduction = '自我介绍至少需要50字'
        isValid = false
      } else if (this.form.introduction.length > 500) {
        this.errors.introduction = '自我介绍不能超过500字'
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
        phone: '',
        email: '',
        activity: this.activityId || null,
        department: '',
        studentId: '',
        introduction: '',
        agreeTerms: false
      }
      this.errors = {
        name: '',
        phone: '',
        email: '',
        activity: '',
        introduction: '',
        agreeTerms: ''
      }
      this.submitSuccess = false
    },
    logout() {
      localStorage.removeItem('user')
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.registration-page {
  min-height: 100vh;
  background-color: #f8f9fa;
}

/* 导航栏样式 - 与首页保持一致 */
.header {
  background-color: #4CAF50;
  color: white;
  padding: 15px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header h1 {
  font-size: 24px;
  margin: 0;
}

nav {
  display: flex;
  align-items: center;
  gap: 5px;
}

nav a {
  color: white;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 4px;
  transition: background-color 0.3s;
  font-size: 14px;
}

nav a:hover {
  background-color: rgba(255,255,255,0.2);
}

nav a.router-link-active {
  background-color: rgba(255,255,255,0.3);
  font-weight: 600;
}

.logout-link {
  color: white;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.logout-link:hover {
  background-color: rgba(255,255,255,0.2);
}

/* 页面头部区域 */
.page-header-section {
  text-align: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.header-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.page-title {
  font-size: 32px;
  margin: 0 0 10px 0;
  font-weight: 600;
}

.page-subtitle {
  font-size: 16px;
  opacity: 0.9;
  margin: 0 0 30px 0;
}

/* 报名类型切换标签 */
.type-tabs {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 30px;
  background: rgba(255,255,255,0.2);
  border-radius: 12px;
  text-decoration: none;
  color: white;
  transition: all 0.3s;
  min-width: 150px;
  border: 2px solid transparent;
  cursor: pointer;
}

.tab-item:hover {
  background: rgba(255,255,255,0.3);
  transform: translateY(-2px);
}

.tab-item.active {
  background: rgba(255,255,255,0.95);
  color: #333;
  border-color: #fff;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.tab-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.tab-text {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.tab-desc {
  font-size: 12px;
  opacity: 0.8;
}

/* 注册容器 */
.registration-container {
  max-width: 700px;
  margin: 0 auto;
  padding: 30px 20px;
}

.form-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  overflow: hidden;
}

.card-header {
  padding: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,0.2);
  padding: 8px 16px;
  border-radius: 20px;
  margin-bottom: 15px;
}

.badge-icon {
  font-size: 20px;
}

.badge-text {
  font-size: 14px;
  font-weight: 600;
}

.card-header h3 {
  font-size: 24px;
  margin: 0 0 8px 0;
}

.card-header p {
  margin: 0;
  opacity: 0.9;
  font-size: 14px;
}

.activity-capacity-info {
  background-color: #f8f9fa;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.capacity-bar {
  height: 8px;
  background-color: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.capacity-fill {
  height: 100%;
  background-color: #4CAF50;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.capacity-text {
  margin: 0;
  font-size: 14px;
  color: #333;
}

.capacity-warning {
  margin: 5px 0 0 0;
  font-size: 13px;
  color: #f44336;
  font-weight: bold;
}

.success-message {
  background-color: #d4edda;
  border-color: #c3e6cb;
  color: #155724;
  padding: 15px 20px;
  margin: 20px;
  border-radius: 8px;
}

.success-icon-wrapper {
  width: 40px;
  height: 40px;
  background: #28a745;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.success-icon {
  color: white;
  font-size: 20px;
  font-weight: bold;
}

.success-content {
  flex: 1;
}

.success-content h4 {
  margin: 0 0 5px 0;
  color: #155724;
}

.success-content p {
  margin: 0;
  color: #155724;
  font-size: 14px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #155724;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 表单样式 */
.registration-form {
  padding: 30px;
}

.form-section {
  margin-bottom: 30px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #f0f0f0;
}

.section-icon {
  font-size: 20px;
}

.section-title h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.section-badge {
  margin-left: auto;
  padding: 4px 12px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.required {
  color: #f44336;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s;
  background: white;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input.error,
.form-group select.error,
.form-group textarea.error {
  border-color: #f44336;
}

.error-message {
  color: #f44336;
  font-size: 12px;
  margin-top: 5px;
}

.char-count {
  font-size: 12px;
  color: #999;
  text-align: right;
  margin-top: 5px;
}

/* 复选框样式 */
.checkbox-group {
  flex-direction: row;
  align-items: flex-start;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
}

.checkbox-label input[type="checkbox"] {
  display: none;
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #ddd;
  border-radius: 4px;
  display: inline-block;
  position: relative;
  transition: all 0.3s;
}

.checkbox-label input[type="checkbox"]:checked + .checkbox-custom {
  border-color: #667eea;
  background: #667eea;
}

.checkbox-label input[type="checkbox"]:checked + .checkbox-custom::after {
  content: '';
  width: 6px;
  height: 12px;
  border: solid white;
  border-width: 0 2px 2px 0;
  position: absolute;
  top: 2px;
  left: 6px;
  transform: rotate(45deg);
}

/* 表单操作按钮 */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding-top: 20px;
  border-top: 2px solid #f0f0f0;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f5f5f5;
  color: #666;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 15px;
    padding: 15px;
  }
  
  nav {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .type-tabs {
    flex-direction: column;
    align-items: center;
  }
  
  .tab-item {
    width: 100%;
    max-width: 280px;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>

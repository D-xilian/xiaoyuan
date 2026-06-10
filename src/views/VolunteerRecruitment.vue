<template>
  <div class="volunteer-recruitment">
    <!-- 导航栏 - 与首页保持一致 -->
    <header class="header">
      <h1>校园活动发布平台</h1>
      <nav>
        <router-link to="/">首页</router-link>
        
        <!-- 管理员菜单 -->
        <router-link to="/admin/users" v-if="isLoggedIn && isAdmin">用户管理</router-link>
        <router-link to="/admin/volunteers" v-if="isLoggedIn && isAdmin">志愿者管理</router-link>
        <router-link to="/activity/create" v-if="isLoggedIn && isAdmin">创建活动</router-link>
        <router-link to="/admin/activities" v-if="isLoggedIn && isAdmin">管理活动</router-link>
        <router-link to="/registration/list" v-if="isLoggedIn && isAdmin">查看报名</router-link>
        
        <!-- 普通用户菜单 -->
        <router-link to="/activity/register" v-if="isLoggedIn && !isAdmin">报名活动</router-link>
        <router-link to="/volunteer/recruitment" v-if="isLoggedIn && !isAdmin">志愿者招募</router-link>
        <router-link to="/my-join" v-if="isLoggedIn && !isAdmin">我的报名</router-link>
        
        <!-- 通用菜单 -->
        <router-link to="/login" v-if="!isLoggedIn">登录</router-link>
        <router-link to="/register" v-if="!isLoggedIn">注册</router-link>
        <router-link to="/profile" v-if="isLoggedIn">个人中心</router-link>
        <NotificationBell v-if="isLoggedIn" />
        <a v-if="isLoggedIn" @click="logout" class="logout-link">退出登录</a>
      </nav>
    </header>
    
    <main class="main-content">
      <!-- 页面标题区域 -->
      <div class="page-header-section">
        <h1 class="page-title">志愿者招募</h1>
        <p class="page-subtitle">加入我们的志愿者团队，用爱心温暖校园，用行动传递正能量</p>
        
        <!-- 报名类型切换标签 -->
        <div class="type-tabs">
          <router-link to="/activity/register" class="tab-item">
            <span class="tab-text">活动报名</span>
            <span class="tab-desc">报名参加各类校园活动</span>
          </router-link>
          <div class="tab-item active">
            <span class="tab-text">志愿者报名</span>
            <span class="tab-desc">加入志愿者服务团队</span>
          </div>
        </div>
      </div>

      <div class="form-container">
        <div class="form-card">
          <div class="card-header">
            <h3>志愿者报名申请表</h3>
            <p>请填写以下信息完成志愿者报名申请</p>
          </div>
          
          <!-- 成功提示 -->
          <div v-if="submitSuccess" class="success-alert">
            <div class="success-content">
              <h4>报名成功！</h4>
              <p>感谢您的志愿精神，我们会尽快审核您的申请并与您联系。</p>
              <div v-if="submittedActivities.length > 0" class="success-activities">
                <h5>您已报名以下活动：</h5>
                <ul>
                  <li v-for="activity in submittedActivities" :key="activity.id">{{ activity.title }}</li>
                </ul>
              </div>
            </div>
            <button class="close-btn" @click="resetForm">关闭</button>
          </div>
          
          <!-- 已报名状态显示 -->
          <div v-else-if="hasRegistrations && registrations.length > 0" class="registration-status">
            <h4>您已提交的志愿者报名</h4>
            <div class="registrations-list">
              <div 
                v-for="reg in registrations" 
                :key="reg.id" 
                class="status-card" 
                :class="reg.status"
              >
                <div class="status-header">
                  <span class="activity-title">{{ reg.activity_title }}</span>
                  <span class="status-label" :class="reg.status">{{ getStatusText(reg.status) }}</span>
                </div>
                <p class="registration-time">报名时间：{{ reg.registration_time }}</p>
                <p v-if="reg.admin_note" class="admin-note">管理员备注：{{ reg.admin_note }}</p>
                <button class="cancel-btn" @click="cancelRegistration(reg.id)">取消报名</button>
              </div>
            </div>
          </div>
          
          <form v-else @submit.prevent="submitForm" class="volunteer-form">
            <!-- 个人信息区域 -->
            <div class="form-section">
              <div class="section-title">
                <h4>个人信息</h4>
                <span class="section-badge">必填</span>
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
                    placeholder="请输入您的真实姓名"
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
                    type="text" 
                    id="studentId" 
                    v-model="form.student_id" 
                    :class="{ error: errors.student_id }"
                    placeholder="请输入您的学号"
                    maxlength="20"
                    @blur="validateField('student_id')"
                    @focus="clearError('student_id')"
                  >
                  <span v-if="errors.student_id" class="error-message">{{ errors.student_id }}</span>
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

                <div class="form-group">
                  <label for="phone">
                    联系电话
                  </label>
                  <input 
                    type="tel" 
                    id="phone" 
                    v-model="form.phone" 
                    :class="{ error: errors.phone }"
                    placeholder="请输入您的联系电话"
                    maxlength="20"
                    @blur="validateField('phone')"
                    @focus="clearError('phone')"
                  >
                  <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
                </div>

                <div class="form-group">
                  <label for="email">
                    邮箱
                  </label>
                  <input 
                    type="email" 
                    id="email" 
                    v-model="form.email" 
                    :class="{ error: errors.email }"
                    placeholder="请输入您的邮箱地址"
                    maxlength="100"
                    @blur="validateField('email')"
                    @focus="clearError('email')"
                  >
                  <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
                </div>
              </div>
            </div>
            
            <!-- 选择活动区域 -->
            <div class="form-section">
              <div class="section-title">
                <h4>选择活动</h4>
                <span class="section-badge">必填</span>
              </div>
              
              <div class="form-grid">
                <div class="form-group full-width">
                  <label>
                    报名活动（可多选）<span class="required">*</span>
                  </label>
                  <div class="checkbox-group">
                    <label 
                      v-for="activity in availableActivities" 
                      :key="activity.id" 
                      class="checkbox-label"
                      :class="{ checked: form.activity_ids.includes(activity.id) }"
                    >
                      <input 
                        type="checkbox" 
                        :value="activity.id" 
                        v-model="form.activity_ids"
                        :disabled="isActivityRegistered(activity.id)"
                      >
                      <span class="checkbox-custom"></span>
                      <span class="activity-info">
                        <span class="activity-name">{{ activity.title }}</span>
                        <span class="activity-meta">{{ activity.time }} - {{ activity.location }}</span>
                      </span>
                      <span v-if="isActivityRegistered(activity.id)" class="registered-badge">已报名</span>
                    </label>
                  </div>
                  <span v-if="errors.activity_ids" class="error-message">{{ errors.activity_ids }}</span>
                  <small v-if="availableActivities.length === 0" style="color: #999;">暂无可报名的活动</small>
                </div>
              </div>
            </div>
            
            <!-- 表单操作按钮 -->
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" @click="resetForm">
                重置
              </button>
              <button type="submit" class="btn btn-primary" :disabled="submitting">
                <span v-if="submitting" class="btn-spinner"></span>
                {{ submitting ? '提交中...' : '提交报名申请' }}
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
import { apiGet, apiPost, isLoggedIn, isAdmin, getCurrentUser } from '../utils/api'
import NotificationBell from '../components/NotificationBell.vue'

export default {
  name: 'VolunteerRecruitment',
  components: {
    NotificationBell
  },
  data() {
    return {
      isLoggedIn: false,
      isAdmin: false,
      hasRegistrations: false,
      registrations: [],
      form: {
        name: '',
        gender: '',
        student_id: '',
        department: '',
        phone: '',
        email: '',
        activity_ids: []
      },
      submittedActivities: [],
      errors: {
        name: '',
        gender: '',
        student_id: '',
        department: '',
        phone: '',
        email: '',
        activity_ids: ''
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
      registeredActivityIds: [],
      submitting: false,
      submitSuccess: false
    }
  },
  computed: {
    selectedCount() {
      return this.form.activity_ids.length
    }
  },
  mounted() {
    this.checkLoginStatus()
    this.loadActivities()
    this.checkExistingRegistrations()
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
        if (response.ok) {
          this.availableActivities = await response.json()
        }
      } catch (error) {
        console.error('加载活动列表失败:', error)
      }
    },
    async checkExistingRegistrations() {
      try {
        const response = await apiGet('/volunteer/my-registration')
        if (response.ok) {
          const data = await response.json()
          // 处理单个或多个报名记录
          this.registrations = Array.isArray(data) ? data : [data]
          this.hasRegistrations = this.registrations.length > 0
          this.registeredActivityIds = this.registrations.map(r => r.activity_id)
        }
      } catch (error) {
        console.log('未找到志愿者报名信息')
      }
    },
    isActivityRegistered(activityId) {
      return this.registeredActivityIds.includes(activityId)
    },
    getStatusText(status) {
      const statusMap = {
        'pending': '待审核',
        'approved': '已通过',
        'rejected': '已拒绝'
      }
      return statusMap[status] || status
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
        case 'student_id':
          if (!this.form.student_id) {
            this.errors.student_id = '请输入您的学号'
          } else if (!/^\d{8,12}$/.test(this.form.student_id.toString())) {
            this.errors.student_id = '学号格式不正确（应为8-12位数字）'
          } else {
            this.errors.student_id = ''
          }
          break
        case 'department':
          if (!this.form.department) {
            this.errors.department = '请选择您的院系'
          } else {
            this.errors.department = ''
          }
          break
        case 'phone':
          if (this.form.phone && !/^1[3-9]\d{9}$/.test(this.form.phone)) {
            this.errors.phone = '手机号格式不正确'
          } else {
            this.errors.phone = ''
          }
          break
        case 'email':
          if (this.form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email)) {
            this.errors.email = '邮箱格式不正确'
          } else {
            this.errors.email = ''
          }
          break
        case 'activity_ids':
          if (this.form.activity_ids.length === 0) {
            this.errors.activity_ids = '请至少选择一个活动'
          } else {
            this.errors.activity_ids = ''
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
        student_id: '',
        department: '',
        phone: '',
        email: '',
        activity_ids: ''
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
      
      if (!this.form.student_id) {
        this.errors.student_id = '请输入您的学号'
        isValid = false
      } else if (!/^\d{8,12}$/.test(this.form.student_id.toString())) {
        this.errors.student_id = '学号格式不正确（应为8-12位数字）'
        isValid = false
      }
      
      if (!this.form.department) {
        this.errors.department = '请选择您的院系'
        isValid = false
      }
      
      if (this.form.phone && !/^1[3-9]\d{9}$/.test(this.form.phone)) {
        this.errors.phone = '手机号格式不正确'
        isValid = false
      }
      
      if (this.form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email)) {
        this.errors.email = '邮箱格式不正确'
        isValid = false
      }
      
      if (this.form.activity_ids.length === 0) {
        this.errors.activity_ids = '请至少选择一个活动'
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
        const response = await apiPost('/volunteer/register', {
          name: this.form.name,
          gender: this.form.gender,
          student_id: this.form.student_id,
          department: this.form.department,
          phone: this.form.phone,
          email: this.form.email,
          activity_ids: this.form.activity_ids
        })
        
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.message || '报名失败')
        }
        
        // 获取报名成功的活动信息用于显示
        this.submittedActivities = this.availableActivities.filter(
          activity => this.form.activity_ids.includes(activity.id)
        )
        this.submitSuccess = true
        
      } catch (error) {
        console.error('报名提交失败:', error)
        alert(error.message || '报名提交失败，请稍后重试')
      } finally {
        this.submitting = false
      }
    },
    async cancelRegistration(registrationId) {
      if (!confirm('确定要取消此报名吗？')) return
      
      try {
        const response = await apiPost('/volunteer/cancel', { registration_id: registrationId })
        if (response.ok) {
          alert('报名已取消')
          // 重新加载报名列表
          this.checkExistingRegistrations()
        } else {
          const data = await response.json()
          alert(data.message || '取消失败')
        }
      } catch (error) {
        alert('网络错误，请稍后重试')
      }
    },
    resetForm() {
      this.form = {
        name: '',
        gender: '',
        student_id: '',
        department: '',
        phone: '',
        email: '',
        activity_ids: []
      }
      this.errors = {
        name: '',
        gender: '',
        student_id: '',
        department: '',
        phone: '',
        email: '',
        activity_ids: ''
      }
      this.submitSuccess = false
      this.submittedActivities = []
    },
    logout() {
      localStorage.removeItem('user')
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.volunteer-recruitment {
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

.tab-text {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.tab-desc {
  font-size: 12px;
  opacity: 0.8;
}

/* 表单容器 */
.form-container {
  max-width: 800px;
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
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  text-align: center;
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

/* 成功提示 */
.success-alert {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 30px;
  background: #d4edda;
  border-left: 4px solid #28a745;
  margin: 20px;
  border-radius: 8px;
}

.success-content {
  flex: 1;
}

.success-content h4 {
  margin: 0 0 5px 0;
  color: #155724;
}

.success-content p {
  margin: 0 0 15px 0;
  color: #155724;
  font-size: 14px;
}

.success-activities {
  background: rgba(255,255,255,0.8);
  padding: 15px;
  border-radius: 8px;
}

.success-activities h5 {
  margin: 0 0 10px 0;
  color: #155724;
  font-size: 14px;
}

.success-activities ul {
  margin: 0;
  padding-left: 20px;
}

.success-activities li {
  color: #155724;
  font-size: 14px;
  margin-bottom: 5px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #155724;
  padding: 5px 10px;
}

/* 报名状态显示 */
.registration-status {
  padding: 30px;
}

.registration-status h4 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 18px;
}

.registrations-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.status-card {
  padding: 20px;
  border-radius: 12px;
  border: 2px solid;
}

.status-card.pending {
  background: #fff3cd;
  border-color: #ffc107;
}

.status-card.approved {
  background: #d4edda;
  border-color: #28a745;
}

.status-card.rejected {
  background: #f8d7da;
  border-color: #dc3545;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.activity-title {
  font-weight: 600;
  color: #333;
}

.status-label {
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
}

.status-label.pending {
  background: #ffc107;
  color: #333;
}

.status-label.approved {
  background: #28a745;
  color: white;
}

.status-label.rejected {
  background: #dc3545;
  color: white;
}

.registration-time {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #666;
}

.admin-note {
  margin: 10px 0;
  padding: 10px;
  background: rgba(0,0,0,0.05);
  border-radius: 8px;
  font-size: 14px;
  color: #666;
}

.cancel-btn {
  padding: 8px 16px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.cancel-btn:hover {
  background: #c82333;
}

/* 表单样式 */
.volunteer-form {
  padding: 30px;
}

.form-section {
  margin-bottom: 30px;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #f0f0f0;
}

.section-title h4 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.section-badge {
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
.form-group select.error {
  border-color: #f44336;
}

.error-message {
  color: #f44336;
  font-size: 12px;
  margin-top: 5px;
}

.radio-group {
  display: flex;
  gap: 20px;
  padding: 12px 0;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
}

.radio-label input[type="radio"] {
  display: none;
}

.radio-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #ddd;
  border-radius: 50%;
  display: inline-block;
  position: relative;
  transition: all 0.3s;
}

.radio-label input[type="radio"]:checked + .radio-custom {
  border-color: #667eea;
  background: #667eea;
}

.radio-label input[type="radio"]:checked + .radio-custom::after {
  content: '';
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* 多选框组 */
.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 15px;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.checkbox-label:hover:not(:disabled) {
  background: #e9ecef;
}

.checkbox-label.checked {
  background: #e3f2fd;
  border-color: #667eea;
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
  flex-shrink: 0;
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

.activity-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.activity-name {
  font-weight: 500;
  color: #333;
}

.activity-meta {
  font-size: 13px;
  color: #666;
}

.registered-badge {
  padding: 4px 10px;
  background: #e0e0e0;
  color: #666;
  border-radius: 12px;
  font-size: 12px;
}

.checkbox-label:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  justify-content: center;
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

/* 页脚 */
.footer {
  text-align: center;
  padding: 30px;
  color: #999;
  font-size: 14px;
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
  
  .status-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>
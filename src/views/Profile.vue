<template>
  <div class="profile">
    <h2>个人中心</h2>
    
    <div v-if="!user" class="not-logged-in">
      <p>请先登录</p>
      <router-link to="/login" class="btn">去登录</router-link>
    </div>
    
    <div v-else>
      <div class="profile-info">
        <h3>个人信息</h3>
        <div class="info-item">
          <span>用户名:</span>
          <span>{{ user.username }}</span>
        </div>
        <div class="info-item">
          <span>邮箱:</span>
          <span>{{ user.email }}</span>
        </div>
        <div class="info-item">
          <span>用户ID:</span>
          <span>{{ user.id }}</span>
        </div>
        <button @click="showEditModal = true" class="edit-btn">修改个人信息</button>
      </div>
      
      <div class="profile-nav">
        <h3>我的活动</h3>
        <ul>
          <li><router-link to="/my-activities">我发布的活动</router-link></li>
          <li><router-link to="/my-join">我报名的活动</router-link></li>
          <li><router-link to="/my-collection">我的收藏</router-link></li>
        </ul>
      </div>
      
      <div class="logout-section">
        <button @click="logout" class="logout-btn">退出登录</button>
      </div>
    </div>
    
    <div v-if="showEditModal" class="modal">
      <div class="modal-content">
        <h3>修改个人信息</h3>
        <form @submit.prevent="updateProfile">
          <div class="form-group">
            <label for="editEmail">邮箱</label>
            <input type="email" id="editEmail" v-model="editForm.email" required>
          </div>
          <div class="form-group">
            <label for="currentPassword">当前密码</label>
            <input type="password" id="currentPassword" v-model="editForm.currentPassword" required>
          </div>
          <div class="form-group">
            <label for="newPassword">新密码（留空则不修改）</label>
            <input type="password" id="newPassword" v-model="editForm.newPassword">
          </div>
          <div class="form-group">
            <label for="confirmNewPassword">确认新密码</label>
            <input type="password" id="confirmNewPassword" v-model="editForm.confirmNewPassword">
          </div>
          <div class="modal-buttons">
            <button type="submit" class="btn" :disabled="loading">
              {{ loading ? '保存中...' : '保存' }}
            </button>
            <button type="button" class="btn cancel-btn" @click="showEditModal = false">取消</button>
          </div>
          <p v-if="error" class="error">{{ error }}</p>
          <p v-if="success" class="success">{{ success }}</p>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      user: null,
      showEditModal: false,
      editForm: {
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      },
      loading: false,
      error: '',
      success: ''
    }
  },
  mounted() {
    this.loadUser()
  },
  methods: {
    loadUser() {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        this.user = JSON.parse(userStr)
      }
    },
    logout() {
      localStorage.removeItem('user')
      this.user = null
      this.$router.push('/login')
    },
    async updateProfile() {
      this.error = ''
      this.success = ''
      
      if (this.editForm.newPassword && this.editForm.newPassword !== this.editForm.confirmNewPassword) {
        this.error = '两次输入的新密码不一致'
        return
      }
      
      if (this.editForm.newPassword && this.editForm.newPassword.length < 6) {
        this.error = '新密码长度不能少于6位'
        return
      }
      
      this.loading = true
      try {
        const updateData = {
          email: this.editForm.email,
          currentPassword: this.editForm.currentPassword
        }
        
        if (this.editForm.newPassword) {
          updateData.newPassword = this.editForm.newPassword
        }
        
        const response = await fetch(`http://localhost:5000/api/user/${this.user.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        })
        const data = await response.json()
        
        if (response.ok) {
          this.success = '个人信息更新成功！'
          this.user.email = this.editForm.email
          localStorage.setItem('user', JSON.stringify(this.user))
          setTimeout(() => {
            this.showEditModal = false
            this.success = ''
          }, 1500)
        } else {
          this.error = data.message || '更新失败'
        }
      } catch (err) {
        this.error = '网络错误，请稍后重试'
      } finally {
        this.loading = false
      }
    }
  },
  watch: {
    showEditModal(newVal) {
      if (newVal) {
        this.editForm.email = this.user.email
        this.editForm.currentPassword = ''
        this.editForm.newPassword = ''
        this.editForm.confirmNewPassword = ''
        this.error = ''
        this.success = ''
      }
    }
  }
}
</script>

<style scoped>
.profile {
  max-width: 800px;
  margin: 50px auto;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.profile h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.profile-info {
  margin-bottom: 30px;
}

.profile-info h3 {
  margin-bottom: 15px;
  color: #555;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.profile-nav {
  margin-top: 20px;
}

.profile-nav h3 {
  margin-bottom: 15px;
  color: #555;
}

.profile-nav ul {
  list-style: none;
}

.profile-nav li {
  margin-bottom: 10px;
}

.profile-nav a {
  color: #4CAF50;
  text-decoration: none;
  font-size: 16px;
}

.profile-nav a:hover {
  text-decoration: underline;
}

.not-logged-in {
  text-align: center;
  padding: 40px;
}

.not-logged-in p {
  font-size: 18px;
  color: #666;
  margin-bottom: 20px;
}

.edit-btn {
  background-color: #2196F3;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 20px;
  font-size: 14px;
}

.edit-btn:hover {
  background-color: #0b7dda;
}

.logout-section {
  margin-top: 30px;
  text-align: center;
}

.logout-btn {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.logout-btn:hover {
  background-color: #d32f2f;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-content h3 {
  margin-bottom: 20px;
  color: #333;
  text-align: center;
}

.modal-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.modal-buttons .btn {
  flex: 1;
}

.cancel-btn {
  background-color: #9e9e9e;
}

.cancel-btn:hover {
  background-color: #757575;
}

.error {
  color: #f44336;
  text-align: center;
  margin-top: 10px;
}

.success {
  color: #4CAF50;
  text-align: center;
  margin-top: 10px;
}

.btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
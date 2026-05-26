<template>
  <div class="create-activity">
    <h2>发布活动</h2>
    <form @submit.prevent="createActivity">
      <div class="form-group">
        <label for="title">活动标题</label>
        <input type="text" id="title" v-model="form.title" required>
      </div>
      <div class="form-group">
        <label for="description">活动描述</label>
        <textarea id="description" v-model="form.description" required></textarea>
      </div>
      <div class="form-group">
        <label for="time">活动时间</label>
        <input type="datetime-local" id="time" v-model="form.time" required>
      </div>
      <div class="form-group">
        <label for="location">活动地点</label>
        <input type="text" id="location" v-model="form.location" required>
      </div>
      <button type="submit" class="btn">发布活动</button>
    </form>
  </div>
</template>

<script>
import { apiPost, isLoggedIn } from '../utils/api'

export default {
  data() {
    return {
      form: {
        title: '',
        description: '',
        time: '',
        location: ''
      }
    }
  },
  mounted() {
    if (!isLoggedIn()) {
      this.$router.push('/login')
    }
  },
  methods: {
    async createActivity() {
      try {
        const response = await apiPost('/activities', this.form)
        
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.message || '创建活动失败')
        }
        
        alert('活动发布成功！')
        this.$router.push('/my-activities')
      } catch (error) {
        console.error('创建活动失败:', error)
        alert(error.message || '创建活动失败，请稍后重试')
      }
    }
  }
}
</script>

<style scoped>
.create-activity {
  max-width: 600px;
  margin: 50px auto;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.create-activity h2 {
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
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group textarea {
  height: 100px;
  resize: vertical;
}

.btn {
  width: 100%;
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.btn:hover {
  background-color: #45a049;
}
</style>
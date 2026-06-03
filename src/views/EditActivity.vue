<template>
  <div class="edit-activity">
    <h2>编辑活动</h2>
    <form @submit.prevent="updateActivity">
      <div class="form-group">
        <label for="title">活动标题</label>
        <input type="text" id="title" v-model="form.title" required>
      </div>
      <div class="form-group">
        <label for="category">活动类型</label>
        <select id="category" v-model="form.category" required>
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
      <button type="submit" class="btn" :disabled="loading">
        {{ loading ? '保存中...' : '保存修改' }}
      </button>
    </form>
  </div>
</template>

<script>
import { adminApiGet, adminApiPut, isAdmin } from '../utils/api'

export default {
  data() {
    return {
      form: {
        title: '',
        category: '',
        description: '',
        time: '',
        location: ''
      },
      loading: false,
      error: ''
    }
  },
  mounted() {
    if (!isAdmin()) {
      alert('无权限访问此页面')
      this.$router.push('/')
      return
    }
    this.loadActivity()
  },
  methods: {
    async loadActivity() {
      const activityId = this.$route.params.id
      if (!activityId) {
        this.error = '活动ID不存在'
        return
      }

      this.loading = true
      try {
        const response = await adminApiGet(`/activities/${activityId}`)
        if (!response.ok) {
          throw new Error('获取活动信息失败')
        }
        const data = await response.json()
        
        this.form.title = data.title
        this.form.category = data.category || ''
        this.form.description = data.description
        this.form.time = data.time.replace(' ', 'T')
        this.form.location = data.location
      } catch (error) {
        console.error('加载活动失败:', error)
        this.error = '加载活动失败，请稍后重试'
      } finally {
        this.loading = false
      }
    },
    async updateActivity() {
      const activityId = this.$route.params.id
      if (!activityId) {
        alert('活动ID不存在')
        return
      }

      this.loading = true
      try {
        const response = await adminApiPut(`/activities/${activityId}`, this.form)

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || '更新失败')
        }

        alert('活动更新成功')
        this.$router.push(`/activity/${activityId}`)
      } catch (error) {
        console.error('更新活动失败:', error)
        alert(error.message || '更新失败，请稍后重试')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.edit-activity {
  max-width: 600px;
  margin: 50px auto;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.edit-activity h2 {
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
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group textarea {
  height: 100px;
  resize: vertical;
}

.form-group select {
  background-color: white;
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
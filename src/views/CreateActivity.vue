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
      <div class="form-group">
        <label for="image">活动图片</label>
        <input type="file" id="image" @change="handleImageUpload" accept="image/png,image/jpeg,image/jpg,image/gif,image/webp">
        <div v-if="previewImage" class="image-preview">
          <img :src="previewImage" alt="预览图片">
          <button type="button" class="btn-remove" @click="removeImage">移除图片</button>
        </div>
        <p v-if="uploading" class="upload-status">上传中...</p>
        <p v-if="uploadError" class="upload-error">{{ uploadError }}</p>
      </div>
      <button type="submit" class="btn" :disabled="submitting || uploading">{{ submitting ? '发布中...' : '发布活动' }}</button>
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
        location: '',
        image_url: ''
      },
      previewImage: '',
      uploading: false,
      uploadError: '',
      submitting: false
    }
  },
  mounted() {
    if (!isLoggedIn()) {
      this.$router.push('/login')
    }
  },
  methods: {
    async handleImageUpload(event) {
      const file = event.target.files[0]
      if (!file) return

      if (file.size > 16 * 1024 * 1024) {
        this.uploadError = '文件大小不能超过16MB'
        return
      }

      this.uploading = true
      this.uploadError = ''

      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('http://localhost:5000/api/upload', {
          method: 'POST',
          headers: {
            'X-User-ID': JSON.parse(localStorage.getItem('user')).id.toString()
          },
          body: formData
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.message || '上传失败')
        }

        const data = await response.json()
        this.form.image_url = data.file_url
        this.previewImage = data.file_url
      } catch (error) {
        console.error('图片上传失败:', error)
        this.uploadError = error.message || '图片上传失败，请稍后重试'
      } finally {
        this.uploading = false
      }
    },
    removeImage() {
      this.form.image_url = ''
      this.previewImage = ''
      document.getElementById('image').value = ''
    },
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

.image-preview {
  margin-top: 10px;
  position: relative;
}

.image-preview img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.btn-remove {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 12px;
}

.btn-remove:hover {
  background-color: #d32f2f;
}

.upload-status {
  color: #4CAF50;
  font-size: 14px;
  margin-top: 5px;
}

.upload-error {
  color: #f44336;
  font-size: 14px;
  margin-top: 5px;
}

.btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>
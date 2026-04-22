<template>
  <div class="activity-detail">
    <h2>{{ activity.title }}</h2>
    <div class="activity-info">
      <p><strong>时间:</strong> {{ activity.time }}</p>
      <p><strong>地点:</strong> {{ activity.location }}</p>
      <p><strong>发布者:</strong> {{ activity.publisher }}</p>
    </div>
    <div class="activity-description">
      <h3>活动描述</h3>
      <p>{{ activity.description }}</p>
    </div>
    <div class="action-buttons">
      <button class="btn join-btn" @click="joinActivity">报名参加</button>
      <button class="btn collect-btn" @click="collectActivity" :class="{ collected: isCollected }">
        {{ isCollected ? '已收藏' : '收藏' }}
      </button>
      <router-link :to="`/activity/${activity.id}/edit`" class="btn edit-btn">编辑活动</router-link>
      <button class="btn delete-btn" @click="deleteActivity">删除活动</button>
    </div>
    <div class="comments">
      <h3>评论</h3>
      <div class="comment-form">
        <textarea v-model="commentContent" placeholder="写下你的评论..."></textarea>
        <button class="btn" @click="addComment">发表评论</button>
      </div>
      <div class="comment-list">
        <div class="comment-item" v-for="comment in comments" :key="comment.id">
          <p class="comment-user">{{ comment.user }}</p>
          <p class="comment-content">{{ comment.content }}</p>
          <p class="comment-time">{{ comment.time }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      activity: {
        id: 1,
        title: '新生见面会',
        description: '欢迎新生加入我们的大家庭，这里有丰富多彩的校园生活等待着你。我们将为你介绍学校的各个部门和社团，帮助你快速融入校园生活。',
        time: '2026-09-01 14:00',
        location: '大礼堂',
        publisher: '学生会'
      },
      isCollected: false,
      commentContent: '',
      comments: [
        {
          id: 1,
          user: '张三',
          content: '期待这次活动！',
          time: '2026-08-20 10:00'
        },
        {
          id: 2,
          user: '李四',
          content: '我会准时参加的',
          time: '2026-08-21 09:00'
        }
      ]
    }
  },
  methods: {
    joinActivity() {
      console.log('报名参加活动')
      alert('报名成功！')
    },
    collectActivity() {
      this.isCollected = !this.isCollected
      console.log('收藏活动', this.isCollected)
    },
    deleteActivity() {
      if (confirm('确定要删除这个活动吗？')) {
        console.log('删除活动')
        this.$router.push('/my-activities')
      }
    },
    addComment() {
      if (this.commentContent) {
        const newComment = {
          id: this.comments.length + 1,
          user: '当前用户',
          content: this.commentContent,
          time: new Date().toLocaleString()
        }
        this.comments.push(newComment)
        this.commentContent = ''
      }
    }
  }
}
</script>

<style scoped>
.activity-detail {
  max-width: 800px;
  margin: 50px auto;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.activity-detail h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.activity-info {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.activity-info p {
  margin-bottom: 5px;
}

.activity-description {
  margin-bottom: 30px;
}

.activity-description h3 {
  margin-bottom: 10px;
  color: #555;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.join-btn {
  background-color: #4CAF50;
  color: white;
}

.collect-btn {
  background-color: #f0f0f0;
  color: #333;
}

.collect-btn.collected {
  background-color: #ff9800;
  color: white;
}

.edit-btn {
  background-color: #2196F3;
  color: white;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.delete-btn {
  background-color: #f44336;
  color: white;
}

.comments {
  margin-top: 40px;
}

.comments h3 {
  margin-bottom: 20px;
  color: #555;
}

.comment-form {
  margin-bottom: 30px;
}

.comment-form textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  height: 100px;
  margin-bottom: 10px;
}

.comment-list {
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.comment-item {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.comment-user {
  font-weight: bold;
  margin-bottom: 5px;
}

.comment-content {
  margin-bottom: 10px;
}

.comment-time {
  font-size: 12px;
  color: #999;
}
</style>
<template>
  <div class="my-activities">
    <h2>我发布的活动</h2>
    <div class="activity-list">
      <div class="activity-item" v-for="activity in activities" :key="activity.id">
        <h3>{{ activity.title }}</h3>
        <p>{{ activity.description }}</p>
        <p>时间: {{ activity.time }}</p>
        <p>地点: {{ activity.location }}</p>
        <div class="activity-actions">
          <router-link :to="`/activity/${activity.id}`" class="btn">查看详情</router-link>
          <router-link :to="`/activity/${activity.id}/edit`" class="btn edit-btn">编辑</router-link>
          <button class="btn delete-btn" @click="deleteActivity(activity.id)">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      activities: [
        {
          id: 1,
          title: '新生见面会',
          description: '欢迎新生加入我们的大家庭',
          time: '2026-09-01 14:00',
          location: '大礼堂'
        },
        {
          id: 2,
          title: '校园招聘会',
          description: '多家企业现场招聘',
          time: '2026-09-15 10:00',
          location: '体育馆'
        }
      ]
    }
  },
  methods: {
    deleteActivity(id) {
      if (confirm('确定要删除这个活动吗？')) {
        // 删除活动逻辑
        console.log('删除活动', id)
        // 模拟删除成功
        this.activities = this.activities.filter(activity => activity.id !== id)
      }
    }
  }
}
</script>

<style scoped>
.my-activities {
  max-width: 800px;
  margin: 50px auto;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.my-activities h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.activity-item {
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
}

.activity-item h3 {
  margin-bottom: 10px;
  color: #333;
}

.activity-item p {
  margin-bottom: 8px;
  color: #666;
}

.activity-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.btn {
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  font-size: 14px;
}

.edit-btn {
  background-color: #2196F3;
}

.delete-btn {
  background-color: #f44336;
}
</style>
<template>
  <div class="my-collection">
    <h2>我的收藏</h2>
    <div class="activity-list">
      <div class="activity-item" v-for="activity in activities" :key="activity.id">
        <h3>{{ activity.title }}</h3>
        <p>{{ activity.description }}</p>
        <p>时间: {{ activity.time }}</p>
        <p>地点: {{ activity.location }}</p>
        <div class="activity-actions">
          <router-link :to="`/activity/${activity.id}`" class="btn">查看详情</router-link>
          <button class="btn cancel-btn" @click="cancelCollection(activity.id)">取消收藏</button>
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
    cancelCollection(id) {
      // 取消收藏逻辑
      console.log('取消收藏', id)
      // 模拟取消成功
      this.activities = this.activities.filter(activity => activity.id !== id)
    }
  }
}
</script>

<style scoped>
.my-collection {
  max-width: 800px;
  margin: 50px auto;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.my-collection h2 {
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

.cancel-btn {
  background-color: #f44336;
}
</style>
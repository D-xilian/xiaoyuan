<template>
  <div class="my-join">
    <h2>我报名的活动</h2>
    <div class="activity-list">
      <div class="activity-item" v-for="activity in activities" :key="activity.id">
        <h3>{{ activity.title }}</h3>
        <p>{{ activity.description }}</p>
        <p>时间: {{ activity.time }}</p>
        <p>地点: {{ activity.location }}</p>
        <router-link :to="`/activity/${activity.id}`" class="btn">查看详情</router-link>
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
        }
      ]
    }
  }
}
</script>

<style scoped>
.my-join {
  max-width: 800px;
  margin: 50px auto;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.my-join h2 {
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

.btn {
  display: inline-block;
  margin-top: 10px;
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  font-size: 14px;
}
</style>
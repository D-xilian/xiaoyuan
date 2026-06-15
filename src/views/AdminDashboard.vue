<template>
  <div class="admin-dashboard">
    <main class="main">
      <!-- 页面标题 -->
      <div class="page-header">
        <div class="header-content">
          <h2>数据仪表盘</h2>
          <p class="subtitle">实时监控平台数据，掌握活动与志愿者报名情况</p>
        </div>
        <button @click="loadData" class="refresh-btn">
          <span class="btn-icon">🔄</span>
          刷新数据
        </button>
      </div>

      <!-- 概览统计卡片 -->
      <div class="stats-overview">
        <div class="stat-card primary">
          <div class="stat-icon-wrapper">
            <span class="stat-icon">🎉</span>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ statistics?.activities?.total || 0 }}</span>
            <span class="stat-label">活动总数</span>
          </div>
          <div class="stat-trend positive">
            <span>+{{ statistics?.activities?.trend || 0 }}%</span>
          </div>
        </div>
        
        <div class="stat-card success">
          <div class="stat-icon-wrapper">
            <span class="stat-icon">📋</span>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ statistics?.activity_registrations?.total || 0 }}</span>
            <span class="stat-label">活动报名数</span>
          </div>
          <div class="stat-trend positive">
            <span>+{{ statistics?.activity_registrations?.trend || 0 }}%</span>
          </div>
        </div>
        
        <div class="stat-card warning">
          <div class="stat-icon-wrapper">
            <span class="stat-icon">🤝</span>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ statistics?.volunteer_registrations?.total || 0 }}</span>
            <span class="stat-label">志愿者报名数</span>
          </div>
          <div class="stat-trend positive">
            <span>+{{ statistics?.volunteer_registrations?.trend || 0 }}%</span>
          </div>
        </div>
        
        <div class="stat-card info">
          <div class="stat-icon-wrapper">
            <span class="stat-icon">👥</span>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ statistics?.users?.total || 0 }}</span>
            <span class="stat-label">用户总数</span>
          </div>
          <div class="stat-trend positive">
            <span>+{{ statistics?.users?.trend || 0 }}%</span>
          </div>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="charts-section">
        <!-- 志愿者状态分布 -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>志愿者报名状态分布</h3>
          </div>
          <div class="chart-content">
            <div class="pie-chart-container">
              <div class="pie-chart">
                <svg viewBox="0 0 200 200">
                  <circle 
                    cx="100" 
                    cy="100" 
                    r="80" 
                    fill="transparent" 
                    stroke="#ffc107" 
                    stroke-width="32"
                    :stroke-dasharray="getStrokeDasharray(volunteerPendingPercent)"
                    transform="rotate(-90 100 100)"
                    class="pie-slice pending"
                  />
                  <circle 
                    cx="100" 
                    cy="100" 
                    r="80" 
                    fill="transparent" 
                    stroke="#28a745" 
                    stroke-width="32"
                    :stroke-dasharray="getStrokeDasharray(volunteerApprovedPercent)"
                    :stroke-dashoffset="-volunteerPendingOffset"
                    transform="rotate(-90 100 100)"
                    class="pie-slice approved"
                  />
                  <circle 
                    cx="100" 
                    cy="100" 
                    r="80" 
                    fill="transparent" 
                    stroke="#dc3545" 
                    stroke-width="32"
                    :stroke-dasharray="getStrokeDasharray(volunteerRejectedPercent)"
                    :stroke-dashoffset="-volunteerApprovedOffset"
                    transform="rotate(-90 100 100)"
                    class="pie-slice rejected"
                  />
                </svg>
                <div class="pie-center">
                  <span class="pie-total">{{ statistics?.volunteer_registrations?.total || 0 }}</span>
                  <span class="pie-label">总报名</span>
                </div>
              </div>
              <div class="pie-legend">
                <div class="legend-item">
                  <span class="legend-color pending"></span>
                  <span class="legend-text">待审核</span>
                  <span class="legend-value">{{ statistics?.volunteer_registrations?.pending || 0 }}</span>
                </div>
                <div class="legend-item">
                  <span class="legend-color approved"></span>
                  <span class="legend-text">已通过</span>
                  <span class="legend-value">{{ statistics?.volunteer_registrations?.approved || 0 }}</span>
                </div>
                <div class="legend-item">
                  <span class="legend-color rejected"></span>
                  <span class="legend-text">已拒绝</span>
                  <span class="legend-value">{{ statistics?.volunteer_registrations?.rejected || 0 }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 活动分类统计 -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>活动分类分布</h3>
          </div>
          <div class="chart-content">
            <div class="bar-chart">
              <div v-for="category in activityCategories" :key="category.name" class="bar-item">
                <div class="bar-label">{{ category.label }}</div>
                <div class="bar-track">
                  <div 
                    class="bar-fill" 
                    :style="{ width: category.percent + '%', backgroundColor: category.color }"
                  ></div>
                </div>
                <div class="bar-value">{{ category.count }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 详细数据表格 -->
      <div class="tables-section">
        <!-- 热门活动 -->
        <div class="table-card">
          <div class="table-header">
            <h3>热门活动 TOP 5</h3>
            <router-link to="/admin/activities" class="view-all">查看全部</router-link>
          </div>
          <div class="table-content">
            <table class="data-table">
              <thead>
                <tr>
                  <th>排名</th>
                  <th>活动名称</th>
                  <th>分类</th>
                  <th>报名人数</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(activity, index) in topActivities" :key="activity.id">
                  <td><span class="rank-badge" :class="'rank-' + (index + 1)">{{ index + 1 }}</span></td>
                  <td class="activity-name">{{ activity.title }}</td>
                  <td><span class="category-tag">{{ getCategoryLabel(activity.category) }}</span></td>
                  <td class="participants">{{ activity.participants_count }}</td>
                  <td><span class="status-tag active">进行中</span></td>
                </tr>
              </tbody>
            </table>
            <div v-if="topActivities.length === 0" class="empty-state">
              暂无活动数据
            </div>
          </div>
        </div>

        <!-- 最新志愿者报名 -->
        <div class="table-card">
          <div class="table-header">
            <h3>最新志愿者报名</h3>
            <router-link to="/admin/volunteers" class="view-all">查看全部</router-link>
          </div>
          <div class="table-content">
            <table class="data-table">
              <thead>
                <tr>
                  <th>姓名</th>
                  <th>学号</th>
                  <th>院系</th>
                  <th>服务类型</th>
                  <th>状态</th>
                  <th>报名时间</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="volunteer in latestVolunteers" :key="volunteer.id">
                  <td>{{ volunteer.name }}</td>
                  <td>{{ volunteer.student_id }}</td>
                  <td>{{ volunteer.department }}</td>
                  <td>{{ volunteer.service_type || '-' }}</td>
                  <td><span class="status-tag" :class="volunteer.status">{{ getStatusLabel(volunteer.status) }}</span></td>
                  <td>{{ formatTime(volunteer.registration_time) }}</td>
                </tr>
              </tbody>
            </table>
            <div v-if="latestVolunteers.length === 0" class="empty-state">
              暂无志愿者报名数据
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { apiGet, isAdmin } from '../utils/api'

export default {
  name: 'AdminDashboard',
  data() {
    return {
      statistics: null,
      topActivities: [],
      latestVolunteers: [],
      loading: false
    }
  },
  computed: {
    volunteerPendingPercent() {
      const total = this.statistics?.volunteer_registrations?.total || 1
      const pending = this.statistics?.volunteer_registrations?.pending || 0
      return (pending / total) * 100
    },
    volunteerApprovedPercent() {
      const total = this.statistics?.volunteer_registrations?.total || 1
      const approved = this.statistics?.volunteer_registrations?.approved || 0
      return (approved / total) * 100
    },
    volunteerRejectedPercent() {
      const total = this.statistics?.volunteer_registrations?.total || 1
      const rejected = this.statistics?.volunteer_registrations?.rejected || 0
      return (rejected / total) * 100
    },
    volunteerPendingOffset() {
      return (this.volunteerPendingPercent / 100) * 502.65
    },
    volunteerApprovedOffset() {
      return this.volunteerPendingOffset + (this.volunteerApprovedPercent / 100) * 502.65
    },
    activityCategories() {
      const categories = [
        { name: 'sports', label: '体育运动', color: '#e74c3c' },
        { name: 'academic', label: '学术科技', color: '#3498db' },
        { name: 'art', label: '文化艺术', color: '#9b59b6' },
        { name: 'social', label: '社会实践', color: '#2ecc71' },
        { name: 'entertainment', label: '娱乐休闲', color: '#f39c12' },
        { name: 'other', label: '其他', color: '#7f8c8d' }
      ]
      
      const categoryStats = this.statistics?.activity_categories || {}
      const total = Object.values(categoryStats).reduce((sum, count) => sum + count, 0) || 1
      
      return categories.map(cat => ({
        ...cat,
        count: categoryStats[cat.name] || 0,
        percent: total > 0 ? ((categoryStats[cat.name] || 0) / total) * 100 : 0
      })).sort((a, b) => b.count - a.count)
    }
  },
  mounted() {
    if (!isAdmin()) {
      alert('无权限访问此页面')
      this.$router.push('/')
      return
    }
    this.loadData()
  },
  methods: {
    async loadData() {
      this.loading = true
      
      try {
        // 并行加载数据
        const [statsResponse, activitiesResponse, volunteersResponse] = await Promise.all([
          apiGet('/admin/dashboard-statistics'),
          apiGet('/admin/activities'),
          apiGet('/admin/volunteer-registrations?status=all')
        ])
        
        if (statsResponse.ok) {
          this.statistics = await statsResponse.json()
        }
        
        if (activitiesResponse.ok) {
          const activities = await activitiesResponse.json()
          this.topActivities = activities
            .sort((a, b) => b.participants_count - a.participants_count)
            .slice(0, 5)
        }
        
        if (volunteersResponse.ok) {
          const volunteers = await volunteersResponse.json()
          this.latestVolunteers = volunteers.slice(0, 5)
        }
      } catch (error) {
        console.error('加载数据失败:', error)
      } finally {
        this.loading = false
      }
    },
    getStrokeDasharray(percent) {
      const circumference = 2 * Math.PI * 80
      const length = (percent / 100) * circumference
      return `${length} ${circumference - length}`
    },
    getCategoryLabel(category) {
      const categoryMap = {
        sports: '体育运动',
        academic: '学术科技',
        art: '文化艺术',
        social: '社会实践',
        entertainment: '娱乐休闲',
        other: '其他'
      }
      return categoryMap[category] || category
    },
    getStatusLabel(status) {
      const statusMap = {
        pending: '待审核',
        approved: '已通过',
        rejected: '已拒绝'
      }
      return statusMap[status] || status
    },
    formatTime(timeStr) {
      if (!timeStr) return '-'
      const date = new Date(timeStr)
      return date.toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }
}
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.main {
  padding: 30px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header-content h2 {
  margin: 0 0 5px 0;
  font-size: 28px;
  color: #333;
}

.subtitle {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.refresh-btn:hover {
  background: #0b7dda;
}

.btn-icon {
  font-size: 14px;
}

/* 概览统计卡片 */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
}

.stat-card.primary::before {
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
}

.stat-card.success::before {
  background: linear-gradient(180deg, #28a745 0%, #20c997 100%);
}

.stat-card.warning::before {
  background: linear-gradient(180deg, #ffc107 0%, #fd7e14 100%);
}

.stat-card.info::before {
  background: linear-gradient(180deg, #2196F3 0%, #3f51b5 100%);
}

.stat-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-card.primary .stat-icon-wrapper {
  background: linear-gradient(135deg, #e8eaf6 0%, #e1bee7 100%);
}

.stat-card.success .stat-icon-wrapper {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
}

.stat-card.warning .stat-icon-wrapper {
  background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%);
}

.stat-card.info .stat-icon-wrapper {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
}

.stat-icon {
  font-size: 28px;
}

.stat-content {
  flex: 1;
}

.stat-value {
  display: block;
  font-size: 32px;
  font-weight: bold;
  color: #333;
}

.stat-label {
  display: block;
  font-size: 14px;
  color: #999;
  margin-top: 4px;
}

.stat-trend {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.stat-trend.positive {
  background: #e8f5e9;
  color: #28a745;
}

/* 图表区域 */
.charts-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 25px;
  margin-bottom: 30px;
}

.chart-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  overflow: hidden;
}

.chart-header {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.chart-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.chart-content {
  padding: 24px;
}

/* 饼图 */
.pie-chart-container {
  display: flex;
  align-items: center;
  gap: 40px;
}

.pie-chart {
  position: relative;
  width: 200px;
  height: 200px;
}

.pie-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.pie-total {
  display: block;
  font-size: 28px;
  font-weight: bold;
  color: #333;
}

.pie-label {
  display: block;
  font-size: 12px;
  color: #999;
}

.pie-slice {
  transition: stroke-dasharray 0.5s ease;
}

.pie-legend {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.legend-color.pending {
  background: #ffc107;
}

.legend-color.approved {
  background: #28a745;
}

.legend-color.rejected {
  background: #dc3545;
}

.legend-text {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.legend-value {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

/* 柱状图 */
.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.bar-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.bar-label {
  width: 70px;
  font-size: 13px;
  color: #666;
}

.bar-track {
  flex: 1;
  height: 24px;
  background: #f0f0f0;
  border-radius: 12px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 12px;
  transition: width 0.5s ease;
}

.bar-value {
  width: 40px;
  text-align: right;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

/* 表格区域 */
.tables-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 25px;
}

.table-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.table-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.view-all {
  font-size: 13px;
  color: #2196F3;
  text-decoration: none;
}

.view-all:hover {
  text-decoration: underline;
}

.table-content {
  padding: 0;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 14px 24px;
  text-align: left;
  font-size: 14px;
}

.data-table th {
  background: #f8f9fa;
  color: #666;
  font-weight: 600;
}

.data-table tr:not(:last-child) td {
  border-bottom: 1px solid #f0f0f0;
}

.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: bold;
  color: white;
}

.rank-1 {
  background: linear-gradient(135deg, #ffd700 0%, #ffb700 100%);
}

.rank-2 {
  background: linear-gradient(135deg, #c0c0c0 0%, #a0a0a0 100%);
}

.rank-3 {
  background: linear-gradient(135deg, #cd7f32 0%, #b87333 100%);
}

.rank-4,
.rank-5 {
  background: #999;
}

.activity-name {
  color: #333;
  font-weight: 500;
}

.category-tag {
  padding: 4px 10px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 6px;
  font-size: 12px;
}

.participants {
  font-weight: 600;
  color: #4CAF50;
}

.status-tag {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.status-tag.active {
  background: #d4edda;
  color: #155724;
}

.status-tag.pending {
  background: #fff3cd;
  color: #856404;
}

.status-tag.approved {
  background: #d4edda;
  color: #155724;
}

.status-tag.rejected {
  background: #f8d7da;
  color: #721c24;
}

.empty-state {
  padding: 40px;
  text-align: center;
  color: #999;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .stats-overview {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .charts-section {
    grid-template-columns: 1fr;
  }
  
  .tables-section {
    grid-template-columns: 1fr;
  }
}

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
  
  .stats-overview {
    grid-template-columns: 1fr;
  }
  
  .pie-chart-container {
    flex-direction: column;
  }
  
  .data-table th,
  .data-table td {
    padding: 10px 12px;
    font-size: 12px;
  }
  
  .bar-label {
    width: 50px;
  }
}
</style>
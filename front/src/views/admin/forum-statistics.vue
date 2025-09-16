<template>
  <div class="app-container">
    <div class="statistics-header">
      <h2>论坛数据统计</h2>
      <div class="header-actions">
        <el-button type="primary" :icon="Refresh" @click="refreshData" :loading="loading">刷新数据</el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon total">
          <el-icon><Document /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ statisticsData.totalPosts || 0 }}</div>
          <div class="stat-label">总帖子数</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon pending">
          <el-icon><Clock /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ statisticsData.pendingPosts || 0 }}</div>
          <div class="stat-label">待审核</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon approved">
          <el-icon><Check /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ statisticsData.approvedPosts || 0 }}</div>
          <div class="stat-label">已通过</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon rejected">
          <el-icon><Close /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ statisticsData.rejectedPosts || 0 }}</div>
          <div class="stat-label">已拒绝</div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-container">
      <!-- 第一行图表 -->
      <div class="chart-row">
        <!-- 建议类型分布 - 饼图 -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>建议类型分布</h3>
            <el-tag type="info">饼图</el-tag>
          </div>
          <div ref="categoryChartRef" class="chart-container"></div>
        </div>
        
        <!-- 审核状态统计 - 环形图 -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>审核状态统计</h3>
            <el-tag type="warning">环形图</el-tag>
          </div>
          <div ref="statusChartRef" class="chart-container"></div>
        </div>
      </div>

      <!-- 第二行图表 -->
      <div class="chart-row">
        <!-- 热门帖子排行 - 柱状图 -->
        <div class="chart-card full-width">
          <div class="chart-header">
            <h3>热门帖子排行（按点赞数）</h3>
            <el-tag type="success">柱状图</el-tag>
          </div>
          <div ref="hotPostsChartRef" class="chart-container large"></div>
        </div>
      </div>

      <!-- 第三行图表 -->
      <div class="chart-row">
        <!-- 月度发帖趋势 - 折线图 -->
        <div class="chart-card full-width">
          <div class="chart-header">
            <h3>月度发帖和评论趋势</h3>
            <el-tag type="primary">折线图</el-tag>
          </div>
          <div ref="trendChartRef" class="chart-container large"></div>
        </div>
      </div>
    </div>

    <!-- 热门帖子列表 -->
    <div class="hot-posts-section">
      <div class="section-header">
        <h3>热门帖子详情</h3>
      </div>
      <el-table :data="statisticsData.hotPosts || []" border style="width: 100%">
        <el-table-column prop="title" label="帖子标题" width="300" show-overflow-tooltip />
        <el-table-column prop="categoryDesc" label="分类" width="120">
          <template #default="scope">
            <el-tag :type="getCategoryTagType(scope.row.category)">
              {{ scope.row.categoryDesc }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="发帖用户" width="120" />
        <el-table-column prop="viewCount" label="浏览量" width="100" />
        <el-table-column prop="likeCount" label="点赞数" width="100" />
        <el-table-column prop="commentCount" label="评论数" width="100" />
        <el-table-column prop="createdAt" label="发布时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="scope">
            <el-button size="small" type="primary" @click="viewPost(scope.row.id)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Document, Clock, Check, Close } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { forumStatisticsAPI, forumUtils } from '@/api/forum'
import { useRouter } from 'vue-router'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const statisticsData = reactive({
  totalPosts: 0,
  pendingPosts: 0,
  approvedPosts: 0,
  rejectedPosts: 0,
  categoryStatistics: [],
  hotPosts: [],
  latestPosts: [],
  monthlyStatistics: []
})

// 图表引用
const categoryChartRef = ref()
const statusChartRef = ref()
const hotPostsChartRef = ref()
const trendChartRef = ref()

// 图表实例
let categoryChart = null
let statusChart = null
let hotPostsChart = null
let trendChart = null

// 获取统计数据
const getStatisticsData = async () => {
  loading.value = true
  try {
    const response = await forumStatisticsAPI.getForumOverview()
    const data = response.data
    
    // 更新统计数据
    Object.assign(statisticsData, data)
    
    // 确保数组字段不为null
    if (!statisticsData.categoryStatistics) statisticsData.categoryStatistics = []
    if (!statisticsData.hotPosts) statisticsData.hotPosts = []
    if (!statisticsData.latestPosts) statisticsData.latestPosts = []
    if (!statisticsData.monthlyStatistics) statisticsData.monthlyStatistics = []
    
    // 更新图表
    await nextTick()
    updateCharts()
    
  } catch (error) {
    console.error('获取统计数据失败:', error)
    ElMessage.error('获取统计数据失败，请检查后端服务是否正常')
    
    // 设置默认值避免页面崩溃
    statisticsData.totalPosts = 0
    statisticsData.pendingPosts = 0
    statisticsData.approvedPosts = 0
    statisticsData.rejectedPosts = 0
    statisticsData.categoryStatistics = []
    statisticsData.hotPosts = []
    statisticsData.latestPosts = []
    statisticsData.monthlyStatistics = []
    
    // 即使出错也要更新图表，显示空状态
    await nextTick()
    updateCharts()
  } finally {
    loading.value = false
  }
}

// 刷新数据
const refreshData = () => {
  getStatisticsData()
}

// 初始化图表
const initCharts = () => {
  // 建议类型分布饼图
  if (categoryChartRef.value) {
    categoryChart = echarts.init(categoryChartRef.value)
  }
  
  // 审核状态环形图
  if (statusChartRef.value) {
    statusChart = echarts.init(statusChartRef.value)
  }
  
  // 热门帖子柱状图
  if (hotPostsChartRef.value) {
    hotPostsChart = echarts.init(hotPostsChartRef.value)
  }
  
  // 月度趋势折线图
  if (trendChartRef.value) {
    trendChart = echarts.init(trendChartRef.value)
  }
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
}

// 更新图表
const updateCharts = () => {
  updateCategoryChart()
  updateStatusChart()
  updateHotPostsChart()
  updateTrendChart()
}

// 更新建议类型分布饼图
const updateCategoryChart = () => {
  if (!categoryChart) return
  
  let data = []
  if (statisticsData.categoryStatistics && statisticsData.categoryStatistics.length > 0) {
    data = statisticsData.categoryStatistics.map(item => ({
      name: item.categoryDesc,
      value: item.count
    }))
  } else {
    // 当没有数据时显示默认信息
    data = [{ name: '暂无数据', value: 0 }]
  }
  
  const option = {
    title: {
      text: '建议类型分布',
      left: 'center',
      top: 20,
      textStyle: {
        fontSize: 16
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
      data: data.map(item => item.name)
    },
    series: [
      {
        name: '建议类型',
        type: 'pie',
        radius: '55%',
        center: ['60%', '50%'],
        data: data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        itemStyle: {
          borderRadius: 5,
          borderColor: '#fff',
          borderWidth: 2
        }
      }
    ]
  }
  
  categoryChart.setOption(option)
}

// 更新审核状态环形图
const updateStatusChart = () => {
  if (!statusChart) return
  
  const data = [
    { name: '待审核', value: statisticsData.pendingPosts, itemStyle: { color: '#E6A23C' } },
    { name: '已通过', value: statisticsData.approvedPosts, itemStyle: { color: '#67C23A' } },
    { name: '已拒绝', value: statisticsData.rejectedPosts, itemStyle: { color: '#F56C6C' } }
  ]
  
  const option = {
    title: {
      text: '审核状态',
      left: 'center',
      top: 20,
      textStyle: {
        fontSize: 16
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
      data: data.map(item => item.name)
    },
    series: [
      {
        name: '审核状态',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['60%', '50%'],
        data: data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        itemStyle: {
          borderRadius: 5,
          borderColor: '#fff',
          borderWidth: 2
        }
      }
    ]
  }
  
  statusChart.setOption(option)
}

// 更新热门帖子柱状图
const updateHotPostsChart = () => {
  if (!hotPostsChart) return
  
  let data = []
  let categories = []
  let likeData = []
  let viewData = []
  
  if (statisticsData.hotPosts && statisticsData.hotPosts.length > 0) {
    data = statisticsData.hotPosts.slice(0, 10) // 只显示前10个
    categories = data.map(item => item.title.length > 15 ? item.title.substring(0, 15) + '...' : item.title)
    likeData = data.map(item => item.likeCount || 0)
    viewData = data.map(item => item.viewCount || 0)
  } else {
    // 当没有数据时显示默认信息
    categories = ['暂无数据']
    likeData = [0]
    viewData = [0]
  }
  
  const option = {
    title: {
      text: '热门帖子排行',
      left: 'center',
      top: 20,
      textStyle: {
        fontSize: 16
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['点赞数', '浏览量'],
      top: 50
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '20%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: {
        rotate: 45,
        interval: 0
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '点赞数',
        position: 'left'
      },
      {
        type: 'value',
        name: '浏览量',
        position: 'right'
      }
    ],
    series: [
      {
        name: '点赞数',
        type: 'bar',
        data: likeData,
        itemStyle: {
          color: '#409EFF'
        }
      },
      {
        name: '浏览量',
        type: 'bar',
        yAxisIndex: 1,
        data: viewData,
        itemStyle: {
          color: '#67C23A'
        }
      }
    ]
  }
  
  hotPostsChart.setOption(option)
}

// 更新月度趋势折线图
const updateTrendChart = () => {
  if (!trendChart) return
  
  let data = []
  let months = []
  let postData = []
  let commentData = []
  
  if (statisticsData.monthlyStatistics && statisticsData.monthlyStatistics.length > 0) {
    data = [...statisticsData.monthlyStatistics].reverse() // 按时间正序，使用扩展运算符避免修改原数组
    months = data.map(item => item.month)
    postData = data.map(item => item.postCount || 0)
    commentData = data.map(item => item.commentCount || 0)
  } else {
    // 当没有数据时显示默认信息
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM格式
    months = [currentMonth]
    postData = [0]
    commentData = [0]
  }
  
  const option = {
    title: {
      text: '月度发帖和评论趋势',
      left: 'center',
      top: 20,
      textStyle: {
        fontSize: 16
      }
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['帖子数', '评论数'],
      top: 50
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '20%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: months
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '帖子数',
        type: 'line',
        data: postData,
        smooth: true,
        itemStyle: {
          color: '#409EFF'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
              { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
            ]
          }
        }
      },
      {
        name: '评论数',
        type: 'line',
        data: commentData,
        smooth: true,
        itemStyle: {
          color: '#67C23A'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
              { offset: 1, color: 'rgba(103, 194, 58, 0.1)' }
            ]
          }
        }
      }
    ]
  }
  
  trendChart.setOption(option)
}

// 处理窗口大小变化
const handleResize = () => {
  if (categoryChart) categoryChart.resize()
  if (statusChart) statusChart.resize()
  if (hotPostsChart) hotPostsChart.resize()
  if (trendChart) trendChart.resize()
}

// 查看帖子详情
const viewPost = (postId) => {
  // 这里可以跳转到帖子详情页面或打开对话框
  router.push(`/admin/forum-posts?id=${postId}`)
}

// 工具方法
const getCategoryTagType = (category) => {
  const typeMap = {
    'environment': 'success',
    'infrastructure': 'warning',
    'agriculture': 'primary',
    'tourism': 'info',
    'education': 'danger',
    'other': ''
  }
  return typeMap[category] || ''
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN')
}

// 生命周期
onMounted(async () => {
  await nextTick()
  initCharts()
  getStatisticsData()
})

onBeforeUnmount(() => {
  // 销毁图表实例
  if (categoryChart) {
    categoryChart.dispose()
    categoryChart = null
  }
  if (statusChart) {
    statusChart.dispose()
    statusChart = null
  }
  if (hotPostsChart) {
    hotPostsChart.dispose()
    hotPostsChart = null
  }
  if (trendChart) {
    trendChart.dispose()
    trendChart = null
  }
  
  // 移除窗口大小变化监听
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.statistics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.statistics-header h2 {
  margin: 0;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 10px;
}

/* 统计卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #409EFF;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 24px;
  color: #fff;
}

.stat-icon.total {
  background: linear-gradient(135deg, #409EFF, #66B1FF);
}

.stat-icon.pending {
  background: linear-gradient(135deg, #E6A23C, #F0C78A);
}

.stat-icon.approved {
  background: linear-gradient(135deg, #67C23A, #95D475);
}

.stat-icon.rejected {
  background: linear-gradient(135deg, #F56C6C, #F89898);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-top: 5px;
}

/* 图表容器 */
.charts-container {
  margin-bottom: 30px;
}

.chart-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.chart-row:last-child {
  margin-bottom: 0;
}

.chart-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.chart-card.full-width {
  grid-column: 1 / -1;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.chart-header h3 {
  margin: 0;
  color: #333;
  font-size: 16px;
}

.chart-container {
  width: 100%;
  height: 300px;
}

.chart-container.large {
  height: 400px;
}

/* 热门帖子列表 */
.hot-posts-section {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.section-header {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.section-header h3 {
  margin: 0;
  color: #333;
  font-size: 16px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .chart-row {
    grid-template-columns: 1fr;
  }
  
  .stats-cards {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}

@media (max-width: 768px) {
  .app-container {
    padding: 10px;
  }
  
  .statistics-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .chart-container {
    height: 250px;
  }
  
  .chart-container.large {
    height: 300px;
  }
}
</style>

<template>
  <div class="dashboard-container">
    <!-- 欢迎横幅 -->
    <div class="welcome-banner">
      <div class="banner-content">
        <div class="welcome-text">
          <h1>🌸 欢迎来到乡村振兴·新桃源智界管理后台</h1>
          <p>数据驱动决策，智慧助力乡村振兴发展</p>
          <div class="welcome-stats">
            <span>今日访问：{{ todayVisits }}</span>
            <span>在线用户：{{ onlineUsers }}</span>
            <span>系统运行：{{ systemUptime }}天</span>
          </div>
        </div>
        <div class="welcome-time">
          <div class="current-time">{{ currentTime }}</div>
          <div class="current-date">{{ currentDate }}</div>
        </div>
      </div>
    </div>

    <!-- 核心指标卡片 -->
    <el-row :gutter="20" class="stats-section">
      <el-col :xs="12" :sm="6" :md="6" :lg="6">
        <div class="stats-card attraction-card" @click="$router.push('/admin/attractions')">
          <div class="stats-icon">
              <el-icon><MapLocation /></el-icon>
          </div>
          <div class="stats-content">
            <div class="stats-number">{{ stats.attractionCount || 0 }}</div>
            <div class="stats-label">景点总数</div>
            <div class="stats-trend" :class="{ 'trend-up': attractionTrend > 0 }">
              <el-icon><ArrowUp v-if="attractionTrend > 0" /><ArrowDown v-else /></el-icon>
              {{ Math.abs(attractionTrend) }}%
            </div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6" :md="6" :lg="6">
        <div class="stats-card product-card" @click="$router.push('/admin/products')">
          <div class="stats-icon">
            <el-icon><ShoppingBag /></el-icon>
          </div>
          <div class="stats-content">
            <div class="stats-number">{{ stats.productCount || 0 }}</div>
            <div class="stats-label">商品总数</div>
            <div class="stats-trend" :class="{ 'trend-up': productTrend > 0 }">
              <el-icon><ArrowUp v-if="productTrend > 0" /><ArrowDown v-else /></el-icon>
              {{ Math.abs(productTrend) }}%
            </div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6" :md="6" :lg="6">
        <div class="stats-card order-card" @click="$router.push('/admin/orders')">
          <div class="stats-icon">
            <el-icon><ShoppingCart /></el-icon>
          </div>
          <div class="stats-content">
            <div class="stats-number">{{ stats.orderCount || 0 }}</div>
            <div class="stats-label">订单总数</div>
            <div class="stats-trend" :class="{ 'trend-up': orderTrend > 0 }">
              <el-icon><ArrowUp v-if="orderTrend > 0" /><ArrowDown v-else /></el-icon>
              {{ Math.abs(orderTrend) }}%
            </div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6" :md="6" :lg="6">
        <div class="stats-card news-card" @click="$router.push('/admin/news')">
          <div class="stats-icon">
            <el-icon><Document /></el-icon>
          </div>
          <div class="stats-content">
            <div class="stats-number">{{ stats.newsCount || 0 }}</div>
            <div class="stats-label">资讯总数</div>
            <div class="stats-trend" :class="{ 'trend-up': newsTrend > 0 }">
              <el-icon><ArrowUp v-if="newsTrend > 0" /><ArrowDown v-else /></el-icon>
              {{ Math.abs(newsTrend) }}%
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 图表分析区域 -->
    <el-row :gutter="20" class="charts-section">
      <!-- 数据趋势图 -->
      <el-col :xs="24" :sm="24" :md="16" :lg="16">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><TrendCharts /></el-icon>
                数据趋势分析
              </span>
              <el-radio-group v-model="trendPeriod" size="small">
                <el-radio-button label="7">近7天</el-radio-button>
                <el-radio-button label="30">近30天</el-radio-button>
                <el-radio-button label="90">近3个月</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="trendChart" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 分类统计饼图 -->
      <el-col :xs="24" :sm="24" :md="8" :lg="8">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><PieChart /></el-icon>
                业务分布
              </span>
            </div>
          </template>
          <div ref="pieChart" class="chart-container chart-small"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 详细统计和快捷操作 -->
    <el-row :gutter="20" class="detail-section">
      <!-- 订单状态统计 -->
      <el-col :xs="24" :sm="12" :md="8" :lg="8">
        <el-card class="detail-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">
              <el-icon><List /></el-icon>
                订单状态
              </span>
            </div>
          </template>
          <div class="order-status-list">
            <div class="status-item" v-for="item in orderStatusStats" :key="item.status">
              <div class="status-info">
                <span class="status-name">{{ item.name }}</span>
                <span class="status-count">{{ item.count }}</span>
              </div>
              <el-progress 
                :percentage="item.percentage" 
                :color="item.color"
                :show-text="false"
                :stroke-width="6"
              />
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 论坛活跃度 -->
      <el-col :xs="24" :sm="12" :md="8" :lg="8">
        <el-card class="detail-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><ChatDotRound /></el-icon>
                论坛活跃度
              </span>
            </div>
          </template>
          <div class="forum-stats">
            <div class="forum-item">
              <div class="forum-icon posts">
              <el-icon><Document /></el-icon>
              </div>
              <div class="forum-info">
                <div class="forum-number">{{ forumStats.postCount || 0 }}</div>
                <div class="forum-label">总帖子数</div>
              </div>
            </div>
            <div class="forum-item">
              <div class="forum-icon comments">
                <el-icon><ChatDotRound /></el-icon>
              </div>
              <div class="forum-info">
                <div class="forum-number">{{ forumStats.commentCount || 0 }}</div>
                <div class="forum-label">总评论数</div>
              </div>
            </div>
            <div class="forum-item">
              <div class="forum-icon active">
                <el-icon><User /></el-icon>
              </div>
              <div class="forum-info">
                <div class="forum-number">{{ forumStats.activeUsers || 0 }}</div>
                <div class="forum-label">活跃用户</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

    <!-- 快捷操作 -->
      <el-col :xs="24" :sm="24" :md="8" :lg="8">
        <el-card class="detail-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><Operation /></el-icon>
                快捷操作
              </span>
            </div>
          </template>
          <div class="quick-actions">
            <el-button 
              style="margin-left: 12px;"
              type="primary" 
              class="action-btn"
              @click="$router.push('/admin/attractions')"
            >
              <el-icon><MapLocation /></el-icon>
              管理景点
            </el-button>
            <el-button 
              type="success" 
              class="action-btn"
              @click="$router.push('/admin/products')"
            >
              <el-icon><ShoppingBag /></el-icon>
              管理商品
            </el-button>
            <el-button 
              type="warning" 
              class="action-btn"
              @click="$router.push('/admin/orders')"
            >
              <el-icon><ShoppingCart /></el-icon>
              订单管理
            </el-button>
            <el-button 
              type="info" 
              class="action-btn"
              @click="$router.push('/admin/news')"
            >
              <el-icon><Document /></el-icon>
              发布资讯
            </el-button>
            <el-button 
              type="primary" 
              class="action-btn"
              @click="$router.push('/admin/forum-posts')"
            >
              <el-icon><ChatDotRound /></el-icon>
              论坛管理
            </el-button>
            <el-button 
              type="danger" 
              class="action-btn"
              @click="$router.push('/admin/system-logs')"
            >
              <el-icon><Monitor /></el-icon>
              系统日志
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 系统信息 -->
    <el-row :gutter="20" class="system-section">
      <el-col :span="24">
        <el-card class="system-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><Setting /></el-icon>
                系统信息
              </span>
            </div>
          </template>
          <div class="system-info-grid">
            <div class="info-item">
              <div class="info-icon">
                <el-icon><Cpu /></el-icon>
              </div>
              <div class="info-content">
                <div class="info-label">系统版本</div>
                <div class="info-value">v1.0.0</div>
              </div>
            </div>
            <div class="info-item">
              <div class="info-icon">
                <el-icon><User /></el-icon>
              </div>
              <div class="info-content">
                <div class="info-label">登录用户</div>
                <div class="info-value">{{ userStore.username }}</div>
              </div>
            </div>
            <div class="info-item">
              <div class="info-icon">
                <el-icon><Key /></el-icon>
              </div>
              <div class="info-content">
                <div class="info-label">用户角色</div>
                <div class="info-value">{{ userStore.userRole }}</div>
              </div>
            </div>
            <div class="info-item">
              <div class="info-icon">
                <el-icon><Timer /></el-icon>
              </div>
              <div class="info-content">
                <div class="info-label">运行时间</div>
                <div class="info-value">{{ systemUptime }}天</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { 
  MapLocation, ShoppingBag, ShoppingCart, Document, 
  ArrowUp, ArrowDown, TrendCharts, PieChart, List, 
  ChatDotRound, User, Operation, Setting, Cpu, 
  Key, Timer, Monitor 
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import * as echarts from 'echarts'
import attractionApi from '@/api/attraction'
import productApi from '@/api/product'
import orderApi from '@/api/order'
import newsApi from '@/api/news'
import { forumStatisticsAPI } from '@/api/forum'
import { getUserStats } from '@/api/user'

const userStore = useUserStore()

// 时间相关
const currentTime = ref('')
const currentDate = ref('')

// 基础统计数据
const stats = ref({
  attractionCount: 0,
  productCount: 0,
  orderCount: 0,
  newsCount: 0
})

// 趋势数据
const attractionTrend = ref(5.2)
const productTrend = ref(3.1)
const orderTrend = ref(8.7)
const newsTrend = ref(2.4)

// 系统信息
const todayVisits = ref(1247)
const onlineUsers = ref(89)
const systemUptime = ref(127)

// 论坛统计
const forumStats = ref({
  postCount: 0,
  commentCount: 0,
  activeUsers: 0
})

// 订单状态统计
const orderStatusStats = ref([
  { status: 'pending', name: '待付款', count: 15, percentage: 25, color: '#f56c6c' },
  { status: 'paid', name: '已付款', count: 32, percentage: 53, color: '#67c23a' },
  { status: 'shipped', name: '已发货', count: 8, percentage: 13, color: '#409eff' },
  { status: 'completed', name: '已完成', count: 5, percentage: 9, color: '#909399' }
])

// 图表相关
const trendChart = ref(null)
const pieChart = ref(null)
const trendPeriod = ref('7')
let trendChartInstance = null
let pieChartInstance = null

// 更新时间
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString()
  currentDate.value = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
}

// 初始化基础统计数据
const initStats = async () => {
  try {
    // 获取景点统计
    const attractionRes = await attractionApi.getAttractionPage({ pageNum: 1, pageSize: 1 })
    if (attractionRes.code === 200) {
      stats.value.attractionCount = attractionRes.data.total || 0
    }

    // 获取商品统计
    const productRes = await productApi.getProductPage({ pageNum: 1, pageSize: 1 })
    if (productRes.code === 200) {
      stats.value.productCount = productRes.data.total || 0
    }

    // 获取订单统计
    const orderRes = await orderApi.getOrderPage({ pageNum: 1, pageSize: 1 })
    if (orderRes.code === 200) {
      stats.value.orderCount = orderRes.data.total || 0
    }

    // 获取资讯统计
    const newsRes = await newsApi.getNewsPage({ pageNum: 1, pageSize: 1 })
    if (newsRes.code === 200) {
      stats.value.newsCount = newsRes.data.total || 0
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 初始化论坛统计数据
const initForumStats = async () => {
  try {
    const res = await forumStatisticsAPI.getForumOverview()
    if (res.code === 200) {
      forumStats.value = {
        postCount: res.data.totalPosts || res.data.approvedPosts || 0,
        commentCount: res.data.totalComments || 0,
        activeUsers: res.data.activeUsers || 10 // 默认值，因为后端可能没有这个字段
      }
    }
  } catch (error) {
    console.error('获取论坛统计失败:', error)
    // 设置默认值
    forumStats.value = {
      postCount: 1,
      commentCount: 3,
      activeUsers: 5
    }
  }
}

// 初始化订单状态统计
const initOrderStats = async () => {
  try {
    const res = await orderApi.getOrderStats()
    if (res.code === 200 && res.data.statusStats) {
      orderStatusStats.value = res.data.statusStats.map(item => ({
        status: item.status,
        name: item.name,
        count: item.count,
        percentage: item.percentage,
        color: item.color
      }))
    }
  } catch (error) {
    console.error('获取订单统计失败:', error)
    // 设置默认值
    orderStatusStats.value = [
      { status: 'PENDING', name: '待付款', count: 15, percentage: 25, color: '#f56c6c' },
      { status: 'PAID', name: '已付款', count: 32, percentage: 53, color: '#67c23a' },
      { status: 'SHIPPED', name: '已发货', count: 8, percentage: 13, color: '#409eff' },
      { status: 'COMPLETED', name: '已完成', count: 5, percentage: 9, color: '#909399' }
    ]
  }
}

// 初始化趋势图表
const initTrendChart = () => {
  if (!trendChart.value) return
  
  trendChartInstance = echarts.init(trendChart.value)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    legend: {
      data: ['景点', '商品', '订单', '资讯'],
      textStyle: {
        color: '#666'
      },
      bottom: '5%'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        data: ['第1天', '第2天', '第3天', '第4天', '第5天', '第6天', '第7天'],
        axisLine: {
          lineStyle: {
            color: '#e0e6ed'
          }
        },
        axisLabel: {
          color: '#666'
        }
      }
    ],
    yAxis: [
      {
        type: 'value',
        axisLine: {
          lineStyle: {
            color: '#e0e6ed'
          }
        },
        axisLabel: {
          color: '#666'
        },
        splitLine: {
          lineStyle: {
            color: '#f0f2f5'
          }
        }
      }
    ],
    series: [
      {
        name: '景点',
        type: 'line',
        stack: 'Total',
        smooth: true,
        lineStyle: {
          color: '#667eea'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(102, 126, 234, 0.3)' },
            { offset: 1, color: 'rgba(102, 126, 234, 0.1)' }
          ])
        },
        data: [12, 13, 15, 14, 16, 18, 20]
      },
      {
        name: '商品',
        type: 'line',
        stack: 'Total',
        smooth: true,
        lineStyle: {
          color: '#f093fb'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(240, 147, 251, 0.3)' },
            { offset: 1, color: 'rgba(240, 147, 251, 0.1)' }
          ])
        },
        data: [25, 28, 32, 30, 35, 38, 42]
      },
      {
        name: '订单',
        type: 'line',
        stack: 'Total',
        smooth: true,
        lineStyle: {
          color: '#4facfe'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(79, 172, 254, 0.3)' },
            { offset: 1, color: 'rgba(79, 172, 254, 0.1)' }
          ])
        },
        data: [8, 12, 15, 18, 22, 25, 28]
      },
      {
        name: '资讯',
        type: 'line',
        stack: 'Total',
        smooth: true,
        lineStyle: {
          color: '#43e97b'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(67, 233, 123, 0.3)' },
            { offset: 1, color: 'rgba(67, 233, 123, 0.1)' }
          ])
        },
        data: [5, 6, 8, 7, 9, 11, 13]
      }
    ]
  }
  
  trendChartInstance.setOption(option)
}

// 初始化饼图
const initPieChart = () => {
  if (!pieChart.value) return
  
  pieChartInstance = echarts.init(pieChart.value)
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      textStyle: {
        color: '#666'
      }
    },
    series: [
      {
        name: '业务分布',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['60%', '50%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { 
            value: stats.value.attractionCount, 
            name: '景点管理',
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#667eea' },
                { offset: 1, color: '#764ba2' }
              ])
            }
          },
          { 
            value: stats.value.productCount, 
            name: '商品管理',
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#f093fb' },
                { offset: 1, color: '#f5576c' }
              ])
            }
          },
          { 
            value: stats.value.orderCount, 
            name: '订单管理',
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#4facfe' },
                { offset: 1, color: '#00f2fe' }
              ])
            }
          },
          { 
            value: stats.value.newsCount, 
            name: '资讯管理',
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#43e97b' },
                { offset: 1, color: '#38f9d7' }
              ])
            }
          }
        ]
      }
    ]
  }
  
  pieChartInstance.setOption(option)
}

// 更新图表数据
const updateCharts = () => {
  if (pieChartInstance) {
    pieChartInstance.setOption({
      series: [{
        data: [
          { value: stats.value.attractionCount, name: '景点管理' },
          { value: stats.value.productCount, name: '商品管理' },
          { value: stats.value.orderCount, name: '订单管理' },
          { value: stats.value.newsCount, name: '资讯管理' }
        ]
      }]
    })
  }
}

// 更新趋势图表
const updateTrendChart = async (days) => {
  if (!trendChartInstance) return
  
  try {
    // 调用API获取趋势数据
    const response = await fetch(`/api/trend-data?days=${days}`, {
      headers: {
        'Authorization': `Bearer ${userStore.token}`
      }
    })
    
    if (!response.ok) {
      throw new Error('获取趋势数据失败')
    }
    
    const result = await response.json()
    
    if (result.code === 200) {
      const data = result.data
      
      // 更新图表配置
      const option = {
        xAxis: {
          data: data.labels
        },
        series: [
          {
            name: '景点',
            data: data.attractionData
          },
          {
            name: '商品', 
            data: data.productData
          },
          {
            name: '订单',
            data: data.orderData
          },
          {
            name: '资讯',
            data: data.newsData
          }
        ]
      }
      
      trendChartInstance.setOption(option)
    }
  } catch (error) {
    console.error('更新趋势图表失败:', error)
    // 使用默认数据
    const defaultOption = getDefaultTrendData(days)
    trendChartInstance.setOption(defaultOption)
  }
}

// 获取默认趋势数据
const getDefaultTrendData = (days) => {
  const labels = []
  const attractionData = []
  const productData = []
  const orderData = []
  const newsData = []
  
  for (let i = 1; i <= days; i++) {
    if (days <= 7) {
      labels.push(`第${i}天`)
    } else if (days <= 30) {
      const date = new Date()
      date.setDate(date.getDate() - (days - i))
      labels.push(`${date.getMonth() + 1}-${date.getDate()}`)
    } else {
      const date = new Date()
      date.setDate(date.getDate() - (days - i))
      labels.push(`${date.getMonth() + 1}-${date.getDate()}`)
    }
    
    // 生成不同的模拟数据
    attractionData.push(Math.floor(2 + Math.random() * 3 + i * 0.5))
    productData.push(Math.floor(5 + Math.random() * 8 + i * 0.8))
    orderData.push(Math.floor(3 + Math.random() * 6 + i * 0.6))
    newsData.push(Math.floor(1 + Math.random() * 2 + i * 0.3))
  }
  
  return {
    xAxis: {
      data: labels
    },
    series: [
      { name: '景点', data: attractionData },
      { name: '商品', data: productData },
      { name: '订单', data: orderData },
      { name: '资讯', data: newsData }
    ]
  }
}

// 监听统计数据变化
watch(stats, updateCharts, { deep: true })

// 监听趋势周期变化
watch(trendPeriod, (newPeriod) => {
  updateTrendChart(newPeriod)
})

// 窗口大小变化时重新调整图表
const handleResize = () => {
  if (trendChartInstance) {
    trendChartInstance.resize()
  }
  if (pieChartInstance) {
    pieChartInstance.resize()
  }
}

let timer = null

onMounted(async () => {
  updateTime()
  // 每秒更新时间
  timer = setInterval(updateTime, 1000)
  
  // 初始化数据
  await initStats()
  await initForumStats()
  await initOrderStats()
  
  // 等待DOM渲染完成后初始化图表
  await nextTick()
  initTrendChart()
  initPieChart()
  
  // 初始化趋势图表数据
  updateTrendChart(trendPeriod.value)
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
  if (trendChartInstance) {
    trendChartInstance.dispose()
  }
  if (pieChartInstance) {
    pieChartInstance.dispose()
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #ebf1fc 100%);
  min-height: calc(100vh - 60px);
}

/* 欢迎横幅 */
.welcome-banner {
  background: linear-gradient(135deg, #f8fffc 0%, #ceffd8 100%);
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 30px;
  color: rgb(17, 178, 241);
  box-shadow: 0 8px 32px rgba(16, 185, 129, 0.3);
  position: relative;
  overflow: hidden;
}

.welcome-banner::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  transform: rotate(45deg);
}

.banner-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}

.welcome-text h1 {
  font-size: 28px;
  margin-bottom: 10px;
  font-weight: 600;
}

.welcome-text p {
  font-size: 16px;
  opacity: 0.9;
  margin-bottom: 20px;
}

.welcome-stats {
  display: flex;
  gap: 30px;
}

.welcome-stats span {
  font-size: 14px;
  opacity: 0.8;
  padding: 5px 15px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

.welcome-time {
  text-align: right;
}

.current-time {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 5px;
}

.current-date {
  font-size: 14px;
  opacity: 0.8;
}

/* 统计卡片 */
.stats-section {
  margin-bottom: 30px;
}

.stats-card {
  background: white;
  border-radius: 16px;
  padding: 10px 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.stats-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  transition: all 0.3s ease;
}

.stats-card.attraction-card::before {
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
}

.stats-card.product-card::before {
  background: linear-gradient(90deg, #34d399 0%, #10b981 100%);
}

.stats-card.order-card::before {
  background: linear-gradient(90deg, #6ee7b7 0%, #34d399 100%);
}

.stats-card.news-card::before {
  background: linear-gradient(90deg, #86efac 0%, #6ee7b7 100%);
}

.stats-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.stats-card:hover::before {
  height: 6px;
}

.stats-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  margin-bottom: 15px;
}

.attraction-card .stats-icon {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.product-card .stats-icon {
  background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
}

.order-card .stats-icon {
  background: linear-gradient(135deg, #6ee7b7 0%, #34d399 100%);
}

.news-card .stats-icon {
  background: linear-gradient(135deg, #86efac 0%, #6ee7b7 100%);
}

.stats-content {
  display: flex;
  flex-direction: column;
}

.stats-number {
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 4px;
}

.stats-label {
  font-size: 13px;
  color: #7f8c8d;
  margin-bottom: 8px;
}

.stats-trend {
  display: flex;
  align-items: center;
  font-size: 12px;
  font-weight: 600;
  color: #e74c3c;
}

.stats-trend.trend-up {
  color: #27ae60;
}

.stats-trend .el-icon {
  margin-right: 4px;
  font-size: 14px;
}

/* 图表区域 */
.charts-section {
  margin-bottom: 30px;
}

.chart-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: none;
}

.chart-card :deep(.el-card__header) {
  border-bottom: 1px solid #f0f2f5;
  padding: 20px 24px;
}

.chart-card :deep(.el-card__body) {
  padding: 20px 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.card-title .el-icon {
  margin-right: 8px;
  font-size: 18px;
  color: #10b981;
}

.chart-container {
  height: 350px;
  width: 100%;
}

.chart-small {
  height: 300px;
}

/* 详细统计区域 */
.detail-section {
  margin-bottom: 30px;
}

.detail-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: none;
}

.detail-card :deep(.el-card__header) {
  border-bottom: 1px solid #f0f2f5;
  padding: 20px 24px;
}

.detail-card :deep(.el-card__body) {
  padding: 20px 24px;
}

/* 订单状态统计 */
.order-status-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.status-item {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  transition: all 0.3s ease;
}

.status-item:hover {
  background: #f0f2f5;
  transform: translateX(4px);
}

.status-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.status-name {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
}

.status-count {
  font-size: 16px;
  font-weight: 600;
  color: #10b981;
}

/* 论坛统计 */
.forum-stats {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.forum-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.forum-item:hover {
  background: #f0f2f5;
  transform: translateY(-2px);
}

.forum-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  color: white;
  font-size: 20px;
}

.forum-icon.posts {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.forum-icon.comments {
  background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
}

.forum-icon.active {
  background: linear-gradient(135deg, #6ee7b7 0%, #34d399 100%);
}

.forum-number {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 4px;
}

.forum-label {
  font-size: 12px;
  color: #7f8c8d;
}

/* 快捷操作 */
.quick-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.action-btn {
  height: 50px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

/* 系统信息 */
.system-section {
  margin-bottom: 30px;
}

.system-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: none;
}

.system-card :deep(.el-card__header) {
  border-bottom: 1px solid #f0f2f5;
  padding: 20px 24px;
}

.system-card :deep(.el-card__body) {
  padding: 20px 24px;
}

.system-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.info-item:hover {
  background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
  transform: translateY(-2px);
}

.info-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  color: white;
  font-size: 20px;
}

.info-content {
  flex: 1;
}

.info-label {
  font-size: 12px;
  color: #7f8c8d;
  margin-bottom: 4px;
}

.info-value {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 15px;
  }
  
  .banner-content {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }
  
  .welcome-stats {
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
  }
  
  .welcome-text h1 {
    font-size: 24px;
  }
  
  .current-time {
    font-size: 24px;
  }
  
  .stats-number {
    font-size: 28px;
  }
  
  .quick-actions {
    grid-template-columns: 1fr;
  }
  
  .system-info-grid {
    grid-template-columns: 1fr;
  }
  
  .chart-container {
    height: 280px;
  }
  
  .chart-small {
    height: 240px;
  }
}

@media (max-width: 480px) {
  .welcome-banner {
    padding: 20px;
  }
  
  .stats-card {
    padding: 16px 18px;
  }
  
  .stats-icon {
    width: 45px;
    height: 45px;
    font-size: 20px;
  }
  
  .stats-number {
    font-size: 24px;
  }
}

/* 动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stats-card,
.chart-card,
.detail-card,
.system-card {
  animation: fadeInUp 0.6s ease-out;
}

.stats-card:nth-child(1) { animation-delay: 0.1s; }
.stats-card:nth-child(2) { animation-delay: 0.2s; }
.stats-card:nth-child(3) { animation-delay: 0.3s; }
.stats-card:nth-child(4) { animation-delay: 0.4s; }
</style>
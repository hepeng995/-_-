<template>
  <div class="route-detail" v-loading="loading">
    <template v-if="routeData">
      <!-- 面包屑导航 -->
      <div class="breadcrumb-section">
        <div class="container">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item :to="{ path: '/routes' }">旅游路线</el-breadcrumb-item>
            <el-breadcrumb-item>{{ routeData.name }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
      </div>

      <!-- Hero 区域：封面 + 信息面板 -->
      <div class="detail-hero">
        <div class="container">
          <div class="hero-layout">
            <!-- 左侧封面 -->
            <div class="hero-cover">
              <img :src="routeData.coverImage" :alt="routeData.name" />
            </div>
            <!-- 右侧信息 -->
            <div class="hero-info">
              <h1 class="route-title">{{ routeData.name }}</h1>

              <!-- 评分 -->
              <div class="route-rating">
                <el-rate
                  :model-value="routeData.rating"
                  disabled
                  show-score
                  text-color="#ff9900"
                  score-template="{value}分"
                />
                <span class="rating-count">{{ routeData.ratingCount }}人评价</span>
              </div>

              <!-- 元信息徽章 -->
              <div class="meta-badges">
                <div class="meta-badge">
                  <el-icon><Calendar /></el-icon>
                  <span>{{ routeData.days }}天行程</span>
                </div>
                <div class="meta-badge" :style="{ borderColor: getDifficultyColor(routeData.difficulty), color: getDifficultyColor(routeData.difficulty) }">
                  <el-icon><Flag /></el-icon>
                  <span>{{ routeData.difficultyLabel }}</span>
                </div>
                <div class="meta-badge budget">
                  <el-icon><Wallet /></el-icon>
                  <span>&yen;{{ routeData.budgetMin }} - &yen;{{ routeData.budgetMax }}</span>
                </div>
                <div class="meta-badge">
                  <el-icon><User /></el-icon>
                  <span>{{ routeData.suitableCrowd }}</span>
                </div>
              </div>

              <!-- 标签 -->
              <div class="route-tags">
                <el-tag
                  v-for="tag in routeData.tags"
                  :key="tag"
                  effect="light"
                  type="success"
                  size="default"
                  round
                >
                  {{ tag }}
                </el-tag>
              </div>

              <!-- 操作按钮 -->
              <div class="action-buttons">
                <el-button
                  :type="isCollected ? 'danger' : 'default'"
                  size="large"
                  round
                  @click="toggleCollect"
                >
                  <el-icon><StarFilled v-if="isCollected" /><Star v-else /></el-icon>
                  {{ isCollected ? '已收藏' : '收藏' }}
                </el-button>
                <el-button size="large" round @click="handleShare">
                  <el-icon><Share /></el-icon>
                  分享
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 路线简介 -->
      <div class="description-section">
        <div class="container">
          <div class="section-card">
            <h2 class="section-title">路线简介</h2>
            <p class="description-text">{{ routeData.description }}</p>
          </div>
        </div>
      </div>

      <!-- 天气预报 -->
      <div v-if="firstAttractionId" class="weather-section">
        <div class="container">
          <div class="section-card">
            <WeatherCard :attraction-id="firstAttractionId" />
          </div>
        </div>
      </div>

      <!-- 路线地图 -->
      <div class="map-section">
        <div class="container">
          <RouteMap
            v-if="routeData.items && routeData.items.length"
            :items="routeData.items"
            :route-name="routeData.name"
          />
        </div>
      </div>

      <!-- 行程安排 Timeline -->
      <div class="timeline-section">
        <div class="container">
          <h2 class="section-heading">行程安排</h2>

          <div class="day-group" v-for="(dayItems, dayNum) in groupedItems" :key="dayNum">
            <!-- 天数折叠头部 -->
            <div class="day-header" @click="toggleDay(dayNum)">
              <div class="day-indicator">
                <span class="day-dot"></span>
                <span class="day-label">第{{ dayNum }}天</span>
              </div>
              <el-icon class="day-arrow" :class="{ expanded: expandedDays[dayNum] }">
                <ArrowDown />
              </el-icon>
            </div>

            <!-- 天数内容 -->
            <transition name="slide">
              <div v-show="expandedDays[dayNum]" class="day-content">
                <div class="timeline">
                  <div
                    v-for="(item, index) in dayItems"
                    :key="index"
                    class="timeline-item"
                  >
                    <!-- 时间轴左侧 -->
                    <div class="timeline-left">
                      <div class="timeline-dot"></div>
                      <div class="timeline-line"></div>
                    </div>

                    <!-- 时间轴右侧内容 -->
                    <div class="timeline-right">
                      <!-- 交通指示（非第一个节点显示） -->
                      <div v-if="index > 0" class="transport-indicator">
                        <span class="transport-icon">{{ getTransportIcon(item.transportMethod) }}</span>
                        <span class="transport-text">{{ item.transportMethod }}</span>
                      </div>

                      <!-- 景点卡片 -->
                      <div class="spot-card">
                        <div class="spot-cover">
                          <img :src="item.attractionCover" :alt="item.attractionName" />
                        </div>
                        <div class="spot-info">
                          <h4 class="spot-name">{{ item.attractionName }}</h4>
                          <div class="spot-meta">
                            <el-tag size="small" effect="plain" type="info" round>
                              <el-icon><Clock /></el-icon>
                              {{ item.suggestedDuration }}
                            </el-tag>
                            <el-tag size="small" effect="plain" round>
                              <el-icon><Van /></el-icon>
                              {{ item.transportMethod }}
                            </el-tag>
                          </div>
                          <p v-if="item.note" class="spot-note">{{ item.note }}</p>
                            <a
                              v-if="item.attractionLongitude && item.attractionLatitude"
                              class="nav-link"
                              :href="`https://uri.amap.com/navigation?to=${item.attractionLongitude},${item.attractionLatitude},${item.attractionName || ''}&mode=car`"
                              target="_blank"
                              @click.stop
                            >
                              📍 导航前往
                            </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>

      <!-- 旅行小贴士 -->
      <div v-if="routeData.tips" class="tips-section">
        <div class="container">
          <div class="section-card">
            <h2 class="section-title">旅行小贴士</h2>
            <div class="tips-content" v-html="routeData.tips"></div>
          </div>
        </div>
      </div>
    </template>

    <!-- 错误状态 -->
    <div v-else-if="!loading" class="error-state">
      <el-result
        icon="warning"
        title="路线不存在"
        sub-title="该路线可能已被删除或链接无效"
      >
        <template #extra>
          <el-button type="primary" @click="$router.push('/routes')">返回路线列表</el-button>
          <el-button @click="$router.go(-1)">返回上页</el-button>
        </template>
      </el-result>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Star,
  StarFilled,
  Share,
  Calendar,
  Flag,
  User,
  Wallet,
  ArrowDown,
  Clock,
  Van
} from '@element-plus/icons-vue'
import tourRouteApi from '@/api/tourRoute'
import WeatherCard from '@/components/WeatherCard.vue'
import RouteMap from '@/components/RouteMap.vue'

const route = useRoute()
const router = useRouter()

// 第一个景点的 ID（用于天气展示）
const firstAttractionId = computed(() => {
  if (!routeData.value || !routeData.value.items || routeData.value.items.length === 0) return null
  return routeData.value.items[0].attractionId
})

// 状态
const loading = ref(false)
const routeData = ref(null)
const isCollected = ref(false)
const expandedDays = reactive({})

// 获取难度颜色
const getDifficultyColor = (difficulty) => {
  const colorMap = {
    easy: '#10b981',
    medium: '#f59e0b',
    hard: '#ef4444'
  }
  return colorMap[difficulty] || '#64748b'
}

// 按天分组行程
const groupedItems = computed(() => {
  if (!routeData.value || !routeData.value.items) return {}
  const groups = {}
  routeData.value.items.forEach((item) => {
    if (!groups[item.dayNumber]) {
      groups[item.dayNumber] = []
    }
    groups[item.dayNumber].push(item)
  })
  // 每天内按 sortOrder 排序
  Object.keys(groups).forEach((key) => {
    groups[key].sort((a, b) => a.sortOrder - b.sortOrder)
  })
  return groups
})

// 获取交通图标
const getTransportIcon = (method) => {
  if (!method) return ''
  if (method.includes('步行')) return ''
  if (method.includes('驾车') || method.includes('车')) return ''
  if (method.includes('公交')) return ''
  return ''
}

// 切换天数折叠
const toggleDay = (dayNum) => {
  expandedDays[dayNum] = !expandedDays[dayNum]
}

// 初始化为全部折叠，并清理旧路线残留状态
const initExpandedDays = () => {
  Object.keys(expandedDays).forEach((day) => {
    delete expandedDays[day]
  })

  if (!routeData.value || !routeData.value.items) return
  const daySet = new Set(routeData.value.items.map((item) => item.dayNumber))
  daySet.forEach((day) => {
    expandedDays[day] = false
  })
}

// 加载路线详情
const loadRouteDetail = async () => {
  const id = route.params.id
  if (!id) {
    ElMessage.error('路线ID不存在')
    router.push('/routes')
    return
  }

  loading.value = true
  try {
    const res = await tourRouteApi.getRouteById(id)
    if (res.code === 200 && res.data) {
      routeData.value = res.data
      document.title = `${res.data.name} - 旅游路线`
      initExpandedDays()
    } else {
      routeData.value = null
    }
  } catch (error) {
    console.error('获取路线详情失败:', error)
    routeData.value = null
  } finally {
    loading.value = false
  }
}

// 收藏切换
const toggleCollect = () => {
  isCollected.value = !isCollected.value
  ElMessage.success(isCollected.value ? '已收藏该路线' : '已取消收藏')
}

// 分享
const handleShare = async () => {
  const shareData = {
    title: routeData.value.name,
    text: routeData.value.description,
    url: window.location.href
  }
  if (navigator.share) {
    try {
      await navigator.share(shareData)
    } catch (error) {
      if (error.name !== 'AbortError') {
        fallbackShare()
      }
    }
  } else {
    fallbackShare()
  }
}

const fallbackShare = () => {
  navigator.clipboard.writeText(window.location.href).then(() => {
    ElMessage.success('链接已复制到剪贴板')
  }).catch(() => {
    ElMessage.info('请手动复制浏览器地址栏链接分享')
  })
}

// 初始化
onMounted(() => {
  loadRouteDetail()
})

watch(
  () => route.params.id,
  (newId, oldId) => {
    if (newId && newId !== oldId) {
      routeData.value = null
      isCollected.value = false
      loadRouteDetail()
    }
  }
)
</script>

<style scoped>
.route-detail {
  min-height: 100vh;
  background: var(--color-bg-body);
}

.container {
  margin: 0 auto;
  padding: 0 20px;
}

/* ========== 面包屑 ========== */
.breadcrumb-section {
  background: var(--color-bg-surface);
  padding: 16px 0;
  border-bottom: 1px solid var(--color-border);
}

/* ========== Hero 区域 ========== */
.detail-hero {
  background: var(--color-bg-surface);
  padding: 32px 0;
}

.hero-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: start;
}

/* 封面图 */
.hero-cover {
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.hero-cover img {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  display: block;
}

/* 信息面板 */
.hero-info {
  padding: 8px 0;
}

.route-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 18px;
  line-height: 1.3;
}

.route-rating {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 22px;
}

.rating-count {
  font-size: 13px;
  color: var(--color-text-placeholder);
}

/* 元信息徽章 */
.meta-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 22px;
}

.meta-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  border: 1.5px solid var(--color-border);
  border-radius: 20px;
  font-size: 13px;
  color: var(--color-text-secondary);
  font-weight: 500;
  background: var(--color-bg-body);
  transition: all 0.2s ease;
}

.meta-badge.budget {
  color: var(--color-primary-600);
  border-color: #a7f3d0;
  background: var(--color-primary-50);
}

.meta-badge .el-icon {
  font-size: 15px;
}

/* 标签 */
.route-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 28px;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 14px;
}

.action-buttons .el-button {
  min-width: 110px;
}

/* ========== 路线简介 ========== */
.description-section {
  padding: 40px 0 20px;
}

.section-card {
  background: var(--color-bg-surface);
  border-radius: var(--radius-xl);
  padding: 32px;
  box-shadow: var(--shadow-card);
}

.section-title {
  font-size: 22px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 18px;
  padding-left: 14px;
  border-left: 4px solid var(--color-primary-600);
}

.description-text {
  font-size: 15px;
  line-height: 1.9;
  color: var(--color-text-secondary);
}

/* ========== 行程安排 ========== */
.timeline-section {
  padding: 20px 0 80px;
}

.section-heading {
  font-size: 26px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 32px;
  text-align: center;
  position: relative;
}

.section-heading::after {
  content: '';
  display: block;
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, var(--color-primary-600), var(--color-primary-500));
  border-radius: 2px;
  margin: 12px auto 0;
}

/* 天数组 */
.day-group {
  margin-bottom: 24px;
}

/* 天数头部 */
.day-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, var(--color-primary-600), var(--color-primary-500));
  padding: 16px 24px;
  border-radius: var(--radius-lg);
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
}

.day-header:hover {
  box-shadow: 0 4px 16px rgba(5, 150, 105, 0.3);
}

.day-indicator {
  display: flex;
  align-items: center;
  gap: 12px;
}

.day-dot {
  width: 10px;
  height: 10px;
  background: var(--color-bg-surface);
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
}

.day-label {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-inverse);
  letter-spacing: 1px;
}

.day-arrow {
  font-size: 18px;
  color: var(--color-text-inverse);
  transition: transform 0.3s ease;
}

.day-arrow.expanded {
  transform: rotate(180deg);
}

/* 天数内容折叠动画 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
}

.slide-enter-to,
.slide-leave-from {
  opacity: 1;
  max-height: 2000px;
}

.day-content {
  padding: 24px 0 8px 0;
}

/* ========== 时间轴 ========== */
.timeline {
  padding-left: 8px;
}

.timeline-item {
  display: flex;
  gap: 0;
  position: relative;
}

/* 时间轴左侧竖线+圆点 */
.timeline-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 24px;
  flex-shrink: 0;
  position: relative;
}

.timeline-dot {
  width: 14px;
  height: 14px;
  background: var(--color-primary-600);
  border: 3px solid var(--color-primary-200);
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 4px;
  position: relative;
  z-index: 2;
  box-shadow: 0 2px 6px rgba(5, 150, 105, 0.3);
}

.timeline-line {
  width: 2px;
  flex-grow: 1;
  background: linear-gradient(to bottom, var(--color-primary-600), var(--color-primary-200));
  margin: 4px 0;
  min-height: 40px;
}

/* 时间轴右侧 */
.timeline-right {
  flex: 1;
  padding-left: 20px;
  padding-bottom: 28px;
}

.timeline-item:last-child .timeline-right {
  padding-bottom: 0;
}

/* 交通指示 */
.transport-indicator {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--color-primary-50);
  border: 1px dashed #a7f3d0;
  border-radius: 16px;
  padding: 4px 14px;
  margin-bottom: 12px;
  font-size: 13px;
  color: var(--color-primary-600);
}

.transport-icon {
  font-size: 15px;
}

.transport-text {
  font-weight: 500;
}

/* 景点卡片 */
.spot-card {
  display: flex;
  gap: 18px;
  background: var(--color-bg-surface);
  border-radius: 14px;
  padding: 18px;
  box-shadow: var(--shadow-card);
  transition: all 0.25s ease;
  border: 1px solid var(--color-bg-muted);
}

.spot-card:hover {
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.12);
  border-color: var(--color-primary-200);
}

.spot-cover {
  width: 120px;
  height: 90px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
}

.spot-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.spot-info {
  flex: 1;
  min-width: 0;
}

.spot-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 10px;
}

.spot-meta {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.spot-meta .el-tag {
  display: flex;
  align-items: center;
  gap: 4px;
}

.spot-note {
  font-size: 13px;
  color: var(--color-text-placeholder);
  font-style: italic;
  line-height: 1.6;
  margin: 0;
}

/* ========== 错误状态 ========== */
.error-state {
  padding: 120px 20px;
  text-align: center;
}

/* ========== 响应式 ========== */
@media (max-width: 968px) {
  .hero-layout {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .hero-cover img {
    max-height: 280px;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 12px;
  }

  .breadcrumb-section {
    padding: 12px 0;
  }

  .detail-hero {
    padding: 20px 0;
  }

  .hero-layout {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .hero-cover img {
    max-height: 200px;
  }

  .hero-info {
    padding: 12px 0;
  }

  .route-title {
    font-size: 20px;
    margin-bottom: 12px;
  }

  .route-rating {
    margin-bottom: 16px;
  }

  .rating-count {
    font-size: 12px;
  }

  .meta-badges {
    gap: 8px;
    margin-bottom: 16px;
  }

  .meta-badge {
    padding: 4px 10px;
    font-size: 12px;
  }

  .route-tags {
    margin-bottom: 20px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 10px;
  }

  .action-buttons .el-button {
    width: 100%;
    min-height: 46px;
    padding-inline: 16px;
  }

  .action-buttons .el-button + .el-button {
    margin-left: 0;
  }

  .action-buttons :deep(.el-button > span) {
    width: 100%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    text-align: center;
  }

  .action-buttons :deep(.el-button .el-icon) {
    margin: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    line-height: 1;
    vertical-align: middle;
    flex-shrink: 0;
  }

  .description-section {
    padding: 24px 0 16px;
  }

  .section-card {
    padding: 16px;
  }

  .section-title {
    font-size: 18px;
    margin-bottom: 14px;
  }

  .description-text {
    font-size: 14px;
    line-height: 1.8;
  }

  .timeline-section {
    padding: 16px 0 60px;
  }

  .section-heading {
    font-size: 20px;
    margin-bottom: 24px;
  }

  .section-heading::after {
    width: 48px;
    margin-top: 8px;
  }

  .day-header {
    padding: 14px 16px;
  }

  .day-label {
    font-size: 16px;
  }

  .day-content {
    padding: 16px 0 4px 0;
  }

  .timeline {
    padding-left: 0;
  }

  .timeline-item {
    align-items: flex-start;
  }

  .timeline-left {
    width: 20px;
  }

  .timeline-dot {
    width: 12px;
    height: 12px;
    border-width: 2px;
    margin-top: 2px;
  }

  .timeline-line {
    min-height: 36px;
    margin: 3px 0 0;
  }

  .timeline-right {
    padding-left: 14px;
    padding-bottom: 20px;
  }

  .timeline-item:last-child .timeline-right {
    padding-bottom: 0;
  }

  .transport-indicator {
    display: inline-flex;
    align-items: center;
    align-self: flex-start;
    gap: 6px;
    max-width: 100%;
    width: fit-content;
    padding: 4px 10px;
    margin: 0 0 10px;
    box-sizing: border-box;
  }

  .transport-text {
    line-height: 1.3;
  }

  .spot-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    width: 100%;
    padding: 12px;
    box-sizing: border-box;
  }

  .spot-cover {
    width: 100%;
    height: 160px;
  }

  .spot-cover img {
    max-width: 100%;
  }

  .spot-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
  }

  .spot-meta,
  .spot-note {
    width: 100%;
  }

  .spot-meta {
    gap: 6px;
    margin-bottom: 8px;
  }

  .nav-link {
    align-self: flex-start;
    margin-top: 10px;
  }

  .weather-section,
  .map-section {
    padding: 0 0 16px;
  }

  .tips-section {
    padding: 0 0 60px;
  }

  .tips-content {
    font-size: 14px;
    line-height: 1.8;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 10px;
  }

  .breadcrumb-section {
    padding: 10px 0;
  }

  .detail-hero {
    padding: 16px 0;
  }

  .hero-cover img {
    max-height: 180px;
  }

  .route-title {
    font-size: 18px;
  }

  .meta-badge {
    padding: 3px 8px;
    font-size: 11px;
  }

  .section-card {
    padding: 12px;
  }

  .section-title {
    font-size: 16px;
  }

  .section-heading {
    font-size: 18px;
  }

  .day-header {
    padding: 10px 12px;
  }

  .day-label {
    font-size: 15px;
  }

  .timeline-left {
    width: 18px;
  }

  .timeline-right {
    padding-left: 10px;
    padding-bottom: 16px;
  }

  .timeline-item:last-child .timeline-right {
    padding-bottom: 0;
  }

  .spot-card {
    padding: 10px;
  }

  .spot-name {
    font-size: 14px;
  }

  .spot-note {
    font-size: 12px;
  }

  .transport-indicator {
    gap: 4px;
    padding: 3px 8px;
    font-size: 12px;
  }

  .transport-text {
    line-height: 1.25;
  }

  .nav-link {
    margin-top: 8px;
    padding: 4px 10px;
  }
}

/* ========== 导航链接 ========== */
.nav-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  padding: 4px 12px;
  background: linear-gradient(135deg, #3366FF, #3665ff);
  color: #fff;
  border-radius: 14px;
  text-decoration: none;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.nav-link:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(51, 102, 255, 0.35);
}

/* ========== 天气 & 地图区块 ========== */
.weather-section {
  padding: 0 0 20px;
}

.map-section {
  padding: 0 0 20px;
}

/* ========== 旅行小贴士 ========== */
.tips-section {
  padding: 0 0 80px;
}

.tips-content {
  font-size: 15px;
  line-height: 1.9;
  color: var(--color-text-secondary);
}

.tips-content ul {
  padding-left: 20px;
}

.tips-content li {
  margin-bottom: 10px;
}
</style>

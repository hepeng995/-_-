<template>
  <div class="routes-page">
    <!-- 页面头部 Hero -->
    <div class="page-hero" :style="{ backgroundImage: `url(${headerBg})` }">
      <div class="hero-overlay"></div>
      <div class="container hero-content">
        <h1 class="hero-title">旅游路线</h1>
        <p class="hero-subtitle">规划您的完美乡村之旅，精选路线带您领略乡村之美</p>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-section">
      <div class="container">
        <div class="filter-bar">
          <!-- 天数筛选 -->
          <div class="filter-tabs">
            <div
              v-for="tab in dayTabs"
              :key="tab.value"
              class="filter-tab"
              :class="{ active: queryParams.days === tab.value }"
              @click="handleDayChange(tab.value)"
            >
              {{ tab.label }}
            </div>
          </div>
          <!-- 难度下拉 -->
          <el-select
            v-model="queryParams.difficulty"
            placeholder="难度"
            size="large"
            clearable
            style="width: 160px"
            @change="handleFilterChange"
          >
            <el-option label="全部" value="" />
            <el-option label="简单" value="easy" />
            <el-option label="中等" value="medium" />
            <el-option label="困难" value="hard" />
          </el-select>
          <!-- 搜索框 -->
          <el-input
            v-model="queryParams.keyword"
            placeholder="搜索路线名称..."
            size="large"
            clearable
            style="width: 280px"
            @keyup.enter="handleFilterChange"
            @clear="handleFilterChange"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </div>
    </div>

    <!-- 路线列表 -->
    <div class="routes-content">
      <div class="container">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-wrapper">
          <el-skeleton :rows="5" animated />
        </div>

        <!-- 路线卡片网格 -->
        <div v-else-if="routes.length > 0" class="routes-grid">
          <div
            v-for="route in routes"
            :key="route.id"
            class="route-card"
            @click="goToDetail(route.id)"
          >
            <!-- 封面图 -->
            <div class="card-cover">
              <img :src="route.coverImage" :alt="route.name" />
              <!-- 官方推荐徽章 -->
              <div v-if="route.isOfficial" class="official-badge">
                <el-icon><Star /></el-icon>
                官方推荐
              </div>
              <!-- 天数标签 -->
              <div class="days-badge">{{ route.days }}天{{ route.days > 1 ? '游' : '游' }}</div>
            </div>
            <!-- 卡片主体 -->
            <div class="card-body">
              <h3 class="route-name">{{ route.name }}</h3>
              <!-- 评分 -->
              <div class="route-rating">
                <el-rate
                  :model-value="route.rating"
                  disabled
                  show-score
                  text-color="#ff9900"
                  score-template="{value}分"
                  size="small"
                />
                <span class="rating-count">({{ route.ratingCount }}人评价)</span>
              </div>
              <!-- 信息行 -->
              <div class="route-info-row">
                <span class="info-item">
                  <el-icon><Calendar /></el-icon>
                  {{ route.days }}天
                </span>
                <span class="info-item">
                  <el-icon><Flag /></el-icon>
                  <span :style="{ color: getDifficultyColor(route.difficulty) }">{{ route.difficultyLabel }}</span>
                </span>
                <span class="info-item">
                  <el-icon><User /></el-icon>
                  {{ route.suitableCrowd }}
                </span>
              </div>
              <!-- 预算 -->
              <div class="route-budget">
                <span class="budget-label">预算</span>
                <span class="budget-value">&yen;{{ route.budgetMin }} - &yen;{{ route.budgetMax }}</span>
              </div>
              <!-- 标签 -->
              <div class="route-tags">
                <el-tag
                  v-for="tag in route.tags"
                  :key="tag"
                  size="small"
                  effect="light"
                  type="success"
                  class="route-tag"
                >
                  {{ tag }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-state">
          <el-empty description="暂无符合条件的路线">
            <el-button type="primary" @click="resetFilters">重置筛选</el-button>
          </el-empty>
        </div>

        <!-- 分页 -->
        <div v-if="total > 0" class="pagination-wrapper">
          <el-pagination
            v-model:current-page="queryParams.current"
            v-model:page-size="queryParams.size"
            :page-sizes="[9, 12, 18, 24]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            background
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Star, Calendar, Flag, User } from '@element-plus/icons-vue'
import tourRouteApi from '@/api/tourRoute'
import headerBg from '@/assets/image/旅游路线规划背景.png'

const router = useRouter()

// 加载状态
const loading = ref(false)
// 路线数据
const routes = ref([])
const total = ref(0)

// 天数选项
const dayTabs = [
  { label: '全部', value: null },
  { label: '1天', value: 1 },
  { label: '2天', value: 2 },
  { label: '3天+', value: 3 }
]

// 查询参数
const queryParams = reactive({
  current: 1,
  size: 9,
  days: null,
  difficulty: '',
  keyword: ''
})

// 获取难度颜色
const getDifficultyColor = (difficulty) => {
  const colorMap = {
    easy: '#10b981',
    medium: '#f59e0b',
    hard: '#ef4444'
  }
  return colorMap[difficulty] || '#64748b'
}

// 加载路线数据
const loadRoutes = async () => {
  loading.value = true
  try {
    const params = {
      current: queryParams.current,
      size: queryParams.size
    }
    if (queryParams.days !== null) params.days = queryParams.days
    if (queryParams.difficulty) params.difficulty = queryParams.difficulty
    if (queryParams.keyword) params.keyword = queryParams.keyword

    const res = await tourRouteApi.getRoutePage(params)
    if (res.code === 200) {
      routes.value = res.data.records
      total.value = res.data.total
    }
  } catch (error) {
    console.error('获取路线列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 天数切换
const handleDayChange = (value) => {
  queryParams.days = value
  queryParams.current = 1
  loadRoutes()
}

// 筛选条件变化
const handleFilterChange = () => {
  queryParams.current = 1
  loadRoutes()
}

// 重置筛选
const resetFilters = () => {
  queryParams.current = 1
  queryParams.days = null
  queryParams.difficulty = ''
  queryParams.keyword = ''
  loadRoutes()
}

// 分页大小变化
const handleSizeChange = () => {
  queryParams.current = 1
  loadRoutes()
}

// 页码变化
const handlePageChange = (page) => {
  queryParams.current = page
  loadRoutes()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 跳转详情
const goToDetail = (id) => {
  router.push(`/routes/${id}`)
}

// 初始化
onMounted(() => {
  loadRoutes()
})
</script>

<style scoped>
.routes-page {
  min-height: 100vh;
  background: var(--color-bg-body);
}

.container {
  margin: 0 auto;
  padding: 0 20px;
}

/* ========== Hero 区域 ========== */
.page-hero {
  position: relative;
  background-size: cover;
  background-position: center;
  padding: 64px 0 56px;
  text-align: center;
  overflow: hidden;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 1;
}

.hero-title {
  font-size: 48px;
  font-weight: 700;
  color: var(--color-text-inverse);
  margin-bottom: 16px;
  letter-spacing: 2px;
}

.hero-subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.88);
  max-width: 520px;
  margin: 0 auto;
  line-height: 1.6;
}

/* ========== 筛选栏 ========== */
.filter-section {
  background: var(--color-bg-surface);
  padding: 24px 0;
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.filter-tabs {
  display: flex;
  gap: 8px;
}

.filter-tab {
  padding: 8px 20px;
  border-radius: 20px;
  background: var(--color-bg-muted);
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: all 0.25s ease;
  font-weight: 500;
  font-size: 14px;
  user-select: none;
}

.filter-tab:hover {
  background: var(--color-border);
  color: var(--color-text-secondary);
}

.filter-tab.active {
  background: var(--color-primary-600);
  color: var(--color-text-inverse);
}

/* ========== 内容区域 ========== */
.routes-content {
  padding: 40px 0 80px;
}

.loading-wrapper {
  padding: 60px 0;
}

/* 路线网格 */
.routes-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
  margin-bottom: 40px;
}

/* ========== 路线卡片 ========== */
.route-card {
  background: var(--color-bg-surface);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  cursor: pointer;
  transition: all 0.3s ease;
}

.route-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-card-hover);
}

/* 封面 */
.card-cover {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.route-card:hover .card-cover img {
  transform: scale(1.06);
}

.official-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: linear-gradient(135deg, var(--color-primary-600), var(--color-primary-500));
  color: var(--color-text-inverse);
  padding: 5px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 8px rgba(5, 150, 105, 0.4);
}

.days-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.55);
  color: var(--color-text-inverse);
  padding: 4px 12px;
  border-radius: var(--radius-lg);
  font-size: 12px;
  font-weight: 500;
  backdrop-filter: blur(4px);
}

/* 卡片主体 */
.card-body {
  padding: 20px;
}

.route-name {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.route-rating {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
}

.rating-count {
  font-size: 12px;
  color: var(--color-text-placeholder);
}

.route-info-row {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--color-text-tertiary);
}

.info-item .el-icon {
  font-size: 14px;
  color: var(--color-text-placeholder);
}

.route-budget {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.budget-label {
  font-size: 13px;
  color: var(--color-text-placeholder);
}

.budget-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-primary-600);
}

.route-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.route-tag {
  border-radius: var(--radius-lg);
}

/* ========== 空状态 ========== */
.empty-state {
  text-align: center;
  padding: 80px 20px;
}

/* ========== 分页 ========== */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

/* ========== 响应式 ========== */
@media (max-width: 1024px) {
  .routes-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 32px;
  }

  .hero-subtitle {
    font-size: 15px;
  }

  .page-hero {
    padding: 40px 0 36px;
  }

  .filter-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .filter-tabs {
    justify-content: center;
  }

  .routes-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .route-info-row {
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 28px;
  }

  .filter-tab {
    padding: 6px 14px;
    font-size: 13px;
  }

  .card-body {
    padding: 16px;
  }

  .route-name {
    font-size: 16px;
  }
}
</style>

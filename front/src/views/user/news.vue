<template>
  <div class="news-page">
    <!-- 页面头部 -->
    <div class="page-header" :style="{ backgroundImage: `url(${headerBg})` }">
      <div class="header-overlay"></div>
      <div class="container">
        <h1>动态资讯</h1>
        <p>了解乡村发展最新动态，关注政策资讯和活动预告</p>
      </div>
    </div>

    <!-- 搜索区域 -->
    <div class="search-section">
      <div class="container">
        <div class="search-form">
          <el-input
            class="search-form__keyword"
            v-model="searchParams.keyword"
            placeholder="搜索资讯标题或内容..."
            size="large"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <div class="search-form__actions">
            <el-select
              class="search-form__select"
              v-model="searchParams.category"
              placeholder="选择分类"
              size="large"
              clearable
            >
              <el-option label="政策通知" value="policy" />
              <el-option label="乡村新闻" value="news" />
              <el-option label="活动预告" value="activity" />
            </el-select>
            <el-button class="search-form__button" type="primary" size="large" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 分类标签 -->
    <div class="category-tabs">
      <div class="container">
        <div class="tabs-wrapper">
          <div
            class="category-tab"
            :class="{ active: searchParams.category === null }"
            @click="selectCategory(null)"
          >
            全部资讯
          </div>
          <div
            class="category-tab"
            :class="{ active: searchParams.category === 'policy' }"
            @click="selectCategory('policy')"
          >
            <el-icon><Document /></el-icon>
            政策通知
          </div>
          <div
            class="category-tab"
            :class="{ active: searchParams.category === 'news' }"
            @click="selectCategory('news')"
          >
            <el-icon><ChatRound /></el-icon>
            乡村新闻
          </div>
          <div
            class="category-tab"
            :class="{ active: searchParams.category === 'activity' }"
            @click="selectCategory('activity')"
          >
            <el-icon><Calendar /></el-icon>
            活动预告
          </div>
        </div>
      </div>
    </div>

    <!-- 资讯内容 -->
    <div class="news-content">
      <div class="container">
        <div class="content-layout">
          <!-- 主要内容区域 -->
          <div class="main-content">
            <!-- 热门资讯 -->
            <div class="hot-news" v-if="hotNews.length > 0">
              <h2>热门资讯</h2>
              <div class="hot-news-list">
                <div
                  v-for="news in hotNews.slice(0, 3)"
                  :key="news.id"
                  class="hot-news-item"
                  @click="goToDetail(news.id)"
                >
                  <div class="hot-news-image">
                    <img :src="news.coverImage || '/images/default-news.svg'" :alt="news.title" @error="e = loading="lazy" decoding="async"> e.target.src = '/images/default-news.svg'" />
                    <div class="hot-badge">热门</div>
                  </div>
                  <div class="hot-news-content">
                    <div class="news-category">{{ getCategoryName(news.category) }}</div>
                    <h3>{{ news.title }}</h3>
                    <p>{{ news.summary }}</p>
                    <div class="news-meta">
                      <span class="news-date">{{ formatDate(news.createdAt) }}</span>
                      <span class="news-views">{{ news.viewCount || 0 }}次阅读</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 资讯列表 -->
            <div class="news-list" v-loading="loading">
              <div class="list-header">
                <h2>{{ searchParams.category ? getCategoryName(searchParams.category) : '最新资讯' }}</h2>
                <div class="sort-options">
                  <el-radio-group v-model="searchParams.sortBy" @change="handleSearch">
                    <el-radio-button label="latest">最新发布</el-radio-button>
                    <el-radio-button label="hot">热门阅读</el-radio-button>
                  </el-radio-group>
                </div>
              </div>

              <div class="news-items">
                <div
                  v-for="news in newsList"
                  :key="news.id"
                  class="news-item"
                  @click="goToDetail(news.id)"
                >
                  <div class="news-image">
                    <img :src="news.coverImage || '/images/default-news.svg'" :alt="news.title" @error="e = loading="lazy" decoding="async"> e.target.src = '/images/default-news.svg'" />
                  </div>
                  <div class="news-content">
                    <div class="news-header">
                      <div class="news-category">{{ getCategoryName(news.category) }}</div>
                      <div class="news-date">{{ formatDate(news.createdAt) }}</div>
                    </div>
                    <h3 class="news-title">{{ news.title }}</h3>
                    <p class="news-summary">{{ news.summary }}</p>
                    <div class="news-footer">
                      <div class="news-stats">
                        <span class="views">
                          <el-icon><View /></el-icon>
                          {{ news.viewCount || 0 }}
                        </span>
                        <span class="likes" v-if="news.likeCount">
                          <el-icon><Star /></el-icon>
                          {{ news.likeCount }}
                        </span>
                      </div>
                      <div class="read-more">
                        <span>阅读全文</span>
                        <el-icon><ArrowRight /></el-icon>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 空状态 -->
              <div v-if="!loading && newsList.length === 0" class="empty-state">
                <el-empty description="暂无资讯数据">
                  <el-button type="primary" @click="resetSearch">重置搜索</el-button>
                </el-empty>
              </div>

              <!-- 分页 -->
              <div class="pagination-wrapper" v-if="total > 0">
                <el-pagination
                  :current-page="searchParams.pageNum"
                  :page-size="searchParams.pageSize"
                  :page-sizes="[10, 20, 30, 50]"
                  :total="total"
                  layout="total, sizes, prev, pager, next, jumper"
                  @size-change="handleSizeChange"
                  @current-change="handleCurrentChange"
                />
              </div>
            </div>
          </div>

          <!-- 侧边栏 -->
          <div class="sidebar">
            <!-- 最新公告 -->
            <div class="sidebar-card">
              <h3>最新资讯</h3>
              <div class="announcement-list">
                <div
                  v-for="announcement in announcements"
                  :key="announcement.id"
                  class="announcement-item"
                  @click="goToDetail(announcement.id)"
                >
                  <div class="announcement-title">{{ announcement.title }}</div>
                  <div class="announcement-date">{{ formatDate(announcement.createdAt) }}</div>
                </div>
              </div>
            </div>

            <!-- 热门标签 -->
            <div class="sidebar-card">
              <h3>热门标签</h3>
              <div class="tags-list">
                <el-tag
                  v-for="tag in hotTags"
                  :key="tag"
                  class="hot-tag"
                  @click="searchByTag(tag)"
                >
                  {{ tag }}
                </el-tag>
              </div>
            </div>

            <!-- 统计信息 -->
            <div class="sidebar-card">
              <h3>资讯统计</h3>
              <div class="stats-list">
                <div class="stat-item">
                  <span class="stat-label">总资讯数</span>
                  <span class="stat-value">{{ stats.totalNews || 0 }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">今日更新</span>
                  <span class="stat-value">{{ stats.todayNews || 0 }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">总阅读量</span>
                  <span class="stat-value">{{ stats.totalViews || 0 }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Search,
  Document,
  ChatRound,
  Calendar,
  Trophy,
  View,
  Star,
  ArrowRight
} from '@element-plus/icons-vue'
import newsApi from '@/api/news'
import headerBg from '@/assets/image/动态资讯背景.webp'
import { scrollMainContentToTop } from '@/utils/scroll'

const router = useRouter()
const route = useRoute()

// 数据状态
const loading = ref(false)
const newsList = ref([])
const hotNews = ref([])
const announcements = ref([])
const total = ref(0)

// 搜索参数
const searchParams = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  category: null,
  sortBy: 'latest',
  status: 1 // 只查询已发布的资讯
})

// 热门标签
const hotTags = ref(['乡村振兴', '政策解读', '产业发展', '美丽乡村', '科技兴农', '文化传承'])

// 统计信息
const stats = ref({
  totalNews: 0,
  todayNews: 0,
  totalViews: 0
})

// 分类名称映射
const categoryNames = {
  policy: '政策通知',
  news: '乡村新闻',
  activity: '活动预告'
}

// 获取分类名称
const getCategoryName = (category) => {
  return categoryNames[category] || category
}

// 获取热门资讯（置顶资讯）
const getHotNews = async () => {
  try {
    const res = await newsApi.getTopNews(6)
    if (res.code === 200) {
      hotNews.value = res.data
    }
  } catch (error) {
    console.error('获取置顶资讯失败:', error)
    // 如果获取失败，使用推荐资讯作为替代
    try {
      const featuredRes = await newsApi.getFeaturedNews(6)
      if (featuredRes.code === 200) {
        hotNews.value = featuredRes.data
      }
    } catch (featuredError) {
      console.error('获取推荐资讯失败:', featuredError)
    }
  }
}

// 获取资讯列表
const getNewsList = async () => {
  loading.value = true
  try {
    const res = await newsApi.getNewsPage(searchParams)
    if (res.code === 200) {
      newsList.value = res.data.records
      total.value = res.data.total
    }
  } catch (error) {
    console.error('获取资讯列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取侧边栏最新资讯
const getAnnouncements = async () => {
  try {
    const res = await newsApi.getLatestNews(5)
    if (res.code === 200) {
      announcements.value = res.data
    }
  } catch (error) {
    console.error('获取最新资讯失败:', error)
  }
}

// 获取统计信息
const getStats = async () => {
  try {
    const res = await newsApi.getNewsStats()
    if (res.code === 200) {
      stats.value = res.data
    }
  } catch (error) {
    console.error('获取统计信息失败:', error)
    // 如果获取失败，使用模拟数据
    stats.value = {
      totalNews: newsList.value.length || 0,
      todayNews: 0,
      totalViews: newsList.value.reduce((sum, news) => sum + (news.viewCount || 0), 0)
    }
  }
}

// 搜索处理
const handleSearch = () => {
  searchParams.pageNum = 1
  getNewsList()
}

// 分类选择
const selectCategory = (category) => {
  searchParams.category = category
  searchParams.pageNum = 1
  getNewsList()
}

// 标签搜索
const searchByTag = (tag) => {
  searchParams.keyword = tag
  searchParams.pageNum = 1
  getNewsList()
}

// 重置搜索
const resetSearch = () => {
  searchParams.keyword = ''
  searchParams.category = null
  searchParams.sortBy = 'latest'
  searchParams.pageNum = 1
  searchParams.status = 1 // 保持只查询已发布状态
  getNewsList()
}

// 分页处理
const handleSizeChange = (size) => {
  searchParams.pageSize = size
  searchParams.pageNum = 1
  getNewsList()
}

const handleCurrentChange = (page) => {
  searchParams.pageNum = page
  getNewsList()
  scrollMainContentToTop()
}

// 跳转到详情页
const goToDetail = (id) => {
  router.push(`/news/${id}`)
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  const now = new Date()
  const newsDate = new Date(date)
  const diff = now - newsDate
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60))
      return `${minutes}分钟前`
    }
    return `${hours}小时前`
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return newsDate.toLocaleDateString()
  }
}

// 初始化
onMounted(() => {
  // 从路由参数获取初始搜索条件
  if (route.query.category) {
    searchParams.category = route.query.category
  }
  if (route.query.keyword) {
    searchParams.keyword = route.query.keyword
  }

  getHotNews()
  getNewsList()
  getAnnouncements()
  getStats()
})
</script>

<style scoped>
.news-page {
  min-height: 100vh;
  background: var(--color-bg-body);
}

.container {
  margin: 0 auto;
  padding: 0 20px;
}

/* 页面头部 */
.page-header {
  background-size: cover;
  background-position: center;
  color: #ffffff;
  padding: 70px 0;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.header-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  pointer-events: none;
}

.page-header h1 {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 16px;
  color: #ffffff;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 1;
}

.page-header p {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 1;
}

/* 搜索区域 */
.search-section {
  background: var(--color-bg-surface);
  padding: 30px 0;
  border-bottom: 1px solid var(--color-border);
}

.search-form {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}

.search-form__keyword {
  width: 400px;
  max-width: 100%;
}

.search-form__actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-form__select {
  width: 200px;
}

.search-form__button {
  min-width: 104px;
}

/* 分类标签 */
.category-tabs {
  background: var(--color-bg-surface);
  padding: 20px 0;
  border-bottom: 1px solid var(--color-border);
}

.tabs-wrapper {
  display: flex;
  gap: 20px;
  align-items: center;
  overflow-x: auto;
  padding-bottom: 5px;
}

.category-tab {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 20px;
  background: var(--color-bg-muted);
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.category-tab:hover {
  background: var(--color-border);
  color: var(--color-text-secondary);
}

.category-tab.active {
  background: var(--color-primary-500);
  color: var(--color-text-inverse);
}

/* 内容布局 */
.news-content {
  padding: 40px 0 80px;
}

.content-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 40px;
}

/* 主要内容 */
.main-content {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

/* 热门资讯 */
.hot-news h2 {
  font-size: 24px;
  color: var(--color-text-primary);
  margin-bottom: 24px;
  font-weight: 600;
}

.hot-news-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
}

.hot-news-item {
  background: var(--color-bg-surface);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  transition: all 0.3s ease;
  cursor: pointer;
}

.hot-news-item:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-card-hover);
}

.hot-news-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.hot-news-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hot-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: var(--color-danger);
  color: var(--color-text-inverse);
  padding: 4px 12px;
  border-radius: var(--radius-lg);
  font-size: 12px;
  font-weight: 600;
}

.hot-news-content {
  padding: 20px;
}

.news-category {
  font-size: 12px;
  color: var(--color-primary-500);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.hot-news-content h3 {
  font-size: 18px;
  color: var(--color-text-primary);
  margin-bottom: 12px;
  font-weight: 600;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hot-news-content p {
  color: var(--color-text-tertiary);
  line-height: 1.6;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--color-text-placeholder);
}

/* 资讯列表 */
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.list-header h2 {
  font-size: 24px;
  color: var(--color-text-primary);
  font-weight: 600;
}

.news-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.news-item {
  display: flex;
  background: var(--color-bg-surface);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  transition: all 0.3s ease;
  cursor: pointer;
}

.news-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-card-hover);
}

.news-image {
  width: 200px;
  height: 140px;
  flex-shrink: 0;
  overflow: hidden;
}

.news-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.news-content {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.news-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.news-date {
  font-size: 12px;
  color: var(--color-text-placeholder);
}

.news-title {
  font-size: 18px;
  color: var(--color-text-primary);
  margin-bottom: 12px;
  font-weight: 600;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-summary {
  color: var(--color-text-tertiary);
  line-height: 1.6;
  margin-bottom: auto;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
}

.news-stats {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--color-text-placeholder);
}

.news-stats span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.read-more {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--color-primary-500);
  font-size: 14px;
  font-weight: 500;
}

/* 侧边栏 */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.sidebar-card {
  background: var(--color-bg-surface);
  border-radius: var(--radius-xl);
  padding: 24px;
  box-shadow: var(--shadow-card);
}

.sidebar-card h3 {
  font-size: 18px;
  color: var(--color-text-primary);
  margin-bottom: 20px;
  font-weight: 600;
  border-bottom: 2px solid var(--color-border);
  padding-bottom: 12px;
}

/* 公告列表 */
.announcement-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.announcement-item {
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 12px;
  border-radius: 8px;
}

.announcement-item:hover {
  background: var(--color-bg-body);
}

.announcement-title {
  font-size: 14px;
  color: var(--color-text-primary);
  font-weight: 500;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.announcement-date {
  font-size: 12px;
  color: var(--color-text-placeholder);
}

/* 热门标签 */
.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.hot-tag {
  cursor: pointer;
  transition: all 0.3s ease;
}

.hot-tag:hover {
  background: var(--color-primary-500);
  color: var(--color-text-inverse);
}

/* 统计信息 */
.stats-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-bg-muted);
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  font-size: 14px;
  color: var(--color-text-tertiary);
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-primary-500);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

/* 响应式设计 */
@media (max-width: 968px) {
  .content-layout {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .hot-news-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 40px 0;
  }

  .page-header h1 {
    font-size: 24px;
  }

  .page-header p {
    font-size: 14px;
  }

  .search-section {
    padding: 20px 0;
  }

  .search-form {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .search-form__keyword {
    width: 100%;
  }

  .search-form__actions {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: stretch;
    gap: 8px;
    width: 100%;
  }

  .search-form__select {
    width: 100%;
    min-width: 0;
  }

  .search-form__button {
    min-width: 92px;
    padding-inline: 16px;
  }

  .category-tabs {
    padding: 12px 0;
  }

  .tabs-wrapper {
    gap: 10px;
  }

  .category-tab {
    padding: 6px 14px;
  }

  .list-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .news-items {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .news-item {
    flex-direction: row;
  }

  .news-image {
    width: 100px;
    height: 80px;
  }

  .news-content {
    padding: 10px;
  }

  .news-content h4,
  .news-title {
    font-size: 14px;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    margin-bottom: 4px;
  }

  .news-summary {
    display: none;
  }

  .news-meta,
  .news-stats {
    font-size: 11px;
  }

  .news-footer {
    margin-top: 8px;
  }

  .pagination-wrapper :deep(.el-pagination) {
    --el-pagination-button-width: 28px;
    --el-pagination-button-height: 28px;
  }
}

@media (max-width: 480px) {
  .search-form {
    gap: 8px;
  }

  .search-form__actions {
    gap: 6px;
  }

  .search-form__button {
    min-width: 84px;
    padding-inline: 14px;
  }

  .news-image {
    width: 90px;
    height: 70px;
  }

  .news-content {
    padding: 8px;
  }

  .news-title {
    font-size: 13px;
  }
}

/* C14 - 360px 兜底（iPhone SE / 折叠屏） */
@media (max-width: 360px) {
  .container,
  .page-container,
  .content-container {
    padding-left: 10px;
    padding-right: 10px;
  }
  .page-header {
    padding: 28px 0 !important;
  }
  .page-header h1 {
    font-size: 18px !important;
  }
  .page-header p {
    font-size: 12px !important;
  }
  .products-grid,
  .attractions-grid,
  .news-grid,
  .routes-grid,
  .activities-grid {
    gap: 8px !important;
  }
  .el-button:not(.is-circle):not(.is-text) {
    min-height: 36px;
  }
}
</style>

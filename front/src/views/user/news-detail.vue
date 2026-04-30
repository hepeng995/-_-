<template>
  <div class="news-detail" v-loading="loading">
    <div v-if="news" class="detail-content">
      <!-- 面包屑导航 -->
      <div class="breadcrumb-section">
        <div class="container">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item :to="{ path: '/news' }">动态资讯</el-breadcrumb-item>
            <el-breadcrumb-item>{{ news.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
      </div>

      <!-- 文章头部 -->
      <div class="article-header">
        <div class="container">
          <div class="header-content">
            <div class="article-category">
              <el-tag :type="getCategoryType(news.category)" size="large">
                {{ getCategoryName(news.category) }}
              </el-tag>
            </div>
            <h1 class="article-title">{{ news.title }}</h1>
            <div class="article-meta">
              <div class="meta-item">
                <el-icon><Calendar /></el-icon>
                <span>{{ formatDate(news.createdAt) }}</span>
              </div>
              <div class="meta-item">
                <el-icon><View /></el-icon>
                <span>{{ news.viewCount || 0 }}次阅读</span>
              </div>
              <div class="meta-item" v-if="news.author">
                <el-icon><User /></el-icon>
                <span>{{ news.author }}</span>
              </div>
            </div>
            <div class="article-summary" v-if="news.summary">
              {{ news.summary }}
            </div>
          </div>
        </div>
      </div>

      <!-- 文章内容 -->
      <div class="article-content">
        <div class="container">
          <div class="content-layout">
            <!-- 主要内容 -->
            <div class="main-content">
              <div class="article-body">
                <!-- 封面图片 -->
                <div class="cover-image" v-if="news.coverImage">
                  <img :src="news.coverImage" :alt="news.title" />
                </div>
                
                <!-- 正文内容 -->
                <div class="content-text" v-html="news.content"></div>
              </div>

              <!-- 文章操作 -->
              <div class="article-actions">
                <el-button @click="shareNews">
                  <el-icon><Share /></el-icon>
                  分享
                </el-button>
                <el-button @click="likeNews" :type="isLiked ? 'primary' : 'default'">
                  <el-icon><Star /></el-icon>
                  {{ isLiked ? '已点赞' : '点赞' }} ({{ news.likeCount || 0 }})
                </el-button>
              </div>

              <!-- 相关推荐 -->
              <div class="related-news" v-if="relatedNews.length > 0">
                <h3>相关推荐</h3>
                <div class="related-list">
                  <div 
                    v-for="item in relatedNews"
                    :key="item.id"
                    class="related-item"
                    @click="goToNews(item.id)"
                  >
                    <div class="related-image">
                      <img :src="item.coverImage || '/images/default-news.jpg'" :alt="item.title" />
                    </div>
                    <div class="related-content">
                      <h4>{{ item.title }}</h4>
                      <div class="related-meta">
                        <span class="related-date">{{ formatDate(item.createdAt) }}</span>
                        <span class="related-views">{{ item.viewCount || 0 }}次阅读</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 侧边栏 -->
            <div class="sidebar">
              <!-- 最新资讯 -->
              <div class="sidebar-card">
                <h3>最新资讯</h3>
                <div class="latest-list">
                  <div 
                    v-for="item in latestNews"
                    :key="item.id"
                    class="latest-item"
                    @click="goToNews(item.id)"
                  >
                    <div class="latest-title">{{ item.title }}</div>
                    <div class="latest-date">{{ formatDate(item.createdAt) }}</div>
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
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载失败状态 -->
    <div v-else-if="!loading" class="error-state">
      <el-result icon="warning" title="资讯信息加载失败" sub-title="请检查网络连接或稍后重试">
        <template #extra>
          <el-button type="primary" @click="loadNews">重新加载</el-button>
          <el-button @click="$router.go(-1)">返回上页</el-button>
        </template>
      </el-result>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Calendar, View, User, Share, Star } from '@element-plus/icons-vue'
import newsApi from '@/api/news'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const news = ref(null)
const relatedNews = ref([])
const latestNews = ref([])
const isLiked = ref(false)

// 热门标签
const hotTags = ref(['乡村振兴', '政策解读', '产业发展', '美丽乡村', '科技兴农', '文化传承'])

// 分类名称映射
const categoryNames = {
  policy: '政策通知',
  news: '乡村新闻',
  activity: '活动预告'
}

// 分类类型映射
const categoryTypes = {
  policy: 'warning',
  news: 'primary',
  activity: 'success'
}

// 获取分类名称
const getCategoryName = (category) => {
  return categoryNames[category] || category
}

// 获取分类类型
const getCategoryType = (category) => {
  return categoryTypes[category] || 'info'
}

// 获取资讯详情
const loadNews = async () => {
  const id = route.params.id
  if (!id) {
    ElMessage.error('资讯ID不存在')
    router.push('/news')
    return
  }

  loading.value = true
  news.value = null
  try {
    const res = await newsApi.getNewsById(id)
    if (res.code === 200) {
      news.value = res.data
      // 设置页面标题
      document.title = `${res.data.title} - 资讯详情`
      // 获取相关推荐
      loadRelatedNews(res.data.category, id)
      // 获取最新资讯
      loadLatestNews()
    } else {
      ElMessage.error(res.message || '获取资讯详情失败')
    }
  } catch (error) {
    console.error('获取资讯详情失败:', error)
    ElMessage.error('获取资讯详情失败')
  } finally {
    loading.value = false
  }
}

// 获取相关推荐（推荐状态的资讯）
const loadRelatedNews = async (category, currentId) => {
  try {
    const res = await newsApi.getFeaturedNews(20) // 获取更多推荐资讯以便筛选
    if (res.code === 200) {
      // 优先显示同分类的推荐资讯，如果不够再显示其他分类的推荐资讯
      const sameCategory = res.data.filter(item => 
        item.id !== parseInt(currentId) && item.category === category
      )
      const otherCategory = res.data.filter(item => 
        item.id !== parseInt(currentId) && item.category !== category
      )
      
      // 合并结果，优先显示同分类的，取前4个
      relatedNews.value = [...sameCategory, ...otherCategory].slice(0, 4)
    }
  } catch (error) {
    console.error('获取相关推荐失败:', error)
    // 如果获取推荐资讯失败，回退到按分类获取
    try {
      const fallbackRes = await newsApi.getNewsByCategory(category)
      if (fallbackRes.code === 200) {
        relatedNews.value = fallbackRes.data
          .filter(item => item.id !== parseInt(currentId))
          .slice(0, 4)
      }
    } catch (fallbackError) {
      console.error('获取分类资讯失败:', fallbackError)
    }
  }
}

// 获取最新资讯
const loadLatestNews = async () => {
  try {
    const res = await newsApi.getLatestNews(5)
    if (res.code === 200) {
      latestNews.value = res.data
    }
  } catch (error) {
    console.error('获取最新资讯失败:', error)
  }
}

// 分享资讯
const shareNews = async () => {
  const shareData = {
    title: news.value.title,
    text: news.value.summary,
    url: window.location.href
  }

  if (navigator.share) {
    try {
      await navigator.share(shareData)
      ElMessage.success('分享成功')
    } catch (error) {
      if (error.name !== 'AbortError') {
        fallbackShare()
      }
    }
  } else {
    fallbackShare()
  }
}

// 备用分享方式
const fallbackShare = () => {
  const url = window.location.href
  navigator.clipboard.writeText(url).then(() => {
    ElMessage.success('链接已复制到剪贴板')
  }).catch(() => {
    ElMessage.info('请手动复制链接分享')
  })
}

// 点赞资讯
const likeNews = async () => {
  try {
    // 这里应该调用点赞API
    // const res = await newsApi.likeNews(news.value.id)
    // if (res.code === 200) {
      isLiked.value = !isLiked.value
      if (isLiked.value) {
        news.value.likeCount = (news.value.likeCount || 0) + 1
        ElMessage.success('点赞成功')
      } else {
        news.value.likeCount = Math.max((news.value.likeCount || 0) - 1, 0)
        ElMessage.success('取消点赞')
      }
    // }
  } catch (error) {
    console.error('点赞失败:', error)
    ElMessage.error('操作失败')
  }
}

// 标签搜索
const searchByTag = (tag) => {
  router.push({
    path: '/news',
    query: { keyword: tag }
  })
}

// 跳转到其他资讯
const goToNews = (id) => {
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
  loadNews()
})

// 监听路由变化，切换资讯时重新加载
watch(() => route.params.id, (newId) => {
  if (newId) {
    loadNews()
  }
})
</script>

<style scoped>
.news-detail {
  min-height: 100vh;
  background: var(--color-bg-body);
}

.container {
  margin: 0 auto;
  padding: 0 20px;
}

/* 面包屑导航 */
.breadcrumb-section {
  background: var(--color-bg-surface);
  padding: 20px 0;
  border-bottom: 1px solid var(--color-border);
}

/* 文章头部 */
.article-header {
  background: var(--color-bg-surface);
  padding: 40px 0;
  border-bottom: 1px solid var(--color-border);
}

.article-category {
  margin-bottom: 20px;
}

.article-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 24px;
  line-height: 1.3;
}

.article-meta {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-tertiary);
  font-size: 14px;
}

.article-summary {
  font-size: 16px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  padding: 20px;
  background: var(--color-bg-body);
  border-left: 4px solid #8b5cf6;
  border-radius: 0 8px 8px 0;
}

/* 文章内容 */
.article-content {
  padding: 40px 0 80px;
}

.content-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 40px;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.article-body {
  background: var(--color-bg-surface);
  border-radius: var(--radius-xl);
  padding: 40px;
  box-shadow: var(--shadow-card);
}

.cover-image {
  margin-bottom: 32px;
  text-align: center;
}

.cover-image img {
  max-width: 100%;
  border-radius: var(--radius-lg);
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
}

.content-text {
  font-size: 16px;
  line-height: 1.8;
  color: var(--color-text-secondary);
}

.content-text :deep(h1),
.content-text :deep(h2),
.content-text :deep(h3),
.content-text :deep(h4),
.content-text :deep(h5),
.content-text :deep(h6) {
  color: var(--color-text-primary);
  margin: 32px 0 16px;
  font-weight: 600;
}

.content-text :deep(p) {
  margin-bottom: 16px;
}

.content-text :deep(img) {
  max-width: 100%;
  border-radius: 8px;
  margin: 16px 0;
}

.content-text :deep(blockquote) {
  border-left: 4px solid #8b5cf6;
  background: var(--color-bg-body);
  padding: 16px 20px;
  margin: 20px 0;
  border-radius: 0 8px 8px 0;
}

/* 文章操作 */
.article-actions {
  background: var(--color-bg-surface);
  border-radius: var(--radius-xl);
  padding: 24px;
  box-shadow: var(--shadow-card);
  display: flex;
  gap: 16px;
  justify-content: center;
}

/* 相关推荐 */
.related-news {
  background: var(--color-bg-surface);
  border-radius: var(--radius-xl);
  padding: 32px;
  box-shadow: var(--shadow-card);
}

.related-news h3 {
  font-size: 20px;
  color: var(--color-text-primary);
  margin-bottom: 24px;
  font-weight: 600;
  border-bottom: 2px solid var(--color-border);
  padding-bottom: 12px;
}

.related-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.related-item {
  display: flex;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 12px;
  border-radius: 8px;
}

.related-item:hover {
  background: var(--color-bg-body);
}

.related-image {
  width: 80px;
  height: 60px;
  flex-shrink: 0;
  border-radius: 6px;
  overflow: hidden;
}

.related-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.related-content {
  flex: 1;
}

.related-content h4 {
  font-size: 14px;
  color: var(--color-text-primary);
  margin-bottom: 8px;
  font-weight: 600;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.related-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: var(--color-text-placeholder);
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

/* 最新资讯 */
.latest-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.latest-item {
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 12px;
  border-radius: 8px;
}

.latest-item:hover {
  background: var(--color-bg-body);
}

.latest-title {
  font-size: 14px;
  color: var(--color-text-primary);
  font-weight: 500;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.latest-date {
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
  background: #8b5cf6;
  color: var(--color-text-inverse);
}

/* 错误状态 */
.error-state {
  padding: 60px 0;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 968px) {
  .content-layout {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .article-body {
    padding: 24px;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 12px;
  }

  .breadcrumb-section {
    padding: 12px 0;
  }

  .breadcrumb-section :deep(.el-breadcrumb) {
    font-size: 12px;
  }

  .article-header {
    padding: 20px 0;
  }

  .article-category {
    margin-bottom: 12px;
  }

  .article-title {
    font-size: 20px;
    margin-bottom: 16px;
    line-height: 1.4;
  }

  .article-meta {
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
  }

  .meta-item {
    font-size: 12px;
  }

  .article-summary {
    font-size: 14px;
    padding: 12px;
    line-height: 1.5;
  }

  .article-content {
    padding: 24px 0 40px;
  }

  .content-layout {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .main-content {
    gap: 24px;
  }

  .article-body {
    padding: 16px;
  }

  .cover-image {
    margin-bottom: 20px;
  }

  .cover-image img {
    border-radius: var(--radius-md);
  }

  .content-text {
    font-size: 14px;
    line-height: 1.7;
  }

  .article-actions {
    flex-direction: column;
    gap: 8px;
    padding: 16px;
  }

  .article-actions .el-button {
    width: 100%;
  }

  .related-news {
    padding: 20px;
  }

  .related-news h3 {
    font-size: 18px;
    margin-bottom: 16px;
  }

  .related-item {
    flex-direction: column;
    padding: 8px;
  }

  .related-image {
    width: 100%;
    height: 120px;
  }

  .related-content h4 {
    font-size: 13px;
  }

  .sidebar-card {
    padding: 16px;
  }

  .sidebar-card h3 {
    font-size: 16px;
    margin-bottom: 16px;
  }

  .latest-item {
    padding: 8px;
  }

  .latest-title {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .breadcrumb-section {
    padding: 8px 0;
  }

  .article-header {
    padding: 12px 0;
  }

  .article-title {
    font-size: 18px;
  }

  .article-summary {
    padding: 8px;
    font-size: 13px;
  }

  .article-body {
    padding: 12px;
  }

  .content-text {
    font-size: 13px;
  }

  .related-news {
    padding: 12px;
  }

  .sidebar-card {
    padding: 12px;
  }

  .article-content {
    padding: 16px 0 24px;
  }
}
</style>

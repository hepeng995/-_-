<template>
  <div class="attraction-detail" v-loading="loading">
    <div v-if="attraction" class="detail-content">
      <!-- 面包屑导航 -->
      <div class="breadcrumb-section">
        <div class="container">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item :to="{ path: '/attractions' }">景点导览</el-breadcrumb-item>
            <el-breadcrumb-item>{{ attraction.name }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
      </div>

      <!-- 景点主要信息 -->
      <div class="attraction-hero">
        <div class="container">
          <div class="hero-content">
            <div class="hero-image">
              <img :src="attraction.coverImage || attraction.cover_image || '/images/default-attraction.jpg'" :alt="attraction.name" />
            </div>
            <div class="hero-info">
              <div class="attraction-category">
                <el-tag type="primary" size="large">{{ attraction.categoryName }}</el-tag>
              </div>
              <h1 class="attraction-title">{{ attraction.name }}</h1>
              <div class="attraction-rating">
                <el-rate v-model="attraction.rating" disabled show-score text-color="#ff9900" />
                <span class="rating-text">({{ attraction.rating }}分)</span>
              </div>
              <div class="attraction-location">
                <el-icon class="location-icon"><MapLocation /></el-icon>
                <span>{{ attraction.address }}</span>
              </div>
              <p class="attraction-summary">{{ attraction.description }}</p>

              <!-- 操作按钮 -->
              <div class="action-buttons">
                <el-button type="primary" size="large" @click="showDirections">
                  <el-icon><Compass /></el-icon>
                  获取位置
                </el-button>
                <el-button size="large" @click="shareAttraction">
                  <el-icon><Share /></el-icon>
                  分享景点
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 详细介绍 -->
      <div class="attraction-details">
        <div class="container">
          <div class="details-grid">
            <!-- 详细描述 -->
            <div class="detail-section">
              <h2>详细介绍</h2>
              <div class="detail-content" v-html="attraction.content || attraction.description"></div>
            </div>

            <!-- 基本信息 -->
            <div class="info-sidebar">
              <div class="info-card">
                <h3>基本信息</h3>
                <div class="info-list">
                  <div class="info-item">
                    <span class="info-label">景点分类：</span>
                    <span class="info-value">{{ attraction.categoryName }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">开放状态：</span>
                    <el-tag :type="attraction.status === 1 ? 'success' : 'danger'">
                      {{ attraction.status === 1 ? '开放中' : '暂停开放' }}
                    </el-tag>
                  </div>
                  <div class="info-item" v-if="attraction.openingHours || attraction.opening_hours">
                    <span class="info-label">开放时间：</span>
                    <span class="info-value">{{ attraction.openingHours || attraction.opening_hours }}</span>
                  </div>
                  <div class="info-item" v-if="attraction.ticketPrice || attraction.ticket_price">
                    <span class="info-label">门票价格：</span>
                    <span class="info-value price">￥{{ attraction.ticketPrice || attraction.ticket_price }}</span>
                  </div>
                </div>
              </div>

              <!-- 实时天气 -->
              <WeatherCard v-if="attraction.id" :attraction-id="attraction.id" />

              <!-- 交通指南 -->
              <div class="info-card" v-if="attraction.trafficGuide || attraction.traffic_guide">
                <h3>交通指南</h3>
                <div class="transportation-info">
                  <p>{{ attraction.trafficGuide || attraction.traffic_guide }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 图片展示 -->
      <!-- <div class="attraction-gallery" v-if="displayImages && displayImages.length > 0">
        <div class="container">
          <h2>景点图片</h2>
          <div class="gallery-grid">
            <div 
              v-for="(image, index) in displayImages" 
              :key="index"
              class="gallery-item"
              @click="previewImage(index)"
            >
              <img :src="image" :alt="`${attraction.name}图片${index + 1}`" />
            </div>
          </div>
        </div>
      </div> -->

      <!-- 相关推荐 -->
      <div class="related-attractions" v-if="relatedAttractions.length > 0">
        <div class="container">
          <h2>相关推荐</h2>
          <div class="related-grid">
            <div 
              v-for="item in relatedAttractions"
              :key="item.id"
              class="related-card"
              @click="goToAttraction(item.id)"
            >
              <div class="related-image">
                <img :src="item.coverImage || item.cover_image || '/images/default-attraction.jpg'" :alt="item.name" />
              </div>
              <div class="related-info">
                <h4>{{ item.name }}</h4>
                <div class="related-rating">
                  <el-rate v-model="item.rating" disabled size="small" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载失败状态 -->
    <div v-else-if="!loading" class="error-state">
      <el-result icon="warning" title="景点信息加载失败" sub-title="请检查网络连接或稍后重试">
        <template #extra>
          <el-button type="primary" @click="loadAttraction">重新加载</el-button>
          <el-button @click="$router.go(-1)">返回上页</el-button>
        </template>
      </el-result>
    </div>

    <!-- 地图弹窗 -->
    <LocationMap 
      :visible="mapDialogVisible" 
      :attraction="attraction" 
      @update:visible="mapDialogVisible = $event"
      @close="mapDialogVisible = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElImageViewer } from 'element-plus'
import { MapLocation, Compass, Share } from '@element-plus/icons-vue'
import attractionApi from '@/api/attraction'
import LocationMap from '@/components/LocationMap.vue'
import WeatherCard from '@/components/WeatherCard.vue'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const attraction = ref(null)
const relatedAttractions = ref([])
const mapDialogVisible = ref(false)

// 处理图片数据的计算属性
const displayImages = computed(() => {
  if (!attraction.value) return []
  
  let images = attraction.value.images
  
  // 如果是字符串，尝试解析为JSON
  if (typeof images === 'string') {
    try {
      images = JSON.parse(images)
    } catch (e) {
      console.error('解析图片数据失败:', e)
      return []
    }
  }
  
  // 确保返回数组
  return Array.isArray(images) ? images : []
})

// 获取景点详情
const loadAttraction = async () => {
  const id = route.params.id
  if (!id) {
    ElMessage.error('景点ID不存在')
    router.push('/attractions')
    return
  }

  loading.value = true
  try {
    const res = await attractionApi.getAttractionById(id)
    if (res.code === 200) {
      attraction.value = res.data
      // 设置页面标题
      document.title = `${res.data.name} - 景点详情`
      // 获取相关推荐
      loadRelatedAttractions(res.data.categoryId, id)
    } else {
      ElMessage.error(res.message || '获取景点详情失败')
    }
  } catch (error) {
    console.error('获取景点详情失败:', error)
    ElMessage.error('获取景点详情失败')
  } finally {
    loading.value = false
  }
}

// 获取相关推荐
const loadRelatedAttractions = async (categoryId, currentId) => {
  try {
    const res = await attractionApi.getAttractionsByCategory(categoryId)
    if (res.code === 200) {
      // 过滤掉当前景点，只取前4个
      relatedAttractions.value = res.data
        .filter(item => item.id !== parseInt(currentId))
        .slice(0, 4)
    }
  } catch (error) {
    console.error('获取相关推荐失败:', error)
  }
}

// 显示地图定位
const showDirections = () => {
  if (!attraction.value || !attraction.value.longitude || !attraction.value.latitude) {
    ElMessage.warning('暂无位置信息')
    return
  }
  
  mapDialogVisible.value = true
}

// 分享景点
const shareAttraction = async () => {
  const shareData = {
    title: attraction.value.name,
    text: attraction.value.description,
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

// 预览图片
const previewImage = (index) => {
  const viewer = new ElImageViewer({
    urlList: displayImages.value,
    initialIndex: index,
    onClose: () => {
      viewer.close()
    }
  })
}

// 跳转到其他景点
const goToAttraction = (id) => {
  router.push(`/attractions/${id}`)
  // 重新加载数据
  nextTick(() => {
    loadAttraction()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })
}

// 初始化
onMounted(() => {
  loadAttraction()
})
</script>

<style scoped>
.attraction-detail {
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

/* 景点主要信息 */
.attraction-hero {
  background: var(--color-bg-surface);
  padding: 40px 0;
}

.hero-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: start;
}

.hero-image {
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
}

.hero-image img {
  width: 100%;
  height: 400px;
  object-fit: cover;
}

.hero-info {
  padding: 20px 0;
}

.attraction-category {
  margin-bottom: 16px;
}

.attraction-title {
  font-size: 36px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 20px;
  line-height: 1.2;
}

.attraction-rating {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.rating-text {
  color: var(--color-text-tertiary);
  font-weight: 500;
}

.attraction-location {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-tertiary);
  margin-bottom: 24px;
  font-size: 16px;
}

.location-icon {
  color: var(--color-info);
}

.attraction-summary {
  font-size: 16px;
  line-height: 1.8;
  color: var(--color-text-secondary);
  margin-bottom: 32px;
}

.attraction-features {
  margin-bottom: 32px;
}

.attraction-features h3 {
  font-size: 18px;
  color: var(--color-text-primary);
  margin-bottom: 16px;
  font-weight: 600;
}

.features-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.feature-tag {
  margin: 0;
}

.action-buttons {
  display: flex;
  gap: 16px;
}

/* 详细介绍 */
.attraction-details {
  padding: 60px 0;
}

.details-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 60px;
}

.detail-section h2 {
  font-size: 28px;
  color: var(--color-text-primary);
  margin-bottom: 24px;
  font-weight: 600;
}

.detail-content {
  font-size: 16px;
  line-height: 1.8;
  color: var(--color-text-secondary);
}

/* 信息侧边栏 */
.info-sidebar {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-card {
  background: var(--color-bg-surface);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-card);
}

.info-card h3 {
  font-size: 20px;
  color: var(--color-text-primary);
  margin-bottom: 20px;
  font-weight: 600;
  border-bottom: 2px solid var(--color-border);
  padding-bottom: 12px;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  color: var(--color-text-tertiary);
  font-weight: 500;
}

.info-value {
  color: var(--color-text-primary);
  font-weight: 600;
}

.info-value.price {
  color: var(--color-danger);
  font-size: 18px;
}

.transportation-info,
.tips-info {
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-secondary);
}

/* 图片展示 */
.attraction-gallery {
  padding: 60px 0;
  background: var(--color-bg-surface);
}

.attraction-gallery h2 {
  font-size: 28px;
  color: var(--color-text-primary);
  margin-bottom: 32px;
  text-align: center;
  font-weight: 600;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.gallery-item {
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.gallery-item:hover {
  transform: scale(1.05);
}

.gallery-item img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

/* 相关推荐 */
.related-attractions {
  padding: 60px 0;
}

.related-attractions h2 {
  font-size: 28px;
  color: var(--color-text-primary);
  margin-bottom: 32px;
  text-align: center;
  font-weight: 600;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.related-card {
  background: var(--color-bg-surface);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  transition: all 0.3s ease;
  cursor: pointer;
}

.related-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
}

.related-image {
  height: 160px;
  overflow: hidden;
}

.related-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.related-info {
  padding: 20px;
}

.related-info h4 {
  font-size: 16px;
  color: var(--color-text-primary);
  margin-bottom: 12px;
  font-weight: 600;
}

/* 错误状态 */
.error-state {
  padding: 60px 0;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 968px) {
  .hero-content {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .details-grid {
    grid-template-columns: 1fr;
    gap: 40px;
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

  .attraction-hero {
    padding: 20px 0;
  }

  .hero-content {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .hero-image img {
    height: 200px;
    border-radius: 0;
  }

  .hero-info {
    padding: 12px 0;
  }

  .attraction-title {
    font-size: 20px;
    margin-bottom: 12px;
  }

  .attraction-category {
    margin-bottom: 12px;
  }

  .attraction-rating {
    margin-bottom: 12px;
  }

  .attraction-location {
    margin-bottom: 16px;
    font-size: 14px;
  }

  .attraction-summary {
    font-size: 14px;
    margin-bottom: 20px;
    line-height: 1.6;
  }

  .action-buttons {
    flex-direction: column;
    gap: 8px;
  }

  .action-buttons .el-button {
    width: 100%;
  }

  .attraction-details {
    padding: 24px 0;
  }

  .detail-section h2 {
    font-size: 20px;
    margin-bottom: 16px;
  }

  .detail-content {
    padding: 0;
    font-size: 14px;
  }

  .info-card {
    padding: 16px;
  }

  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .gallery-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }

  .related-attractions {
    padding: 24px 0;
  }

  .related-attractions h2 {
    font-size: 20px;
    margin-bottom: 20px;
  }

  .related-grid {
    grid-template-columns: 1fr;
  }

  .related-info {
    padding: 12px;
  }
}

@media (max-width: 480px) {
  .breadcrumb-section {
    padding: 8px 0;
  }

  .attraction-title {
    font-size: 18px;
  }

  .hero-image img {
    height: 180px;
  }

  .attraction-hero {
    padding: 12px 0;
  }

  .attraction-details {
    padding: 16px 0;
  }

  .info-card {
    padding: 12px;
  }

  .related-attractions {
    padding: 16px 0;
  }
}
</style>

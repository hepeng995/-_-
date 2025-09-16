<template>
  <div class="home-page">
    <!-- 轮播图区域 - 调整高度 -->
    <section class="hero-section">
      <el-carousel height="450px" indicator-position="outside" arrow="hover" :interval="5000">
        <el-carousel-item v-for="(item, index) in bannerImages" :key="index">
          <div class="carousel-item" :style="{ backgroundImage: `url(${item.image})` }">
            <div class="carousel-overlay">
              <div class="carousel-content">
                <h2 class="carousel-title">{{ item.title }}</h2>
                <p class="carousel-subtitle">{{ item.subtitle }}</p>
                <el-button type="primary" size="large" @click="goToPage(item.path)">
                  {{ item.buttonText }}
                  <el-icon class="ml-2"><ArrowRight /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </section>

    <!-- 主要内容区域 - 紧凑布局 -->
    <div class="main-content">
      <!-- 桃源概览 - 简化布局 -->
      <section class="overview-section">
        <div class="container">
          <div class="section-header compact">
            <h2>桃源概览</h2>
            <p>走进新桃源智界，感受乡村振兴的美好愿景</p>
          </div>
          <div class="overview-content">
            <div class="overview-text">
              <div class="overview-item">
                <h3>历史文化</h3>
                <p>{{ overviewData.history || '这里承载着深厚的历史文化底蕴，古老的村落见证着时代的变迁，传统文化在这里得到传承和发扬。' }}</p>
              </div>
              <div class="overview-item">
                <h3>发展理念</h3>
                <p>{{ overviewData.philosophy || '以绿色发展为理念，以科技创新为动力，打造集生态旅游、特色农业、文化传承为一体的现代化乡村示范区。' }}</p>
              </div>
              <div class="overview-item">
                <h3>荣誉成就</h3>
                <p>{{ formatHonors(overviewData.honors) || '荣获全国乡村振兴示范县、国家AAA级旅游景区、全国文明村镇、美丽乡村建设示范点等多项荣誉，成为乡村发展的典型代表。' }}</p>
              </div>
            </div>
            <div class="overview-image">
              <img :src="overviewData.image || 桃源概览" alt="桃源概览" />
            </div>
          </div>
        </div>
      </section>

      <!-- 精选推荐区域 - 并排布局 -->
      <section class="featured-section">
        <div class="container">
          <div class="featured-grid">
            <!-- 推荐景点 -->
            <div class="featured-block">
              <div class="block-header">
                <h3>推荐景点</h3>
                <el-button type="text" @click="goTo('/attractions')">查看更多 →</el-button>
              </div>
              <div class="attractions-grid compact" v-loading="attractionsLoading">
                <div 
                  v-for="attraction in featuredAttractions.slice(0, 4)" 
                  :key="attraction.id"
                  class="attraction-card compact"
                  @click="goToAttractionDetail(attraction.id)"
                >
                  <div class="attraction-image">
                    <img :src="attraction.coverImage || '/images/default-attraction.jpg'" :alt="attraction.name" />
                    <div class="attraction-overlay">
                      <el-button type="primary" size="small">查看详情</el-button>
                    </div>
                  </div>
                  <div class="attraction-info">
                    <h4>{{ attraction.name }}</h4>
                    <p>{{ attraction.description }}</p>
                    <el-rate v-model="attraction.rating" disabled size="small" />
                  </div>
                </div>
              </div>
            </div>

            <!-- 热销商品 -->
            <div class="featured-block">
              <div class="block-header">
                <h3>热销商品</h3>
                <el-button type="text" @click="goTo('/products')">进入商城 →</el-button>
              </div>
              <div class="products-grid compact" v-loading="productsLoading">
                <div 
                  v-for="product in hotProducts.slice(0, 4)" 
                  :key="product.id"
                  class="product-card compact"
                  @click="goToProductDetail(product.id)"
                >
                  <div class="product-image">
                    <img :src="product.coverImage || '/images/default-product.jpg'" :alt="product.name" />
                    <div class="product-badge" v-if="product.isFeatured">推荐</div>
                  </div>
                  <div class="product-info">
                    <h4>{{ product.name }}</h4>
                    <p class="product-origin">{{ product.origin }}</p>
                    <div class="product-price">
                      <span class="current-price">￥{{ product.price }}</span>
                      <span v-if="product.originalPrice" class="original-price">￥{{ product.originalPrice }}</span>
                    </div>
                    <div class="product-meta">
                      <span class="sales">已售{{ product.salesCount }}</span>
                      <el-rate v-model="product.rating" disabled size="small" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 最新资讯 - 紧凑布局 -->
      <section class="latest-news compact">
        <div class="container">
          <div class="section-header compact">
            <h2>最新资讯</h2>
            <p>了解乡村发展动态</p>
          </div>
          <div class="news-list compact" v-loading="newsLoading">
            <div 
              v-for="news in latestNews.slice(0, 6)" 
              :key="news.id"
              class="news-item compact"
              @click="goToNewsDetail(news.id)"
            >
              <div class="news-image">
                <img :src="news.coverImage || '/images/default-news.jpg'" :alt="news.title" />
              </div>
              <div class="news-content">
                <h4>{{ news.title }}</h4>
                <p>{{ news.summary }}</p>
                <div class="news-meta">
                  <span class="news-date">{{ formatDate(news.createdAt) }}</span>
                  <span class="news-category">{{ news.category }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="section-footer compact">
            <el-button type="primary" @click="goTo('/news')">查看更多资讯</el-button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight, MapLocation, ShoppingBag, ChatRound } from '@element-plus/icons-vue'
import attractionApi from '@/api/attraction'
import productApi from '@/api/product'
import newsApi from '@/api/news'
import homeApi from '@/api/home'

const router = useRouter()

// 轮播图数据
import 美丽乡村 from '@/assets/image/美丽乡村.png'
import 特产商城 from '@/assets/image/特产商城.png'
import 动态资讯 from '@/assets/image/动态资讯.png'
import 桃源概览 from '@/assets/image/桃源概览.jpg'
import 建言献策 from '@/assets/image/建言献策.png'

const bannerImages = ref([
  {
    image: 美丽乡村,
    title: '美丽乡村 生态桃源',
    subtitle: '走进新时代的乡村振兴示范区',
    path: '/attractions',
    buttonText: '探索景点'
  },
  {
    image: 特产商城,
    title: '特产商城 品质生活',
    subtitle: '购买正宗的乡村特产',
    path: '/products',
    buttonText: '进入商城'
  },
  {
    image: 动态资讯,
    title: '动态资讯 时事热点',
    subtitle: '获取最新动态，了解乡村发展',
    path: '/news',
    buttonText: '查看资讯'
  },
  {
    image: 建言献策,
    title: '建言献策 乡村发展',
    subtitle: '建言献策，助力乡村发展',
    path: '/forum',
    buttonText: '参与讨论'
  }
])

// 概览数据
const overviewData = ref({
  history: '',
  philosophy: '',
  honors: '',
  image: ''
})

// 推荐景点
const featuredAttractions = ref([])
const attractionsLoading = ref(false)

// 热销商品
const hotProducts = ref([])
const productsLoading = ref(false)

// 最新资讯
const latestNews = ref([])
const newsLoading = ref(false)

// 获取首页所有数据
const getHomeData = async () => {
  try {
    attractionsLoading.value = true
    productsLoading.value = true
    newsLoading.value = true
    
    const res = await homeApi.getHomeData()
    if (res.code === 200) {
      const data = res.data
      // 设置推荐景点
      featuredAttractions.value = data.recommendAttractions || []
      // 设置热销商品
      hotProducts.value = data.hotProducts || []
      // 设置最新资讯
      latestNews.value = data.featuredNews || []
    }
  } catch (error) {
    console.error('获取首页数据失败:', error)
  } finally {
    attractionsLoading.value = false
    productsLoading.value = false
    newsLoading.value = false
  }
}

// 获取概览信息
const getOverviewData = async () => {
  try {
    const res = await homeApi.getOverview()
    if (res.code === 200) {
      overviewData.value = res.data
    }
  } catch (error) {
    console.error('获取概览信息失败:', error)
  }
}

// 页面跳转
const goTo = (path) => {
  router.push(path)
}

const goToAttractionDetail = (id) => {
  router.push(`/attractions/${id}`)
}

const goToProductDetail = (id) => {
  router.push(`/products/${id}`)
}

const goToNewsDetail = (id) => {
  router.push(`/news/${id}`)
}

const goToPage = (path) => {
  router.push(path)
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString()
}

// 格式化荣誉成就数据
const formatHonors = (honors) => {
  if (!honors) return ''
  if (typeof honors === 'string') return honors
  if (Array.isArray(honors)) {
    return honors.join('、')
  }
  return String(honors)
}

// 初始化
onMounted(() => {
  getOverviewData()
  getHomeData()
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #f8fafc;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 轮播图区域 - 紧凑设计 */
.hero-section {
  position: relative;
  margin-bottom: 20px;
  margin-top: -20px;
}

.carousel-item {
  width: 100%;
  height: 450px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.carousel-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.carousel-content {
  text-align: center;
  color: white;
  max-width: 600px;
  padding: 0 20px;
}

.carousel-title {
  font-size: 42px;
  font-weight: 700;
  margin-bottom: 12px;
  text-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

.carousel-subtitle {
  font-size: 18px;
  margin-bottom: 24px;
  opacity: 0.9;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

/* 主要内容区域 */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 通用section样式 - 紧凑布局 */
section {
  padding: 20px 0;
  margin-bottom: 15px;
}

section.overview-section {
  background: white;
  border-radius: 16px;
  padding: 25px 0;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  margin-bottom: 20px;
}

section.featured-section {
  background: white;
  border-radius: 16px;
  padding: 25px 0;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  margin-bottom: 20px;
}

section.latest-news {
  background: white;
  border-radius: 16px;
  padding: 25px 0;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}

/* Section Header 样式 */
.section-header {
  text-align: center;
  margin-bottom: 20px;
  position: relative;
}

.section-header.compact {
  margin-bottom: 15px;
}

.section-header::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 3px;
  background: linear-gradient(135deg, #1976d2, #26a69a);
  border-radius: 2px;
}

.section-header h2 {
  font-size: 24px;
  color: #0d47a1;
  margin-bottom: 8px;
  font-weight: 600;
}

.section-header p {
  font-size: 14px;
  color: #546e7a;
  font-weight: 400;
}

.section-footer {
  text-align: center;
  margin-top: 20px;
}

.section-footer.compact {
  margin-top: 15px;
}

/* 精选推荐区域 */
.featured-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.featured-block {
  background: #fafbfc;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
}

.block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e2e8f0;
}

.block-header h3 {
  font-size: 18px;
  color: #0d47a1;
  font-weight: 600;
  margin: 0;
}

/* 概览区域 - 紧凑布局 */
.overview-content {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 25px;
  align-items: center;
  padding: 20px;
}

.overview-item {
  margin-bottom: 15px;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 3px solid #1976d2;
  transition: all 0.3s ease;
}

.overview-item:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.overview-item:last-child {
  margin-bottom: 0;
}

.overview-item h3 {
  font-size: 16px;
  color: #0d47a1;
  margin-bottom: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.overview-item h3::before {
  content: '';
  width: 6px;
  height: 6px;
  background: #1976d2;
  border-radius: 50%;
  margin-right: 8px;
}

.overview-item p {
  font-size: 13px;
  line-height: 1.5;
  color: #475569;
  font-weight: 400;
}

.overview-image {
  position: relative;
}

.overview-image img {
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

/* 景点网格 - 紧凑布局 */
.attractions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.attractions-grid.compact {
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.attraction-card {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid #e2e8f0;
}

.attraction-card.compact {
  border-radius: 8px;
}

.attraction-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(25, 118, 210, 0.15);
  border-color: #1976d2;
}

.attraction-image {
  position: relative;
  height: 120px;
  overflow: hidden;
}

.attraction-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.attraction-card:hover .attraction-image img {
  transform: scale(1.05);
}

.attraction-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
}

.attraction-card:hover .attraction-overlay {
  opacity: 1;
}

.attraction-info {
  padding: 12px;
  background: white;
}

.attraction-info h3,
.attraction-info h4 {
  font-size: 14px;
  margin-bottom: 6px;
  color: #0d47a1;
  font-weight: 600;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.attraction-info p {
  color: #64748b;
  margin-bottom: 8px;
  line-height: 1.4;
  font-size: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 商品网格 - 紧凑设计 */
.products-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.products-grid.compact {
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.product-card {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid #e2e8f0;
}

.product-card.compact {
  border-radius: 8px;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(38, 166, 154, 0.15);
  border-color: #26a69a;
}

.product-image {
  position: relative;
  height: 120px;
  overflow: hidden;
  background: #f8fafc;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.product-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #ef4444;
  color: white;
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
}

.product-info {
  padding: 12px;
  background: white;
}

.product-info h3,
.product-info h4 {
  font-size: 14px;
  margin-bottom: 4px;
  color: #0d47a1;
  font-weight: 600;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-origin {
  font-size: 11px;
  color: #26a69a;
  margin-bottom: 6px;
  font-weight: 500;
}

.product-price {
  margin-bottom: 8px;
}

.current-price {
  font-size: 16px;
  font-weight: 600;
  color: #26a69a;
}

.original-price {
  font-size: 11px;
  color: #94a3b8;
  text-decoration: line-through;
  margin-left: 4px;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sales {
  font-size: 10px;
  color: #64748b;
  background: rgba(38, 166, 154, 0.1);
  padding: 2px 6px;
  border-radius: 8px;
  font-weight: 500;
}

/* 资讯列表 - 紧凑设计 */
.news-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 12px;
}

.news-list.compact {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 10px;
}

.news-item {
  display: flex;
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid #e2e8f0;
}

.news-item.compact {
  border-radius: 8px;
}

.news-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(13, 71, 161, 0.15);
  border-color: #0d47a1;
}

.news-image {
  width: 120px;
  height: 90px;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

.news-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.news-item:hover .news-image img {
  transform: scale(1.05);
}

.news-content {
  padding: 12px;
  flex: 1;
  background: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.news-content h3,
.news-content h4 {
  font-size: 14px;
  margin-bottom: 6px;
  color: #0d47a1;
  font-weight: 600;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.3;
}

.news-content p {
  color: #64748b;
  margin-bottom: 8px;
  line-height: 1.4;
  font-size: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.news-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10px;
  color: #94a3b8;
  margin-top: auto;
}

.news-date {
  background: rgba(25, 118, 210, 0.1);
  padding: 2px 6px;
  border-radius: 8px;
  font-weight: 500;
}

.news-category {
  background: rgba(38, 166, 154, 0.1);
  color: #26a69a;
  padding: 2px 6px;
  border-radius: 8px;
  font-weight: 500;
}

/* 轮播图指示器和按钮样式 */
:deep(.el-carousel__indicators) {
  bottom: 15px;
}

:deep(.el-carousel__indicator) {
  background: rgba(255, 255, 255, 0.4);
  border-radius: 6px;
  width: 30px;
  height: 4px;
}

:deep(.el-carousel__indicator.is-active) {
  background: rgba(255, 255, 255, 0.9);
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, #1976d2, #26a69a);
  border: none;
  border-radius: 20px;
  padding: 10px 20px;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.3);
  transition: all 0.3s ease;
}

:deep(.el-button--primary:hover) {
  background: linear-gradient(135deg, #0d47a1, #00695c);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.4);
}

:deep(.el-button--text) {
  color: #1976d2;
  font-weight: 500;
  font-size: 14px;
  padding: 4px 8px;
}

:deep(.el-button--text:hover) {
  color: #0d47a1;
  background: rgba(25, 118, 210, 0.1);
}

/* 评分组件样式 */
:deep(.el-rate) {
  --el-rate-fill-color: #ffa726;
  --el-rate-void-color: #e0e7ff;
}

:deep(.el-rate--small) {
  --el-rate-icon-size: 12px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .featured-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .container {
    max-width: 100%;
    padding: 0 16px;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 0 16px;
  }
  
  .carousel-item {
    height: 300px;
  }
  
  .carousel-title {
    font-size: 24px;
  }
  
  .carousel-subtitle {
    font-size: 14px;
  }
  
  section {
    padding: 15px 0;
    margin-bottom: 12px;
  }
  
  .section-header h2 {
    font-size: 20px;
  }
  
  .section-header p {
    font-size: 13px;
  }
  
  .overview-content {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 15px;
  }
  
  .featured-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .featured-block {
    padding: 15px;
  }
  
  .attractions-grid,
  .attractions-grid.compact {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .products-grid,
  .products-grid.compact {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .news-list,
  .news-list.compact {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .news-item {
    flex-direction: column;
  }
  
  .news-image {
    width: 100%;
    height: 120px;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 12px;
  }
  
  .main-content {
    padding: 0 12px;
  }
  
  .carousel-item {
    height: 250px;
  }
  
  .carousel-title {
    font-size: 20px;
  }
  
  .overview-content {
    padding: 12px;
  }
  
  .featured-block {
    padding: 12px;
  }
}
</style>
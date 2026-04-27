<template>
  <div class="attractions-page">
    <!-- 页面头部 -->
    <div class="page-header" :style="{ backgroundImage: `url(${headerBg})` }">
      <div class="header-overlay"></div>
      <div class="container">
        <h1>景点导览</h1>
        <p>探索美丽乡村风光，感受自然与文化的魅力</p>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-section">
      <div class="container">
        <div class="search-form">
          <el-input
            v-model="searchParams.keyword"
            placeholder="搜索景点名称..."
            size="large"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-select
            v-model="searchParams.categoryId"
            placeholder="选择分类"
            size="large"
            clearable
            style="width: 200px"
          >
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
          <el-button type="primary" size="large" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
        </div>
      </div>
    </div>

    <!-- 分类标签 -->
    <div class="category-tabs">
      <div class="container">
        <div class="tabs-wrapper">
          <div
            class="category-tab"
            :class="{ active: searchParams.categoryId === null }"
            @click="selectCategory(null)"
          >
            全部
          </div>
          <div
            v-for="category in categories"
            :key="category.id"
            class="category-tab"
            :class="{ active: searchParams.categoryId === category.id }"
            @click="selectCategory(category.id)"
          >
            {{ category.name }}
          </div>
        </div>
      </div>
    </div>

    <!-- 景点列表 -->
    <div class="attractions-content">
      <div class="container">
        <div class="attractions-grid" v-loading="loading">
          <div
            v-for="attraction in attractions"
            :key="attraction.id"
            class="attraction-card"
            @click="goToDetail(attraction.id)"
          >
            <div class="attraction-image">
              <img :src="attraction.coverImage || '/images/default-attraction.jpg'" :alt="attraction.name" />
              <div class="attraction-overlay">
                <el-button type="primary" size="small">查看详情</el-button>
              </div>
              <div class="attraction-category">{{ attraction.categoryName }}</div>
            </div>
            <div class="attraction-info">
              <h3>{{ attraction.name }}</h3>
              <p class="attraction-desc">{{ attraction.description }}</p>
              <div class="attraction-meta">
                <div class="rating">
                  <el-rate v-model="attraction.rating" disabled show-score text-color="#ff9900" size="small" />
                </div>
                <div class="location">
                  <el-icon><MapLocation /></el-icon>
                  <span>{{ attraction.address }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="!loading && attractions.length === 0" class="empty-state">
          <el-empty description="暂无景点数据">
            <el-button type="primary" @click="resetSearch">重置搜索</el-button>
          </el-empty>
        </div>

        <!-- 分页 -->
        <div class="pagination-wrapper" v-if="total > 0">
          <el-pagination
            :current-page="searchParams.pageNum"
            :page-size="searchParams.pageSize"
            :page-sizes="[12, 24, 36, 48]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Search, MapLocation } from '@element-plus/icons-vue'
import attractionApi from '@/api/attraction'
import headerBg from '@/assets/image/景点导览背景.png'

const router = useRouter()
const route = useRoute()

// 数据状态
const loading = ref(false)
const attractions = ref([])
const categories = ref([])
const total = ref(0)

// 搜索参数
const searchParams = reactive({
  pageNum: 1,
  pageSize: 12,
  keyword: '',
  categoryId: null
})

// 获取分类列表
const getCategories = async () => {
  try {
    const res = await attractionApi.getAttractionCategories()
    if (res.code === 200) {
      categories.value = res.data
    }
  } catch (error) {
    console.error('获取分类失败:', error)
  }
}

// 获取景点列表
const getAttractions = async () => {
  loading.value = true
  try {
    const res = await attractionApi.getAttractionPage(searchParams)
    if (res.code === 200) {
      attractions.value = res.data.records
      total.value = res.data.total
    }
  } catch (error) {
    console.error('获取景点列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  searchParams.pageNum = 1
  getAttractions()
}

// 分类选择
const selectCategory = (categoryId) => {
  searchParams.categoryId = categoryId
  searchParams.pageNum = 1
  getAttractions()
}

// 重置搜索
const resetSearch = () => {
  searchParams.keyword = ''
  searchParams.categoryId = null
  searchParams.pageNum = 1
  getAttractions()
}

// 分页处理
const handleSizeChange = (size) => {
  searchParams.pageSize = size
  searchParams.pageNum = 1
  getAttractions()
}

const handleCurrentChange = (page) => {
  searchParams.pageNum = page
  getAttractions()
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 跳转到详情页
const goToDetail = (id) => {
  router.push(`/attractions/${id}`)
}

// 监听路由参数变化
watch(() => route.query, (newQuery) => {
  if (newQuery.category) {
    searchParams.categoryId = parseInt(newQuery.category)
  }
  if (newQuery.keyword) {
    searchParams.keyword = newQuery.keyword
  }
}, { immediate: true })

// 初始化
onMounted(() => {
  getCategories()
  getAttractions()
})
</script>

<style scoped>
.attractions-page {
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

.search-form .el-input {
  width: 400px;
  max-width: 100%;
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
  padding: 8px 20px;
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

/* 景点内容区域 */
.attractions-content {
  padding: 40px 0 80px;
}

.attractions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
}

.attraction-card {
  background: var(--color-bg-surface);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  transition: all 0.3s ease;
  cursor: pointer;
}

.attraction-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-card-hover);
}

.attraction-image {
  position: relative;
  height: 240px;
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
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.attraction-card:hover .attraction-overlay {
  opacity: 1;
}

.attraction-category {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(16, 185, 129, 0.9);
  color: var(--color-text-inverse);
  padding: 4px 12px;
  border-radius: var(--radius-lg);
  font-size: 12px;
  font-weight: 600;
}

.attraction-info {
  padding: 24px;
}

.attraction-info h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.attraction-desc {
  color: var(--color-text-tertiary);
  line-height: 1.6;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.attraction-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.location {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--color-text-tertiary);
  font-size: 14px;
}

.attraction-features {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.feature-tag {
  margin: 0;
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
    gap: 8px;
  }

  .search-form .el-input {
    width: 100%;
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

  .attractions-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .attraction-image {
    height: 130px;
  }

  .attraction-overlay {
    display: none;
  }

  .attraction-info {
    padding: 12px;
  }

  .attraction-info h3 {
    font-size: 14px;
    margin-bottom: 8px;
  }

  .attraction-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .pagination-wrapper :deep(.el-pagination) {
    --el-pagination-button-width: 28px;
    --el-pagination-button-height: 28px;
  }
}

@media (max-width: 480px) {
  .attraction-image {
    height: 110px;
  }

  .attraction-info {
    padding: 10px;
  }

  .attraction-info h3 {
    font-size: 13px;
  }
}
</style>

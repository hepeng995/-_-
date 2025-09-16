<template>
  <div class="products-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="container">
        <h1>特产商城</h1>
        <p>品味地道农特产品，感受乡村自然馈赠</p>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-section">
      <div class="container">
        <div class="search-form">
          <el-input
            v-model="searchParams.keyword"
            placeholder="搜索商品名称..."
            size="large"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <!-- <el-select
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
          </el-select> -->
          
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
            全部商品
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

    <!-- 商品列表 -->
    <div class="products-content">
      <div class="container">
        <div class="products-grid" v-loading="loading">
          <div 
            v-for="product in products"
            :key="product.id"
            class="product-card"
            @click="goToDetail(product.id)"
          >
            <div class="product-image">
              <img :src="product.coverImage || '/images/default-product.jpg'" :alt="product.name" />
              <div class="product-overlay">
                <el-button type="primary" size="small">查看详情</el-button>
              </div>
              <div class="product-badges">
                <div v-if="product.isFeatured" class="badge featured">推荐</div>
                <div v-if="product.isNew" class="badge new">新品</div>
                <div v-if="product.isHot" class="badge hot">热销</div>
              </div>
            </div>
            <div class="product-info">
              <div class="product-category">{{ product.categoryName }}</div>
              <h3 class="product-name">{{ product.name }}</h3>
              <p class="product-desc">{{ product.description }}</p>
              <div class="product-origin" v-if="product.origin">
                <el-icon><MapLocation /></el-icon>
                <span>产地：{{ product.origin }}</span>
              </div>
              <div class="product-price">
                <span class="current-price">￥{{ product.price }}</span>
                <span v-if="product.originalPrice" class="original-price">￥{{ product.originalPrice }}</span>
              </div>
              <div class="product-meta">
                <div class="rating">
                  <el-rate v-model="product.rating" disabled size="small" />
                  <span class="rating-count">({{ product.reviewCount || 0 }})</span>
                </div>
                <div class="sales">已售{{ product.salesCount || 0 }}</div>
              </div>
              <div class="product-quantity" v-if="product.stock > 0">
                <span class="quantity-label">数量:</span>
                <el-input-number 
                  v-model="product.buyQuantity" 
                  :min="1" 
                  :max="product.stock" 
                  size="small"
                  @change="() => updateQuantity(product)"
                  @click.stop
                />
              </div>
              <div class="product-actions">
                <el-button 
                  type="primary" 
                  size="small" 
                  :disabled="product.stock <= 0"
                  @click.stop="addToCart(product)"
                >
                  <el-icon><ShoppingCart /></el-icon>
                  {{ product.stock > 0 ? '加入购物车' : '缺货' }}
                </el-button>
                <el-button size="small" @click.stop="buyNow(product)">
                  立即购买
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="!loading && products.length === 0" class="empty-state">
          <el-empty description="暂无商品数据">
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

    <!-- 购物车悬浮按钮 -->
    <div class="cart-float" @click="goToCart" v-if="cartCount > 0">
      <el-badge :value="cartCount" :max="99">
        <el-button type="primary" circle size="large">
          <el-icon size="20"><ShoppingCart /></el-icon>
        </el-button>
      </el-badge>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, MapLocation, ShoppingCart } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import productApi from '@/api/product'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const cartStore = useCartStore()

// 数据状态
const loading = ref(false)
const products = ref([])
const categories = ref([])
const total = ref(0)
const cartCount = computed(() => cartStore.cartCount)

// 搜索参数
const searchParams = reactive({
  pageNum: 1,
  pageSize: 12,
  keyword: '',
  categoryId: null,
  sortBy: 'default'
})

// 用户信息
const userInfo = computed(() => userStore.userInfo)

// 获取分类列表
const getCategories = async () => {
  try {
    const res = await productApi.getProductCategories()
    if (res.code === 200) {
      categories.value = res.data
    }
  } catch (error) {
    console.error('获取分类失败:', error)
  }
}

// 获取商品列表
const getProducts = async () => {
  loading.value = true
  try {
    const res = await productApi.getProductPage(searchParams)
    if (res.code === 200) {
      // 为每个商品添加购买数量属性
      products.value = res.data.records.map(product => ({
        ...product,
        buyQuantity: 1 // 默认购买数量为1
      }))
      total.value = res.data.total
    }
  } catch (error) {
    console.error('获取商品列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 更新商品购买数量
const updateQuantity = (product) => {
  // 确保数量在有效范围内
  if (product.buyQuantity < 1) {
    product.buyQuantity = 1
  } else if (product.buyQuantity > product.stock) {
    product.buyQuantity = product.stock
  }
}

// 获取购物车数量
const getCartCount = async () => {
  if (!userInfo.value) return
  await cartStore.getCartCount()
}

// 搜索处理
const handleSearch = () => {
  searchParams.pageNum = 1
  getProducts()
}

// 分类选择
const selectCategory = (categoryId) => {
  searchParams.categoryId = categoryId
  searchParams.pageNum = 1
  getProducts()
}

// 重置搜索
const resetSearch = () => {
  searchParams.keyword = ''
  searchParams.categoryId = null
  searchParams.sortBy = 'default'
  searchParams.pageNum = 1
  getProducts()
}

// 分页处理
const handleSizeChange = (size) => {
  searchParams.pageSize = size
  searchParams.pageNum = 1
  getProducts()
}

const handleCurrentChange = (page) => {
  searchParams.pageNum = page
  getProducts()
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 加入购物车
const addToCart = async (product) => {
  if (!userInfo.value) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  if (product.stock <= 0) {
    ElMessage.warning('商品缺货')
    return
  }

  // 使用选择的数量
  const quantity = product.buyQuantity || 1

  try {
    const res = await productApi.addToCart(product.id, quantity)
    if (res.code === 200) {
      ElMessage.success(`已将 ${quantity} 件商品加入购物车`)
      // 更新购物车数量
      cartStore.updateCartCount(quantity)
    } else {
      ElMessage.error(res.message || '加入购物车失败')
    }
  } catch (error) {
    console.error('加入购物车失败:', error)
    ElMessage.error('加入购物车失败')
  }
}

// 立即购买
const buyNow = (product) => {
  if (!userInfo.value) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  if (product.stock <= 0) {
    ElMessage.warning('商品缺货')
    return
  }

  // 使用选择的数量
  const quantity = product.buyQuantity || 1

  // 跳转到订单确认页面
  router.push({
    path: '/order/confirm',
    query: {
      productId: product.id,
      quantity: quantity,
      type: 'buy_now'
    }
  })
}

// 跳转到详情页
const goToDetail = (id) => {
  router.push(`/products/${id}`)
}

// 跳转到购物车
const goToCart = () => {
  if (!userInfo.value) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  router.push('/cart')
}

// 初始化
onMounted(() => {
  // 从路由参数获取初始搜索条件
  if (route.query.category) {
    searchParams.categoryId = parseInt(route.query.category)
  }
  if (route.query.keyword) {
    searchParams.keyword = route.query.keyword
  }
  
  getCategories()
  getProducts()
  getCartCount()
})
</script>

<style scoped>
.products-page {
  min-height: 100vh;
  background: #f8fafc;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 页面头部 */
.page-header {
  background: linear-gradient(135deg, #c7fee4 0%, #dbf9eb 50%, #c0ffd3 100%);
  color: #e48e58;
  padding: 50px 0;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.page-header::before {
  content: '';
  position: absolute;
  top: -30%;
  left: -10%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(251, 191, 36, 0.15) 0%, transparent 70%);
  border-radius: 50%;
}

.page-header h1 {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 16px;
  background: linear-gradient(45deg, #ffb07e, #d97706);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  z-index: 1;
}

.page-header p {
  font-size: 18px;
  color: #d79f51;
  position: relative;
  z-index: 1;
}

/* 搜索区域 */
.search-section {
  background: white;
  padding: 30px 0;
  border-bottom: 1px solid #e2e8f0;
}

.search-form {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: right;
  flex-wrap: wrap;
}

.search-form .el-input {
  width: 400px;
  max-width: 100%;
}

/* 分类标签 */
.category-tabs {
  background: white;
  padding: 20px 0;
  border-bottom: 1px solid #e2e8f0;
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
  background: #f1f5f9;
  color: #64748b;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.category-tab:hover {
  background: #e2e8f0;
  color: #475569;
}

.category-tab.active {
  background: #10b981;
  color: white;
}

/* 商品内容区域 */
.products-content {
  padding: 40px 0 80px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.product-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
}

.product-image {
  position: relative;
  height: 220px;
  overflow: hidden;
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

.product-overlay {
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

.product-card:hover .product-overlay {
  opacity: 1;
}

.product-badges {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.badge {
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  color: white;
}

.badge.featured {
  background: #f59e0b;
}

.badge.new {
  background: #10b981;
}

.badge.hot {
  background: #ef4444;
}

.product-info {
  padding: 20px;
}

.product-category {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.product-name {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-desc {
  font-size: 13px;
  color: #64748b;
  line-height: 1.4;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-origin {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #64748b;
  margin-bottom: 12px;
}

.product-price {
  margin-bottom: 12px;
}

.current-price {
  font-size: 18px;
  font-weight: 700;
  color: #e74c3c;
}

.original-price {
  font-size: 14px;
  color: #94a3b8;
  text-decoration: line-through;
  margin-left: 8px;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.product-quantity {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.quantity-label {
  font-size: 14px;
  color: #64748b;
}

.rating {
  display: flex;
  align-items: center;
  gap: 4px;
}

.rating-count {
  font-size: 12px;
  color: #64748b;
}

.sales {
  font-size: 12px;
  color: #64748b;
}

.product-actions {
  display: flex;
  gap: 8px;
}

.product-actions .el-button {
  flex: 1;
}

/* 购物车悬浮按钮 */
.cart-float {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 1000;
  cursor: pointer;
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
  .page-header h1 {
    font-size: 32px;
  }
  
  .search-form {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-form .el-input {
    width: 100%;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }
  
  .product-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .cart-float {
    bottom: 20px;
    right: 20px;
  }
}

@media (max-width: 480px) {
  .products-grid {
    grid-template-columns: 1fr;
  }
  
  .product-info {
    padding: 16px;
  }
  
  .tabs-wrapper {
    gap: 12px;
  }
  
  .category-tab {
    padding: 6px 16px;
    font-size: 14px;
  }
}
</style>

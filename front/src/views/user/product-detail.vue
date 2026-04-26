<template>
  <div class="product-detail" v-loading="loading">
    <div v-if="product" class="detail-content">
      <!-- 面包屑导航 -->
      <div class="breadcrumb-section">
        <div class="container">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item :to="{ path: '/products' }">特产商城</el-breadcrumb-item>
            <el-breadcrumb-item>{{ product.name }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
      </div>

      <!-- 商品主要信息 -->
      <div class="product-hero">
        <div class="container">
          <div class="hero-content">
            <!-- 商品图片 -->
            <div class="product-images">
              <div class="main-image">
                <img :src="currentImage" :alt="product.name" @click="previewImage" />
                <div class="image-badges">
                  <div v-if="product.isFeatured" class="badge featured">推荐</div>
                  <div v-if="product.isNew" class="badge new">新品</div>
                  <div v-if="product.isHot" class="badge hot">热销</div>
                </div>
              </div>
              <div class="image-thumbs" v-if="product.images && product.images.length > 1">
                <div
                  v-for="(image, index) in product.images"
                  :key="index"
                  class="thumb-item"
                  :class="{ active: currentImage === image }"
                  @click="currentImage = image"
                >
                  <img :src="image" :alt="`${product.name}图片${index + 1}`" />
                </div>
              </div>
            </div>

            <!-- 商品信息 -->
            <div class="product-info">
              <div class="product-category">
                <el-tag type="success" size="large">{{ product.categoryName }}</el-tag>
              </div>
              <h1 class="product-title">{{ product.name }}</h1>
              <div class="product-subtitle">{{ product.subtitle }}</div>

              <div class="product-rating">
                <el-rate v-model="product.rating" disabled show-score text-color="#ff9900" />
                <span class="rating-text">({{ product.rating }}分 · {{ product.reviewCount || 0 }}条评价)</span>
              </div>

              <div class="product-origin" v-if="product.origin">
                <el-icon class="origin-icon"><MapLocation /></el-icon>
                <span>产地：{{ product.origin }}</span>
              </div>

              <div class="product-price">
                <div class="price-row">
                  <span class="current-price">￥{{ product.price }}</span>
                  <span v-if="product.originalPrice" class="original-price">￥{{ product.originalPrice }}</span>
                </div>
                <div class="price-tips" v-if="product.originalPrice">
                  <span class="discount">省￥{{ (product.originalPrice - product.price).toFixed(2) }}</span>
                </div>
              </div>

              <!-- 商品规格 -->
              <div class="product-specs" v-if="product.specifications">
                <h3>商品规格</h3>
                <div class="specs-list">
                  <div
                    v-for="spec in getSpecificationsList(product.specifications)"
                    :key="spec"
                    class="spec-item"
                    :class="{ active: selectedSpec === spec }"
                    @click="selectedSpec = spec"
                  >
                    {{ spec }}
                  </div>
                </div>
              </div>

              <!-- 购买数量 -->
              <div class="quantity-section">
                <h3>购买数量</h3>
                <div class="quantity-controls">
                  <el-input-number
                    v-model="quantity"
                    :min="1"
                    :max="product.stock"
                    size="large"
                  />
                  <span class="stock-info">库存{{ product.stock }}件</span>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="action-buttons">
                <el-button
                  type="warning"
                  size="large"
                  :disabled="product.stock <= 0"
                  @click="addToCart"
                >
                  <el-icon><ShoppingCart /></el-icon>
                  {{ product.stock > 0 ? '加入购物车' : '缺货' }}
                </el-button>
                <el-button
                  type="primary"
                  size="large"
                  :disabled="product.stock <= 0"
                  @click="buyNow"
                >
                  立即购买
                </el-button>
                <el-button size="large" @click="shareProduct">
                  <el-icon><Share /></el-icon>
                  分享
                </el-button>
              </div>

              <!-- 服务保障 -->
              <div class="service-guarantee">
                <div class="guarantee-item">
                  <el-icon><CircleCheckFilled /></el-icon>
                  <span>品质保障</span>
                </div>
                <div class="guarantee-item">
                  <el-icon><MessageBox /></el-icon>
                  <span>包邮配送</span>
                </div>
                <div class="guarantee-item">
                  <el-icon><RefreshRight /></el-icon>
                  <span>7天退换</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 详细信息 -->
      <div class="product-details">
        <div class="container">
          <el-tabs v-model="activeTab" class="detail-tabs">
            <el-tab-pane label="商品详情" name="detail">
              <div class="detail-content">
                <div v-if="product.content" v-html="product.content"></div>
                <div v-else class="default-content">
                  <h3>商品介绍</h3>
                  <p>{{ product.description }}</p>
                  <div v-if="product.features">
                    <h3>产品特色</h3>
                    <ul>
                      <li v-for="feature in product.features.split(',')" :key="feature">
                        {{ feature.trim() }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="规格参数" name="specs">
              <div class="specs-table">
                <table>
                  <tr>
                    <td>商品名称</td>
                    <td>{{ product.name }}</td>
                  </tr>
                  <tr>
                    <td>商品分类</td>
                    <td>{{ product.categoryName }}</td>
                  </tr>
                  <tr v-if="product.origin">
                    <td>产地</td>
                    <td>{{ product.origin }}</td>
                  </tr>
                  <tr v-if="product.specifications">
                    <td>规格</td>
                    <td>{{ formatSpecifications(product.specifications) }}</td>
                  </tr>
                  <tr>
                    <td>保质期</td>
                    <td>{{ product.shelfLife || '见包装' }}</td>
                  </tr>
                </table>
              </div>
            </el-tab-pane>
            <el-tab-pane label="用户评价" name="reviews">
              <div class="reviews-section">
                <!-- 评价统计 -->
                <div class="reviews-summary" v-if="reviewStats">
                  <div class="rating-overview">
                    <div class="rating-score">{{ Number(reviewStats.avg_rating || 0).toFixed(1) }}</div>
                    <div class="rating-stars">
                      <el-rate :model-value="Number(reviewStats.avg_rating) || 0" disabled />
                      <div class="rating-count">{{ Number(reviewStats.total_count || 0) }}条评价</div>
                    </div>
                  </div>

                  <!-- 评分分布 -->
                  <div class="rating-distribution" v-if="reviewStats && reviewStats.total_count > 0">
                    <div v-for="rating in [5, 4, 3, 2, 1]" :key="rating" class="rating-bar">
                      <span class="rating-label">{{ rating }}星</span>
                      <div class="progress-bar">
                        <div class="progress-fill" :style="{ width: getRatingPercentage(rating) + '%' }"></div>
                      </div>
                      <span class="rating-percent">{{ getRatingPercentage(rating).toFixed(2) }}%</span>
                    </div>
                  </div>
                </div>

                <!-- 评价筛选和排序 -->
                <div class="reviews-filters">
                  <div class="filter-buttons">
                    <el-button
                      :type="reviewFilter.rating === null ? 'primary' : 'default'"
                      @click="setRatingFilter(null)"
                      size="small"
                    >
                      全部({{ reviewStats?.total_count || 0 }})
                    </el-button>
                    <el-button
                      v-for="rating in [5, 4, 3, 2, 1]"
                      :key="rating"
                      :type="reviewFilter.rating === rating ? 'primary' : 'default'"
                      @click="setRatingFilter(rating)"
                      size="small"
                    >
                      {{ rating }}星({{ getRatingCount(rating) }})
                    </el-button>
                    <el-button
                      :type="reviewFilter.hasImages ? 'primary' : 'default'"
                      @click="toggleImageFilter"
                      size="small"
                    >
                      有图({{ reviewStats?.has_images_count || 0 }})
                    </el-button>
                  </div>

                  <div class="sort-options">
                    <el-select v-model="reviewFilter.sortBy" @change="loadReviews" size="small" style="width: 120px">
                      <el-option label="按时间" value="time" />
                      <el-option label="按评分" value="rating" />
                      <el-option label="按有用" value="helpful" />
                    </el-select>
                  </div>
                </div>

                <!-- 写评价按钮 -->
                <div class="write-review-section">
                  <el-button
                    v-if="userInfo"
                    type="primary"
                    @click="showReviewDialog = true"
                    size="large"
                  >
                    <el-icon><EditPen /></el-icon>
                    写评价
                  </el-button>
                  <el-button
                    v-else
                    type="primary"
                    @click="$router.push('/login')"
                    size="large"
                  >
                    <el-icon><EditPen /></el-icon>
                    登录后评价
                  </el-button>
                </div>

                <!-- 评价列表 -->
                <div class="reviews-list" v-loading="reviewsLoading">
                  <div v-if="reviews.length === 0" class="no-reviews">
                    <el-empty description="暂无评价" />
                  </div>
                  <div v-else>
                    <div v-for="review in reviews" :key="review.id" class="review-item">
                      <div class="review-header">
                        <div class="reviewer-info">
                          <el-avatar :src="review.userAvatar" size="small">
                            <el-icon><User /></el-icon>
                          </el-avatar>
                          <span class="reviewer-name">{{ review.isAnonymous ? '匿名用户' : review.username }}</span>
                        </div>
                        <div class="review-date">{{ formatDate(review.createdAt) }}</div>
                      </div>

                      <div class="review-rating">
                        <el-rate :model-value="review.rating" disabled size="small" />
                      </div>

                      <div class="review-content">{{ review.content }}</div>

                      <!-- 评价图片 -->
                      <div class="review-images" v-if="review.images">
                        <div class="image-grid">
                          <img
                            v-for="(image, index) in parseImages(review.images)"
                            :key="index"
                            :src="image"
                            @click="previewReviewImages(parseImages(review.images), index)"
                            class="review-image"
                          />
                        </div>
                      </div>

                      <!-- 商家回复 -->
                      <div class="merchant-reply" v-if="review.replyContent">
                        <div class="reply-header">商家回复：</div>
                        <div class="reply-content">{{ review.replyContent }}</div>
                        <div class="reply-time">{{ formatDate(review.replyTime) }}</div>
                      </div>

                      <!-- 评价操作 -->
                      <div class="review-actions">
                        <el-button
                          text
                          :type="review.isHelpful ? 'primary' : 'default'"
                          @click="toggleHelpful(review)"
                          size="small"
                        >
                          <el-icon><StarFilled /></el-icon>
                          有用({{ review.helpfulCount || 0 }})
                        </el-button>
                      </div>
                    </div>
                  </div>

                  <!-- 分页 -->
                  <div class="reviews-pagination" v-if="reviewPagination.total > 0">
                    <el-pagination
                      :current-page="reviewPagination.current"
                      :page-size="reviewPagination.size"
                      :total="reviewPagination.total"
                      :page-sizes="[10, 20, 50]"
                      layout="total, sizes, prev, pager, next, jumper"
                      @size-change="handlePageSizeChange"
                      @current-change="handlePageChange"
                    />
                  </div>
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="溯源信息" name="trace" v-if="hasTraceData">
              <ProductTrace :product-id="Number(route.params.id)" />
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>

      <!-- 推荐商品 -->
      <div class="related-products" v-if="relatedProducts.length > 0">
        <div class="container">
          <h2>相关推荐</h2>
          <div class="related-grid">
            <div
              v-for="item in relatedProducts"
              :key="item.id"
              class="related-card"
              @click="goToProduct(item.id)"
            >
              <div class="related-image">
                <img :src="item.coverImage || '/images/default-product.jpg'" :alt="item.name" />
              </div>
              <div class="related-info">
                <h4>{{ item.name }}</h4>
                <div class="related-price">￥{{ item.price }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载失败状态 -->
    <div v-else-if="!loading" class="error-state">
      <el-result icon="warning" title="商品信息加载失败" sub-title="请检查网络连接或稍后重试">
        <template #extra>
          <el-button type="primary" @click="loadProduct">重新加载</el-button>
          <el-button @click="$router.go(-1)">返回上页</el-button>
        </template>
      </el-result>
    </div>

    <!-- 写评价对话框 -->
    <el-dialog v-model="showReviewDialog" title="写评价" width="600px" :close-on-click-modal="false">
      <el-form ref="reviewFormRef" :model="reviewForm" :rules="reviewRules" label-width="80px">
        <el-form-item label="评分" prop="rating" required>
          <el-rate v-model="reviewForm.rating" :texts="['极差', '失望', '一般', '满意', '惊喜']" show-text />
        </el-form-item>

        <el-form-item label="评价内容" prop="content">
          <el-input
            v-model="reviewForm.content"
            type="textarea"
            :rows="4"
            placeholder="分享你的使用感受，帮助其他用户更好地了解该商品..."
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="上传图片">
          <el-upload
            ref="uploadRef"
            :file-list="reviewForm.imageList"
            list-type="picture-card"
            :on-change="handleImageChange"
            :on-remove="handleImageRemove"
            :before-upload="beforeImageUpload"
            :auto-upload="false"
            accept="image/*"
            :limit="6"
          >
            <el-icon><Plus /></el-icon>
            <template #tip>
              <div class="el-upload__tip">最多上传6张图片，单张不超过2MB</div>
            </template>
          </el-upload>
        </el-form-item>

        <el-form-item label="匿名评价">
          <el-checkbox v-model="reviewForm.isAnonymous">匿名发表评价</el-checkbox>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showReviewDialog = false">取消</el-button>
          <el-button type="primary" @click="submitReview" :loading="submittingReview">提交评价</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElImageViewer } from 'element-plus'
import {
  MapLocation,
  ShoppingCart,
  Share,
  CircleCheckFilled,
  MessageBox,
  RefreshRight,
  User,
  EditPen,
  StarFilled,
  Plus
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import productApi from '@/api/product'
import reviewApi from '@/api/review'
import fileApi from '@/api/file'
import traceApi from '@/api/trace'
import ProductTrace from './product-trace.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()

const loading = ref(false)
const product = ref(null)
const relatedProducts = ref([])
const reviews = ref([])
const activeTab = ref('detail')
const currentImage = ref('')
const selectedSpec = ref('')
const quantity = ref(1)
const hasTraceData = ref(false)

// 评价相关数据
const reviewStats = ref(null)
const ratingDistribution = ref([])
const reviewsLoading = ref(false)
const reviewPagination = ref({
  current: 1,
  size: 10,
  total: 0
})
const reviewFilter = ref({
  rating: null,
  hasImages: false,
  sortBy: 'time',
  sortOrder: 'desc'
})

// 写评价相关
const showReviewDialog = ref(false)
const submittingReview = ref(false)
const canWriteReview = ref(false)
const reviewFormRef = ref(null)
const uploadRef = ref(null)
const reviewForm = ref({
  rating: 5,
  content: '',
  images: '',
  imageList: [],
  isAnonymous: false
})

const reviewRules = {
  rating: [
    { required: true, message: '请选择评分', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请填写评价内容', trigger: 'blur' },
    { min: 5, message: '评价内容至少5个字符', trigger: 'blur' }
  ]
}

// 用户信息
const userInfo = computed(() => userStore.userInfo)

// 获取商品详情
const loadProduct = async () => {
  const id = route.params.id
  if (!id) {
    ElMessage.error('商品ID不存在')
    router.push('/products')
    return
  }

  loading.value = true
  try {
    const res = await productApi.getProductById(id)
    if (res.code === 200) {
      product.value = res.data

      // 处理图片数据：将JSON字符串转换为数组
      if (product.value.images && typeof product.value.images === 'string') {
        try {
          product.value.images = JSON.parse(product.value.images)
        } catch (e) {
          console.warn('解析商品图片JSON失败:', e)
          product.value.images = []
        }
      }
      if (!Array.isArray(product.value.images)) {
        product.value.images = []
      }

      // 设置当前显示的图片
      currentImage.value = product.value.coverImage || '/images/default-product.jpg'

      // 如果有多张图片，将封面图片添加到图片数组的开头
      if (product.value.coverImage && !product.value.images.includes(product.value.coverImage)) {
        product.value.images.unshift(product.value.coverImage)
      }

      // 设置页面标题
      document.title = `${res.data.name} - 商品详情`
      // 设置默认规格
      if (res.data.specifications) {
        const specsList = getSpecificationsList(res.data.specifications)
        if (specsList.length > 0) {
          selectedSpec.value = specsList[0]
        }
      }
      // 获取相关推荐
      loadRelatedProducts(res.data.categoryId, id)
      // 获取评价
      loadReviews()
      // 检查溯源数据
      checkTraceData(id)
      // 检查评价权限
      checkReviewEligibility()
    } else {
      ElMessage.error(res.message || '获取商品详情失败')
    }
  } catch (error) {
    console.error('获取商品详情失败:', error)
    ElMessage.error('获取商品详情失败')
  } finally {
    loading.value = false
  }
}

// 检查溯源数据
const checkTraceData = async (id) => {
  try {
    const res = await traceApi.hasTraceData(id)
    if (res.code === 200) {
      hasTraceData.value = res.data
    }
  } catch (error) {
    console.error('检查溯源数据失败:', error)
    hasTraceData.value = false
  }
}

// 获取相关推荐
const loadRelatedProducts = async (categoryId, currentId) => {
  try {
    const res = await productApi.getProductsByCategory(categoryId)
    if (res.code === 200) {
      // 过滤掉当前商品，只取前6个
      relatedProducts.value = res.data
        .filter(item => item.id !== parseInt(currentId))
        .slice(0, 6)
    }
  } catch (error) {
    console.error('获取相关推荐失败:', error)
  }
}

// 获取商品评价
const loadReviews = async () => {
  if (!product.value) return

  reviewsLoading.value = true
  try {
    const params = {
      rating: reviewFilter.value.rating,
      hasImages: reviewFilter.value.hasImages || undefined,
      sortBy: reviewFilter.value.sortBy,
      sortOrder: reviewFilter.value.sortOrder,
      current: reviewPagination.value.current,
      size: reviewPagination.value.size
    }

    const res = await productApi.getProductReviews(product.value.id, params)
    if (res.code === 200) {
      const data = res.data
      reviews.value = data.reviews.records || []
      reviewPagination.value.total = data.reviews.total || 0
      reviewStats.value = data.stats
      ratingDistribution.value = data.distribution || []
    }
  } catch (error) {
    console.error('获取商品评价失败:', error)
    ElMessage.error('获取评价信息失败')
  } finally {
    reviewsLoading.value = false
  }
}

// 检查用户是否可以写评价
const checkReviewEligibility = async () => {
  // 简化逻辑：只要用户登录就可以评价
  canWriteReview.value = !!userInfo.value
}

// 预览图片
const previewImage = () => {
  const images = product.value.images || [currentImage.value]
  const viewer = new ElImageViewer({
    urlList: images,
    initialIndex: images.indexOf(currentImage.value),
    onClose: () => {
      viewer.close()
    }
  })
}

// 加入购物车
const addToCart = async () => {
  if (!userInfo.value) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  if (product.value.stock <= 0) {
    ElMessage.warning('商品缺货')
    return
  }

  try {
    const res = await productApi.addToCart(product.value.id, quantity.value)
    if (res.code === 200) {
      ElMessage.success('已加入购物车')
      // 更新购物车数量
      cartStore.updateCartCount(quantity.value)
    } else {
      ElMessage.error(res.message || '加入购物车失败')
    }
  } catch (error) {
    console.error('加入购物车失败:', error)
    ElMessage.error('加入购物车失败')
  }
}

// 立即购买
const buyNow = () => {
  if (!userInfo.value) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  if (product.value.stock <= 0) {
    ElMessage.warning('商品缺货')
    return
  }

  // 跳转到订单确认页面
  router.push({
    path: '/order/confirm',
    query: {
      productId: product.value.id,
      quantity: quantity.value,
      specification: selectedSpec.value,
      type: 'buy_now'
    }
  })
}

// 分享商品
const shareProduct = async () => {
  const shareData = {
    title: product.value.name,
    text: product.value.description,
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

// 跳转到其他商品
const goToProduct = (id) => {
  router.push(`/products/${id}`)
  // 重新加载数据
  nextTick(() => {
    loadProduct()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString()
}

// 格式化规格
const formatSpecifications = (specifications) => {
  if (!specifications) return ''
  try {
    const specsObj = JSON.parse(specifications)
    return Object.entries(specsObj)
      .map(([key, value]) => `${key}：${value}`)
      .join('，')
  } catch (e) {
    return specifications
  }
}

// 获取规格列表
const getSpecificationsList = (specifications) => {
  if (!specifications) return []
  try {
    const specsObj = JSON.parse(specifications)
    // 如果是对象，返回格式化后的字符串数组
    return Object.entries(specsObj).map(([key, value]) => `${key}：${value}`)
  } catch (e) {
    // 如果解析失败，尝试按逗号分割
    return specifications.split(',').map(spec => spec.trim())
  }
}

// 评价筛选和排序方法
const setRatingFilter = (rating) => {
  reviewFilter.value.rating = rating
  reviewPagination.value.current = 1
  loadReviews()
}

const toggleImageFilter = () => {
  reviewFilter.value.hasImages = !reviewFilter.value.hasImages
  reviewPagination.value.current = 1
  loadReviews()
}

const getRatingCount = (rating) => {
  if (!reviewStats.value) return 0

  const countKey = `${rating === 5 ? 'five' : rating === 4 ? 'four' : rating === 3 ? 'three' : rating === 2 ? 'two' : 'one'}_star_count`
  return Number(reviewStats.value[countKey] || 0)
}

// 获取评分百分比
const getRatingPercentage = (rating) => {
  if (!reviewStats.value || !reviewStats.value.total_count) return 0

  const count = getRatingCount(rating)
  const totalCount = Number(reviewStats.value.total_count)

  return totalCount > 0 ? (count / totalCount) * 100 : 0
}

// 解析图片JSON字符串
const parseImages = (imagesStr) => {
  if (!imagesStr) return []
  try {
    return JSON.parse(imagesStr)
  } catch (e) {
    return []
  }
}

// 预览评价图片
const previewReviewImages = (images, index) => {
  const viewer = new ElImageViewer({
    urlList: images,
    initialIndex: index,
    onClose: () => {
      viewer.close()
    }
  })
}

// 点赞/取消点赞评价
const toggleHelpful = async (review) => {
  if (!userInfo.value) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  try {
    const res = await reviewApi.toggleHelpful(review.id)
    if (res.code === 200) {
      review.isHelpful = res.data.isHelpful
      review.helpfulCount += res.data.isHelpful ? 1 : -1
      ElMessage.success(res.data.isHelpful ? '点赞成功' : '取消点赞成功')
    }
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error('操作失败，请稍后重试')
  }
}

// 图片上传相关方法
const handleImageChange = (file, fileList) => {
  reviewForm.value.imageList = fileList
}

const handleImageRemove = (file, fileList) => {
  reviewForm.value.imageList = fileList
}

const beforeImageUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('上传图片大小不能超过 2MB!')
    return false
  }
  return true
}

// 提交评价
const submitReview = async () => {
  if (!reviewFormRef.value) return

  try {
    const valid = await reviewFormRef.value.validate()
    if (!valid) return

    submittingReview.value = true

    // 处理图片上传
    let imageUrls = []
    if (reviewForm.value.imageList.length > 0) {
      try {
        for (const fileItem of reviewForm.value.imageList) {
          if (fileItem.raw) {
            console.log('准备上传文件:', fileItem.raw.name, fileItem.raw.size)
            // 使用文件上传API
            const uploadRes = await fileApi.uploadFile(fileItem.raw)
            console.log('上传响应完整数据:', uploadRes)

            // 处理不同的响应格式
            if (uploadRes.data) {
              if (uploadRes.data.code === 200 && uploadRes.data.data) {
                console.log('成功获取图片URL:', uploadRes.data.data)
                imageUrls.push(uploadRes.data.data)
              } else if (uploadRes.data.code === 200) {
                console.log('成功获取图片URL:', uploadRes.data)
                imageUrls.push(uploadRes.data)
              }
            }
          }
        }
        console.log('最终图片URL列表:', imageUrls)
      } catch (uploadError) {
        console.error('图片上传失败:', uploadError)
        ElMessage.error('图片上传失败，请重试')
        return
      }
    }

    const reviewData = {
      productId: product.value.id,
      rating: reviewForm.value.rating,
      content: reviewForm.value.content,
      images: imageUrls.length > 0 ? JSON.stringify(imageUrls) : null,
      isAnonymous: reviewForm.value.isAnonymous
    }

    const res = await reviewApi.createReview(reviewData)
    if (res.code === 200) {
      ElMessage.success('评价提交成功')
      showReviewDialog.value = false
      resetReviewForm()
      // 重新加载评价列表
      await loadReviews()
      // 重新加载商品信息（更新评价统计）
      await loadProduct()
    } else {
      ElMessage.error(res.message || '提交评价失败')
    }
  } catch (error) {
    console.error('提交评价失败:', error)
    ElMessage.error('提交评价失败，请稍后重试')
  } finally {
    submittingReview.value = false
  }
}

// 重置评价表单
const resetReviewForm = () => {
  reviewForm.value = {
    rating: 5,
    content: '',
    images: '',
    imageList: [],
    isAnonymous: false
  }
  if (reviewFormRef.value) {
    reviewFormRef.value.resetFields()
  }
}

// 分页处理方法
const handlePageChange = (page) => {
  reviewPagination.value.current = page
  loadReviews()
}

const handlePageSizeChange = (size) => {
  reviewPagination.value.size = size
  reviewPagination.value.current = 1
  loadReviews()
}

// 初始化
onMounted(() => {
  loadProduct()
})

// 监听路由参数变化（从 /products/1 跳转到 /products/2 时组件复用，onMounted 不会再次触发）
watch(
  () => route.params.id,
  (newId, oldId) => {
    if (newId && newId !== oldId) {
      // 重置状态
      activeTab.value = 'detail'
      quantity.value = 1
      selectedSpec.value = ''
      currentImage.value = ''
      // 重新加载商品数据
      loadProduct()
      // 滚动到页面顶部
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
)
</script>

<style scoped>
.product-detail {
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

/* 商品主要信息 */
.product-hero {
  background: var(--color-bg-surface);
  padding: 40px 0;
}

.hero-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: start;
}

/* 商品图片 */
.product-images {
  position: sticky;
  top: 100px;
}

.main-image {
  position: relative;
  margin-bottom: 16px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
}

.main-image img {
  width: 100%;
  height: 400px;
  object-fit: cover;
  cursor: pointer;
}

.image-badges {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.badge {
  padding: 6px 12px;
  border-radius: var(--radius-lg);
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-inverse);
}

.badge.featured {
  background: var(--color-warning);
}

.badge.new {
  background: var(--color-primary-500);
}

.badge.hot {
  background: var(--color-danger);
}

.image-thumbs {
  display: flex;
  gap: 12px;
  overflow-x: auto;
}

.thumb-item {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.3s ease;
}

.thumb-item.active {
  border-color: var(--color-primary-500);
}

.thumb-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 商品信息 */
.product-info {
  padding: 20px 0;
}

.product-category {
  margin-bottom: 16px;
}

.product-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 12px;
  line-height: 1.2;
}

.product-subtitle {
  font-size: 16px;
  color: var(--color-text-tertiary);
  margin-bottom: 20px;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.rating-text {
  color: var(--color-text-tertiary);
  font-size: 14px;
}

.product-origin {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-tertiary);
  margin-bottom: 24px;
  font-size: 16px;
}

.origin-icon {
  color: var(--color-primary-500);
}

.product-price {
  margin-bottom: 32px;
  padding: 20px;
  background: var(--color-bg-muted);
  border-radius: var(--radius-lg);
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 16px;
  margin-bottom: 8px;
}

.current-price {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-danger);
}

.original-price {
  font-size: 18px;
  color: var(--color-text-placeholder);
  text-decoration: line-through;
}

.price-tips {
  font-size: 14px;
}

.discount {
  color: var(--color-primary-500);
  font-weight: 600;
}

/* 商品规格 */
.product-specs {
  margin-bottom: 32px;
}

.product-specs h3 {
  font-size: 18px;
  color: var(--color-text-primary);
  margin-bottom: 16px;
  font-weight: 600;
}

.specs-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.spec-item {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.spec-item:hover {
  border-color: var(--color-primary-500);
}

.spec-item.active {
  border-color: var(--color-primary-500);
  background: var(--color-primary-500);
  color: var(--color-text-inverse);
}

/* 购买数量 */
.quantity-section {
  margin-bottom: 32px;
}

.quantity-section h3 {
  font-size: 18px;
  color: var(--color-text-primary);
  margin-bottom: 16px;
  font-weight: 600;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stock-info {
  color: var(--color-text-tertiary);
  font-size: 14px;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
}

.action-buttons .el-button {
  flex: 1;
}

/* 服务保障 */
.service-guarantee {
  display: flex;
  gap: 24px;
  padding: 20px;
  background: var(--color-bg-body);
  border-radius: var(--radius-lg);
}

.guarantee-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-tertiary);
  font-size: 14px;
}

/* 详细信息 */
.product-details {
  padding: 60px 0;
}

.detail-tabs {
  background: var(--color-bg-surface);
  border-radius: var(--radius-lg);
  padding: 32px;
  box-shadow: var(--shadow-card);
}

.detail-content {
  font-size: 16px;
  line-height: 1.8;
  color: var(--color-text-secondary);
}

.default-content h3 {
  font-size: 20px;
  color: var(--color-text-primary);
  margin: 24px 0 16px;
  font-weight: 600;
}

.default-content ul {
  padding-left: 20px;
}

.default-content li {
  margin-bottom: 8px;
}

/* 规格表格 */
.specs-table table {
  width: 100%;
  border-collapse: collapse;
}

.specs-table td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
}

.specs-table td:first-child {
  background: var(--color-bg-body);
  font-weight: 600;
  width: 120px;
}

/* 评价区域 */
.reviews-summary {
  margin-bottom: 32px;
  padding: 24px;
  background: var(--color-bg-body);
  border-radius: var(--radius-lg);
}

.rating-overview {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 20px;
}

.rating-score {
  font-size: 48px;
  font-weight: 700;
  color: var(--color-warning);
}

.rating-count {
  font-size: 14px;
  color: var(--color-text-tertiary);
  margin-top: 8px;
}

/* 评分分布 */
.rating-distribution {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rating-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}

.rating-label {
  width: 40px;
  color: var(--color-text-tertiary);
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: var(--color-border);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-warning);
  transition: width 0.3s ease;
}

.rating-percent {
  width: 40px;
  text-align: right;
  color: var(--color-text-tertiary);
}

/* 评价筛选 */
.reviews-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background: var(--color-bg-surface);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.filter-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.sort-options {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 写评价区域 */
.write-review-section {
  margin-bottom: 24px;
  text-align: center;
}

.review-tip {
  padding: 12px 20px;
  background: var(--color-bg-body);
  border-radius: 8px;
  border: 1px solid var(--color-border);
  margin: 0 auto;
  display: inline-block;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.review-item {
  padding: 20px;
  background: var(--color-bg-surface);
  border-radius: var(--radius-lg);
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.reviewer-name {
  font-weight: 600;
  color: var(--color-text-primary);
}

.review-date {
  font-size: 14px;
  color: var(--color-text-tertiary);
}

.review-rating {
  margin-bottom: 12px;
}

.review-content {
  line-height: 1.6;
  color: var(--color-text-secondary);
  margin-bottom: 16px;
}

/* 评价图片 */
.review-images {
  margin-bottom: 16px;
}

.image-grid {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.review-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.review-image:hover {
  transform: scale(1.05);
}

/* 商家回复 */
.merchant-reply {
  margin-top: 16px;
  padding: 16px;
  background: var(--color-bg-body);
  border-radius: 8px;
  border-left: 4px solid var(--color-primary-500);
}

.reply-header {
  font-weight: 600;
  color: var(--color-primary-500);
  margin-bottom: 8px;
  font-size: 14px;
}

.reply-content {
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: 8px;
}

.reply-time {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

/* 评价操作 */
.review-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

/* 分页 */
.reviews-pagination {
  margin-top: 32px;
  display: flex;
  justify-content: center;
}

/* 推荐商品 */
.related-products {
  padding: 60px 0;
  background: var(--color-bg-surface);
}

.related-products h2 {
  font-size: 28px;
  color: var(--color-text-primary);
  margin-bottom: 32px;
  text-align: center;
  font-weight: 600;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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
  height: 140px;
  overflow: hidden;
}

.related-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.related-info {
  padding: 16px;
}

.related-info h4 {
  font-size: 14px;
  color: var(--color-text-primary);
  margin-bottom: 8px;
  font-weight: 600;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.related-price {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-danger);
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

  .product-images {
    position: static;
  }
}

@media (max-width: 768px) {
  .product-title {
    font-size: 24px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .service-guarantee {
    flex-direction: column;
    gap: 16px;
  }

  .rating-overview {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .related-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
}
</style>

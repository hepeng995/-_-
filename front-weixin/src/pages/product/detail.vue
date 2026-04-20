<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad, onShow, onShareAppMessage } from '@dcloudio/uni-app'

import AiFloatingButton from '@/components/AiFloatingButton.vue'
import BottomSubmitBar from '@/components/BottomSubmitBar.vue'
import EmptyState from '@/components/EmptyState.vue'
import ProductCard from '@/components/ProductCard.vue'
import ReviewCard from '@/components/ReviewCard.vue'
import SectionBlock from '@/components/SectionBlock.vue'
import { productApi } from '@/api/product'
import { reviewApi } from '@/api/review'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import type { Product, ProductReview, ReviewStats } from '@/types/models'
import { AI_FAB_OFFSET } from '@/utils/ai-fab'
import { formatPrice, toNumber } from '@/utils/format'
import { parseImageList, resolveImage } from '@/utils/assets'
import { REVIEW_RATING_OPTIONS } from '@/utils/options'
import { goToLogin } from '@/utils/nav'

const authStore = useAuthStore()
const cartStore = useCartStore()

const loading = ref(true)
const adding = ref(false)
const product = ref<Product | null>(null)
const relatedProducts = ref<Product[]>([])
const reviews = ref<ProductReview[]>([])
const reviewStats = ref<ReviewStats>({})
const reviewRating = ref<number | null>(null)
const quantity = ref(1)
const hasShownOnce = ref(false)

const gallery = computed(() => {
  const images = parseImageList(product.value?.images)
  if (images.length) return images
  if (product.value?.coverImage) return [resolveImage(product.value.coverImage)]
  return ['/static/images/hero-product.jpg']
})

const loadReviews = async (id: number) => {
  const reviewResponse = await productApi.getProductReviews(id, {
    rating: reviewRating.value,
    current: 1,
    size: 10,
  })

  if (reviewResponse.code !== 200) {
    throw new Error(reviewResponse.message || '评价加载失败')
  }

  reviews.value = reviewResponse.data?.reviews?.records || []
  reviewStats.value = reviewResponse.data?.stats || {}

  if (product.value) {
    product.value.reviewCount = toNumber(reviewStats.value.total_count)
    product.value.rating = toNumber(reviewStats.value.avg_rating)
  }
}

const loadDetail = async (id: number) => {
  loading.value = true
  try {
    const detailResponse = await productApi.getById(id)

    if (detailResponse.code !== 200 || !detailResponse.data) throw new Error(detailResponse.message || '商品详情加载失败')
    product.value = detailResponse.data

    await loadReviews(id)

    if (detailResponse.data.categoryId) {
      const relatedResponse = await productApi.getByCategory(detailResponse.data.categoryId)
      if (relatedResponse.code === 200) {
        relatedProducts.value = (relatedResponse.data || []).filter((item) => item.id !== id).slice(0, 4)
      }
    }
  } catch (error) {
    uni.showToast({ title: error instanceof Error ? error.message : '商品加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const changeQuantity = (delta: number) => {
  const stock = Math.max(1, toNumber(product.value?.stock, 1))
  quantity.value = Math.min(stock, Math.max(1, quantity.value + delta))
}

const handleAddToCart = async () => {
  if (!product.value) return
  if (!authStore.isLoggedIn) {
    goToLogin()
    return
  }
  adding.value = true
  try {
    await cartStore.addToCart(product.value.id, quantity.value)
    await cartStore.fetchCount(true)
    uni.showToast({ title: '已加入购物车', icon: 'none' })
  } catch (error) {
    uni.showToast({ title: error instanceof Error ? error.message : '加购失败', icon: 'none' })
  } finally {
    adding.value = false
  }
}

const buyNow = () => {
  if (!product.value) return
  if (!authStore.isLoggedIn) {
    goToLogin()
    return
  }
  uni.navigateTo({
    url: `/pages-order/confirm?type=buy_now&productId=${product.value.id}&quantity=${quantity.value}`,
  })
}

const toggleHelpful = async (review: ProductReview) => {
  if (!authStore.isLoggedIn) {
    goToLogin()
    return
  }
  await reviewApi.toggleHelpful(review.id)
  if (product.value) {
    loadReviews(product.value.id)
  }
}

const openProduct = (id: number) => {
  uni.redirectTo({ url: `/pages/product/detail?id=${id}` })
}

const openReviewPage = () => {
  if (!product.value) return
  if (!authStore.isLoggedIn) {
    goToLogin()
    return
  }
  uni.navigateTo({
    url: `/pages-review/create?productId=${product.value.id}&productName=${encodeURIComponent(product.value.name)}`,
  })
}

const selectReviewRating = (value: string | number | null) => {
  reviewRating.value = typeof value === 'number' ? value : null
  if (product.value) {
    loadReviews(product.value.id)
  }
}

const previewImage = (current: string) => {
  uni.previewImage({ current, urls: gallery.value })
}

const goBack = () => {
  uni.navigateBack()
}

onLoad((query = {}) => {
  const id = Number(query.id)
  if (id) loadDetail(id)
})

onShow(() => {
  if (!hasShownOnce.value) {
    hasShownOnce.value = true
  } else if (product.value?.id) {
    loadReviews(product.value.id)
  }

  if (authStore.isLoggedIn) {
    cartStore.fetchCount(true)
  }
})

onShareAppMessage(() => ({
  title: product.value?.name || '桃源商品详情',
  path: `/pages/product/detail?id=${product.value?.id || ''}`,
}))
</script>

<template>
  <view class="page-shell safe-bottom">
    <view class="page-padding page-body">
      <template v-if="product">
        <view class="gallery glass-card">
          <swiper class="gallery-swiper" circular indicator-dots autoplay :interval="3600" :duration="500">
            <swiper-item v-for="item in gallery" :key="item">
              <image class="gallery-image" :src="item" mode="aspectFill" @tap="previewImage(item)" />
            </swiper-item>
          </swiper>
        </view>

        <SectionBlock class="section-gap" eyebrow="Taoyuan Market" :title="product.name" :subtitle="`${product.categoryName || '桃源好物'} · ${product.origin || '桃源县直供'}`">
          <view class="price-row">
            <text class="price">{{ formatPrice(product.price) }}</text>
            <text v-if="product.originalPrice" class="origin-price">{{ formatPrice(product.originalPrice) }}</text>
            <text class="sales">已售 {{ product.salesCount || 0 }}</text>
          </view>
          <text class="desc">{{ product.description || '来自桃源的在地风味，适合带回家，也适合作为伴手礼。' }}</text>
          <view class="spec-grid">
            <view class="spec-card"><text class="spec-label">库存</text><text class="spec-value">{{ toNumber(product.stock) }}</text></view>
            <view class="spec-card"><text class="spec-label">评分</text><text class="spec-value">{{ toNumber(product.rating).toFixed(1) }}</text></view>
            <view class="spec-card"><text class="spec-label">评价</text><text class="spec-value">{{ toNumber(product.reviewCount) }}</text></view>
          </view>
          <view class="stepper">
            <text class="stepper-label">购买数量</text>
            <view class="stepper-box">
              <button class="stepper-btn" @tap="changeQuantity(-1)">-</button>
              <text class="stepper-value">{{ quantity }}</text>
              <button class="stepper-btn" @tap="changeQuantity(1)">+</button>
            </view>
          </view>
        </SectionBlock>

        <SectionBlock class="section-gap" eyebrow="Reviews" title="用户评价" subtitle="看看已经购买过的人怎么说">
          <view class="review-filter">
            <button
              v-for="item in REVIEW_RATING_OPTIONS"
              :key="String(item.value)"
              class="review-chip"
              :class="{ active: reviewRating === item.value }"
              @tap="selectReviewRating(item.value)"
            >
              {{ item.label }}
            </button>
          </view>
          <view class="review-summary">
            <text class="summary-score">{{ toNumber(reviewStats.avg_rating).toFixed(1) }}</text>
            <text class="summary-copy">共 {{ reviewStats.total_count || 0 }} 条评价</text>
            <button class="review-entry-btn" @tap="openReviewPage">写评价</button>
          </view>
          <view v-if="reviews.length" class="review-list">
            <ReviewCard v-for="item in reviews" :key="item.id" :review="item" @helpful="toggleHelpful" />
          </view>
          <EmptyState v-else class="section-gap" title="还没有评价" description="你可以成为第一位留下体验的人。" action-text="写评价" @action="openReviewPage" />
        </SectionBlock>

        <SectionBlock v-if="relatedProducts.length" class="section-gap" eyebrow="More Goods" title="继续逛逛" subtitle="如果你喜欢这类风味，下面这些也值得看看">
          <view class="related-grid">
            <ProductCard v-for="item in relatedProducts" :key="item.id" :product="item" @click="openProduct(item.id)" @add="openProduct(item.id)" />
          </view>
        </SectionBlock>
      </template>

      <EmptyState
        v-else-if="!loading"
        title="商品详情暂时不可用"
        description="请返回上一页重新进入，或稍后再试。"
        action-text="返回上一页"
        @action="goBack"
      />
    </view>

    <BottomSubmitBar v-if="product" :button-text="adding ? '加入中...' : '加入购物车'" :disabled="adding || toNumber(product.stock) <= 0" @submit="handleAddToCart">
      <view class="summary">
        <text class="summary-price">{{ formatPrice(product.price) }}</text>
        <button class="buy-btn" @tap.stop="buyNow">立即购买</button>
      </view>
    </BottomSubmitBar>

    <AiFloatingButton :bottom-offset="AI_FAB_OFFSET.elevated" />
  </view>
</template>

<style lang="scss" scoped>
.page-body {
  padding-bottom: calc(env(safe-area-inset-bottom) + 180rpx);
}

.gallery {
  overflow: hidden;
}

.gallery-swiper,
.gallery-image {
  width: 100%;
  height: 420rpx;
}

.price-row,
.stepper,
.stepper-box,
.summary {
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.price-row,
.stepper,
.summary {
  justify-content: space-between;
  flex-wrap: wrap;
}

.price {
  font-size: 44rpx;
  font-weight: 800;
  color: $brand-gold;
}

.origin-price,
.sales,
.summary-copy {
  font-size: 22rpx;
  color: $text-muted;
}

.desc {
  margin-top: 18rpx;
  display: block;
  font-size: 26rpx;
  line-height: 1.8;
  color: $text-secondary;
}

.spec-grid,
.related-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16rpx;
  margin-top: 24rpx;
}

.related-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20rpx;
}

.spec-card {
  padding: 20rpx;
  border-radius: 24rpx;
  background: rgba(31, 106, 69, 0.05);
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.spec-label {
  font-size: 22rpx;
  color: $text-muted;
}

.spec-value,
.summary-score,
.summary-price {
  font-size: 34rpx;
  color: $brand-green;
  font-weight: 800;
}

.stepper {
  margin-top: 24rpx;
}

.stepper-btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: 20rpx;
  background: rgba(31, 106, 69, 0.08);
  color: $brand-green;
  font-size: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stepper-value {
  min-width: 48rpx;
  text-align: center;
  font-size: 30rpx;
  font-weight: 800;
}

.review-filter,
.review-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.review-filter {
  flex-direction: row;
  flex-wrap: wrap;
}

.review-chip,
.review-entry-btn,
.buy-btn {
  min-width: 120rpx;
  height: 56rpx;
  padding: 0 18rpx;
  border-radius: 999rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
}

.review-chip,
.review-entry-btn {
  background: rgba(31, 106, 69, 0.08);
  color: $brand-green;
}

.review-chip.active,
.buy-btn {
  background: linear-gradient(135deg, $brand-green, $brand-green-soft);
  color: $text-inverse;
}

.review-summary {
  margin-top: 18rpx;
  padding: 22rpx;
  border-radius: 24rpx;
  background: rgba(31, 106, 69, 0.05);
  display: flex;
  align-items: center;
  gap: 14rpx;
  justify-content: space-between;
  flex-wrap: wrap;
}

.summary {
  align-items: center;
}

.summary-price {
  color: $brand-gold;
}

@media screen and (max-width: 420px) {
  .spec-grid {
    grid-template-columns: 1fr;
  }
}
</style>

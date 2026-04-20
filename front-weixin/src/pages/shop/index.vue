<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { onPullDownRefresh, onReachBottom, onShareAppMessage, onShow } from '@dcloudio/uni-app'

import AiFloatingButton from '@/components/AiFloatingButton.vue'
import EmptyState from '@/components/EmptyState.vue'
import FilterChips from '@/components/FilterChips.vue'
import ListSkeleton from '@/components/ListSkeleton.vue'
import ProductCard from '@/components/ProductCard.vue'
import SectionBlock from '@/components/SectionBlock.vue'
import { productApi } from '@/api/product'
import { appConfig } from '@/config/app'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import type { CategoryItem, ChipOption, Product } from '@/types/models'
import { AI_FAB_OFFSET } from '@/utils/ai-fab'
import { goToLogin } from '@/utils/nav'

const authStore = useAuthStore()
const cartStore = useCartStore()

const loading = ref(false)
const categories = ref<CategoryItem[]>([])
const products = ref<Product[]>([])
const total = ref(0)
const searchKeyword = ref('')

const query = reactive({
  pageNum: 1,
  pageSize: 8,
  keyword: '',
  categoryId: null as number | null,
  status: 1,
})

const categoryChips = computed<ChipOption[]>(() => [
  { label: '全部商品', value: null },
  ...categories.value.map((item) => ({
    label: item.name,
    value: item.id,
  })),
])

const canLoadMore = computed(() => products.value.length < total.value)

const loadCategories = async () => {
  const response = await productApi.getCategories()
  if (response.code === 200) {
    categories.value = response.data || []
  }
}

const loadProducts = async (append = false) => {
  loading.value = true
  try {
    const response = await productApi.getPage(query)
    if (response.code !== 200) {
      throw new Error(response.message || '商品加载失败')
    }

    const records = (response.data?.records || []).map((item) => ({
      ...item,
      buyQuantity: item.buyQuantity || 1,
    }))

    total.value = response.data?.total || 0
    products.value = append ? products.value.concat(records) : records
  } finally {
    loading.value = false
    uni.stopPullDownRefresh()
  }
}

const bootstrap = async () => {
  try {
    await Promise.all([
      loadCategories(),
      loadProducts(),
    ])
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : '加载失败',
      icon: 'none',
    })
  }
}

const applySearch = () => {
  query.keyword = searchKeyword.value.trim()
  query.pageNum = 1
  products.value = []
  loadProducts()
}

const chooseCategory = (value: string | number | null) => {
  query.categoryId = typeof value === 'number' ? value : value === null ? null : Number(value)
  query.pageNum = 1
  products.value = []
  loadProducts()
}

const openProduct = (id: number) => {
  uni.navigateTo({
    url: `/pages/product/detail?id=${id}`,
  })
}

const handleAddToCart = async (product: Product) => {
  if (!appConfig.enableCart) {
    uni.showToast({
      title: '购物车能力已关闭',
      icon: 'none',
    })
    return
  }

  if (!authStore.isLoggedIn) {
    goToLogin()
    return
  }

  try {
    await cartStore.addToCart(product.id, product.buyQuantity || 1)
    uni.showToast({
      title: '已加入购物车',
      icon: 'none',
    })
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : '加购失败',
      icon: 'none',
    })
  }
}

const openCart = () => {
  if (!authStore.isLoggedIn) {
    goToLogin()
    return
  }

  uni.navigateTo({
    url: '/pages/cart/index',
  })
}

const resetFilters = () => {
  searchKeyword.value = ''
  query.keyword = ''
  query.categoryId = null
  query.pageNum = 1
  products.value = []
  loadProducts()
}

bootstrap()

onShow(() => {
  if (authStore.isLoggedIn) {
    cartStore.fetchCount(true)
  } else {
    cartStore.reset()
  }
})

onPullDownRefresh(() => {
  query.pageNum = 1
  products.value = []
  loadProducts()
})

onReachBottom(() => {
  if (!canLoadMore.value) return
  query.pageNum += 1
  loadProducts(true)
})

onShareAppMessage(() => ({
  title: '桃源集｜把在地土产装进购物车',
  path: '/pages/shop/index',
}))
</script>

<template>
  <view class="page-shell safe-bottom">
    <view class="page-padding">
      <view class="hero glass-card">
        <image class="hero-cover" src="/static/images/hero-product.jpg" mode="aspectFill" />
        <view class="hero-overlay">
          <text class="hero-kicker">TASTE · GIFT · LOCAL</text>
          <text class="hero-title">桃源集</text>
          <text class="hero-copy">把桃源的蜂蜜、米酒和山野风味装进一份轻量却好看的小程序集市。</text>
        </view>
      </view>

      <SectionBlock
        class="section-gap"
        eyebrow="Filter"
        title="挑选桃源好物"
        subtitle="先筛分类，再按关键词搜索，喜欢的就顺手加购。"
      >
        <view class="search-panel">
          <input
            v-model.trim="searchKeyword"
            class="search-input"
            placeholder="搜索商品名称"
            confirm-type="search"
            @confirm="applySearch"
          />
          <button class="search-btn" @tap="applySearch">搜索</button>
        </view>
        <FilterChips :options="categoryChips" :model-value="query.categoryId" @update:model-value="chooseCategory" />
      </SectionBlock>

      <view class="section-gap">
        <ListSkeleton v-if="loading" mode="grid" :rows="4" />
        <view v-else-if="products.length" class="grid">
          <ProductCard
            v-for="item in products"
            :key="item.id"
            :product="item"
            @click="openProduct(item.id)"
            @add="handleAddToCart"
          />
        </view>
        <EmptyState
          v-else
          title="这类商品还没上架"
          description="换个分类看看，或者稍后再回来刷新。"
          action-text="重置筛选"
          @action="resetFilters"
        />
      </view>

      <view v-if="canLoadMore" class="load-more">向上滑动加载更多商品</view>
      <view v-else-if="!loading" class="load-more muted">已经看到最后一页了</view>
    </view>

    <button v-if="appConfig.enableCart" class="floating-cart" @tap="openCart">
      <view class="floating-count" v-if="cartStore.count">{{ Math.min(cartStore.count, 99) }}</view>
      <text class="floating-label">购物车</text>
    </button>

    <AiFloatingButton :bottom-offset="AI_FAB_OFFSET.shop" />
  </view>
</template>

<style lang="scss" scoped>
.hero {
  overflow: hidden;
  position: relative;
  min-height: 300rpx;
}

.hero-cover {
  width: 100%;
  height: 300rpx;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  padding: 30rpx 26rpx;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 10rpx;
  background: linear-gradient(180deg, rgba(60, 31, 5, 0.05), rgba(60, 31, 5, 0.65));
  color: $text-inverse;
}

.hero-kicker {
  font-size: 22rpx;
  letter-spacing: 4rpx;
}

.hero-title {
  font-size: 50rpx;
  font-weight: 800;
  line-height: 1.12;
}

.hero-copy {
  font-size: 24rpx;
  line-height: 1.7;
}

.search-panel {
  display: flex;
  gap: 14rpx;
  margin-bottom: 18rpx;
}

.search-input {
  flex: 1;
  height: 78rpx;
  padding: 0 28rpx;
  border-radius: 999rpx;
  background: rgba(31, 106, 69, 0.06);
  font-size: 26rpx;
}

.search-btn {
  min-width: 148rpx;
  height: 78rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, $brand-green, $brand-green-soft);
  color: $text-inverse;
  font-size: 26rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20rpx;
}

.load-more {
  padding: 22rpx 0 8rpx;
  text-align: center;
  font-size: 22rpx;
  color: $brand-green;
}

.load-more.muted {
  color: $text-muted;
}

.floating-cart {
  position: fixed;
  right: 26rpx;
  bottom: calc(env(safe-area-inset-bottom) + 132rpx);
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  background: linear-gradient(135deg, $brand-gold, #e8b655);
  color: $text-inverse;
  box-shadow: $shadow-strong;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: 700;
}

.floating-count {
  position: absolute;
  top: -6rpx;
  right: -2rpx;
  min-width: 42rpx;
  height: 42rpx;
  padding: 0 10rpx;
  border-radius: 999rpx;
  background: #fff8ec;
  color: $brand-green;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
}

.floating-label {
  color: $text-inverse;
}

@media screen and (max-width: 420px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>

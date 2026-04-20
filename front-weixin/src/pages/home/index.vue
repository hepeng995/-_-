<script setup lang="ts">
import { computed, ref } from 'vue'
import { onPullDownRefresh, onShareAppMessage } from '@dcloudio/uni-app'

import EmptyState from '@/components/EmptyState.vue'
import AiFloatingButton from '@/components/AiFloatingButton.vue'
import ForumPostCard from '@/components/ForumPostCard.vue'
import ListSkeleton from '@/components/ListSkeleton.vue'
import ProductCard from '@/components/ProductCard.vue'
import SectionBlock from '@/components/SectionBlock.vue'
import { homeApi } from '@/api/home'
import type { Attraction, ForumPost, NewsItem, Product, VillageOverview } from '@/types/models'
import { formatRelativeTime } from '@/utils/format'
import { resolveImage } from '@/utils/assets'
import { AI_FAB_OFFSET } from '@/utils/ai-fab'

const loading = ref(true)
const overview = ref<VillageOverview>({})
const recommendAttractions = ref<Attraction[]>([])
const hotProducts = ref<Product[]>([])
const featuredNews = ref<NewsItem[]>([])
const topPosts = ref<ForumPost[]>([])

const heroDescription = computed(() => '把桃源的山水风景、在地好物和新鲜资讯装进同一张掌心地图。')
const honors = computed(() => ['山水文旅', '在地好物', '时新资讯'])

const loadHome = async () => {
  loading.value = true
  try {
    const [overviewResponse, homeResponse] = await Promise.all([homeApi.getOverview(), homeApi.getHomeData()])
    if (overviewResponse.code === 200) overview.value = overviewResponse.data || {}
    if (homeResponse.code === 200 && homeResponse.data) {
      recommendAttractions.value = (homeResponse.data.recommendAttractions || []).slice(0, 3)
      hotProducts.value = (homeResponse.data.hotProducts || []).slice(0, 4)
      featuredNews.value = (homeResponse.data.featuredNews || []).slice(0, 3)
      topPosts.value = (homeResponse.data.topPosts || []).slice(0, 2)
    }
  } catch (error) {
    uni.showToast({ title: error instanceof Error ? error.message : '首页加载失败', icon: 'none' })
  } finally {
    loading.value = false
    uni.stopPullDownRefresh()
  }
}

const goTab = (url: '/pages/discover/index' | '/pages/shop/index' | '/pages/forum/index') => uni.switchTab({ url })
const goPage = (url: string) => uni.navigateTo({ url })
const openAttraction = (id: number) => goPage(`/pages/attraction/detail?id=${id}`)
const openProduct = (id: number) => goPage(`/pages/product/detail?id=${id}`)
const openNews = (id: number) => goPage(`/pages/news/detail?id=${id}`)
const openPost = (id: number) => goPage(`/pages-forum/detail?id=${id}`)

loadHome()

onPullDownRefresh(loadHome)

onShareAppMessage(() => ({
  title: '新桃源智界｜山水、好物、资讯与共建一站直达',
  path: '/pages/home/index',
}))
</script>

<template>
  <view class="page-shell safe-bottom">
    <view class="page-padding">
      <view class="hero glass-card">
        <image class="hero-bg" src="/static/images/hero-scenic.jpg" mode="aspectFill" />
        <view class="hero-overlay">
          <view class="hero-copy">
            <text class="hero-kicker">TAOYUAN SMART PORTAL</text>
            <text class="hero-title">{{ overview.title || '新桃源智界' }}</text>
            <text class="hero-subtitle">{{ heroDescription }}</text>
          </view>
          <view class="hero-actions">
            <button class="primary-btn" @tap="goTab('/pages/discover/index')">逛景点</button>
            <button class="ghost-btn" @tap="goTab('/pages/shop/index')">买特产</button>
          </view>
          <view class="hero-badges">
            <text v-for="item in honors" :key="item" class="hero-badge">{{ item }}</text>
          </view>
        </view>
      </view>

      <SectionBlock class="section-gap" eyebrow="Overview" title="桃源概览" subtitle="先用几个核心数字看懂这里的风景与内容热度">
        <view class="overview-grid">
          <view class="overview-card"><text class="overview-label">景点</text><text class="overview-value">{{ overview.attractionCount || recommendAttractions.length }}</text></view>
          <view class="overview-card"><text class="overview-label">特产</text><text class="overview-value">{{ overview.productCount || hotProducts.length }}</text></view>
          <view class="overview-card"><text class="overview-label">资讯</text><text class="overview-value">{{ overview.newsCount || featuredNews.length }}</text></view>
        </view>
        <view class="overview-copy">
          <text class="overview-text">{{ overview.description || '这里既有桃源山水的诗意，也有当代乡村发展的鲜活气息。' }}</text>
          <image class="overview-cover" :src="resolveImage(overview.image, '/static/images/overview.jpg')" mode="aspectFill" />
        </view>
      </SectionBlock>

      <SectionBlock class="section-gap" eyebrow="Scenic Picks" title="推荐景点" subtitle="第一次来桃源时，先从这些经典点位开始">
        <template #action><button class="text-btn" @tap="goTab('/pages/discover/index')">更多景点</button></template>
        <ListSkeleton v-if="loading" mode="card" :rows="2" />
        <view v-else-if="recommendAttractions.length" class="stack-list">
          <view v-for="item in recommendAttractions" :key="item.id" class="scenic-card glass-card" @tap="openAttraction(item.id)">
            <image class="scenic-cover" :src="resolveImage(item.coverImage, '/static/images/hero-scenic.jpg')" mode="aspectFill" />
            <view class="scenic-body">
              <text class="scenic-title text-ellipsis-1">{{ item.name }}</text>
              <text class="scenic-meta text-ellipsis-1">{{ item.categoryName || '景点导览' }} · {{ item.address || '桃源县推荐' }}</text>
              <text class="scenic-desc text-ellipsis-2">{{ item.description || '点击查看景点简介与交通信息。' }}</text>
            </view>
          </view>
        </view>
        <EmptyState v-else title="景点内容还在整理" description="稍后再回来看看，我们会把精选线路补齐。" action-text="刷新首页" @action="loadHome" />
      </SectionBlock>

      <SectionBlock class="section-gap" eyebrow="Tasty Market" title="热销特产" subtitle="来自桃源的在地风味，适合顺手加购带回家">
        <template #action><button class="text-btn" @tap="goTab('/pages/shop/index')">进入桃源集</button></template>
        <ListSkeleton v-if="loading" mode="grid" :rows="4" />
        <view v-else-if="hotProducts.length" class="product-grid">
          <ProductCard v-for="item in hotProducts" :key="item.id" :product="item" @click="openProduct(item.id)" @add="openProduct(item.id)" />
        </view>
        <EmptyState v-else title="桃源集正在上新" description="等一下再来逛逛，热卖土产很快就会上架。" action-text="重新加载" @action="loadHome" />
      </SectionBlock>

      <SectionBlock class="section-gap" eyebrow="Community" title="共建热议" subtitle="看看大家最近最关注哪些乡村建设话题">
        <template #action><button class="text-btn" @tap="goTab('/pages/forum/index')">进入共建</button></template>
        <view v-if="topPosts.length" class="stack-list">
          <ForumPostCard v-for="item in topPosts" :key="item.id" :post="item" @click="openPost(item.id)" @like="openPost(item.id)" />
        </view>
        <EmptyState v-else title="共建话题正在整理" description="欢迎稍后回来看看，或者成为第一位发言的人。" action-text="去共建" @action="goTab('/pages/forum/index')" />
      </SectionBlock>

      <SectionBlock class="section-gap" eyebrow="Fresh News" title="最新资讯" subtitle="快速了解桃源最近正在发生的新鲜变化">
        <template #action><button class="text-btn" @tap="goTab('/pages/discover/index')">更多资讯</button></template>
        <view v-if="featuredNews.length" class="news-list">
          <view v-for="item in featuredNews" :key="item.id" class="news-card glass-card" @tap="openNews(item.id)">
            <image class="news-cover" :src="resolveImage(item.coverImage, '/static/images/hero-news.jpg')" mode="aspectFill" />
            <view class="news-body">
              <text class="news-tag">{{ item.categoryDesc || '乡村资讯' }}</text>
              <text class="news-title text-ellipsis-2">{{ item.title }}</text>
              <text class="news-desc text-ellipsis-2">{{ item.summary || '点击查看详细内容。' }}</text>
              <text class="news-time">{{ formatRelativeTime(item.publishTime || item.createdAt) }}</text>
            </view>
          </view>
        </view>
      </SectionBlock>

      <AiFloatingButton :bottom-offset="AI_FAB_OFFSET.tab" />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.hero {
  overflow: hidden;
  position: relative;
  min-height: 420rpx;
}

.hero-bg,
.hero-overlay {
  width: 100%;
  height: 100%;
}

.hero-bg {
  position: absolute;
  inset: 0;
}

.hero-overlay {
  position: relative;
  z-index: 1;
  min-height: 420rpx;
  padding: 34rpx 28rpx 28rpx;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 24rpx;
  background: linear-gradient(180deg, rgba(22, 50, 35, 0.18), rgba(24, 43, 33, 0.72));
}

.hero-copy {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.hero-kicker {
  font-size: 22rpx;
  letter-spacing: 4rpx;
  color: rgba(255, 250, 240, 0.88);
}

.hero-title {
  font-size: 56rpx;
  font-weight: 800;
  color: #fffaf0;
}

.hero-subtitle {
  font-size: 26rpx;
  line-height: 1.7;
  color: rgba(255, 250, 240, 0.92);
}

.hero-actions,
.hero-badges,
.stack-list,
.news-list {
  display: flex;
  gap: 16rpx;
}

.hero-badges,
.stack-list,
.news-list {
  flex-direction: column;
}

.primary-btn,
.ghost-btn,
.text-btn {
  min-width: 160rpx;
  height: 78rpx;
  padding: 0 28rpx;
  border-radius: 999rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: 700;
}

.primary-btn {
  background: linear-gradient(135deg, $brand-gold, #e8b655);
  color: $text-inverse;
}

.ghost-btn {
  background: rgba(255, 252, 246, 0.16);
  color: $text-inverse;
}

.text-btn {
  height: 56rpx;
  padding: 0 20rpx;
  background: rgba(31, 106, 69, 0.08);
  color: $brand-green;
  font-size: 22rpx;
}

.hero-badge {
  padding: 0 18rpx;
  height: 50rpx;
  border-radius: 999rpx;
  background: rgba(255, 252, 246, 0.16);
  color: rgba(255, 250, 240, 0.92);
  font-size: 22rpx;
  display: inline-flex;
  align-items: center;
}

.overview-grid,
.product-grid {
  display: grid;
  gap: 16rpx;
}

.overview-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.product-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20rpx;
}

.overview-card {
  min-height: 160rpx;
  padding: 22rpx;
  border-radius: 24rpx;
  background: linear-gradient(180deg, rgba(255, 252, 246, 0.92), rgba(243, 238, 226, 0.96));
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  text-align: left;
}

.overview-value,
.scenic-title,
.news-title {
  color: $text-primary;
  font-weight: 800;
}

.overview-label,
.overview-text,
.news-desc,
.news-time,
.scenic-meta,
.scenic-desc {
  color: $text-secondary;
}

.overview-text,
.scenic-desc,
.news-desc {
  font-size: 22rpx;
  line-height: 1.7;
}

.overview-label {
  font-size: 22rpx;
}

.overview-value {
  font-size: 50rpx;
  color: $brand-green;
}

.overview-copy {
  margin-top: 22rpx;
  display: grid;
  grid-template-columns: 1.2fr 0.9fr;
  gap: 18rpx;
  align-items: center;
}

.overview-cover {
  width: 100%;
  height: 220rpx;
  border-radius: 24rpx;
}

.scenic-card,
.news-card {
  overflow: hidden;
}

.scenic-cover,
.news-cover {
  width: 100%;
  height: 220rpx;
}

.scenic-body,
.news-body {
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.scenic-title,
.news-title {
  font-size: 30rpx;
  line-height: 1.4;
}

.scenic-meta,
.news-time {
  font-size: 22rpx;
}

.news-tag {
  font-size: 22rpx;
  color: $brand-blue;
}

@media screen and (max-width: 420px) {
  .overview-grid,
  .overview-copy {
    grid-template-columns: 1fr;
  }
}
</style>

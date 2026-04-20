<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { onPullDownRefresh, onReachBottom, onShareAppMessage } from '@dcloudio/uni-app'

import AiFloatingButton from '@/components/AiFloatingButton.vue'
import EmptyState from '@/components/EmptyState.vue'
import FilterChips from '@/components/FilterChips.vue'
import ListSkeleton from '@/components/ListSkeleton.vue'
import SectionBlock from '@/components/SectionBlock.vue'
import { attractionApi } from '@/api/attraction'
import { newsApi } from '@/api/news'
import type { Attraction, CategoryItem, ChipOption, NewsItem } from '@/types/models'
import { AI_FAB_OFFSET } from '@/utils/ai-fab'
import { formatRelativeTime } from '@/utils/format'
import { resolveImage } from '@/utils/assets'

type SegmentKey = 'attractions' | 'news'

const activeSegment = ref<SegmentKey>('attractions')
const searchKeyword = ref('')
const loading = ref(false)
const topNews = ref<NewsItem[]>([])

const attractionCategories = ref<CategoryItem[]>([])
const attractions = ref<Attraction[]>([])
const attractionTotal = ref(0)
const attractionQuery = reactive({
  pageNum: 1,
  pageSize: 8,
  keyword: '',
  categoryId: null as number | null,
  status: 1,
})

const newsList = ref<NewsItem[]>([])
const newsTotal = ref(0)
const newsQuery = reactive({
  pageNum: 1,
  pageSize: 8,
  keyword: '',
  category: '' as string,
  status: 1,
})

const segmentOptions = computed<ChipOption[]>(() => [
  { label: '景点导览', value: 'attractions' },
  { label: '动态资讯', value: 'news' },
])

const attractionChips = computed<ChipOption[]>(() => [
  { label: '全部景点', value: null },
  ...attractionCategories.value.map((item) => ({
    label: item.name,
    value: item.id,
  })),
])

const newsChips = computed<ChipOption[]>(() => [
  { label: '全部资讯', value: '' },
  { label: '政策通知', value: 'policy' },
  { label: '乡村新闻', value: 'news' },
  { label: '活动预告', value: 'activity' },
])

const canLoadMoreAttractions = computed(() => attractions.value.length < attractionTotal.value)
const canLoadMoreNews = computed(() => newsList.value.length < newsTotal.value)

const resetAttractions = () => {
  attractions.value = []
  attractionQuery.pageNum = 1
}

const resetNews = () => {
  newsList.value = []
  newsQuery.pageNum = 1
}

const loadAttractionCategories = async () => {
  const response = await attractionApi.getCategories()
  if (response.code === 200) {
    attractionCategories.value = response.data || []
  }
}

const loadTopNews = async () => {
  const response = await newsApi.getTop(3)
  if (response.code === 200) {
    topNews.value = response.data || []
  }
}

const loadAttractions = async (append = false) => {
  loading.value = true
  try {
    const response = await attractionApi.getPage(attractionQuery)
    if (response.code !== 200) {
      throw new Error(response.message || '景点加载失败')
    }

    const records = response.data?.records || []
    attractionTotal.value = response.data?.total || 0
    attractions.value = append ? attractions.value.concat(records) : records
  } finally {
    loading.value = false
    uni.stopPullDownRefresh()
  }
}

const loadNews = async (append = false) => {
  loading.value = true
  try {
    const response = await newsApi.getPage(newsQuery)
    if (response.code !== 200) {
      throw new Error(response.message || '资讯加载失败')
    }

    const records = response.data?.records || []
    newsTotal.value = response.data?.total || 0
    newsList.value = append ? newsList.value.concat(records) : records
  } finally {
    loading.value = false
    uni.stopPullDownRefresh()
  }
}

const bootstrap = async () => {
  try {
    await Promise.all([
      loadAttractionCategories(),
      loadTopNews(),
      loadAttractions(),
      loadNews(),
    ])
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : '加载失败',
      icon: 'none',
    })
  }
}

const applySearch = () => {
  if (activeSegment.value === 'attractions') {
    attractionQuery.keyword = searchKeyword.value.trim()
    resetAttractions()
    loadAttractions()
    return
  }

  newsQuery.keyword = searchKeyword.value.trim()
  resetNews()
  loadNews()
}

const switchSegment = (value: string | number | null) => {
  activeSegment.value = (value as SegmentKey) || 'attractions'
  searchKeyword.value = activeSegment.value === 'attractions' ? attractionQuery.keyword : newsQuery.keyword
}

const chooseAttractionCategory = (value: string | number | null) => {
  attractionQuery.categoryId = typeof value === 'number' ? value : value === null ? null : Number(value)
  resetAttractions()
  loadAttractions()
}

const chooseNewsCategory = (value: string | number | null) => {
  newsQuery.category = typeof value === 'string' ? value : ''
  resetNews()
  loadNews()
}

const handleRefresh = () => {
  if (activeSegment.value === 'attractions') {
    resetAttractions()
    loadAttractions()
    return
  }

  resetNews()
  loadNews()
}

const handleReachBottom = () => {
  if (activeSegment.value === 'attractions' && canLoadMoreAttractions.value) {
    attractionQuery.pageNum += 1
    loadAttractions(true)
    return
  }

  if (activeSegment.value === 'news' && canLoadMoreNews.value) {
    newsQuery.pageNum += 1
    loadNews(true)
  }
}

const openAttraction = (id: number) => {
  uni.navigateTo({
    url: `/pages/attraction/detail?id=${id}`,
  })
}

const openNews = (id: number) => {
  uni.navigateTo({
    url: `/pages/news/detail?id=${id}`,
  })
}

bootstrap()

onPullDownRefresh(() => {
  handleRefresh()
})

onReachBottom(() => {
  handleReachBottom()
})

onShareAppMessage(() => ({
  title: '游桃源｜景点与动态资讯都在这里',
  path: '/pages/discover/index',
}))
</script>

<template>
  <view class="page-shell safe-bottom">
    <view class="page-padding">
      <view class="masthead glass-card">
        <text class="masthead-kicker">WANDER · READ · DISCOVER</text>
        <text class="masthead-title">游桃源</text>
        <text class="masthead-copy">一边看山水，一边看正在发生的新鲜事。路线和资讯都在这一页切换。</text>
      </view>

      <SectionBlock
        class="section-gap"
        eyebrow="Browse"
        title="选择浏览方式"
        subtitle="想看风景就切到景点，想追新鲜动态就切到资讯。"
      >
        <FilterChips :options="segmentOptions" :model-value="activeSegment" @update:model-value="switchSegment" />
        <view class="search-panel">
          <input
            v-model.trim="searchKeyword"
            class="search-input"
            :placeholder="activeSegment === 'attractions' ? '搜索景点名称' : '搜索资讯标题或摘要'"
            confirm-type="search"
            @confirm="applySearch"
          />
          <button class="search-btn" @tap="applySearch">搜索</button>
        </view>

        <FilterChips
          v-if="activeSegment === 'attractions'"
          :options="attractionChips"
          :model-value="attractionQuery.categoryId"
          @update:model-value="chooseAttractionCategory"
        />
        <FilterChips
          v-else
          :options="newsChips"
          :model-value="newsQuery.category"
          @update:model-value="chooseNewsCategory"
        />
      </SectionBlock>

      <SectionBlock
        v-if="activeSegment === 'news' && topNews.length"
        class="section-gap"
        eyebrow="Top Stories"
        title="置顶资讯"
        subtitle="最近最值得先看的几条消息，适合快速了解桃源近况。"
      >
        <scroll-view scroll-x enable-flex :show-scrollbar="false">
          <view class="top-news-row">
            <view
              v-for="item in topNews"
              :key="item.id"
              class="top-news-card glass-card"
              @tap="openNews(item.id)"
            >
              <image class="top-news-cover" :src="resolveImage(item.coverImage, '/static/images/hero-news.jpg')" mode="aspectFill" />
              <text class="top-news-tag">{{ item.categoryDesc || '置顶资讯' }}</text>
              <text class="top-news-title text-ellipsis-2">{{ item.title }}</text>
              <text class="top-news-time">{{ formatRelativeTime(item.publishTime || item.createdAt) }}</text>
            </view>
          </view>
        </scroll-view>
      </SectionBlock>

      <view class="section-gap">
        <ListSkeleton v-if="loading" :mode="activeSegment === 'attractions' ? 'card' : 'card'" :rows="3" />

        <view v-else-if="activeSegment === 'attractions' && attractions.length" class="stack-list">
          <view
            v-for="item in attractions"
            :key="item.id"
            class="discover-card glass-card"
            @tap="openAttraction(item.id)"
          >
            <image class="discover-cover" :src="resolveImage(item.coverImage, '/static/images/hero-scenic.jpg')" mode="aspectFill" />
            <view class="discover-body">
              <text class="discover-title text-ellipsis-1">{{ item.name }}</text>
              <text class="discover-meta text-ellipsis-1">{{ item.categoryName || '景点导览' }} · {{ item.address || '桃源县推荐' }}</text>
              <text class="discover-desc text-ellipsis-3">{{ item.description || '点击继续查看景点简介与交通指引。' }}</text>
            </view>
          </view>
        </view>

        <view v-else-if="activeSegment === 'news' && newsList.length" class="stack-list">
          <view
            v-for="item in newsList"
            :key="item.id"
            class="discover-card glass-card"
            @tap="openNews(item.id)"
          >
            <image class="discover-cover" :src="resolveImage(item.coverImage, '/static/images/hero-news.jpg')" mode="aspectFill" />
            <view class="discover-body">
              <text class="discover-title text-ellipsis-2">{{ item.title }}</text>
              <text class="discover-meta text-ellipsis-1">{{ item.categoryDesc || '乡村资讯' }} · {{ formatRelativeTime(item.publishTime || item.createdAt) }}</text>
              <text class="discover-desc text-ellipsis-3">{{ item.summary || '点击继续查看完整资讯内容。' }}</text>
            </view>
          </view>
        </view>

        <EmptyState
          v-else
          :title="activeSegment === 'attractions' ? '暂无匹配景点' : '暂无匹配资讯'"
          :description="activeSegment === 'attractions' ? '换个关键词，或试试其它分类标签。' : '换个分类试试，或者稍后再回来查看。'"
          action-text="重置筛选"
          @action="activeSegment === 'attractions' ? chooseAttractionCategory(null) : chooseNewsCategory('')"
        />
      </view>

      <view v-if="(activeSegment === 'attractions' && canLoadMoreAttractions) || (activeSegment === 'news' && canLoadMoreNews)" class="load-more">
        向上滑动加载更多
      </view>
      <view v-else-if="!loading" class="load-more muted">
        已经到底了
      </view>

      <AiFloatingButton :bottom-offset="AI_FAB_OFFSET.tab" />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.masthead {
  padding: 30rpx 28rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  background:
    linear-gradient(135deg, rgba(31, 106, 69, 0.94), rgba(76, 143, 175, 0.88)),
    linear-gradient(135deg, rgba(255, 252, 246, 0.1), rgba(255, 252, 246, 0));
  color: $text-inverse;
}

.masthead-kicker {
  font-size: 22rpx;
  letter-spacing: 4rpx;
  opacity: 0.84;
}

.masthead-title {
  font-size: 50rpx;
  line-height: 1.1;
  font-weight: 800;
}

.masthead-copy {
  font-size: 24rpx;
  line-height: 1.7;
  opacity: 0.94;
}

.search-panel {
  margin: 22rpx 0 18rpx;
  display: flex;
  gap: 14rpx;
}

.search-input {
  flex: 1;
  height: 78rpx;
  padding: 0 28rpx;
  border-radius: 999rpx;
  background: rgba(31, 106, 69, 0.06);
  font-size: 26rpx;
  color: $text-primary;
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

.top-news-row {
  display: inline-flex;
  gap: 18rpx;
}

.top-news-card {
  width: 360rpx;
  padding: 18rpx;
}

.top-news-cover {
  width: 100%;
  height: 188rpx;
  border-radius: 20rpx;
}

.top-news-tag,
.top-news-time {
  margin-top: 14rpx;
  display: block;
  font-size: 22rpx;
  color: $brand-blue;
}

.top-news-title {
  margin-top: 8rpx;
  display: block;
  font-size: 28rpx;
  line-height: 1.45;
  font-weight: 700;
  color: $text-primary;
}

.stack-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.discover-card {
  display: flex;
  gap: 18rpx;
  padding: 18rpx;
}

.discover-cover {
  width: 210rpx;
  height: 188rpx;
  flex-shrink: 0;
  border-radius: 22rpx;
}

.discover-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.discover-title {
  font-size: 30rpx;
  font-weight: 700;
  color: $text-primary;
  line-height: 1.35;
}

.discover-meta {
  font-size: 22rpx;
  color: $text-muted;
}

.discover-desc {
  font-size: 24rpx;
  line-height: 1.7;
  color: $text-secondary;
}

.load-more {
  padding: 24rpx 0 8rpx;
  text-align: center;
  font-size: 22rpx;
  color: $brand-green;
}

.load-more.muted {
  color: $text-muted;
}

@media screen and (max-width: 420px) {
  .discover-card {
    flex-direction: column;
  }

  .discover-cover {
    width: 100%;
    height: 220rpx;
  }
}
</style>

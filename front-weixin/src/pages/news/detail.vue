<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app'

import AiFloatingButton from '@/components/AiFloatingButton.vue'
import EmptyState from '@/components/EmptyState.vue'
import ListSkeleton from '@/components/ListSkeleton.vue'
import SectionBlock from '@/components/SectionBlock.vue'
import { newsApi } from '@/api/news'
import type { NewsItem } from '@/types/models'
import { AI_FAB_OFFSET } from '@/utils/ai-fab'
import { formatDateTime, formatRelativeTime, stripHtml } from '@/utils/format'
import { normalizeRichText } from '@/utils/rich-text'
import { resolveImage } from '@/utils/assets'

const loading = ref(true)
const newsDetail = ref<NewsItem | null>(null)
const topNews = ref<NewsItem[]>([])

const loadDetail = async (id: number) => {
  loading.value = true
  try {
    const [detailResponse, topResponse] = await Promise.all([
      newsApi.getById(id),
      newsApi.getTop(4),
    ])

    if (detailResponse.code !== 200 || !detailResponse.data) {
      throw new Error(detailResponse.message || '资讯详情加载失败')
    }

    newsDetail.value = detailResponse.data

    if (topResponse.code === 200) {
      topNews.value = (topResponse.data || []).filter((item) => item.id !== id).slice(0, 3)
    }
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : '资讯加载失败',
      icon: 'none',
    })
  } finally {
    loading.value = false
  }
}

const openNews = (id: number) => {
  uni.redirectTo({
    url: `/pages/news/detail?id=${id}`,
  })
}

const goBack = () => {
  uni.navigateBack()
}

onLoad((query = {}) => {
  const id = Number(query.id)
  if (!id) {
    uni.showToast({
      title: '缺少资讯编号',
      icon: 'none',
    })
    return
  }

  loadDetail(id)
})

onShareAppMessage(() => ({
  title: newsDetail.value?.title || '桃源资讯详情',
  path: `/pages/news/detail?id=${newsDetail.value?.id || ''}`,
}))
</script>

<template>
  <view class="page-shell safe-bottom">
    <view class="page-padding">
      <ListSkeleton v-if="loading" mode="card" :rows="2" />

      <template v-else-if="newsDetail">
        <view class="hero glass-card">
          <image class="hero-cover" :src="resolveImage(newsDetail.coverImage, '/static/images/hero-news.jpg')" mode="aspectFill" />
          <view class="hero-copy">
            <text class="hero-tag">{{ newsDetail.categoryDesc || '乡村资讯' }}</text>
            <text class="hero-title">{{ newsDetail.title }}</text>
            <text class="hero-meta">
              {{ formatDateTime(newsDetail.publishTime || newsDetail.createdAt) }} ·
              {{ newsDetail.author || newsDetail.source || '新桃源智界' }}
            </text>
          </view>
        </view>

        <SectionBlock
          class="section-gap"
          eyebrow="Story"
          title="正文内容"
          subtitle="先快速看摘要，再继续阅读完整内容。"
        >
          <view class="summary-box">
            <text class="summary-text">{{ newsDetail.summary || '本条资讯暂无摘要，请继续查看下方正文。' }}</text>
          </view>
          <rich-text
            v-if="newsDetail.content"
            class="rich-body"
            :nodes="normalizeRichText(newsDetail.content)"
          />
          <text v-else class="fallback-body">{{ stripHtml(newsDetail.summary) || '暂无详细正文内容。' }}</text>
        </SectionBlock>

        <SectionBlock
          v-if="topNews.length"
          class="section-gap"
          eyebrow="More"
          title="继续看看"
          subtitle="这些是同样值得先看的热门资讯。"
        >
          <view class="more-list">
            <view v-for="item in topNews" :key="item.id" class="more-card glass-card" @tap="openNews(item.id)">
              <image class="more-cover" :src="resolveImage(item.coverImage, '/static/images/hero-news.jpg')" mode="aspectFill" />
              <view class="more-body">
                <text class="more-title text-ellipsis-2">{{ item.title }}</text>
                <text class="more-meta">{{ formatRelativeTime(item.publishTime || item.createdAt) }}</text>
              </view>
            </view>
          </view>
        </SectionBlock>
      </template>

      <EmptyState
        v-else
        title="资讯详情暂时不可用"
        description="请返回上一页重新进入，或稍后再试。"
        action-text="返回上一页"
        @action="goBack"
      />

      <AiFloatingButton :bottom-offset="AI_FAB_OFFSET.detail" />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.hero {
  overflow: hidden;
}

.hero-cover {
  width: 100%;
  height: 360rpx;
}

.hero-copy {
  padding: 28rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.hero-tag {
  font-size: 22rpx;
  color: $brand-blue;
}

.hero-title {
  font-size: 38rpx;
  line-height: 1.35;
  font-weight: 800;
  color: $text-primary;
}

.hero-meta {
  font-size: 22rpx;
  color: $text-muted;
  line-height: 1.6;
}

.summary-box {
  padding: 24rpx;
  border-radius: 24rpx;
  background: rgba(76, 143, 175, 0.08);
}

.summary-text,
.fallback-body {
  font-size: 26rpx;
  line-height: 1.8;
  color: $text-secondary;
}

.rich-body {
  margin-top: 24rpx;
  font-size: 26rpx;
  line-height: 1.8;
  color: $text-secondary;
}

.more-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.more-card {
  display: flex;
  gap: 18rpx;
  padding: 18rpx;
}

.more-cover {
  width: 180rpx;
  height: 144rpx;
  border-radius: 20rpx;
  flex-shrink: 0;
}

.more-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 12rpx;
}

.more-title {
  font-size: 28rpx;
  line-height: 1.5;
  font-weight: 700;
  color: $text-primary;
}

.more-meta {
  font-size: 22rpx;
  color: $text-muted;
}

@media screen and (max-width: 420px) {
  .more-card {
    flex-direction: column;
  }

  .more-cover {
    width: 100%;
    height: 220rpx;
  }
}
</style>

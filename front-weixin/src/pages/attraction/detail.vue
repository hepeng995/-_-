<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app'

import AiFloatingButton from '@/components/AiFloatingButton.vue'
import EmptyState from '@/components/EmptyState.vue'
import ListSkeleton from '@/components/ListSkeleton.vue'
import SectionBlock from '@/components/SectionBlock.vue'
import { attractionApi } from '@/api/attraction'
import type { Attraction } from '@/types/models'
import { AI_FAB_OFFSET } from '@/utils/ai-fab'
import { joinAddress, toNumber } from '@/utils/format'
import { parseImageList, resolveImage } from '@/utils/assets'

const loading = ref(true)
const attraction = ref<Attraction | null>(null)
const related = ref<Attraction[]>([])

const gallery = computed(() => {
  const images = parseImageList(attraction.value?.images)
  if (images.length) return images
  if (attraction.value?.coverImage) return [resolveImage(attraction.value.coverImage)]
  return ['/static/images/hero-scenic.jpg']
})

const locationText = computed(() => {
  if (!attraction.value) return '桃源县推荐景点'
  return joinAddress(attraction.value.address) || '桃源县推荐景点'
})

const loadDetail = async (id: number) => {
  loading.value = true
  try {
    const response = await attractionApi.getById(id)
    if (response.code !== 200 || !response.data) {
      throw new Error(response.message || '景点详情加载失败')
    }

    attraction.value = response.data

    if (response.data.categoryId) {
      const relatedResponse = await attractionApi.getByCategory(response.data.categoryId)
      if (relatedResponse.code === 200) {
        related.value = (relatedResponse.data || []).filter((item) => item.id !== id).slice(0, 3)
      }
    }
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : '景点加载失败',
      icon: 'none',
    })
  } finally {
    loading.value = false
  }
}

const previewImage = (current: string) => {
  uni.previewImage({
    current,
    urls: gallery.value,
  })
}

const openLocation = () => {
  if (!attraction.value?.latitude || !attraction.value?.longitude) {
    uni.showToast({
      title: '暂无地图定位信息',
      icon: 'none',
    })
    return
  }

  uni.openLocation({
    latitude: Number(attraction.value.latitude),
    longitude: Number(attraction.value.longitude),
    name: attraction.value.name,
    address: locationText.value,
  })
}

const openAnother = (id: number) => {
  uni.redirectTo({
    url: `/pages/attraction/detail?id=${id}`,
  })
}

const goBack = () => {
  uni.navigateBack()
}

onLoad((query = {}) => {
  const id = Number(query.id)
  if (!id) {
    uni.showToast({
      title: '缺少景点编号',
      icon: 'none',
    })
    return
  }

  loadDetail(id)
})

onShareAppMessage(() => ({
  title: attraction.value?.name || '桃源景点详情',
  path: `/pages/attraction/detail?id=${attraction.value?.id || ''}`,
}))
</script>

<template>
  <view class="page-shell safe-bottom">
    <view class="page-padding">
      <ListSkeleton v-if="loading" mode="card" :rows="2" />

      <template v-else-if="attraction">
        <view class="gallery glass-card">
          <swiper class="gallery-swiper" circular indicator-dots autoplay :interval="4000" :duration="500">
            <swiper-item v-for="item in gallery" :key="item">
              <image class="gallery-image" :src="item" mode="aspectFill" @tap="previewImage(item)" />
            </swiper-item>
          </swiper>
        </view>

        <SectionBlock
          class="section-gap"
          eyebrow="Scenic Detail"
          :title="attraction.name"
          :subtitle="`${attraction.categoryName || '景点导览'} · ${locationText}`"
        >
          <view class="meta-grid">
            <view class="meta-card">
              <text class="meta-label">评分</text>
              <text class="meta-value">{{ toNumber(attraction.rating).toFixed(1) }}</text>
            </view>
            <view class="meta-card">
              <text class="meta-label">门票</text>
              <text class="meta-value">{{ attraction.ticketPrice ? `￥${attraction.ticketPrice}` : '免费' }}</text>
            </view>
            <view class="meta-card">
              <text class="meta-label">状态</text>
              <text class="meta-value">{{ attraction.status === 1 ? '开放中' : '待开放' }}</text>
            </view>
          </view>

          <text class="body-copy">{{ attraction.description || '这里有自然风光，也有乡村故事，适合作为来桃源的第一站。' }}</text>

          <view class="info-block">
            <text class="info-title">开放时间</text>
            <text class="info-text">{{ attraction.openingHours || '以景区现场公告为准' }}</text>
          </view>
          <view class="info-block">
            <text class="info-title">交通指引</text>
            <text class="info-text">{{ attraction.trafficGuide || '建议自驾或按导航前往。' }}</text>
          </view>
        </SectionBlock>

        <SectionBlock
          v-if="related.length"
          class="section-gap"
          eyebrow="Nearby"
          title="同类景点"
          subtitle="如果你喜欢这一类风景，可以继续往下看。"
        >
          <view class="related-list">
            <view v-for="item in related" :key="item.id" class="related-card glass-card" @tap="openAnother(item.id)">
              <image class="related-cover" :src="resolveImage(item.coverImage, '/static/images/hero-scenic.jpg')" mode="aspectFill" />
              <view class="related-body">
                <text class="related-title text-ellipsis-1">{{ item.name }}</text>
                <text class="related-desc text-ellipsis-2">{{ item.description || '点击继续查看详情。' }}</text>
              </view>
            </view>
          </view>
        </SectionBlock>

        <view class="bottom-bar glass-card">
          <view class="bottom-copy">
            <text class="bottom-title">想去现场看看？</text>
            <text class="bottom-desc">打开地图，直接导航到景点位置。</text>
          </view>
          <button class="bottom-btn" @tap="openLocation">打开地图</button>
        </view>
      </template>

      <EmptyState
        v-else
        title="景点详情暂时不可用"
        description="请返回上一页重试，或稍后再查看。"
        action-text="返回上一页"
        @action="goBack"
      />

      <AiFloatingButton :bottom-offset="AI_FAB_OFFSET.detail" />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.gallery {
  overflow: hidden;
}

.gallery-swiper,
.gallery-image {
  width: 100%;
  height: 420rpx;
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16rpx;
}

.meta-card {
  padding: 20rpx;
  border-radius: 24rpx;
  background: rgba(31, 106, 69, 0.05);
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.meta-label {
  font-size: 22rpx;
  color: $text-muted;
}

.meta-value {
  font-size: 34rpx;
  font-weight: 800;
  color: $brand-green;
}

.body-copy {
  margin-top: 24rpx;
  display: block;
  font-size: 26rpx;
  line-height: 1.8;
  color: $text-secondary;
}

.info-block {
  margin-top: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.info-title {
  font-size: 24rpx;
  color: $brand-green;
  font-weight: 700;
}

.info-text {
  font-size: 24rpx;
  line-height: 1.7;
  color: $text-secondary;
}

.related-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.related-card {
  display: flex;
  gap: 18rpx;
  padding: 18rpx;
}

.related-cover {
  width: 180rpx;
  height: 148rpx;
  border-radius: 20rpx;
  flex-shrink: 0;
}

.related-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.related-title {
  font-size: 28rpx;
  font-weight: 700;
  color: $text-primary;
}

.related-desc {
  font-size: 24rpx;
  line-height: 1.6;
  color: $text-secondary;
}

.bottom-bar {
  margin-top: 28rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.bottom-copy {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.bottom-title {
  font-size: 28rpx;
  color: $text-primary;
  font-weight: 700;
}

.bottom-desc {
  font-size: 22rpx;
  color: $text-muted;
}

.bottom-btn {
  min-width: 176rpx;
  height: 76rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, $brand-green, $brand-green-soft);
  color: $text-inverse;
  font-size: 25rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media screen and (max-width: 420px) {
  .meta-grid {
    grid-template-columns: 1fr;
  }

  .bottom-bar,
  .related-card {
    flex-direction: column;
  }

  .related-cover {
    width: 100%;
    height: 220rpx;
  }
}
</style>

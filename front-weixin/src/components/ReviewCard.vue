<script setup lang="ts">
import type { ProductReview } from '@/types/models'
import { formatRelativeTime } from '@/utils/format'
import { parseImageList, resolveImage } from '@/utils/assets'

defineProps<{
  review: ProductReview
}>()

const emit = defineEmits<{
  (event: 'helpful', review: ProductReview): void
}>()
</script>

<template>
  <view class="review-card glass-card">
    <view class="head">
      <view class="identity">
        <text class="name">{{ review.isAnonymous ? '匿名用户' : review.realName || review.username || '桃源游客' }}</text>
        <text class="time">{{ formatRelativeTime(review.createdAt) }}</text>
      </view>
      <text class="rating">{{ '★'.repeat(Math.max(1, review.rating || 0)) }}</text>
    </view>
    <text class="content">{{ review.content || '这位用户没有留下文字评价。' }}</text>
    <scroll-view v-if="parseImageList(review.images).length" scroll-x enable-flex :show-scrollbar="false">
      <view class="images">
        <image v-for="item in parseImageList(review.images)" :key="item" class="thumb" :src="resolveImage(item)" mode="aspectFill" />
      </view>
    </scroll-view>
    <view v-if="review.replyContent" class="reply-box">
      <text class="reply-title">商家回复</text>
      <text class="reply-text">{{ review.replyContent }}</text>
    </view>
    <view class="actions">
      <button class="helpful-btn" @tap="emit('helpful', review)">{{ review.isHelpful ? '已觉得有用' : '觉得有用' }} {{ review.helpfulCount || 0 }}</button>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.review-card {
  padding: 22rpx;
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.head,
.actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}

.identity {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.name {
  font-size: 26rpx;
  color: $text-primary;
  font-weight: 800;
}

.time {
  font-size: 22rpx;
  color: $text-muted;
}

.rating {
  color: $brand-gold;
  font-size: 26rpx;
}

.content,
.reply-text {
  font-size: 24rpx;
  line-height: 1.7;
  color: $text-secondary;
}

.images {
  display: inline-flex;
  gap: 14rpx;
}

.thumb {
  width: 140rpx;
  height: 140rpx;
  border-radius: 18rpx;
}

.reply-box {
  padding: 18rpx;
  border-radius: 20rpx;
  background: rgba(31, 106, 69, 0.06);
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.reply-title {
  font-size: 22rpx;
  color: $brand-green;
  font-weight: 700;
}

.helpful-btn {
  min-width: 160rpx;
  height: 54rpx;
  border-radius: 999rpx;
  background: rgba(31, 106, 69, 0.08);
  color: $brand-green;
  font-size: 22rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>

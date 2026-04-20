<script setup lang="ts">
import type { ForumPost } from '@/types/models'
import { formatRelativeTime } from '@/utils/format'
import { parseImageList, resolveImage } from '@/utils/assets'
import StatusTag from './StatusTag.vue'

defineProps<{
  post: ForumPost
}>()

const emit = defineEmits<{
  (event: 'click'): void
  (event: 'like'): void
}>()
</script>

<template>
  <view class="post-card glass-card" @tap="emit('click')">
    <view class="head">
      <view class="tags">
        <StatusTag v-if="post.isTop" text="置顶" kind="danger" />
        <StatusTag v-if="post.isFeatured" text="推荐" kind="warning" />
        <StatusTag :text="post.categoryDesc || '乡村建言'" kind="success" />
      </view>
      <text class="time">{{ formatRelativeTime(post.createdAt) }}</text>
    </view>
    <text class="title text-ellipsis-2">{{ post.title }}</text>
    <text class="content text-ellipsis-3">{{ post.content }}</text>
    <image
      v-if="parseImageList(post.images).length"
      class="cover"
      :src="resolveImage(parseImageList(post.images)[0])"
      mode="aspectFill"
    />
    <view class="foot">
      <text class="author">{{ post.realName || post.username || '桃源村民' }}</text>
      <view class="stats">
        <text>浏览 {{ post.viewCount || 0 }}</text>
        <button class="like-btn" @tap.stop="emit('like')">{{ post.isLiked ? '已赞' : '点赞' }} {{ post.likeCount || 0 }}</button>
        <text>评论 {{ post.commentCount || 0 }}</text>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.post-card {
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.head,
.tags,
.foot,
.stats {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.head,
.foot {
  justify-content: space-between;
}

.tags,
.stats {
  flex-wrap: wrap;
}

.time,
.author,
.stats text {
  font-size: 22rpx;
  color: $text-muted;
}

.title {
  font-size: 30rpx;
  color: $text-primary;
  font-weight: 800;
  line-height: 1.45;
}

.content {
  font-size: 24rpx;
  line-height: 1.7;
  color: $text-secondary;
}

.cover {
  width: 100%;
  height: 260rpx;
  border-radius: 24rpx;
}

.like-btn {
  min-width: 112rpx;
  height: 50rpx;
  padding: 0 16rpx;
  border-radius: 999rpx;
  background: rgba(31, 106, 69, 0.08);
  color: $brand-green;
  font-size: 22rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>

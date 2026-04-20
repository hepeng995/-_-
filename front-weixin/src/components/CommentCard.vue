<script setup lang="ts">
import type { ForumComment } from '@/types/models'
import { formatRelativeTime } from '@/utils/format'

defineProps<{
  comment: ForumComment
}>()

const emit = defineEmits<{
  (event: 'like', comment: ForumComment): void
  (event: 'reply', comment: ForumComment): void
}>()
</script>

<template>
  <view class="comment-card glass-card">
    <view class="head">
      <text class="name">{{ comment.realName || comment.username || '桃源村民' }}</text>
      <text class="time">{{ formatRelativeTime(comment.createdAt) }}</text>
    </view>
    <text class="content">{{ comment.content }}</text>
    <view class="actions">
      <button class="action-btn" @tap="emit('like', comment)">{{ comment.isLiked ? '已赞' : '点赞' }} {{ comment.likeCount || 0 }}</button>
      <button class="action-btn" @tap="emit('reply', comment)">回复</button>
    </view>
    <view v-if="comment.replies?.length" class="reply-list">
      <view v-for="reply in comment.replies" :key="reply.id" class="reply-item">
        <text class="reply-meta">{{ reply.realName || reply.username || '村民' }} · {{ formatRelativeTime(reply.createdAt) }}</text>
        <text class="reply-text">{{ reply.content }}</text>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.comment-card {
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

.name {
  font-size: 26rpx;
  color: $text-primary;
  font-weight: 800;
}

.time,
.reply-meta {
  font-size: 22rpx;
  color: $text-muted;
}

.content,
.reply-text {
  font-size: 24rpx;
  line-height: 1.7;
  color: $text-secondary;
}

.reply-list {
  padding: 18rpx;
  border-radius: 22rpx;
  background: rgba(31, 106, 69, 0.05);
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.action-btn {
  min-width: 112rpx;
  height: 50rpx;
  border-radius: 999rpx;
  background: rgba(31, 106, 69, 0.08);
  color: $brand-green;
  font-size: 22rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>

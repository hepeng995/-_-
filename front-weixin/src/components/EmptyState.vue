<script setup lang="ts">
defineProps<{
  title: string
  description?: string
  actionText?: string
}>()

const emit = defineEmits<{
  (event: 'action'): void
}>()
</script>

<template>
  <view class="empty-state glass-card">
    <image class="cover" src="/static/images/mascot.png" mode="aspectFill" />
    <text class="title">{{ title }}</text>
    <text v-if="description" class="description">{{ description }}</text>
    <button v-if="actionText" class="action-btn" @tap="emit('action')">{{ actionText }}</button>
  </view>
</template>

<style lang="scss" scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18rpx;
  padding: 40rpx 32rpx;
  text-align: center;
}

.cover {
  width: 120rpx;
  height: 120rpx;
  border-radius: 36rpx;
  box-shadow: $shadow-soft;
}

.title {
  font-size: 32rpx;
  font-weight: 700;
  color: $text-primary;
}

.description {
  font-size: 24rpx;
  color: $text-secondary;
  line-height: 1.6;
}

.action-btn {
  margin-top: 4rpx;
  min-width: 220rpx;
  height: 76rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, $brand-green, $brand-green-soft);
  color: $text-inverse;
  font-size: 26rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

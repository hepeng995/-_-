<script setup lang="ts">
withDefaults(
  defineProps<{
    mode?: 'card' | 'grid'
    rows?: number
  }>(),
  {
    mode: 'card',
    rows: 3,
  },
)
</script>

<template>
  <view class="skeleton" :class="mode === 'grid' ? 'grid' : 'list'">
    <view v-for="row in rows" :key="row" class="item glass-card">
      <view class="thumb shimmer" />
      <view class="content">
        <view class="line shimmer line-lg" />
        <view class="line shimmer" />
        <view class="line shimmer line-sm" />
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.skeleton.list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.skeleton.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20rpx;
}

.item {
  overflow: hidden;
}

.thumb {
  width: 100%;
  height: 220rpx;
}

.content {
  padding: 20rpx;
}

.line {
  height: 24rpx;
  border-radius: 999rpx;
  margin-bottom: 14rpx;
}

.line-lg {
  width: 82%;
}

.line-sm {
  width: 48%;
}

.shimmer {
  background: linear-gradient(90deg, rgba(31, 106, 69, 0.06) 25%, rgba(31, 106, 69, 0.14) 38%, rgba(31, 106, 69, 0.06) 55%);
  background-size: 400% 100%;
  animation: shimmer 1.6s ease infinite;
}

@keyframes shimmer {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}
</style>

<script setup lang="ts">
defineProps<{
  label: string
  value?: string
  hint?: string
}>()

const emit = defineEmits<{
  (event: 'click'): void
}>()
</script>

<template>
  <view class="action-cell glass-card" @tap="emit('click')">
    <view class="copy">
      <text class="label">{{ label }}</text>
      <text v-if="hint" class="hint">{{ hint }}</text>
    </view>
    <view class="meta">
      <text v-if="value" class="value text-ellipsis-1">{{ value }}</text>
      <text class="arrow">›</text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.action-cell {
  padding: 24rpx 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
}

.copy {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.label {
  font-size: 28rpx;
  color: $text-primary;
  font-weight: 700;
}

.hint {
  font-size: 22rpx;
  color: $text-muted;
}

.meta {
  display: flex;
  align-items: center;
  gap: 12rpx;
  color: $text-muted;
}

.value {
  max-width: 220rpx;
  font-size: 22rpx;
}

.arrow {
  font-size: 34rpx;
  line-height: 1;
}
</style>

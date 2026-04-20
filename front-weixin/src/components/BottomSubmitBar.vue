<script setup lang="ts">
defineProps<{
  buttonText: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  (event: 'submit'): void
}>()
</script>

<template>
  <view class="bottom-submit glass-card">
    <view class="info">
      <slot />
    </view>
    <button class="submit-btn" :disabled="disabled" @tap="emit('submit')">{{ buttonText }}</button>
  </view>
</template>

<style lang="scss" scoped>
.bottom-submit {
  position: fixed;
  left: 24rpx;
  right: 24rpx;
  bottom: calc(env(safe-area-inset-bottom) + 20rpx);
  padding: 18rpx 20rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
  z-index: 20;
}

.info {
  flex: 1;
  min-width: 0;
}

.submit-btn {
  min-width: 220rpx;
  height: 80rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, $brand-green, $brand-green-soft);
  color: $text-inverse;
  font-size: 26rpx;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.submit-btn[disabled] {
  opacity: 0.56;
}
</style>

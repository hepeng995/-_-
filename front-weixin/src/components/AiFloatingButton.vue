<script setup lang="ts">
import { computed } from 'vue'

import { appConfig } from '@/config/app'

const props = withDefaults(
  defineProps<{
    bottomOffset?: string
  }>(),
  {
    bottomOffset: '34rpx',
  },
)

const fabStyle = computed(() => ({
  bottom: `calc(env(safe-area-inset-bottom) + ${props.bottomOffset})`,
}))

const openAiPage = () => {
  uni.navigateTo({
    url: '/pages-ai/index',
  })
}
</script>

<template>
  <view v-if="appConfig.enableAI" class="ai-fab-shell" :style="fabStyle">
    <button class="ai-fab" @tap="openAiPage">
      <view class="seal">
        <text class="seal-text">AI</text>
      </view>
      <view class="copy">
        <text class="eyebrow">桃源智界</text>
        <text class="label">问一句</text>
      </view>
    </button>
  </view>
</template>

<style lang="scss" scoped>
.ai-fab-shell {
  position: fixed;
  right: 24rpx;
  z-index: 60;
  width: 188rpx;
  height: 92rpx;
  animation: fab-entry 0.32s ease-out both;
}

.ai-fab {
  width: 100%;
  height: 100%;
  padding: 0 16rpx 0 14rpx;
  border-radius: 999rpx;
  background:
    radial-gradient(circle at 16% 20%, rgba(255, 252, 246, 0.72), transparent 24%),
    linear-gradient(135deg, rgba(31, 106, 69, 0.96), rgba(94, 158, 137, 0.92));
  box-shadow: 0 10rpx 22rpx rgba(24, 58, 38, 0.14);
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.seal {
  width: 62rpx;
  height: 62rpx;
  border-radius: 31rpx;
  background:
    radial-gradient(circle at 30% 30%, rgba(255, 250, 240, 0.92), rgba(243, 232, 206, 0.88)),
    linear-gradient(135deg, rgba(214, 139, 42, 0.92), rgba(245, 196, 118, 0.78));
  box-shadow: 0 6rpx 12rpx rgba(14, 42, 27, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.seal-text {
  font-size: 24rpx;
  letter-spacing: 2rpx;
  color: #31523f;
  font-weight: 900;
}

.copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4rpx;
}

.eyebrow {
  font-size: 18rpx;
  letter-spacing: 3rpx;
  color: rgba(255, 250, 240, 0.76);
}

.label {
  font-size: 28rpx;
  line-height: 1;
  color: #fffaf0;
  font-weight: 800;
}

@keyframes fab-entry {
  from {
    opacity: 0;
    transform: translate3d(0, 12rpx, 0) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
}
</style>

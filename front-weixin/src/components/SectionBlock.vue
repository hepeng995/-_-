<script setup lang="ts">
defineProps<{
  eyebrow?: string
  title: string
  subtitle?: string
}>()
</script>

<template>
  <view class="section-block glass-card">
    <view class="section-head">
      <view class="copy">
        <text v-if="eyebrow" class="eyebrow">{{ eyebrow }}</text>
        <text class="title">{{ title }}</text>
        <text v-if="subtitle" class="subtitle">{{ subtitle }}</text>
      </view>
      <view v-if="$slots.action" class="action">
        <slot name="action" />
      </view>
    </view>
    <view class="section-body">
      <slot />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.section-block {
  padding: 28rpx;
}

.section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24rpx;
  margin-bottom: 24rpx;
}

.copy {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.eyebrow {
  color: $brand-gold;
  font-size: 22rpx;
  letter-spacing: 4rpx;
  text-transform: uppercase;
}

.title {
  font-size: 36rpx;
  line-height: 1.2;
  font-weight: 700;
  color: $text-primary;
}

.subtitle {
  color: $text-secondary;
  font-size: 24rpx;
  line-height: 1.5;
}

.action {
  flex-shrink: 0;
}
</style>

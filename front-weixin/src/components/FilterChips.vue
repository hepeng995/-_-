<script setup lang="ts">
import type { ChipOption } from '@/types/models'

defineProps<{
  options: ChipOption[]
  modelValue: string | number | null
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: string | number | null): void
}>()

const choose = (value: string | number | null) => {
  emit('update:modelValue', value)
}
</script>

<template>
  <scroll-view class="chips-scroll" scroll-x enable-flex :show-scrollbar="false">
    <view class="chips-row">
      <button
        v-for="item in options"
        :key="`${item.label}-${item.value}`"
        class="chip"
        :class="{ active: modelValue === item.value }"
        @tap="choose(item.value)"
      >
        {{ item.label }}
      </button>
    </view>
  </scroll-view>
</template>

<style lang="scss" scoped>
.chips-scroll {
  width: 100%;
}

.chips-row {
  display: inline-flex;
  align-items: center;
  gap: 16rpx;
  min-width: 100%;
}

.chip {
  flex-shrink: 0;
  padding: 0 28rpx;
  height: 64rpx;
  border-radius: 999rpx;
  background: $chip-bg;
  color: $text-secondary;
  font-size: 24rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.chip.active {
  background: linear-gradient(135deg, $brand-green, $brand-green-soft);
  color: $text-inverse;
  box-shadow: 0 12rpx 30rpx rgba(31, 106, 69, 0.18);
}
</style>

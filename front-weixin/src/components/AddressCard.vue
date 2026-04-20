<script setup lang="ts">
import type { Address } from '@/types/models'

defineProps<{
  address: Address
  selected?: boolean
  compact?: boolean
}>()

const emit = defineEmits<{
  (event: 'click'): void
  (event: 'edit'): void
  (event: 'delete'): void
  (event: 'default'): void
}>()
</script>

<template>
  <view class="address-card glass-card" :class="{ selected }" @tap="emit('click')">
    <view class="header">
      <view class="identity">
        <text class="name">{{ address.receiverName }}</text>
        <text class="phone">{{ address.receiverPhone }}</text>
      </view>
      <text v-if="address.isDefault" class="default-badge">默认</text>
    </view>
    <text class="detail">{{ address.province }} {{ address.city }} {{ address.district }} {{ address.detailAddress }}</text>
    <view v-if="!compact" class="actions">
      <button class="action-btn" @tap.stop="emit('edit')">编辑</button>
      <button class="action-btn" @tap.stop="emit('default')">{{ address.isDefault ? '默认地址' : '设为默认' }}</button>
      <button class="action-btn danger" @tap.stop="emit('delete')">删除</button>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.address-card {
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 14rpx;
  border: 1rpx solid transparent;
}

.address-card.selected {
  border-color: rgba(31, 106, 69, 0.22);
  box-shadow: 0 18rpx 40rpx rgba(31, 106, 69, 0.14);
}

.header,
.identity,
.actions {
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.header {
  justify-content: space-between;
}

.name {
  font-size: 28rpx;
  color: $text-primary;
  font-weight: 800;
}

.phone {
  font-size: 24rpx;
  color: $text-secondary;
}

.default-badge {
  padding: 0 16rpx;
  height: 44rpx;
  border-radius: 999rpx;
  background: rgba(31, 106, 69, 0.12);
  color: $brand-green;
  font-size: 20rpx;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
}

.detail {
  font-size: 24rpx;
  color: $text-secondary;
  line-height: 1.7;
}

.actions {
  flex-wrap: wrap;
}

.action-btn {
  min-width: 120rpx;
  height: 56rpx;
  padding: 0 20rpx;
  border-radius: 999rpx;
  background: rgba(31, 106, 69, 0.08);
  color: $brand-green;
  font-size: 22rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.action-btn.danger {
  background: rgba(184, 80, 66, 0.08);
  color: $brand-danger;
}
</style>

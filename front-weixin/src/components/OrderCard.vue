<script setup lang="ts">
import type { Order } from '@/types/models'
import { resolveImage } from '@/utils/assets'
import { formatDateTime, formatPrice, orderStatusText } from '@/utils/format'
import StatusTag from './StatusTag.vue'

defineProps<{
  order: Order
}>()

const emit = defineEmits<{
  (event: 'detail'): void
  (event: 'pay'): void
  (event: 'cancel'): void
  (event: 'confirm'): void
  (event: 'review'): void
}>()

const statusKind = (status?: number) => {
  if (status === 4) return 'success'
  if (status === 5 || status === 6) return 'danger'
  if (status === 1) return 'warning'
  return 'info'
}
</script>

<template>
  <view class="order-card glass-card">
    <view class="head">
      <view class="copy">
        <text class="order-no">{{ order.orderNo }}</text>
        <text class="order-time">{{ formatDateTime(order.createdAt) }}</text>
      </view>
      <StatusTag :text="orderStatusText(order.orderStatus)" :kind="statusKind(order.orderStatus)" />
    </view>

    <view class="items">
      <view v-for="item in order.orderItems" :key="`${order.id}-${item.productId}`" class="item">
        <image class="cover" :src="resolveImage(item.productImage, '/static/images/hero-product.jpg')" mode="aspectFill" />
        <view class="meta">
          <text class="name text-ellipsis-2">{{ item.productName }}</text>
          <text class="brief">{{ formatPrice(item.productPrice) }} × {{ item.quantity }}</text>
        </view>
      </view>
    </view>

    <view class="foot">
      <view class="summary">
        <text class="count">共 {{ order.orderItems.length }} 件</text>
        <text class="amount">{{ formatPrice(order.actualAmount || order.totalAmount) }}</text>
      </view>
      <view class="actions">
        <button class="action-btn" @tap="emit('detail')">详情</button>
        <button v-if="order.orderStatus === 1" class="action-btn" @tap="emit('cancel')">取消</button>
        <button v-if="order.orderStatus === 1" class="action-btn primary" @tap="emit('pay')">去支付</button>
        <button v-if="order.orderStatus === 3" class="action-btn primary" @tap="emit('confirm')">确认收货</button>
        <button v-if="order.orderStatus === 4" class="action-btn primary" @tap="emit('review')">去评价</button>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.order-card {
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.head,
.foot,
.summary,
.actions,
.item {
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.head,
.foot {
  justify-content: space-between;
}

.copy,
.meta,
.summary {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.order-no,
.name,
.amount {
  color: $text-primary;
  font-weight: 800;
}

.order-no,
.name {
  font-size: 26rpx;
}

.order-time,
.brief,
.count {
  font-size: 22rpx;
  color: $text-muted;
}

.amount {
  font-size: 32rpx;
  color: $brand-gold;
}

.cover {
  width: 112rpx;
  height: 88rpx;
  border-radius: 18rpx;
  flex-shrink: 0;
}

.items {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.actions {
  flex-wrap: wrap;
  justify-content: flex-end;
}

.action-btn {
  min-width: 120rpx;
  height: 56rpx;
  padding: 0 18rpx;
  border-radius: 999rpx;
  background: rgba(31, 106, 69, 0.08);
  color: $brand-green;
  font-size: 22rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.action-btn.primary {
  background: linear-gradient(135deg, $brand-green, $brand-green-soft);
  color: $text-inverse;
}
</style>

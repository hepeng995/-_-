<script setup lang="ts">
import type { Product } from '@/types/models'

import { formatPrice, toNumber } from '@/utils/format'
import { resolveImage } from '@/utils/assets'

const props = defineProps<{
  product: Product
}>()

const emit = defineEmits<{
  (event: 'click', product: Product): void
  (event: 'add', product: Product): void
}>()
</script>

<template>
  <view class="product-card glass-card" @tap="emit('click', product)">
    <image class="cover" :src="resolveImage(product.coverImage, '/static/images/hero-product.jpg')" mode="aspectFill" />
    <view class="badge-row">
      <text v-if="product.isFeatured" class="badge">推荐</text>
      <text v-if="toNumber(product.salesCount) > 9" class="badge warm">热销</text>
    </view>
    <view class="body">
      <text class="category text-ellipsis-1">{{ product.categoryName || '桃源好物' }}</text>
      <text class="name text-ellipsis-2">{{ product.name }}</text>
      <text class="desc text-ellipsis-2">{{ product.description || '把乡野风味装进一份真诚的土产。' }}</text>
      <view class="meta-row">
        <text class="price">{{ formatPrice(product.price) }}</text>
        <text class="sales">已售 {{ toNumber(product.salesCount) }}</text>
      </view>
      <view class="footer">
        <text class="origin text-ellipsis-1">{{ product.origin || '桃源县直供' }}</text>
        <button class="cart-btn" @tap.stop="emit('add', product)">加购</button>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.product-card {
  overflow: hidden;
  position: relative;
}

.cover {
  width: 100%;
  height: 240rpx;
  display: block;
}

.badge-row {
  position: absolute;
  top: 18rpx;
  left: 18rpx;
  display: flex;
  gap: 10rpx;
}

.badge {
  min-width: 72rpx;
  padding: 0 14rpx;
  height: 40rpx;
  border-radius: 999rpx;
  background: rgba(31, 106, 69, 0.88);
  color: $text-inverse;
  font-size: 20rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge.warm {
  background: rgba(214, 139, 42, 0.92);
}

.body {
  padding: 20rpx 20rpx 22rpx;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.category {
  font-size: 20rpx;
  color: $brand-green-soft;
  letter-spacing: 2rpx;
}

.name {
  font-size: 30rpx;
  line-height: 1.35;
  font-weight: 700;
  color: $text-primary;
}

.desc {
  font-size: 22rpx;
  color: $text-secondary;
  line-height: 1.6;
  min-height: 70rpx;
}

.meta-row,
.footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}

.price {
  font-size: 30rpx;
  font-weight: 700;
  color: $brand-gold;
}

.sales,
.origin {
  font-size: 22rpx;
  color: $text-muted;
}

.cart-btn {
  min-width: 112rpx;
  height: 56rpx;
  padding: 0 20rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, rgba(31, 106, 69, 0.12), rgba(94, 158, 137, 0.18));
  color: $brand-green;
  font-size: 22rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

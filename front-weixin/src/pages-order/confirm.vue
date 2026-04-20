<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

import AiFloatingButton from '@/components/AiFloatingButton.vue'
import AddressCard from '@/components/AddressCard.vue'
import BottomSubmitBar from '@/components/BottomSubmitBar.vue'
import SectionBlock from '@/components/SectionBlock.vue'
import { addressApi } from '@/api/address'
import { orderApi } from '@/api/order'
import type { Address, OrderItem } from '@/types/models'
import { AI_FAB_OFFSET } from '@/utils/ai-fab'
import { resolveImage } from '@/utils/assets'
import { formatPrice, toNumber } from '@/utils/format'

const loading = ref(true)
const submitting = ref(false)
const selectedAddress = ref<Address | null>(null)
const addresses = ref<Address[]>([])
const orderItems = ref<OrderItem[]>([])
const createMode = ref<'buy_now' | 'cart'>('buy_now')
const delivery = ref<'standard' | 'express'>('standard')
const paymentMethod = ref<'wechat' | 'alipay'>('wechat')
const remark = ref('')

const totalAmount = computed(() => orderItems.value.reduce((sum, item) => sum + toNumber(item.productPrice || item.price) * item.quantity, 0))
const deliveryFee = computed(() => (delivery.value === 'express' ? 10 : 0))
const finalAmount = computed(() => totalAmount.value + deliveryFee.value)
const openAddressCreate = () => {
  uni.navigateTo({ url: '/pages-user/address-edit' })
}

const loadAddresses = async () => {
  const response = await addressApi.getList()
  if (response.code === 200) {
    addresses.value = response.data || []
    selectedAddress.value = addresses.value.find((item) => item.isDefault) || addresses.value[0] || null
  }
}

const loadOrderItems = async (query: Record<string, string>) => {
  createMode.value = query.type === 'cart' ? 'cart' : 'buy_now'
  if (createMode.value === 'cart') {
    const ids = String(query.cartIds || '')
      .split(',')
      .map((item) => Number(item))
      .filter(Boolean)
    const response = await orderApi.getCartItemsForOrder(ids)
    if (response.code === 200) orderItems.value = response.data || []
    return
  }
  const response = await orderApi.getProductForOrder(Number(query.productId), {
    quantity: Number(query.quantity || 1),
    specification: query.specification,
  })
  if (response.code === 200 && response.data) orderItems.value = [response.data]
}

const submit = async () => {
  if (!selectedAddress.value || !orderItems.value.length) {
    uni.showToast({ title: '请完善订单信息', icon: 'none' })
    return
  }
  submitting.value = true
  try {
    const address = selectedAddress.value
    const basePayload = {
      deliveryAddress: `${address.province} ${address.city} ${address.district} ${address.detailAddress}`,
      deliveryName: address.receiverName,
      deliveryPhone: address.receiverPhone,
      paymentMethod: paymentMethod.value,
      totalAmount: finalAmount.value,
      actualAmount: finalAmount.value,
      discountAmount: 0,
      remark: remark.value,
    }
    const response = createMode.value === 'cart'
      ? await orderApi.createFromCart({
          ...basePayload,
          productIds: orderItems.value.map((item) => item.productId),
        })
      : await orderApi.create({
          ...basePayload,
          orderItems: orderItems.value,
        })
    if (response.code !== 200 || !response.data) throw new Error(response.message || '下单失败')
    uni.redirectTo({
      url: `/pages-order/pay?orderNo=${response.data.orderNo}&amount=${response.data.actualAmount || response.data.totalAmount}&paymentMethod=${paymentMethod.value}`,
    })
  } catch (error) {
    uni.showToast({ title: error instanceof Error ? error.message : '下单失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}

onLoad(async (query = {}) => {
  loading.value = true
  try {
    await Promise.all([loadAddresses(), loadOrderItems(query as Record<string, string>)])
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <view class="page-shell safe-bottom">
    <view class="page-padding page-body">
      <SectionBlock eyebrow="Address" title="收货地址" subtitle="选择一个用于本次订单的收货地址">
        <view v-if="addresses.length" class="address-list">
          <AddressCard
            v-for="item in addresses"
            :key="item.id"
            :address="item"
            :selected="selectedAddress?.id === item.id"
            compact
            @click="selectedAddress = item"
          />
        </view>
        <button v-else class="plain-btn" @tap="openAddressCreate">先新增地址</button>
      </SectionBlock>

      <SectionBlock class="section-gap" eyebrow="Items" title="商品清单" subtitle="确认你准备带走的桃源好物">
        <view class="item-list">
          <view v-for="item in orderItems" :key="`${item.productId}-${item.id}`" class="item-row">
            <image class="cover" :src="resolveImage(item.productImage, '/static/images/hero-product.jpg')" mode="aspectFill" />
            <view class="meta">
              <text class="name text-ellipsis-2">{{ item.productName }}</text>
              <text class="brief">{{ formatPrice(item.productPrice || item.price) }} × {{ item.quantity }}</text>
            </view>
          </view>
        </view>
      </SectionBlock>

      <SectionBlock class="section-gap" eyebrow="Payment" title="支付与配送" subtitle="这版支付为演示支付，不会产生真实扣款">
        <view class="choice-row">
          <button class="choice-btn" :class="{ active: paymentMethod === 'wechat' }" @tap="paymentMethod = 'wechat'">微信支付</button>
          <button class="choice-btn" :class="{ active: paymentMethod === 'alipay' }" @tap="paymentMethod = 'alipay'">支付宝</button>
        </view>
        <view class="choice-row">
          <button class="choice-btn" :class="{ active: delivery === 'standard' }" @tap="delivery = 'standard'">标准配送</button>
          <button class="choice-btn" :class="{ active: delivery === 'express' }" @tap="delivery = 'express'">快速配送 +10</button>
        </view>
        <textarea v-model.trim="remark" class="remark" placeholder="选填，可以留言给商家或配送方" />
      </SectionBlock>
    </view>

    <BottomSubmitBar :button-text="submitting ? '提交中...' : '提交订单'" :disabled="submitting || !selectedAddress || !orderItems.length" @submit="submit">
      <view class="summary">
        <text class="summary-title">应付金额</text>
        <text class="summary-amount">{{ formatPrice(finalAmount) }}</text>
      </view>
    </BottomSubmitBar>

    <AiFloatingButton :bottom-offset="AI_FAB_OFFSET.elevated" />
  </view>
</template>

<style lang="scss" scoped>
.page-body {
  padding-bottom: calc(env(safe-area-inset-bottom) + 180rpx);
}

.address-list,
.item-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.item-row,
.meta,
.summary {
  display: flex;
  gap: 16rpx;
}

.item-row {
  align-items: center;
}

.cover {
  width: 120rpx;
  height: 96rpx;
  border-radius: 18rpx;
  flex-shrink: 0;
}

.meta,
.summary {
  flex: 1;
  min-width: 0;
  flex-direction: column;
}

.name {
  font-size: 26rpx;
  color: $text-primary;
  font-weight: 800;
}

.brief,
.summary-title {
  font-size: 22rpx;
  color: $text-muted;
}

.summary-amount {
  font-size: 34rpx;
  color: $brand-gold;
  font-weight: 800;
}

.choice-row {
  display: flex;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.choice-btn,
.plain-btn {
  min-width: 180rpx;
  height: 66rpx;
  padding: 0 22rpx;
  border-radius: 999rpx;
  background: rgba(31, 106, 69, 0.06);
  color: $brand-green;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.choice-btn.active {
  background: linear-gradient(135deg, $brand-green, $brand-green-soft);
  color: $text-inverse;
}

.remark {
  width: 100%;
  min-height: 140rpx;
  padding: 18rpx 22rpx;
  border-radius: 22rpx;
  background: rgba(31, 106, 69, 0.05);
  font-size: 24rpx;
}
</style>

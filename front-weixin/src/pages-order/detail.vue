<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

import AiFloatingButton from '@/components/AiFloatingButton.vue'
import EmptyState from '@/components/EmptyState.vue'
import OrderCard from '@/components/OrderCard.vue'
import SectionBlock from '@/components/SectionBlock.vue'
import { orderApi } from '@/api/order'
import type { Order } from '@/types/models'
import { AI_FAB_OFFSET } from '@/utils/ai-fab'
import { formatPrice } from '@/utils/format'

const loading = ref(true)
const order = ref<Order | null>(null)

const loadOrder = async (id: number) => {
  loading.value = true
  try {
    const response = await orderApi.getById(id)
    if (response.code !== 200 || !response.data) throw new Error(response.message || '订单加载失败')
    order.value = response.data
  } catch (error) {
    uni.showToast({ title: error instanceof Error ? error.message : '订单加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const payOrder = (current: Order) => {
  uni.navigateTo({ url: `/pages-order/pay?orderNo=${current.orderNo}&amount=${current.actualAmount || current.totalAmount}&paymentMethod=${current.paymentMethod || 'wechat'}` })
}

const cancelOrder = async (current: Order) => {
  await orderApi.cancel(current.id)
  loadOrder(current.id)
}

const confirmOrder = async (current: Order) => {
  await orderApi.confirm(current.id)
  loadOrder(current.id)
}

const reviewOrder = (current: Order) => {
  const first = current.orderItems[0]
  if (!first) return
  uni.navigateTo({ url: `/pages-review/create?productId=${first.productId}&orderId=${current.id}&productName=${encodeURIComponent(first.productName)}` })
}

const goBack = () => {
  uni.navigateBack()
}

onLoad((query = {}) => {
  const id = Number(query.id)
  if (id) loadOrder(id)
})
</script>

<template>
  <view class="page-shell safe-bottom">
    <view class="page-padding">
      <OrderCard
        v-if="order"
        :order="order"
        @pay="payOrder(order)"
        @cancel="cancelOrder(order)"
        @confirm="confirmOrder(order)"
        @review="reviewOrder(order)"
      />

      <template v-if="order">
        <SectionBlock class="section-gap" eyebrow="Delivery" title="收货信息" subtitle="订单配送与联系人信息">
          <view class="info-list">
            <text class="info-item">收货人：{{ order.deliveryName }}</text>
            <text class="info-item">联系电话：{{ order.deliveryPhone }}</text>
            <text class="info-item">收货地址：{{ order.deliveryAddress }}</text>
            <text v-if="order.remark" class="info-item">订单备注：{{ order.remark }}</text>
          </view>
        </SectionBlock>

        <SectionBlock class="section-gap" eyebrow="Amount" title="金额明细" subtitle="本次订单费用构成">
          <view class="info-list">
            <text class="info-item">商品总额：{{ formatPrice(order.totalAmount) }}</text>
            <text class="info-item">优惠金额：{{ formatPrice(order.discountAmount || 0) }}</text>
            <text class="info-item strong">实付金额：{{ formatPrice(order.actualAmount || order.totalAmount) }}</text>
          </view>
        </SectionBlock>
      </template>

      <EmptyState
        v-else-if="!loading"
        class="section-gap"
        title="订单暂时不可用"
        description="请返回上一页重新进入。"
        action-text="返回订单列表"
        @action="goBack"
      />

      <AiFloatingButton :bottom-offset="AI_FAB_OFFSET.detail" />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.info-list {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.info-item {
  font-size: 24rpx;
  line-height: 1.7;
  color: $text-secondary;
}

.info-item.strong {
  font-size: 28rpx;
  font-weight: 800;
  color: $brand-gold;
}
</style>

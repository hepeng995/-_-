<script setup lang="ts">
import { ref } from 'vue'
import { onPullDownRefresh, onShow } from '@dcloudio/uni-app'

import AiFloatingButton from '@/components/AiFloatingButton.vue'
import EmptyState from '@/components/EmptyState.vue'
import FilterChips from '@/components/FilterChips.vue'
import OrderCard from '@/components/OrderCard.vue'
import { orderApi } from '@/api/order'
import { ORDER_FILTER_OPTIONS } from '@/utils/options'
import type { Order } from '@/types/models'
import { useAuthStore } from '@/stores/auth'
import { AI_FAB_OFFSET } from '@/utils/ai-fab'
import { goToLogin } from '@/utils/nav'

const authStore = useAuthStore()
const loading = ref(false)
const orders = ref<Order[]>([])
const activeStatus = ref<number | null>(null)

const updateStatus = (value: string | number | null) => {
  activeStatus.value = typeof value === 'number' ? value : null
  loadOrders()
}

const goShop = () => {
  uni.switchTab({ url: '/pages/shop/index' })
}

const loadOrders = async () => {
  if (!authStore.isLoggedIn) {
    goToLogin()
    return
  }
  loading.value = true
  try {
    const response = await orderApi.getPage({
      pageNum: 1,
      pageSize: 20,
      orderStatus: activeStatus.value,
    })
    if (response.code !== 200) throw new Error(response.message || '加载失败')
    orders.value = response.data?.records || []
  } catch (error) {
    uni.showToast({ title: error instanceof Error ? error.message : '加载失败', icon: 'none' })
  } finally {
    loading.value = false
    uni.stopPullDownRefresh()
  }
}

const openDetail = (id: number) => {
  uni.navigateTo({ url: `/pages-order/detail?id=${id}` })
}

const payOrder = (order: Order) => {
  uni.navigateTo({
    url: `/pages-order/pay?orderNo=${order.orderNo}&amount=${order.actualAmount || order.totalAmount}&paymentMethod=${order.paymentMethod || 'wechat'}`,
  })
}

const cancelOrder = async (order: Order) => {
  await orderApi.cancel(order.id)
  loadOrders()
}

const confirmOrder = async (order: Order) => {
  await orderApi.confirm(order.id)
  loadOrders()
}

const reviewOrder = (order: Order) => {
  const first = order.orderItems[0]
  if (!first) return
  uni.navigateTo({
    url: `/pages-review/create?productId=${first.productId}&orderId=${order.id}&productName=${encodeURIComponent(first.productName)}`,
  })
}

onShow(() => {
  loadOrders()
})

onPullDownRefresh(() => {
  loadOrders()
})
</script>

<template>
  <view class="page-shell safe-bottom">
    <view class="page-padding">
      <view class="header glass-card">
        <text class="title">我的订单</text>
        <text class="subtitle">查看支付、发货、收货和评价进度</text>
      </view>
      <view class="section-gap">
        <FilterChips :options="ORDER_FILTER_OPTIONS" :model-value="activeStatus" @update:model-value="updateStatus" />
      </view>
      <view v-if="orders.length" class="order-list section-gap">
        <OrderCard
          v-for="item in orders"
          :key="item.id"
          :order="item"
          @detail="openDetail(item.id)"
          @pay="payOrder(item)"
          @cancel="cancelOrder(item)"
          @confirm="confirmOrder(item)"
          @review="reviewOrder(item)"
        />
      </view>
      <EmptyState
        v-else
        class="section-gap"
        title="当前筛选下暂无订单"
        description="可以先去桃源集挑选一些在地好物。"
        action-text="去逛桃源集"
        @action="goShop"
      />

      <AiFloatingButton :bottom-offset="AI_FAB_OFFSET.detail" />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.header {
  padding: 26rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.title {
  font-size: 38rpx;
  color: $text-primary;
  font-weight: 800;
}

.subtitle {
  font-size: 24rpx;
  color: $text-secondary;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}
</style>

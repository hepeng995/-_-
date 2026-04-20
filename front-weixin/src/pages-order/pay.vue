<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

import AiFloatingButton from '@/components/AiFloatingButton.vue'
import SectionBlock from '@/components/SectionBlock.vue'
import { orderApi } from '@/api/order'
import { AI_FAB_OFFSET } from '@/utils/ai-fab'
import { formatPrice } from '@/utils/format'

const orderNo = ref('')
const amount = ref(0)
const paymentMethod = ref('wechat')
const paying = ref(false)

const mockSuccess = async () => {
  paying.value = true
  try {
    const response = await orderApi.pay(orderNo.value, paymentMethod.value)
    if (response.code !== 200) throw new Error(response.message || '支付失败')
    uni.showToast({ title: '支付成功', icon: 'none' })
    setTimeout(() => {
      uni.redirectTo({ url: '/pages-order/list' })
    }, 360)
  } catch (error) {
    uni.showToast({ title: error instanceof Error ? error.message : '支付失败', icon: 'none' })
  } finally {
    paying.value = false
  }
}

const mockFailed = () => {
  uni.showToast({ title: '已模拟支付失败', icon: 'none' })
}

onLoad((query = {}) => {
  orderNo.value = String(query.orderNo || '')
  amount.value = Number(query.amount || 0)
  paymentMethod.value = String(query.paymentMethod || 'wechat')
})
</script>

<template>
  <view class="page-shell safe-bottom">
    <view class="page-padding">
      <SectionBlock eyebrow="Payment" title="演示支付" subtitle="当前为模拟支付页，不会发生真实扣款">
        <view class="summary-card">
          <text class="label">订单号</text>
          <text class="value">{{ orderNo }}</text>
          <text class="label">支付方式</text>
          <text class="value">{{ paymentMethod === 'wechat' ? '微信支付' : '支付宝' }}</text>
          <text class="label">支付金额</text>
          <text class="amount">{{ formatPrice(amount) }}</text>
        </view>
        <view class="actions">
          <button class="primary-btn" :disabled="paying" @tap="mockSuccess">{{ paying ? '支付中...' : '模拟支付成功' }}</button>
          <button class="ghost-btn" @tap="mockFailed">模拟支付失败</button>
        </view>
      </SectionBlock>

      <AiFloatingButton :bottom-offset="AI_FAB_OFFSET.detail" />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.summary-card {
  padding: 24rpx;
  border-radius: 24rpx;
  background: rgba(31, 106, 69, 0.05);
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.label {
  font-size: 22rpx;
  color: $text-muted;
}

.value {
  font-size: 26rpx;
  color: $text-primary;
  font-weight: 700;
}

.amount {
  font-size: 40rpx;
  color: $brand-gold;
  font-weight: 800;
}

.actions {
  margin-top: 24rpx;
  display: flex;
  gap: 16rpx;
}

.primary-btn,
.ghost-btn {
  flex: 1;
  height: 82rpx;
  border-radius: 999rpx;
  font-size: 26rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.primary-btn {
  background: linear-gradient(135deg, $brand-green, $brand-green-soft);
  color: $text-inverse;
}

.ghost-btn {
  background: rgba(31, 106, 69, 0.08);
  color: $brand-green;
}
</style>

<script setup lang="ts">
import { ref } from 'vue'
import { onPullDownRefresh, onShow } from '@dcloudio/uni-app'

import AiFloatingButton from '@/components/AiFloatingButton.vue'
import AddressCard from '@/components/AddressCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import { addressApi } from '@/api/address'
import type { Address } from '@/types/models'
import { AI_FAB_OFFSET } from '@/utils/ai-fab'
import { goToLogin } from '@/utils/nav'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const loading = ref(false)
const addresses = ref<Address[]>([])

const loadAddresses = async () => {
  if (!authStore.isLoggedIn) {
    goToLogin()
    return
  }
  loading.value = true
  try {
    const response = await addressApi.getList()
    if (response.code !== 200) throw new Error(response.message || '加载失败')
    addresses.value = response.data || []
  } catch (error) {
    uni.showToast({ title: error instanceof Error ? error.message : '加载失败', icon: 'none' })
  } finally {
    loading.value = false
    uni.stopPullDownRefresh()
  }
}

const editAddress = (id?: number) => {
  uni.navigateTo({
    url: id ? `/pages-user/address-edit?id=${id}` : '/pages-user/address-edit',
  })
}

const setDefault = async (id: number) => {
  await addressApi.setDefault(id)
  loadAddresses()
}

const remove = (id: number) => {
  uni.showModal({
    title: '删除地址',
    content: '确认删除这条收货地址吗？',
    success: async ({ confirm }) => {
      if (!confirm) return
      await addressApi.remove(id)
      loadAddresses()
    },
  })
}

onShow(() => {
  loadAddresses()
})

onPullDownRefresh(() => {
  loadAddresses()
})
</script>

<template>
  <view class="page-shell safe-bottom">
    <view class="page-padding">
      <view class="header glass-card">
        <text class="title">收货地址</text>
        <button class="add-btn" @tap="editAddress()">新增地址</button>
      </view>
      <view v-if="addresses.length" class="address-list section-gap">
        <AddressCard
          v-for="item in addresses"
          :key="item.id"
          :address="item"
          @click="editAddress(item.id)"
          @edit="editAddress(item.id)"
          @delete="remove(item.id)"
          @default="setDefault(item.id)"
        />
      </view>
      <EmptyState
        v-else
        class="section-gap"
        title="还没有收货地址"
        description="新增一条常用地址，后续下单会更方便。"
        action-text="新增地址"
        @action="editAddress()"
      />

      <AiFloatingButton :bottom-offset="AI_FAB_OFFSET.detail" />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.header {
  padding: 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.title {
  font-size: 36rpx;
  color: $text-primary;
  font-weight: 800;
}

.add-btn {
  min-width: 160rpx;
  height: 68rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, $brand-green, $brand-green-soft);
  color: $text-inverse;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.address-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}
</style>

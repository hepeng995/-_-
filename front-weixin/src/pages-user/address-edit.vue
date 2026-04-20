<script setup lang="ts">
import { reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

import AiFloatingButton from '@/components/AiFloatingButton.vue'
import { addressApi } from '@/api/address'
import { goToLogin } from '@/utils/nav'
import { useAuthStore } from '@/stores/auth'
import { AI_FAB_OFFSET } from '@/utils/ai-fab'

const authStore = useAuthStore()
const editingId = ref<number | null>(null)
const loading = ref(false)
const form = reactive({
  receiverName: '',
  receiverPhone: '',
  province: '',
  city: '',
  district: '',
  detailAddress: '',
  isDefault: false,
})

const loadDetail = async (id: number) => {
  const response = await addressApi.getById(id)
  if (response.code !== 200 || !response.data) return
  Object.assign(form, response.data)
}

const submit = async () => {
  if (!authStore.isLoggedIn) {
    goToLogin()
    return
  }
  if (!form.receiverName || !form.receiverPhone || !form.province || !form.city || !form.district || !form.detailAddress) {
    uni.showToast({ title: '请填写完整地址信息', icon: 'none' })
    return
  }
  loading.value = true
  try {
    const response = editingId.value
      ? await addressApi.update(editingId.value, form)
      : await addressApi.create(form)
    if (response.code !== 200) throw new Error(response.message || '保存失败')
    uni.showToast({ title: '地址已保存', icon: 'none' })
    setTimeout(() => {
      uni.navigateBack()
    }, 260)
  } catch (error) {
    uni.showToast({ title: error instanceof Error ? error.message : '保存失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

onLoad((query = {}) => {
  if (!authStore.isLoggedIn) {
    goToLogin()
    return
  }
  const id = Number(query.id)
  if (id) {
    editingId.value = id
    loadDetail(id)
  }
})
</script>

<template>
  <view class="page-shell safe-bottom">
    <view class="page-padding">
      <view class="form-card glass-card">
        <view class="field"><text class="field-label">收货人</text><input v-model.trim="form.receiverName" class="field-input" placeholder="请输入收货人姓名" /></view>
        <view class="field"><text class="field-label">手机号</text><input v-model.trim="form.receiverPhone" class="field-input" placeholder="请输入手机号" /></view>
        <view class="field"><text class="field-label">省份</text><input v-model.trim="form.province" class="field-input" placeholder="如：湖南省" /></view>
        <view class="field"><text class="field-label">城市</text><input v-model.trim="form.city" class="field-input" placeholder="如：常德市" /></view>
        <view class="field"><text class="field-label">区县</text><input v-model.trim="form.district" class="field-input" placeholder="如：桃源县" /></view>
        <view class="field"><text class="field-label">详细地址</text><textarea v-model.trim="form.detailAddress" class="field-textarea" placeholder="请输入门牌、街道等信息" /></view>
        <view class="switch-row">
          <text class="field-label">设为默认地址</text>
          <switch :checked="form.isDefault" color="#1f6a45" @change="form.isDefault = $event.detail.value" />
        </view>
        <button class="submit-btn" :disabled="loading" @tap="submit">{{ loading ? '保存中...' : '保存地址' }}</button>
      </view>

      <AiFloatingButton :bottom-offset="AI_FAB_OFFSET.detail" />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.form-card {
  padding: 28rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.field-label {
  font-size: 24rpx;
  color: $text-primary;
  font-weight: 700;
}

.field-input,
.field-textarea {
  width: 100%;
  border-radius: 22rpx;
  background: rgba(31, 106, 69, 0.05);
  font-size: 26rpx;
  color: $text-primary;
}

.field-input {
  height: 82rpx;
  padding: 0 24rpx;
}

.field-textarea {
  min-height: 180rpx;
  padding: 20rpx 24rpx;
}

.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.submit-btn {
  height: 86rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, $brand-green, $brand-green-soft);
  color: $text-inverse;
  font-size: 28rpx;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

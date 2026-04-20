<script setup lang="ts">
import { reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

import AiFloatingButton from '@/components/AiFloatingButton.vue'
import { userApi } from '@/api/user'
import { useAuthStore } from '@/stores/auth'
import { AI_FAB_OFFSET } from '@/utils/ai-fab'
import { resolveImage } from '@/utils/assets'
import { goToLogin } from '@/utils/nav'

const authStore = useAuthStore()
const loading = ref(false)
const form = reactive({
  realName: '',
  email: '',
  phoneNumber: '',
})

const syncForm = () => {
  form.realName = authStore.session.realName || ''
  form.email = authStore.session.email || ''
  form.phoneNumber = authStore.session.phoneNumber || ''
}

const save = async () => {
  if (!authStore.isLoggedIn) {
    goToLogin()
    return
  }
  loading.value = true
  try {
    const response = await userApi.updateProfile(form)
    if (response.code !== 200) throw new Error(response.message || '保存失败')
    await authStore.fetchProfile(true)
    syncForm()
    uni.showToast({ title: '资料已更新', icon: 'none' })
  } catch (error) {
    uni.showToast({ title: error instanceof Error ? error.message : '保存失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

onLoad(() => {
  if (!authStore.isLoggedIn) {
    goToLogin()
    return
  }
  syncForm()
})
</script>

<template>
  <view class="page-shell safe-bottom">
    <view class="page-padding">
      <view class="hero glass-card">
        <image class="avatar" :src="resolveImage(authStore.session.avatar, '/static/images/mascot.png')" mode="aspectFill" />
        <view class="copy">
          <text class="name">{{ authStore.displayName }}</text>
          <text class="meta">{{ authStore.session.username }}</text>
          <text class="meta">{{ authStore.session.role || '普通用户' }}</text>
        </view>
      </view>

      <view class="form-card glass-card section-gap">
        <view class="field">
          <text class="field-label">真实姓名</text>
          <input v-model.trim="form.realName" class="field-input" placeholder="请输入真实姓名" />
        </view>
        <view class="field">
          <text class="field-label">电子邮箱</text>
          <input v-model.trim="form.email" class="field-input" placeholder="请输入邮箱" />
        </view>
        <view class="field">
          <text class="field-label">手机号</text>
          <input v-model.trim="form.phoneNumber" class="field-input" placeholder="请输入手机号" />
        </view>
        <button class="submit-btn" :disabled="loading" @tap="save">{{ loading ? '保存中...' : '保存资料' }}</button>
      </view>

      <AiFloatingButton :bottom-offset="AI_FAB_OFFSET.detail" />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.hero,
.form-card {
  padding: 28rpx;
}

.hero {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.avatar {
  width: 112rpx;
  height: 112rpx;
  border-radius: 36rpx;
}

.copy {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.name {
  font-size: 38rpx;
  color: $text-primary;
  font-weight: 800;
}

.meta {
  font-size: 24rpx;
  color: $text-secondary;
}

.form-card {
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

.field-input {
  width: 100%;
  height: 82rpx;
  padding: 0 24rpx;
  border-radius: 22rpx;
  background: rgba(31, 106, 69, 0.05);
  font-size: 26rpx;
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

<script setup lang="ts">
import { reactive, ref } from 'vue'

import AiFloatingButton from '@/components/AiFloatingButton.vue'
import { userApi } from '@/api/user'
import { useAuthStore } from '@/stores/auth'
import { AI_FAB_OFFSET } from '@/utils/ai-fab'
import { goToLogin } from '@/utils/nav'

const authStore = useAuthStore()
const form = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})
const loading = ref(false)

const submit = async () => {
  if (!authStore.isLoggedIn) {
    goToLogin()
    return
  }
  if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
    uni.showToast({ title: '请填写完整信息', icon: 'none' })
    return
  }
  if (form.newPassword !== form.confirmPassword) {
    uni.showToast({ title: '两次密码不一致', icon: 'none' })
    return
  }

  loading.value = true
  try {
    const response = await userApi.changePassword({
      oldPassword: form.oldPassword,
      newPassword: form.newPassword,
    })
    if (response.code !== 200) throw new Error(response.message || '修改失败')
    authStore.clearSession(false)
    uni.showToast({ title: '密码已更新，请重新登录', icon: 'none' })
    setTimeout(() => {
      goToLogin(null)
    }, 360)
  } catch (error) {
    uni.showToast({ title: error instanceof Error ? error.message : '修改失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <view class="page-shell safe-bottom">
    <view class="page-padding">
      <view class="hero glass-card">
        <text class="hero-title">修改密码</text>
        <text class="hero-copy">为了账户安全，建议定期更新密码并妥善保管。</text>
      </view>
      <view class="form-card glass-card section-gap">
        <view class="field">
          <text class="field-label">当前密码</text>
          <input v-model.trim="form.oldPassword" class="field-input" password placeholder="请输入当前密码" />
        </view>
        <view class="field">
          <text class="field-label">新密码</text>
          <input v-model.trim="form.newPassword" class="field-input" password placeholder="请输入新密码" />
        </view>
        <view class="field">
          <text class="field-label">确认新密码</text>
          <input v-model.trim="form.confirmPassword" class="field-input" password placeholder="请再次输入新密码" />
        </view>
        <button class="submit-btn" :disabled="loading" @tap="submit">{{ loading ? '提交中...' : '确认修改' }}</button>
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
  flex-direction: column;
  gap: 12rpx;
}

.hero-title {
  font-size: 40rpx;
  color: $text-primary;
  font-weight: 800;
}

.hero-copy {
  font-size: 24rpx;
  line-height: 1.7;
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

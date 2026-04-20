<script setup lang="ts">
import { ref } from 'vue'

import { userApi } from '@/api/user'
import { STORAGE_KEYS } from '@/config/storage'

const form = ref({
  username: '',
  password: '',
  confirmPassword: '',
  realName: '',
  email: '',
  phoneNumber: '',
})
const loading = ref(false)

const submit = async () => {
  const payload = form.value
  if (!payload.username || !payload.password || !payload.confirmPassword || !payload.email) {
    uni.showToast({ title: '请完善必填信息', icon: 'none' })
    return
  }
  if (payload.password !== payload.confirmPassword) {
    uni.showToast({ title: '两次密码输入不一致', icon: 'none' })
    return
  }

  loading.value = true
  try {
    const response = await userApi.register(payload)
    if (response.code !== 200) throw new Error(response.message || '注册失败')
    uni.setStorageSync(STORAGE_KEYS.loginPrefill, payload.username)
    uni.showToast({ title: '注册成功，请登录', icon: 'none' })
    setTimeout(() => {
      uni.redirectTo({ url: '/pages/login/index' })
    }, 360)
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : '注册失败',
      icon: 'none',
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <view class="page-shell safe-bottom">
    <view class="page-padding register-page">
      <view class="hero glass-card">
        <text class="hero-kicker">JOIN TAOYUAN</text>
        <text class="hero-title">注册新账号</text>
        <text class="hero-copy">注册后可同步购物车、订单、地址与社区互动记录。</text>
      </view>

      <view class="form-card glass-card section-gap">
        <view class="field">
          <text class="field-label">用户名</text>
          <input v-model.trim="form.username" class="field-input" placeholder="4-20 位用户名" />
        </view>
        <view class="field">
          <text class="field-label">真实姓名</text>
          <input v-model.trim="form.realName" class="field-input" placeholder="选填" />
        </view>
        <view class="field">
          <text class="field-label">电子邮箱</text>
          <input v-model.trim="form.email" class="field-input" placeholder="必填" />
        </view>
        <view class="field">
          <text class="field-label">手机号</text>
          <input v-model.trim="form.phoneNumber" class="field-input" placeholder="选填" />
        </view>
        <view class="field">
          <text class="field-label">密码</text>
          <input v-model.trim="form.password" class="field-input" password placeholder="6-20 位密码" />
        </view>
        <view class="field">
          <text class="field-label">确认密码</text>
          <input v-model.trim="form.confirmPassword" class="field-input" password placeholder="再次输入密码" />
        </view>

        <button class="submit-btn" :disabled="loading" @tap="submit">{{ loading ? '注册中...' : '立即注册' }}</button>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.register-page {
  min-height: 100vh;
  padding-top: 36rpx;
}

.hero,
.form-card {
  padding: 30rpx 28rpx;
}

.hero {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  background: linear-gradient(135deg, rgba(31, 106, 69, 0.95), rgba(94, 158, 137, 0.92));
  color: $text-inverse;
}

.hero-kicker {
  font-size: 22rpx;
  letter-spacing: 4rpx;
  opacity: 0.84;
}

.hero-title {
  font-size: 46rpx;
  font-weight: 800;
}

.hero-copy {
  font-size: 24rpx;
  line-height: 1.7;
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
  height: 84rpx;
  padding: 0 26rpx;
  border-radius: 24rpx;
  background: rgba(31, 106, 69, 0.05);
  color: $text-primary;
  font-size: 28rpx;
}

.submit-btn {
  margin-top: 8rpx;
  width: 100%;
  height: 88rpx;
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

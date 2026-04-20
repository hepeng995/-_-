<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app'

import { appConfig } from '@/config/app'
import { STORAGE_KEYS } from '@/config/storage'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { goAfterLogin } from '@/utils/nav'

const authStore = useAuthStore()
const cartStore = useCartStore()

const username = ref('')
const password = ref('')
const loading = ref(false)

const submit = async () => {
  if (!username.value.trim() || !password.value.trim()) {
    uni.showToast({
      title: '请输入用户名和密码',
      icon: 'none',
    })
    return
  }

  loading.value = true
  try {
    await authStore.login(username.value.trim(), password.value.trim())
    await cartStore.fetchCount(true)

    uni.showToast({
      title: '登录成功',
      icon: 'none',
    })

    setTimeout(() => {
      goAfterLogin()
    }, 240)
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : '登录失败',
      icon: 'none',
      duration: 2000,
    })
  } finally {
    loading.value = false
  }
}

const goRegister = () => {
  uni.navigateTo({ url: '/pages-user/register' })
}

onShareAppMessage(() => ({
  title: `${appConfig.appName} 登录页`,
  path: '/pages/login/index',
}))

onLoad(() => {
  const prefill = uni.getStorageSync(STORAGE_KEYS.loginPrefill) as string | undefined
  if (prefill) {
    username.value = prefill
    uni.removeStorageSync(STORAGE_KEYS.loginPrefill)
  }
})
</script>

<template>
  <view class="page-shell safe-bottom">
    <view class="page-padding login-page">
      <view class="hero glass-card">
        <image class="logo" src="/static/images/brand-logo.jpg" mode="aspectFill" />
        <text class="hero-kicker">WELCOME BACK</text>
        <text class="hero-title">登录到 {{ appConfig.appName }}</text>
        <text class="hero-copy">继续浏览桃源山水，也把你的购物车和个人资料带进来。</text>
      </view>

      <view class="form-card glass-card section-gap">
        <view class="field">
          <text class="field-label">用户名</text>
          <input
            v-model.trim="username"
            class="field-input"
            :maxlength="30"
            placeholder="输入现有 Web 账号用户名"
            confirm-type="next"
          />
        </view>
        <view class="field">
          <text class="field-label">密码</text>
          <input
            v-model.trim="password"
            class="field-input"
            password
            :maxlength="30"
            placeholder="输入账号密码"
            confirm-type="done"
            @confirm="submit"
          />
        </view>

        <button class="submit-btn" :disabled="loading" @tap="submit">
          {{ loading ? '正在登录...' : '立即登录' }}
        </button>

        <button class="register-btn" @tap="goRegister">没有账号？去注册</button>

        <view class="tips-card">
          <text class="tips-title">演示提示</text>
          <text class="tips-copy">这版小程序直接复用现有账号体系，不走微信授权登录。</text>
          <text class="tips-copy">如果你已经在 Web 端注册过账号，可以直接用同一套用户名密码登录。</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  padding-top: 36rpx;
}

.hero,
.form-card {
  padding: 32rpx 28rpx;
}

.hero {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  align-items: flex-start;
  background:
    linear-gradient(135deg, rgba(31, 106, 69, 0.95), rgba(76, 143, 175, 0.9)),
    radial-gradient(circle at right top, rgba(255, 252, 246, 0.2), transparent 40%);
  color: $text-inverse;
}

.logo {
  width: 124rpx;
  height: 124rpx;
  border-radius: 32rpx;
  box-shadow: 0 16rpx 34rpx rgba(18, 40, 27, 0.18);
}

.hero-kicker {
  margin-top: 6rpx;
  font-size: 22rpx;
  letter-spacing: 4rpx;
  opacity: 0.86;
}

.hero-title {
  font-size: 46rpx;
  line-height: 1.16;
  font-weight: 800;
}

.hero-copy {
  font-size: 24rpx;
  line-height: 1.7;
}

.form-card {
  display: flex;
  flex-direction: column;
  gap: 22rpx;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.field-label {
  font-size: 25rpx;
  color: $text-primary;
  font-weight: 600;
}

.field-input {
  width: 100%;
  height: 84rpx;
  padding: 0 28rpx;
  border-radius: 24rpx;
  background: rgba(31, 106, 69, 0.05);
  color: $text-primary;
  font-size: 28rpx;
}

.submit-btn {
  margin-top: 8rpx;
  width: 100%;
  height: 86rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, $brand-green, $brand-green-soft);
  color: $text-inverse;
  font-size: 28rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 1;
}

.register-btn {
  width: 100%;
  height: 74rpx;
  border-radius: 999rpx;
  background: rgba(31, 106, 69, 0.06);
  color: $brand-green;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.submit-btn[disabled] {
  opacity: 0.72;
}

.tips-card {
  margin-top: 4rpx;
  padding: 24rpx;
  border-radius: 24rpx;
  background: rgba(214, 139, 42, 0.08);
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.tips-title {
  font-size: 26rpx;
  color: $brand-gold;
  font-weight: 700;
}

.tips-copy {
  font-size: 24rpx;
  line-height: 1.7;
  color: $text-secondary;
}
</style>

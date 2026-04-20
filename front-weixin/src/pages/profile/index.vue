<script setup lang="ts">
import { computed } from 'vue'
import { onPullDownRefresh, onShow } from '@dcloudio/uni-app'

import AiFloatingButton from '@/components/AiFloatingButton.vue'
import ActionCell from '@/components/ActionCell.vue'
import EmptyState from '@/components/EmptyState.vue'
import SectionBlock from '@/components/SectionBlock.vue'
import { appConfig } from '@/config/app'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { resolveImage } from '@/utils/assets'
import { AI_FAB_OFFSET } from '@/utils/ai-fab'
import { goToLogin } from '@/utils/nav'

const authStore = useAuthStore()
const cartStore = useCartStore()

const focusActions = computed(() => [
  { label: '我的订单', hint: '查看支付、发货、收货与评价进度', onTap: () => uni.navigateTo({ url: '/pages-order/list' }) },
  { label: '收货地址', hint: '维护常用地址，下单时更顺手', onTap: () => uni.navigateTo({ url: '/pages-user/address-list' }) },
])

const actions = computed(() => [
  { label: '个人资料', hint: '编辑真实姓名、邮箱、手机号', onTap: () => uni.navigateTo({ url: '/pages-user/profile' }) },
  { label: '修改密码', hint: '更新账号密码', onTap: () => uni.navigateTo({ url: '/pages-user/password' }) },
  { label: '购物车', value: `${cartStore.count} 件`, hint: '继续整理准备下单的好物', onTap: () => uni.navigateTo({ url: '/pages/cart/index' }) },
  { label: '版本信息', value: appConfig.versionName, hint: '查看当前小程序版本', onTap: () => showVersionTip() },
])

const bootstrap = async () => {
  if (!authStore.isLoggedIn) {
    cartStore.reset()
    uni.stopPullDownRefresh()
    return
  }
  await Promise.allSettled([authStore.fetchProfile(true), cartStore.fetchCount(true)])
  uni.stopPullDownRefresh()
}

const showVersionTip = () => {
  uni.showModal({
    title: appConfig.appName,
    content: `当前版本：${appConfig.versionName}\n这版已扩展订单、地址、社区、AI 和评价链路。`,
    showCancel: false,
  })
}

const logout = () => {
  uni.showModal({
    title: '退出登录',
    content: '退出后仍可继续浏览景点、资讯、商品与共建内容。',
    success: ({ confirm }) => {
      if (!confirm) return
      authStore.clearSession(true)
      cartStore.reset()
    },
  })
}

const goRegister = () => {
  uni.navigateTo({ url: '/pages-user/register' })
}

onShow(bootstrap)
onPullDownRefresh(bootstrap)
</script>

<template>
  <view class="page-shell safe-bottom">
    <view class="page-padding">
      <view class="hero glass-card">
        <image class="hero-logo" :src="resolveImage(authStore.session.avatar, '/static/images/brand-logo.jpg')" mode="aspectFill" />
        <view class="hero-copy">
          <text class="hero-kicker">MY TAOYUAN</text>
          <text class="hero-title">{{ authStore.isLoggedIn ? authStore.displayName : '欢迎来到新桃源智界' }}</text>
          <text class="hero-desc">
            {{ authStore.isLoggedIn ? '这里集中管理你的资料、地址、订单、AI 与购物车入口。' : '登录后可同步个人服务，不登录也可以继续浏览主要内容。' }}
          </text>
        </view>
      </view>

      <SectionBlock v-if="authStore.isLoggedIn" class="section-gap" eyebrow="Service Hub" title="个人服务" subtitle="把常用能力都放在这一页集中管理">
        <view class="focus-grid">
          <button v-for="item in focusActions" :key="item.label" class="focus-card" @tap="item.onTap">
            <text class="focus-title">{{ item.label }}</text>
            <text class="focus-desc">{{ item.hint }}</text>
          </button>
        </view>
        <view class="action-list">
          <ActionCell v-for="item in actions" :key="item.label" :label="item.label" :value="item.value" :hint="item.hint" @click="item.onTap" />
        </view>
        <view class="button-row">
          <button class="ghost-btn" @tap="bootstrap">刷新资料</button>
          <button class="outline-btn" @tap="logout">退出登录</button>
        </view>
      </SectionBlock>

      <EmptyState
        v-else
        class="section-gap"
        title="还没有登录账号"
        description="登录后可以查看订单、管理地址，也能同步购物车；AI 入口会在右下角随时出现。"
        action-text="去登录"
        @action="goToLogin()"
      />

      <SectionBlock v-if="!authStore.isLoggedIn" class="section-gap" eyebrow="Join Us" title="还没有账号？" subtitle="注册后就能把浏览、购买和互动记录保留下来">
        <button class="ghost-btn" @tap="goRegister">注册新账号</button>
      </SectionBlock>

      <AiFloatingButton :bottom-offset="AI_FAB_OFFSET.tab" />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.hero {
  padding: 30rpx 28rpx;
  display: flex;
  align-items: center;
  gap: 22rpx;
  background: linear-gradient(135deg, rgba(31, 106, 69, 0.94), rgba(94, 158, 137, 0.92));
  color: $text-inverse;
}

.hero-logo {
  width: 120rpx;
  height: 120rpx;
  border-radius: 32rpx;
  flex-shrink: 0;
}

.hero-copy {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.hero-kicker {
  font-size: 22rpx;
  letter-spacing: 4rpx;
  opacity: 0.84;
}

.hero-title {
  font-size: 40rpx;
  font-weight: 800;
}

.hero-desc {
  font-size: 24rpx;
  line-height: 1.6;
}

.action-list {
  margin-top: 18rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.focus-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
}

.focus-card {
  min-height: 168rpx;
  padding: 22rpx;
  border-radius: 26rpx;
  background:
    radial-gradient(circle at top right, rgba(255, 252, 246, 0.24), transparent 34%),
    linear-gradient(135deg, rgba(31, 106, 69, 0.95), rgba(94, 158, 137, 0.9));
  box-shadow: 0 18rpx 40rpx rgba(25, 67, 44, 0.14);
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  text-align: left;
}

.focus-title {
  font-size: 32rpx;
  line-height: 1.2;
  color: $text-inverse;
  font-weight: 800;
}

.focus-desc {
  font-size: 23rpx;
  line-height: 1.7;
  color: rgba(255, 250, 240, 0.88);
}

.button-row {
  margin-top: 22rpx;
  display: flex;
  gap: 16rpx;
}

.ghost-btn,
.outline-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 999rpx;
  font-size: 26rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ghost-btn {
  background: linear-gradient(135deg, $brand-green, $brand-green-soft);
  color: $text-inverse;
}

.outline-btn {
  background: rgba(31, 106, 69, 0.06);
  color: $brand-green;
}

@media screen and (max-width: 420px) {
  .focus-grid {
    grid-template-columns: 1fr;
  }
}
</style>

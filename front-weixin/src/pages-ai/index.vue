<script setup lang="ts">
import { computed, ref } from 'vue'

import SectionBlock from '@/components/SectionBlock.vue'
import { aiApi } from '@/api/ai'
import type { AiCard, AiMessage } from '@/types/models'
import { AI_QUICK_QUESTIONS } from '@/utils/options'
import { useAuthStore } from '@/stores/auth'
import { goToLogin } from '@/utils/nav'
import { resolveImage } from '@/utils/assets'

const authStore = useAuthStore()
const inputValue = ref('')
const sending = ref(false)
const messages = ref<AiMessage[]>([])

const sendMessage = async (preset?: string) => {
  const content = (preset || inputValue.value).trim()
  if (!content || sending.value) return
  if (!authStore.isLoggedIn || !authStore.session.id) {
    goToLogin()
    return
  }
  messages.value.push({ id: `u-${Date.now()}`, role: 'user', content, createdAt: Date.now() })
  inputValue.value = ''
  sending.value = true
  try {
    const response = await aiApi.sendMessage(content, authStore.session.id)
    if (response.code !== 200) throw new Error(response.message || 'AI 响应失败')
    const payload = response.data || {}
    const cards = Array.isArray(payload.cardList) ? payload.cardList : []
    messages.value.push({
      id: `a-${Date.now()}`,
      role: 'assistant',
      content: payload.recommendText || '我暂时没有找到更合适的推荐。',
      cards,
      moduleType: payload.moduleType,
      createdAt: Date.now(),
    })
  } catch (error) {
    uni.showToast({ title: error instanceof Error ? error.message : 'AI 响应失败', icon: 'none' })
  } finally {
    sending.value = false
  }
}

const openCard = (card: AiCard) => {
  if (!card.detailUrl) return
  uni.navigateTo({ url: card.detailUrl })
}
</script>

<template>
  <view class="page-shell safe-bottom">
    <view class="page-padding ai-page">
      <view class="hero glass-card">
        <text class="hero-title">桃源 AI 助手</text>
        <text class="hero-copy">你可以问景点、好物、资讯和共建话题，我会把推荐整理成可继续点击的卡片。</text>
      </view>

      <SectionBlock class="section-gap" eyebrow="Quick Ask" title="试试这些问题" subtitle="如果你不确定怎么开口，可以从一句短问开始">
        <view class="quick-grid">
          <button v-for="item in AI_QUICK_QUESTIONS" :key="item" class="quick-btn" @tap="sendMessage(item)">{{ item }}</button>
        </view>
      </SectionBlock>

      <view v-if="messages.length" class="message-list section-gap">
        <view v-for="message in messages" :key="message.id" class="message-card" :class="message.role">
          <text class="message-text">{{ message.content }}</text>
          <view v-if="message.cards?.length" class="card-list">
            <view v-for="card in message.cards" :key="String(card.id)" class="recommend-card glass-card" @tap="openCard(card)">
              <image class="cover" :src="resolveImage(Array.isArray(card.images) ? card.images[0] : card.images, '/static/images/overview.jpg')" mode="aspectFill" />
              <view class="meta">
                <text class="title text-ellipsis-1">{{ card.title }}</text>
                <text class="desc text-ellipsis-2">{{ card.content }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="composer glass-card">
        <input v-model.trim="inputValue" class="composer-input" placeholder="例如：帮我推荐几个适合周末散心的景点" confirm-type="send" @confirm="sendMessage()" />
        <button class="send-btn" :disabled="sending" @tap="sendMessage()">{{ sending ? '发送中' : '发送' }}</button>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.ai-page {
  padding-bottom: calc(env(safe-area-inset-bottom) + 160rpx);
}

.hero,
.composer {
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

.quick-grid,
.message-list,
.card-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.quick-btn {
  min-height: 72rpx;
  padding: 18rpx 24rpx;
  border-radius: 24rpx;
  background: rgba(31, 106, 69, 0.06);
  color: $brand-green;
  font-size: 24rpx;
  text-align: left;
}

.message-card {
  padding: 22rpx;
  border-radius: 24rpx;
}

.message-card.user {
  background: rgba(31, 106, 69, 0.08);
}

.message-card.assistant {
  background: rgba(255, 252, 246, 0.96);
  box-shadow: $shadow-soft;
}

.message-text {
  font-size: 24rpx;
  line-height: 1.7;
  color: $text-primary;
}

.recommend-card {
  padding: 18rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.cover {
  width: 120rpx;
  height: 96rpx;
  border-radius: 18rpx;
  flex-shrink: 0;
}

.meta {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.title {
  font-size: 26rpx;
  color: $text-primary;
  font-weight: 800;
}

.desc {
  font-size: 22rpx;
  color: $text-secondary;
}

.composer {
  position: fixed;
  left: 24rpx;
  right: 24rpx;
  bottom: calc(env(safe-area-inset-bottom) + 20rpx);
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.composer-input {
  flex: 1;
  height: 76rpx;
  padding: 0 20rpx;
  border-radius: 999rpx;
  background: rgba(31, 106, 69, 0.05);
  font-size: 24rpx;
}

.send-btn {
  min-width: 140rpx;
  height: 76rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, $brand-green, $brand-green-soft);
  color: $text-inverse;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

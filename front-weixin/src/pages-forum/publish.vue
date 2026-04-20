<script setup lang="ts">
import { reactive, ref } from 'vue'

import AiFloatingButton from '@/components/AiFloatingButton.vue'
import SectionBlock from '@/components/SectionBlock.vue'
import UploadGrid from '@/components/UploadGrid.vue'
import { forumApi } from '@/api/forum'
import { AI_FAB_OFFSET } from '@/utils/ai-fab'
import { FORUM_CATEGORY_OPTIONS } from '@/utils/options'

const loading = ref(false)
const form = reactive({
  title: '',
  content: '',
  category: 'environment',
  images: [] as string[],
})

const submit = async () => {
  if (!form.title || !form.content) {
    uni.showToast({ title: '请完善标题和内容', icon: 'none' })
    return
  }
  loading.value = true
  try {
    const response = await forumApi.createPost({
      title: form.title,
      content: form.content,
      category: form.category,
      images: form.images,
    })
    if (response.code !== 200) throw new Error(response.message || '发布失败')
    uni.showToast({ title: '发布成功，等待审核', icon: 'none' })
    setTimeout(() => {
      uni.switchTab({ url: '/pages/forum/index' })
    }, 360)
  } catch (error) {
    uni.showToast({ title: error instanceof Error ? error.message : '发布失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <view class="page-shell safe-bottom">
    <view class="page-padding">
      <SectionBlock eyebrow="Publish" title="发布建议" subtitle="把你的观察、问题和建议整理清楚，便于后续采纳">
        <view class="field">
          <text class="label">建议标题</text>
          <input v-model.trim="form.title" class="input" :maxlength="100" placeholder="用一句话说清你的建议" />
        </view>
        <view class="field">
          <text class="label">建议类型</text>
          <view class="chips">
            <button
              v-for="item in FORUM_CATEGORY_OPTIONS.filter((entry) => entry.value)"
              :key="String(item.value)"
              class="chip"
              :class="{ active: form.category === item.value }"
              @tap="form.category = String(item.value)"
            >
              {{ item.label }}
            </button>
          </view>
        </view>
        <view class="field">
          <text class="label">建议内容</text>
          <textarea v-model.trim="form.content" class="textarea" :maxlength="2000" placeholder="尽量写清问题背景、你的观察和建议方向" />
        </view>
        <view class="field">
          <text class="label">相关图片</text>
          <UploadGrid v-model="form.images" />
        </view>
        <button class="submit-btn" :disabled="loading" @tap="submit">{{ loading ? '发布中...' : '提交建议' }}</button>
      </SectionBlock>

      <AiFloatingButton :bottom-offset="AI_FAB_OFFSET.detail" />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.label {
  font-size: 24rpx;
  color: $text-primary;
  font-weight: 700;
}

.input,
.textarea {
  width: 100%;
  border-radius: 24rpx;
  background: rgba(31, 106, 69, 0.05);
  font-size: 26rpx;
}

.input {
  height: 84rpx;
  padding: 0 24rpx;
}

.textarea {
  min-height: 220rpx;
  padding: 20rpx 24rpx;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
}

.chip {
  min-width: 160rpx;
  height: 62rpx;
  padding: 0 22rpx;
  border-radius: 999rpx;
  background: rgba(31, 106, 69, 0.08);
  color: $brand-green;
  font-size: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chip.active,
.submit-btn {
  background: linear-gradient(135deg, $brand-green, $brand-green-soft);
  color: $text-inverse;
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  border-radius: 999rpx;
  font-size: 28rpx;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

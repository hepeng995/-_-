<script setup lang="ts">
import { reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

import AiFloatingButton from '@/components/AiFloatingButton.vue'
import SectionBlock from '@/components/SectionBlock.vue'
import UploadGrid from '@/components/UploadGrid.vue'
import { reviewApi } from '@/api/review'
import { AI_FAB_OFFSET } from '@/utils/ai-fab'

const loading = ref(false)
const productName = ref('桃源好物')
const form = reactive({
  productId: 0,
  orderId: 0,
  rating: 5,
  content: '',
  images: [] as string[],
  isAnonymous: false,
})

const submit = async () => {
  if (!form.productId || !form.content.trim()) {
    uni.showToast({ title: '请先填写评价内容', icon: 'none' })
    return
  }
  loading.value = true
  try {
    const response = await reviewApi.create(form)
    if (response.code !== 200) throw new Error(response.message || '提交失败')
    uni.showToast({ title: '评价已提交', icon: 'none' })
    setTimeout(() => {
      uni.navigateBack()
    }, 320)
  } catch (error) {
    uni.showToast({ title: error instanceof Error ? error.message : '提交失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

onLoad((query = {}) => {
  form.productId = Number(query.productId || 0)
  form.orderId = Number(query.orderId || 0)
  productName.value = decodeURIComponent(String(query.productName || '桃源好物'))
})
</script>

<template>
  <view class="page-shell safe-bottom">
    <view class="page-padding">
      <SectionBlock eyebrow="Review" :title="productName" subtitle="分享真实体验，会帮助后面的游客更快做决定">
        <view class="field">
          <text class="label">评分</text>
          <view class="rating-row">
            <button
              v-for="item in [1, 2, 3, 4, 5]"
              :key="item"
              class="star-btn"
              :class="{ active: form.rating >= item }"
              @tap="form.rating = item"
            >
              ★
            </button>
          </view>
        </view>
        <view class="field">
          <text class="label">评价内容</text>
          <textarea v-model.trim="form.content" class="textarea" :maxlength="500" placeholder="可以写口感、包装、配送或整体体验" />
        </view>
        <view class="field">
          <text class="label">上传图片</text>
          <UploadGrid v-model="form.images" :limit="6" />
        </view>
        <view class="switch-row">
          <text class="label">匿名评价</text>
          <switch :checked="form.isAnonymous" color="#1f6a45" @change="form.isAnonymous = $event.detail.value" />
        </view>
        <button class="submit-btn" :disabled="loading" @tap="submit">{{ loading ? '提交中...' : '提交评价' }}</button>
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

.rating-row {
  display: flex;
  gap: 12rpx;
}

.star-btn {
  width: 72rpx;
  height: 72rpx;
  border-radius: 36rpx;
  background: rgba(214, 139, 42, 0.1);
  color: rgba(214, 139, 42, 0.4);
  font-size: 34rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.star-btn.active {
  color: $brand-gold;
  background: rgba(214, 139, 42, 0.16);
}

.textarea {
  width: 100%;
  min-height: 220rpx;
  padding: 20rpx 24rpx;
  border-radius: 22rpx;
  background: rgba(31, 106, 69, 0.05);
  font-size: 24rpx;
}

.switch-row {
  margin-bottom: 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.submit-btn {
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

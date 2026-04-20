<script setup lang="ts">
import { ref } from 'vue'
import { fileApi } from '@/api/file'

const props = withDefaults(
  defineProps<{
    modelValue: string[]
    limit?: number
  }>(),
  {
    limit: 6,
  },
)

const emit = defineEmits<{
  (event: 'update:modelValue', value: string[]): void
}>()

const uploading = ref(false)

const chooseImage = () => {
  if (uploading.value || props.modelValue.length >= props.limit) return
  uni.chooseImage({
    count: Math.max(1, props.limit - props.modelValue.length),
    success: async ({ tempFilePaths }) => {
      uploading.value = true
      const next = [...props.modelValue]
      try {
        for (const filePath of tempFilePaths) {
          const uploaded = await fileApi.uploadImage(filePath)
          next.push(uploaded)
        }
        emit('update:modelValue', next)
      } catch (error) {
        uni.showToast({
          title: error instanceof Error ? error.message : '上传失败',
          icon: 'none',
        })
      } finally {
        uploading.value = false
      }
    },
  })
}

const remove = (index: number) => {
  const next = props.modelValue.filter((_, current) => current !== index)
  emit('update:modelValue', next)
}

const preview = (current: string) => {
  uni.previewImage({
    current,
    urls: props.modelValue,
  })
}
</script>

<template>
  <view class="upload-grid">
    <view v-for="(item, index) in props.modelValue" :key="item" class="upload-item">
      <image class="image" :src="item" mode="aspectFill" @tap="preview(item)" />
      <button class="remove-btn" @tap.stop="remove(index)">×</button>
    </view>
    <button v-if="props.modelValue.length < props.limit" class="upload-item uploader" @tap="chooseImage">
      {{ uploading ? '上传中' : '上传图片' }}
    </button>
  </view>
</template>

<style lang="scss" scoped>
.upload-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16rpx;
}

.upload-item {
  position: relative;
  width: 100%;
  height: 200rpx;
  border-radius: 24rpx;
  overflow: hidden;
}

.image,
.uploader {
  width: 100%;
  height: 100%;
}

.uploader {
  background: rgba(31, 106, 69, 0.06);
  color: $brand-green;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn {
  position: absolute;
  top: 10rpx;
  right: 10rpx;
  width: 42rpx;
  height: 42rpx;
  border-radius: 21rpx;
  background: rgba(23, 45, 33, 0.72);
  color: #fff;
  font-size: 26rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

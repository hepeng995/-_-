<script setup lang="ts">
import { ref } from 'vue'
import { onPullDownRefresh, onReachBottom, onShow } from '@dcloudio/uni-app'

import AiFloatingButton from '@/components/AiFloatingButton.vue'
import EmptyState from '@/components/EmptyState.vue'
import FilterChips from '@/components/FilterChips.vue'
import ForumPostCard from '@/components/ForumPostCard.vue'
import SectionBlock from '@/components/SectionBlock.vue'
import { forumApi } from '@/api/forum'
import { FORUM_CATEGORY_OPTIONS } from '@/utils/options'
import type { ForumPost } from '@/types/models'
import { useAuthStore } from '@/stores/auth'
import { AI_FAB_OFFSET } from '@/utils/ai-fab'
import { goToLogin } from '@/utils/nav'

const authStore = useAuthStore()
const loading = ref(false)
const posts = ref<ForumPost[]>([])
const total = ref(0)
const topPosts = ref<ForumPost[]>([])
const normalPosts = ref<ForumPost[]>([])
const category = ref('')
const keyword = ref('')
const query = ref({
  pageNum: 1,
  pageSize: 10,
  sortField: 'created_at',
  sortOrder: 'desc',
})

const loadPosts = async (append = false) => {
  loading.value = true
  try {
    const response = await forumApi.getPostPage({
      ...query.value,
      category: category.value,
      keyword: keyword.value,
      status: 1,
    })
    if (response.code !== 200) throw new Error(response.message || '加载失败')
    const records = response.data?.records || []
    total.value = response.data?.total || 0
    posts.value = append ? posts.value.concat(records) : records
    topPosts.value = posts.value.filter((item) => item.isTop)
    normalPosts.value = posts.value.filter((item) => !item.isTop)
  } catch (error) {
    uni.showToast({ title: error instanceof Error ? error.message : '加载失败', icon: 'none' })
  } finally {
    loading.value = false
    uni.stopPullDownRefresh()
  }
}

const applyFilter = () => {
  query.value.pageNum = 1
  loadPosts()
}

const openDetail = (id: number) => {
  uni.navigateTo({ url: `/pages-forum/detail?id=${id}` })
}

const toggleLike = async (post: ForumPost) => {
  if (!authStore.isLoggedIn) {
    goToLogin()
    return
  }
  await forumApi.togglePostLike(post.id)
  loadPosts()
}

const publish = () => {
  if (!authStore.isLoggedIn) {
    goToLogin()
    return
  }
  uni.navigateTo({ url: '/pages-forum/publish' })
}

onShow(() => {
  loadPosts()
})

onPullDownRefresh(() => {
  query.value.pageNum = 1
  loadPosts()
})

onReachBottom(() => {
  if (posts.value.length >= total.value) return
  query.value.pageNum += 1
  loadPosts(true)
})
</script>

<template>
  <view class="page-shell safe-bottom">
    <view class="page-padding">
      <view class="hero glass-card">
        <text class="hero-kicker">CO-BUILD TAOYUAN</text>
        <text class="hero-title">共建桃源</text>
        <text class="hero-copy">把对乡村环境、旅游、农业和公共服务的想法带到这里，一起把桃源变得更好。</text>
        <button class="publish-btn" @tap="publish">{{ authStore.isLoggedIn ? '发布建议' : '登录后发布' }}</button>
      </view>

      <SectionBlock class="section-gap" eyebrow="Filter" title="筛选建议" subtitle="按分类看看大家最近关注的话题">
        <input v-model.trim="keyword" class="search-input" placeholder="搜索标题或内容关键词" confirm-type="search" @confirm="applyFilter" />
        <FilterChips :options="FORUM_CATEGORY_OPTIONS" :model-value="category" @update:model-value="category = String($event || ''); applyFilter()" />
      </SectionBlock>

      <SectionBlock v-if="topPosts.length" class="section-gap" eyebrow="Top" title="置顶建议" subtitle="近期热度更高、优先值得看的建言">
        <view class="post-list">
          <ForumPostCard
            v-for="item in topPosts"
            :key="`top-${item.id}`"
            :post="item"
            @click="openDetail(item.id)"
            @like="toggleLike(item)"
          />
        </view>
      </SectionBlock>

      <view v-if="normalPosts.length" class="post-list section-gap">
        <ForumPostCard
          v-for="item in normalPosts"
          :key="item.id"
          :post="item"
          @click="openDetail(item.id)"
          @like="toggleLike(item)"
        />
      </view>

      <EmptyState
        v-else
        class="section-gap"
        title="暂时还没有匹配的建议"
        description="换个分类试试，或者发布你的第一条建言。"
        action-text="发布建议"
        @action="publish"
      />

      <AiFloatingButton :bottom-offset="AI_FAB_OFFSET.tab" />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.hero {
  padding: 30rpx 28rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  background: linear-gradient(135deg, rgba(31, 106, 69, 0.95), rgba(76, 143, 175, 0.88));
  color: $text-inverse;
}

.hero-kicker {
  font-size: 22rpx;
  letter-spacing: 4rpx;
  opacity: 0.84;
}

.hero-title {
  font-size: 50rpx;
  font-weight: 800;
}

.hero-copy {
  font-size: 24rpx;
  line-height: 1.7;
}

.publish-btn {
  margin-top: 8rpx;
  min-width: 220rpx;
  height: 76rpx;
  border-radius: 999rpx;
  background: rgba(255, 252, 246, 0.18);
  color: $text-inverse;
  font-size: 24rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-input {
  width: 100%;
  height: 78rpx;
  margin-bottom: 18rpx;
  padding: 0 26rpx;
  border-radius: 999rpx;
  background: rgba(31, 106, 69, 0.06);
  font-size: 26rpx;
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}
</style>

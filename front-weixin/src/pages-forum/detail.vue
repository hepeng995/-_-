<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

import AiFloatingButton from '@/components/AiFloatingButton.vue'
import CommentCard from '@/components/CommentCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import SectionBlock from '@/components/SectionBlock.vue'
import { forumApi } from '@/api/forum'
import type { ForumComment, ForumPost } from '@/types/models'
import { AI_FAB_OFFSET } from '@/utils/ai-fab'
import { useAuthStore } from '@/stores/auth'
import { goToLogin } from '@/utils/nav'

const authStore = useAuthStore()
const post = ref<ForumPost | null>(null)
const comments = ref<ForumComment[]>([])
const loading = ref(true)
const commentText = ref('')
const replyTo = ref<ForumComment | null>(null)

const loadPost = async (id: number) => {
  loading.value = true
  try {
    const [postResponse, commentResponse] = await Promise.all([
      forumApi.getPostById(id),
      forumApi.getCommentsByPostId(id),
    ])
    if (postResponse.code === 200) post.value = postResponse.data || null
    if (commentResponse.code === 200) comments.value = commentResponse.data || []
  } finally {
    loading.value = false
  }
}

const submitComment = async () => {
  if (!post.value) return
  if (!authStore.isLoggedIn) {
    goToLogin()
    return
  }
  if (!commentText.value.trim()) {
    uni.showToast({ title: '请先输入评论内容', icon: 'none' })
    return
  }
  await forumApi.createComment({
    postId: post.value.id,
    content: commentText.value.trim(),
    parentId: replyTo.value?.id,
  })
  commentText.value = ''
  replyTo.value = null
  loadPost(post.value.id)
}

const likePost = async () => {
  if (!post.value) return
  if (!authStore.isLoggedIn) {
    goToLogin()
    return
  }
  await forumApi.togglePostLike(post.value.id)
  loadPost(post.value.id)
}

const likeComment = async (comment: ForumComment) => {
  if (!authStore.isLoggedIn) {
    goToLogin()
    return
  }
  await forumApi.toggleCommentLike(comment.id)
  if (post.value) loadPost(post.value.id)
}

onLoad((query = {}) => {
  const id = Number(query.id)
  if (id) loadPost(id)
})
</script>

<template>
  <view class="page-shell safe-bottom">
    <view class="page-padding">
      <template v-if="post">
        <view class="hero glass-card">
          <text class="hero-tag">{{ post.categoryDesc || '乡村建言' }}</text>
          <text class="hero-title">{{ post.title }}</text>
          <text class="hero-copy">{{ post.content }}</text>
          <button class="like-btn" @tap="likePost">{{ post.isLiked ? '已点赞' : '点赞建议' }} {{ post.likeCount || 0 }}</button>
        </view>

        <SectionBlock class="section-gap" eyebrow="Comments" title="评论区" subtitle="欢迎就这个议题继续补充想法">
          <view class="composer">
            <text v-if="replyTo" class="reply-hint">正在回复：{{ replyTo.realName || replyTo.username }}</text>
            <textarea v-model.trim="commentText" class="comment-input" placeholder="输入你的看法，建设性的建议更容易被看见" />
            <view class="composer-actions">
              <button class="ghost-btn" @tap="replyTo = null">取消回复</button>
              <button class="primary-btn" @tap="submitComment">发表评论</button>
            </view>
          </view>
          <view v-if="comments.length" class="comment-list">
            <CommentCard
              v-for="item in comments"
              :key="item.id"
              :comment="item"
              @like="likeComment"
              @reply="replyTo = item"
            />
          </view>
          <EmptyState
            v-else
            class="section-gap"
            title="还没有评论"
            description="你可以发布第一条补充意见。"
          />
        </SectionBlock>
      </template>

      <AiFloatingButton :bottom-offset="AI_FAB_OFFSET.detail" />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.hero,
.composer {
  padding: 28rpx;
}

.hero {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.hero-tag {
  font-size: 22rpx;
  color: $brand-green;
}

.hero-title {
  font-size: 40rpx;
  color: $text-primary;
  font-weight: 800;
  line-height: 1.35;
}

.hero-copy {
  font-size: 26rpx;
  line-height: 1.8;
  color: $text-secondary;
}

.like-btn,
.ghost-btn,
.primary-btn {
  min-width: 160rpx;
  height: 72rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.like-btn,
.ghost-btn {
  background: rgba(31, 106, 69, 0.08);
  color: $brand-green;
}

.primary-btn {
  background: linear-gradient(135deg, $brand-green, $brand-green-soft);
  color: $text-inverse;
}

.composer {
  border-radius: 24rpx;
  background: rgba(31, 106, 69, 0.05);
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.reply-hint {
  font-size: 22rpx;
  color: $brand-green;
}

.comment-input {
  width: 100%;
  min-height: 160rpx;
  padding: 0;
  font-size: 24rpx;
  line-height: 1.7;
}

.composer-actions,
.comment-list {
  display: flex;
  gap: 16rpx;
}

.composer-actions {
  justify-content: flex-end;
}

.comment-list {
  margin-top: 18rpx;
  flex-direction: column;
}
</style>

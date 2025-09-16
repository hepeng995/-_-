<template>
  <div class="forum-detail-container">
    <!-- 帖子详情 -->
    <div class="post-detail" v-loading="loading">
      <el-card v-if="postDetail" class="post-card">
        <!-- 帖子头部 -->
        <div class="post-header">
          <div class="header-left">
            <div class="post-meta">
              <el-tag v-if="postDetail.isTop" type="danger" size="small">置顶</el-tag>
              <el-tag v-if="postDetail.isFeatured" type="warning" size="small">推荐</el-tag>
              <el-tag :type="getCategoryTagType(postDetail.category)" size="small">
                {{ postDetail.categoryDesc }}
              </el-tag>
              <span class="post-time">{{ formatTime(postDetail.createdAt) }}</span>
            </div>
            <h1 class="post-title">{{ postDetail.title }}</h1>
          </div>
          <div class="header-right">
            <el-button @click="goBack" :icon="ArrowLeft">返回列表</el-button>
          </div>
        </div>

        <!-- 作者信息 -->
        <div class="author-info">
          <el-avatar :src="postDetail.userAvatar" :size="48">
            <el-icon><User /></el-icon>
          </el-avatar>
          <div class="author-details">
            <div class="author-name">{{ postDetail.username || postDetail.realName }}</div>
            <div class="author-meta">发布于 {{ formatFullTime(postDetail.createdAt) }}</div>
          </div>
        </div>

        <!-- 帖子内容 -->
        <div class="post-content">
          <div class="content-text" v-html="postDetail.content"></div>
          
          <!-- 图片展示 -->
          <div class="post-images" v-if="postDetail.images && postDetail.images.length > 0">
            <img 
              v-for="(image, index) in postDetail.images" 
              :key="index"
              :src="getImageUrl(image)"
              class="post-image"
              @click="previewImage(postDetail.images, index)"
            >
          </div>
        </div>

        <!-- 帖子统计和操作 -->
        <div class="post-actions">
          <div class="post-stats">
            <span class="stat-item">
              <el-icon><View /></el-icon>
              <span>{{ postDetail.viewCount }} 浏览</span>
            </span>
            <span class="stat-item">
              <el-icon><ChatRound /></el-icon>
              <span>{{ postDetail.commentCount }} 评论</span>
            </span>
          </div>
          
          <div class="action-buttons">
            <el-button 
              :type="postDetail.isLiked ? 'danger' : 'default'"
              :icon="postDetail.isLiked ? StarFilled : Star"
              @click="toggleLike"
              :disabled="!userStore.isLoggedIn"
            >
              {{ postDetail.isLiked ? '已点赞' : '点赞' }} ({{ postDetail.likeCount }})
            </el-button>
            <el-button 
              type="primary"
              :icon="Edit"
              @click="scrollToComment"
              v-if="userStore.isLoggedIn"
            >
              发表评论
            </el-button>
            <el-button 
              type="primary"
              @click="goToLogin"
              v-else
            >
              登录后评论
            </el-button>
          </div>
        </div>

        <!-- 管理员回复功能已移除 -->
      </el-card>
    </div>

    <!-- 评论区域 -->
    <div class="comments-section">
      <el-card class="comments-card">
        <template #header>
          <div class="comments-header">
            <h3>评论区 ({{ comments.length }})</h3>
            <el-select v-model="commentSort" @change="getComments" size="small">
              <el-option label="最新评论" value="latest" />
              <el-option label="最早评论" value="earliest" />
            </el-select>
          </div>
        </template>

        <!-- 发表评论表单 -->
        <div class="comment-form" ref="commentFormRef" v-if="userStore.isLoggedIn">
          <div class="form-header">
            <el-avatar :src="userStore.userInfo?.avatar" :size="40">
              <el-icon><User /></el-icon>
            </el-avatar>
            <span class="current-user">{{ userStore.userInfo?.username }}</span>
          </div>
          
          <el-form :model="commentForm" :rules="commentRules" ref="commentFormRefEl">
            <el-form-item prop="content">
              <el-input
                v-model="commentForm.content"
                type="textarea"
                :rows="4"
                placeholder="发表您的评论..."
                maxlength="500"
                show-word-limit
              />
            </el-form-item>
            <el-form-item>
              <div class="form-actions">
                <el-button @click="resetCommentForm">清空</el-button>
                <el-button type="primary" @click="submitComment" :loading="submittingComment">
                  发表评论
                </el-button>
              </div>
            </el-form-item>
          </el-form>
        </div>

        <!-- 评论列表 -->
        <div class="comments-list" v-loading="commentsLoading">
          <el-empty v-if="comments.length === 0 && !commentsLoading" description="暂无评论">
            <el-button type="primary" @click="scrollToComment" v-if="userStore.isLoggedIn">
              发表第一条评论
            </el-button>
          </el-empty>

          <div class="comment-item" v-for="comment in comments" :key="comment.id">
            <!-- 主评论 -->
            <div class="comment-main">
              <div class="comment-avatar">
                <el-avatar :src="comment.userAvatar" :size="40">
                  <el-icon><User /></el-icon>
                </el-avatar>
              </div>
              
              <div class="comment-content">
                <div class="comment-header">
                  <span class="comment-author">{{ comment.username || comment.realName }}</span>
                  <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
                </div>
                
                <div class="comment-text">{{ comment.content }}</div>
                
                <div class="comment-actions">
                  <span 
                    class="action-btn like-btn" 
                    :class="{ active: comment.isLiked }"
                    @click="toggleCommentLike(comment)"
                    v-if="userStore.isLoggedIn"
                  >
                    <el-icon><StarFilled v-if="comment.isLiked" /><Star v-else /></el-icon>
                    <span>{{ comment.likeCount > 0 ? comment.likeCount : '点赞' }}</span>
                  </span>
                  
                  
                </div>

                <!-- 回复表单 -->
                
              </div>
            </div>

            <!-- 回复列表 -->
            <div class="replies-list" v-if="comment.replies && comment.replies.length > 0">
              <div class="reply-item" v-for="reply in comment.replies" :key="reply.id">
                <div class="reply-avatar">
                  <el-avatar :src="reply.userAvatar" :size="32">
                    <el-icon><User /></el-icon>
                  </el-avatar>
                </div>
                
                <div class="reply-content">
                  <div class="reply-header">
                    <span class="reply-author">{{ reply.username || reply.realName }}</span>
                    <span class="reply-time">{{ formatTime(reply.createdAt) }}</span>
                  </div>
                  
                  <div class="reply-text">
                    <span class="reply-target" v-if="reply.parentUsername">
                      回复 @{{ reply.parentUsername }}:
                    </span>
                    {{ reply.content }}
                  </div>
                  
                  <div class="reply-actions">
                    <span 
                      class="action-btn like-btn" 
                      :class="{ active: reply.isLiked }"
                      @click="toggleCommentLike(reply)"
                      v-if="userStore.isLoggedIn"
                    >
                      <el-icon><StarFilled v-if="reply.isLiked" /><Star v-else /></el-icon>
                      <span>{{ reply.likeCount > 0 ? reply.likeCount : '点赞' }}</span>
                    </span>
                    
                    <span 
                      class="action-btn reply-btn"
                      @click="showReplyForm(reply, comment)"
                      v-if="userStore.isLoggedIn"
                    >
                      <el-icon><ChatRound /></el-icon>
                      <span>回复</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 评论分页 -->
        <div class="comments-pagination" v-if="commentTotal > 0">
          <el-pagination
            :current-page="commentQuery.current"
            :page-size="commentQuery.size"
            :small="true"
            :disabled="commentsLoading"
            :background="true"
            layout="prev, pager, next"
            :total="commentTotal"
            @current-change="handleCommentPageChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 图片预览 -->
    <el-image-viewer
      v-if="imageViewerVisible"
      :url-list="previewImages"
      :initial-index="previewIndex"
      @close="imageViewerVisible = false"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { 
  ArrowLeft,
  User, 
  View, 
  Star, 
  StarFilled, 
  ChatRound,
  Edit,
  Service
} from '@element-plus/icons-vue'
import { forumPostAPI, forumCommentAPI } from '@/api/forum'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 响应式数据
const loading = ref(false)
const postDetail = ref(null)
const comments = ref([])
const commentsLoading = ref(false)
const commentTotal = ref(0)
const commentSort = ref('latest')

// 评论查询参数
const commentQuery = reactive({
  current: 1,
  size: 10,
  postId: route.params.id,
  status: 1 // 只显示已审核的评论
})

// 评论表单
const commentFormRefEl = ref()
const commentForm = reactive({
  content: '',
  postId: route.params.id
})

const commentRules = {
  content: [
    { required: true, message: '请输入评论内容', trigger: 'blur' },
    { min: 1, max: 500, message: '评论长度在 1 到 500 个字符', trigger: 'blur' }
  ]
}

const submittingComment = ref(false)

// 回复表单
const replyFormRef = ref()
const replyingCommentId = ref(null)
const replyForm = reactive({
  content: '',
  postId: route.params.id,
  parentId: null,
  targetUsername: ''
})

const replyRules = {
  content: [
    { required: true, message: '请输入回复内容', trigger: 'blur' },
    { min: 1, max: 300, message: '回复长度在 1 到 300 个字符', trigger: 'blur' }
  ]
}

const submittingReply = ref(false)

// 图片预览
const imageViewerVisible = ref(false)
const previewImages = ref([])
const previewIndex = ref(0)
const commentFormRef = ref()

// 获取帖子详情
const getPostDetail = async () => {
  loading.value = true
  try {
    const response = await forumPostAPI.getPostById(route.params.id)
    postDetail.value = response.data
    
    // 处理图片数据，参考product-detail.vue的处理方式
    if (postDetail.value && postDetail.value.images) {
      if (typeof postDetail.value.images === 'string') {
        try {
          postDetail.value.images = JSON.parse(postDetail.value.images)
        } catch (e) {
          console.warn('解析帖子图片JSON失败:', e)
          postDetail.value.images = []
        }
      }
      if (!Array.isArray(postDetail.value.images)) {
        postDetail.value.images = []
      }
    } else if (postDetail.value) {
      postDetail.value.images = []
    }
    
    // 后端在获取帖子详情时已经自动增加了浏览次数，无需单独调用
    
  } catch (error) {
    console.error('获取帖子详情失败:', error)
    ElMessage.error('获取帖子详情失败')
    router.push('/forum')
  } finally {
    loading.value = false
  }
}

// 获取评论列表
const getComments = async () => {
  commentsLoading.value = true
  try {
    // 设置排序
    if (commentSort.value === 'earliest') {
      commentQuery.orderBy = 'created_at'
      commentQuery.isAsc = true
    } else {
      commentQuery.orderBy = 'created_at'
      commentQuery.isAsc = false
    }
    
    const response = await forumCommentAPI.getCommentList(commentQuery)
    const data = response.data
    
    comments.value = data.records || []
    commentTotal.value = data.total || 0
    
  } catch (error) {
    console.error('获取评论列表失败:', error)
    ElMessage.error('获取评论列表失败')
  } finally {
    commentsLoading.value = false
  }
}

// 提交评论
const submitComment = async () => {
  if (!commentFormRefEl.value) return
  
  try {
    await commentFormRefEl.value.validate()
    
    submittingComment.value = true
    
    await forumCommentAPI.createComment(commentForm)
    
    // ElMessage.success('评论发表成功，请等待管理员审核')
    resetCommentForm()
    getComments()
    
    // 更新帖子评论数
    if (postDetail.value) {
      postDetail.value.commentCount++
    }
    
  } catch (error) {
    console.error('发表评论失败:', error)
    ElMessage.error('发表评论失败，请重试')
  } finally {
    submittingComment.value = false
  }
}

// 重置评论表单
const resetCommentForm = () => {
  commentForm.content = ''
  if (commentFormRefEl.value) {
    commentFormRefEl.value.clearValidate()
  }
}

// 显示回复表单
const showReplyForm = (comment, parentComment = null) => {
  // 如果是回复子评论，需要找到顶级评论
  const topComment = parentComment || comment
  replyingCommentId.value = topComment.id
  replyForm.parentId = comment.id
  replyForm.content = ''
  
  // 设置回复目标用户名，用于显示提示
  const targetUsername = comment.username || comment.realName
  replyForm.targetUsername = targetUsername
}

// 取消回复
const cancelReply = () => {
  replyingCommentId.value = null
  replyForm.parentId = null
  replyForm.content = ''
  replyForm.targetUsername = ''
}

// 提交回复
const submitReply = async () => {
  if (!replyFormRef.value) return
  
  try {
    await replyFormRef.value.validate()
    
    submittingReply.value = true
    
    await forumCommentAPI.createComment(replyForm)
    
    ElMessage.success('回复发表成功，请等待管理员审核')
    cancelReply()
    getComments()
    
  } catch (error) {
    console.error('发表回复失败:', error)
    ElMessage.error('发表回复失败，请重试')
  } finally {
    submittingReply.value = false
  }
}

// 评论分页
const handleCommentPageChange = (page) => {
  commentQuery.current = page
  getComments()
}

// 点赞帖子
const toggleLike = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录后再点赞')
    goToLogin()
    return
  }
  
  try {
    if (postDetail.value.isLiked) {
      await forumPostAPI.unlikePost(postDetail.value.id)
      postDetail.value.isLiked = false
      postDetail.value.likeCount--
    } else {
      await forumPostAPI.likePost(postDetail.value.id)
      postDetail.value.isLiked = true
      postDetail.value.likeCount++
    }
  } catch (error) {
    console.error('点赞操作失败:', error)
    ElMessage.error('操作失败，请重试')
  }
}

// 点赞评论
const toggleCommentLike = async (comment) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录后再点赞')
    goToLogin()
    return
  }
  
  try {
    if (comment.isLiked) {
      await forumCommentAPI.unlikeComment(comment.id)
      comment.isLiked = false
      comment.likeCount = Math.max(0, (comment.likeCount || 1) - 1)
    } else {
      await forumCommentAPI.likeComment(comment.id)
      comment.isLiked = true
      comment.likeCount = (comment.likeCount || 0) + 1
    }
  } catch (error) {
    console.error('点赞操作失败:', error)
    ElMessage.error('操作失败，请重试')
  }
}

// 滚动到评论区
const scrollToComment = () => {
  if (commentFormRef.value) {
    commentFormRef.value.scrollIntoView({ behavior: 'smooth' })
  }
}

// 返回列表
const goBack = () => {
  router.push('/forum')
}

// 跳转到登录
const goToLogin = () => {
  router.push('/login')
}

// 预览图片
const previewImage = (images, index) => {
  previewImages.value = images.map(img => getImageUrl(img))
  previewIndex.value = index
  imageViewerVisible.value = true
}

// 获取图片URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return ''
  if (imagePath.startsWith('http')) return imagePath
  // 如果已经是完整的下载路径，直接返回
  if (imagePath.startsWith('/api/file/download/')) return imagePath
  // 处理文件名，构建完整的下载URL
  const fileName = imagePath.replace(/^\/api\/file\/download\//, '')
  return `/api/file/download/${fileName}`
}

// 获取分类标签类型
const getCategoryTagType = (category) => {
  const typeMap = {
    'environment': 'success',
    'infrastructure': 'warning',
    'agriculture': 'primary',
    'tourism': 'info',
    'education': 'danger',
    'other': ''
  }
  return typeMap[category] || ''
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
  
  return date.toLocaleDateString('zh-CN')
}

// 格式化完整时间
const formatFullTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleString('zh-CN')
}

// 生命周期
onMounted(() => {
  getPostDetail()
  getComments()
})
</script>

<style scoped>
.forum-detail-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
}

/* 帖子详情卡片 */
.post-card {
  margin-bottom: 20px;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.post-time {
  color: #666;
  font-size: 14px;
}

.post-title {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin: 0;
  line-height: 1.3;
}

/* 作者信息 */
.author-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 24px;
}

.author-name {
  font-weight: 600;
  color: #333;
  font-size: 16px;
}

.author-meta {
  color: #666;
  font-size: 14px;
}

/* 帖子内容 */
.post-content {
  margin-bottom: 24px;
}

.content-text {
  font-size: 16px;
  line-height: 1.8;
  color: #333;
  margin-bottom: 20px;
  white-space: pre-wrap;
}

.post-images {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.post-image {
  width: 100%;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.post-image:hover {
  transform: scale(1.02);
}

/* 帖子操作 */
.post-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}

.post-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 14px;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

/* 管理员回复 */
.admin-reply {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  margin-top: 20px;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: #007bff;
  font-weight: 600;
}

.reply-time {
  margin-left: auto;
  color: #666;
  font-size: 14px;
  font-weight: normal;
}

.reply-content {
  color: #333;
  line-height: 1.6;
}

/* 评论区域 */
.comments-card {
  margin-top: 20px;
}

.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comments-header h3 {
  margin: 0;
  color: #333;
}

/* 评论表单 */
.comment-form {
  margin-bottom: 24px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.form-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.current-user {
  font-weight: 600;
  color: #333;
}

.form-actions {
  text-align: right;
}

/* 评论列表 */
.comment-item {
  border-bottom: 1px solid #eee;
  padding: 20px 0;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-main {
  display: flex;
  gap: 12px;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.comment-author {
  font-weight: 600;
  color: #333;
}

.comment-time {
  color: #666;
  font-size: 14px;
}

.comment-text {
  color: #333;
  line-height: 1.6;
  margin-bottom: 12px;
}

.comment-actions {
  display: flex;
  gap: 16px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.action-btn:hover {
  color: #409EFF;
}

.like-btn.active {
  color: #f56c6c;
}

/* 回复表单 */
.reply-form {
  margin-top: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
}

.reply-actions {
  text-align: right;
}

/* 回复列表 */
.replies-list {
  margin-top: 16px;
  margin-left: 52px;
  border-left: 2px solid #eee;
  padding-left: 16px;
}

.reply-item {
  display: flex;
  gap: 8px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.reply-item:last-child {
  border-bottom: none;
}

.reply-content {
  flex: 1;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.reply-author {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.reply-time {
  color: #666;
  font-size: 12px;
}

.reply-text {
  color: #333;
  line-height: 1.5;
  margin-bottom: 8px;
  font-size: 14px;
}

.reply-target {
  color: #409EFF;
}

.reply-actions {
  display: flex;
  gap: 12px;
}

/* 评论分页 */
.comments-pagination {
  margin-top: 20px;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .forum-detail-container {
    padding: 15px;
  }
  
  .post-header {
    flex-direction: column;
    gap: 15px;
  }
  
  .post-title {
    font-size: 24px;
  }
  
  .post-actions {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .author-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .comment-main {
    flex-direction: column;
    gap: 8px;
  }
  
  .replies-list {
    margin-left: 20px;
    padding-left: 12px;
  }
}
</style>

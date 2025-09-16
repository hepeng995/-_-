<template>
  <div class="forum-container">
    <!-- 论坛头部 -->
    <div class="forum-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="forum-title">建言献策</h1>
          <p class="forum-subtitle">为家乡发展建言献策，共同打造美丽乡村</p>
        </div>
        <div class="header-right">
          <el-button 
            type="primary" 
            size="large"
            :icon="Plus"
            @click="showPublishDialog"
            v-if="userStore.isLoggedIn"
          >
            发布建议
          </el-button>
          <el-button 
            v-else
            type="primary" 
            size="large"
            @click="goToLogin"
          >
            登录后发布
          </el-button>
        </div>
      </div>
    </div>

    <!-- 分类筛选 -->
    <div class="category-filter">
      <div class="filter-container">
        <el-radio-group v-model="selectedCategory" @change="handleCategoryChange">
          <el-radio-button label="">全部</el-radio-button>
          <el-radio-button label="environment">环境问题</el-radio-button>
          <el-radio-button label="infrastructure">基础设施</el-radio-button>
          <el-radio-button label="agriculture">农业发展</el-radio-button>
          <el-radio-button label="tourism">旅游发展</el-radio-button>
          <el-radio-button label="education">教育文化</el-radio-button>
          <el-radio-button label="other">其他</el-radio-button>
        </el-radio-group>
        
        <div class="filter-right">
          <el-select v-model="sortBy" @change="handleSortChange" class="sort-select">
            <el-option label="最新发布" value="latest" />
            <el-option label="最多点赞" value="likes" />
            <el-option label="最多浏览" value="views" />
            <el-option label="最多评论" value="comments" />
          </el-select>
        </div>
      </div>
    </div>

    <!-- 帖子列表 -->
    <div class="posts-list" v-loading="loading">
      <div class="posts-container">
        <!-- 置顶帖子 -->
        <div v-if="topPosts.length > 0" class="top-posts-section">
          <h3 class="section-title">
            <el-icon><Top /></el-icon>
            置顶建议
          </h3>
          <div class="post-item top-post" v-for="post in topPosts" :key="`top-${post.id}`" @click="goToDetail(post.id)">
            <div class="post-header">
              <div class="post-meta">
                <el-tag type="danger" size="small" class="top-tag">置顶</el-tag>
                <el-tag :type="getCategoryTagType(post.category)" size="small">
                  {{ post.categoryDesc }}
                </el-tag>
                <span class="post-time">{{ formatTime(post.createdAt) }}</span>
              </div>
              <div class="post-status" v-if="post.isFeatured">
                <el-tag type="warning" size="small">推荐</el-tag>
              </div>
            </div>
            <h3 class="post-title">{{ post.title }}</h3>
            <div class="post-content" v-html="post.content.substring(0, 200) + (post.content.length > 200 ? '...' : '')"></div>
            <div class="post-images" v-if="post.images && post.images.length > 0">
              <img 
                v-for="(image, index) in post.images.slice(0, 3)" 
                :key="index"
                :src="getImageUrl(image)"
                class="post-image"
                @click.stop="previewImage(post.images, index)"
              >
              <div v-if="post.images.length > 3" class="more-images">+{{ post.images.length - 3 }}</div>
            </div>
            <div class="post-footer">
              <div class="post-author">
                <el-avatar :src="post.userAvatar" :size="24">
                  <el-icon><User /></el-icon>
                </el-avatar>
                <span class="author-name">{{ post.username || post.realName }}</span>
              </div>
              <div class="post-stats">
                <span class="stat-item">
                  <el-icon><View /></el-icon>
                  {{ post.viewCount }}
                </span>
                <span class="stat-item like-btn" :class="{ active: post.isLiked }" @click.stop="toggleLike(post)">
                  <el-icon><StarFilled v-if="post.isLiked" /><Star v-else /></el-icon>
                  {{ post.likeCount }}
                </span>
                <span class="stat-item">
                  <el-icon><ChatRound /></el-icon>
                  {{ post.commentCount }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 普通帖子 -->
        <div class="normal-posts-section">
          <h3 class="section-title" v-if="topPosts.length > 0">
            <el-icon><List /></el-icon>
            最新建议
          </h3>
          
          <!-- 空状态 -->
          <el-empty v-if="posts.length === 0 && !loading" description="暂无建议帖子">
            <el-button type="primary" @click="showPublishDialog" v-if="userStore.isLoggedIn">发布第一个建议</el-button>
            <el-button type="primary" @click="goToLogin" v-else>登录后发布</el-button>
          </el-empty>
          
          <!-- 帖子列表 -->
          <div class="post-item" v-for="post in posts" :key="post.id" @click="goToDetail(post.id)">
            <div class="post-header">
              <div class="post-meta">
                <el-tag :type="getCategoryTagType(post.category)" size="small">
                  {{ post.categoryDesc }}
                </el-tag>
                <span class="post-time">{{ formatTime(post.createdAt) }}</span>
              </div>
              <div class="post-status">
                <el-tag v-if="post.isFeatured" type="warning" size="small">推荐</el-tag>
              </div>
            </div>
            <h3 class="post-title">{{ post.title }}</h3>
            <div class="post-content" v-html="post.content.substring(0, 200) + (post.content.length > 200 ? '...' : '')"></div>
            <div class="post-images" v-if="post.images && post.images.length > 0">
              <img 
                v-for="(image, index) in post.images.slice(0, 3)" 
                :key="index"
                :src="getImageUrl(image)"
                class="post-image"
                @click.stop="previewImage(post.images, index)"
              >
              <div v-if="post.images.length > 3" class="more-images">+{{ post.images.length - 3 }}</div>
            </div>
            <div class="post-footer">
              <div class="post-author">
                <el-avatar :src="post.userAvatar" :size="24">
                  <el-icon><User /></el-icon>
                </el-avatar>
                <span class="author-name">{{ post.username || post.realName }}</span>
              </div>
              <div class="post-stats">
                <span class="stat-item">
                  <el-icon><View /></el-icon>
                  {{ post.viewCount }}
                </span>
                <span class="stat-item like-btn" :class="{ active: post.isLiked }" @click.stop="toggleLike(post)">
                  <el-icon><StarFilled v-if="post.isLiked" /><Star v-else /></el-icon>
                  {{ post.likeCount }}
                </span>
                <span class="stat-item">
                  <el-icon><ChatRound /></el-icon>
                  {{ post.commentCount }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination-container" v-if="total > 0">
      <el-pagination
        :current-page="queryParams.current"
        :page-size="queryParams.size"
        :page-sizes="[10, 20, 30, 50]"
        :small="false"
        :disabled="loading"
        :background="true"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 发布帖子对话框 -->
    <el-dialog
      v-model="publishDialogVisible"
      title="发布建议"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-form :model="publishForm" :rules="publishRules" ref="publishFormRef" label-width="100px">
        <el-form-item label="建议标题" prop="title">
          <el-input 
            v-model="publishForm.title" 
            placeholder="请输入建议标题，简明扼要地概括您的建议"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="建议类型" prop="category">
          <el-select v-model="publishForm.category" placeholder="请选择建议类型">
            <el-option label="环境问题" value="environment" />
            <el-option label="基础设施" value="infrastructure" />
            <el-option label="农业发展" value="agriculture" />
            <el-option label="旅游发展" value="tourism" />
            <el-option label="教育文化" value="education" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="建议内容" prop="content">
          <el-input 
            v-model="publishForm.content" 
            type="textarea" 
            :rows="8"
            placeholder="请详细描述您的建议内容..."
            maxlength="2000"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="相关图片">
          <el-upload
            :file-list="publishForm.imageFiles"
            action="/api/file/upload"
            :headers="uploadHeaders"
            list-type="picture-card"
            :on-success="handleUploadSuccess"
            :on-remove="handleUploadRemove"
            :before-upload="beforeUpload"
            accept="image/*"
            :limit="5"
          >
            <el-icon><Plus /></el-icon>
            <template #tip>
              <div class="el-upload__tip">只能上传jpg/png文件，且不超过2MB，最多5张</div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="publishDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitPost" :loading="submitting">发布建议</el-button>
        </div>
      </template>
    </el-dialog>

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
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus, 
  Top, 
  List, 
  User, 
  View, 
  Star, 
  StarFilled, 
  ChatRound 
} from '@element-plus/icons-vue'
import { forumPostAPI, forumUtils } from '@/api/forum'

const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const loading = ref(false)
const posts = ref([])
const topPosts = ref([])
const total = ref(0)
const selectedCategory = ref('')
const sortBy = ref('latest')

// 查询参数
const queryParams = reactive({
  current: 1,
  size: 10,
  category: '',
  title: '',
  status: 1 // 只显示已通过审核的帖子
})

// 发布对话框
const publishDialogVisible = ref(false)
const submitting = ref(false)
const publishFormRef = ref()
const publishForm = reactive({
  title: '',
  content: '',
  category: '',
  images: [],
  imageFiles: []
})

const publishRules = {
  title: [
    { required: true, message: '请输入建议标题', trigger: 'blur' },
    { min: 5, max: 100, message: '标题长度在 5 到 100 个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择建议类型', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入建议内容', trigger: 'blur' },
    { min: 10, max: 2000, message: '内容长度在 10 到 2000 个字符', trigger: 'blur' }
  ]
}

// 图片预览
const imageViewerVisible = ref(false)
const previewImages = ref([])
const previewIndex = ref(0)

// 上传Headers
const uploadHeaders = computed(() => {
  const token = sessionStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
})

// 获取帖子列表
const getPosts = async () => {
  loading.value = true
  try {
    const response = await forumPostAPI.getPostList(queryParams)
    const data = response.data
    
    // 处理图片数据
    const processedPosts = (data.records || []).map(post => {
      // 确保images是数组格式
      if (typeof post.images === 'string') {
        try {
          post.images = JSON.parse(post.images)
        } catch (e) {
          post.images = []
        }
      }
      if (!Array.isArray(post.images)) {
        post.images = []
      }
      return post
    })
    
    posts.value = processedPosts
    total.value = data.total || 0
    
    // 分离置顶帖子
    topPosts.value = posts.value.filter(post => post.isTop)
    posts.value = posts.value.filter(post => !post.isTop)
    
  } catch (error) {
    console.error('获取帖子列表失败:', error)
    ElMessage.error('获取帖子列表失败')
  } finally {
    loading.value = false
  }
}

// 分类改变
const handleCategoryChange = (category) => {
  queryParams.category = category
  queryParams.current = 1
  getPosts()
}

// 排序改变
const handleSortChange = (sort) => {
  queryParams.current = 1
  // 根据排序方式调整查询参数
  switch (sort) {
    case 'likes':
      queryParams.orderBy = 'like_count'
      queryParams.isAsc = false
      break
    case 'views':
      queryParams.orderBy = 'view_count'
      queryParams.isAsc = false
      break
    case 'comments':
      queryParams.orderBy = 'comment_count'
      queryParams.isAsc = false
      break
    default:
      queryParams.orderBy = 'created_at'
      queryParams.isAsc = false
  }
  getPosts()
}

// 分页改变
const handleSizeChange = (size) => {
  queryParams.size = size
  getPosts()
}

const handleCurrentChange = (current) => {
  queryParams.current = current
  getPosts()
}

// 显示发布对话框
const showPublishDialog = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录后再发布建议')
    goToLogin()
    return
  }
  publishDialogVisible.value = true
}

// 提交帖子
const submitPost = async () => {
  if (!publishFormRef.value) return
  
  try {
    await publishFormRef.value.validate()
    
    submitting.value = true
    
    const postData = {
      title: publishForm.title,
      content: publishForm.content,
      category: publishForm.category,
      images: publishForm.images
    }
    
    await forumPostAPI.createPost(postData)
    
    ElMessage.success('建议发布成功，请等待管理员审核')
    publishDialogVisible.value = false
    resetPublishForm()
    getPosts()
    
  } catch (error) {
    console.error('发布建议失败:', error)
    ElMessage.error('发布建议失败，请重试')
  } finally {
    submitting.value = false
  }
}

// 重置发布表单
const resetPublishForm = () => {
  publishForm.title = ''
  publishForm.content = ''
  publishForm.category = ''
  publishForm.images = []
  publishForm.imageFiles = []
}

// 上传成功处理
const handleUploadSuccess = (response) => {
  console.log('上传成功响应:', response)
  if (response.code === 200) {
    publishForm.images.push(response.data)
    ElMessage.success('图片上传成功')
  } else {
    ElMessage.error('图片上传失败: ' + (response.message || '未知错误'))
  }
}

// 移除图片
const handleUploadRemove = (file, fileList) => {
  const index = publishForm.imageFiles.findIndex(f => f.uid === file.uid)
  if (index > -1) {
    publishForm.images.splice(index, 1)
  }
}

// 上传前验证
const beforeUpload = (file) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG) {
    ElMessage.error('只能上传 JPG/PNG 格式的图片!')
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
  }
  return isJPG && isLt2M
}

// 点赞/取消点赞
const toggleLike = async (post) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录后再点赞')
    goToLogin()
    return
  }
  
  try {
    if (post.isLiked) {
      await forumPostAPI.unlikePost(post.id)
      post.isLiked = false
      post.likeCount--
    } else {
      await forumPostAPI.likePost(post.id)
      post.isLiked = true
      post.likeCount++
    }
  } catch (error) {
    console.error('点赞操作失败:', error)
    ElMessage.error('操作失败，请重试')
  }
}

// 跳转到详情页
const goToDetail = (postId) => {
  router.push(`/forum/detail/${postId}`)
}

// 跳转到登录页
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

// 生命周期
onMounted(() => {
  getPosts()
})

// 监听登录状态变化
watch(() => userStore.isLoggedIn, (newVal) => {
  if (newVal) {
    getPosts() // 重新获取帖子，更新点赞状态
  }
})
</script>

<style scoped>
.forum-container {
  min-height: 100vh;
  background: #f5f7fa;
}

/* 论坛头部 */
.forum-header {
  background: linear-gradient(135deg, #fef7ff 0%, #e8fff7 50%, #d5fff7 100%);
  color: #581c87;
  padding: 50px 0;
  margin-bottom: 30px;
  position: relative;
  overflow: hidden;
}

.forum-header::before {
  content: '';
  position: absolute;
  top: -35%;
  left: -12%;
  width: 320px;
  height: 320px;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%);
  border-radius: 50%;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.forum-title {
  font-size: 42px;
  margin: 0 0 10px 0;
  font-weight: 700;
  background: linear-gradient(45deg, #6699ff, #859eff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  z-index: 1;
}

.forum-subtitle {
  font-size: 18px;
  margin: 0;
  color: #859eff;
  position: relative;
  z-index: 1;
}

/* 分类筛选 */
.category-filter {
  background: white;
  padding: 20px 0;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filter-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.sort-select {
  width: 120px;
}

/* 帖子列表 */
.posts-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  min-height: 400px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  color: #333;
  margin: 0 0 20px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #10b981;
}

.post-item {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.post-item:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.top-post {
  border-left: 4px solid #10b981;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.post-time {
  color: #666;
  font-size: 14px;
}

.top-tag {
  background: #10b981 !important;
  border-color: #10b981 !important;
  color: white !important;
}

.post-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.post-content {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 16px;
}

.post-images {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.post-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.post-image:hover {
  transform: scale(1.05);
}

.more-images {
  width: 80px;
  height: 80px;
  background: #f5f7fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 14px;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.post-author {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-name {
  font-size: 14px;
  color: #666;
}

.post-stats {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.stat-item:hover {
  color: #10b981;
}

.like-btn.active {
  color: #10b981;
}

/* 分页 */
.pagination-container {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
  display: flex;
  justify-content: center;
}

/* 对话框样式 */
.dialog-footer {
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }
  
  .forum-title {
    font-size: 28px;
  }
  
  .filter-container {
    flex-direction: column;
    gap: 15px;
  }
  
  .posts-list {
    padding: 0 15px;
  }
  
  .post-item {
    padding: 16px;
  }
  
  .post-footer {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .pagination-container {
    padding: 0 15px;
  }
}

@media (max-width: 480px) {
  .category-filter :deep(.el-radio-group) {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .post-images {
    flex-wrap: wrap;
  }
  
  .post-image,
  .more-images {
    width: 60px;
    height: 60px;
  }
}
</style>

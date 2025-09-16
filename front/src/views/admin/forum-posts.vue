<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <div class="filter-container">
      <el-form :inline="true" :model="queryParams" class="demo-form-inline">
        <el-form-item label="帖子标题">
          <el-input
            v-model="queryParams.keyword"
            placeholder="请输入帖子标题"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="建议类型" style="width: 180px">
          <el-select v-model="queryParams.category" placeholder="请选择类型" clearable>
            <el-option
              v-for="item in categoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="审核状态" style="width: 180px">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
            <el-option label="待审核" :value="0" />
            <el-option label="已通过" :value="1" />
            <el-option label="已拒绝" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="置顶" style="width: 150px">
          <el-select v-model="queryParams.isTop" placeholder="是否置顶" clearable>
            <el-option label="置顶" :value="true" />
            <el-option label="普通" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item label="推荐" style="width: 150px">
          <el-select v-model="queryParams.isFeatured" placeholder="是否推荐" clearable>
            <el-option label="推荐" :value="true" />
            <el-option label="普通" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleQuery">搜索</el-button>
          <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作工具栏 -->
    <div class="toolbar-container">
      <el-button type="primary" :icon="Plus" @click="handleAdd">发布帖子</el-button>
      <el-button type="success" :icon="Check" @click="handleBatchAudit(1)" :disabled="!hasSelection">批量通过</el-button>
      <el-button type="danger" :icon="Close" @click="handleBatchAudit(2)" :disabled="!hasSelection">批量拒绝</el-button>
    </div>

    <!-- 帖子列表 -->
    <el-table 
      v-loading="loading" 
      :data="postList" 
      border 
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="title" label="帖子标题" width="200px" show-overflow-tooltip>
        <template #default="scope">
          <div class="post-title">
            <el-tag v-if="scope.row.isTop" type="warning" size="small" style="margin-right: 8px;">置顶</el-tag>
            <el-tag v-if="scope.row.isFeatured" type="success" size="small" style="margin-right: 8px;">推荐</el-tag>
            {{ scope.row.title }}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="category" label="建议类型" width="120">
        <template #default="scope">
          <el-tag :type="getCategoryTagType(scope.row.category)">
            {{ getCategoryName(scope.row.category) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="username" label="发帖用户" width="120" />
      <el-table-column prop="viewCount" label="浏览量" width="100" />
      <el-table-column prop="likeCount" label="点赞数" width="100" />
      <el-table-column prop="commentCount" label="评论数" width="100" />
      <el-table-column prop="status" label="审核状态" width="100">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusName(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="发布时间" width="180">
        <template #default="scope">
          {{ formatDate(scope.row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="320"   fixed="right">
        <template #default="scope">
          <el-button size="small" type="primary" @click="handleView(scope.row)">查看</el-button>
          <el-button size="small" type="success" @click="handleEdit(scope.row)">编辑</el-button>
          
          <!-- 审核操作 - 一直显示 -->
          <el-dropdown @command="(command) => handleAudit(scope.row, command)"
            style="margin-left: 12px;">
            <el-button size="small" type="warning">
              审核<el-icon class="el-icon--right"><arrow-down /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="approve">通过</el-dropdown-item>
                <el-dropdown-item command="reject">拒绝</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          
          <!-- 管理操作 -->
          <el-dropdown @command="(command) => handleManage(scope.row, command)">
            <el-button size="small" type="warning" style="margin-left: 12px;">
              管理<el-icon class="el-icon--right"><arrow-down /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item :command="scope.row.isTop ? 'untop' : 'top'">
                  {{ scope.row.isTop ? '取消置顶' : '设置置顶' }}
                </el-dropdown-item>
                <el-dropdown-item :command="scope.row.isFeatured ? 'unfeatured' : 'featured'">
                  {{ scope.row.isFeatured ? '取消推荐' : '设置推荐' }}
                </el-dropdown-item>
                <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        :current-page="queryParams.current"
        :page-size="queryParams.size"
        :page-sizes="[10, 20, 50, 100]"
        :small="false"
        :disabled="loading"
        :background="true"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 帖子详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="帖子详情"
      width="50%"
      :before-close="handleCloseDetail"
    >
      <div v-if="currentPost" class="post-detail">
        <div class="post-header">
          <h2>{{ currentPost.title }}</h2>
          <div class="post-meta">
            <el-tag :type="getCategoryTagType(currentPost.category)">
              {{ getCategoryName(currentPost.category) }}
            </el-tag>
            <span class="meta-item">发帖用户：{{ currentPost.username }}</span>
            <span class="meta-item">发布时间：{{ formatDate(currentPost.createdAt) }}</span>
            <span class="meta-item">浏览量：{{ currentPost.viewCount }}</span>
            <span class="meta-item">点赞数：{{ currentPost.likeCount }}</span>
            <span class="meta-item">评论数：{{ currentPost.commentCount }}</span>
          </div>
        </div>
        <div class="post-content" v-html="currentPost.content"></div>
        <div v-if="currentPost.images" class="post-images">
          <el-image
            v-for="(image, index) in parseImages(currentPost.images)"
            :key="index"
            :src="image"
            style="width: 200px; height: 150px; margin: 5px;"
            fit="cover"
            :preview-src-list="parseImages(currentPost.images)"
          />
        </div>
        <!-- 管理员回复功能已移除 -->
      </div>
    </el-dialog>

    <!-- 帖子表单对话框 -->
    <el-dialog
      v-model="formVisible"
      :title="formMode === 'add' ? '发布帖子' : '编辑帖子'"
      width="60%"
      :before-close="handleCloseForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="帖子标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入帖子标题" />
        </el-form-item>
        <el-form-item label="建议类型" prop="category">
          <el-select v-model="form.category" placeholder="请选择建议类型">
            <el-option
              v-for="item in categoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="帖子内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="8"
            placeholder="请输入帖子内容"
          />
        </el-form-item>
        <el-form-item label="图片上传">
          <el-upload
            ref="uploadRef"
            :action="uploadUrl"
            :headers="uploadHeaders"
            :file-list="fileList"
            :on-success="handleUploadSuccess"
            :on-remove="handleRemoveFile"
            :on-change="handleFileChange"
            :before-upload="beforeUpload"
            list-type="picture-card"
            multiple
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseForm">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 审核对话框 -->
    <el-dialog
      v-model="auditVisible"
      title="审核帖子"
      width="50%"
    >
      <el-form ref="auditFormRef" :model="auditForm" :rules="auditRules" label-width="100px">
        <el-form-item label="审核结果" prop="status">
          <el-radio-group v-model="auditForm.status">
            <el-radio :label="1">通过</el-radio>
            <el-radio :label="2">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="auditForm.status === 2" label="拒绝原因" prop="rejectReason">
          <el-input
            v-model="auditForm.rejectReason"
            type="textarea"
            :rows="3"
            placeholder="请输入拒绝原因"
          />
        </el-form-item>
        <!-- 管理员回复功能已移除 -->
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="auditVisible = false">取消</el-button>
          <el-button type="primary" @click="handleAuditSubmit" :loading="auditing">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Check, Close, ArrowDown } from '@element-plus/icons-vue'
import { forumPostAPI, forumUtils } from '@/api/forum'

// 响应式数据
const loading = ref(false)
const postList = ref([])
const total = ref(0)
const selectedPosts = ref([])

// 查询参数
const queryParams = reactive({
  current: 1,
  size: 10,
  keyword: '',
  category: '',
  status: null,
  isTop: null,
  isFeatured: null,
  sortField: 'created_at',
  sortOrder: 'desc'
})

// 分类选项
const categoryOptions = forumUtils.getCategoryOptions()

// 计算属性
const hasSelection = computed(() => selectedPosts.value.length > 0)

// 表单相关
const formVisible = ref(false)
const formMode = ref('add')
const formRef = ref()
const form = reactive({
  title: '',
  category: '',
  content: '',
  images: ''
})

// 用于调试的变量（可选）
const originalImages = ref('')

const rules = {
  title: [{ required: true, message: '请输入帖子标题', trigger: 'blur' }],
  category: [{ required: true, message: '请选择建议类型', trigger: 'change' }],
  content: [{ required: true, message: '请输入帖子内容', trigger: 'blur' }]
}

const submitting = ref(false)

// 文件上传
const uploadUrl = '/api/file/upload'
const uploadHeaders = {
  'Authorization': `Bearer ${sessionStorage.getItem('token')}`
}
const fileList = ref([])

// 详情对话框
const detailVisible = ref(false)
const currentPost = ref(null)

// 审核对话框
const auditVisible = ref(false)
const auditFormRef = ref()
const auditForm = reactive({
  id: null,
  status: 1,
  rejectReason: ''
})

const auditRules = {
  status: [{ required: true, message: '请选择审核结果', trigger: 'change' }],
  rejectReason: [{ required: true, message: '请输入拒绝原因', trigger: 'blur' }]
}

const auditing = ref(false)

// 方法
const getList = async () => {
  loading.value = true
  try {
    const response = await forumPostAPI.getPostsPage(queryParams)
    postList.value = response.data.records || []
    total.value = response.data.total || 0
  } catch (error) {
    console.error('获取帖子列表失败:', error)
    ElMessage.error('获取帖子列表失败')
  } finally {
    loading.value = false
  }
}

const handleQuery = () => {
  queryParams.current = 1
  getList()
}

const resetQuery = () => {
  Object.assign(queryParams, {
    current: 1,
    size: 10,
    keyword: '',
    category: '',
    status: null,
    isTop: null,
    isFeatured: null,
    sortField: 'created_at',
    sortOrder: 'desc'
  })
  getList()
}

const handleSizeChange = (size) => {
  queryParams.size = size
  getList()
}

const handleCurrentChange = (current) => {
  queryParams.current = current
  getList()
}

const handleSelectionChange = (selection) => {
  selectedPosts.value = selection
}

// CRUD操作
const handleAdd = () => {
  formMode.value = 'add'
  resetForm()
  formVisible.value = true
}

const handleEdit = (row) => {
  formMode.value = 'edit'
  
  // 保存原始图片数据用于调试
  originalImages.value = row.images || ''
  
  Object.assign(form, {
    id: row.id,
    title: row.title,
    category: row.category,
    content: row.content,
    images: row.images || ''
  })
  
  // 设置文件列表 - 将现有图片加载到文件列表中
  if (row.images) {
    const images = parseImages(row.images)
    fileList.value = images.map((url, index) => ({
      name: `existing_image_${index}`,
      url: url,
      uid: `existing_${Date.now()}_${index}`, // 使用时间戳确保唯一性
      status: 'success'
    }))
    console.log('编辑模式 - 加载现有图片:', images)
    console.log('编辑模式 - 文件列表:', fileList.value)
  } else {
    fileList.value = []
    console.log('编辑模式 - 无图片')
  }
  
  formVisible.value = true
}

const handleView = async (row) => {
  try {
    const response = await forumPostAPI.getPostById(row.id)
    currentPost.value = response.data
    detailVisible.value = true
  } catch (error) {
    console.error('获取帖子详情失败:', error)
    ElMessage.error('获取帖子详情失败')
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitting.value = true
    try {
      // 处理图片数据 - 从文件列表中提取有效的URL
      const imageUrls = []
      
      console.log('开始处理图片数据，文件列表长度:', fileList.value.length)
      
      for (let i = 0; i < fileList.value.length; i++) {
        const file = fileList.value[i]
        let url = null
        
        console.log(`处理文件 ${i}:`, {
          name: file.name,
          uid: file.uid,
          status: file.status,
          url: file.url,
          response: file.response
        })
        
        // 1. 如果有response.data，说明是新上传的文件
        if (file.response && file.response.data) {
          url = file.response.data
          console.log(`文件 ${i} 使用 response.data:`, url)
        }
        // 2. 如果有file.url，可能是现有的图片或上传成功后的图片
        else if (file.url) {
          url = file.url
          console.log(`文件 ${i} 使用 file.url:`, url)
        }
        
        // 只添加有效的URL
        if (url && url.trim() !== '') {
          imageUrls.push(url)
          console.log(`文件 ${i} 添加到图片列表:`, url)
        } else {
          console.warn(`文件 ${i} 没有有效的URL`)
        }
      }
      
      // 设置图片数据
      form.images = imageUrls.length > 0 ? JSON.stringify(imageUrls) : '[]'
      
      
      // 验证数据完整性
      if (!form.title || !form.category || !form.content) {
        console.error('表单数据不完整:', form)
        ElMessage.error('表单数据不完整，请检查必填项')
        return
      }
      
      console.log('=========================')
      
      if (formMode.value === 'add') {
        await forumPostAPI.createPost(form)
        ElMessage.success('帖子发布成功')
      } else {
        console.log('准备更新帖子，发送的数据:', form)
        const response = await forumPostAPI.updatePost(form.id, form)
        console.log('更新帖子响应:', response)
        ElMessage.success('帖子更新成功')
      }
      
      formVisible.value = false
      getList()
    } catch (error) {
      console.error('操作失败:', error)
      console.error('错误详情:', error.response?.data || error.message)
      ElMessage.error(formMode.value === 'add' ? '帖子发布失败' : '帖子更新失败')
    } finally {
      submitting.value = false
    }
  })
}

const handleCloseForm = () => {
  formVisible.value = false
  resetForm()
}

const resetForm = () => {
  Object.assign(form, {
    id: null,
    title: '',
    category: '',
    content: '',
    images: ''
  })
  fileList.value = []
  originalImages.value = ''
  console.log('表单重置完成')
  
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

const handleCloseDetail = () => {
  detailVisible.value = false
  currentPost.value = null
}

// 审核操作
const handleAudit = (row, command) => {
  auditForm.id = row.id
  auditForm.status = command === 'approve' ? 1 : 2
  auditForm.rejectReason = ''
  auditVisible.value = true
}

const handleBatchAudit = async (status) => {
  if (selectedPosts.value.length === 0) {
    ElMessage.warning('请选择要审核的帖子')
    return
  }
  
  const action = status === 1 ? '通过' : '拒绝'
  try {
    await ElMessageBox.confirm(`确定要批量${action}选中的帖子吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const promises = selectedPosts.value.map(post => 
      forumPostAPI.auditPost(post.id, status, '', '')
    )
    
    await Promise.all(promises)
    ElMessage.success(`批量${action}成功`)
    getList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error(`批量${action}失败:`, error)
      ElMessage.error(`批量${action}失败`)
    }
  }
}

const handleAuditSubmit = async () => {
  if (!auditFormRef.value) return
  
  await auditFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    auditing.value = true
    try {
      await forumPostAPI.auditPost(
        auditForm.id,
        auditForm.status,
        auditForm.rejectReason,
        '' // 管理员回复功能已移除
      )
      
      ElMessage.success('审核完成')
      auditVisible.value = false
      getList()
    } catch (error) {
      console.error('审核失败:', error)
      ElMessage.error('审核失败')
    } finally {
      auditing.value = false
    }
  })
}

// 管理操作
const handleManage = async (row, command) => {
  try {
    switch (command) {
      case 'top':
      case 'untop':
        await forumPostAPI.setPostTop(row.id, command === 'top')
        ElMessage.success(`${command === 'top' ? '置顶' : '取消置顶'}成功`)
        break
      case 'featured':
      case 'unfeatured':
        await forumPostAPI.setPostFeatured(row.id, command === 'featured')
        ElMessage.success(`${command === 'featured' ? '推荐' : '取消推荐'}成功`)
        break
      case 'delete':
        await ElMessageBox.confirm('确定要删除这个帖子吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await forumPostAPI.deletePost(row.id)
        ElMessage.success('删除成功')
        break
    }
    getList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('操作失败:', error)
      ElMessage.error('操作失败')
    }
  }
}

// 文件上传
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('图片大小不能超过 10MB!')
    return false
  }
  return true
}

const handleFileChange = (file, fileListParam) => {
  console.log('文件状态变化:', file)
  console.log('文件列表变化:', fileListParam)
  
  // 手动同步文件列表，确保状态一致
  fileList.value = fileListParam
  console.log('同步后的文件列表:', fileList.value)
}

const handleUploadSuccess = (response, file, fileListParam) => {
  console.log('上传成功回调 - response:', response)
  console.log('上传成功回调 - file:', file)
  console.log('上传成功回调 - fileListParam:', fileListParam)
  
  if (response.code === 200) {
    // 设置文件URL，确保能在提交时正确获取
    file.url = response.data
    file.response = response
    file.status = 'success'
    
    console.log('图片上传成功，设置URL:', response.data)
    console.log('当前文件列表状态:', fileList.value)
    ElMessage.success('图片上传成功')
  } else {
    console.error('图片上传失败:', response)
    ElMessage.error('图片上传失败')
  }
}

const handleRemoveFile = (file) => {
  console.log('准备删除文件:', file)
  const index = fileList.value.findIndex(item => 
    item.uid === file.uid || (item.url && item.url === file.url)
  )
  if (index > -1) {
    fileList.value.splice(index, 1)
    console.log('文件删除成功:', file.name || file.url, '剩余文件数:', fileList.value.length)
    console.log('当前文件列表:', fileList.value)
  } else {
    console.warn('未找到要删除的文件:', file)
  }
}

// 工具方法
const getCategoryName = forumUtils.getCategoryName
const getStatusName = forumUtils.getStatusName
const getStatusType = forumUtils.getStatusType

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

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN')
}

const parseImages = (images) => {
  if (!images) return []
  try {
    return JSON.parse(images)
  } catch {
    return []
  }
}

// 生命周期
onMounted(() => {
  getList()
})
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.filter-container {
  margin-bottom: 20px;
}

.toolbar-container {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.post-title {
  display: flex;
  align-items: center;
}

.post-detail {
  max-height: 70vh;
  overflow-y: auto;
}

.post-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.post-header h2 {
  margin: 0 0 10px 0;
  color: #333;
}

.post-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
  color: #666;
  font-size: 14px;
}

.meta-item {
  display: flex;
  align-items: center;
}

.post-content {
  line-height: 1.6;
  margin-bottom: 20px;
  white-space: pre-wrap;
}

.post-images {
  margin-bottom: 20px;
}

.admin-reply {
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  margin-top: 20px;
}

.admin-reply h4 {
  margin: 0 0 10px 0;
  color: #409eff;
}

.admin-reply p {
  margin: 0 0 5px 0;
  line-height: 1.5;
}

.dialog-footer {
  text-align: right;
}

.el-upload--picture-card {
  width: 100px;
  height: 100px;
}
</style>

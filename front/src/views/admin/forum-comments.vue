<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <div class="filter-container">
      <el-form :inline="true" :model="queryParams" class="demo-form-inline">
        <el-form-item label="评论内容">
          <el-input
            v-model="queryParams.keyword"
            placeholder="请输入评论内容"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <!-- <el-form-item label="帖子ID">
          <el-input
            v-model="queryParams.postId"
            placeholder="请输入帖子ID"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="评论用户">
          <el-input
            v-model="queryParams.userId"
            placeholder="请输入用户ID"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item> -->
        <el-form-item label="审核状态" style="width: 200px">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
            <el-option label="待审核" :value="0" />
            <el-option label="已通过" :value="1" />
            <el-option label="已拒绝" :value="2" />
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
      <el-button type="success" :icon="Check" @click="handleBatchAudit(1)" :disabled="!hasSelection">批量通过</el-button>
      <el-button type="danger" :icon="Close" @click="handleBatchAudit(2)" :disabled="!hasSelection">批量拒绝</el-button>
      <el-button type="warning" :icon="Delete" @click="handleBatchDelete" :disabled="!hasSelection">批量删除</el-button>
    </div>

    <!-- 评论列表 -->
    <el-table 
      v-loading="loading" 
      :data="commentList" 
      border 
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="content" label="评论内容" width="300" show-overflow-tooltip>
        <template #default="scope">
          <div class="comment-content">
            <p>{{ scope.row.content }}</p>
            <div v-if="scope.row.parentId" class="parent-comment">
              <el-tag size="small" type="info">回复评论</el-tag>
            </div>
          </div>
        </template>
      </el-table-column>
      <!-- <el-table-column prop="postId" label="帖子ID" width="100" /> -->
      <el-table-column prop="username" label="评论用户" width="120" />
      <el-table-column prop="likeCount" label="点赞数" width="100" />
      <el-table-column prop="status" label="审核状态" width="100">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusName(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="评论时间" width="180">
        <template #default="scope">
          {{ formatDate(scope.row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="scope">
          <el-button size="small" type="primary" @click="handleView(scope.row)">查看</el-button>
          
          <!-- 审核操作 -->
          <el-dropdown v-if="scope.row.status === 0" @command="(command) => handleAudit(scope.row, command)">
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
          
          <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
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

    <!-- 评论详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="评论详情"
      width="50%"
      :before-close="handleCloseDetail"
    >
      <div v-if="currentComment" class="comment-detail">
        <div class="comment-header">
          <div class="comment-meta">
            <span class="meta-item">评论用户：{{ currentComment.username }}</span>
            <span class="meta-item">帖子ID：{{ currentComment.postId }}</span>
            <span class="meta-item">评论时间：{{ formatDate(currentComment.createdAt) }}</span>
            <span class="meta-item">点赞数：{{ currentComment.likeCount }}</span>
            <el-tag :type="getStatusType(currentComment.status)">
              {{ getStatusName(currentComment.status) }}
            </el-tag>
          </div>
        </div>
        
        <div v-if="currentComment.parentId" class="parent-info">
          <h4>回复的评论：</h4>
          <div class="parent-comment-box">
            <p>父评论ID: {{ currentComment.parentId }}</p>
          </div>
        </div>
        
        <div class="comment-content-detail">
          <h4>评论内容：</h4>
          <div class="content-box">{{ currentComment.content }}</div>
        </div>
        
        <div v-if="currentComment.images" class="comment-images">
          <h4>评论图片：</h4>
          <el-image
            v-for="(image, index) in parseImages(currentComment.images)"
            :key="index"
            :src="image"
            style="width: 200px; height: 150px; margin: 5px;"
            fit="cover"
            :preview-src-list="parseImages(currentComment.images)"
          />
        </div>
        
        <!-- 加载相关帖子信息 -->
        <div v-if="relatedPost" class="related-post">
          <h4>所属帖子：</h4>
          <div class="post-info">
            <p><strong>标题：</strong>{{ relatedPost.title }}</p>
            <p><strong>分类：</strong>{{ getCategoryName(relatedPost.category) }}</p>
            <p><strong>发帖用户：</strong>{{ relatedPost.username }}</p>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 审核对话框 -->
    <el-dialog
      v-model="auditVisible"
      title="审核评论"
      width="50%"
    >
      <el-form ref="auditFormRef" :model="auditForm" :rules="auditRules" label-width="100px">
        <el-form-item label="审核结果" prop="status">
          <el-radio-group v-model="auditForm.status">
            <el-radio :label="1">通过</el-radio>
            <el-radio :label="2">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="auditForm.status === 2" label="拒绝原因">
          <el-input
            v-model="auditForm.rejectReason"
            type="textarea"
            :rows="3"
            placeholder="请输入拒绝原因（可选）"
          />
        </el-form-item>
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
import { Search, Refresh, Check, Close, Delete, ArrowDown } from '@element-plus/icons-vue'
import { forumCommentAPI, forumPostAPI, forumUtils } from '@/api/forum'

// 响应式数据
const loading = ref(false)
const commentList = ref([])
const total = ref(0)
const selectedComments = ref([])

// 查询参数
const queryParams = reactive({
  current: 1,
  size: 10,
  keyword: '',
  postId: '',
  userId: '',
  status: null,
  sortField: 'created_at',
  sortOrder: 'desc'
})

// 计算属性
const hasSelection = computed(() => selectedComments.value.length > 0)

// 详情对话框
const detailVisible = ref(false)
const currentComment = ref(null)
const relatedPost = ref(null)

// 审核对话框
const auditVisible = ref(false)
const auditFormRef = ref()
const auditForm = reactive({
  id: null,
  status: 1,
  rejectReason: ''
})

const auditRules = {
  status: [{ required: true, message: '请选择审核结果', trigger: 'change' }]
}

const auditing = ref(false)

// 方法
const getList = async () => {
  loading.value = true
  try {
    const response = await forumCommentAPI.getCommentsPage(queryParams)
    commentList.value = response.data.records || []
    total.value = response.data.total || 0
  } catch (error) {
    console.error('获取评论列表失败:', error)
    ElMessage.error('获取评论列表失败')
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
    postId: '',
    userId: '',
    status: null,
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
  selectedComments.value = selection
}

// 查看详情
const handleView = async (row) => {
  try {
    // 获取评论详情
    const commentResponse = await forumCommentAPI.getCommentById(row.id)
    currentComment.value = commentResponse.data
    
    // 获取相关帖子信息
    if (row.postId) {
      try {
        const postResponse = await forumPostAPI.getPostById(row.postId)
        relatedPost.value = postResponse.data
      } catch (error) {
        console.warn('获取相关帖子信息失败:', error)
        relatedPost.value = null
      }
    }
    
    detailVisible.value = true
  } catch (error) {
    console.error('获取评论详情失败:', error)
    ElMessage.error('获取评论详情失败')
  }
}

const handleCloseDetail = () => {
  detailVisible.value = false
  currentComment.value = null
  relatedPost.value = null
}

// 审核操作
const handleAudit = (row, command) => {
  auditForm.id = row.id
  auditForm.status = command === 'approve' ? 1 : 2
  auditForm.rejectReason = ''
  auditVisible.value = true
}

const handleBatchAudit = async (status) => {
  if (selectedComments.value.length === 0) {
    ElMessage.warning('请选择要审核的评论')
    return
  }
  
  const action = status === 1 ? '通过' : '拒绝'
  try {
    await ElMessageBox.confirm(`确定要批量${action}选中的评论吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const promises = selectedComments.value.map(comment => 
      forumCommentAPI.auditComment(comment.id, status)
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
      await forumCommentAPI.auditComment(auditForm.id, auditForm.status)
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

// 删除操作
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这条评论吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await forumCommentAPI.deleteComment(row.id)
    ElMessage.success('删除成功')
    getList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const handleBatchDelete = async () => {
  if (selectedComments.value.length === 0) {
    ElMessage.warning('请选择要删除的评论')
    return
  }
  
  try {
    await ElMessageBox.confirm('确定要批量删除选中的评论吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const promises = selectedComments.value.map(comment => 
      forumCommentAPI.deleteComment(comment.id)
    )
    
    await Promise.all(promises)
    ElMessage.success('批量删除成功')
    getList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败')
    }
  }
}

// 工具方法
const getStatusName = forumUtils.getStatusName
const getStatusType = forumUtils.getStatusType
const getCategoryName = forumUtils.getCategoryName

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

.comment-content p {
  margin: 0;
  line-height: 1.4;
}

.parent-comment {
  margin-top: 5px;
}

.comment-detail {
  max-height: 70vh;
  overflow-y: auto;
}

.comment-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.comment-meta {
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

.parent-info,
.comment-content-detail,
.comment-images,
.related-post {
  margin-bottom: 20px;
}

.parent-info h4,
.comment-content-detail h4,
.comment-images h4,
.related-post h4 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 16px;
}

.parent-comment-box,
.content-box {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  border-left: 4px solid #409eff;
}

.content-box {
  line-height: 1.6;
  white-space: pre-wrap;
}

.post-info {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 4px;
  border: 1px solid #eee;
}

.post-info p {
  margin: 5px 0;
  line-height: 1.5;
}

.dialog-footer {
  text-align: right;
}
</style>

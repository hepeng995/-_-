<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <div class="filter-container">
      <el-form :inline="true" :model="queryParams" class="demo-form-inline">
        <el-form-item label="资讯标题">
          <el-input
            v-model="queryParams.keyword"
            placeholder="请输入资讯标题"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="分类" style="width: 180px">
          <el-select v-model="queryParams.category" placeholder="请选择分类" clearable>
            <el-option label="乡村新闻" value="news" />
            <el-option label="政策通知" value="policy" />
            <el-option label="活动预告" value="activity" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" style="width: 180px">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
            <el-option label="草稿" :value="0" />
            <el-option label="已发布" :value="1" />
            <el-option label="已下线" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="推荐" style="width: 180px">
          <el-select v-model="queryParams.isFeatured" placeholder="是否推荐" clearable>
            <el-option label="推荐" :value="true" />
            <el-option label="不推荐" :value="false" />
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
      <el-button type="primary" :icon="Plus" @click="handleAdd">新增资讯</el-button>
    </div>

    <!-- 资讯列表 -->
    <el-table v-loading="loading" :data="newsList" border style="width: 100%">
      <el-table-column prop="coverImage" label="封面图片" width="120">
        <template #default="scope">
          <el-image
            v-if="scope.row.coverImage"
            :src="scope.row.coverImage"
            style="width: 80px; height: 60px"
            fit="cover"
            :preview-src-list="[scope.row.coverImage]"
          />
          <span v-else>暂无图片</span>
        </template>
      </el-table-column>
      <el-table-column prop="title" label="标题" width="300" show-overflow-tooltip />
      <el-table-column prop="category" label="分类" width="100">
        <template #default="scope">
          {{ getCategoryName(scope.row.category) }}
        </template>
      </el-table-column>
      <el-table-column prop="author" label="作者" width="120" />
      <el-table-column prop="source" label="来源" width="120" />
      <el-table-column prop="viewCount" label="浏览量" width="100" />
      <el-table-column prop="isTop" label="置顶" width="80">
        <template #default="scope">
          <el-tag :type="scope.row.isTop ? 'warning' : 'info'">
            {{ scope.row.isTop ? '置顶' : '普通' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="isFeatured" label="推荐" width="80">
        <template #default="scope">
          <el-tag :type="scope.row.isFeatured ? 'success' : 'info'">
            {{ scope.row.isFeatured ? '推荐' : '普通' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ scope.row.statusDesc }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="publishTime" label="发布时间" width="180">
        <template #default="scope">
          {{ formatDate(scope.row.publishTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="scope">
          <el-button size="small" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button 
            v-if="scope.row.status === 0 || scope.row.status === 2"
            size="small" 
            type="success" 
            @click="handlePublish(scope.row)"
          >
            发布
          </el-button>
          <el-button 
            v-if="scope.row.status === 1"
            size="small" 
            type="warning" 
            @click="handleUnpublish(scope.row)"
          >
            下线
          </el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total > 0"
      :total="total"
      :page="queryParams.pageNum"
      :limit="queryParams.pageSize"
      @pagination="handlePagination"
    />

    <!-- 资讯表单对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="900px" @close="cancel">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="16">
            <el-form-item label="资讯标题" prop="title">
              <el-input v-model="form.title" placeholder="请输入资讯标题" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="分类" prop="category">
              <el-select v-model="form.category" placeholder="请选择分类">
                <el-option label="乡村新闻" value="news" />
                <el-option label="政策通知" value="policy" />
                <el-option label="活动预告" value="activity" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="作者" prop="author">
              <el-input v-model="form.author" placeholder="请输入作者" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="来源" prop="source">
              <el-input v-model="form.source" placeholder="请输入来源" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="发布时间" prop="publishTime">
              <el-date-picker
                v-model="form.publishTime"
                type="datetime"
                placeholder="选择发布时间"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="封面图片" prop="coverImage">
          <el-upload
            class="image-uploader"
            action="/api/file/upload"
            :show-file-list="false"
            :on-success="handleCoverImageSuccess"
            :before-upload="beforeImageUpload"
            :headers="uploadHeaders"
          >
            <el-image
              v-if="form.coverImage"
              :src="form.coverImage"
              style="width: 150px; height: 100px"
              fit="cover"
            />
            <div v-else class="upload-placeholder">
              <el-icon class="upload-icon"><Plus /></el-icon>
              <div class="upload-text">点击上传封面图片</div>
            </div>
          </el-upload>
        </el-form-item>
        <el-form-item label="摘要" prop="summary">
          <el-input
            v-model="form.summary"
            type="textarea"
            :rows="3"
            placeholder="请输入资讯摘要"
          />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="10"
            placeholder="请输入资讯内容（支持HTML）"
          />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="是否置顶" prop="isTop">
              <el-switch
                v-model="form.isTop"
                active-text="置顶"
                inactive-text="普通"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="是否推荐" prop="isFeatured">
              <el-switch
                v-model="form.isFeatured"
                active-text="推荐"
                inactive-text="不推荐"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio :label="0">草稿</el-radio>
                <el-radio :label="1">发布</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancel">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh } from '@element-plus/icons-vue'
import newsApi from '@/api/news'
import Pagination from '@/components/Pagination.vue'

// 数据定义
const loading = ref(false)
const newsList = ref([])
const total = ref(0)
const dialogVisible = ref(false)
const dialogTitle = ref('')

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  category: '',
  status: null,
  isFeatured: null
})

// 表单数据
const form = reactive({
  id: null,
  title: '',
  summary: '',
  content: '',
  coverImage: '',
  category: 'news',
  author: '',
  source: '',
  isTop: false,
  isFeatured: false,
  publishTime: new Date(),
  status: 0
})

// 表单引用
const formRef = ref(null)

// 表单验证规则
const rules = {
  title: [{ required: true, message: '请输入资讯标题', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  publishTime: [{ required: true, message: '请选择发布时间', trigger: 'change' }]
}

// 上传图片相关
const uploadHeaders = {
  Authorization: sessionStorage.getItem('token') || ''
}

// 获取资讯列表
const getList = async () => {
  loading.value = true
  try {
    const res = await newsApi.getNewsPage(queryParams)
    if (res.code === 200) {
      newsList.value = res.data.records
      total.value = res.data.total
    }
  } catch (error) {
    console.error('获取资讯列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

// 分页处理
const handlePagination = (paginationData) => {
  queryParams.pageNum = paginationData.page
  queryParams.pageSize = paginationData.limit
  getList()
}

// 重置
const resetQuery = () => {
  queryParams.keyword = ''
  queryParams.category = ''
  queryParams.status = null
  queryParams.isFeatured = null
  queryParams.pageNum = 1
  getList()
}

// 新增
const handleAdd = () => {
  resetForm()
  dialogVisible.value = true
  dialogTitle.value = '新增资讯'
}

// 编辑
const handleEdit = (row) => {
  resetForm()
  Object.assign(form, row)
  // 转换发布时间格式
  if (form.publishTime) {
    form.publishTime = new Date(form.publishTime)
  }
  dialogVisible.value = true
  dialogTitle.value = '编辑资讯'
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确认删除该资讯吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await newsApi.deleteNews(row.id)
    ElMessage.success('删除成功')
    getList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

// 发布
const handlePublish = async (row) => {
  try {
    await newsApi.publishNews(row.id)
    ElMessage.success('发布成功')
    getList()
  } catch (error) {
    console.error('发布失败:', error)
  }
}

// 下线
const handleUnpublish = async (row) => {
  try {
    await ElMessageBox.confirm('确认下线该资讯吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await newsApi.unpublishNews(row.id)
    ElMessage.success('下线成功')
    getList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('下线失败:', error)
    }
  }
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    if (form.id) {
      await newsApi.updateNews(form.id, form)
      ElMessage.success('更新成功')
    } else {
      await newsApi.createNews(form)
      ElMessage.success('新增成功')
    }
    
    dialogVisible.value = false
    getList()
  } catch (error) {
    console.error('提交失败:', error)
  }
}

// 取消
const cancel = () => {
  dialogVisible.value = false
  resetForm()
}

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    id: null,
    title: '',
    summary: '',
    content: '',
    coverImage: '',
    category: 'news',
    author: '',
    source: '',
    isTop: false,
    isFeatured: false,
    publishTime: new Date(),
    status: 0
  })
  formRef.value?.clearValidate()
}

// 获取状态样式
const getStatusType = (status) => {
  switch (status) {
    case 0: return 'info'
    case 1: return 'success'
    case 2: return 'warning'
    default: return 'info'
  }
}

// 封面图片上传成功回调
const handleCoverImageSuccess = (response, uploadFile) => {
  if (response.code === 200) {
    form.coverImage = response.data
    ElMessage.success('封面图片上传成功')
  } else {
    ElMessage.error(response.message || '封面图片上传失败')
  }
}

// 图片上传前的校验
const beforeImageUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片格式的文件!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!')
    return false
  }
  return true
}

// 分类名称映射
const categoryNames = {
  news: '乡村新闻',
  policy: '政策通知',
  activity: '活动预告'
}

// 获取分类名称
const getCategoryName = (category) => {
  return categoryNames[category] || category
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString()
}

// 初始化
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

.dialog-footer {
  text-align: right;
}

.image-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
}

.image-uploader:hover {
  border-color: #409eff;
}

.upload-placeholder {
  width: 150px;
  height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
}

.upload-icon {
  font-size: 28px;
  color: #8c939d;
}

.upload-text {
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
}
</style>

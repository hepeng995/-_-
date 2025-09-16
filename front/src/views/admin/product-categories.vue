<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <div class="filter-container">
      <el-form :inline="true" :model="queryParams" class="demo-form-inline">
        <el-form-item label="分类名称">
          <el-input
            v-model="queryParams.keyword"
            placeholder="请输入分类名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="状态" style="width: 180px">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
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
      <el-button type="primary" :icon="Plus" @click="handleAdd">新增分类</el-button>
    </div>

    <!-- 分类列表 -->
    <el-table v-loading="loading" :data="categoryList" border style="width: 100%">
      <!-- <el-table-column prop="icon" label="图标" width="80" align="center">
        <template #default="scope">
          <el-image
            v-if="scope.row.icon"
            :src="scope.row.icon"
            style="width: 40px; height: 40px"
            fit="cover"
          />
          <span v-else>-</span>
        </template>
      </el-table-column> -->
      <el-table-column prop="name" label="分类名称" width="200" />
      <el-table-column prop="description" label="分类描述" show-overflow-tooltip />
      <el-table-column prop="sortOrder" label="排序值" width="100" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
            {{ scope.row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180">
        <template #default="scope">
          {{ formatDate(scope.row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button size="small" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button 
            v-if="scope.row.status === 0"
            size="small" 
            type="success" 
            @click="handleStatusChange(scope.row, 1)"
          >
            启用
          </el-button>
          <el-button 
            v-if="scope.row.status === 1"
            size="small" 
            type="warning" 
            @click="handleStatusChange(scope.row, 0)"
          >
            禁用
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

    <!-- 分类表单对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" @close="cancel">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="分类描述" prop="description">
          <el-input 
            v-model="form.description" 
            type="textarea"
            :rows="3"
            placeholder="请输入分类描述" 
          />
        </el-form-item>
        <el-form-item label="分类图标" prop="icon">
          <el-upload
            class="image-uploader"
            action="/api/file/upload"
            :show-file-list="false"
            :on-success="handleIconSuccess"
            :before-upload="beforeImageUpload"
            :headers="uploadHeaders"
          >
            <el-image
              v-if="form.icon"
              :src="form.icon"
              style="width: 80px; height: 80px"
              fit="cover"
            />
            <div v-else class="upload-placeholder">
              <el-icon class="upload-icon"><Plus /></el-icon>
              <div class="upload-text">点击上传图标</div>
            </div>
          </el-upload>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="排序值" prop="sortOrder">
              <el-input-number 
                v-model="form.sortOrder" 
                :min="0" 
                placeholder="请输入排序值"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio :label="1">启用</el-radio>
                <el-radio :label="0">禁用</el-radio>
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
import productApi from '@/api/product'
import Pagination from '@/components/Pagination.vue'

// 数据定义
const loading = ref(false)
const categoryList = ref([])
const total = ref(0)
const dialogVisible = ref(false)
const dialogTitle = ref('')

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  status: null
})

// 表单数据
const form = reactive({
  id: null,
  name: '',
  description: '',
  icon: '',
  sortOrder: 0,
  status: 1
})

// 表单引用
const formRef = ref(null)

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
}

// 上传图片相关
const uploadHeaders = {
  Authorization: sessionStorage.getItem('token') || ''
}

// 获取分类列表
const getList = async () => {
  loading.value = true
  try {
    const res = await productApi.getProductCategoriesPage(queryParams)
    if (res.code === 200) {
      categoryList.value = res.data.records
      total.value = res.data.total
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
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
  queryParams.status = null
  queryParams.pageNum = 1
  getList()
}

// 新增
const handleAdd = () => {
  resetForm()
  dialogVisible.value = true
  dialogTitle.value = '新增分类'
}

// 编辑
const handleEdit = (row) => {
  resetForm()
  Object.assign(form, row)
  dialogVisible.value = true
  dialogTitle.value = '编辑分类'
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确认删除该分类吗？删除后关联的商品将失去分类信息！', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await productApi.deleteProductCategory(row.id)
    ElMessage.success('删除成功')
    getList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

// 状态变更
const handleStatusChange = async (row, status) => {
  try {
    const statusText = status === 1 ? '启用' : '禁用'
    await ElMessageBox.confirm(`确认${statusText}该分类吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await productApi.updateProductCategoryStatus(row.id, status)
    ElMessage.success(`${statusText}成功`)
    getList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('状态更新失败:', error)
    }
  }
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    if (form.id) {
      await productApi.updateProductCategory(form.id, form)
      ElMessage.success('更新成功')
    } else {
      await productApi.createProductCategory(form)
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
    name: '',
    description: '',
    icon: '',
    sortOrder: 0,
    status: 1
  })
  formRef.value?.clearValidate()
}

// 图标上传成功回调
const handleIconSuccess = (response, uploadFile) => {
  if (response.code === 200) {
    form.icon = response.data
    ElMessage.success('图标上传成功')
  } else {
    ElMessage.error(response.message || '图标上传失败')
  }
}

// 图片上传前的校验
const beforeImageUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片格式的文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return true
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
  width: 80px;
  height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
}

.upload-icon {
  font-size: 24px;
  color: #8c939d;
}

.upload-text {
  margin-top: 6px;
  color: #909399;
  font-size: 11px;
}
</style>

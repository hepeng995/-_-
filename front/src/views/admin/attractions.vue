<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <div class="filter-container">
      <el-form :inline="true" :model="queryParams" class="demo-form-inline">
        <el-form-item label="景点名称">
          <el-input
            v-model="queryParams.keyword"
            placeholder="请输入景点名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="分类" style="width: 180px">
          <el-select v-model="queryParams.categoryId" placeholder="请选择分类" clearable>
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
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
      <el-button type="primary" :icon="Plus" @click="handleAdd">新增景点</el-button>
      <el-button type="success" :icon="Plus" @click="handleAddCategory">新增分类</el-button>
    </div>

    <!-- 景点列表 -->
    <el-table v-loading="loading" :data="attractionList" border style="width: 100%">
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
      <el-table-column prop="name" label="景点名称" width="160" />
      <el-table-column prop="categoryName" label="分类" width="120" />
      <el-table-column prop="address" label="地址" width="200" show-overflow-tooltip />
      <el-table-column prop="ticketPrice" label="门票价格" width="100">
        <template #default="scope">
          <span v-if="scope.row.ticketPrice">￥{{ scope.row.ticketPrice }}</span>
          <span v-else>免费</span>
        </template>
      </el-table-column>
      <el-table-column prop="rating" label="评分" width="80">
        <template #default="scope">
          <el-rate
            v-model="scope.row.rating"
            disabled
            show-score
            text-color="#ff9900"
            score-template="{value}"
          />
        </template>
      </el-table-column>
      <el-table-column prop="viewCount" label="浏览量" width="100" />
      <el-table-column prop="status" label="状态" width="80">
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
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="scope">
          <el-button size="small" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
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

    <!-- 景点表单对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="800px" @close="cancel" @open="handleDialogOpen">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="景点名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入景点名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分类" prop="categoryId">
              <el-select v-model="form.categoryId" placeholder="请选择分类">
                <el-option
                  v-for="category in categories"
                  :key="category.id"
                  :label="category.name"
                  :value="category.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="门票价格" prop="ticketPrice">
              <el-input-number
                v-model="form.ticketPrice"
                :min="0"
                :precision="2"
                placeholder="请输入门票价格"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="开放时间" prop="openingHours">
              <el-input v-model="form.openingHours" placeholder="例：08:00-17:00" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="位置选择" prop="location">
          <LocationPicker 
            v-model="locationData" 
            @change="handleLocationChange"
          />
        </el-form-item>
        <el-form-item label="详细地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入详细地址" />
        </el-form-item>
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
        <el-form-item label="景点描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入景点描述"
          />
        </el-form-item>
        <el-form-item label="交通指引" prop="trafficGuide">
          <el-input
            v-model="form.trafficGuide"
            type="textarea"
            :rows="3"
            placeholder="请输入交通指引"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancel">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 分类表单对话框 -->
    <el-dialog v-model="categoryDialogVisible" title="新增分类" width="500px">
      <el-form ref="categoryFormRef" :model="categoryForm" :rules="categoryRules" label-width="80px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="分类描述" prop="description">
          <el-input v-model="categoryForm.description" placeholder="请输入分类描述" />
        </el-form-item>
        <el-form-item label="排序值" prop="sortOrder">
          <el-input-number v-model="categoryForm.sortOrder" :min="0" placeholder="请输入排序值" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="categoryDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitCategoryForm">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh } from '@element-plus/icons-vue'
import attractionApi from '@/api/attraction'
import Pagination from '@/components/Pagination.vue'
import LocationPicker from '@/components/LocationPicker.vue'

// 数据定义
const loading = ref(false)
const attractionList = ref([])
const categories = ref([])
const total = ref(0)
const dialogVisible = ref(false)
const categoryDialogVisible = ref(false)
const dialogTitle = ref('')
const locationData = ref({
  longitude: null,
  latitude: null,
  address: ''
})

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  categoryId: null,
  status: null
})

// 表单数据
const form = reactive({
  id: null,
  name: '',
  categoryId: null,
  description: '',
  coverImage: '',
  longitude: null,
  latitude: null,
  address: '',
  trafficGuide: '',
  openingHours: '',
  ticketPrice: null,
  status: 1
})

// 分类表单数据
const categoryForm = reactive({
  name: '',
  description: '',
  sortOrder: 0
})

// 表单引用
const formRef = ref(null)
const categoryFormRef = ref(null)

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入景点名称', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  address: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
}

const categoryRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
}

// 上传图片相关
const uploadHeaders = {
  Authorization: sessionStorage.getItem('token') || ''
}

// 获取景点列表
const getList = async () => {
  loading.value = true
  try {
    const res = await attractionApi.getAttractionPage(queryParams)
    if (res.code === 200) {
      attractionList.value = res.data.records
      total.value = res.data.total
    }
  } catch (error) {
    console.error('获取景点列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取分类列表
const getCategories = async () => {
  try {
    const res = await attractionApi.getAttractionCategories()
    if (res.code === 200) {
      categories.value = res.data
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
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
  queryParams.categoryId = null
  queryParams.status = null
  queryParams.pageNum = 1
  getList()
}

// 新增
const handleAdd = () => {
  resetForm()
  dialogVisible.value = true
  dialogTitle.value = '新增景点'
}

// 编辑
const handleEdit = (row) => {
  resetForm()
  
  // 手动赋值所有字段，确保数据完整，处理下划线到驼峰的转换
  form.id = row.id
  form.name = row.name || ''
  form.categoryId = row.categoryId || row.category_id
  form.description = row.description || ''
  form.coverImage = row.coverImage || row.cover_image || ''
  form.longitude = row.longitude
  form.latitude = row.latitude
  form.address = row.address || ''
  form.trafficGuide = row.trafficGuide || row.traffic_guide || ''
  form.openingHours = row.openingHours || row.opening_hours || ''
  form.ticketPrice = row.ticketPrice || row.ticket_price
  form.status = row.status !== undefined ? row.status : 1
  
  console.log('编辑景点数据:', row) // 添加调试信息
  console.log('表单数据:', form) // 添加调试信息
  
  // 同步位置数据
  locationData.value = {
    longitude: row.longitude,
    latitude: row.latitude,
    address: row.address || ''
  }
  
  dialogVisible.value = true
  dialogTitle.value = '编辑景点'
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确认删除该景点吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await attractionApi.deleteAttraction(row.id)
    ElMessage.success('删除成功')
    getList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

// 新增分类
const handleAddCategory = () => {
  resetCategoryForm()
  categoryDialogVisible.value = true
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    // 创建提交数据，处理字段名映射
    const submitData = {
      id: form.id,
      name: form.name,
      categoryId: form.categoryId,
      description: form.description,
      coverImage: form.coverImage,
      longitude: form.longitude,
      latitude: form.latitude,
      address: form.address,
      trafficGuide: form.trafficGuide,
      openingHours: form.openingHours,
      ticketPrice: form.ticketPrice,
      status: form.status
    }
    
    console.log('提交数据:', submitData) // 添加调试信息
    
    if (form.id) {
      await attractionApi.updateAttraction(form.id, submitData)
      ElMessage.success('更新成功')
    } else {
      await attractionApi.createAttraction(submitData)
      ElMessage.success('新增成功')
    }
    
    dialogVisible.value = false
    getList()
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('提交失败，请重试')
  }
}

// 提交分类表单
const submitCategoryForm = async () => {
  if (!categoryFormRef.value) return
  
  try {
    await categoryFormRef.value.validate()
    await attractionApi.createAttractionCategory(categoryForm)
    ElMessage.success('新增分类成功')
    categoryDialogVisible.value = false
    getCategories()
  } catch (error) {
    console.error('新增分类失败:', error)
  }
}

// 取消
const cancel = () => {
  dialogVisible.value = false
  resetForm()
}

// 位置变化处理
const handleLocationChange = (location) => {
  form.longitude = location.longitude
  form.latitude = location.latitude
  if (location.address) {
    form.address = location.address
  }
}

// 对话框打开时处理
const handleDialogOpen = () => {
  // 延迟执行，确保DOM已渲染
  setTimeout(() => {
    if (form.longitude && form.latitude) {
      locationData.value = {
        longitude: form.longitude,
        latitude: form.latitude,
        address: form.address || ''
      }
    }
  }, 100)
}

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    id: null,
    name: '',
    categoryId: null,
    description: '',
    coverImage: '',
    longitude: null,
    latitude: null,
    address: '',
    trafficGuide: '',
    openingHours: '',
    ticketPrice: null,
    status: 1
  })
  
  // 重置位置数据
  locationData.value = {
    longitude: null,
    latitude: null,
    address: ''
  }
  
  formRef.value?.clearValidate()
}

// 重置分类表单
const resetCategoryForm = () => {
  Object.assign(categoryForm, {
    name: '',
    description: '',
    sortOrder: 0
  })
  categoryFormRef.value?.clearValidate()
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

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString()
}

// 初始化
onMounted(() => {
  getCategories()
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

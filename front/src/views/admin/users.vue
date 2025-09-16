<template>
  <div>
    <!-- 搜索表单 -->
    <el-card class="search-card">
      <el-form :model="queryParams" ref="queryForm" :inline="true">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="queryParams.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="queryParams.email" placeholder="请输入邮箱" clearable />
        </el-form-item>
        <el-form-item label="手机号" prop="phoneNumber">
          <el-input v-model="queryParams.phoneNumber" placeholder="请输入手机号" clearable />
        </el-form-item>
        <el-form-item label="状态" prop="enabled">
          <el-select v-model="queryParams.enabled" placeholder="请选择状态" clearable>
            <el-option label="启用" :value="true" />
            <el-option label="禁用" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 操作按钮区域 -->
      <div class="table-toolbar">
        <el-button type="primary" size="small" @click="handleAdd">添加用户</el-button>
        <el-button type="danger" size="small" :disabled="selectedIds.length === 0" @click="handleBatchDelete">批量删除</el-button>
        <el-button type="warning" size="small" :disabled="selectedIds.length === 0" @click="handleBatchStatus(false)">批量禁用</el-button>
        <el-button type="success" size="small" :disabled="selectedIds.length === 0" @click="handleBatchStatus(true)">批量启用</el-button>
      </div>
    </el-card>

    <!-- 用户列表 -->
    <el-card class="table-card">
      <el-table 
        v-loading="loading" 
        :data="userList" 
        stripe 
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"  fixed="left"/>
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="realName" label="真实姓名" width="120" />
        <el-table-column label="头像" width="100" align="center">
          <template #default="scope">
            <el-avatar v-if="scope.row.avatar" :size="40" :src="scope.row.avatar" @error="() => true">
              <el-icon><User /></el-icon>
            </el-avatar>
            <el-avatar v-else :size="40">
              <el-icon><User /></el-icon>
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column prop="phoneNumber" label="手机号" width="120" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.role === 'USER'" type="success">普通用户</el-tag>
            <el-tag v-else-if="scope.row.role === 'ADMIN'" type="danger">管理员</el-tag>
            <el-tag v-else-if="scope.row.role === 'STAFF'" type="warning">工作人员</el-tag>
            <el-tag v-else type="info">{{ scope.row.role }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="enabled" label="状态" width="80">
          <template #default="scope">
            <el-tag v-if="scope.row.enabled" type="success">启用</el-tag>
            <el-tag v-else type="info">禁用</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="注册时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="320" fixed="right" align="center">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="success" size="small" v-if="!scope.row.enabled" @click="handleStatusChange(scope.row, true)">启用</el-button>
            <el-button type="warning" size="small" v-else @click="handleStatusChange(scope.row, false)">禁用</el-button>
            <el-button type="info" size="small" @click="handleResetPassword(scope.row)">重置密码</el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          :current-page="queryParams.current"
          :page-size="queryParams.size"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @update:current-page="handleCurrentChange"
          @update:page-size="handleSizeChange"
        />
      </div>
    </el-card>

    <!-- 添加/编辑用户对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="600px"
      append-to-body
      destroy-on-close
    >
      <el-form
        :model="userForm"
        :rules="userRules"
        ref="userFormRef"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" placeholder="请输入用户名" :disabled="editMode" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!editMode">
          <el-input v-model="userForm.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="userForm.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号" prop="phoneNumber">
          <el-input v-model="userForm.phoneNumber" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="头像" prop="avatar">
          <el-upload
            class="avatar-uploader"
            action="/api/file/upload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
            :headers="uploadHeaders"
          >
            <el-avatar v-if="userForm.avatar" :size="100" :src="userForm.avatar" @error="() => true">
              <el-icon><User /></el-icon>
            </el-avatar>
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            <div class="upload-tip">点击上传头像</div>
          </el-upload>
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-radio-group v-model="userForm.role">
            <el-radio label="USER">普通用户</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态" prop="enabled">
          <el-radio-group v-model="userForm.enabled">
            <el-radio :label="true">启用</el-radio>
            <el-radio :label="false">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserList, addUser, updateUser, deleteUser, updateUserStatus, resetUserPassword, checkUsername, checkEmail } from '@/api/user'
import { User, Plus } from '@element-plus/icons-vue'

// 查询参数
const queryParams = reactive({
  current: 1,
  size: 10,
  username: '',
  email: '',
  phoneNumber: '',
  role: 'USER', // 只显示普通用户，员工管理在另一个页面
  enabled: null
})

// 用户列表数据
const userList = ref([])
const total = ref(0)
const loading = ref(false)
const selectedIds = ref([]) // 选中的用户ID数组

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = computed(() => editMode.value ? '编辑用户' : '添加用户')
const editMode = ref(false)
const userFormRef = ref(null)
const userForm = reactive({
  id: null,
  username: '',
  password: '',
  realName: '',
  email: '',
  phoneNumber: '',
  avatar: '',
  role: 'USER',
  enabled: true
})

// 表单验证规则
const userRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 4, max: 20, message: '用户名长度必须在4~20个字符之间', trigger: 'blur' },
    { validator: validateUsername, trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度必须在6~20个字符之间', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' },
    { validator: validateEmail, trigger: 'blur' }
  ],
  phoneNumber: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
}

// 上传头像相关
const uploadHeaders = {
  // 如果需要认证，这里添加token
  Authorization: sessionStorage.getItem('token') || ''
}

// 头像上传成功回调
const handleAvatarSuccess = (response, uploadFile) => {
  if (response.code === 200) {
    userForm.avatar = response.data
    ElMessage.success('头像上传成功')
  } else {
    ElMessage.error(response.message || '头像上传失败')
  }
}

// 头像上传前的校验
const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('头像必须是图片格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('头像大小不能超过 2MB!')
    return false
  }
  return true
}

// 初始化
onMounted(() => {
  getList()
})

// 获取用户列表
async function getList() {
  loading.value = true
  try {
    const res = await getUserList(queryParams)
    if (res.code === 200) {
      userList.value = res.data.records
      total.value = res.data.total
    } else {
      ElMessage.error(res.message || '获取用户列表失败')
    }
  } catch (error) {
    console.error('获取用户列表出错', error)
    ElMessage.error('获取用户列表出错')
  } finally {
    loading.value = false
  }
}

// 查询
function handleQuery() {
  queryParams.current = 1
  getList()
}

// 重置查询
function resetQuery() {
  queryParams.username = ''
  queryParams.email = ''
  queryParams.phoneNumber = ''
  queryParams.enabled = null
  handleQuery()
}

// 分页大小改变
function handleSizeChange(size) {
  queryParams.size = size
  getList()
}

// 页码改变
function handleCurrentChange(page) {
  queryParams.current = page
  getList()
}

// 表格多选变化
function handleSelectionChange(selection) {
  selectedIds.value = selection.map(item => item.id)
}

// 批量删除
async function handleBatchDelete() {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请至少选择一条记录')
    return
  }

  ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 个用户吗?`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // 由于后端可能没有批量删除接口，这里采用循环调用单个删除接口的方式
      const promises = selectedIds.value.map(id => deleteUser(id))
      const results = await Promise.allSettled(promises)
      
      const successCount = results.filter(result => result.status === 'fulfilled' && result.value.code === 200).length
      
      if (successCount > 0) {
        ElMessage.success(`成功删除 ${successCount} 个用户`)
        // 刷新列表
        getList()
      } else {
        ElMessage.error('批量删除失败')
      }
    } catch (error) {
      console.error('批量删除出错', error)
      ElMessage.error('批量删除出错')
    }
  }).catch(() => {})
}

// 批量更新用户状态
async function handleBatchStatus(enabled) {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请至少选择一条记录')
    return
  }

  const statusText = enabled ? '启用' : '禁用'
  
  ElMessageBox.confirm(`确定要${statusText}选中的 ${selectedIds.value.length} 个用户吗?`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // 同样采用循环调用单个更新状态接口
      const promises = selectedIds.value.map(id => updateUserStatus(id, enabled))
      const results = await Promise.allSettled(promises)
      
      const successCount = results.filter(result => result.status === 'fulfilled' && result.value.code === 200).length
      
      if (successCount > 0) {
        ElMessage.success(`成功${statusText} ${successCount} 个用户`)
        // 刷新列表
        getList()
      } else {
        ElMessage.error(`批量${statusText}失败`)
      }
    } catch (error) {
      console.error(`批量${statusText}出错`, error)
      ElMessage.error(`批量${statusText}出错`)
    }
  }).catch(() => {})
}

// 显示添加对话框
function handleAdd() {
  resetForm()
  editMode.value = false
  dialogVisible.value = true
}

// 显示编辑对话框
function handleEdit(row) {
  resetForm()
  editMode.value = true
  Object.assign(userForm, row)
  dialogVisible.value = true
}

// 重置表单
function resetForm() {
  userForm.id = null
  userForm.username = ''
  userForm.password = ''
  userForm.realName = ''
  userForm.email = ''
  userForm.phoneNumber = ''
  userForm.avatar = ''
  userForm.role = 'USER'
  userForm.enabled = true
  if (userFormRef.value) {
    userFormRef.value.resetFields()
  }
}

// 提交表单
async function submitForm() {
  if (userFormRef.value) {
    await userFormRef.value.validate(async (valid) => {
      if (valid) {
        try {
          if (editMode.value) {
            // 编辑用户
            const res = await updateUser(userForm.id, userForm)
            if (res.code === 200) {
              ElMessage.success('更新用户成功')
              dialogVisible.value = false
              getList()
            } else {
              ElMessage.error(res.message || '更新用户失败')
            }
          } else {
            // 添加用户
            const res = await addUser(userForm)
            if (res.code === 200) {
              ElMessage.success('添加用户成功')
              dialogVisible.value = false
              getList()
            } else {
              ElMessage.error(res.message || '添加用户失败')
            }
          }
        } catch (error) {
          console.error('提交表单出错', error)
          ElMessage.error('操作失败，请重试')
        }
      }
    })
  }
}

// 启用/禁用用户
async function handleStatusChange(row, enabled) {
  const statusText = enabled ? '启用' : '禁用'
  try {
    const res = await updateUserStatus(row.id, enabled)
    if (res.code === 200) {
      ElMessage.success(`${statusText}用户成功`)
      getList()
    } else {
      ElMessage.error(res.message || `${statusText}用户失败`)
    }
  } catch (error) {
    console.error(`${statusText}用户出错`, error)
    ElMessage.error(`${statusText}用户出错`)
  }
}

// 重置密码
async function handleResetPassword(row) {
  ElMessageBox.confirm('确定要重置该用户的密码吗? 密码将被重置为: 123456', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await resetUserPassword(row.id)
      if (res.code === 200) {
        ElMessage({
          type: 'success',
          message: '密码已成功重置为: 123456'
        })
      } else {
        ElMessage.error(res.message || '重置密码失败')
      }
    } catch (error) {
      console.error('重置密码出错', error)
      ElMessage.error('重置密码出错')
    }
  }).catch(() => {})
}

// 删除用户
async function handleDelete(row) {
  ElMessageBox.confirm('确定要删除该用户吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteUser(row.id)
      if (res.code === 200) {
        ElMessage.success('删除用户成功')
        getList()
      } else {
        ElMessage.error(res.message || '删除用户失败')
      }
    } catch (error) {
      console.error('删除用户出错', error)
      ElMessage.error('删除用户出错')
    }
  }).catch(() => {})
}

// 校验用户名是否已存在
async function validateUsername(rule, value, callback) {
  if (!value || editMode.value) {
    callback()
    return
  }
  
  try {
    const res = await checkUsername(value)
    if (res.code === 200 && res.data) {
      callback(new Error('用户名已存在'))
    } else {
      callback()
    }
  } catch (error) {
    callback()
  }
}

// 校验邮箱是否已存在
async function validateEmail(rule, value, callback) {
  if (!value || (editMode.value && value === userForm.email)) {
    callback()
    return
  }
  
  try {
    const res = await checkEmail(value)
    if (res.code === 200 && res.data) {
      callback(new Error('邮箱已被注册'))
    } else {
      callback()
    }
  } catch (error) {
    callback()
  }
}

// 格式化日期
function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(date)
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-weight: 500;
}

.search-card {
  margin-bottom: 20px;
}

.table-toolbar {
  margin-top: 5px;
  display: flex;
  gap: 10px;
}

.table-card {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.dialog-footer {
  text-align: right;
}

.avatar-uploader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #d9d9d9;
  border-radius: 50%;
}

.upload-tip {
  margin-top: 10px;
  color: #909399;
  font-size: 14px;
}
</style> 
<template>
  <div class="person-container">
    <el-card class="person-card">
      <template #header>
        <div class="card-header">
          <h2>个人中心</h2>
        </div>
      </template>
      
      <!-- 个人信息展示区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="avatar-container">
            <el-avatar :size="120" :src="userForm.avatar" @error="() => true">
              <el-icon><User /></el-icon>
            </el-avatar>
            <el-upload
              class="avatar-uploader"
              action="/api/file/upload"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload"
              :headers="uploadHeaders"
            >
              <el-button type="primary" size="small" style="margin-top: 10px">更换头像</el-button>
            </el-upload>
          </div>
        </el-col>
        <el-col :span="16">
          <el-descriptions title="基本信息" :column="1" border>
            <el-descriptions-item label="用户名">{{ userInfo.username }}</el-descriptions-item>
            <el-descriptions-item label="账号角色">
              <el-tag v-if="userInfo.role === 'ADMIN'" type="danger">管理员</el-tag>
              <el-tag v-else-if="userInfo.role === 'STAFF'" type="warning">工作人员</el-tag>
              <el-tag v-else type="info">普通用户</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="账号状态">
              <el-tag v-if="userInfo.enabled" type="success">正常</el-tag>
              <el-tag v-else type="info">禁用</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="注册时间">{{ formatDate(userInfo.createdAt) }}</el-descriptions-item>
            <el-descriptions-item label="最后更新时间">{{ formatDate(userInfo.updatedAt) }}</el-descriptions-item>
          </el-descriptions>
        </el-col>
      </el-row>

      <!-- 信息编辑表单 -->
      <div class="form-container">
        <h3>个人资料编辑</h3>
        <el-form 
          :model="userForm" 
          :rules="formRules" 
          ref="userFormRef" 
          label-width="100px"
          status-icon
        >
          <el-form-item label="真实姓名" prop="realName">
            <el-input v-model="userForm.realName" placeholder="请输入真实姓名" />
          </el-form-item>
          <el-form-item label="电子邮箱" prop="email">
            <el-input v-model="userForm.email" placeholder="请输入电子邮箱" />
          </el-form-item>
          <el-form-item label="手机号码" prop="phoneNumber">
            <el-input v-model="userForm.phoneNumber" placeholder="请输入手机号码" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitForm">保存修改</el-button>
            <el-button @click="resetForm">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { User } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { updateProfile, getUserDetail } from '@/api/user'

const userStore = useUserStore()
const userFormRef = ref(null)

// 用户基本信息
const userInfo = computed(() => userStore.userInfo)

// 表单数据
const userForm = reactive({
  id: '',
  username: '',
  realName: '',
  email: '',
  phoneNumber: '',
  avatar: ''
})

// 表单验证规则
const formRules = {
  email: [
    { required: true, message: '请输入电子邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的电子邮箱地址', trigger: 'blur' }
  ],
  phoneNumber: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
}

// 上传头像相关
const uploadHeaders = {
  Authorization: sessionStorage.getItem('token') || ''
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

// 头像上传成功回调
const handleAvatarSuccess = (response, uploadFile) => {
  if (response.code === 200) {
    userForm.avatar = response.data
    ElMessage.success('头像上传成功')
    // 更新用户头像
    submitForm()
  } else {
    ElMessage.error(response.message || '头像上传失败')
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '暂无数据'
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

// 初始化获取用户详细信息
const initUserData = async () => {
  try {
    // 如果有userId，则获取详细信息
    if (userInfo.value && userInfo.value.id) {
      const res = await getUserDetail(userInfo.value.id)
      if (res.code === 200) {
        // 更新表单数据
        Object.assign(userForm, res.data)
        
        // 重要：同时更新store中的用户信息，确保基本信息展示区显示完整数据
        userStore.setUserInfo({
          ...userInfo.value,
          ...res.data
        })
      }
    } else {
      // 否则使用store中的基础信息
      Object.assign(userForm, userInfo.value)
    }
  } catch (error) {
    console.error('获取用户详情失败:', error)
    ElMessage.error('获取用户信息失败，请刷新重试')
  }
}

// 提交表单
const submitForm = async () => {
  if (userFormRef.value) {
    await userFormRef.value.validate(async (valid) => {
      if (valid) {
        try {
          const res = await updateProfile(userForm)
          if (res.code === 200) {
            ElMessage.success('个人信息更新成功')
            
            // 重新获取用户信息，确保获取到最新的updatedAt时间
            const userRes = await getUserDetail(userInfo.value.id)
            if (userRes.code === 200) {
              userStore.setUserInfo({
                ...userInfo.value,
                ...userRes.data
              })
            }
          } else {
            ElMessage.error(res.message || '更新个人信息失败')
          }
        } catch (error) {
          console.error('更新个人信息出错:', error)
          ElMessage.error('操作失败，请重试')
        }
      }
    })
  }
}

// 重置表单
const resetForm = () => {
  userFormRef.value?.resetFields()
  initUserData() // 重新获取原始数据
}

onMounted(() => {
  initUserData()
})
</script>

<style scoped>
.person-container {
  padding: 5px;
}

.person-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.form-container {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.form-container h3 {
  margin-bottom: 20px;
  font-weight: 500;
  font-size: 18px;
  color: #606266;
}

.avatar-uploader {
  margin-top: 10px;
  text-align: center;
}
</style> 
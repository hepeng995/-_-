<template>
  <div class="user-profile">
    <div class="container">
      <div class="page-header">
        <h1>个人中心</h1>
        <p>管理您的个人信息和账户设置</p>
      </div>

      <div class="profile-content">
        <!-- 个人信息卡片 -->
        <div class="profile-card">
          <div class="profile-header">
            <div class="avatar-section">
              <el-avatar :size="120" :src="userInfo.avatar">
                <el-icon size="40"><User /></el-icon>
              </el-avatar>
              <el-button type="primary" size="small" @click="showAvatarUpload = true">
                更换头像
              </el-button>
            </div>
            <div class="user-basic">
              <h2>{{ userInfo.username }}</h2>
              <div class="user-meta">
                <el-tag :type="userInfo.role === 'ADMIN' ? 'danger' : 'primary'">
                  {{ userInfo.role === 'ADMIN' ? '管理员' : '普通用户' }}
                </el-tag>
                <span class="join-date">注册时间：{{ formatDate(userInfo.createdAt) }}</span>
              </div>
            </div>
          </div>

          <el-divider />

          <div class="profile-form">
            <el-form 
              ref="formRef"
              :model="formData"
              :rules="rules"
              label-width="100px"
              size="large"
            >
              <el-form-item label="用户名" prop="username">
                <el-input v-model="formData.username" disabled />
              </el-form-item>
              
              <el-form-item label="真实姓名" prop="realName">
                <el-input v-model="formData.realName" placeholder="请输入真实姓名" />
              </el-form-item>
              
              <el-form-item label="电子邮箱" prop="email">
                <el-input v-model="formData.email" placeholder="请输入电子邮箱" />
              </el-form-item>
              
              <el-form-item label="手机号码" prop="phoneNumber">
                <el-input v-model="formData.phoneNumber" placeholder="请输入手机号码" />
              </el-form-item>
              
              <el-form-item>
                <el-button type="primary" @click="updateProfile" :loading="loading">
                  保存修改
                </el-button>
                <el-button @click="resetForm">重置</el-button>
                <el-button @click="$router.push('/user/change-password')">
                  修改密码
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>

        <!-- 最近订单 -->
        <div class="recent-orders-card">
          <div class="card-header">
            <h3>最近订单</h3>
            <el-button type="primary" link @click="$router.push('/user/orders')">
              查看全部 <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
          <div v-if="recentOrders.length > 0" class="recent-orders-list">
            <div v-for="order in recentOrders" :key="order.id" class="order-item">
              <div class="order-info">
                <div class="order-number">订单号：{{ order.orderNo }}</div>
                <div class="order-date">{{ formatDate(order.createdAt) }}</div>
              </div>
              <div class="order-status">
                <el-tag :type="getStatusType(order.orderStatus)">
                  {{ getStatusText(order.orderStatus) }}
                </el-tag>
                <div class="order-amount">￥{{ order.actualAmount }}</div>
              </div>
            </div>
          </div>
          <el-empty v-else description="暂无订单记录" />
        </div>
      </div>

      <!-- 头像上传弹窗 -->
      <el-dialog v-model="showAvatarUpload" title="更换头像" width="400px">
        <el-upload
          class="avatar-uploader"
          :action="uploadUrl"
          :headers="uploadHeaders"
          :show-file-list="false"
          :on-success="handleAvatarSuccess"
          :before-upload="beforeAvatarUpload"
        >
          <img v-if="tempAvatar" :src="tempAvatar" class="avatar-preview" />
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
        </el-upload>
        <div class="upload-tips">
          <p>支持 JPG、PNG 格式，文件大小不超过 2MB</p>
        </div>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="showAvatarUpload = false">取消</el-button>
            <el-button type="primary" @click="confirmAvatar" :disabled="!tempAvatar">
              确定
            </el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Plus, ArrowRight } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import userApi from '@/api/user'
import orderApi from '@/api/order'

const router = useRouter()
const userStore = useUserStore()

// 数据状态
const loading = ref(false)
const showAvatarUpload = ref(false)
const tempAvatar = ref('')
const formRef = ref()

// 用户信息
const userInfo = computed(() => userStore.userInfo || {})

// 表单数据
const formData = reactive({
  username: '',
  realName: '',
  email: '',
  phoneNumber: ''
})

// 最近订单
const recentOrders = ref([])

// 上传配置
const uploadUrl = ref('/api/file/upload')
const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${sessionStorage.getItem('token')}`
}))

// 表单验证规则
const rules = {
  email: [
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phoneNumber: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

// 获取最近订单
const getRecentOrders = async () => {
  try {
    const res = await orderApi.getOrderPage({
      current: 1,
      size: 5
    })
    if (res.code === 200) {
      recentOrders.value = res.data.records
    }
  } catch (error) {
    console.error('获取最近订单失败:', error)
  }
}

// 初始化表单数据
const initFormData = () => {
  formData.username = userInfo.value.username || ''
  formData.realName = userInfo.value.realName || ''
  formData.email = userInfo.value.email || ''
  formData.phoneNumber = userInfo.value.phoneNumber || ''
  
  console.log('初始化表单数据:', userInfo.value)
}

// 监听用户信息变化
watch(() => userInfo.value, (newVal) => {
  if (newVal) {
    initFormData()
  }
}, { deep: true })

// 重置表单
const resetForm = () => {
  initFormData()
}

// 更新个人资料
const updateProfile = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    loading.value = true
    
    const updateData = {
      realName: formData.realName,
      email: formData.email,
      phoneNumber: formData.phoneNumber
    }
    
    const res = await userApi.updateProfile(updateData)
    if (res.code === 200) {
      ElMessage.success('个人资料更新成功')
      // 更新store中的用户信息
      await userStore.getInfo()
    } else {
      ElMessage.error(res.message || '更新失败')
    }
  } catch (error) {
    if (error.message) {
      console.error('更新个人资料失败:', error)
      ElMessage.error('更新失败')
    }
  } finally {
    loading.value = false
  }
}

// 头像上传前检查
const beforeAvatarUpload = (file) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG) {
    ElMessage.error('头像图片只能是 JPG/PNG 格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('头像图片大小不能超过 2MB!')
    return false
  }
  return true
}

// 头像上传成功
const handleAvatarSuccess = (response) => {
  if (response.code === 200) {
    tempAvatar.value = response.data.url
  } else {
    ElMessage.error(response.message || '上传失败')
  }
}

// 确认更换头像
const confirmAvatar = async () => {
  if (!tempAvatar.value) return
  
  try {
    const res = await userApi.updateAvatar({ avatar: tempAvatar.value })
    if (res.code === 200) {
      ElMessage.success('头像更换成功')
      showAvatarUpload.value = false
      tempAvatar.value = ''
      // 更新store中的用户信息
      await userStore.getInfo()
    } else {
      ElMessage.error(res.message || '更换失败')
    }
  } catch (error) {
    console.error('更换头像失败:', error)
    ElMessage.error('更换失败')
  }
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// 获取订单状态文本
const getStatusText = (status) => {
  const statusMap = {
    1: '待付款',
    2: '待发货',
    3: '已发货',
    4: '已完成',
    5: '已取消',
    6: '已退款'
  }
  return statusMap[status] || '未知状态'
}

// 获取订单状态类型
const getStatusType = (status) => {
  const typeMap = {
    1: 'warning',
    2: 'info',
    3: 'primary',
    4: 'success',
    5: 'danger',
    6: 'info'
  }
  return typeMap[status] || 'info'
}

// 初始化
onMounted(() => {
  initFormData()
  getRecentOrders()
})
</script>

<style scoped>
.user-profile {
  min-height: 100vh;
  background: #f8fafc;
  padding: 40px 0;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 页面头部 */
.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 32px;
  color: #1e293b;
  margin-bottom: 8px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-header p {
  font-size: 16px;
  color: #64748b;
}

/* 个人资料内容 */
.profile-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.profile-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}

/* 个人资料头部 */
.profile-header {
  display: flex;
  gap: 32px;
  align-items: center;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.user-basic {
  flex: 1;
}

.user-basic h2 {
  font-size: 24px;
  color: #1e293b;
  margin-bottom: 12px;
  font-weight: 600;
}

.user-meta {
  display: flex;
  align-items: center;
  gap: 16px;
}

.join-date {
  color: #64748b;
  font-size: 14px;
}

/* 最近订单 */
.recent-orders-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-header h3 {
  font-size: 18px;
  color: #1e293b;
  font-weight: 600;
  margin: 0;
}

.recent-orders-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.order-item:hover {
  background: #f1f5f9;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.order-number {
  font-weight: 500;
  color: #1e293b;
}

.order-date {
  font-size: 12px;
  color: #64748b;
}

.order-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.order-amount {
  font-weight: 600;
  color: #ef4444;
}

/* 头像上传 */
.avatar-uploader {
  text-align: center;
}

.avatar-uploader :deep(.el-upload) {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-uploader :deep(.el-upload:hover) {
  border-color: #409eff;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}

.avatar-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-tips {
  text-align: center;
  margin-top: 16px;
}

.upload-tips p {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header h1 {
    font-size: 24px;
  }
  
  .profile-header {
    flex-direction: column;
    text-align: center;
  }
  
  .order-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .order-status {
    align-items: flex-start;
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
  }
}
</style>
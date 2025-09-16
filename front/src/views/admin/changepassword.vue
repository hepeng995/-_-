<template>
  <div class="change-password-container">
    <el-card class="password-card">
      <template #header>
        <div class="card-header">
          <h2>修改密码</h2>
        </div>
      </template>
      
      <el-form 
        :model="passwordForm" 
        :rules="formRules" 
        ref="passwordFormRef" 
        label-width="100px"
        status-icon
      >
        <el-form-item label="原密码" prop="oldPassword">
          <el-input 
            v-model="passwordForm.oldPassword" 
            placeholder="请输入原密码" 
            type="password"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="新密码" prop="newPassword">
          <el-input 
            v-model="passwordForm.newPassword" 
            placeholder="请输入新密码" 
            type="password"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input 
            v-model="passwordForm.confirmPassword" 
            placeholder="请再次输入新密码" 
            type="password"
            show-password
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="submitForm" :loading="loading">确认修改</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
      
      <div class="tips">
        <p>温馨提示：</p>
        <ul>
          <li>密码修改成功后，系统将自动退出并跳转到登录页面</li>
          <li>请使用字母、数字和特殊字符的组合，提高密码安全性</li>
        </ul>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { changePassword } from '@/api/user'

const router = useRouter()
const userStore = useUserStore()
const passwordFormRef = ref(null)
const loading = ref(false)

// 表单数据
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 表单验证规则
const formRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 提交表单
const submitForm = async () => {
  if (!passwordFormRef.value) return
  
  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true
        
        const res = await changePassword({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword
        })
        
        if (res.code === 200) {
          ElMessage.success('密码修改成功，请重新登录')
          
          // 清除所有存储的信息
          userStore.resetState()
          sessionStorage.clear()
          localStorage.removeItem('pinia-user')
          
          // 跳转到登录页面
          setTimeout(() => {
            router.push('/login')
          }, 1500)
        } else {
          ElMessage.error(res.message || '密码修改失败')
        }
      } catch (error) {
        console.error('修改密码出错:', error)
        
        if (error.response && error.response.data) {
          const errorData = error.response.data
          ElMessage.error(errorData.message || '操作失败，请重试')
        } else if (error.message) {
          ElMessage.error(error.message)
        } else {
          ElMessage.error('修改密码失败，请检查原密码是否正确')
        }
      } finally {
        loading.value = false
      }
    }
  })
}

// 重置表单
const resetForm = () => {
  passwordFormRef.value?.resetFields()
}
</script>

<style scoped>
.change-password-container {
  padding: 5px;
}

.password-card {
  max-width: 600px;
  margin: 20px auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tips {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.tips p {
  font-weight: bold;
  margin-bottom: 10px;
  color: #606266;
}

.tips ul {
  padding-left: 20px;
  color: #909399;
}

.tips li {
  line-height: 1.8;
}
</style> 
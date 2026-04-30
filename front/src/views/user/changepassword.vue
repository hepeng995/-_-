<template>
  <div class="change-password">
    <div class="container">
      <div class="page-header">
        <h1>修改密码</h1>
        <p>为了账户安全，请定期更换密码</p>
      </div>

      <div class="password-card">
        <el-form 
          ref="formRef"
          :model="formData"
          :rules="rules"
          label-width="120px"
          size="large"
        >
          <el-form-item label="当前密码" prop="currentPassword">
            <el-input
              v-model="formData.currentPassword"
              type="password"
              placeholder="请输入当前密码"
              show-password
              clearable
            />
          </el-form-item>
          
          <el-form-item label="新密码" prop="newPassword">
            <el-input
              v-model="formData.newPassword"
              type="password"
              placeholder="请输入新密码"
              show-password
              clearable
            />
            <div class="password-tips">
              <p>密码要求：</p>
              <ul>
                <li :class="{ valid: passwordChecks.length }">长度8-20位</li>
                <li :class="{ valid: passwordChecks.hasLetter }">包含字母</li>
                <li :class="{ valid: passwordChecks.hasNumber }">包含数字</li>
                <li :class="{ valid: passwordChecks.hasSpecial }">包含特殊字符（可选）</li>
              </ul>
            </div>
          </el-form-item>
          
          <el-form-item label="确认新密码" prop="confirmPassword">
            <el-input
              v-model="formData.confirmPassword"
              type="password"
              placeholder="请再次输入新密码"
              show-password
              clearable
            />
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="changePassword" :loading="loading">
              修改密码
            </el-button>
            <el-button @click="resetForm">重置</el-button>
            <el-button @click="$router.go(-1)">返回</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 安全提示 -->
      <div class="security-tips">
        <h3>
          <el-icon><Lock /></el-icon>
          安全提示
        </h3>
        <ul>
          <li>请使用强密码，包含字母、数字和特殊字符</li>
          <li>不要使用与其他网站相同的密码</li>
          <li>建议定期更换密码，提高账户安全性</li>
          <li>如果发现账户异常，请立即修改密码并联系客服</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Lock } from '@element-plus/icons-vue'
import userApi from '@/api/user'

const router = useRouter()

// 数据状态
const loading = ref(false)
const formRef = ref()

// 表单数据
const formData = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 密码强度检查
const passwordChecks = computed(() => {
  const password = formData.newPassword
  return {
    length: password.length >= 8 && password.length <= 20,
    hasLetter: /[a-zA-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  }
})

// 自定义密码验证
const validatePassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入新密码'))
  } else if (value.length < 8 || value.length > 20) {
    callback(new Error('密码长度应为8-20位'))
  } else if (!/[a-zA-Z]/.test(value)) {
    callback(new Error('密码必须包含字母'))
  } else if (!/\d/.test(value)) {
    callback(new Error('密码必须包含数字'))
  } else {
    callback()
  }
}

// 确认密码验证
const validateConfirmPassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请确认新密码'))
  } else if (value !== formData.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

// 表单验证规则
const rules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { validator: validatePassword, trigger: 'blur' }
  ],
  confirmPassword: [
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  formData.currentPassword = ''
  formData.newPassword = ''
  formData.confirmPassword = ''
}

// 修改密码
const changePassword = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    loading.value = true
    
    const res = await userApi.changePassword({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword
    })
    
    if (res.code === 200) {
      ElMessage.success('密码修改成功，请重新登录')
      // 清空表单
      resetForm()
      // 可以选择跳转到登录页面
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } else {
      ElMessage.error(res.message || '密码修改失败')
    }
  } catch (error) {
    if (error.message) {
      console.error('修改密码失败:', error)
      ElMessage.error('修改密码失败')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.change-password {
  min-height: var(--app-height);
  min-height: var(--app-dvh);
  background: var(--color-bg-body);
  padding: 40px 0;
}

.container {
  max-width: 600px;
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
  color: var(--color-text-primary);
  margin-bottom: 8px;
  font-weight: 700;
}

.page-header p {
  font-size: 16px;
  color: var(--color-text-tertiary);
}

/* 密码修改卡片 */
.password-card {
  background: var(--color-bg-surface);
  border-radius: var(--radius-xl);
  padding: 32px;
  box-shadow: var(--shadow-card);
  margin-bottom: 24px;
}

/* 密码提示 */
.password-tips {
  margin-top: 12px;
  padding: 16px;
  background: var(--color-bg-body);
  border-radius: 8px;
  border-left: 4px solid var(--color-info);
}

.password-tips p {
  font-size: 14px;
  color: var(--color-text-primary);
  font-weight: 600;
  margin: 0 0 8px 0;
}

.password-tips ul {
  margin: 0;
  padding-left: 20px;
}

.password-tips li {
  font-size: 13px;
  color: var(--color-text-tertiary);
  margin-bottom: 4px;
  transition: color 0.3s ease;
}

.password-tips li.valid {
  color: var(--color-primary-500);
  font-weight: 500;
}

/* 安全提示 */
.security-tips {
  background: var(--color-bg-surface);
  border-radius: var(--radius-xl);
  padding: 24px;
  box-shadow: var(--shadow-card);
}

.security-tips h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  color: var(--color-text-primary);
  margin-bottom: 16px;
  font-weight: 600;
}

.security-tips h3 .el-icon {
  color: var(--color-warning);
}

.security-tips ul {
  margin: 0;
  padding-left: 20px;
}

.security-tips li {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header h1 {
    font-size: 24px;
  }

  .password-card,
  .security-tips {
    padding: 20px;
  }

  :deep(.el-form-item__label) {
    width: 100% !important;
    justify-content: flex-start;
    padding: 0 0 6px;
  }

  :deep(.el-form-item__content) {
    margin-left: 0 !important;
  }

  :deep(.el-form-item:last-child .el-form-item__content) {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  :deep(.el-form-item:last-child .el-button) {
    flex: 1 1 100%;
    margin-left: 0;
  }
}
</style>

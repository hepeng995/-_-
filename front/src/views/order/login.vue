<template>
  <div class="login-container">
    <div class="login-card">
      <div class="logo-container">
        <h1>新桃源智界</h1>
      </div>
      <h3>用户登录</h3>
      
      <el-form :model="loginForm" :rules="rules" ref="loginFormRef">
        <el-form-item prop="username">
          <el-input 
            v-model="loginForm.username" 
            placeholder="用户名"
            size="large"
            :prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="密码" 
            size="large"
            :prefix-icon="Lock"
            @keyup.enter="handleLogin" 
          />
        </el-form-item>
        
        <el-button 
          type="primary" 
          class="login-btn" 
          @click="handleLogin" 
          :loading="loading"
          size="large"
          round
        >
          登录
        </el-button>
        
      
      </el-form>
      
      <div class="login-options">
        <router-link to="/register" class="register-link">还没有账号？立即注册</router-link>
      </div>
    </div>
    
    <div class="footer">
      &copy; {{ new Date().getFullYear() }} 乡村振兴·新桃源智界
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

// 声明表单引用和状态
const loginFormRef = ref(null)
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const loading = ref(false)

// 表单数据
const loginForm = reactive({
  username: '',
  password: ''
})

// 表单规则
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

// 调试登录方法
const debugLogin = () => {
  console.log('调试：强制跳转到管理后台')
  router.push('/admin').then(() => {
    console.log('调试：跳转成功')
  }).catch(err => {
    console.error('调试：跳转失败', err)
    window.location.href = '/admin'
  })
}

// 登录方法
const handleLogin = () => {
  if (loginFormRef.value) {
    loginFormRef.value.validate(async (valid) => {
      if (valid) {
        try {
          loading.value = true
          
          const userData = await userStore.loginAction(loginForm)
          ElMessage.success('登录成功')
          
          // 根据用户角色决定跳转路径
          let redirectPath = route.query.redirect
          
          // 如果没有指定重定向路径，根据用户角色决定默认跳转路径
          if (!redirectPath) {
            if (userData.role === 'ADMIN') {
              redirectPath = '/admin'
            } else {
              redirectPath = '/home'
            }
          }
          
          console.log('登录成功，准备跳转到:', redirectPath)
          console.log('当前用户角色:', userData.role)
          
          // 使用nextTick确保DOM更新后再跳转
          await router.push(redirectPath)
          console.log('跳转完成')
          
          // 如果是管理员但没有成功跳转到admin页面，强制跳转
          if (userData.role === 'ADMIN' && window.location.pathname !== '/admin') {
            console.log('强制跳转到管理后台')
            window.location.href = '/admin'
          }
        } catch (error) {
          ElMessage.error(error.message || '登录失败，请检查网络连接')
        } finally {
          loading.value = false
        }
      } else {
        ElMessage.error('请填写完整的登录信息')
        return false
      }
    })
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f1 100%);
  position: relative;
}

.login-card {
  width: 400px;
  padding: 40px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.login-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
}

.logo-container {
  text-align: center;
  margin-bottom: 20px;
}

h1 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 10px;
  background: linear-gradient(90deg, #409EFF, #67C23A);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

h3 {
  text-align: center;
  margin-bottom: 30px;
  color: #606266;
  font-weight: normal;
  font-size: 18px;
}

.login-btn {
  width: 100%;
  margin-top: 20px;
  height: 50px;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 1px;
}

.login-options {
  display: flex;
  justify-content: center;
  margin-top: 25px;
}

.register-link {
  color: #409EFF;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.2s;
}

.register-link:hover {
  color: #66b1ff;
}

.footer {
  position: absolute;
  bottom: 20px;
  color: #909399;
  font-size: 13px;
}

:deep(.el-input__wrapper) {
  border-radius: 25px;
  height: 50px;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #c0c4cc inset;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409EFF inset !important;
}
</style> 
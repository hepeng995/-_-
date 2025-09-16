<template>
  <div class="app-container">
    <!-- 头部导航 -->
    <header class="app-header">
      <div class="header-content">
        <div class="left-section">
          <div class="logo">
            <h1>新桃源智界</h1>
          </div>
          <div class="nav-menu">
            <el-menu mode="horizontal" :router="true" :default-active="activeMenu">
              <el-menu-item index="/home">首页</el-menu-item>
            </el-menu>
          </div>
        </div>
        <div class="user-actions">
          <template v-if="isLoggedIn">
            <span class="welcome-text">欢迎，{{ userInfo.username }}</span>
            <el-dropdown @command="handleCommand">
              <span class="el-dropdown-link">
                <el-avatar :size="40" :src="userInfo.avatar" class="user-avatar">
                  <el-icon><user-filled /></el-icon>
                </el-avatar>
                <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                  <el-dropdown-item command="password">修改密码</el-dropdown-item>
                  <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <el-button type="text" @click="login">登录</el-button>
            <el-button type="primary" @click="register">注册</el-button>
          </template>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="app-main">
      <router-view />
    </main>

    <!-- 底部版权信息 -->
    <footer class="app-footer">
      <div class="footer-content">
        <div class="footer-links">
          <a href="#">关于我们</a>
          <a href="#">帮助中心</a>
          <a href="#">联系我们</a>
          <a href="#">隐私政策</a>
        </div>
        <div class="copyright">
          &copy; {{ new Date().getFullYear() }} 乡村振兴·新桃源智界 版权所有
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ArrowDown, UserFilled } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 计算当前活动菜单
const activeMenu = computed(() => {
  return route.path
})

// 用户信息
const isLoggedIn = computed(() => userStore.isLoggedIn)
const userInfo = computed(() => userStore.userInfo)
const userRole = computed(() => userStore.userRole)

// 导航到登录页
const login = () => {
  router.push('/login')
}

// 导航到注册页
const register = () => {
  router.push('/register')
}

// 处理下拉菜单命令
const handleCommand = async (command) => {
  switch (command) {
    case 'profile':
      router.push('/home/profile')
      break
    case 'password':
      router.push('/home/change-password')
      break
    case 'orders':
      router.push('/home/orders')
      break
    case 'admin':
      router.push('/admin')
      break
    case 'logout':
      try {
        await userStore.logoutAction() // 调用store中的登出方法
        sessionStorage.clear()  // 清除所有会话存储
        router.push('/login')
      } catch (error) {
        // 即使登出API调用失败，也强制清除本地状态并跳转
        userStore.resetState()
        sessionStorage.clear()
        router.push('/login')
      }
      break
  }
}
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-header {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  padding: 0 20px;
  height: 60px;
}

.left-section {
  display: flex;
  align-items: center;
  width: 75%;
}

.logo {
  margin-right: 40px;
  white-space: nowrap;
}

.logo h1 {
  font-size: 20px;
  margin: 0;
  color: #409EFF;
}

.nav-menu {
  flex: 1;
}

.user-actions {
  margin-left: auto;
  white-space: nowrap;
  display: flex;
  align-items: center;
  position: absolute;
  right: 20px;
}

.el-dropdown-link {
  cursor: pointer;
  display: flex;
  align-items: center;
}

.welcome-text {
  margin-right: 10px;
  color: #333;
  font-size: 14px;
}

.user-avatar {
  margin-right: 5px;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.app-main {
  flex: 1;
  background-color: #f5f7fa;
  padding-bottom: 40px;
}

.app-footer {
  background-color: #2c3e50;
  color: #fff;
  padding: 30px 0;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  text-align: center;
}

.footer-links {
  margin-bottom: 20px;
}

.footer-links a {
  color: #ddd;
  margin: 0 15px;
  text-decoration: none;
}

.footer-links a:hover {
  color: #fff;
}

.copyright {
  color: #aaa;
  font-size: 14px;
}
</style> 
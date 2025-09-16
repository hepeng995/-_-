<template>
  <div class="admin-layout">
    <!-- 顶部栏 -->
    <header class="admin-header">
      <div class="logo">
        <h1>{{ systemName }}</h1>
      </div>
      <div class="header-right">
        <el-tooltip content="前台界面" placement="bottom">
          <el-button type="text" @click="handleCommand('front')" style="color: #fff; font-size: 16px;">
            <el-icon><House /></el-icon>
          </el-button>
        </el-tooltip>
        <span class="welcome-text">欢迎您，{{ userInfo.username }}</span>
        <el-dropdown @command="handleCommand">
          <span class="el-dropdown-link">
            <el-avatar :size="32" :src="userInfo.avatar || ''" icon="el-icon-user"></el-avatar>
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="user">
                <el-icon><User /></el-icon> 个人中心
              </el-dropdown-item>
              <el-dropdown-item command="changePwd">
                <el-icon><Lock /></el-icon> 修改密码
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <el-icon><SwitchButton /></el-icon> 退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>

    <div class="admin-container">
      <!-- 侧边栏 -->
      <aside class="admin-sidebar">
        <el-menu
          :default-active="activeMenu"
          class="el-menu-vertical"
          :router="true"
          :unique-opened="true"
          :collapse="isCollapse"
          text-color="hsla(0,0%,100%,.65)"
          active-text-color="#fff"
          background-color="#304156"
        >
          <el-menu-item index="/admin">
            <el-icon><Monitor /></el-icon>
            <template #title>首页</template>
          </el-menu-item>
          
          <el-sub-menu index="1">
            <template #title>
              <el-icon><user /></el-icon>
              <span>系统用户管理</span>
            </template>
            <el-menu-item index="/admin/users">
              <el-icon><Avatar /></el-icon>
              <span>用户列表</span>
            </el-menu-item>
          </el-sub-menu>
          
          <el-sub-menu index="2">
            <template #title>
              <el-icon><MapLocation /></el-icon>
              <span>乡村风采管理</span>
            </template>
            <el-menu-item index="/admin/attractions">
              <el-icon><Location /></el-icon>
              <span>景点管理</span>
            </el-menu-item>
            <el-menu-item index="/admin/products">
              <el-icon><ShoppingBag /></el-icon>
              <span>商品管理</span>
            </el-menu-item>
            <el-menu-item index="/admin/product-categories">
              <el-icon><Grid /></el-icon>
              <span>分类管理</span>
            </el-menu-item>
          </el-sub-menu>
          
          <el-sub-menu index="3">
            <template #title>
              <el-icon><ShoppingCart /></el-icon>
              <span>订单管理</span>
            </template>
            <el-menu-item index="/admin/orders">
              <el-icon><List /></el-icon>
              <span>订单列表</span>
            </el-menu-item>
          </el-sub-menu>
          
          <el-sub-menu index="4">
            <template #title>
              <el-icon><ChatRound /></el-icon>
              <span>资讯管理</span>
            </template>
            <el-menu-item index="/admin/news">
              <el-icon><Document /></el-icon>
              <span>动态资讯</span>
            </el-menu-item>
          </el-sub-menu>
          
          <el-sub-menu index="5">
            <template #title>
              <el-icon><ChatDotRound /></el-icon>
              <span>论坛管理</span>
            </template>
            <el-menu-item index="/admin/forum-posts">
              <el-icon><Document /></el-icon>
              <span>帖子管理</span>
            </el-menu-item>
            <el-menu-item index="/admin/forum-comments">
              <el-icon><ChatLineRound /></el-icon>
              <span>评论管理</span>
            </el-menu-item>
            <el-menu-item index="/admin/forum-statistics">
              <el-icon><DataAnalysis /></el-icon>
              <span>数据统计</span>
            </el-menu-item>
          </el-sub-menu>
          
          <el-sub-menu index="6">
            <template #title>
              <el-icon><setting /></el-icon>
              <span>系统设置</span>
            </template>
            <el-menu-item index="/admin/system-config">
              <el-icon><Tools /></el-icon>
              <span>系统参数</span>
            </el-menu-item>
            <el-menu-item index="/admin/system-logs">
              <el-icon><Document /></el-icon>
              <span>系统日志</span>
            </el-menu-item>
          </el-sub-menu>
        </el-menu>
      </aside>

      <!-- 内容区 -->
      <main class="admin-content">
        <div class="content-header">
          <div class="toggle-wrapper">
            <el-button 
              class="toggle-btn" 
              type="primary" 
              plain 
              size="small" 
              @click="toggleSideBar"
            >
              <el-icon>
                <Fold v-if="!isCollapse" />
                <Expand v-else />
              </el-icon>
            </el-button>
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/admin' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item v-if="route.meta.title">{{ route.meta.title }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
        </div>
        <div class="content-container">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getConfigByKey } from '@/api/system-config'
import { 
  ArrowDown, 
  Monitor, 
  User, 
  Film, 
  OfficeBuilding,
  Tickets,
  Setting,
  House,
  Lock,
  SwitchButton,
  Expand,
  Fold,
  Avatar,
  UserFilled,
  Key,
  VideoPlay,
  Folder,
  Box,
  Grid,
  Position,
  List,
  Money,
  PieChart,
  Tools,
  Document,
  MapLocation,
  Location,
  ShoppingBag,
  ShoppingCart,
  ChatRound,
  ChatDotRound,
  ChatLineRound,
  DataAnalysis
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const isCollapse = ref(false)
const systemName = ref('乡村振兴·新桃源智界管理平台') // 默认系统名称

// 获取系统名称
const fetchSystemName = async () => {
  try {
    const res = await getConfigByKey('system_name')
    if (res.code === 200 && res.data) {
      systemName.value = res.data.configValue || '乡村振兴·新桃源智界管理平台'
    }
  } catch (error) {
    console.error('获取系统名称失败:', error)
  }
}

// 监听系统名称变更事件
const handleSystemNameChanged = (event) => {
  systemName.value = event.detail || '电影购票系统管理平台'
}

// 组件挂载时获取系统名称并添加事件监听
onMounted(() => {
  fetchSystemName()
  window.addEventListener('system-name-changed', handleSystemNameChanged)
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('system-name-changed', handleSystemNameChanged)
})

// 用户信息
const userInfo = computed(() => userStore.userInfo)

// 当前活动菜单
const activeMenu = computed(() => route.path)

// 切换侧边栏展开状态
const toggleSideBar = () => {
  isCollapse.value = !isCollapse.value
}

// 处理下拉菜单命令
const handleCommand = async (command) => {
  switch (command) {
    case 'front':
      router.push('/home')
      break
    case 'profile':
      router.push('/admin/profile')
      break
    case 'changePwd':
      router.push('/admin/change-password')
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
.admin-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.admin-header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  position: relative;
  z-index: 10;
}

.logo {
  display: flex;
  align-items: center;
}

.logo h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.welcome-text {
  margin-right: 5px;
}

.el-dropdown-link {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.admin-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.admin-sidebar {
  height: 100%;
  transition: width 0.3s;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.admin-sidebar .el-menu:not(.el-menu--collapse) {
  width: 220px;
}

/* 选中菜单的样式 */
.el-menu-vertical .el-menu-item.is-active {
  background-color: #4299E1 !important;
  color: #ffffff !important;
}

/* 子菜单样式 */
.el-menu-vertical .el-menu--inline .el-menu-item {
  background-color: #252E3F !important;
}

.el-menu-vertical .el-menu--inline .el-menu-item.is-active {
  background-color: #4299E1 !important;
}

.el-menu-vertical .el-menu--inline .el-menu-item.is-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background-color: #63B3ED;
}

.admin-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-header {
  padding: 16px 20px;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.toggle-wrapper {
  display: flex;
  align-items: center;
}

.toggle-btn {
  margin-right: 10px;
}

.content-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}
</style> 
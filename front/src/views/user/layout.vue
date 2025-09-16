<template>
  <div class="user-layout">
    <!-- 头部导航 -->
    <header class="header">
      <div class="header-container">
        <!-- Logo和标题 -->
        <div class="logo-section">
          <img src="@/assets/image/logo.jpg" alt="Logo" class="logo" />
          <h1 class="site-title">{{ systemName.configValue }}</h1>
        </div>
        
        <!-- 导航菜单 -->
        <nav class="nav-menu">
          <router-link to="/home" class="nav-item" :class="{ active: $route.path === '/home' }">
            <el-icon><House /></el-icon>
            <span>首页</span>
          </router-link>
          <router-link to="/attractions" class="nav-item" :class="{ active: $route.path.startsWith('/attractions') }">
            <el-icon><MapLocation /></el-icon>
            <span>景点导览</span>
          </router-link>
          <router-link to="/products" class="nav-item" :class="{ active: $route.path.startsWith('/products') }">
            <el-icon><ShoppingBag /></el-icon>
            <span>特产商城</span>
          </router-link>
          <router-link to="/news" class="nav-item" :class="{ active: $route.path.startsWith('/news') }">
            <el-icon><ChatRound /></el-icon>
            <span>动态资讯</span>
          </router-link>
          <router-link to="/forum" class="nav-item" :class="{ active: $route.path.startsWith('/forum') }">
            <el-icon><ChatDotRound /></el-icon>
            <span>建言献策</span>
          </router-link>
        </nav>
        
        <!-- 用户操作区域 -->
        <div class="user-actions">
          <!-- 购物车 -->
          <div class="cart-icon" @click="goToCart">
            <el-badge :value="cartCount" :hidden="cartCount === 0">
              <el-icon size="20"><ShoppingCart /></el-icon>
            </el-badge>
          </div>
          
          <!-- 用户信息 -->
          <div v-if="userInfo" class="user-info">
            <el-dropdown @command="handleUserCommand">
              <div class="user-avatar">
                <el-avatar :src="userInfo.avatar" :size="32">
                  <el-icon><User /></el-icon>
                </el-avatar>
                <span class="username">{{ userInfo.username }}</span>
                <el-icon class="arrow-down"><ArrowDown /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                  <el-dropdown-item command="orders">我的订单</el-dropdown-item>
                  <el-dropdown-item command="addresses">我的地址</el-dropdown-item>
                  <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          
          <!-- 未登录状态 -->
          <div v-else class="auth-buttons">
            <el-button size="small" @click="goToLogin">登录</el-button>
            <el-button type="primary" size="small" @click="goToRegister">注册</el-button>
          </div>
        </div>
      </div>
    </header>
    
    <!-- 主要内容区域 -->
    <main class="main-content">
      <router-view />
    </main>
    
    <!-- 底部 -->
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-content">
          <div class="footer-section">
            <h3>关于我们</h3>
            <p>{{ systemName.configValue }}<br>致力于展示乡村美景，推广特色产品，助力乡村振兴发展。</p>
          </div>
          <div class="footer-section">
            <h3>快速链接</h3>
            <ul>
              <li><router-link to="/attractions">景点导览</router-link></li>
              <li><router-link to="/products">特产商城</router-link></li>
              <li><router-link to="/news">动态资讯</router-link></li>
            </ul>
          </div>
          <div class="footer-section">
            <h3>联系我们</h3>
            <p>电话：400-123-4567</p>
            <p>邮箱：info@taoyuan.com</p>
            <p>地址：新桃源智界示范区</p>
          </div>
          <div class="footer-section">
            <h3>关注我们</h3>
            <div class="social-links">
              <el-button circle><el-icon><Message /></el-icon></el-button>
              <el-button circle><el-icon><VideoCamera /></el-icon></el-button>
              <el-button circle><el-icon><Share /></el-icon></el-button>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2024 {{ systemName.configValue }}. 保留所有权利.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import { getConfigByKey } from '@/api/system-config'
import { 
  House, 
  MapLocation, 
  ShoppingBag, 
  ChatRound, 
  ChatDotRound,
  ShoppingCart, 
  User, 
  ArrowDown,
  Message,
  VideoCamera,
  Share
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()

// 系统名称
const systemName = ref('乡村振兴·新桃源智界')

// 用户信息
const userInfo = computed(() => userStore.userInfo)

// 购物车数量
const cartCount = computed(() => cartStore.cartCount)

// 获取系统配置
const getSystemConfig = async () => {
  try {
    const res = await getConfigByKey('system_name')
    if (res.code === 200 && res.data) {
      systemName.value = res.data
    }
  } catch (error) {
    console.error('获取系统配置失败:', error)
  }
}

// 用户操作处理
const handleUserCommand = async (command) => {
  switch (command) {
    case 'profile':
      router.push('/user/profile')
      break
    case 'orders':
      router.push('/user/orders')
      break
    case 'addresses':
      router.push('/user/addresses')
      break
    case 'logout':
      try {
        await ElMessageBox.confirm('确认退出登录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await userStore.logoutAction()
        ElMessage.success('已退出登录')
        router.push('/home')
      } catch (error) {
        // 用户取消操作
      }
      break
  }
}

// 跳转到购物车
const goToCart = () => {
  if (!userInfo.value) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  router.push('/cart')
}

// 跳转到登录
const goToLogin = () => {
  router.push('/login')
}

// 跳转到注册
const goToRegister = () => {
  router.push('/register')
}

// 初始化
onMounted(() => {
  getSystemConfig()
  // 如果用户已登录，获取购物车数量
  if (userInfo.value) {
    cartStore.getCartCount()
  }
})

// 监听用户登录状态变化，更新购物车数量
watch(() => userInfo.value, (newVal) => {
  if (newVal) {
    cartStore.getCartCount()
  }
})
</script>

<style scoped>
.user-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 头部样式 */
.header {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 1000;
  border-bottom: 1px solid rgba(34, 197, 94, 0.1);
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
}

.logo-section {
  margin-left: -80px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  width: 90px;
  height: 65px;
  border-radius: 50%;
}

.site-title {
  color: #065f46;
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  background: linear-gradient(45deg, #065f46, #059669);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 导航菜单 */
.nav-menu {
  display: flex;
  gap: 30px;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #374151;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-size: 14px;
}

.nav-item:hover,
.nav-item.active {
  color: #059669;
  background: rgba(5, 150, 105, 0.1);
  transform: translateY(-2px);
}

/* 用户操作区域 */
.user-actions {
  display: flex;
  margin-left: 60px;
  align-items: center;
  gap: 20px;
}

.cart-icon {
  color: #374151;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.cart-icon:hover {
  background: rgba(5, 150, 105, 0.1);
  color: #059669;
}

.user-info {
  color: #374151;
}

.user-avatar {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.user-avatar:hover {
  background: rgba(5, 150, 105, 0.1);
}

.username {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.arrow-down {
  font-size: 12px;
}

.auth-buttons {
  display: flex;
  gap: 8px;
}

/* 主要内容区域 */
.main-content {
  flex: 1;
  background: #f8fafc;
}

/* 底部样式 */
.footer {
  background: #2c3e50;
  color: white;
  margin-top: auto;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px 20px;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
  margin-bottom: 30px;
}

.footer-section h3 {
  color: #10b981;
  margin-bottom: 15px;
  font-size: 18px;
  font-weight: 600;
}

.footer-section p,
.footer-section ul {
  color: #bdc3c7;
  line-height: 1.6;
}

.footer-section ul {
  list-style: none;
  padding: 0;
}

.footer-section ul li {
  margin-bottom: 8px;
}

.footer-section ul li a {
  color: #bdc3c7;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-section ul li a:hover {
  color: #10b981;
}

.social-links {
  display: flex;
  gap: 10px;
}

.footer-bottom {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #34495e;
  color: #95a5a6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-container {
    flex-wrap: wrap;
    height: auto;
    padding: 15px;
  }
  
  .nav-menu {
    order: 3;
    width: 100%;
    justify-content: space-around;
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .nav-item {
    font-size: 12px;
  }
  
  .site-title {
    font-size: 20px;
  }
  
  .footer-content {
    grid-template-columns: 1fr;
    gap: 30px;
  }
}
</style>

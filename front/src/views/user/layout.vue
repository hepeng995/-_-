<template>
  <div class="app-layout">
    <a href="#main-content" class="skip-link">跳到主要内容</a>
    <!-- 侧边栏 (桌面/平板) -->
    <Sidebar
      v-if="showSidebar"
      :collapsed="collapsed"
      :show-sidebar="showSidebar"
      :system-name="systemName"
      :cart-count="cartCount"
      @navigate="onNavigate"
      @open-ai-chat="openAiChat"
      @toggle-collapse="toggleCollapse"
    />

    <!-- 侧边栏遮罩 (平板覆盖展开时) -->
    <div
      v-if="isTablet && !collapsed"
      class="sidebar-overlay visible"
      @click="toggleCollapse"
    ></div>

    <!-- 移动端抽屉导航 -->
    <el-drawer
      v-model="drawerVisible"
      direction="ltr"
      :size="isMobile ? '72vw' : 280"
      :show-close="false"
      :with-header="false"
      class="mobile-drawer"
    >
      <div class="mobile-drawer__content">
        <div class="mobile-drawer__header">
          <img :src="mobileDrawerLogo" alt="Logo" class="mobile-drawer__logo" />
          <span class="mobile-drawer__title">{{ systemName }}</span>
          <el-icon class="mobile-drawer__close" @click="closeDrawer"><Close /></el-icon>
        </div>

        <nav class="mobile-drawer__nav">
          <div v-for="group in mobileNavGroups" :key="group.label" class="mobile-nav-group">
            <div class="mobile-nav-group__label">{{ group.label }}</div>
            <router-link
              v-for="item in group.items"
              :key="item.path"
              :to="item.path"
              class="mobile-nav-item"
              :class="{ active: isMobileActive(item) }"
              @click="closeDrawer"
            >
              <el-icon><component :is="item.icon" /></el-icon>
              <span>{{ item.label }}</span>
            </router-link>
          </div>
        </nav>

        <div class="mobile-drawer__footer">
          <template v-if="userInfo">
            <router-link to="/user/profile" class="mobile-nav-item" @click="closeDrawer">
              <el-icon><User /></el-icon>
              <span>{{ userInfo.username }}</span>
            </router-link>
            <div class="mobile-nav-item" @click="handleMobileLogout">
              <el-icon><SwitchButton /></el-icon>
              <span>退出登录</span>
            </div>
          </template>
          <template v-else>
            <router-link to="/login" class="mobile-nav-item" @click="closeDrawer">
              <el-icon><User /></el-icon>
              <span>登录 / 注册</span>
            </router-link>
          </template>
        </div>
      </div>
    </el-drawer>

    <!-- 主内容区域 -->
    <div class="app-main" :class="{ 'no-sidebar': !showSidebar, 'ml-collapsed': collapsed && showSidebar }">
      <!-- 移动端顶栏 (仅汉堡菜单+Logo) -->
      <div v-if="isMobile" class="mobile-header">
        <button class="mobile-header__menu-btn" @click="toggleDrawer" aria-label="打开导航菜单">
          <el-icon :size="24"><Operation /></el-icon>
        </button>
        <span class="mobile-header__title">{{ systemName }}</span>
        <div class="mobile-header__actions">
          <el-icon :size="38" class="mobile-header__icon" @click="goToCart" role="button" tabindex="0" aria-label="购物车"><ShoppingCart /></el-icon>
        </div>
      </div>

      <!-- 内容滚动区 (footer在内部，跟随内容滚动) -->
      <div ref="appContentRef" class="app-content" :class="contentClass" id="main-content" tabindex="-1">
        <div class="app-content__page">
          <router-view v-slot="{ Component }">
            <transition name="page" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>

        <!-- Footer (在滚动区内部) -->
        <footer v-if="showFooter" class="app-footer">
        <div class="footer-grid">
          <div class="footer-section">
            <h4 class="footer-section-title">关于我们</h4>
            <p style="color: #bdc3c7; line-height: 1.6;">
              {{ systemName }}<br>致力于展示乡村美景，推广特色产品，助力乡村振兴发展。
            </p>
          </div>
          <div class="footer-section">
            <h4 class="footer-section-title">快速链接</h4>
            <router-link to="/attractions" class="footer-link">景点导览</router-link>
            <router-link to="/products" class="footer-link">特产商城</router-link>
            <router-link to="/news" class="footer-link">动态资讯</router-link>
            <router-link to="/routes" class="footer-link">旅游路线</router-link>
            <router-link to="/activities" class="footer-link">景点活动</router-link>
          </div>
          <div class="footer-section footer-section--contact">
            <h4 class="footer-section-title">联系我们</h4>
            <p style="color: #bdc3c7; line-height: 2;">电话：400-123-4567<br>邮箱：info@zhixing-rural.com<br>地址：智兴乡村平台示范区</p>
          </div>
          <div class="footer-section footer-section--social">
            <h4 class="footer-section-title">关注我们</h4>
            <div style="display: flex; gap: 8px; margin-top: 4px;">
              <el-button circle size="small"><el-icon><Message /></el-icon></el-button>
              <el-button circle size="small"><el-icon><VideoCamera /></el-icon></el-button>
              <el-button circle size="small"><el-icon><Share /></el-icon></el-button>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2026 {{ systemName }}. 保留所有权利.</p>
        </div>
      </footer>
      </div>
    </div>

    <!-- AI聊天助手 -->
    <AiChatAssistant />

    <!-- 搜索弹窗 (可选) -->
    <el-dialog
      v-model="searchVisible"
      :show-close="false"
      width="min(500px, calc(100vw - 24px))"
      top="15vh"
      class="search-dialog mobile-dialog"
      @opened="onSearchOpened"
    >
      <el-input
        ref="searchInputRef"
        v-model="searchQuery"
        placeholder="搜索景点、特产、资讯..."
        size="large"
        :prefix-icon="Search"
        @keyup.enter="doSearch"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, defineAsyncComponent } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import { useLayout } from '@/composables/useLayout'
import { getConfigByKey } from '@/api/system-config'
const AiChatAssistant = defineAsyncComponent(() => import('@/components/AiChatAssistant.vue'))
import Sidebar from '@/components/Sidebar.vue'
import {
  House, MapLocation, ShoppingBag, ShoppingCart, ChatRound, ChatDotRound,
  Guide, Calendar, User, Close, SwitchButton, Operation,
  Message, VideoCamera, Share, Search
} from '@element-plus/icons-vue'
import { useAiChatStore } from '@/stores/ai-chat'
import { ElMessage, ElMessageBox } from 'element-plus'
import { scrollToTop } from '@/utils/scroll'

const router = useRouter()
const mobileDrawerLogo = '/api/file/download/IP3.png'
const route = useRoute()
const userStore = useUserStore()
const cartStore = useCartStore()
const aiChatStore = useAiChatStore()

const {
  collapsed, isMobile, isTablet, drawerVisible,
  showSidebar, toggleCollapse, toggleDrawer, closeDrawer
} = useLayout()

// 系统名称
const systemName = ref('智兴乡村平台')

// 搜索
const searchVisible = ref(false)
const searchQuery = ref('')
const searchInputRef = ref(null)
const appContentRef = ref(null)

const userInfo = computed(() => userStore.userInfo)
const cartCount = computed(() => cartStore.cartCount)

// 移动端导航分组
const mobileNavGroups = [
  {
    label: '探索发现',
    items: [
      { label: '首页', path: '/home', icon: House },
      { label: '景点导览', path: '/attractions', icon: MapLocation },
      { label: '旅游路线', path: '/routes', icon: Guide },
      { label: '景点活动', path: '/activities', icon: Calendar },
    ]
  },
  {
    label: '特色商城',
    items: [
      { label: '特产商城', path: '/products', icon: ShoppingBag },
    ]
  },
  {
    label: '互动社区',
    items: [
      { label: '动态资讯', path: '/news', icon: ChatRound },
      { label: '建言献策', path: '/forum', icon: ChatDotRound },
    ]
  }
]

// 内容区模板class
const contentClass = computed(() => {
  const layout = route.meta?.layout
  return layout ? `app-content--${layout}` : ''
})

// 是否显示Footer
const showFooter = computed(() => route.meta?.showFooter !== false)

function isMobileActive(item) {
  if (item.path === '/home') return route.path === '/home' || route.path === '/home/index'
  return route.path.startsWith(item.path)
}

function onNavigate() {
  if (isTablet.value && !collapsed.value) {
    toggleCollapse()
  }
}

function openAiChat() {
  aiChatStore.openChat()
}

function goToCart() {
  if (!userInfo.value) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  router.push('/cart')
}

function toggleSearch() {
  searchVisible.value = !searchVisible.value
}

function onSearchOpened() {
  nextTick(() => {
    searchInputRef.value?.focus()
  })
}

function doSearch() {
  if (searchQuery.value.trim()) {
    router.push({ path: '/attractions', query: { keyword: searchQuery.value.trim() } })
    searchVisible.value = false
    searchQuery.value = ''
  }
}

function scrollLayoutContentToTop() {
  scrollToTop(appContentRef.value)
}

async function handleMobileLogout() {
  try {
    await ElMessageBox.confirm('确认退出登录吗？', '提示', {
      confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
    })
    await userStore.logoutAction()
    ElMessage.success('已退出登录')
    closeDrawer()
    router.push('/home')
  } catch {}
}

// 获取系统配置
const getSystemConfig = async () => {
  try {
    const res = await getConfigByKey('system_name')
    if (res.code === 200 && res.data) {
      systemName.value = res.data.configValue || res.data
    }
  } catch (error) {
    console.error('获取系统配置失败:', error)
  }
}

onMounted(() => {
  getSystemConfig()
  if (userInfo.value) {
    cartStore.getCartCount()
  }
})

watch(() => userInfo.value, (val) => {
  if (val) cartStore.getCartCount()
})

watch(
  () => route.fullPath,
  async () => {
    await nextTick()
    scrollLayoutContentToTop()
  },
  { immediate: true }
)
</script>

<style scoped>
/* Skip Link (键盘无障碍) */
.skip-link {
  position: absolute;
  top: -100%;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 20px;
  background: var(--color-primary-700);
  color: #fff;
  border-radius: 0 0 var(--radius-md) var(--radius-md);
  font-size: var(--text-sm);
  z-index: 9999;
  text-decoration: none;
  transition: top 0.2s;
}

.skip-link:focus {
  top: 0;
  color: #fff;
}

.app-layout {
  display: flex;
  height: var(--app-height);
  height: var(--app-dvh);
  min-height: var(--app-height);
  min-height: var(--app-dvh);
  overflow: hidden;
}

/* 移动端顶栏 */
.mobile-header {
  position: sticky;
  top: 0;
  z-index: var(--z-toolbar);
  height: calc(var(--mobile-header-height, 48px) + var(--safe-area-top));
  background-color: var(--color-primary-800);
  display: flex;
  align-items: center;
  padding: var(--safe-area-top) var(--space-4) 0;
  gap: var(--space-3);
  flex-shrink: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.mobile-header__menu-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
  -webkit-tap-highlight-color: transparent;
}

.mobile-header__menu-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.mobile-header__menu-btn:active {
  background: rgba(255, 255, 255, 0.18);
  transform: scale(0.93);
}

.mobile-header__title {
  flex: 1;
  min-width: 0;
  color: #fff;
  font-size: var(--text-md);
  font-weight: var(--font-semibold);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mobile-header__actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-shrink: 0;
  overflow: hidden;
}

.mobile-header__icon {
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  padding: 4px;
  border-radius: var(--radius-md);
  transition: color 0.2s, transform 0.15s;
}

.mobile-header__icon:hover {
  color: #fff;
}

.mobile-header__icon:active {
  transform: scale(0.92);
}

/* 主内容区 */
.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 240px;
  min-height: var(--app-height);
  min-height: var(--app-dvh);
  background-color: var(--color-bg-body);
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.app-main.ml-collapsed {
  margin-left: 64px;
}

.app-main.no-sidebar {
  margin-left: 0;
}

/* 内容区 */
.app-content {
  flex: 1;
  overflow-y: auto;
}

.app-content__page {
  padding: var(--content-padding);
  min-height: calc(var(--app-height) - var(--toolbar-height) - 200px);
  min-height: calc(var(--app-dvh) - var(--toolbar-height) - 200px);
}

.app-content--full .app-content__page {
  padding: 0;
}

.app-content--form .app-content__page {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.app-content--form .app-content__page > :deep(*) {
  width: 100%;
  max-width: 960px;
}

/* 遮罩 */
.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: calc(var(--z-sidebar) - 1);
  cursor: pointer;
}

.sidebar-overlay.visible {
  display: block;
}

/* 页面过渡 */
.page-enter-active {
  transition: opacity 0.25s ease-out;
}
.page-leave-active {
  transition: opacity 0.15s ease-in;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
}

/* 移动端抽屉 */
:deep(.mobile-drawer .el-drawer__body) {
  padding: 0;
  background-color: var(--color-bg-sidebar);
}

.mobile-drawer__content {
  height: 100%;
  padding-bottom: var(--safe-area-bottom);
  display: flex;
  flex-direction: column;
  color: var(--color-text-primary);
}

.mobile-drawer__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border-light);
}

.mobile-drawer__logo {
  width: 36px;
  height: 36px;
  border-radius: 50%;
}

.mobile-drawer__title {
  flex: 1;
  font-size: 16px;
  font-weight: 600;
}

.mobile-drawer__close {
  cursor: pointer;
  font-size: 18px;
  color: var(--color-text-placeholder);
  transition: color 0.2s;
}

.mobile-drawer__close:hover {
  color: var(--color-primary-600);
}

.mobile-drawer__nav {
  flex: 1;
  overflow-y: auto;
  padding: 12px 0;
}

.mobile-nav-group__label {
  padding: 12px 20px 6px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-placeholder);
}

.mobile-nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  color: var(--color-text-tertiary);
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 15px;
}

.mobile-nav-item:hover,
.mobile-nav-item.active {
  color: var(--color-primary-700);
  background: rgba(34, 197, 94, 0.08);
}

.mobile-nav-item:active {
  background: rgba(34, 197, 94, 0.15);
}

.mobile-nav-item.active {
  border-left: 3px solid var(--color-primary-500);
}

.mobile-drawer__footer {
  border-top: 1px solid var(--color-border-light);
  padding: 8px 0;
}

/* 搜索弹窗 */
:deep(.search-dialog .el-dialog__header) {
  display: none;
}

:deep(.search-dialog .el-dialog__body) {
  padding: 0;
}

/* 响应式 */
@media screen and (max-width: 1023px) {
  .app-main {
    margin-left: 64px;
  }

  .app-main.ml-collapsed {
    margin-left: 64px;
  }
}

@media screen and (max-width: 767px) {
  .app-main,
  .app-main.ml-collapsed {
    margin-left: 0;
  }

  .app-content {
    padding: 0;
  }
}
</style>

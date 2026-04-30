<template>
  <aside v-if="showSidebar" class="sidebar" :class="{ collapsed }" role="navigation" aria-label="主导航">
    <!-- Logo区 -->
    <div class="sidebar-logo" @click="$router.push('/home')">
      <img src="@/assets/image/IP3.webp" alt="Logo" class="sidebar-logo__img" />
      <transition name="fade">
        <span v-if="!collapsed" class="sidebar-logo__text">{{ systemName }}</span>
      </transition>
    </div>

    <!-- 导航分组 -->
    <nav class="sidebar-nav">
      <div v-for="group in navGroups" :key="group.label" class="nav-group">
        <div v-if="!collapsed" class="nav-group__label">{{ group.label }}</div>
        <div v-else class="nav-group__divider"></div>
        <el-tooltip
          v-for="item in group.items"
          :key="item.path"
          :content="item.label"
          placement="right"
          :disabled="!collapsed"
        >
          <router-link
            :to="item.path"
            class="nav-item"
            :class="{ active: isActive(item) }"
            @click="$emit('navigate')"
            :aria-current="isActive(item) ? 'page' : undefined"
          >
            <div class="nav-item__indicator"></div>
            <el-icon class="nav-item__icon"><component :is="item.icon" /></el-icon>
            <transition name="fade">
              <span v-if="!collapsed" class="nav-item__text">{{ item.label }}</span>
            </transition>
          </router-link>
        </el-tooltip>
      </div>
    </nav>

    <!-- 快捷操作 -->
    <div class="sidebar-actions">
      <div class="nav-group__divider" v-if="collapsed"></div>
      <el-tooltip content="AI助手" placement="right" :disabled="!collapsed">
        <div class="nav-item" @click="$emit('openAiChat')">
          <el-icon class="nav-item__icon"><ChatLineSquare /></el-icon>
          <transition name="fade">
            <span v-if="!collapsed" class="nav-item__text">AI 助手</span>
          </transition>
        </div>
      </el-tooltip>
      <el-tooltip content="购物车" placement="right" :disabled="!collapsed">
        <router-link to="/cart" class="nav-item" @click="$emit('navigate')">
          <el-badge :value="cartCount" :hidden="cartCount === 0" :offset="[6, -2]">
            <el-icon class="nav-item__icon"><ShoppingCart /></el-icon>
          </el-badge>
          <transition name="fade">
            <span v-if="!collapsed" class="nav-item__text">购物车</span>
          </transition>
        </router-link>
      </el-tooltip>
    </div>

    <!-- 用户区域 -->
    <div class="sidebar-user">
      <template v-if="userInfo">
        <el-dropdown trigger="click" @command="handleUserCommand" placement="right-end">
          <div class="sidebar-user__avatar">
            <el-avatar :src="userInfo.avatar" :size="collapsed ? 28 : 32">
              <el-icon><User /></el-icon>
            </el-avatar>
            <transition name="fade">
              <span v-if="!collapsed" class="sidebar-user__name">{{ userInfo.username }}</span>
            </transition>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人中心</el-dropdown-item>
              <el-dropdown-item command="orders">我的订单</el-dropdown-item>
              <el-dropdown-item command="addresses">我的地址</el-dropdown-item>
              <el-dropdown-item command="password">修改密码</el-dropdown-item>
              <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
      <template v-else>
        <el-tooltip content="登录/注册" placement="right" :disabled="!collapsed">
          <div class="sidebar-user__auth" v-if="collapsed" @click="$router.push('/login')">
            <el-icon :size="20"><User /></el-icon>
          </div>
          <div class="sidebar-user__buttons" v-else>
            <el-button size="small" @click="$router.push('/login')">登录</el-button>
            <el-button size="small" type="primary" @click="$router.push('/register')">注册</el-button>
          </div>
        </el-tooltip>
      </template>
    </div>

    <!-- 折叠按钮 -->
    <div class="sidebar-toggle" @click="toggleCollapse" role="button" tabindex="0" :aria-label="collapsed ? '展开菜单' : '收起菜单'">
      <el-icon :size="16">
        <Fold v-if="!collapsed" />
        <Expand v-else />
      </el-icon>
      <transition name="fade">
        <span v-if="!collapsed" class="nav-item__text">收起菜单</span>
      </transition>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import {
  House, MapLocation, ShoppingBag, ChatRound, ChatDotRound,
  Guide, Calendar, ShoppingCart, User, ChatLineSquare,
  Fold, Expand
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

defineProps({
  collapsed: Boolean,
  showSidebar: Boolean,
  systemName: { type: String, default: '智兴乡村平台' },
  cartCount: { type: Number, default: 0 }
})

const emit = defineEmits(['navigate', 'openAiChat', 'toggleCollapse'])
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const userInfo = computed(() => userStore.userInfo)

const navGroups = [
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

function isActive(item) {
  if (item.path === '/home') return route.path === '/home' || route.path === '/home/index'
  return route.path.startsWith(item.path)
}

function toggleCollapse() {
  emit('toggleCollapse')
}

async function handleUserCommand(command) {
  switch (command) {
    case 'profile': router.push('/user/profile'); break
    case 'orders': router.push('/user/orders'); break
    case 'addresses': router.push('/user/addresses'); break
    case 'password': router.push('/user/change-password'); break
    case 'logout':
      try {
        await ElMessageBox.confirm('确认退出登录吗？', '提示', {
          confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
        })
        await userStore.logoutAction()
        ElMessage.success('已退出登录')
        router.push('/home')
      } catch {}
      break
  }
}
</script>

<style scoped lang="scss">
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 240px;
  background: var(--gradient-sidebar);
  z-index: var(--z-sidebar);
  display: flex;
  flex-direction: column;
  transition: width var(--duration-slow) var(--ease-flow);
  overflow: hidden;
  box-shadow: var(--shadow-sidebar);

  // 水墨晕染纹理
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse at 10% 90%, rgba(34, 197, 94, 0.04) 0%, transparent 50%),
      radial-gradient(ellipse at 90% 10%, rgba(34, 197, 94, 0.02) 0%, transparent 40%);
    pointer-events: none;
  }
}

.sidebar.collapsed {
  width: 64px;
}

/* Logo区 */
.sidebar-logo {
  height: 72px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
  cursor: pointer;
  flex-shrink: 0;
  border-bottom: 1px solid rgba(34, 197, 94, 0.1);
  transition: all var(--duration-normal) var(--ease-flow);

  &:hover {
    background: rgba(34, 197, 94, 0.05);
  }
}

.sidebar-logo__img {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  flex-shrink: 0;
  object-fit: cover;
  border: 2px solid var(--color-primary-200);
  transition: border-color var(--duration-normal);

  .sidebar-logo:hover & {
    border-color: var(--color-primary-400);
  }
}

.collapsed .sidebar-logo {
  padding: 0;
  justify-content: center;
}

.collapsed .sidebar-logo__img {
  width: 32px;
  height: 32px;
}

.sidebar-logo__text {
  color: var(--color-primary-800);
  font-size: 15px;
  font-weight: 600;
  font-family: var(--font-display);
  white-space: nowrap;
  overflow: hidden;
  letter-spacing: 0.03em;
}

/* 导航分组 */
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px 0;
  position: relative;
  z-index: 1;
}

.sidebar-nav::-webkit-scrollbar {
  width: 0;
}

.nav-group {
  margin-bottom: 4px;
}

.nav-group__label {
  padding: 16px 20px 6px;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--color-text-placeholder);
  white-space: nowrap;
  overflow: hidden;
}

.nav-group__divider {
  margin: 8px 16px;
  border-top: 1px solid var(--color-border-light);
}

/* 导航项 */
.nav-item {
  display: flex;
  align-items: center;
  height: 42px;
  padding: 0 16px 0 14px;
  color: var(--color-text-tertiary);
  text-decoration: none;
  cursor: pointer;
  position: relative;
  transition: all var(--duration-normal) var(--ease-flow);
  margin: 2px 10px;
  border-radius: 10px;

  &:hover {
    color: var(--color-primary-700);
    background: rgba(34, 197, 94, 0.06);
  }

  &.active {
    color: var(--color-primary-700);
    background: rgba(34, 197, 94, 0.1);
  }

  &.active .nav-item__icon {
    color: var(--color-primary-600);
  }

  &.active .nav-item__indicator {
    opacity: 1;
    transform: translateY(-50%) scaleY(1);
  }
}

.nav-item__indicator {
  position: absolute;
  left: -10px;
  top: 50%;
  transform: translateY(-50%) scaleY(0);
  width: 3px;
  height: 22px;
  border-radius: 0 3px 3px 0;
  background: linear-gradient(180deg, var(--color-primary-500), var(--color-primary-600));
  opacity: 0;
  transition: all var(--duration-normal) var(--ease-flow);
}

.nav-item__icon {
  font-size: 19px;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-placeholder);
  transition: all var(--duration-normal) var(--ease-flow);
}

.nav-item:hover .nav-item__icon {
  color: var(--color-primary-600);
}

.nav-item__text {
  margin-left: 12px;
  font-size: 13.5px;
  white-space: nowrap;
  overflow: hidden;
  letter-spacing: 0.02em;
}

.collapsed .nav-item {
  justify-content: center;
  padding: 0;
  margin: 2px 8px;
}

.collapsed .nav-item:hover {
  padding: 0;
}

.collapsed .sidebar-user__avatar {
  justify-content: center;
  padding: 0;
}

.collapsed .sidebar-user {
  padding: 12px 0;
}

.collapsed .sidebar-user__auth {
  margin: 0 8px;
}

/* 快捷操作 */
.sidebar-actions {
  padding: 4px 0;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

/* 用户区域 */
.sidebar-user {
  padding: 12px 10px;
  border-top: 1px solid var(--color-border-light);
  flex-shrink: 0;
  position: relative;
  z-index: 1;

  :deep(.el-dropdown) {
    width: 100%;
  }
}

.sidebar-user__avatar {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  height: 42px;
  padding: 0 16px 0 14px;
  cursor: pointer;
  border-radius: 10px;
  transition: background var(--duration-normal);

  &:hover {
    background: rgba(34, 197, 94, 0.06);
  }
}

.sidebar-user__name {
  color: var(--color-text-secondary);
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
}

.sidebar-user__auth {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  cursor: pointer;
  color: var(--color-text-placeholder);
  border-radius: 10px;
  transition: all var(--duration-normal);

  &:hover {
    color: var(--color-primary-600);
    background: rgba(34, 197, 94, 0.06);
  }
}

.sidebar-user__auth:hover {
  color: var(--color-primary-700);
  background: rgba(34, 197, 94, 0.08);
}

.sidebar-user__buttons {
  display: flex;
  gap: 8px;
  padding: 0 8px;
}

/* 折叠按钮 */
.sidebar-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  gap: 8px;
  cursor: pointer;
  color: var(--color-text-placeholder);
  border-top: 1px solid var(--color-border-light);
  transition: all 0.2s;
  flex-shrink: 0;
}

.sidebar-toggle:hover {
  color: var(--color-primary-600);
  background: rgba(34, 197, 94, 0.05);
}

.collapsed .sidebar-toggle {
  padding: 0;
}

/* 过渡动画 */
.fade-enter-active { transition: opacity 0.25s ease; }
.fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

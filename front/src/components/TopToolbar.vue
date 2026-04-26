<template>
  <div class="toolbar">
    <!-- 左侧 -->
    <div class="toolbar__left">
      <!-- 移动端汉堡菜单 -->
      <div v-if="isMobile" class="toolbar__hamburger" @click="$emit('toggleDrawer')">
        <el-icon :size="20"><Operation /></el-icon>
      </div>

      <!-- 面包屑 -->
      <div v-if="breadcrumbs.length > 0 && !isMobile" class="app-breadcrumb">
        <template v-for="(item, index) in breadcrumbs" :key="index">
          <span v-if="index > 0" class="breadcrumb-separator">/</span>
          <span
            class="breadcrumb-item"
            :class="{ current: index === breadcrumbs.length - 1 }"
          >
            <router-link v-if="item.to && index < breadcrumbs.length - 1" :to="item.to">
              {{ item.label }}
            </router-link>
            <template v-else>{{ item.label }}</template>
          </span>
        </template>
      </div>
    </div>

    <!-- 右侧 -->
    <div class="toolbar__right">
      <!-- 搜索(可选) -->
      <el-tooltip content="搜索" placement="bottom">
        <div class="toolbar__action" @click="$emit('toggleSearch')">
          <el-icon :size="18"><Search /></el-icon>
        </div>
      </el-tooltip>

      <!-- AI助手 -->
      <el-tooltip content="AI助手" placement="bottom">
        <div class="toolbar__action" @click="$emit('openAiChat')">
          <el-icon :size="18"><ChatLineSquare /></el-icon>
        </div>
      </el-tooltip>

      <!-- 购物车 -->
      <el-tooltip content="购物车" placement="bottom">
        <div class="toolbar__action" @click="goToCart">
          <el-badge :value="cartCount" :hidden="cartCount === 0" :offset="[4, -4]">
            <el-icon :size="18"><ShoppingCart /></el-icon>
          </el-badge>
        </div>
      </el-tooltip>

      <!-- 用户 -->
      <template v-if="userInfo">
        <el-dropdown trigger="click" @command="handleUserCommand">
          <div class="toolbar__user">
            <el-avatar :src="userInfo.avatar" :size="30">
              <el-icon><User /></el-icon>
            </el-avatar>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">
                <el-icon><User /></el-icon>个人中心
              </el-dropdown-item>
              <el-dropdown-item command="orders">
                <el-icon><Document /></el-icon>我的订单
              </el-dropdown-item>
              <el-dropdown-item command="addresses">
                <el-icon><Location /></el-icon>我的地址
              </el-dropdown-item>
              <el-dropdown-item command="password">
                <el-icon><Lock /></el-icon>修改密码
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <el-icon><SwitchButton /></el-icon>退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
      <template v-else>
        <div class="toolbar__auth" v-if="!isMobile">
          <el-button size="small" @click="$router.push('/login')">登录</el-button>
          <el-button size="small" type="primary" @click="$router.push('/register')">注册</el-button>
        </div>
        <div class="toolbar__action" v-else @click="$router.push('/login')">
          <el-icon :size="18"><User /></el-icon>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
  Search, ShoppingCart, User, ChatLineSquare,
  Operation, Document, Location, Lock, SwitchButton
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

defineProps({
  isMobile: Boolean,
  cartCount: { type: Number, default: 0 }
})

defineEmits(['toggleDrawer', 'toggleSearch', 'openAiChat'])

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const userInfo = computed(() => userStore.userInfo)

const routeNameMap = {
  home: '首页',
  attractions: '景点导览',
  products: '特产商城',
  news: '动态资讯',
  forum: '建言献策',
  routes: '旅游路线',
  activities: '乡村活动',
  cart: '购物车',
  'user/profile': '个人中心',
  'user/orders': '我的订单',
  'user/addresses': '我的地址',
  'user/change-password': '修改密码',
  'order/confirm': '确认订单',
  'user/pay': '支付',
}

const breadcrumbs = computed(() => {
  const crumbs = [{ label: '首页', to: '/home' }]
  const path = route.path

  if (path === '/home' || path === '/home/index') return []

  const segments = path.split('/').filter(Boolean)
  let currentPath = ''

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    currentPath += '/' + seg

    if (i === segments.length - 1 && seg.match(/^\d+$/)) {
      crumbs.push({ label: route.meta?.title || '详情' })
      continue
    }

    const name = routeNameMap[currentPath] || routeNameMap[seg] || seg
    const isLast = i === segments.length - 1
    crumbs.push({
      label: name,
      to: isLast ? undefined : currentPath
    })
  }

  return crumbs.length > 1 ? crumbs : []
})

function goToCart() {
  if (!userInfo.value) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  router.push('/cart')
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

<style scoped>
.toolbar {
  position: sticky;
  top: 0;
  height: var(--toolbar-height);
  background-color: var(--color-bg-surface);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-6);
  z-index: var(--z-toolbar);
  flex-shrink: 0;
}

.toolbar__left {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
}

.toolbar__right {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}

.toolbar__hamburger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: background 0.2s;
  color: var(--color-text-secondary);
}

.toolbar__hamburger:hover {
  background: var(--color-bg-muted);
  color: var(--color-text-primary);
}

.toolbar__action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  cursor: pointer;
  border-radius: var(--radius-md);
  color: var(--color-text-tertiary);
  transition: all 0.2s;
}

.toolbar__action:hover {
  background: var(--color-bg-muted);
  color: var(--color-text-primary);
}

.toolbar__user {
  cursor: pointer;
  padding: 2px;
  border-radius: 50%;
  transition: box-shadow 0.2s;
}

.toolbar__user:hover {
  box-shadow: 0 0 0 2px var(--color-primary-200);
}

.toolbar__auth {
  display: flex;
  gap: var(--space-2);
}

.app-breadcrumb {
  display: flex;
  align-items: center;
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
  overflow: hidden;
}

.breadcrumb-item {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;

  a {
    color: var(--color-text-tertiary);
    transition: color 0.15s;
    &:hover { color: var(--color-primary-600); text-decoration: none; }
  }

  &.current {
    color: var(--color-text-primary);
    font-weight: 500;
  }
}

.breadcrumb-separator {
  margin: 0 var(--space-1);
  color: var(--color-text-placeholder);
}

@media screen and (max-width: 767px) {
  .toolbar {
    padding: 0 var(--space-4);
  }
}
</style>

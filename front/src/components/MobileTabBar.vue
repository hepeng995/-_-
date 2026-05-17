<template>
  <nav v-if="isMobile" class="mobile-tab-bar" role="navigation" aria-label="底部主导航">
    <router-link
      v-for="tab in tabs"
      :key="tab.path"
      :to="tab.path"
      class="mobile-tab"
      :class="{ active: isActive(tab) }"
      :aria-label="tab.label"
    >
      <span class="mobile-tab__icon">
        <el-icon :size="22"><component :is="tab.icon" /></el-icon>
        <span v-if="tab.path === '/cart' && cartCount > 0" class="mobile-tab__badge">
          {{ cartCount > 99 ? '99+' : cartCount }}
        </span>
      </span>
      <span class="mobile-tab__label">{{ tab.label }}</span>
    </router-link>
  </nav>
</template>

<script setup>
import { computed, markRaw } from 'vue'
import { useRoute } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import {
  HomeFilled,
  ShoppingCart,
  Tickets,
  User,
  Sunny
} from '@element-plus/icons-vue'

const props = defineProps({
  isMobile: { type: Boolean, default: false }
})

const route = useRoute()
const cartStore = useCartStore()
const cartCount = computed(() => cartStore?.totalCount ?? 0)

const tabs = [
  { path: '/home', label: '首页', icon: markRaw(HomeFilled) },
  { path: '/products', label: '商品', icon: markRaw(Sunny) },
  { path: '/cart', label: '购物车', icon: markRaw(ShoppingCart) },
  { path: '/orders', label: '订单', icon: markRaw(Tickets) },
  { path: '/person', label: '我的', icon: markRaw(User) }
]

function isActive(tab) {
  const path = route.path
  if (tab.path === '/home') {
    return path === '/' || path === '/home'
  }
  return path === tab.path || path.startsWith(tab.path + '/')
}
</script>

<style scoped lang="scss">
.mobile-tab-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 90;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  background: #ffffff;
  border-top: 1px solid var(--color-border, #e5e7eb);
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.04);
  padding: 4px 0 calc(4px + env(safe-area-inset-bottom, 0px));
  height: calc(56px + env(safe-area-inset-bottom, 0px));
}

.mobile-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  text-decoration: none;
  color: var(--color-text-tertiary, #6b7280);
  font-size: 11px;
  line-height: 1.2;
  transition: color 0.18s ease;
  min-height: 44px;

  &.active {
    color: var(--color-primary-600, #16a34a);
  }

  &:active {
    transform: scale(0.96);
  }
}

.mobile-tab__icon {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.mobile-tab__badge {
  position: absolute;
  top: -6px;
  right: -10px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 8px;
  background: var(--color-error, #ef4444);
  color: #fff;
  font-size: 10px;
  line-height: 16px;
  text-align: center;
  font-weight: 600;
}

.mobile-tab__label {
  font-size: 11px;
  font-weight: 500;
}
</style>

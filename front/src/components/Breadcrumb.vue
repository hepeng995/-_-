<template>
  <div v-if="items.length > 0" class="app-breadcrumb">
    <template v-for="(item, index) in items" :key="index">
      <span v-if="index > 0" class="breadcrumb-separator">
        <el-icon :size="12"><ArrowRight /></el-icon>
      </span>
      <span class="breadcrumb-item" :class="{ current: index === items.length - 1 }">
        <router-link v-if="item.to && index < items.length - 1" :to="item.to">
          {{ item.label }}
        </router-link>
        <template v-else>{{ item.label }}</template>
      </span>
    </template>
  </div>
</template>

<script setup>
import { ArrowRight } from '@element-plus/icons-vue'

defineProps({
  items: { type: Array, default: () => [] }
})
</script>

<style scoped>
.app-breadcrumb {
  display: flex;
  align-items: center;
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
  margin-bottom: var(--space-4);
}

.breadcrumb-item {
  display: inline-flex;
  align-items: center;

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
  display: inline-flex;
  align-items: center;
}
</style>

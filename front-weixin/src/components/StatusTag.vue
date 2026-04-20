<script setup lang="ts">
withDefaults(
  defineProps<{
    text: string
    kind?: 'success' | 'warning' | 'danger' | 'info'
  }>(),
  {
    kind: 'info',
  },
)
</script>

<template>
  <text class="status-tag" :class="kind">{{ text }}</text>
</template>

<style lang="scss" scoped>
.status-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44rpx;
  padding: 0 16rpx;
  border-radius: 999rpx;
  font-size: 20rpx;
  font-weight: 700;
}

.status-tag.info {
  background: rgba(76, 143, 175, 0.12);
  color: $brand-blue;
}

.status-tag.success {
  background: rgba(31, 106, 69, 0.12);
  color: $brand-green;
}

.status-tag.warning {
  background: rgba(214, 139, 42, 0.14);
  color: $brand-gold;
}

.status-tag.danger {
  background: rgba(184, 80, 66, 0.12);
  color: $brand-danger;
}
</style>

<template>
  <div class="category-tabs">
    <button
      v-for="tab in tabs"
      :key="tab.value"
      class="category-tab"
      :class="{ active: modelValue === tab.value }"
      @click="$emit('update:modelValue', tab.value)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  tabs: { type: Array, required: true },
  modelValue: { type: [String, Number], default: '' }
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.category-tabs {
  display: flex;
  gap: var(--space-2);
  padding: var(--space-3) 0;
  overflow-x: auto;
  scrollbar-width: none;
  margin-bottom: var(--space-4);
}

.category-tabs::-webkit-scrollbar {
  display: none;
}

.category-tab {
  padding: 6px 16px;
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  white-space: nowrap;
  cursor: pointer;
  border: none;
  background-color: var(--color-bg-muted);
  color: var(--color-text-secondary);
  transition: all 0.15s ease;
  font-family: var(--font-sans);
}

.category-tab:hover {
  background-color: var(--color-primary-100);
  color: var(--color-primary-700);
}

.category-tab.active {
  background-color: var(--color-primary-600);
  color: var(--color-text-inverse);
}
</style>

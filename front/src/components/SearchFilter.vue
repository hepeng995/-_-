<template>
  <div class="search-filter">
    <el-input
      v-model="keyword"
      :placeholder="placeholder"
      clearable
      class="search-filter__keyword"
      @keyup.enter="$emit('search', keyword)"
    >
      <template #prefix>
        <el-icon><Search /></el-icon>
      </template>
    </el-input>

    <el-select
      v-if="categories.length > 0"
      v-model="selectedCategory"
      :placeholder="categoryPlaceholder"
      clearable
      class="search-filter__select"
      @change="$emit('category-change', selectedCategory)"
    >
      <el-option
        v-for="cat in categories"
        :key="cat.value"
        :label="cat.label"
        :value="cat.value"
      />
    </el-select>

    <el-button type="primary" @click="$emit('search', keyword)">
      <el-icon><Search /></el-icon>
      搜索
    </el-button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'

defineProps({
  placeholder: { type: String, default: '输入关键词搜索...' },
  categories: { type: Array, default: () => [] },
  categoryPlaceholder: { type: String, default: '选择分类' }
})

defineEmits(['search', 'category-change'])

const keyword = ref('')
const selectedCategory = ref(null)
</script>

<style scoped>
.search-filter {
  background-color: var(--color-bg-surface);
  padding: var(--space-4) var(--space-5);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  display: flex;
  gap: var(--space-3);
  align-items: center;
  margin-bottom: var(--space-4);
}

.search-filter__keyword {
  width: min(400px, 100%);
}

.search-filter__select {
  width: 160px;
}

@media screen and (max-width: 767px) {
  .search-filter {
    flex-direction: column;
    padding: var(--space-3) var(--space-4);
  }
  .search-filter .el-input,
  .search-filter .el-select {
    width: 100% !important;
    max-width: none !important;
  }

  .search-filter .el-button {
    width: 100%;
  }
}
</style>

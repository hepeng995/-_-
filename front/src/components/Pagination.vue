<template>
  <div :class="{'hidden': hidden}" class="pagination-container">
    <el-pagination
      :current-page="currentPage"
      :page-size="pageSize"
      :page-sizes="pageSizes"
      :layout="layout"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup>
import { computed, watch, ref } from 'vue'

const props = defineProps({
  total: {
    required: true,
    type: Number
  },
  page: {
    type: Number,
    default: 1
  },
  limit: {
    type: Number,
    default: 20
  },
  pageSizes: {
    type: Array,
    default() {
      return [10, 20, 30, 50, 100]
    }
  },
  layout: {
    type: String,
    default: 'total, sizes, prev, pager, next, jumper'
  },
  background: {
    type: Boolean,
    default: true
  },
  autoScroll: {
    type: Boolean,
    default: true
  },
  hidden: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['pagination', 'update:page', 'update:limit'])
const currentPage = ref(props.page)
const pageSize = ref(props.limit)

watch(() => props.page, val => {
  currentPage.value = val
})

watch(() => props.limit, val => {
  pageSize.value = val
})

function handleSizeChange(val) {
  pageSize.value = val
  emitChange()
}

function handleCurrentChange(val) {
  currentPage.value = val
  emitChange()
}

function emitChange() {
  emit('update:page', currentPage.value)
  emit('update:limit', pageSize.value)
  emit('pagination', { page: currentPage.value, limit: pageSize.value })
}
</script>

<style scoped>
.pagination-container {
  background: #fff;
  padding: 10px;
  text-align: right;
}
.pagination-container.hidden {
  display: none;
}
</style> 
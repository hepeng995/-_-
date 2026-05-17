<template>
  <div class="trace-view-page">
    <!-- 加载状态 -->
    <div v-if="loading" class="trace-view-loading">
      <el-skeleton :rows="8" animated />
    </div>

    <!-- 内容区域 -->
    <div v-else class="trace-view-container">
      <!-- 无数据状态 -->
      <div v-if="!batchNo" class="trace-view-empty">
        <el-empty description="请提供有效的溯源批次号">
          <template #extra>
            <el-button type="primary" @click="$router.back()">返回上一页</el-button>
          </template>
        </el-empty>
      </div>

      <div v-else-if="!traceData" class="trace-view-empty">
        <el-empty description="未找到该批次的溯源信息">
          <template #extra>
            <el-button type="primary" @click="$router.back()">返回上一页</el-button>
          </template>
        </el-empty>
      </div>

      <!-- 溯源信息 -->
      <template v-else>
        <!-- 头部卡片 -->
        <div class="trace-header-card">
          <div class="header-top">
            <div class="header-title-section">
              <div class="header-badge">溯源查询结果</div>
              <h1 class="header-product-name">{{ traceData.batch.productName }}</h1>
              <div class="header-batch-no">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 8H8.01M16 8H16.01M8 16H8.01M16 16H16.01M8 12H8.01M12 12H12.01M16 12H16.01M8 20H16C18.2091 20 20 18.2091 20 16V8C20 5.79086 18.2091 4 16 4H8C5.79086 4 4 5.79086 4 8V16C4 18.2091 5.79086 20 8 20Z" stroke="#059669" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <span>批次号：{{ traceData.batch.batchNo }}</span>
              </div>
            </div>
            <div class="header-qr">
              <img v-if="traceData.qrCodeDataUrl" :src="traceData.qrCodeDataUrl" alt="溯源二维码" class="qr-image"  loading="lazy" decoding="async"/>
              <div v-else class="qr-placeholder">
                <span>二维码生成中</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 溯源时间线组件 -->
        <div class="trace-body">
          <ProductTrace :batch-no="batchNo" />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import traceApi from '@/api/trace'
import ProductTrace from './product-trace.vue'

const route = useRoute()

const loading = ref(false)
const batchNo = ref('')
const traceData = ref(null)

onMounted(async () => {
  batchNo.value = route.params.batchNo || route.query.batchNo || ''

  if (!batchNo.value) return

  loading.value = true
  try {
    const res = await traceApi.getTraceByBatchNo(batchNo.value)
    if (res.code === 200 && res.data) {
      traceData.value = res.data
      document.title = `${res.data.batch.productName} - 溯源查询`
    } else {
      traceData.value = null
    }
  } catch (error) {
    console.error('查询溯源信息失败:', error)
    traceData.value = null
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.trace-view-page {
  min-height: 100vh;
  background: var(--color-bg-body);
  padding: 32px 0;
}

.trace-view-loading {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.trace-view-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 空状态 */
.trace-view-empty {
  display: flex;
  justify-content: center;
  padding: 80px 0;
}

/* 头部卡片 */
.trace-header-card {
  background: var(--color-bg-surface);
  border-radius: var(--radius-xl);
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--color-bg-muted);
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
}

.header-title-section {
  flex: 1;
}

.header-badge {
  display: inline-block;
  padding: 4px 14px;
  background: linear-gradient(135deg, var(--color-primary-600), var(--color-primary-500));
  color: var(--color-text-inverse);
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 16px;
}

.header-product-name {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 12px 0;
  line-height: 1.3;
}

.header-batch-no {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--color-text-tertiary);
}

.header-batch-no span {
  font-family: 'Courier New', Courier, monospace;
  color: var(--color-primary-600);
  font-weight: 500;
}

.header-qr {
  flex-shrink: 0;
}

.qr-image {
  width: 96px;
  height: 96px;
  border-radius: var(--radius-lg);
  border: 1px solid #d1d5db;
  background: white;
  padding: 6px;
}

.qr-placeholder {
  width: 96px;
  height: 96px;
  background: var(--color-bg-body);
  border: 2px dashed #d1d5db;
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: var(--color-text-placeholder);
  font-size: 11px;
}

/* 溯源内容 */
.trace-body {
  background: var(--color-bg-surface);
  border-radius: var(--radius-xl);
  padding: 32px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--color-bg-muted);
}

/* 响应式 */
@media (max-width: 640px) {
  .trace-header-card {
    padding: 20px;
  }

  .header-top {
    flex-direction: column-reverse;
  }

  .header-qr {
    align-self: flex-end;
  }

  .header-product-name {
    font-size: 22px;
  }

  .trace-body {
    padding: 20px;
  }

  .qr-placeholder {
    width: 72px;
    height: 72px;
  }

  .qr-image {
    width: 72px;
    height: 72px;
  }
}

/* MB-3 三档断点 */
@media (max-width: 480px) {
  .container,
  .trace-container,
  .product-trace,
  .trace-view {
    padding: 10px !important;
  }
  .timeline-item :deep(.el-card__body) {
    padding: 12px !important;
  }
}
@media (max-width: 360px) {
  .container,
  .trace-container,
  .product-trace,
  .trace-view {
    padding: 6px !important;
  }
}
</style>

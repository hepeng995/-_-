<template>
  <div class="product-trace">
    <!-- 加载状态 -->
    <div v-if="loading" class="trace-loading">
      <el-skeleton :rows="5" animated />
    </div>

    <!-- 无数据状态 -->
    <div v-else-if="!traceData" class="trace-empty">
      <el-empty description="暂无溯源信息" />
    </div>

    <!-- 溯源内容 -->
    <div v-else class="trace-content">
      <!-- 批次信息头部 -->
      <div class="batch-header">
        <div class="batch-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="batch-info">
          <div class="batch-title">批次信息</div>
          <div class="batch-details">
            <div class="batch-detail-item">
              <span class="detail-label">批次号</span>
              <span class="detail-value batch-no">{{ traceData.batch.batchNo }}</span>
            </div>
            <div class="batch-detail-item">
              <span class="detail-label">生产日期</span>
              <span class="detail-value">{{ formatDate(traceData.batch.productionDate) }}</span>
            </div>
            <div class="batch-detail-item">
              <span class="detail-label">保质期</span>
              <span class="detail-value">{{ traceData.batch.shelfLife }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 溯源时间线 -->
      <div class="trace-timeline">
        <div
          v-for="(record, index) in traceData.records"
          :key="record.id"
          class="timeline-item"
          :class="{ 'quality-stage': record.stage === 'quality' }"
        >
          <!-- 左侧时间线节点 -->
          <div class="timeline-node">
            <div
              class="node-circle"
              :style="{ backgroundColor: getStageConfig(record.stage).color }"
            >
              <span class="node-icon">{{ getStageConfig(record.stage).icon }}</span>
            </div>
            <!-- 连接线 -->
            <div v-if="index < traceData.records.length - 1" class="node-line"></div>
          </div>

          <!-- 右侧内容卡片 -->
          <div
            class="timeline-card"
            :class="{ 'quality-card': record.stage === 'quality' }"
          >
            <!-- 质检标记 -->
            <div v-if="record.stage === 'quality'" class="quality-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#ab47bc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              检测报告
            </div>

            <!-- 卡片头部：环节名称 + 标题 + 日期 -->
            <div class="card-header">
              <div class="card-stage-name" :style="{ color: getStageConfig(record.stage).color }">
                {{ getStageConfig(record.stage).name }}
              </div>
              <div class="card-title">{{ record.title }}</div>
              <div class="card-date">{{ formatDate(record.operationDate) }}</div>
            </div>

            <!-- 描述 -->
            <div class="card-description">{{ record.description }}</div>

            <!-- 图片 -->
            <div v-if="record.images && record.images.length > 0" class="card-images">
              <div
                v-for="(img, imgIdx) in record.images"
                :key="imgIdx"
                class="image-thumb"
                @click="previewImage(record.images, imgIdx)"
              >
                <img :src="img" :alt="`${record.title} - 图片${imgIdx + 1}`"  loading="lazy" decoding="async"/>
              </div>
            </div>

            <!-- 位置与操作者 -->
            <div class="card-meta">
              <div v-if="record.location" class="meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="#64748b" stroke-width="2"/>
                  <path d="M12 22C12 22 20 16 20 10C20 5.58172 16.4183 2 12 2C7.58172 2 4 5.58172 4 10C4 16 12 22 12 22Z" stroke="#64748b" stroke-width="2"/>
                </svg>
                <span>{{ record.location }}</span>
              </div>
              <div v-if="record.operator" class="meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="12" cy="7" r="4" stroke="#64748b" stroke-width="2"/>
                </svg>
                <span>{{ record.operator }}<template v-if="record.operatorType"> ({{ record.operatorType }})</template></span>
              </div>
            </div>

            <!-- 备注列表 -->
            <div v-if="record.notes && record.notes.length > 0" class="card-notes">
              <div v-for="(note, noteIdx) in record.notes" :key="noteIdx" class="note-item">
                <span class="note-bullet"></span>
                <span>{{ note }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部声明 -->
      <div class="trace-footer">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#94a3b8" stroke-width="2"/>
          <path d="M12 16V12M12 8H12.01" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span>溯源数据由平台保障，仅供溯源参考</span>
      </div>
    </div>

    <!-- 图片预览 -->
    <el-image-viewer
      v-if="showViewer"
      :url-list="viewerImages"
      :initial-index="viewerIndex"
      @close="showViewer = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { ElImageViewer } from 'element-plus'
import traceApi from '@/api/trace'

const props = defineProps({
  productId: {
    type: Number,
    default: undefined
  },
  batchNo: {
    type: String,
    default: undefined
  }
})

// 环节配置映射
const stageConfigMap = {
  planting:   { key: 'planting',   name: '种植', icon: '\u{1F331}', color: '#4caf50' },
  growing:    { key: 'growing',    name: '生长', icon: '\u{1F33F}', color: '#66bb6a' },
  harvesting: { key: 'harvesting', name: '采摘', icon: '\u2702\uFE0F',   color: '#ffa726' },
  processing: { key: 'processing', name: '加工', icon: '\u{1F3ED}', color: '#42a5f5' },
  quality:    { key: 'quality',    name: '质检', icon: '\u2705',   color: '#ab47bc' },
  packaging:  { key: 'packaging',  name: '包装', icon: '\u{1F4E6}', color: '#78909c' },
  logistics:  { key: 'logistics',  name: '物流', icon: '\u{1F69A}', color: '#5c6bc0' }
}

const getStageConfig = (stageKey) => {
  return stageConfigMap[stageKey] || { key: stageKey, name: stageKey, icon: '\u{1F4CD}', color: '#94a3b8' }
}

// 数据状态
const loading = ref(false)
const traceData = ref(null)

// 图片预览
const showViewer = ref(false)
const viewerImages = ref([])
const viewerIndex = ref(0)

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 预览图片
const previewImage = (images, index) => {
  viewerImages.value = images
  viewerIndex.value = index
  showViewer.value = true
}

// 加载溯源数据
const loadTraceData = async () => {
  if (!props.productId && !props.batchNo) return

  loading.value = true
  try {
    let res
    if (props.batchNo) {
      res = await traceApi.getTraceByBatchNo(props.batchNo)
    } else {
      res = await traceApi.getTraceByProductId(props.productId)
    }

    if (res.code === 200 && res.data) {
      traceData.value = res.data
    } else {
      traceData.value = null
    }
  } catch (error) {
    console.error('加载溯源数据失败:', error)
    traceData.value = null
  } finally {
    loading.value = false
  }
}

// 监听 props 变化
watch(
  () => [props.productId, props.batchNo],
  () => {
    loadTraceData()
  }
)

onMounted(() => {
  loadTraceData()
})
</script>

<style scoped>
.product-trace {
  width: 100%;
}

/* 加载状态 */
.trace-loading {
  padding: 24px;
}

/* 空状态 */
.trace-empty {
  padding: 40px 0;
}

/* 批次信息头部 */
.batch-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, var(--color-primary-50), var(--color-primary-50));
  border-radius: var(--radius-lg);
  margin-bottom: 32px;
  border: 1px solid var(--color-primary-200);
}

.batch-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  background: var(--color-bg-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(5, 150, 105, 0.15);
}

.batch-info {
  flex: 1;
}

.batch-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 12px;
}

.batch-details {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.batch-detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.detail-value {
  font-size: 14px;
  color: var(--color-text-primary);
  font-weight: 500;
}

.batch-no {
  font-family: 'Courier New', Courier, monospace;
  color: var(--color-primary-600);
  font-weight: 600;
}

/* 溯源时间线 */
.trace-timeline {
  position: relative;
  padding-left: 4px;
}

.timeline-item {
  display: flex;
  gap: 20px;
  position: relative;
  min-height: 80px;
}

/* 左侧时间线节点 */
.timeline-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 40px;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.node-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  z-index: 2;
  position: relative;
}

.node-icon {
  font-size: 18px;
  line-height: 1;
}

.node-line {
  width: 2px;
  flex: 1;
  background: var(--color-border);
  margin-top: 4px;
  min-height: 40px;
}

/* 右侧内容卡片 */
.timeline-card {
  flex: 1;
  background: var(--color-bg-surface);
  border-radius: var(--radius-lg);
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--color-bg-muted);
  position: relative;
  transition: box-shadow 0.3s ease;
}

.timeline-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

/* 质检环节特殊样式 */
.timeline-card.quality-card {
  border-left: 4px solid #ab47bc;
  background: #faf5fc;
  border-color: #ab47bc var(--color-bg-muted) var(--color-bg-muted);
}

.quality-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  background: #f3e5f5;
  color: #ab47bc;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 12px;
}

/* 卡片头部 */
.card-header {
  margin-bottom: 12px;
}

.card-stage-name {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.card-date {
  font-size: 13px;
  color: var(--color-text-placeholder);
}

/* 描述文本 */
.card-description {
  font-size: 14px;
  line-height: 1.7;
  color: var(--color-text-secondary);
  margin-bottom: 12px;
}

/* 图片 */
.card-images {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.image-thumb {
  width: 80px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 1px solid var(--color-border);
}

.image-thumb:hover {
  transform: scale(1.08);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.image-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 位置与操作者 */
.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 8px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-text-tertiary);
}

.meta-item svg {
  flex-shrink: 0;
}

/* 备注列表 */
.card-notes {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed var(--color-border);
}

.note-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: var(--color-text-tertiary);
  margin-bottom: 6px;
  line-height: 1.5;
}

.note-item:last-child {
  margin-bottom: 0;
}

.note-bullet {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--color-text-placeholder);
  flex-shrink: 0;
  margin-top: 7px;
}

/* 底部声明 */
.trace-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px 0 8px;
  margin-top: 16px;
  font-size: 13px;
  color: var(--color-text-placeholder);
}

/* 响应式 */
@media (max-width: 640px) {
  .batch-header {
    flex-direction: column;
    gap: 12px;
  }

  .batch-details {
    flex-direction: column;
    gap: 12px;
  }

  .timeline-item {
    gap: 12px;
  }

  .timeline-card {
    padding: 16px;
  }

  .card-meta {
    flex-direction: column;
    gap: 8px;
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

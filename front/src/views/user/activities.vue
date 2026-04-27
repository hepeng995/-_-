<template>
  <div class="activities-page">
    <!-- 页面头部 Hero -->
    <div class="page-header" :style="{ backgroundImage: `url(${headerBg})` }">
      <div class="header-overlay"></div>
      <div class="container">
        <div class="header-content">
          <div class="header-icon">🎋</div>
          <h1>景点活动</h1>
          <p class="header-subtitle">发现精彩乡村活动，体验最美乡村生活</p>
        </div>
      </div>
      <div class="header-wave">
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none">
          <path d="M0,30 C360,60 720,0 1080,30 C1260,45 1380,20 1440,30 L1440,60 L0,60 Z" fill="var(--color-bg-body)"/>
        </svg>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar-section">
      <div class="container">
        <div class="toolbar">
          <div class="toolbar-right">
            <el-select
              v-model="filterCategory"
              placeholder="活动分类"
              size="large"
              clearable
              style="width: 160px"
            >
              <el-option
                v-for="cat in categoryList"
                :key="cat.key"
                :label="cat.name"
                :value="cat.key"
              />
            </el-select>
            <el-select
              v-model="filterStatus"
              placeholder="活动状态"
              size="large"
              clearable
              style="width: 140px"
            >
              <el-option
                v-for="(item, key) in statusMap"
                :key="key"
                :label="item.label"
                :value="key"
              />
            </el-select>
          </div>
        </div>
      </div>
    </div>

    <!-- 活动列表 -->
    <div class="list-view">
      <div class="container">
        <!-- 分类标签 -->
        <div class="list-tabs">
          <div
            class="list-tab"
            :class="{ active: listCategory === null }"
            @click="listCategory = null"
          >
            全部活动
          </div>
          <div
            v-for="cat in categoryList"
            :key="cat.key"
            class="list-tab"
            :class="{ active: listCategory === cat.key }"
            @click="listCategory = cat.key"
          >
            {{ cat.icon }} {{ cat.name }}
          </div>
        </div>

        <!-- 活动卡片网格 -->
        <div class="activity-grid" v-loading="listLoading">
          <div
            v-for="(act, idx) in filteredListActivities"
            :key="act.id"
            class="activity-card"
            :style="{ animationDelay: `${idx * 0.06}s` }"
            @click="goToDetail(act.id)"
          >
            <div class="card-image">
              <img :src="act.coverImages && act.coverImages.length ? act.coverImages[0] : defaultCover" :alt="act.title" />
              <div class="card-image-overlay"></div>
              <div class="card-badge" :style="{ backgroundColor: getCategoryColor(act.category) }">
                {{ getCategoryName(act.category) }}
              </div>
              <div class="card-status" :style="{ backgroundColor: getStatusColor(act.status) }">
                {{ getStatusLabel(act.status) }}
              </div>
            </div>
            <div class="card-body">
              <h4 class="card-title">{{ act.title }}</h4>
              <div class="card-info">
                <div class="info-row">
                  <el-icon><Clock /></el-icon>
                  <span>{{ act.startTime }} ~ {{ act.endTime }}</span>
                </div>
                <div class="info-row">
                  <el-icon><Location /></el-icon>
                  <span>{{ act.location }}</span>
                </div>
              </div>
              <div class="card-bottom">
                <span class="card-fee" :class="{ free: act.fee === 0 }">
                  {{ act.fee === 0 ? '免费' : act.feeText }}
                </span>
                <div class="card-progress">
                  <el-progress
                    :percentage="act.maxParticipants > 0 ? Math.round((act.currentParticipants / act.maxParticipants) * 100) : 0"
                    :stroke-width="8"
                    :color="getCategoryColor(act.category)"
                    :show-text="false"
                    style="width: 100px"
                  />
                  <span class="progress-label">{{ act.currentParticipants }}/{{ act.maxParticipants }}人</span>
                </div>
              </div>
            </div>
            <div class="card-deco-bar" :style="{ background: `linear-gradient(90deg, ${getCategoryColor(act.category)}, transparent)` }"></div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="!listLoading && filteredListActivities.length === 0" class="empty-state">
          <el-empty description="暂无符合条件的活动">
            <el-button type="primary" @click="listCategory = null">查看全部活动</el-button>
          </el-empty>
        </div>

        <!-- 分页 -->
        <div class="pagination-wrapper" v-if="listTotal > listPageSize">
          <el-pagination
            :current-page="listCurrent"
            :page-size="listPageSize"
            :total="listTotal"
            layout="prev, pager, next"
            @current-change="handleListPageChange"
          />
        </div>
      </div>
    </div>

    <!-- 报名对话框 -->
    <el-dialog
      v-model="registerDialogVisible"
      title="活动报名"
      width="500px"
      :close-on-click-modal="false"
      class="register-dialog"
    >
      <div class="dialog-activity-info" v-if="registeringActivity">
        <h4>{{ registeringActivity.title }}</h4>
        <p>{{ registeringActivity.startTime }} ~ {{ registeringActivity.endTime }}</p>
      </div>
      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        label-width="100px"
        label-position="top"
      >
        <el-form-item label="联系人姓名" prop="contactName">
          <el-input v-model="registerForm.contactName" placeholder="请输入联系人姓名" />
        </el-form-item>
        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="registerForm.contactPhone" placeholder="请输入联系电话" maxlength="11" />
        </el-form-item>
        <el-form-item label="参加人数" prop="participantCount">
          <el-input-number
            v-model="registerForm.participantCount"
            :min="1"
            :max="10"
            controls-position="right"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="registerForm.remark"
            type="textarea"
            :rows="3"
            placeholder="如有特殊需求请在此备注（选填）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="registerDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="registerSubmitting" @click="submitRegister">确认报名</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Clock, Location
} from '@element-plus/icons-vue'
import activityApi from '@/api/activity'
import headerBg from '@/assets/image/景点活动背景.png'

const router = useRouter()

// ==================== 常量配置 ====================
const categoryList = [
  { key: 'festival', name: '节庆活动', icon: '🎏', color: '#e74c3c' },
  { key: 'picking', name: '采摘体验', icon: '🍓', color: '#27ae60' },
  { key: 'workshop', name: '体验课堂', icon: '🎨', color: '#3498db' },
  { key: 'market', name: '乡村市集', icon: '🏪', color: '#f39c12' },
  { key: 'competition', name: '赛事活动', icon: '🏆', color: '#9b59b6' }
]

const statusMap = {
  registering: { label: '报名中', color: '#27ae60' },
  full: { label: '已满员', color: '#f39c12' },
  ongoing: { label: '进行中', color: '#3498db' },
  ended: { label: '已结束', color: '#95a5a6' }
}

const defaultCover = 'https://picsum.photos/seed/default-act/800/500'

// ==================== 工具函数 ====================
const getCategoryColor = (key) => {
  const cat = categoryList.find(c => c.key === key)
  return cat ? cat.color : '#059669'
}

const getCategoryName = (key) => {
  const cat = categoryList.find(c => c.key === key)
  return cat ? cat.name : key
}

const getStatusColor = (key) => {
  return statusMap[key] ? statusMap[key].color : '#95a5a6'
}

const getStatusLabel = (key) => {
  return statusMap[key] ? statusMap[key].label : key
}

// ==================== 筛选 ====================
const filterCategory = ref(null)
const filterStatus = ref(null)

// ==================== 列表视图数据 ====================
const listCategory = ref(null)
const listLoading = ref(false)
const listActivities = ref([])
const listTotal = ref(0)
const listCurrent = ref(1)
const listPageSize = ref(6)

const filteredListActivities = computed(() => {
  let items = [...listActivities.value]
  if (filterStatus.value) {
    items = items.filter(a => a.status === filterStatus.value)
  }
  if (listCategory.value) {
    items = items.filter(a => a.category === listCategory.value)
  }
  return items
})

const loadListData = async () => {
  listLoading.value = true
  try {
    const res = await activityApi.getActivityPage({
      current: listCurrent.value,
      size: listPageSize.value,
      category: listCategory.value,
      status: filterStatus.value
    })
    if (res.code === 200) {
      listActivities.value = res.data.records
      listTotal.value = res.data.total
    }
  } catch (err) {
    console.error('加载活动列表失败:', err)
  } finally {
    listLoading.value = false
  }
}

const handleListPageChange = (page) => {
  listCurrent.value = page
  loadListData()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 监听列表分类切换
watch(listCategory, () => {
  listCurrent.value = 1
  loadListData()
})

// ==================== 报名对话框 ====================
const registerDialogVisible = ref(false)
const registerSubmitting = ref(false)
const registeringActivity = ref(null)
const registerFormRef = ref(null)

const registerForm = reactive({
  contactName: '',
  contactPhone: '',
  participantCount: 1,
  remark: ''
})

const registerRules = {
  contactName: [
    { required: true, message: '请输入联系人姓名', trigger: 'blur' }
  ],
  contactPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  participantCount: [
    { required: true, message: '请选择参加人数', trigger: 'change' }
  ]
}

const openRegisterDialog = (activity) => {
  registeringActivity.value = activity
  registerForm.contactName = ''
  registerForm.contactPhone = ''
  registerForm.participantCount = 1
  registerForm.remark = ''
  registerDialogVisible.value = true
}

const submitRegister = async () => {
  if (!registerFormRef.value) return
  await registerFormRef.value.validate(async (valid) => {
    if (!valid) return
    registerSubmitting.value = true
    try {
      const res = await activityApi.registerActivity({
        activityId: registeringActivity.value.id,
        contactName: registerForm.contactName,
        contactPhone: registerForm.contactPhone,
        participantCount: registerForm.participantCount,
        remark: registerForm.remark
      })
      if (res.code === 200) {
        ElMessage.success('报名成功！')
        registerDialogVisible.value = false
        // 更新本地参与人数
        registeringActivity.value.currentParticipants += registerForm.participantCount
        if (registeringActivity.value.currentParticipants >= registeringActivity.value.maxParticipants) {
          registeringActivity.value.status = 'full'
        }
      } else {
        ElMessage.error(res.message || '报名失败')
      }
    } catch (err) {
      console.error('报名失败:', err)
      ElMessage.error('报名失败，请稍后重试')
    } finally {
      registerSubmitting.value = false
    }
  })
}

// ==================== 跳转详情 ====================
const goToDetail = (id) => {
  router.push(`/activities/${id}`)
}

// ==================== 初始化 ====================
onMounted(() => {
  loadListData()
})
</script>

<style scoped>
/* ============================================================
   乡村活动列表页 - 绿意乡村美化版
   ============================================================ */

.activities-page {
  min-height: 100vh;
  background: var(--color-bg-body);
}

.container {
  margin: 0 auto;
  padding: 0 20px;
  max-width: 1200px;
}

/* ====== 动画关键帧 ====== */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes floatSlow {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-12px); }
}

/* ====== 页面头部 Hero ====== */
.page-header {
  background-size: cover;
  background-position: center;
  padding: 64px 0 0;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.header-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  pointer-events: none;
}

.header-content {
  position: relative;
  z-index: 1;
}

.header-icon {
  font-size: 40px;
  margin-bottom: 12px;
  animation: fadeIn 0.8s var(--ease-out) both;
}

.page-header h1 {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 16px;
  color: #ffffff;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  animation: fadeInUp 0.6s var(--ease-out) both;
}

.header-subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: 0.05em;
  animation: fadeInUp 0.6s var(--ease-out) 0.15s both;
}

.header-wave {
  position: relative;
  z-index: 1;
  margin-top: 40px;
}

.header-wave svg {
  display: block;
  width: 100%;
  height: 40px;
}

/* ====== 工具栏 ====== */
.toolbar-section {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 20px 0;
  border-bottom: 1px solid var(--color-border-light);
  position: sticky;
  top: 0;
  z-index: 100;
}

.toolbar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.toolbar-right {
  display: flex;
  gap: 12px;
}

/* ====== 活动列表 ====== */
.list-view {
  padding: 32px 0 80px;
}

.list-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
  flex-wrap: wrap;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--color-border-light);
}

.list-tab {
  padding: 10px 22px;
  border-radius: 24px;
  background: var(--color-bg-surface);
  color: var(--color-text-tertiary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-default);
  border: 1px solid var(--color-border);
}

.list-tab:hover {
  border-color: var(--color-primary-600);
  color: var(--color-primary-600);
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.1);
}

.list-tab.active {
  background: linear-gradient(135deg, var(--color-primary-700), var(--color-primary-600));
  color: var(--color-text-inverse);
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.25);
}

.activity-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 40px;
}

.activity-card {
  background: var(--color-bg-surface);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  transition: all var(--duration-normal) var(--ease-default);
  cursor: pointer;
  will-change: transform;
  animation: fadeInUp 0.5s var(--ease-out) both;
}

.activity-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-card-hover), 0 0 24px rgba(34, 197, 94, 0.1);
}

.card-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s var(--ease-default);
}

.activity-card:hover .card-image img {
  transform: scale(1.08);
}

.card-image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.45) 0%, transparent 100%);
  pointer-events: none;
}

.card-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  color: var(--color-text-inverse);
  font-size: 12px;
  font-weight: 600;
  padding: 4px 14px;
  border-radius: var(--radius-lg);
  z-index: 1;
}

.card-status {
  position: absolute;
  top: 12px;
  right: 12px;
  color: var(--color-text-inverse);
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: var(--radius-lg);
  z-index: 1;
}

.card-body {
  padding: 20px;
}

.card-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 14px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-text-tertiary);
}

.info-row .el-icon {
  color: var(--color-text-placeholder);
  flex-shrink: 0;
}

.card-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-fee {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-danger);
}

.card-fee.free {
  color: var(--color-primary-600);
}

.card-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-label {
  font-size: 12px;
  color: var(--color-text-placeholder);
  white-space: nowrap;
}

.card-deco-bar {
  height: 3px;
  width: 100%;
  opacity: 0.7;
  transition: opacity var(--duration-normal) var(--ease-default);
}

.activity-card:hover .card-deco-bar {
  opacity: 1;
}

/* ====== 空状态 & 分页 ====== */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* ====== 报名对话框 ====== */
.dialog-activity-info {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.06), rgba(22, 163, 74, 0.04));
  border-left: 4px solid var(--color-primary-600);
  border-radius: var(--radius-lg);
  padding: 16px 20px;
  margin-bottom: 20px;
}

.dialog-activity-info h4 {
  font-size: 16px;
  color: var(--color-text-primary);
  font-weight: 600;
  margin-bottom: 6px;
}

.dialog-activity-info p {
  font-size: 13px;
  color: var(--color-text-tertiary);
}

/* ====== 响应式 ====== */
@media (max-width: 1024px) {
  .activity-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 968px) {
  .date-activity-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .dac-right {
    width: 100%;
    align-items: flex-start;
    min-width: 0;
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 40px 0 0;
  }

  .page-header h1 {
    font-size: 24px;
  }

  .header-subtitle {
    font-size: 14px;
  }

  .header-icon {
    font-size: 32px;
  }

  .toolbar-section {
    padding: 20px 0;
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .toolbar-right {
    flex-wrap: wrap;
  }

  .toolbar-right :deep(.el-select) {
    flex: 1;
    min-width: 0;
  }

  .activity-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .card-image {
    height: 130px;
  }

  .card-image-overlay {
    display: none;
  }

  .card-body {
    padding: 12px;
  }

  .card-title {
    font-size: 14px;
    -webkit-line-clamp: 2;
  }

  .activity-card:hover {
    transform: none;
  }

  .activity-card:hover .card-image img {
    transform: none;
  }

  .pagination-wrapper :deep(.el-pagination) {
    --el-pagination-button-width: 28px;
    --el-pagination-button-height: 28px;
  }
}

@media (max-width: 480px) {
  .page-header h1 {
    font-size: 13px;
  }

  .card-image {
    height: 110px;
  }

  .card-body {
    padding: 10px;
  }

  .card-title {
    font-size: 13px;
  }

  .list-tabs {
    gap: 8px;
  }

  .list-tab {
    padding: 8px 14px;
    font-size: 13px;
  }
}
</style>

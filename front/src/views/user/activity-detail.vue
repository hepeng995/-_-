<template>
  <div class="activity-detail" v-loading="loading">
    <!-- 加载成功 -->
    <template v-if="activity">
      <!-- 面包屑 -->
      <div class="breadcrumb-section">
        <div class="container">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item :to="{ path: '/activities' }">景点活动</el-breadcrumb-item>
            <el-breadcrumb-item>{{ activity.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
      </div>

      <!-- 封面轮播 -->
      <div class="cover-section" v-if="activity.coverImages && activity.coverImages.length">
        <div class="container">
          <el-carousel
            height="420px"
            :interval="4000"
            arrow="hover"
            indicator-position="outside"
            class="cover-carousel"
          >
            <el-carousel-item v-for="(img, idx) in activity.coverImages" :key="idx">
              <div class="carousel-img-wrapper">
                <img :src="img" :alt="`${activity.title} - 图${idx + 1}`" />
                <div class="carousel-gradient-overlay"></div>
              </div>
            </el-carousel-item>
          </el-carousel>
        </div>
      </div>

      <!-- 主体内容 -->
      <div class="detail-body">
        <div class="container">
          <div class="body-layout">
            <!-- 左侧：信息 + 描述 -->
            <div class="main-column">
              <!-- 信息卡片 -->
              <div class="info-card">
                <div class="info-card-header">
                  <h1 class="act-title">{{ activity.title }}</h1>
                  <span
                    class="category-tag"
                    :style="{ backgroundColor: getCategoryColor(activity.category) }"
                  >
                    {{ getCategoryIcon(activity.category) }} {{ getCategoryName(activity.category) }}
                  </span>
                </div>

                <div class="info-grid">
                  <div class="info-item">
                    <div class="info-icon"><el-icon><Clock /></el-icon></div>
                    <div class="info-text">
                      <span class="info-label">活动时间</span>
                      <span class="info-value">{{ activity.startTime }} ~ {{ activity.endTime }}</span>
                    </div>
                  </div>
                  <div class="info-item">
                    <div class="info-icon"><el-icon><Location /></el-icon></div>
                    <div class="info-text">
                      <span class="info-label">活动地点</span>
                      <span class="info-value">{{ activity.location }}</span>
                    </div>
                  </div>
                  <div class="info-item">
                    <div class="info-icon"><el-icon><User /></el-icon></div>
                    <div class="info-text">
                      <span class="info-label">主办方</span>
                      <span class="info-value">{{ activity.organizer }}</span>
                    </div>
                  </div>
                  <div class="info-item" v-if="activity.contactPhone">
                    <div class="info-icon"><el-icon><Phone /></el-icon></div>
                    <div class="info-text">
                      <span class="info-label">联系电话</span>
                      <span class="info-value">{{ activity.contactPhone }}</span>
                    </div>
                  </div>
                </div>

                <!-- 标签 -->
                <div class="tags-row" v-if="activity.tags && activity.tags.length">
                  <el-tag
                    v-for="tag in activity.tags"
                    :key="tag"
                    size="small"
                    effect="plain"
                    class="act-tag"
                  >
                    {{ tag }}
                  </el-tag>
                </div>
              </div>

              <!-- 活动详情描述 -->
              <div class="desc-card">
                <h3 class="card-section-title">活动详情</h3>
                <div class="desc-content">{{ activity.description }}</div>
              </div>
            </div>

            <!-- 右侧：报名卡片 -->
            <div class="side-column">
              <div class="register-card">
                <div class="register-fee">
                  <span class="fee-label">活动费用</span>
                  <span class="fee-value" :class="{ free: activity.fee === 0 }">
                    {{ activity.fee === 0 ? '免费' : activity.feeText }}
                  </span>
                </div>

                <div class="register-progress">
                  <div class="progress-header">
                    <span>报名进度</span>
                    <span class="progress-percent">
                      {{ activity.maxParticipants > 0
                        ? Math.round((activity.currentParticipants / activity.maxParticipants) * 100)
                        : 0 }}%
                    </span>
                  </div>
                  <el-progress
                    :percentage="activity.maxParticipants > 0
                      ? Math.round((activity.currentParticipants / activity.maxParticipants) * 100)
                      : 0"
                    :stroke-width="14"
                    :color="getCategoryColor(activity.category)"
                    :show-text="false"
                  />
                  <div class="progress-numbers">
                    已报名 <strong>{{ activity.currentParticipants }}</strong> 人 / 共 <strong>{{ activity.maxParticipants }}</strong> 个名额
                  </div>
                </div>

                <div class="register-deadline" v-if="activity.registrationDeadline">
                  <span class="deadline-dot"></span>
                  <el-icon><AlarmClock /></el-icon>
                  <span>报名截止：{{ activity.registrationDeadline }}</span>
                </div>

                <div class="register-status" v-if="activity.status === 'ended'">
                  <el-tag type="info" size="large" effect="dark" style="width: 100%; justify-content: center;">
                    活动已结束
                  </el-tag>
                </div>
                <div class="register-status" v-else-if="activity.status === 'full'">
                  <el-tag type="warning" size="large" effect="dark" style="width: 100%; justify-content: center;">
                    名额已满
                  </el-tag>
                </div>
                <el-button
                  v-else
                  type="primary"
                  size="large"
                  class="register-btn"
                  @click="openRegisterDialog"
                >
                  立即报名
                </el-button>
              </div>
            </div>
          </div>

          <!-- 相关活动推荐 -->
          <div class="related-section" v-if="relatedActivities.length">
            <h3 class="card-section-title">相关推荐</h3>
            <div class="related-grid">
              <div
                v-for="item in relatedActivities"
                :key="item.id"
                class="related-card"
                @click="goToActivity(item.id)"
              >
                <div class="related-image">
                  <img
                    :src="item.coverImages && item.coverImages.length ? item.coverImages[0] : defaultCover"
                    :alt="item.title"
                  />
                  <div class="related-image-overlay"></div>
                  <span class="related-badge" :style="{ backgroundColor: getCategoryColor(item.category) }">
                    {{ getCategoryName(item.category) }}
                  </span>
                </div>
                <div class="related-body">
                  <h4>{{ item.title }}</h4>
                  <div class="related-meta">
                    <span><el-icon><Clock /></el-icon>{{ item.startTime }}</span>
                    <span class="related-fee" :class="{ free: item.fee === 0 }">
                      {{ item.fee === 0 ? '免费' : item.feeText }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 加载失败 -->
    <div v-else-if="!loading" class="error-state">
      <el-result icon="warning" title="活动信息加载失败" sub-title="请检查网络连接或稍后重试">
        <template #extra>
          <el-button type="primary" @click="loadActivity">重新加载</el-button>
          <el-button @click="$router.push('/activities')">返回活动列表</el-button>
        </template>
      </el-result>
    </div>

    <!-- 报名对话框 -->
    <el-dialog
      v-model="registerDialogVisible"
      title="活动报名"
      width="500px"
      :close-on-click-modal="false"
      class="register-dialog mobile-dialog"
    >
      <div class="dialog-activity-info" v-if="activity">
        <h4>{{ activity.title }}</h4>
        <p>{{ activity.startTime }} ~ {{ activity.endTime }}</p>
        <p class="dialog-fee" :class="{ free: activity.fee === 0 }">
          {{ activity.fee === 0 ? '免费参加' : activity.feeText }}
        </p>
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
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Clock, Location, User, Phone, AlarmClock
} from '@element-plus/icons-vue'
import activityApi from '@/api/activity'

const route = useRoute()
const router = useRouter()

// ==================== 常量配置 ====================
const categoryList = [
  { key: 'festival', name: '节庆活动', color: '#e74c3c' },
  { key: 'picking', name: '采摘体验', color: '#27ae60' },
  { key: 'workshop', name: '体验课堂', color: '#3498db' },
  { key: 'market', name: '乡村市集', color: '#f39c12' },
  { key: 'competition', name: '赛事活动', color: '#9b59b6' }
]

const defaultCover = 'https://picsum.photos/seed/default-act/800/500'

const getCategoryColor = (key) => {
  const cat = categoryList.find(c => c.key === key)
  return cat ? cat.color : '#059669'
}

const getCategoryName = (key) => {
  const cat = categoryList.find(c => c.key === key)
  return cat ? cat.name : key
}

const getCategoryIcon = (key) => {
  const icons = { festival: '🎏', picking: '🍓', workshop: '🎨', market: '🏪', competition: '🏆' }
  return icons[key] || '🎋'
}

// ==================== 数据状态 ====================
const loading = ref(false)
const activity = ref(null)
const relatedActivities = ref([])

// ==================== 加载活动详情 ====================
const loadActivity = async () => {
  const id = route.params.id
  if (!id) {
    ElMessage.error('活动ID不存在')
    router.push('/activities')
    return
  }

  loading.value = true
  try {
    const res = await activityApi.getActivityById(id)
    if (res.code === 200) {
      activity.value = res.data
      document.title = `${res.data.title} - 乡村活动`
      loadRelatedActivities(id)
    } else {
      ElMessage.error(res.message || '获取活动详情失败')
    }
  } catch (err) {
    console.error('获取活动详情失败:', err)
    ElMessage.error('获取活动详情失败')
  } finally {
    loading.value = false
  }
}

// ==================== 相关推荐 ====================
const loadRelatedActivities = async (activityId) => {
  try {
    const res = await activityApi.getRelatedActivities(activityId, 3)
    if (res.code === 200) {
      relatedActivities.value = res.data
    }
  } catch (err) {
    console.error('获取相关活动失败:', err)
  }
}

// ==================== 跳转其他活动 ====================
const goToActivity = (id) => {
  router.push(`/activities/${id}`)
}

// ==================== 报名对话框 ====================
const registerDialogVisible = ref(false)
const registerSubmitting = ref(false)
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

const openRegisterDialog = () => {
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
        activityId: activity.value.id,
        contactName: registerForm.contactName,
        contactPhone: registerForm.contactPhone,
        participantCount: registerForm.participantCount,
        remark: registerForm.remark
      })
      if (res.code === 200) {
        ElMessage.success('报名成功！')
        registerDialogVisible.value = false
        // 更新本地参与人数
        activity.value.currentParticipants += registerForm.participantCount
        if (activity.value.maxParticipants > 0 &&
            activity.value.currentParticipants >= activity.value.maxParticipants) {
          activity.value.status = 'full'
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

// ==================== 初始化 ====================
onMounted(() => {
  loadActivity()
})

watch(
  () => route.params.id,
  (newId, oldId) => {
    if (newId && newId !== oldId) {
      activity.value = null
      relatedActivities.value = []
      registerDialogVisible.value = false
      loadActivity()
    }
  }
)
</script>

<style scoped>
/* ============================================================
   活动详情页 - 绿意乡村美化版
   ============================================================ */

.activity-detail {
  min-height: 100vh;
  background: var(--color-bg-body);
}

.container {
  margin: 0 auto;
  padding: 0 20px;
  max-width: 1200px;
}

/* ====== 动画 ====== */
@keyframes breathe {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%      { opacity: 0.4; transform: scale(0.8); }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ====== 面包屑 ====== */
.breadcrumb-section {
  background: var(--color-bg-surface);
  padding: 20px 0;
  border-bottom: 1px solid var(--color-border-light);
}

/* ====== 封面轮播 ====== */
.cover-section {
  padding: 32px 0 0;
}

.cover-carousel {
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow:
    var(--shadow-card),
    0 0 0 1px rgba(20, 83, 45, 0.04),
    inset 0 0 0 1px rgba(255, 255, 255, 0.1);
}

.cover-section :deep(.el-carousel__indicators--outside) {
  margin-top: 16px;
}

.cover-section :deep(.el-carousel__indicator .el-carousel__button) {
  width: 24px;
  height: 6px;
  border-radius: 3px;
  background: var(--color-ink-300);
  opacity: 0.5;
  transition: all var(--duration-normal) var(--ease-default);
}

.cover-section :deep(.el-carousel__indicator.is-active .el-carousel__button) {
  width: 36px;
  background: linear-gradient(135deg, var(--color-primary-700), var(--color-primary-600));
  opacity: 1;
}

.carousel-img-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.carousel-img-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel-gradient-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.35) 0%, transparent 100%);
  pointer-events: none;
}

/* ====== 主体布局 ====== */
.detail-body {
  padding: 32px 0 80px;
}

.body-layout {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 32px;
}

.main-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.side-column {
  position: relative;
}

/* ====== 信息卡片 ====== */
.info-card {
  background: var(--color-bg-surface);
  border-radius: var(--radius-xl);
  padding: 32px;
  box-shadow: var(--shadow-card);
  border-left: 4px solid transparent;
  transition: border-color var(--duration-normal) var(--ease-default);
  animation: fadeInUp 0.5s var(--ease-out) both;
}

.info-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 28px;
}

.act-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.35;
  flex: 1;
}

.category-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--color-text-inverse);
  font-size: 13px;
  font-weight: 600;
  padding: 5px 14px;
  border-radius: 14px;
  white-space: nowrap;
  flex-shrink: 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 8px;
  border-radius: var(--radius-lg);
  transition: all var(--duration-normal) var(--ease-default);
}

.info-item:hover {
  background: var(--color-primary-50);
  transform: translateY(-2px);
}

.info-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--color-primary-50), var(--color-primary-100));
  color: var(--color-primary-600);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 18px;
}

.info-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  color: var(--color-text-placeholder);
}

.info-value {
  font-size: 14px;
  color: var(--color-text-secondary);
  font-weight: 500;
  line-height: 1.5;
}

.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.act-tag {
  border-radius: var(--radius-lg);
  background: var(--color-primary-50) !important;
  color: var(--color-primary-700) !important;
  border-color: var(--color-primary-200) !important;
}

/* ====== 描述卡片 ====== */
.desc-card {
  background: var(--color-bg-surface);
  border-radius: var(--radius-xl);
  padding: 32px;
  box-shadow: var(--shadow-card);
  animation: fadeInUp 0.5s var(--ease-out) 0.1s both;
}

.card-section-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--color-border-light);
  padding-left: 14px;
  position: relative;
}

.card-section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 2px;
  bottom: 14px;
  width: 4px;
  border-radius: 2px;
  background: linear-gradient(180deg, var(--color-primary-700), var(--color-primary-600));
}

.desc-content {
  font-size: 15px;
  line-height: 1.9;
  color: var(--color-text-secondary);
  white-space: pre-line;
  text-indent: 2em;
}

/* ====== 报名卡片 ====== */
.register-card {
  background: linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-blossom-50) 100%);
  border-radius: var(--radius-xl);
  padding: 28px;
  box-shadow: var(--shadow-card);
  border: 1px solid rgba(34, 197, 94, 0.15);
  position: sticky;
  top: 80px;
  animation: fadeInUp 0.5s var(--ease-out) 0.2s both;
}

.register-fee {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(34, 197, 94, 0.15);
}

.fee-label {
  font-size: 14px;
  color: var(--color-text-tertiary);
  font-weight: 500;
}

.fee-value {
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--color-danger), #f472b6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.fee-value.free {
  background: linear-gradient(135deg, var(--color-primary-600), #22c55e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 24px;
}

.register-progress {
  margin-bottom: 24px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.progress-percent {
  font-weight: 600;
  background: linear-gradient(135deg, var(--color-primary-700), var(--color-primary-600));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.progress-numbers {
  text-align: center;
  font-size: 13px;
  color: var(--color-text-tertiary);
  margin-top: 8px;
}

.progress-numbers strong {
  background: linear-gradient(135deg, var(--color-primary-700), var(--color-primary-600));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.register-deadline {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--color-text-tertiary);
  margin-bottom: 20px;
  padding: 10px 14px;
  background: var(--color-bg-surface);
  border-radius: var(--radius-lg);
}

.deadline-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
  flex-shrink: 0;
  animation: breathe 2s ease-in-out infinite;
}

.register-status {
  margin-top: 8px;
}

.register-btn {
  width: 100%;
  height: 52px;
  font-size: 16px;
  font-weight: 600;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, var(--color-primary-700), var(--color-primary-600));
  border-color: transparent;
  letter-spacing: 0.05em;
  transition: all var(--duration-normal) var(--ease-default);
}

.register-btn:hover {
  transform: scale(1.02);
  box-shadow: 0 6px 20px rgba(34, 197, 94, 0.35);
  background: linear-gradient(135deg, var(--color-primary-800), var(--color-primary-700));
  border-color: transparent;
}

.register-btn:active {
  transform: scale(0.98);
}

/* ====== 相关推荐 ====== */
.related-section {
  margin-top: 48px;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.related-card {
  background: var(--color-bg-surface);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  transition: all var(--duration-normal) var(--ease-default);
  cursor: pointer;
  will-change: transform;
}

.related-card:hover {
  transform: translateY(-6px);
  box-shadow:
    var(--shadow-card-hover),
    0 0 0 2px rgba(34, 197, 94, 0.2),
    0 8px 24px rgba(34, 197, 94, 0.1);
}

.related-image {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.related-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s var(--ease-default);
}

.related-card:hover .related-image img {
  transform: scale(1.08);
}

.related-image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.4) 0%, transparent 100%);
  pointer-events: none;
}

.related-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  color: var(--color-text-inverse);
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 10px;
  z-index: 1;
}

.related-body {
  padding: 16px;
}

.related-body h4 {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.related-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--color-text-placeholder);
}

.related-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.related-fee {
  font-weight: 600;
  color: var(--color-danger);
}

.related-fee.free {
  color: var(--color-primary-600);
}

/* ====== 错误状态 ====== */
.error-state {
  padding: 80px 20px;
  text-align: center;
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
  margin-bottom: 4px;
}

.dialog-fee {
  font-weight: 600;
  color: var(--color-danger);
}

.dialog-fee.free {
  color: var(--color-primary-600);
}

/* ====== 响应式 ====== */
@media (max-width: 968px) {
  .body-layout {
    grid-template-columns: 1fr;
  }

  .side-column {
    order: -1;
  }

  .register-card {
    position: static;
  }

  .related-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 12px;
  }

  .breadcrumb-section {
    padding: 12px 0;
  }

  .cover-section {
    padding: 20px 0 0;
  }

  .cover-carousel {
    height: 200px;
  }

  .cover-section :deep(.el-carousel__container) {
    height: 200px !important;
  }

  .detail-body {
    padding: 20px 0 60px;
  }

  .body-layout {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .main-column {
    gap: 16px;
  }

  .info-card {
    padding: 16px;
  }

  .info-card-header {
    gap: 10px;
    margin-bottom: 20px;
  }

  .act-title {
    font-size: 20px;
    line-height: 1.3;
  }

  .category-tag {
    font-size: 12px;
    padding: 4px 10px;
  }

  .info-grid {
    grid-template-columns: 1fr;
    gap: 12px;
    margin-bottom: 16px;
  }

  .info-item {
    padding: 6px;
  }

  .info-icon {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }

  .info-value {
    font-size: 13px;
  }

  .desc-card {
    padding: 16px;
  }

  .card-section-title {
    font-size: 18px;
    margin-bottom: 14px;
    padding-bottom: 10px;
  }

  .desc-content {
    font-size: 14px;
    line-height: 1.8;
  }

  .register-card {
    padding: 16px;
  }

  .register-fee {
    margin-bottom: 16px;
    padding-bottom: 14px;
  }

  .fee-value {
    font-size: 24px;
  }

  .register-progress {
    margin-bottom: 16px;
  }

  .progress-numbers {
    font-size: 12px;
  }

  .register-btn {
    height: 46px;
    font-size: 15px;
  }

  .related-section {
    margin-top: 32px;
  }

  .related-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .related-image {
    height: 160px;
  }

  .related-body {
    padding: 12px;
  }

  .related-body h4 {
    font-size: 14px;
    margin-bottom: 8px;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 10px;
  }

  .breadcrumb-section {
    padding: 10px 0;
  }

  .cover-section {
    padding: 16px 0 0;
  }

  .cover-carousel {
    height: 180px;
  }

  .cover-section :deep(.el-carousel__container) {
    height: 180px !important;
  }

  .info-card-header {
    flex-direction: column;
  }

  .category-tag {
    align-self: flex-start;
  }

  .act-title {
    font-size: 18px;
  }

  .info-card {
    padding: 12px;
  }

  .desc-card {
    padding: 12px;
  }

  .card-section-title {
    font-size: 16px;
  }

  .desc-content {
    font-size: 13px;
  }

  .register-card {
    padding: 14px;
  }

  .fee-value {
    font-size: 22px;
  }

  .register-btn {
    height: 44px;
    font-size: 14px;
  }

  .related-body {
    padding: 10px;
  }

  .related-body h4 {
    font-size: 13px;
  }

  .related-meta {
    font-size: 11px;
  }
}
</style>

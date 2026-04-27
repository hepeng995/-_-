<template>
  <div class="ai-chat-assistant">
    <!-- 聊天窗口面板 -->
    <transition name="chat-slide">
      <div v-if="chatStore.isOpen" class="chat-window">
        <!-- 窗口头部 -->
        <div class="chat-header">
          <div class="chat-header-left">
            <img :src="ipMascot" alt="AI助手" class="header-avatar" />
            <div class="header-info">
              <h3>智兴乡村AI助手</h3>
              <div class="status-line">
                <span class="status-dot"></span>
                <span class="status-text">在线</span>
              </div>
            </div>
          </div>
          <div class="chat-header-right">
            <el-tooltip content="清空对话" placement="top">
              <button class="header-btn" @click="chatStore.clearMessages">
                <el-icon><Delete /></el-icon>
              </button>
            </el-tooltip>
            <el-tooltip content="关闭" placement="top">
              <button class="header-btn" @click="chatStore.closeChat">
                <el-icon><Close /></el-icon>
              </button>
            </el-tooltip>
          </div>
        </div>

        <!-- 消息列表区域 -->
        <div class="chat-messages" ref="messagesContainer">
          <!-- 欢迎消息（无历史消息时显示） -->
          <div v-if="chatStore.messages.length === 0" class="welcome-message">
            <img :src="ipMascot" alt="AI助手" class="welcome-avatar" />
            <h3>你好，我是智兴乡村，数创未来AI助手</h3>
            <p>我可以帮你推荐景点、特产、资讯，为你规划乡村之旅。</p>
            <div class="quick-questions">
              <div
                v-for="q in quickQuestions"
                :key="q"
                class="quick-question"
                @click="handleQuickQuestion(q)"
              >
                {{ q }}
              </div>
            </div>
          </div>

          <!-- 消息列表 -->
          <div
            v-for="msg in chatStore.messages"
            :key="msg.id"
            :class="['message-wrapper', msg.role === 'user' ? 'message-user' : 'message-ai']"
          >
            <!-- AI头像 -->
            <img v-if="msg.role === 'ai'" :src="ipMascot" class="message-avatar" />

            <div class="message-content">
              <!-- 文本气泡 -->
              <div class="message-bubble">
                <!-- 加载状态 -->
                <div v-if="msg.loading" class="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <template v-else>
                  {{ stripHtml(msg.content) }}
                </template>
              </div>

              <!-- 卡片列表区域（仅AI消息且有卡片时） -->
              <div
                v-if="msg.role === 'ai' && msg.cards && msg.cards.length > 0"
                class="cards-container"
              >
                <!-- 分组标题栏 -->
                <div class="cards-section-label">
                  <span class="section-icon">
                    <el-icon><Goods /></el-icon>
                  </span>
                  <span class="section-title">{{ getModuleTypeLabel(msg.moduleType) }}</span>
                  <span class="section-count">共{{ msg.cards.length }}件</span>
                </div>

                <div
                  v-for="card in msg.cards"
                  :key="card.id"
                  :class="['recommend-card', getModuleAccentClass(msg.moduleType)]"
                  @click="handleCardClick(card, msg.moduleType)"
                >
                  <!-- 卡片图片 -->
                  <div v-if="getCardImage(card)" class="card-image">
                    <img :src="getCardImage(card)" :alt="card.title" />
                  </div>
                  <div v-else class="card-image card-image-placeholder">
                    <el-icon :size="24"><Picture /></el-icon>
                  </div>
                  <!-- 卡片内容 -->
                  <div class="card-body">
                    <div class="card-type-tag" :class="getModuleTypeClass(msg.moduleType)">
                      {{ getModuleTypeLabel(msg.moduleType) }}
                    </div>
                    <div class="card-title-row">
                      <h4 class="card-title">{{ card.title }}</h4>
                      <div class="card-rating" v-if="getParsedExtra(card.extra)?.rating">
                        <el-rate
                          :model-value="getParsedExtra(card.extra).rating"
                          disabled
                          size="small"
                          :colors="['#f59e0b', '#f59e0b', '#f59e0b']"
                        />
                      </div>
                    </div>
                    <p class="card-desc">{{ stripHtml(card.content) }}</p>
                    <!-- 解析后的extra信息行 -->
                    <div class="card-meta-row" v-if="getParsedExtra(card.extra)">
                      <span class="card-price" v-if="getParsedExtra(card.extra).price">
                        ¥{{ getParsedExtra(card.extra).price }}
                      </span>
                      <span class="card-origin" v-if="getParsedExtra(card.extra).origin">
                        <el-icon><MapLocation /></el-icon>
                        {{ getParsedExtra(card.extra).origin }}
                      </span>
                    </div>
                    <!-- extra解析失败时优雅降级 -->
                    <div v-else-if="card.extra" class="card-extra">{{ card.extra }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 用户头像 -->
            <el-avatar v-if="msg.role === 'user'" :size="32" class="message-avatar user-avatar">
              <el-icon><User /></el-icon>
            </el-avatar>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="chat-input-area">
          <div class="chat-input-wrapper">
            <el-input
              v-model="inputMessage"
              placeholder="输入你想了解的内容..."
              :disabled="chatStore.isSending"
              @keyup.enter="handleSend"
              clearable
              class="chat-input"
            />
            <el-button
              :loading="chatStore.isSending"
              :disabled="!inputMessage.trim()"
              @click="handleSend"
              class="send-btn"
            >
              <el-icon v-if="!chatStore.isSending"><Promotion /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 悬浮按钮 -->
    <div class="floating-button" @click="chatStore.toggleChat">
      <el-badge :value="chatStore.unreadCount" :hidden="chatStore.unreadCount === 0" :max="99">
        <div class="button-inner">
          <img :src="ipMascot" alt="AI助手" class="mascot-image" />
          <div class="pulse-ring"></div>
          <div class="pulse-ring delay"></div>
        </div>
      </el-badge>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAiChatStore } from '@/stores/ai-chat'
import { useUserStore } from '@/stores/user'
import { Delete, Close, User, Promotion, Goods, MapLocation, Picture } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import ipMascot from '@/assets/image/ip-mascot.png'

const router = useRouter()
const chatStore = useAiChatStore()
const userStore = useUserStore()

// 输入框绑定值
const inputMessage = ref('')

// 消息列表容器 ref
const messagesContainer = ref(null)

/**
 * 去除文本中的HTML标签和Markdown代码块标记
 */
const stripHtml = (text) => {
  if (!text) return ''
  return text
    .replace(/<[^>]+>/g, '')
    .replace(/```[a-zA-Z]*\s*/g, '')
    .replace(/```/g, '')
    .replace(/\*\*/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

// 快捷问题列表
const quickQuestions = [
  '推荐几个好玩的景点',
  '有什么特色特产推荐？',
  '最近有什么新闻动态？',
  '帮我规划一日游路线'
]

/**
 * 发送消息
 */
const handleSend = async () => {
  const message = inputMessage.value.trim()
  if (!message || chatStore.isSending) return

  // 检查登录状态
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录后再使用AI助手')
    return
  }

  inputMessage.value = ''
  try {
    await chatStore.sendMessage(message)
  } catch (error) {
    ElMessage.error(error.message || '发送失败')
  }

  // 发送后自动滚动到底部
  await nextTick()
  scrollToBottom()
}

/**
 * 快捷问题点击
 */
const handleQuickQuestion = (question) => {
  inputMessage.value = question
  handleSend()
}

/**
 * 自动滚动到底部
 */
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 监听消息列表变化，自动滚动
watch(
  () => chatStore.messages.length,
  () => {
    nextTick(scrollToBottom)
  }
)

// 监听窗口打开，自动滚动
watch(
  () => chatStore.isOpen,
  (val) => {
    if (val) {
      nextTick(scrollToBottom)
    }
  }
)

/**
 * 卡片点击跳转
 */
const handleCardClick = (card, moduleType) => {
  // 优先使用后端返回的 detailUrl
  if (card.detailUrl) {
    router.push(card.detailUrl)
    return
  }

  // 根据 moduleType 构造跳转路径
  const routeMap = {
    PRODUCT: `/products/${card.id}`,
    SCENIC: `/attractions/${card.id}`,
    NEWS: `/news/${card.id}`,
    ADVICE: `/forum/detail/${card.id}`
  }
  const path = routeMap[moduleType]
  if (path && card.id) {
    router.push(path)
  }
}

/**
 * 获取卡片图片
 */
const getCardImage = (card) => {
  if (card.images) {
    if (typeof card.images === 'string') {
      try {
        const imgs = JSON.parse(card.images)
        return Array.isArray(imgs) && imgs.length > 0 ? imgs[0] : ''
      } catch {
        return card.images
      }
    }
    if (Array.isArray(card.images) && card.images.length > 0) {
      return card.images[0]
    }
  }
  return ''
}

/**
 * 获取模块类型标签文本
 */
const getModuleTypeLabel = (type) => {
  const labels = {
    PRODUCT: '特产推荐',
    SCENIC: '景点推荐',
    NEWS: '资讯推荐',
    ADVICE: '建议推荐',
    AUTO: '智能推荐',
    ERROR: '系统提示'
  }
  return labels[type] || '智能推荐'
}

/**
 * 获取模块类型标签样式类名
 */
const getModuleTypeClass = (type) => {
  const classMap = {
    PRODUCT: 'tag-product',
    SCENIC: 'tag-scenic',
    NEWS: 'tag-news',
    ADVICE: 'tag-advice',
    AUTO: 'tag-auto'
  }
  return classMap[type] || 'tag-auto'
}

/**
 * 解析extra字段为结构化数据
 * 输入: "价格：12.00元，产地：乡村振兴示范县，评分：4.2分"
 * 输出: { price: '12.00', origin: '乡村振兴示范县', rating: 4.2 }
 */
const parseExtraField = (extra) => {
  if (!extra) return null
  const result = {}
  const parts = extra.split(/[,，]/)
  parts.forEach(part => {
    const trimmed = part.trim()
    if (trimmed.includes('价格')) {
      const match = trimmed.match(/([\d.]+)/)
      result.price = match ? match[1] : ''
    } else if (trimmed.includes('产地')) {
      result.origin = trimmed.replace(/.*[：:]/, '').trim()
    } else if (trimmed.includes('评分')) {
      const match = trimmed.match(/([\d.]+)/)
      result.rating = match ? parseFloat(match[1]) : 0
    }
  })
  return Object.keys(result).length > 0 ? result : null
}

// extra解析缓存，避免重复解析
const extraCache = new Map()
const getParsedExtra = (extra) => {
  if (extraCache.has(extra)) return extraCache.get(extra)
  const parsed = parseExtraField(extra)
  extraCache.set(extra, parsed)
  return parsed
}

/**
 * 获取模块类型对应的卡片左边框强调色类名
 */
const getModuleAccentClass = (type) => {
  const map = {
    PRODUCT: 'accent-product',
    SCENIC: 'accent-scenic',
    NEWS: 'accent-news',
    ADVICE: 'accent-advice',
    AUTO: 'accent-auto'
  }
  return map[type] || 'accent-auto'
}

</script>

<style scoped>
/* ==================== 整体容器 ==================== */
.ai-chat-assistant {
  position: relative;
  z-index: 9999;
}

/* ==================== 悬浮按钮 ==================== */
.floating-button {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 9999;
  cursor: pointer;
}

.button-inner {
  position: relative;
  width: 68px;
  height: 68px;
}

.mascot-image {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 4px 16px rgba(5, 150, 105, 0.4);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  z-index: 2;
}

.floating-button:hover .mascot-image {
  transform: scale(1.1);
  box-shadow: 0 6px 24px rgba(5, 150, 105, 0.5);
}

/* 脉冲呼吸灯动画 */
.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 68px;
  height: 68px;
  border-radius: 50%;
  border: 2px solid rgba(16, 185, 129, 0.6);
  animation: pulse 2s ease-out infinite;
  z-index: 1;
}

.pulse-ring.delay {
  animation-delay: 0.6s;
}

@keyframes pulse {
  0% {
    width: 68px;
    height: 68px;
    opacity: 0.8;
  }
  100% {
    width: 104px;
    height: 104px;
    opacity: 0;
  }
}

/* ==================== 聊天窗口 ==================== */
.chat-window {
  position: fixed;
  right: 24px;
  bottom: 108px;
  width: 380px;
  height: 520px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 10000;
}

/* 展开/收起动画 */
.chat-slide-enter-active,
.chat-slide-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.chat-slide-enter-from,
.chat-slide-leave-to {
  transform: scale(0.8) translateY(20px);
  opacity: 0;
  transform-origin: right bottom;
}

/* ==================== 窗口头部 ==================== */
.chat-header {
  height: 56px;
  background: linear-gradient(135deg, #059669, #10b981);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  flex-shrink: 0;
}

.chat-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.header-info h3 {
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  line-height: 1.2;
}

.status-line {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #4ade80;
  display: inline-block;
}

.status-text {
  color: rgba(255, 255, 255, 0.85);
  font-size: 11px;
}

.chat-header-right {
  display: flex;
  gap: 4px;
}

.header-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
  font-size: 16px;
}

.header-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* ==================== 消息列表区域 ==================== */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #fafafa;
}

/* 美化滚动条 */
.chat-messages::-webkit-scrollbar {
  width: 4px;
}

.chat-messages::-webkit-scrollbar-track {
  background: transparent;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}

/* ==================== 欢迎消息 ==================== */
.welcome-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 20px;
  text-align: center;
}

.welcome-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.2);
}

.welcome-message h3 {
  color: #1f2937;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px;
}

.welcome-message p {
  color: #6b7280;
  font-size: 13px;
  margin: 0 0 20px;
  line-height: 1.5;
}

.quick-questions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  width: 100%;
}

.quick-question {
  padding: 10px 12px;
  border: 1px solid #d1fae5;
  border-radius: 10px;
  font-size: 12px;
  color: #059669;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  background: #f0fdf4;
}

.quick-question:hover {
  background: #059669;
  color: #fff;
  border-color: #059669;
  transform: translateY(-1px);
}

/* ==================== 消息气泡 ==================== */
.message-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 16px;
}

.message-user {
  justify-content: flex-end;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.user-avatar {
  background: #059669;
  color: #fff;
}

.message-content {
  max-width: 75%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.message-bubble {
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.6;
  word-break: break-word;
}

/* 用户消息气泡 */
.message-user .message-bubble {
  background: #059669;
  color: #fff;
  border-bottom-right-radius: 4px;
}

/* AI消息气泡 */
.message-ai .message-bubble {
  background: #f0fdf4;
  color: #1f2937;
  border-bottom-left-radius: 4px;
}

/* ==================== 打字指示器 ==================== */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 0;
}

.typing-indicator span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #059669;
  animation: typing-bounce 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) {
  animation-delay: 0s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing-bounce {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-6px);
    opacity: 1;
  }
}

/* ==================== 推荐卡片 ==================== */
.cards-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 分组标题栏 */
.cards-section-label {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
  border-radius: 8px;
  border-left: 3px solid #10b981;
}

.section-icon {
  display: flex;
  align-items: center;
  color: #059669;
  font-size: 14px;
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  color: #059669;
}

.section-count {
  font-size: 10px;
  color: #6b7280;
  margin-left: auto;
}

/* 卡片基础样式 */
.recommend-card {
  display: flex;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-left: 3px solid #0284c7;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.recommend-card:hover {
  border-color: #10b981;
  border-left-color: #10b981;
  box-shadow: 0 2px 12px rgba(5, 150, 105, 0.18);
  transform: translateY(-2px);
}

.recommend-card:active {
  transform: translateY(0);
  box-shadow: 0 1px 4px rgba(5, 150, 105, 0.12);
}

/* 模块类型左边框强调色 */
.accent-product {
  border-left-color: #d97706;
}

.accent-scenic {
  border-left-color: #059669;
}

.accent-news {
  border-left-color: #2563eb;
}

.accent-advice {
  border-left-color: #7c3aed;
}

.accent-auto {
  border-left-color: #0284c7;
}

/* 卡片图片区域 */
.card-image {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 8px 0 0 8px;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.recommend-card:hover .card-image img {
  transform: scale(1.08);
}

/* 无图片占位 */
.card-image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0fdf4;
  color: #10b981;
}

/* 卡片内容区域 */
.card-body {
  padding: 8px 10px;
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.card-type-tag {
  display: inline-block;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  margin-bottom: 2px;
  align-self: flex-start;
}

/* 模块类型标签颜色 */
.tag-product {
  background: #fef3c7;
  color: #d97706;
}

.tag-scenic {
  background: #d1fae5;
  color: #059669;
}

.tag-news {
  background: #dbeafe;
  color: #2563eb;
}

.tag-advice {
  background: #ede9fe;
  color: #7c3aed;
}

.tag-auto {
  background: #e0f2fe;
  color: #0284c7;
}

/* 标题行（标题+星级） */
.card-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.card-title {
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.card-rating {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.card-rating :deep(.el-rate) {
  height: 14px;
  --el-rate-icon-size: 10px;
  --el-rate-fill-color: #f59e0b;
}

.card-rating :deep(.el-rate__icon) {
  font-size: 10px;
  margin-right: 0;
}

/* 描述（1行截断） */
.card-desc {
  font-size: 11px;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 解析后的extra信息行 */
.card-meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
}

.card-price {
  font-size: 13px;
  font-weight: 700;
  color: #e74c3c;
}

.card-origin {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 10px;
  color: #6b7280;
}

.card-origin .el-icon {
  font-size: 11px;
  color: #059669;
}

/* extra解析失败时的降级样式 */
.card-extra {
  font-size: 11px;
  color: #059669;
  font-weight: 500;
  margin-top: 2px;
}

/* ==================== 输入区域 ==================== */
.chat-input-area {
  padding: 12px 16px 16px;
  background: linear-gradient(to bottom, #f9fafb, #ffffff);
  border-top: none;
  box-shadow: 0 -1px 4px rgba(0, 0, 0, 0.04);
  flex-shrink: 0;
}

.chat-input-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.chat-input-wrapper .chat-input {
  flex: 1;
}

.chat-input :deep(.el-input__wrapper) {
  border-radius: 24px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.06);
  border: 1.5px solid #e5e7eb;
  transition: all 0.3s ease;
  padding: 4px 12px;
}

.chat-input :deep(.el-input__wrapper:hover) {
  border-color: #a7f3d0;
}

.chat-input :deep(.el-input__wrapper.is-focus) {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15), inset 0 1px 3px rgba(0, 0, 0, 0.06);
}

.chat-input :deep(.el-input__inner) {
  font-size: 14px;
  line-height: 1.5;
}

.chat-input :deep(.el-input__inner::placeholder) {
  color: #9ca3af;
}

.send-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #059669, #10b981);
  border: none;
  color: #fff;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(5, 150, 105, 0.3);
}

.send-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #047857, #059669);
  color: #fff;
  transform: scale(1.08);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.4);
}

.send-btn:disabled {
  background: #e5e7eb;
  color: #9ca3af;
  box-shadow: none;
}

/* ==================== 响应式设计 ==================== */
@media (max-width: 768px) {
  /* 悬浮按钮缩小 */
  .floating-button {
    right: 16px;
    bottom: 20px;
  }

  .button-inner {
    width: 52px;
    height: 52px;
  }

  .mascot-image {
    width: 52px;
    height: 52px;
  }

  .pulse-ring {
    width: 52px;
    height: 52px;
  }

  @keyframes pulse {
    0% {
      width: 52px;
      height: 52px;
      opacity: 0.8;
    }
    100% {
      width: 84px;
      height: 84px;
      opacity: 0;
    }
  }

  /* 聊天窗口全屏 */
  .chat-window {
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100vh;
    border-radius: 0;
  }

  /* 消息气泡最大宽度增加 */
  .message-content {
    max-width: 85%;
  }

  /* 快捷问题横向滚动 */
  .quick-questions {
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }

  .quick-question {
    padding: 8px 10px;
    font-size: 11px;
  }

  /* 卡片图片适配移动端 */
  .card-image {
    width: 68px;
    height: 68px;
  }

  .recommend-card {
    border-radius: 8px;
  }

  .card-title {
    font-size: 12px;
  }

  .card-desc {
    font-size: 10px;
  }

  .chat-input-area {
    padding: 10px 12px;
    padding-bottom: max(12px, env(safe-area-inset-bottom));
  }
}
</style>

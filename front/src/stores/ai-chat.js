import { defineStore } from 'pinia'
import { ref } from 'vue'
import aiChatApi from '@/api/ai-chat'
import { useUserStore } from './user'

const DEFAULT_CARD_LIMIT = 3

/**
 * AI聊天助手状态管理
 * 管理聊天消息、会话、窗口状态、未读计数等
 */
export const useAiChatStore = defineStore('ai-chat', () => {
  // 消息列表
  const messages = ref([])
  // 当前会话ID
  const sessionId = ref('')
  // 聊天窗口是否展开
  const isOpen = ref(false)
  // 是否正在发送消息
  const isSending = ref(false)
  // 未读消息数量（窗口收起时收到AI回复递增）
  const unreadCount = ref(0)

  /**
   * 切换聊天窗口开/关状态
   */
  const toggleChat = () => {
    isOpen.value = !isOpen.value
    if (isOpen.value) {
      unreadCount.value = 0
    }
  }

  /**
   * 打开聊天窗口
   */
  const openChat = () => {
    isOpen.value = true
    unreadCount.value = 0
  }

  /**
   * 关闭聊天窗口
   */
  const closeChat = () => {
    isOpen.value = false
  }

  /**
   * 生成唯一消息ID
   */
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
  }

  /**
   * 发送消息核心逻辑
   * @param {string} text - 用户消息文本
   */
  const sendMessage = async (text) => {
    if (!text.trim() || isSending.value) return

    // 获取用户信息
    const userStore = useUserStore()
    const userId = userStore.userId

    if (!userId) {
      throw new Error('请先登录后再使用AI助手')
    }

    // 1. 添加用户消息
    const userMessage = {
      id: generateId(),
      role: 'user',
      content: text.trim(),
      cards: [],
      moduleType: '',
      timestamp: Date.now(),
      loading: false
    }
    messages.value.push(userMessage)

    // 2. 添加AI占位消息（加载状态）
    const aiPlaceholder = {
      id: generateId(),
      role: 'ai',
      content: '',
      cards: [],
      moduleType: '',
      timestamp: Date.now(),
      loading: true
    }
    messages.value.push(aiPlaceholder)

    // 3. 发送请求
    isSending.value = true
    try {
      const res = await aiChatApi.sendMessage(text.trim(), userId)

      if (res.code === 200 && res.data) {
        const data = res.data
        const realCards = Array.isArray(data.cardList) ? data.cardList.slice(0, DEFAULT_CARD_LIMIT) : []

        // 4. 替换AI占位消息为真实回复
        const index = messages.value.findIndex(m => m.id === aiPlaceholder.id)
        if (index !== -1) {
          messages.value[index] = {
            ...messages.value[index],
            content: data.recommendText || '抱歉，暂无推荐结果。',
            cards: realCards,
            moduleType: data.moduleType || 'AUTO',
            loading: false
          }
        }

        // 5. 更新会话ID
        if (data.sessionId) {
          sessionId.value = data.sessionId
        }

        // 6. 如果窗口处于收起状态，递增未读计数
        if (!isOpen.value) {
          unreadCount.value++
        }
      } else {
        const index = messages.value.findIndex(m => m.id === aiPlaceholder.id)
        if (index !== -1) {
          messages.value[index] = {
            ...messages.value[index],
            content: '抱歉，暂无推荐结果。',
            cards: [],
            moduleType: 'AUTO',
            loading: false
          }
        }
      }
    } catch (error) {
      const index = messages.value.findIndex(m => m.id === aiPlaceholder.id)
      if (index !== -1) {
        messages.value[index] = {
          ...messages.value[index],
          content: '抱歉，AI服务暂时不可用，请稍后再试~',
          cards: [],
          moduleType: 'ERROR',
          loading: false
        }
      }
      console.error('AI聊天请求失败:', error)
    } finally {
      isSending.value = false
    }
  }

  /**
   * 清空聊天消息
   */
  const clearMessages = () => {
    messages.value = []
    sessionId.value = ''
  }

  return {
    messages,
    sessionId,
    isOpen,
    isSending,
    unreadCount,
    toggleChat,
    openChat,
    closeChat,
    sendMessage,
    clearMessages
  }
})

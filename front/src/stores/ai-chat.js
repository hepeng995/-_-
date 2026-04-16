import { defineStore } from 'pinia'
import { ref } from 'vue'
import aiChatApi from '@/api/ai-chat'
import { useUserStore } from './user'

/**
 * 商品推荐模拟数据（后端未返回卡片时的兜底展示）
 * 图片使用项目 files 目录下的实际文件，通过后端 /api/file/download/{name} 接口访问
 */
const MOCK_PRODUCT_CARDS = [
  {
    id: 1,
    title: '桃源蜂蜜',
    content: '采自桃源深山百花，天然纯正，口感醇厚回甘。',
    extra: '价格：68.00元，产地：桃源县，评分：4.8分',
    images: '/api/file/download/76cd5b84-3dad-47ec-b47a-d36ac4d5ba98.jpg',
    detailUrl: '/products/1'
  },
  {
    id: 2,
    title: '手工竹编篮',
    content: '桃源传统竹编工艺，精选高山毛竹，编织精美耐用。',
    extra: '价格：45.00元，产地：桃源县，评分：4.5分',
    images: '/api/file/download/edd57240-e91b-4674-8e2e-4cf520bcd1e4.jpg',
    detailUrl: '/products/2'
  },
  {
    id: 3,
    title: '桃源茶叶',
    content: '高山云雾茶，清香甘甜，富含天然茶多酚。',
    extra: '价格：128.00元，产地：桃源县，评分：4.7分',
    images: '/api/file/download/5cceba6d-eda2-40fb-abdd-8cb3ba6755b7.png',
    detailUrl: '/products/3'
  }
]

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

        // 判断后端是否返回了有效的卡片数据
        const hasCards = data.cardList && data.cardList.length > 0

        // 4. 替换AI占位消息为真实回复
        const index = messages.value.findIndex(m => m.id === aiPlaceholder.id)
        if (index !== -1) {
          messages.value[index] = {
            ...messages.value[index],
            content: data.recommendText || '抱歉，暂无推荐结果。',
            cards: hasCards ? data.cardList : MOCK_PRODUCT_CARDS,
            moduleType: hasCards ? (data.moduleType || 'AUTO') : 'PRODUCT',
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
      }
    } catch (error) {
      // 替换占位消息为模拟数据兜底（后端不可用时仍可展示商品推荐）
      const isProductQuery = /特产|商品|推荐|买|购|美食|农产品/.test(text.trim())
      const index = messages.value.findIndex(m => m.id === aiPlaceholder.id)
      if (index !== -1) {
        if (isProductQuery) {
          // 商品相关查询：展示模拟数据
          messages.value[index] = {
            ...messages.value[index],
            content: '根据您的需求，为您推荐以下桃源县的特色商品：',
            cards: MOCK_PRODUCT_CARDS,
            moduleType: 'PRODUCT',
            loading: false
          }
        } else {
          // 非商品查询：提示服务不可用
          messages.value[index] = {
            ...messages.value[index],
            content: '抱歉，AI服务暂时不可用，请稍后再试~',
            cards: [],
            moduleType: 'ERROR',
            loading: false
          }
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

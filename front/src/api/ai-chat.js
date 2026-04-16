import request from './request'

/**
 * AI智能聊天 API 模块
 * 后端接口: POST /api/ai/chat
 * 请求头: userId (Long类型)
 * 请求体: 纯文本字符串
 * 响应: Result<AiChatResponse> { sessionId, userId, recommendText, moduleType, cardList }
 */
export default {
  /**
   * 发送AI聊天消息
   * @param {string} message - 用户消息文本
   * @param {number|string} userId - 用户ID
   * @returns {Promise} AiChatResponse
   */
  sendMessage(message, userId) {
    return request({
      url: '/ai/chat',
      method: 'post',
      data: JSON.stringify(message),
      headers: { userId: String(userId) },
      timeout: 30000 // AI响应可能较慢，设置30秒超时
    })
  }
}

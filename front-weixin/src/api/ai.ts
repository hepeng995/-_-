import { request } from '@/utils/request'
import type { AiChatResponse } from '@/types/models'

export const aiApi = {
  sendMessage(message: string, userId: number | string) {
    return request<AiChatResponse>({
      url: '/ai/chat',
      method: 'POST',
      data: JSON.stringify(message),
      header: {
        userId: String(userId),
      },
      requiresAuth: true,
      timeout: 30000,
      mockKey: 'ai.chat',
      allowMockFallback: false,
      allowMockAuth: false,
    })
  },
}

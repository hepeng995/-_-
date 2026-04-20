import { appConfig } from '@/config/app'
import type { ApiResponse, MockRequestContext, UploadResult } from '@/types/api'
import { handlers } from './handlers'

const sleep = (time: number) => new Promise((resolve) => setTimeout(resolve, time))

export const resolveMockResponse = async <T>(mockKey: string, context: MockRequestContext) => {
  const handler = handlers[mockKey]
  if (!handler) {
    throw new Error(`未找到 mock 处理器: ${mockKey}`)
  }
  await sleep(appConfig.mockLatency)
  const response = await handler(context)
  return response as ApiResponse<T>
}

export const mockUploadFile = async (filePath: string) => {
  await sleep(Math.max(120, appConfig.mockLatency))
  const name = filePath.split(/[\\/]/).pop() || `mock-${Date.now()}.jpg`
  const result: UploadResult = {
    path: `/api/file/download/${name}`,
  }
  return result
}

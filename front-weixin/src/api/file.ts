import { appConfig, isPlaceholderApi } from '@/config/app'
import { STORAGE_KEYS } from '@/config/storage'
import { mockUploadFile } from '@/mock'
import { normalizeAssetUrl } from '@/utils/assets'

export const fileApi = {
  async uploadImage(filePath: string) {
    if (appConfig.enableMockFallback && isPlaceholderApi()) {
      const result = await mockUploadFile(filePath)
      return result.path
    }

    return new Promise<string>((resolve, reject) => {
      const session = uni.getStorageSync(STORAGE_KEYS.session) as { token?: string } | undefined
      uni.uploadFile({
        url: `${appConfig.apiBaseUrl}/file/upload`,
        filePath,
        name: 'file',
        header: session?.token
          ? {
              Authorization: `Bearer ${session.token}`,
            }
          : {},
        success: (response) => {
          try {
            const payload = JSON.parse(response.data) as {
              code: number
              data: string
              message: string
            }
            if (payload.code !== 200 || !payload.data) {
              reject(new Error(payload.message || '上传失败'))
              return
            }
            resolve(normalizeAssetUrl(payload.data))
          } catch {
            reject(new Error('上传响应解析失败'))
          }
        },
        fail: async (error) => {
          if (appConfig.enableMockFallback) {
            const result = await mockUploadFile(filePath)
            resolve(normalizeAssetUrl(result.path))
            return
          }
          reject(new Error(error.errMsg || '上传失败'))
        },
      })
    })
  },
}

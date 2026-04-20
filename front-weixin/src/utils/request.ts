import { appConfig, isPlaceholderApi } from '@/config/app'
import { STORAGE_KEYS } from '@/config/storage'
import { resolveMockResponse } from '@/mock'
import type { ApiResponse, MockRequestContext, RequestOptions } from '@/types/api'
import { buildPageUrl, captureCurrentRoute, goToLogin } from './nav'

const getStoredToken = () => {
  const session = uni.getStorageSync(STORAGE_KEYS.session) as { token?: string } | undefined
  return session?.token || ''
}

const isMockToken = (token?: string) => Boolean(token && token.startsWith('mock-token-'))

const handleUnauthorized = async (message?: string) => {
  try {
    const { useAuthStore } = await import('@/stores/auth')
    const authStore = useAuthStore()
    authStore.clearSession(false)
  } catch {
    uni.removeStorageSync(STORAGE_KEYS.session)
  }

  if (message) {
    uni.showToast({
      title: message,
      icon: 'none',
      duration: 1800,
    })
  }

  goToLogin(captureCurrentRoute())
}

export const request = <T>(options: RequestOptions) => {
  const {
    url,
    method = 'GET',
    data,
    params,
    header = {},
    requiresAuth = false,
    redirectOnAuthFail = true,
    timeout = 15000,
    mockKey,
    allowMockFallback = false,
    allowMockAuth = false,
    fallbackStatusCodes = [404, 500, 502, 503, 504],
  } = options

  const token = getStoredToken()

  if (requiresAuth && !token) {
    if (redirectOnAuthFail) {
      handleUnauthorized('请先登录')
    }

    return Promise.reject(new Error('请先登录'))
  }

  const finalHeader: Record<string, string> = {
    'content-type': 'application/json',
    ...header,
  }

  if (token) {
    finalHeader.Authorization = `Bearer ${token}`
  }

  const mockContext: MockRequestContext = {
    url,
    method,
    data,
    params,
    header: finalHeader,
    requiresAuth,
    token,
  }

  const canUseMock = Boolean(mockKey && allowMockFallback && appConfig.enableMockFallback)
  const canUseMockAuth = canUseMock && allowMockAuth && appConfig.enableMockAuth

  if (mockKey && isPlaceholderApi() && canUseMock) {
    return resolveMockResponse<T>(mockKey, mockContext)
  }

  if (mockKey && isMockToken(token) && canUseMockAuth) {
    return resolveMockResponse<T>(mockKey, mockContext)
  }

  const requestUrl = `${appConfig.apiBaseUrl}${buildPageUrl(url, params)}`

  return new Promise<ApiResponse<T>>((resolve, reject) => {
    uni.request({
      url: requestUrl,
      method,
      data: data as UniNamespace.RequestOptions['data'],
      header: finalHeader,
      timeout,
      success: async (response) => {
        const payload = response.data as ApiResponse<T>
        const businessCode = Number(payload?.code ?? response.statusCode)

        if (response.statusCode === 401 || businessCode === 401) {
          if (redirectOnAuthFail) {
            await handleUnauthorized(payload?.message || '登录状态已失效')
          }

          reject(new Error(payload?.message || '登录状态已失效'))
          return
        }

        const shouldFallback =
          canUseMock &&
          (fallbackStatusCodes.includes(response.statusCode) || fallbackStatusCodes.includes(businessCode))

        if (shouldFallback) {
          resolve(await resolveMockResponse<T>(mockKey as string, mockContext))
          return
        }

        if (response.statusCode >= 400 || businessCode >= 400) {
          reject(new Error(payload?.message || `请求失败(${response.statusCode})`))
          return
        }

        resolve(payload)
      },
      fail: async (error) => {
        if (canUseMock) {
          resolve(await resolveMockResponse<T>(mockKey as string, mockContext))
          return
        }

        reject(new Error(error.errMsg || '网络请求失败'))
      },
    })
  })
}

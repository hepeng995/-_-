export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export type MockKey = string

export interface ApiResponse<T = unknown> {
  code: number
  data: T
  message: string
}

export interface PageResult<T> {
  records: T[]
  total: number
  current?: number
  size?: number
}

export interface RequestOptions {
  url: string
  method?: HttpMethod
  data?: unknown
  params?: Record<string, unknown>
  header?: Record<string, string>
  requiresAuth?: boolean
  redirectOnAuthFail?: boolean
  timeout?: number
  mockKey?: MockKey
  allowMockFallback?: boolean
  allowMockAuth?: boolean
  fallbackStatusCodes?: number[]
}

export interface MockRequestContext {
  url: string
  method: HttpMethod
  data?: unknown
  params?: Record<string, unknown>
  header: Record<string, string>
  requiresAuth: boolean
  token: string
}

export type MockHandler<T = unknown> = (
  context: MockRequestContext,
) => ApiResponse<T> | Promise<ApiResponse<T>>

export interface UploadResult {
  path: string
}

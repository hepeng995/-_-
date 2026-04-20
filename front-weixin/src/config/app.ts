import type { AppConfig } from '@/types/models'

const trimSlash = (value?: string) => (value || '').trim().replace(/\/+$/, '')
const toBoolean = (value?: string, fallback = false) => {
  if (value === undefined) return fallback
  return value !== 'false'
}
const toNumber = (value?: string, fallback = 200) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const apiBaseUrl = trimSlash(import.meta.env.VITE_API_BASE_URL) || 'https://your-api-domain.com'
const assetBaseUrl = trimSlash(import.meta.env.VITE_ASSET_BASE_URL) || apiBaseUrl

export const appConfig: AppConfig = {
  apiBaseUrl,
  assetBaseUrl,
  enableCart: toBoolean(import.meta.env.VITE_ENABLE_CART, true),
  enableAI: toBoolean(import.meta.env.VITE_ENABLE_AI, true),
  enableMockFallback: toBoolean(import.meta.env.VITE_ENABLE_MOCK_FALLBACK, true),
  enableMockAuth: toBoolean(import.meta.env.VITE_ENABLE_MOCK_AUTH, true),
  enableMockPayment: toBoolean(import.meta.env.VITE_ENABLE_MOCK_PAYMENT, true),
  mockLatency: toNumber(import.meta.env.VITE_MOCK_LATENCY, 180),
  appName: import.meta.env.VITE_APP_NAME || '新桃源智界',
  versionName: import.meta.env.VITE_APP_VERSION || '1.0.0-demo',
}

export const isPlaceholderApi = () => appConfig.apiBaseUrl.includes('your-api-domain.com')

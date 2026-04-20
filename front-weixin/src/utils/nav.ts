import { STORAGE_KEYS } from '@/config/storage'
import type { PostLoginRedirect } from '@/types/models'

const TAB_PAGES = new Set([
  '/pages/home/index',
  '/pages/discover/index',
  '/pages/shop/index',
  '/pages/forum/index',
  '/pages/profile/index',
])

const normalizePath = (path: string) => {
  if (!path) return '/pages/home/index'
  return path.startsWith('/') ? path : `/${path}`
}

export const isTabPage = (path: string) => TAB_PAGES.has(normalizePath(path))

export const buildPageUrl = (path: string, query?: Record<string, unknown>) => {
  const normalized = normalizePath(path)
  if (!query || !Object.keys(query).length) return normalized

  const search = Object.entries(query)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&')

  return search ? `${normalized}?${search}` : normalized
}

export const captureCurrentRoute = (): PostLoginRedirect | null => {
  const pages = getCurrentPages()
  const current = pages[pages.length - 1]

  if (!current) return null

  const route = current.route || ''

  return {
    path: normalizePath(route),
    query: ((current as unknown as { options?: Record<string, string> }).options || {}),
    isTab: isTabPage(route),
  }
}

export const savePostLoginRedirect = (redirect: PostLoginRedirect | null) => {
  if (!redirect) {
    uni.removeStorageSync(STORAGE_KEYS.redirect)
    return
  }

  uni.setStorageSync(STORAGE_KEYS.redirect, redirect)
}

export const consumePostLoginRedirect = () => {
  const value = uni.getStorageSync(STORAGE_KEYS.redirect) as PostLoginRedirect | undefined
  uni.removeStorageSync(STORAGE_KEYS.redirect)
  return value || null
}

export const navigateByRoute = (redirect: PostLoginRedirect, replace = false) => {
  const url = buildPageUrl(redirect.path, redirect.query)

  if (redirect.isTab || isTabPage(redirect.path)) {
    return uni.switchTab({ url: redirect.path })
  }

  if (replace) {
    return uni.redirectTo({ url })
  }

  return uni.navigateTo({ url })
}

export const goToLogin = (redirect = captureCurrentRoute()) => {
  if (redirect?.path !== '/pages/login/index') {
    savePostLoginRedirect(redirect)
  }

  const current = captureCurrentRoute()
  if (current?.path === '/pages/login/index') return

  uni.navigateTo({
    url: '/pages/login/index',
  })
}

export const goAfterLogin = () => {
  const redirect = consumePostLoginRedirect()

  if (redirect) {
    navigateByRoute(redirect, true)
    return
  }

  uni.switchTab({
    url: '/pages/profile/index',
  })
}

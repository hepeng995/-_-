import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { STORAGE_KEYS } from '@/config/storage'
import { userApi } from '@/api/user'
import type { UserSession } from '@/types/models'

const emptySession = (): UserSession => ({
  token: '',
  id: null,
  username: '',
  avatar: '',
  role: '',
  realName: '',
  email: '',
  phoneNumber: '',
})

const readStoredSession = () => {
  const stored = uni.getStorageSync(STORAGE_KEYS.session) as UserSession | undefined
  return stored ? { ...emptySession(), ...stored } : emptySession()
}

export const useAuthStore = defineStore('auth', () => {
  const session = ref<UserSession>(readStoredSession())
  const profileLoading = ref(false)

  const isLoggedIn = computed(() => Boolean(session.value.token))
  const displayName = computed(() => session.value.realName || session.value.username || '桃源访客')

  const persist = (next: UserSession) => {
    session.value = next

    if (next.token) {
      uni.setStorageSync(STORAGE_KEYS.session, next)
    } else {
      uni.removeStorageSync(STORAGE_KEYS.session)
    }
  }

  const restoreSession = () => {
    persist(readStoredSession())
  }

  const setSession = (payload: Partial<UserSession>) => {
    persist({
      ...session.value,
      ...payload,
    })
  }

  const clearSession = (notify = false) => {
    persist(emptySession())

    if (notify) {
      uni.showToast({
        title: '已退出登录',
        icon: 'none',
      })
    }
  }

  const login = async (username: string, password: string) => {
    const response = await userApi.login({ username, password })

    if (response.code !== 200 || !response.data?.token) {
      throw new Error(response.message || '登录失败')
    }

    setSession({
      ...response.data,
      token: response.data.token,
    })

    try {
      const profile = await fetchProfile(false)
      if (!profile) {
        clearSession(false)
        throw new Error('用户信息拉取失败')
      }
    } catch (error) {
      clearSession(false)
      throw new Error(error instanceof Error ? error.message : '用户信息拉取失败')
    }

    return session.value
  }

  const fetchProfile = async (silent = false) => {
    if (!session.value.token) return null

    profileLoading.value = true

    try {
      const response = await userApi.getInfo()
      if (response.code === 200 && response.data) {
        setSession(response.data)
        return session.value
      }

      if (!silent) {
        throw new Error(response.message || '获取用户信息失败')
      }

      return null
    } finally {
      profileLoading.value = false
    }
  }

  return {
    session,
    profileLoading,
    isLoggedIn,
    displayName,
    restoreSession,
    setSession,
    clearSession,
    login,
    fetchProfile,
  }
})

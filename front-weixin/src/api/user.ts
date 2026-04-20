import type { UserSession } from '@/types/models'
import { request } from '@/utils/request'

export const userApi = {
  login(data: { username: string; password: string }) {
    return request<UserSession>({
      url: '/auth/login',
      method: 'POST',
      data,
      mockKey: 'auth.login',
      allowMockFallback: false,
      allowMockAuth: false,
    })
  },
  register(data: {
    username: string
    password: string
    confirmPassword: string
    email: string
    phoneNumber?: string
    realName?: string
  }) {
    return request<number>({
      url: '/auth/register',
      method: 'POST',
      data,
      mockKey: 'auth.register',
      allowMockFallback: true,
      allowMockAuth: true,
    })
  },
  getInfo() {
    return request<Partial<UserSession>>({
      url: '/user/info',
      requiresAuth: true,
      mockKey: 'user.info',
      allowMockFallback: false,
      allowMockAuth: false,
    })
  },
  updateProfile(data: {
    realName?: string
    email?: string
    phoneNumber?: string
  }) {
    return request<void>({
      url: '/user/profile',
      method: 'PUT',
      data,
      requiresAuth: true,
      mockKey: 'user.profile.update',
      allowMockFallback: true,
      allowMockAuth: true,
    })
  },
  changePassword(data: {
    oldPassword: string
    newPassword: string
  }) {
    return request<void>({
      url: '/user/change-password',
      method: 'PUT',
      data,
      requiresAuth: true,
      mockKey: 'user.password.change',
      allowMockFallback: true,
      allowMockAuth: true,
    })
  },
}

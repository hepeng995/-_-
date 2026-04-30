import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const isDev = import.meta.env.DEV

const service = axios.create({
  baseURL: '/api',
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
})

service.interceptors.request.use(
  (config) => {
    if (isDev) console.log('发送请求:', config.method.toUpperCase(), config.url)

    config.headers['Content-Type'] = 'application/json;charset=utf-8'

    const token = sessionStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

service.interceptors.response.use(
  (response) => {
    const res = response.data

    if (res.code === 200) {
      return res
    }

    if (res.code === 401) {
      ElMessage.error(res.message || '暂未登录或token已过期')

      if (response.config.url.includes('/auth/register') ||
          response.config.url.includes('/user/check-username') ||
          response.config.url.includes('/user/check-email')) {
        return Promise.reject(new Error(res.message || '校验失败'))
      }

      const userStore = useUserStore()
      userStore.resetState()
      window.location.href = '/login'
      return Promise.reject(new Error(res.message || '未授权'))
    } else if (res.code === 403) {
      ElMessage.error(res.message || '没有操作权限')
      return Promise.reject(new Error(res.message || '没有操作权限'))
    } else {
      if (isDev) console.error('API返回错误:', res.code, res.message)
      ElMessage.error(res.message || '操作失败')
      return Promise.reject(new Error(res.message || '操作失败'))
    }
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 401:
          ElMessage.error(data.message || '暂未登录或token已过期')

          if (error.config && (error.config.url.includes('/auth/register') ||
                               error.config.url.includes('/user/check-username') ||
                               error.config.url.includes('/user/check-email'))) {
            break
          }

          { const userStore = useUserStore(); userStore.resetState() }
          window.location.href = '/login'
          break
        case 403:
          ElMessage.error(data.message || '没有操作权限')
          break
        case 404:
          ElMessage.error('请求资源不存在')
          break
        case 500:
          ElMessage.error(data?.message || '服务器内部错误')
          break
        default:
          ElMessage.error(`请求失败: ${status} - ${data?.message || '未知错误'}`)
      }
    } else if (error.request) {
      ElMessage.error('服务器未响应，请检查网络或后端服务是否启动')
    } else {
      ElMessage.error(`请求配置错误: ${error.message}`)
    }

    return Promise.reject(error)
  }
)

export default service

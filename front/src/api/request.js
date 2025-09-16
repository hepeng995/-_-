import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

// 创建axios实例
const service = axios.create({
  // 应用基础URL配置
  baseURL: '/api',  // 添加API前缀，用于代理转发
  timeout: 15000,
  withCredentials: true, // 允许跨域携带cookie
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 添加调试日志
    console.log('发送请求:', config.method.toUpperCase(), config.url, config.data || {})
    
    // 确保请求头设置正确
    config.headers['Content-Type'] = 'application/json;charset=utf-8'
    
    // 从sessionStorage中获取token
    const token = sessionStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    // 添加调试日志
    console.log('收到响应:', response.status, response.config.url, response.data)
    
    const res = response.data
    
    // 返回成功响应
    if (res.code === 200) {
      return res
    }
    
    // 处理特定错误码
    if (res.code === 401) {
      // 401 未登录或token过期
      ElMessage.error(res.message || '暂未登录或token已过期')
      
      // 如果是注册相关的API请求，不进行跳转
      if (response.config.url.includes('/auth/register') || 
          response.config.url.includes('/user/check-username') || 
          response.config.url.includes('/user/check-email')) {
        return Promise.reject(new Error(res.message || '校验失败'))
      }
      
      // 清除token和用户信息
      const userStore = useUserStore()
      userStore.resetState()
      
      // 强制跳转登录页
      const router = useRouter()
      if (router) {
        router.push('/login')
      } else {
        // 如果在拦截器里无法获取router实例，则使用window.location
        window.location.href = '/login'
      }
      
      return Promise.reject(new Error(res.message || '未授权'))
    } else if (res.code === 403) {
      // 403 权限不足
      ElMessage.error(res.message || '没有操作权限')
      return Promise.reject(new Error(res.message || '没有操作权限'))
    } else {
      // 其他错误
      console.error('API返回错误:', res.code, res.message)
      ElMessage.error(res.message || '操作失败')
      return Promise.reject(new Error(res.message || '操作失败'))
    }
  },
  (error) => {
    // 添加详细的错误日志
    console.error('响应错误:', error)
    if (error.response) {
      console.error('错误响应数据:', error.response.status, error.response.data)
    } else if (error.request) {
      console.error('未收到响应，请求内容:', error.request)
    } else {
      console.error('请求配置错误:', error.message)
    }
    
    // 处理错误响应
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          ElMessage.error(data.message || '暂未登录或token已过期')
          
          // 如果是注册相关的API请求，不进行跳转
          if (error.config && (error.config.url.includes('/auth/register') || 
                               error.config.url.includes('/user/check-username') || 
                               error.config.url.includes('/user/check-email'))) {
            break
          }
          
          // 清除token和用户信息
          const userStore = useUserStore()
          userStore.resetState()
          
          // 跳转到登录页
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
      // 请求发出但没有收到响应
      ElMessage.error('服务器未响应，请检查网络或后端服务是否启动')
    } else {
      // 请求配置有误
      ElMessage.error(`请求配置错误: ${error.message}`)
    }
    
    return Promise.reject(error)
  }
)

export default service 
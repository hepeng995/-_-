import { defineStore } from 'pinia'
import { login, getUserInfo, logout, register } from '@/api/user'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: sessionStorage.getItem('token') || '',
    userInfo: JSON.parse(sessionStorage.getItem('userInfo') || '{}')
  }),
  
  getters: {
    isLoggedIn: (state) => !!state.token,
    isAdmin: (state) => state.userInfo.role === 'ADMIN',
    isUser: (state) => state.userInfo.role === 'USER',
    userId: (state) => state.userInfo.id,
    username: (state) => state.userInfo.username,
    userRole: (state) => state.userInfo.role
  },
  
  actions: {
    // 用户登录
    async loginAction(loginForm) {
      try {
        console.log('UserStore: 开始登录请求')
        const res = await login(loginForm)
        console.log('UserStore: 登录请求结果', res)
        
        if (res.code === 200) {
          this.setToken(res.data.token)
          this.setUserInfo(res.data)
          console.log('UserStore: 登录成功，用户信息已保存', res.data)
          console.log('UserStore: 用户角色为:', res.data.role)
          return Promise.resolve(res.data)
        } else {
          console.error('UserStore: 登录失败，服务端返回错误', res)
          ElMessage.error(res.message || '登录失败')
          return Promise.reject(new Error(res.message || '登录失败'))
        }
      } catch (error) {
        console.error('UserStore: 登录异常', error)
        // 检查是否是网络问题
        if (error.message && error.message.includes('Network Error')) {
          ElMessage.error('网络错误：无法连接到服务器，请检查后端服务是否启动')
        } else {
          ElMessage.error(error.message || '登录失败')
        }
        return Promise.reject(error)
      }
    },
    
    // 用户注册
    async registerAction(registerForm) {
      try {
        console.log('UserStore: 开始注册请求')
        const res = await register(registerForm)
        console.log('UserStore: 注册请求结果', res)
        
        if (res.code === 200) {
          ElMessage.success('注册成功，请登录')
          return Promise.resolve(res.data)
        } else {
          console.error('UserStore: 注册失败，服务端返回错误', res)
          ElMessage.error(res.message || '注册失败')
          return Promise.reject(new Error(res.message || '注册失败'))
        }
      } catch (error) {
        console.error('UserStore: 注册异常', error)
        // 检查是否是网络问题
        if (error.message && error.message.includes('Network Error')) {
          ElMessage.error('网络错误：无法连接到服务器，请检查后端服务是否启动')
        } else {
          ElMessage.error(error.message || '注册失败')
        }
        return Promise.reject(error)
      }
    },
    
    // 获取用户信息
    async getInfo() {
      try {
        const res = await getUserInfo()
        if (res.code === 200) {
          this.setUserInfo(res.data)
          return Promise.resolve(res.data)
        } else {
          return Promise.reject(res.message)
        }
      } catch (error) {
        return Promise.reject(error)
      }
    },
    
    // 用户登出
    async logoutAction() {
      try {
        await logout()
        this.resetState()
        return Promise.resolve()
      } catch (error) {
        return Promise.reject(error)
      }
    },
    
    // 设置用户信息
    setUserInfo(userInfo) {
      this.userInfo = userInfo
      sessionStorage.setItem('userInfo', JSON.stringify(userInfo))
    },
    
    // 设置Token
    setToken(token) {
      this.token = token
      sessionStorage.setItem('token', token)
    },
    
    // 重置状态
    resetState() {
      this.token = ''
      this.userInfo = {}
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('userInfo')
    }
  }
}) 
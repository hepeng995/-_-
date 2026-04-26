import request from './request'

/**
 * 用户登录
 * @param {Object} data - 登录信息
 * @returns {Promise}
 */
export function login(data) {
  return request({
    url: '/auth/login',
    method: 'post',
    data
  })
}

/**
 * 获取当前登录用户信息
 * @returns {Promise}
 */
export function getUserInfo() {
  return request({
    url: '/user/info',
    method: 'get'
  })
}

/**
 * 用户登出
 * @returns {Promise}
 */
export function logout() {
  return request({
    url: '/auth/logout',
    method: 'post'
  })
}

/**
 * 检查用户名是否已存在
 * @param {string} username - 用户名
 * @returns {Promise}
 */
export function checkUsername(username) {
  return request({
    url: '/user/check-username',
    method: 'get',
    params: { username }
  })
}

/**
 * 检查邮箱是否已存在
 * @param {string} email - 邮箱
 * @returns {Promise}
 */
export function checkEmail(email) {
  return request({
    url: '/user/check-email',
    method: 'get',
    params: { email }
  })
}

/**
 * 用户注册
 * @param {Object} data - 注册信息
 * @returns {Promise}
 */
export function register(data) {
  return request({
    url: '/auth/register',
    method: 'post',
    data
  })
}

/**
 * 修改个人密码
 * @param {Object} data - 密码信息
 * @returns {Promise}
 */
export function changePassword(data) {
  return request({
    url: '/user/change-password',
    method: 'put',
    data
  })
}

/**
 * 更新个人资料
 * @param {Object} data - 个人资料
 * @returns {Promise}
 */
export function updateProfile(data) {
  return request({
    url: '/user/profile',
    method: 'put',
    data
  })
}

/**
 * 更新用户头像
 * @param {Object} data - 头像信息 { avatar: 'url' }
 * @returns {Promise}
 */
export function updateAvatar(data) {
  return request({
    url: '/user/avatar',
    method: 'put',
    data
  })
}

// 默认导出所有API
export default {
  login,
  getUserInfo,
  logout,
  checkUsername,
  checkEmail,
  register,
  changePassword,
  updateProfile,
  updateAvatar
}

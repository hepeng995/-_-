import request from './request'

/**
 * 用户登录
 * @param {Object} data - 登录信息
 * @returns {Promise}
 */
export function login(data) {
  console.log('调用登录API，参数:', data)
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
  console.log('获取用户信息API')
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
  console.log('调用登出API')
  return request({
    url: '/auth/logout',
    method: 'post'
  })
}

/**
 * 分页获取用户列表
 * @param {Object} query - 查询参数
 * @returns {Promise}
 */
export function getUserList(query) {
  return request({
    url: '/user/page',
    method: 'get',
    params: query
  })
}

/**
 * 获取用户详情
 */
export function getUserDetail(id) {
  return request({
    url: `/user/${id}`,
    method: 'get'
  })
}

/**
 * 添加用户
 * @param {Object} data - 用户信息
 * @returns {Promise}
 */
export function addUser(data) {
  return request({
    url: '/user',
    method: 'post',
    data
  })
}

/**
 * 更新用户信息
 * @param {number} id - 用户ID
 * @param {Object} data - 用户信息
 * @returns {Promise}
 */
export function updateUser(id, data) {
  return request({
    url: `/user/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除用户
 * @param {number} id - 用户ID
 * @returns {Promise}
 */
export function deleteUser(id) {
  return request({
    url: `/user/${id}`,
    method: 'delete'
  })
}

/**
 * 更新用户状态（启用/禁用）
 * @param {number} id - 用户ID
 * @param {boolean} enabled - 是否启用
 * @returns {Promise}
 */
export function updateUserStatus(id, enabled) {
  return request({
    url: `/user/${id}/status`,
    method: 'put',
    params: { enabled }
  })
}

/**
 * 重置用户密码
 * @param {number} id - 用户ID
 * @returns {Promise}
 */
export function resetUserPassword(id) {
  return request({
    url: `/user/${id}/reset-password`,
    method: 'put'
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
 * 获取用户统计信息
 * @returns {Promise}
 */
export function getUserStats() {
  return request({
    url: '/user/stats',
    method: 'get'
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

/**
 * 获取用户数量统计（按角色）
 */
export function getUserCount() {
  return request({
    url: '/user/stats',
    method: 'get'
  })
}

// 默认导出所有API
export default {
  login,
  getUserInfo,
  logout,
  getUserList,
  getUserDetail,
  addUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  resetUserPassword,
  checkUsername,
  checkEmail,
  getUserStats,
  register,
  changePassword,
  updateProfile,
  updateAvatar,
  getUserCount
} 
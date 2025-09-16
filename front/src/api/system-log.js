import request from './request'

/**
 * 获取系统日志分页列表
 * @param {Object} params - 查询参数
 * @returns {Promise} - 返回请求Promise
 */
export function getSystemLogPage(params) {
  return request({
    url: '/system/logs/page',
    method: 'get',
    params
  })
}

/**
 * 获取系统日志详情
 * @param {Number} id - 日志ID
 * @returns {Promise} - 返回请求Promise
 */
export function getSystemLogDetail(id) {
  return request({
    url: `/system/logs/${id}`,
    method: 'get'
  })
}

/**
 * 删除系统日志
 * @param {Number} id - 日志ID
 * @returns {Promise} - 返回请求Promise
 */
export function deleteSystemLog(id) {
  return request({
    url: `/system/logs/${id}`,
    method: 'delete'
  })
}

/**
 * 批量删除系统日志
 * @param {Array} ids - 日志ID数组
 * @returns {Promise} - 返回请求Promise
 */
export function batchDeleteSystemLogs(ids) {
  return request({
    url: '/system/logs/batch',
    method: 'delete',
    data: ids
  })
}

/**
 * 清空系统日志
 * @returns {Promise} - 返回请求Promise
 */
export function clearSystemLogs() {
  return request({
    url: '/system/logs/clear',
    method: 'delete'
  })
}

/**
 * 导出系统日志
 * @param {Object} params - 查询参数
 * @returns {Promise} - 返回请求Promise
 */
export function exportSystemLogs(params) {
  return request({
    url: '/system/logs/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

/**
 * 获取操作类型列表
 * @returns {Promise} - 返回请求Promise
 */
export function getOperationTypes() {
  return request({
    url: '/system/logs/operation-types',
    method: 'get'
  })
}

/**
 * 获取模块列表
 * @returns {Promise} - 返回请求Promise
 */
export function getModules() {
  return request({
    url: '/system/logs/modules',
    method: 'get'
  })
}

/**
 * 获取操作统计数据
 * @param {Object} params - 查询参数，包含开始时间和结束时间
 * @returns {Promise} - 返回请求Promise
 */
export function getOperationStats(params) {
  return request({
    url: '/system/logs/stats',
    method: 'get',
    params
  })
} 
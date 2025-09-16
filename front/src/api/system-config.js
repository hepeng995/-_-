import request from './request'

/**
 * 获取所有系统配置
 * @returns {Promise} 返回请求Promise
 */
export function getAllConfigs() {
  return request({
    url: '/system/config/list',
    method: 'get'
  })
}

/**
 * 按分组获取系统配置
 * @returns {Promise} 返回请求Promise
 */
export function getConfigsByGroup() {
  return request({
    url: '/system/config/group',
    method: 'get'
  })
}

/**
 * 获取指定分组的配置
 * @param {String} groupName 分组名称
 * @returns {Promise} 返回请求Promise
 */
export function getConfigsByGroupName(groupName) {
  return request({
    url: `/system/config/group/${groupName}`,
    method: 'get'
  })
}

/**
 * 获取所有配置分组
 * @returns {Promise} 返回请求Promise
 */
export function getAllGroups() {
  return request({
    url: '/system/config/groups',
    method: 'get'
  })
}

/**
 * 根据键名获取配置
 * @param {String} configKey 配置键名
 * @returns {Promise} 返回请求Promise
 */
export function getConfigByKey(configKey) {
  return request({
    url: `/system/config/${configKey}`,
    method: 'get'
  })
}

/**
 * 新增配置
 * @param {Object} data 配置信息
 * @returns {Promise} 返回请求Promise
 */
export function addConfig(data) {
  return request({
    url: '/system/config',
    method: 'post',
    data
  })
}

/**
 * 更新配置
 * @param {Object} data 配置信息
 * @returns {Promise} 返回请求Promise
 */
export function updateConfig(data) {
  return request({
    url: '/system/config',
    method: 'put',
    data
  })
}

/**
 * 更新配置值
 * @param {String} configKey 配置键名
 * @param {String} configValue 配置值
 * @returns {Promise} 返回请求Promise
 */
export function updateConfigValue(configKey, configValue) {
  return request({
    url: `/system/config/${configKey}`,
    method: 'put',
    params: { configValue }
  })
}

/**
 * 批量更新配置值
 * @param {Object} data 配置键值对
 * @returns {Promise} 返回请求Promise
 */
export function batchUpdateConfigValues(data) {
  return request({
    url: '/system/config/batch',
    method: 'put',
    data
  })
}

/**
 * 删除配置
 * @param {Number} id 配置ID
 * @returns {Promise} 返回请求Promise
 */
export function deleteConfig(id) {
  return request({
    url: `/system/config/${id}`,
    method: 'delete'
  })
}

/**
 * 刷新配置缓存
 * @returns {Promise} 返回请求Promise
 */
export function refreshCache() {
  return request({
    url: '/system/config/refresh',
    method: 'post'
  })
} 
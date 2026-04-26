import request from './request'

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

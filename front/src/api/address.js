import request from './request'

// 收货地址相关API
export default {
  /**
   * 获取用户收货地址列表
   */
  getUserAddresses() {
    return request({
      url: '/addresses',
      method: 'get'
    })
  },

  /**
   * 根据ID获取收货地址详情
   */
  getAddressById(id) {
    return request({
      url: `/addresses/${id}`,
      method: 'get'
    })
  },

  /**
   * 创建收货地址
   */
  createAddress(data) {
    return request({
      url: '/addresses',
      method: 'post',
      data
    })
  },

  /**
   * 更新收货地址
   */
  updateAddress(id, data) {
    return request({
      url: `/addresses/${id}`,
      method: 'put',
      data
    })
  },

  /**
   * 删除收货地址
   */
  deleteAddress(id) {
    return request({
      url: `/addresses/${id}`,
      method: 'delete'
    })
  },

  /**
   * 设置默认地址
   */
  setDefaultAddress(id) {
    return request({
      url: `/addresses/${id}/default`,
      method: 'put'
    })
  }
}

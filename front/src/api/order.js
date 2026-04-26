import request from './request'

// 订单相关API
export default {
  /**
   * 分页查询订单列表
   */
  getOrderPage(params) {
    return request({
      url: '/orders/page',
      method: 'get',
      params
    })
  },

  /**
   * 获取订单详情
   */
  getOrderById(id) {
    return request({
      url: `/orders/${id}`,
      method: 'get'
    })
  },

  /**
   * 创建订单
   */
  createOrder(data) {
    return request({
      url: '/orders',
      method: 'post',
      data
    })
  },

  /**
   * 取消订单
   */
  cancelOrder(id, reason) {
    return request({
      url: `/orders/${id}/cancel`,
      method: 'put',
      params: { cancelReason: reason }
    })
  },

  /**
   * 确认订单
   */
  confirmOrder(id) {
    return request({
      url: `/orders/${id}/confirm`,
      method: 'put'
    })
  },

  /**
   * 获取用户订单列表
   */
  getUserOrders(params) {
    return request({
      url: '/orders/user-orders',
      method: 'get',
      params
    })
  },

  /**
   * 订单支付
   */
  payOrder(orderNo, paymentData) {
    return request({
      url: '/orders/pay',
      method: 'post',
      data: paymentData
    })
  },

  /**
   * 获取商品信息用于订单确认
   */
  getProductForOrder(productId, params) {
    return request({
      url: `/orders/product/${productId}`,
      method: 'get',
      params
    })
  },

  /**
   * 获取购物车商品用于订单确认
   */
  getCartItemsForOrder(itemIds) {
    return request({
      url: '/orders/cart-items',
      method: 'post',
      data: { itemIds }
    })
  },

  /**
   * 从购物车创建订单
   */
  createOrderFromCart(data) {
    return request({
      url: '/orders/from-cart',
      method: 'post',
      data
    })
  }
}

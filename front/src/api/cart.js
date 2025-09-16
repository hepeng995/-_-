import request from './request'

// 购物车相关API
export default {
  /**
   * 获取购物车商品列表
   */
  getCartItems() {
    return request({
      url: '/cart',
      method: 'get'
    })
  },

  /**
   * 添加商品到购物车
   */
  addToCart(productId, quantity = 1) {
    return request({
      url: '/cart/add',
      method: 'post',
      params: {
        productId,
        quantity
      }
    })
  },

  /**
   * 更新购物车商品数量
   */
  updateCartItem(productId, quantity) {
    return request({
      url: '/cart/update',
      method: 'put',
      params: {
        productId,
        quantity
      }
    })
  },

  /**
   * 删除购物车商品
   */
  deleteCartItem(productIds) {
    return request({
      url: '/cart/remove',
      method: 'delete',
      data: productIds
    })
  },

  /**
   * 批量删除购物车商品
   */
  batchDeleteCartItems(productIds) {
    return request({
      url: '/cart/remove',
      method: 'delete',
      data: productIds
    })
  },

  /**
   * 清空购物车
   */
  clearCart() {
    return request({
      url: '/cart/clear',
      method: 'delete'
    })
  },

  /**
   * 获取购物车商品数量
   */
  getCartCount() {
    return request({
      url: '/cart/count',
      method: 'get'
    })
  }
}

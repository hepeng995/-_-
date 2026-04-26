import request from './request'

// 商品相关API
export default {
  /**
   * 分页查询商品列表
   */
  getProductPage(params) {
    return request({
      url: '/products/page',
      method: 'get',
      params
    })
  },

  /**
   * 获取商品详情
   */
  getProductById(id) {
    return request({
      url: `/products/${id}`,
      method: 'get'
    })
  },

  /**
   * 获取热门商品列表
   */
  getHotProducts(limit = 8) {
    return request({
      url: '/products/hot',
      method: 'get',
      params: { limit }
    })
  },

  /**
   * 加入购物车
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
   * 获取购物车数量
   */
  getCartCount() {
    return request({
      url: '/cart/count',
      method: 'get'
    })
  },

  /**
   * 获取推荐商品列表
   */
  getFeaturedProducts(limit = 6) {
    return request({
      url: '/products/featured',
      method: 'get',
      params: { limit }
    })
  },

  /**
   * 获取商品评价信息（包含评价列表、统计信息、分布等）
   */
  getProductReviews(productId, params = {}) {
    return request({
      url: `/products/${productId}/reviews`,
      method: 'get',
      params
    })
  },

  /**
   * 检查用户是否可以评价商品
   */
  checkReviewEligibility(productId, orderId) {
    return request({
      url: `/products/${productId}/review-eligibility`,
      method: 'get',
      params: { orderId }
    })
  },

  /**
   * 根据分类获取商品列表
   */
  getProductsByCategory(categoryId) {
    return request({
      url: `/products/category/${categoryId}`,
      method: 'get'
    })
  },

  /**
   * 获取商品分类列表
   */
  getProductCategories() {
    return request({
      url: '/products/categories',
      method: 'get'
    })
  },

  /**
   * 搜索商品
   */
  searchProducts(keyword, params = {}) {
    return request({
      url: '/products/search',
      method: 'get',
      params: { keyword, ...params }
    })
  }
}

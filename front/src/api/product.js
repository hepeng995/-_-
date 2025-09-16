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
   * 创建商品
   */
  createProduct(data) {
    return request({
      url: '/products',
      method: 'post',
      data
    })
  },

  /**
   * 更新商品
   */
  updateProduct(id, data) {
    return request({
      url: `/products/${id}`,
      method: 'put',
      data
    })
  },

  /**
   * 删除商品
   */
  deleteProduct(id) {
    return request({
      url: `/products/${id}`,
      method: 'delete'
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
   * 分页查询商品分类列表
   */
  getProductCategoriesPage(params) {
    return request({
      url: '/products/categories/page',
      method: 'get',
      params
    })
  },

  /**
   * 创建商品分类
   */
  createProductCategory(data) {
    return request({
      url: '/products/categories',
      method: 'post',
      data
    })
  },

  /**
   * 更新商品分类
   */
  updateProductCategory(id, data) {
    return request({
      url: `/products/categories/${id}`,
      method: 'put',
      data
    })
  },

  /**
   * 删除商品分类
   */
  deleteProductCategory(id) {
    return request({
      url: `/products/categories/${id}`,
      method: 'delete'
    })
  },

  /**
   * 更新商品分类
   */
  updateProductCategory(id, data) {
    return request({
      url: `/products/categories/${id}`,
      method: 'put',
      data
    })
  },

  /**
   * 更新商品分类状态
   */
  updateProductCategoryStatus(id, status) {
    return request({
      url: `/products/categories/${id}/status`,
      method: 'put',
      data: { status }
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
  },

  /**
   * 更新商品库存
   */
  updateProductStock(id, stock) {
    return request({
      url: `/products/${id}/stock`,
      method: 'put',
      data: { stock }
    })
  },

  /**
   * 批量更新商品状态
   */
  batchUpdateProductStatus(ids, status) {
    return request({
      url: '/products/batch/status',
      method: 'put',
      data: { ids, status }
    })
  }
}
import request from './request'

// 商品评价相关API
export default {
  /**
   * 创建商品评价
   */
  createReview(data) {
    return request({
      url: '/reviews',
      method: 'post',
      data
    })
  },

  /**
   * 分页查询评价列表
   */
  getReviewPage(params) {
    return request({
      url: '/reviews/page',
      method: 'get',
      params
    })
  },

  /**
   * 获取评价详情
   */
  getReviewById(id) {
    return request({
      url: `/reviews/${id}`,
      method: 'get'
    })
  },

  /**
   * 更新评价
   */
  updateReview(id, data) {
    return request({
      url: `/reviews/${id}`,
      method: 'put',
      data
    })
  },

  /**
   * 删除评价
   */
  deleteReview(id) {
    return request({
      url: `/reviews/${id}`,
      method: 'delete'
    })
  },

  /**
   * 商家回复评价
   */
  replyReview(data) {
    return request({
      url: '/reviews/reply',
      method: 'post',
      data
    })
  },

  /**
   * 点赞/取消点赞评价
   */
  toggleHelpful(reviewId) {
    return request({
      url: `/reviews/${reviewId}/helpful`,
      method: 'post'
    })
  },

  /**
   * 获取商品评价统计信息
   */
  getReviewStats(productId) {
    return request({
      url: `/reviews/stats/${productId}`,
      method: 'get'
    })
  },

  /**
   * 获取商品评价分布
   */
  getRatingDistribution(productId) {
    return request({
      url: `/reviews/distribution/${productId}`,
      method: 'get'
    })
  },

  /**
   * 检查用户是否已评价商品
   */
  checkUserReviewed(productId, orderId) {
    return request({
      url: '/reviews/check',
      method: 'get',
      params: { productId, orderId }
    })
  },

  /**
   * 获取用户评价列表
   */
  getUserReviews(params) {
    return request({
      url: '/reviews/user',
      method: 'get',
      params
    })
  },

  /**
   * 审核评价
   */
  auditReview(reviewId, status) {
    return request({
      url: `/reviews/${reviewId}/audit`,
      method: 'put',
      params: { status }
    })
  },

  /**
   * 批量审核评价
   */
  batchAuditReviews(reviewIds, status) {
    return request({
      url: '/reviews/batch-audit',
      method: 'put',
      data: reviewIds,
      params: { status }
    })
  },

  /**
   * 获取商品的评价信息（包含评价列表、统计信息、分布等）
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
  }
}

/**
 * 旅游路线 API 层 — 真实后端调用
 */
import request from './request'

export default {
  async getRoutePage({ current = 1, size = 9, days, difficulty, keyword, tag } = {}) {
    return request({
      url: '/tour-routes/page',
      method: 'get',
      params: {
        pageNum: current,
        pageSize: size,
        days: days !== undefined && days !== null && days !== '' ? days : undefined,
        difficulty: difficulty || undefined,
        keyword: keyword || undefined,
        tag: tag || undefined
      }
    })
  },

  async getRouteById(id) {
    return request({
      url: `/tour-routes/${id}`,
      method: 'get'
    })
  },

  async getRecommendRoutes(limit = 3) {
    return request({
      url: '/tour-routes/recommend',
      method: 'get',
      params: { limit }
    })
  },

  /**
   * 切换路线收藏状态
   */
  async toggleFavorite(id) {
    return request({
      url: `/tour-routes/${id}/favorite`,
      method: 'post'
    })
  },

  /**
   * 获取当前用户对路线的收藏状态
   */
  async getFavoriteInfo(id) {
    return request({
      url: `/tour-routes/${id}/favorite-info`,
      method: 'get'
    })
  },

  /**
   * 获取当前用户收藏的路线ID列表
   */
  async getMyFavoriteRouteIds() {
    return request({
      url: '/tour-routes/favorites/my',
      method: 'get'
    })
  }
}

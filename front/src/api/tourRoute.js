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
  }
}

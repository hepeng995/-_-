import request from './request'

// 资讯相关API
export default {
  /**
   * 分页查询资讯列表
   */
  getNewsPage(params) {
    return request({
      url: '/news/page',
      method: 'get',
      params
    })
  },

  /**
   * 获取资讯详情
   */
  getNewsById(id) {
    return request({
      url: `/news/${id}`,
      method: 'get'
    })
  },

  /**
   * 创建资讯
   */
  createNews(data) {
    return request({
      url: '/news',
      method: 'post',
      data
    })
  },

  /**
   * 更新资讯
   */
  updateNews(id, data) {
    return request({
      url: `/news/${id}`,
      method: 'put',
      data
    })
  },

  /**
   * 删除资讯
   */
  deleteNews(id) {
    return request({
      url: `/news/${id}`,
      method: 'delete'
    })
  },

  /**
   * 发布资讯
   */
  publishNews(id) {
    return request({
      url: `/news/${id}/publish`,
      method: 'put'
    })
  },

  /**
   * 下线资讯
   */
  unpublishNews(id) {
    return request({
      url: `/news/${id}/unpublish`,
      method: 'put'
    })
  },

  /**
   * 获取推荐资讯列表
   */
  getFeaturedNews(limit = 6) {
    return request({
      url: '/news/featured',
      method: 'get',
      params: { limit }
    })
  },

  /**
   * 获取热门资讯列表
   */
  getHotNews(limit = 6) {
    return request({
      url: '/news/hot',
      method: 'get',
      params: { limit }
    })
  },

  /**
   * 获取置顶资讯列表
   */
  getTopNews(limit = 3) {
    return request({
      url: '/news/top',
      method: 'get',
      params: { limit }
    })
  },

  /**
   * 根据分类获取资讯列表
   */
  getNewsByCategory(category, limit = 10) {
    return request({
      url: `/news/category/${category}`,
      method: 'get',
      params: { limit }
    })
  },


  /**
   * 增加浏览量
   */
  increaseViewCount(id) {
    return request({
      url: `/news/${id}/view`,
      method: 'post'
    })
  },


  /**
   * 获取最新资讯列表（用于首页展示）
   */
  getLatestNews(limit = 4) {
    return request({
      url: '/news/latest',
      method: 'get',
      params: { limit }
    })
  },

  /**
   * 获取公告列表
   */
  getAnnouncements(limit = 5) {
    return request({
      url: '/news/announcements',
      method: 'get',
      params: { limit }
    })
  },

  /**
   * 获取资讯统计信息
   */
  getNewsStats() {
    return request({
      url: '/news/stats',
      method: 'get'
    })
  }
}
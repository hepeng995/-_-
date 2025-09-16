import request from './request'

// 景点相关API
export default {
  /**
   * 分页查询景点列表
   */
  getAttractionPage(params) {
    return request({
      url: '/attractions/page',
      method: 'get',
      params
    })
  },

  /**
   * 获取景点详情
   */
  getAttractionById(id) {
    return request({
      url: `/attractions/${id}`,
      method: 'get'
    })
  },

  /**
   * 创建景点
   */
  createAttraction(data) {
    return request({
      url: '/attractions',
      method: 'post',
      data
    })
  },

  /**
   * 更新景点
   */
  updateAttraction(id, data) {
    return request({
      url: `/attractions/${id}`,
      method: 'put',
      data
    })
  },

  /**
   * 删除景点
   */
  deleteAttraction(id) {
    return request({
      url: `/attractions/${id}`,
      method: 'delete'
    })
  },

  /**
   * 获取推荐景点列表
   */
  getRecommendAttractions(limit = 6) {
    return request({
      url: '/attractions/recommend',
      method: 'get',
      params: { limit }
    })
  },

  /**
   * 获取精选景点列表（用于首页展示）
   */
  getFeaturedAttractions(limit = 6) {
    return request({
      url: '/attractions/featured',
      method: 'get',
      params: { limit }
    })
  },

  /**
   * 获取热门景点列表
   */
  getHotAttractions(limit = 6) {
    return request({
      url: '/attractions/hot',
      method: 'get',
      params: { limit }
    })
  },

  /**
   * 根据分类获取景点列表
   */
  getAttractionsByCategory(categoryId) {
    return request({
      url: `/attractions/category/${categoryId}`,
      method: 'get'
    })
  },

  /**
   * 获取景点分类列表
   */
  getAttractionCategories() {
    return request({
      url: '/attractions/categories',
      method: 'get'
    })
  },

  /**
   * 创建景点分类
   */
  createAttractionCategory(data) {
    return request({
      url: '/attractions/categories',
      method: 'post',
      data
    })
  },

  /**
   * 更新景点分类
   */
  updateAttractionCategory(id, data) {
    return request({
      url: `/attractions/categories/${id}`,
      method: 'put',
      data
    })
  },

  /**
   * 删除景点分类
   */
  deleteAttractionCategory(id) {
    return request({
      url: `/attractions/categories/${id}`,
      method: 'delete'
    })
  }
}
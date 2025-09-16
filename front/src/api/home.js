import request from './request'

// 首页相关API
export default {
  /**
   * 获取首页所有数据
   */
  getHomeData() {
    return request({
      url: '/home/data',
      method: 'get'
    })
  },

  /**
   * 获取首页概览信息
   */
  getOverview() {
    return request({
      url: '/home/overview',
      method: 'get'
    })
  },

  /**
   * 获取首页统计数据
   */
  getHomeStats() {
    return request({
      url: '/home/stats',
      method: 'get'
    })
  },

  /**
   * 获取首页轮播图
   */
  getBanners() {
    return request({
      url: '/home/banners',
      method: 'get'
    })
  }
}
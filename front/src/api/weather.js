import request from './request'

// 天气相关API
export default {
  /**
   * 获取景点实时天气
   */
  getWeatherNow(attractionId) {
    return request({
      url: `/weather/now/${attractionId}`,
      method: 'get'
    })
  },

  /**
   * 获取景点3日天气预报
   */
  getWeatherForecast(attractionId) {
    return request({
      url: `/weather/forecast/${attractionId}`,
      method: 'get'
    })
  }
}

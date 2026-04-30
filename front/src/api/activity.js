/**
 * 乡村活动 API 层
 */
import request from './request'

export default {
  getActivityPage({ current = 1, size = 9, category, status, keyword } = {}) {
    return request({
      url: '/activities/page',
      method: 'get',
      params: {
        pageNum: current,
        pageSize: size,
        category: category || undefined,
        status: status || undefined,
        keyword: keyword || undefined
      }
    })
  },

  getActivityById(id) {
    return request({
      url: `/activities/${id}`,
      method: 'get'
    })
  },

  getActivitiesByDate(dateStr) {
    return request({
      url: '/activities/date',
      method: 'get',
      params: { date: dateStr }
    })
  },

  getMonthActivities(year, month) {
    return request({
      url: '/activities/calendar',
      method: 'get',
      params: { year, month }
    })
  },

  registerActivity(data) {
    return request({
      url: '/activities/register',
      method: 'post',
      data
    })
  },

  getRelatedActivities(activityId, limit = 3) {
    return request({
      url: `/activities/${activityId}/related`,
      method: 'get',
      params: { limit }
    })
  }
}

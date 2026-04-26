/**
 * 乡村活动 API 层
 * @description Mock 模式，将来对接真实后端只需修改此文件
 */
import { activities, registrations } from '@/mock/activityData'

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

export default {
  /** 分页查询活动列表 */
  async getActivityPage({ current = 1, size = 9, category, status, keyword } = {}) {
    await delay()
    let filtered = [...activities]

    if (category) {
      filtered = filtered.filter(a => a.category === category)
    }
    if (status) {
      filtered = filtered.filter(a => a.status === status)
    }
    if (keyword) {
      const kw = keyword.toLowerCase()
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(kw) ||
        a.location.toLowerCase().includes(kw)
      )
    }

    const total = filtered.length
    const start = (current - 1) * size
    const records = filtered.slice(start, start + size)

    return { code: 200, data: { records, total }, message: 'success' }
  },

  /** 获取活动详情 */
  async getActivityById(id) {
    await delay(200)
    const activity = activities.find(a => a.id === Number(id))
    if (!activity) {
      return { code: 404, message: '活动不存在', data: null }
    }
    return { code: 200, data: activity, message: 'success' }
  },

  /** 按日期查询活动 */
  async getActivitiesByDate(dateStr) {
    await delay(200)
    const date = new Date(dateStr)
    const filtered = activities.filter(a => {
      const start = new Date(a.startTime)
      const end = new Date(a.endTime)
      return date >= start && date <= end
    })
    return { code: 200, data: filtered, message: 'success' }
  },

  /** 获取月度活动日历数据 */
  async getMonthActivities(year, month) {
    await delay(200)
    const monthStart = new Date(year, month - 1, 1)
    const monthEnd = new Date(year, month, 0, 23, 59, 59)
    const filtered = activities.filter(a => {
      const start = new Date(a.startTime)
      const end = new Date(a.endTime)
      return start <= monthEnd && end >= monthStart
    })
    return { code: 200, data: filtered, message: 'success' }
  },

  /** 报名活动（前端模拟） */
  async registerActivity(data) {
    await delay(500)
    const newReg = {
      id: registrations.length + 1,
      activityId: data.activityId,
      contactName: data.contactName,
      contactPhone: data.contactPhone,
      participantCount: data.participantCount,
      remark: data.remark || '',
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0]
    }
    registrations.push(newReg)
    return { code: 200, data: newReg, message: '报名成功' }
  },

  /** 获取相关推荐活动 */
  async getRelatedActivities(activityId, limit = 3) {
    await delay(200)
    const current = activities.find(a => a.id === Number(activityId))
    if (!current) return { code: 200, data: [], message: 'success' }

    const related = activities
      .filter(a => a.id !== Number(activityId) && a.category === current.category)
      .slice(0, limit)
    return { code: 200, data: related, message: 'success' }
  }
}

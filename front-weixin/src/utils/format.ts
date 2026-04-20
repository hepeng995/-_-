export const toNumber = (value?: number | string | null, fallback = 0) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback

  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }

  return fallback
}

export const formatPrice = (value?: number | string | null) => {
  return `￥${toNumber(value).toFixed(2)}`
}

export const formatCount = (value?: number | string | null, suffix = '') => {
  return `${toNumber(value)}${suffix}`
}

export const formatDate = (value?: string | null) => {
  if (!value) return '暂无时间'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const formatDateTime = (value?: string | null) => {
  if (!value) return '暂无时间'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  const datePart = formatDate(value)
  const hours = `${date.getHours()}`.padStart(2, '0')
  const minutes = `${date.getMinutes()}`.padStart(2, '0')
  return `${datePart} ${hours}:${minutes}`
}

export const formatRelativeTime = (value?: string | null) => {
  if (!value) return '刚刚'

  const time = new Date(value).getTime()
  if (Number.isNaN(time)) return value

  const diff = Date.now() - time

  if (diff < 60 * 1000) return '刚刚'
  if (diff < 60 * 60 * 1000) return `${Math.max(1, Math.floor(diff / (60 * 1000)))}分钟前`
  if (diff < 24 * 60 * 60 * 1000) return `${Math.max(1, Math.floor(diff / (60 * 60 * 1000)))}小时前`
  if (diff < 7 * 24 * 60 * 60 * 1000) return `${Math.max(1, Math.floor(diff / (24 * 60 * 60 * 1000)))}天前`

  return formatDate(value)
}

export const stripHtml = (value?: string | null) => {
  if (!value) return ''
  return value.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}

export const joinAddress = (...parts: Array<string | undefined | null>) => {
  return parts.filter(Boolean).join(' ')
}

export const normalizeText = (value?: string | null, fallback = '') => {
  return value?.trim() || fallback
}

export const orderStatusText = (status?: number | string | null) => {
  const map: Record<string, string> = {
    '1': '待付款',
    '2': '待发货',
    '3': '待收货',
    '4': '已完成',
    '5': '已取消',
    '6': '已退款',
  }
  return map[String(status ?? '')] || '处理中'
}

export const forumCategoryText = (category?: string | null) => {
  const map: Record<string, string> = {
    environment: '环境问题',
    infrastructure: '基础设施',
    agriculture: '农业发展',
    tourism: '旅游发展',
    education: '教育文化',
    other: '其他建议',
  }
  return map[category || ''] || '乡村建言'
}

import type { ChipOption } from '@/types/models'

export const FORUM_CATEGORY_OPTIONS: ChipOption[] = [
  { label: '全部建议', value: '' },
  { label: '环境问题', value: 'environment' },
  { label: '基础设施', value: 'infrastructure' },
  { label: '农业发展', value: 'agriculture' },
  { label: '旅游发展', value: 'tourism' },
  { label: '教育文化', value: 'education' },
  { label: '其他建议', value: 'other' },
]

export const ORDER_FILTER_OPTIONS: ChipOption[] = [
  { label: '全部', value: null },
  { label: '待付款', value: 1 },
  { label: '待发货', value: 2 },
  { label: '待收货', value: 3 },
  { label: '已完成', value: 4 },
  { label: '已取消', value: 5 },
]

export const REVIEW_RATING_OPTIONS: ChipOption[] = [
  { label: '全部评价', value: null },
  { label: '5星', value: 5 },
  { label: '4星', value: 4 },
  { label: '3星', value: 3 },
  { label: '2星', value: 2 },
  { label: '1星', value: 1 },
]

export const AI_QUICK_QUESTIONS = [
  '推荐几个适合周末散心的景点',
  '桃源有什么值得带走的特产',
  '最近有哪些乡村新鲜事',
  '帮我规划一条一日游路线',
]

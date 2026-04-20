import type { PageResult } from '@/types/api'
import type { NewsItem } from '@/types/models'
import { request } from '@/utils/request'

export const newsApi = {
  getPage(params: {
    pageNum: number
    pageSize: number
    keyword?: string
    category?: string
    status?: number
    isTop?: boolean
  }) {
    return request<PageResult<NewsItem>>({
      url: '/news/page',
      params,
      mockKey: 'news.page',
      allowMockFallback: true,
    })
  },
  getById(id: number | string) {
    return request<NewsItem>({
      url: `/news/${id}`,
      mockKey: 'news.byId',
      allowMockFallback: true,
    })
  },
  getTop(limit = 4) {
    return request<NewsItem[]>({
      url: '/news/top',
      params: { limit },
      mockKey: 'news.top',
      allowMockFallback: true,
    })
  },
}

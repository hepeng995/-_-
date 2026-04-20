import type { PageResult } from '@/types/api'
import type { Attraction, CategoryItem } from '@/types/models'
import { request } from '@/utils/request'

export const attractionApi = {
  getPage(params: {
    pageNum: number
    pageSize: number
    keyword?: string
    categoryId?: number | null
    status?: number
  }) {
    return request<PageResult<Attraction>>({
      url: '/attractions/page',
      params,
      mockKey: 'attraction.page',
      allowMockFallback: true,
    })
  },
  getById(id: number | string) {
    return request<Attraction>({
      url: `/attractions/${id}`,
      mockKey: 'attraction.byId',
      allowMockFallback: true,
    })
  },
  getCategories() {
    return request<CategoryItem[]>({
      url: '/attractions/categories',
      mockKey: 'attraction.categories',
      allowMockFallback: true,
    })
  },
  getByCategory(categoryId: number | string) {
    return request<Attraction[]>({
      url: `/attractions/category/${categoryId}`,
      mockKey: 'attraction.byCategory',
      allowMockFallback: true,
    })
  },
}

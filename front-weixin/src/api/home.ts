import { request } from '@/utils/request'
import type { HomeData, VillageOverview } from '@/types/models'

export const homeApi = {
  getHomeData() {
    return request<HomeData>({
      url: '/home/data',
      mockKey: 'home.data',
      allowMockFallback: true,
    })
  },
  getOverview() {
    return request<VillageOverview>({
      url: '/home/overview',
      mockKey: 'home.overview',
      allowMockFallback: true,
    })
  },
}

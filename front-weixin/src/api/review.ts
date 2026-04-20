import { request } from '@/utils/request'
import type { ProductReview } from '@/types/models'

export const reviewApi = {
  create(data: Pick<ProductReview, 'productId' | 'orderId' | 'rating' | 'content' | 'images' | 'isAnonymous'>) {
    return request<ProductReview>({
      url: '/reviews',
      method: 'POST',
      data,
      requiresAuth: true,
      mockKey: 'review.create',
      allowMockFallback: true,
      allowMockAuth: true,
    })
  },
  toggleHelpful(id: number | string) {
    return request<{ isHelpful: boolean }>({
      url: `/reviews/${id}/helpful`,
      method: 'POST',
      requiresAuth: true,
      mockKey: 'review.helpful',
      allowMockFallback: true,
      allowMockAuth: true,
    })
  },
}

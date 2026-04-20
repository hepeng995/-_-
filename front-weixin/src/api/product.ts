import type { PageResult } from '@/types/api'
import type { CategoryItem, Product, ProductReviewBundle } from '@/types/models'
import { request } from '@/utils/request'

export const productApi = {
  getPage(params: {
    pageNum: number
    pageSize: number
    keyword?: string
    categoryId?: number | null
    status?: number
    isFeatured?: boolean
  }) {
    return request<PageResult<Product>>({
      url: '/products/page',
      params,
      mockKey: 'product.page',
      allowMockFallback: true,
    })
  },
  getById(id: number | string) {
    return request<Product>({
      url: `/products/${id}`,
      mockKey: 'product.byId',
      allowMockFallback: true,
    })
  },
  getCategories() {
    return request<CategoryItem[]>({
      url: '/products/categories',
      mockKey: 'product.categories',
      allowMockFallback: true,
    })
  },
  getByCategory(categoryId: number | string) {
    return request<Product[]>({
      url: `/products/category/${categoryId}`,
      mockKey: 'product.byCategory',
      allowMockFallback: true,
    })
  },
  getProductReviews(
    productId: number | string,
    params: {
      rating?: number | null
      hasImages?: boolean
      sortBy?: string
      sortOrder?: string
      current?: number
      size?: number
    } = {},
  ) {
    return request<ProductReviewBundle>({
      url: `/products/${productId}/reviews`,
      params,
      mockKey: 'product.reviews',
      allowMockFallback: true,
    })
  },
  checkReviewEligibility(productId: number | string, orderId?: number | string) {
    return request<{
      canReview: boolean
      hasReviewed: boolean
      reason: string | null
    }>({
      url: `/products/${productId}/review-eligibility`,
      params: { orderId },
      requiresAuth: true,
      mockKey: 'product.reviewEligibility',
      allowMockFallback: true,
      allowMockAuth: true,
    })
  },
}

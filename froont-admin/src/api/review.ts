import request from './request';
import type { PageResult, PageParams, Review } from '../types';

/** 分页查询评价列表 */
export function getReviewPage(params: PageParams) {
  return request.get<PageResult<Review>>('/reviews/page', { params });
}

/** 获取评价详情 */
export function getReviewById(id: number) {
  return request.get<Review>(`/reviews/${id}`);
}

/** 删除评价 */
export function deleteReview(id: number) {
  return request.delete<void>(`/reviews/${id}`);
}

/** 审核评价 */
export function auditReview(reviewId: number, status: number) {
  return request.put<void>(`/reviews/${reviewId}/audit`, null, { params: { status } });
}

/** 批量审核评价 */
export function batchAuditReviews(reviewIds: number[], status: number) {
  return request.put<void>('/reviews/batch-audit', reviewIds, { params: { status } });
}

export default { getReviewPage, getReviewById, deleteReview, auditReview, batchAuditReviews };

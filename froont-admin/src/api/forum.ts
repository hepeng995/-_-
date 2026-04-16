import request from './request';
import type {
  PageResult, PageParams,
  ForumPost, ForumComment, ForumOverview,
  ForumCategoryStat, ForumMonthlyTrend, ForumAuditStatus,
} from '../types';

// ========== 论坛帖子 ==========

/** 分页查询帖子列表 */
export function getPostsPage(params: PageParams) {
  return request.get<PageResult<ForumPost>>('/forum/posts/page', { params });
}

/** 获取帖子详情 */
export function getPostById(id: number) {
  return request.get<ForumPost>(`/forum/posts/${id}`);
}

/** 删除帖子 */
export function deletePost(id: number) {
  return request.delete<void>(`/forum/posts/${id}`);
}

/** 审核帖子 */
export function auditPost(id: number, status: number, rejectReason?: string, adminReply?: string) {
  return request.post<void>(`/forum/posts/${id}/audit`, null, {
    params: { status, rejectReason, adminReply },
  });
}

/** 设置帖子置顶 */
export function setPostTop(id: number, isTop: boolean) {
  return request.post<void>(`/forum/posts/${id}/top`, null, { params: { isTop } });
}

/** 设置帖子推荐/精华 */
export function setPostFeatured(id: number, isFeatured: boolean) {
  return request.post<void>(`/forum/posts/${id}/featured`, null, { params: { isFeatured } });
}

// ========== 论坛评论 ==========

/** 分页查询评论列表 */
export function getCommentsPage(params: PageParams) {
  return request.get<PageResult<ForumComment>>('/forum/comments/page', { params });
}

/** 根据帖子ID获取评论 */
export function getCommentsByPostId(postId: number) {
  return request.get<ForumComment[]>(`/forum/comments/post/${postId}`);
}

/** 删除评论 */
export function deleteComment(id: number) {
  return request.delete<void>(`/forum/comments/${id}`);
}

/** 审核评论 */
export function auditComment(id: number, status: number) {
  return request.post<void>(`/forum/comments/${id}/audit`, null, { params: { status } });
}

// ========== 论坛统计 ==========

/** 获取论坛综合统计 */
export function getForumOverview() {
  return request.get<ForumOverview>('/forum/statistics/overview');
}

/** 获取分类分布统计 */
export function getCategoryDistribution() {
  return request.get<ForumCategoryStat[]>('/forum/statistics/category-distribution');
}

/** 获取热度排行 */
export function getHotRanking() {
  return request.get<any[]>('/forum/statistics/hot-ranking');
}

/** 获取月度趋势 */
export function getMonthlyTrend() {
  return request.get<ForumMonthlyTrend[]>('/forum/statistics/monthly-trend');
}

/** 获取审核状态统计 */
export function getAuditStatus() {
  return request.get<ForumAuditStatus>('/forum/statistics/audit-status');
}

// ========== 工具函数 ==========

/** 获取建议类型名称 */
export function getCategoryName(category: string): string {
  const map: Record<string, string> = {
    environment: '环境问题',
    infrastructure: '基础设施',
    agriculture: '农业发展',
    tourism: '旅游发展',
    education: '教育文化',
    other: '其他',
  };
  return map[category] || category;
}

/** 获取审核状态名称 */
export function getStatusName(status: number): string {
  const map: Record<number, string> = { 0: '待审核', 1: '已通过', 2: '已拒绝' };
  return map[status] || '未知';
}

/** 获取分类选项 */
export function getCategoryOptions() {
  return [
    { label: '环境问题', value: 'environment' },
    { label: '基础设施', value: 'infrastructure' },
    { label: '农业发展', value: 'agriculture' },
    { label: '旅游发展', value: 'tourism' },
    { label: '教育文化', value: 'education' },
    { label: '其他', value: 'other' },
  ];
}

export default {
  getPostsPage, getPostById, deletePost, auditPost,
  setPostTop, setPostFeatured, getCommentsPage,
  getCommentsByPostId, deleteComment, auditComment,
  getForumOverview, getCategoryDistribution, getHotRanking,
  getMonthlyTrend, getAuditStatus, getCategoryName,
  getStatusName, getCategoryOptions,
};

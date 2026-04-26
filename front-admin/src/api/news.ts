import request from './request';
import type { PageResult, PageParams, NewsItem } from '../types';

/** 分页查询资讯列表 */
export function getNewsPage(params: PageParams) {
  return request.get<PageResult<NewsItem>>('/news/page', { params });
}

/** 获取资讯详情 */
export function getNewsById(id: number) {
  return request.get<NewsItem>(`/news/${id}`);
}

/** 创建资讯 */
export function createNews(data: Partial<NewsItem>) {
  return request.post<void>('/news', data);
}

/** 更新资讯 */
export function updateNews(id: number, data: Partial<NewsItem>) {
  return request.put<void>(`/news/${id}`, data);
}

/** 删除资讯 */
export function deleteNews(id: number) {
  return request.delete<void>(`/news/${id}`);
}

/** 发布资讯 */
export function publishNews(id: number) {
  return request.put<void>(`/news/${id}/publish`);
}

/** 下线资讯 */
export function unpublishNews(id: number) {
  return request.put<void>(`/news/${id}/unpublish`);
}

/** 获取资讯统计信息 */
export function getNewsStats() {
  return request.get<any>('/news/stats');
}

/** 从TianAPI同步农业新闻 */
export function syncTianApiNews(params: { category?: string; keyword?: string; num?: number; force?: boolean }) {
  return request.post<any>('/news/sync', null, { params });
}

/** 回填已有文章正文内容 */
export function backfillNewsContent() {
  return request.post<any>('/news/backfill');
}

/** 回填缺少的封面图 */
export function backfillCoverImages() {
  return request.post<any>('/news/backfill-covers');
}

/** 批量删除资讯 */
export function batchDeleteNews(ids: number[]) {
  return request.delete<void>('/news/batch', { data: ids });
}

/** 批量更新资讯状态 */
export function batchUpdateNewsStatus(ids: number[], status: number) {
  return request.put<void>('/news/batch/status', { ids, status });
}

export default {
  getNewsPage, getNewsById, createNews, updateNews,
  deleteNews, publishNews, unpublishNews, getNewsStats,
  syncTianApiNews, backfillNewsContent, backfillCoverImages,
  batchDeleteNews, batchUpdateNewsStatus,
};

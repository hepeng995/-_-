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

export default {
  getNewsPage, getNewsById, createNews, updateNews,
  deleteNews, publishNews, unpublishNews, getNewsStats,
};

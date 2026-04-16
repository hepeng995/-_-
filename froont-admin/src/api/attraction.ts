import request from './request';
import type { PageResult, PageParams, Attraction, AttractionCategory } from '../types';

/** 分页查询景点列表 */
export function getAttractionPage(params: PageParams) {
  return request.get<PageResult<Attraction>>('/attractions/page', { params });
}

/** 获取景点详情 */
export function getAttractionById(id: number) {
  return request.get<Attraction>(`/attractions/${id}`);
}

/** 创建景点 */
export function createAttraction(data: Partial<Attraction>) {
  return request.post<void>('/attractions', data);
}

/** 更新景点 */
export function updateAttraction(id: number, data: Partial<Attraction>) {
  return request.put<void>(`/attractions/${id}`, data);
}

/** 删除景点 */
export function deleteAttraction(id: number) {
  return request.delete<void>(`/attractions/${id}`);
}

/** 获取景点分类列表 */
export function getAttractionCategories() {
  return request.get<AttractionCategory[]>('/attractions/categories');
}

/** 创建景点分类 */
export function createAttractionCategory(data: Partial<AttractionCategory>) {
  return request.post<void>('/attractions/categories', data);
}

/** 更新景点分类 */
export function updateAttractionCategory(id: number, data: Partial<AttractionCategory>) {
  return request.put<void>(`/attractions/categories/${id}`, data);
}

/** 删除景点分类 */
export function deleteAttractionCategory(id: number) {
  return request.delete<void>(`/attractions/categories/${id}`);
}

export default {
  getAttractionPage, getAttractionById, createAttraction,
  updateAttraction, deleteAttraction, getAttractionCategories,
  createAttractionCategory, updateAttractionCategory, deleteAttractionCategory,
};

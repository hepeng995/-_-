/**
 * 旅游路线 API（管理后台）— 真实后端调用
 */
import request from './request';
import type { ApiResponse, TourRoute } from '../types';

export async function getRoutePage(params?: {
  current?: number;
  size?: number;
  keyword?: string;
  difficulty?: string;
  days?: number;
  status?: number;
}): Promise<ApiResponse<{ records: TourRoute[]; total: number }>> {
  return request.get('/tour-routes/page', {
    params: {
      pageNum: params?.current,
      pageSize: params?.size,
      keyword: params?.keyword,
      difficulty: params?.difficulty,
      days: params?.days,
      status: params?.status,
    },
  });
}

export async function getRouteById(id: number): Promise<ApiResponse<TourRoute>> {
  return request.get(`/tour-routes/${id}`);
}

export async function createRoute(data: Partial<TourRoute>): Promise<ApiResponse<TourRoute>> {
  return request.post('/tour-routes', data);
}

export async function updateRoute(id: number, data: Partial<TourRoute>): Promise<ApiResponse<TourRoute>> {
  return request.put(`/tour-routes/${id}`, data);
}

export async function deleteRoute(id: number): Promise<ApiResponse<null>> {
  return request.delete(`/tour-routes/${id}`);
}

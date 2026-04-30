import type { ApiResponse, Activity, ActivityRegistration } from '../types';
import request from './request';

export function getActivityPage(params?: { current?: number; size?: number; keyword?: string; category?: string; status?: string }): Promise<ApiResponse<{ records: Activity[]; total: number }>> {
  return request.get('/activities/page', {
    params: {
      pageNum: params?.current ?? 1,
      pageSize: params?.size ?? 10,
      keyword: params?.keyword || undefined,
      category: params?.category || undefined,
      status: params?.status || undefined,
    },
  });
}

export function createActivity(data: Partial<Activity>): Promise<ApiResponse<Activity>> {
  return request.post('/activities', data);
}

export function updateActivity(id: number, data: Partial<Activity>): Promise<ApiResponse<Activity>> {
  return request.put(`/activities/${id}`, data);
}

export function deleteActivity(id: number): Promise<ApiResponse<null>> {
  return request.delete(`/activities/${id}`);
}

export function getRegistrationPage(params?: { current?: number; size?: number; activityId?: number; status?: string }): Promise<ApiResponse<{ records: ActivityRegistration[]; total: number }>> {
  return request.get('/activities/registrations/page', {
    params: {
      pageNum: params?.current ?? 1,
      pageSize: params?.size ?? 10,
      activityId: params?.activityId,
      status: params?.status || undefined,
    },
  });
}

export function confirmRegistration(id: number): Promise<ApiResponse<null>> {
  return request.put(`/activities/registrations/${id}/confirm`);
}

export function cancelRegistration(id: number): Promise<ApiResponse<null>> {
  return request.put(`/activities/registrations/${id}/cancel`);
}

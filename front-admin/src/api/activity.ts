/**
 * 乡村活动 API（管理后台）
 */
import type { ApiResponse, Activity, ActivityRegistration } from '../types';
import { activities, registrations } from '../mock/activityData';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

let activityList = [...activities];
let registrationList = [...registrations];

export async function getActivityPage(params?: { current?: number; size?: number; keyword?: string; category?: string; status?: string }): Promise<ApiResponse<{ records: Activity[]; total: number }>> {
  await delay();
  let filtered = [...activityList];
  if (params?.keyword) {
    const kw = params.keyword.toLowerCase();
    filtered = filtered.filter(a => a.title.toLowerCase().includes(kw));
  }
  if (params?.category) filtered = filtered.filter(a => a.category === params.category);
  if (params?.status) filtered = filtered.filter(a => a.status === params.status);
  const current = params?.current ?? 1;
  const size = params?.size ?? 10;
  return { code: 200, message: 'success', data: { records: filtered.slice((current - 1) * size, current * size), total: filtered.length } };
}

export async function createActivity(data: Activity): Promise<ApiResponse<Activity>> {
  await delay(400);
  const newActivity = { ...data, id: Math.max(...activityList.map(a => a.id)) + 1 };
  activityList.push(newActivity);
  return { code: 200, message: '创建成功', data: newActivity };
}

export async function updateActivity(id: number, data: Partial<Activity>): Promise<ApiResponse<Activity | null>> {
  await delay(400);
  const idx = activityList.findIndex(a => a.id === id);
  if (idx === -1) return { code: 404, message: '不存在', data: null };
  activityList[idx] = { ...activityList[idx], ...data };
  return { code: 200, message: '更新成功', data: activityList[idx] };
}

export async function deleteActivity(id: number): Promise<ApiResponse<null>> {
  await delay(300);
  activityList = activityList.filter(a => a.id !== id);
  return { code: 200, message: '删除成功', data: null };
}

export async function getRegistrationPage(params?: { current?: number; size?: number; activityId?: number; status?: string }): Promise<ApiResponse<{ records: ActivityRegistration[]; total: number }>> {
  await delay();
  let filtered = [...registrationList];
  if (params?.activityId) filtered = filtered.filter(r => r.activityId === params.activityId);
  if (params?.status) filtered = filtered.filter(r => r.status === params.status);
  const current = params?.current ?? 1;
  const size = params?.size ?? 10;
  return { code: 200, message: 'success', data: { records: filtered.slice((current - 1) * size, current * size), total: filtered.length } };
}

export async function confirmRegistration(id: number): Promise<ApiResponse<null>> {
  await delay(300);
  const reg = registrationList.find(r => r.id === id);
  if (reg) reg.status = 'confirmed';
  return { code: 200, message: '确认成功', data: null };
}

export async function cancelRegistration(id: number): Promise<ApiResponse<null>> {
  await delay(300);
  const reg = registrationList.find(r => r.id === id);
  if (reg) reg.status = 'cancelled';
  return { code: 200, message: '取消成功', data: null };
}

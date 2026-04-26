import request from './request';
import type { PageResult, PageParams, SystemLog } from '../types';

/** 分页查询系统日志 */
export function getSystemLogPage(params: PageParams) {
  return request.get<PageResult<SystemLog>>('/system/logs/page', { params });
}

/** 获取系统日志详情 */
export function getSystemLogDetail(id: number) {
  return request.get<SystemLog>(`/system/logs/${id}`);
}

/** 删除系统日志 */
export function deleteSystemLog(id: number) {
  return request.delete<void>(`/system/logs/${id}`);
}

/** 批量删除系统日志 */
export function batchDeleteSystemLogs(ids: number[]) {
  return request.delete<void>('/system/logs/batch', { data: ids });
}

/** 清空系统日志 */
export function clearSystemLogs() {
  return request.delete<void>('/system/logs/clear');
}

/** 导出系统日志 */
export function exportSystemLogs(params?: Record<string, any>) {
  return request.get('/system/logs/export', { params, responseType: 'blob' });
}

/** 获取操作类型列表 */
export function getOperationTypes() {
  return request.get<string[]>('/system/logs/operation-types');
}

/** 获取模块列表 */
export function getModules() {
  return request.get<string[]>('/system/logs/modules');
}

/** 获取操作统计数据 */
export function getOperationStats(params?: Record<string, any>) {
  return request.get<any>('/system/logs/stats', { params });
}

export default {
  getSystemLogPage, getSystemLogDetail, deleteSystemLog,
  batchDeleteSystemLogs, clearSystemLogs, exportSystemLogs,
  getOperationTypes, getModules, getOperationStats,
};

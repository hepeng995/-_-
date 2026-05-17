/**
 * 农产品溯源 API（管理后台）
 * @description 对接后端真实接口
 */
import type { ApiResponse, TraceRecord, ProductBatch } from '../types';
import request from './request';

export async function getTracePage(params?: { current?: number; size?: number; productId?: number; batchNo?: string; stage?: string }): Promise<ApiResponse<{ records: TraceRecord[]; total: number }>> {
  const searchParams = new URLSearchParams();
  if (params?.current) searchParams.set('pageNum', String(params.current));
  if (params?.size) searchParams.set('pageSize', String(params.size));
  if (params?.productId) searchParams.set('productId', String(params.productId));
  if (params?.batchNo) searchParams.set('batchNo', params.batchNo);
  if (params?.stage) searchParams.set('stage', params.stage);
  const query = searchParams.toString();
  const url = query ? `/admin/trace?${query}` : '/admin/trace';

  const res = await request.get<any>(url);
  const page = res.data;
  return {
    code: res.code,
    message: res.message,
    data: {
      records: page?.records ?? [],
      total: page?.total ?? 0
    }
  };
}

export async function createTraceRecord(data: TraceRecord): Promise<ApiResponse<TraceRecord>> {
  return request.post('/admin/trace', data);
}

export async function updateTraceRecord(id: number, data: Partial<TraceRecord>): Promise<ApiResponse<TraceRecord | null>> {
  return request.put(`/admin/trace/${id}`, data);
}

export async function deleteTraceRecord(id: number): Promise<ApiResponse<null>> {
  return request.delete(`/admin/trace/${id}`);
}

export async function getBatches(): Promise<ApiResponse<ProductBatch[]>> {
  return request.get('/admin/trace/batches');
}

export async function createBatch(data: Partial<ProductBatch>): Promise<ApiResponse<ProductBatch>> {
  return request.post('/admin/trace/batches', data);
}

export async function updateBatch(id: number, data: Partial<ProductBatch>): Promise<ApiResponse<ProductBatch>> {
  return request.put(`/admin/trace/batches/${id}`, data);
}

export async function deleteBatch(id: number): Promise<ApiResponse<null>> {
  return request.delete(`/admin/trace/batches/${id}`);
}

export async function toggleBatchStatus(id: number, status?: number): Promise<ApiResponse<ProductBatch>> {
  const url = status !== undefined ? `/admin/trace/batches/${id}/status?status=${status}` : `/admin/trace/batches/${id}/status`;
  return request.put(url);
}

import request from './request';
import type { PageResult, PageParams, Order, OrderStats } from '../types';

/** 分页查询订单列表 */
export function getOrderPage(params: PageParams) {
  return request.get<PageResult<Order>>('/orders/page', { params });
}

/** 获取订单详情 */
export function getOrderById(id: number) {
  return request.get<Order>(`/orders/${id}`);
}

/** 更新订单状态 */
export function updateOrderStatus(id: number, orderStatus: number) {
  return request.put<void>(`/orders/${id}/status`, null, { params: { orderStatus } });
}

/** 取消订单 */
export function cancelOrder(id: number, cancelReason?: string) {
  return request.put<void>(`/orders/${id}/cancel`, null, { params: { cancelReason } });
}

/** 确认收货 */
export function confirmOrder(id: number) {
  return request.put<void>(`/orders/${id}/confirm`);
}

/** 删除订单 */
export function deleteOrder(id: number) {
  return request.delete<void>(`/orders/${id}`);
}

/** 订单退款（管理员） */
export function refundOrder(id: number, reason?: string) {
  return request.post<Order>(`/orders/${id}/refund`, { reason: reason || '' });
}

/** 订单发货（管理员） */
export function shipOrder(id: number, trackingInfo?: string) {
  return request.post<Order>(`/orders/${id}/ship`, { trackingInfo: trackingInfo || '' });
}

/** 获取订单统计 */
export function getOrderStats(params?: Record<string, any>) {
  return request.get<OrderStats>('/orders/stats', { params });
}

/** 批量更新订单状态 */
export function batchUpdateOrderStatus(ids: number[], orderStatus: number) {
  return request.put<void>('/orders/batch/status', { ids, orderStatus });
}

/** 批量取消订单 */
export function batchCancelOrders(ids: number[], cancelReason?: string) {
  return request.put<void>('/orders/batch/cancel', { ids, cancelReason: cancelReason || '管理员批量取消' });
}

export default {
  getOrderPage, getOrderById, updateOrderStatus,
  cancelOrder, confirmOrder, deleteOrder, getOrderStats,
  batchUpdateOrderStatus, batchCancelOrders,
  refundOrder, shipOrder,
};

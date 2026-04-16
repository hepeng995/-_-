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

/** 获取订单统计 */
export function getOrderStats(params?: Record<string, any>) {
  return request.get<OrderStats>('/orders/stats', { params });
}

export default {
  getOrderPage, getOrderById, updateOrderStatus,
  cancelOrder, confirmOrder, deleteOrder, getOrderStats,
};

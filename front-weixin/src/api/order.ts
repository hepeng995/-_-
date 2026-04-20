import { request } from '@/utils/request'
import type { Order, OrderItem, OrderPage } from '@/types/models'

export const orderApi = {
  getPage(params: {
    pageNum?: number
    pageSize?: number
    orderStatus?: number | null
  }) {
    return request<OrderPage>({
      url: '/orders/page',
      params,
      requiresAuth: true,
      mockKey: 'order.page',
      allowMockFallback: true,
      allowMockAuth: true,
    })
  },
  getById(id: number | string) {
    return request<Order>({
      url: `/orders/${id}`,
      requiresAuth: true,
      mockKey: 'order.byId',
      allowMockFallback: true,
      allowMockAuth: true,
    })
  },
  getByOrderNo(orderNo: string) {
    return request<Order>({
      url: `/orders/orderNo/${orderNo}`,
      requiresAuth: true,
      mockKey: 'order.byOrderNo',
      allowMockFallback: true,
      allowMockAuth: true,
    })
  },
  getProductForOrder(productId: number | string, params: { quantity?: number; specification?: string }) {
    return request<OrderItem>({
      url: `/orders/product/${productId}`,
      params,
      requiresAuth: true,
      mockKey: 'order.preview.product',
      allowMockFallback: true,
      allowMockAuth: true,
    })
  },
  getCartItemsForOrder(itemIds: number[]) {
    return request<OrderItem[]>({
      url: '/orders/cart-items',
      method: 'POST',
      data: { itemIds },
      requiresAuth: true,
      mockKey: 'order.preview.cart',
      allowMockFallback: true,
      allowMockAuth: true,
    })
  },
  create(data: Partial<Order>) {
    return request<Order>({
      url: '/orders',
      method: 'POST',
      data,
      requiresAuth: true,
      mockKey: 'order.create',
      allowMockFallback: true,
      allowMockAuth: true,
    })
  },
  createFromCart(data: {
    productIds: number[]
    deliveryAddress: string
    deliveryName: string
    deliveryPhone: string
    paymentMethod: string
    totalAmount: number
    actualAmount: number
    discountAmount?: number
    remark?: string
  }) {
    return request<Order>({
      url: '/orders/from-cart',
      method: 'POST',
      data,
      requiresAuth: true,
      mockKey: 'order.createFromCart',
      allowMockFallback: true,
      allowMockAuth: true,
    })
  },
  cancel(id: number | string, cancelReason?: string) {
    return request<Order>({
      url: `/orders/${id}/cancel`,
      method: 'PUT',
      params: { cancelReason },
      requiresAuth: true,
      mockKey: 'order.cancel',
      allowMockFallback: true,
      allowMockAuth: true,
    })
  },
  confirm(id: number | string) {
    return request<Order>({
      url: `/orders/${id}/confirm`,
      method: 'PUT',
      requiresAuth: true,
      mockKey: 'order.confirm',
      allowMockFallback: true,
      allowMockAuth: true,
    })
  },
  pay(orderNo: string, paymentMethod: string) {
    return request<boolean>({
      url: '/orders/pay',
      method: 'POST',
      data: { orderNo, paymentMethod },
      requiresAuth: true,
      mockKey: 'order.pay',
      allowMockFallback: true,
      allowMockAuth: true,
    })
  },
}

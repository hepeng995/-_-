import type { ShoppingCartItem } from '@/types/models'
import { request } from '@/utils/request'

export const cartApi = {
  getCount() {
    return request<number>({
      url: '/cart/count',
      requiresAuth: true,
      mockKey: 'cart.count',
      allowMockFallback: true,
      allowMockAuth: true,
    })
  },
  getItems() {
    return request<ShoppingCartItem[]>({
      url: '/cart',
      requiresAuth: true,
      mockKey: 'cart.items',
      allowMockFallback: true,
      allowMockAuth: true,
    })
  },
  add(productId: number, quantity = 1) {
    return request<ShoppingCartItem>({
      url: '/cart/add',
      method: 'POST',
      params: {
        productId,
        quantity,
      },
      requiresAuth: true,
      mockKey: 'cart.add',
      allowMockFallback: true,
      allowMockAuth: true,
    })
  },
  update(productId: number, quantity: number) {
    return request<ShoppingCartItem>({
      url: '/cart/update',
      method: 'PUT',
      params: {
        productId,
        quantity,
      },
      requiresAuth: true,
      mockKey: 'cart.update',
      allowMockFallback: true,
      allowMockAuth: true,
    })
  },
  remove(productIds: number[]) {
    return request<void>({
      url: '/cart/remove',
      method: 'DELETE',
      data: productIds,
      requiresAuth: true,
      mockKey: 'cart.remove',
      allowMockFallback: true,
      allowMockAuth: true,
    })
  },
  clear() {
    return request<void>({
      url: '/cart/clear',
      method: 'DELETE',
      requiresAuth: true,
      mockKey: 'cart.clear',
      allowMockFallback: true,
      allowMockAuth: true,
    })
  },
}

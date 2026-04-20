import { request } from '@/utils/request'
import type { Address } from '@/types/models'

export const addressApi = {
  getList() {
    return request<Address[]>({
      url: '/addresses',
      requiresAuth: true,
      mockKey: 'address.list',
      allowMockFallback: true,
      allowMockAuth: true,
    })
  },
  getById(id: number | string) {
    return request<Address>({
      url: `/addresses/${id}`,
      requiresAuth: true,
      mockKey: 'address.byId',
      allowMockFallback: true,
      allowMockAuth: true,
    })
  },
  create(data: Omit<Address, 'id'>) {
    return request<Address>({
      url: '/addresses',
      method: 'POST',
      data,
      requiresAuth: true,
      mockKey: 'address.create',
      allowMockFallback: true,
      allowMockAuth: true,
    })
  },
  update(id: number | string, data: Omit<Address, 'id'>) {
    return request<Address>({
      url: `/addresses/${id}`,
      method: 'PUT',
      data,
      requiresAuth: true,
      mockKey: 'address.update',
      allowMockFallback: true,
      allowMockAuth: true,
    })
  },
  remove(id: number | string) {
    return request<void>({
      url: `/addresses/${id}`,
      method: 'DELETE',
      requiresAuth: true,
      mockKey: 'address.delete',
      allowMockFallback: true,
      allowMockAuth: true,
    })
  },
  setDefault(id: number | string) {
    return request<void>({
      url: `/addresses/${id}/default`,
      method: 'PUT',
      requiresAuth: true,
      mockKey: 'address.default',
      allowMockFallback: true,
      allowMockAuth: true,
    })
  },
}

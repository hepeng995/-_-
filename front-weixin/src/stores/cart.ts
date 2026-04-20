import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { cartApi } from '@/api/cart'
import type { ShoppingCartItem } from '@/types/models'
import { toNumber } from '@/utils/format'

export const useCartStore = defineStore('cart', () => {
  const count = ref(0)
  const items = ref<ShoppingCartItem[]>([])
  const loading = ref(false)

  const totalAmount = computed(() => {
    return items.value.reduce((sum, item) => sum + toNumber(item.totalPrice ?? item.productPrice) * item.quantity, 0)
  })

  const syncBadge = () => {
    if (count.value > 0) {
      uni.setTabBarBadge({
        index: 2,
        text: `${Math.min(count.value, 99)}`,
      })
      return
    }

    uni.removeTabBarBadge({
      index: 2,
    })
  }

  const reset = () => {
    count.value = 0
    items.value = []
    syncBadge()
  }

  const fetchCount = async (silent = false) => {
    try {
      const response = await cartApi.getCount()
      if (response.code === 200) {
        count.value = toNumber(response.data)
        syncBadge()
      }
    } catch (error) {
      if (!silent) {
        throw error
      }
    }
  }

  const fetchItems = async () => {
    loading.value = true
    try {
      const response = await cartApi.getItems()
      if (response.code !== 200) {
        throw new Error(response.message || '获取购物车失败')
      }

      items.value = (response.data || []).map((item) => ({
        ...item,
        selected: item.selected ?? true,
      }))
      count.value = items.value.reduce((sum, item) => sum + item.quantity, 0)
      syncBadge()
      return items.value
    } finally {
      loading.value = false
    }
  }

  const addToCart = async (productId: number, quantity: number) => {
    const response = await cartApi.add(productId, quantity)
    if (response.code !== 200) {
      throw new Error(response.message || '加入购物车失败')
    }

    await fetchCount(true)
    return response.data
  }

  const updateQuantity = async (productId: number, quantity: number) => {
    const response = await cartApi.update(productId, quantity)
    if (response.code !== 200) {
      throw new Error(response.message || '更新数量失败')
    }

    await fetchItems()
    return response.data
  }

  const removeItems = async (productIds: number[]) => {
    const response = await cartApi.remove(productIds)
    if (response.code !== 200) {
      throw new Error(response.message || '删除失败')
    }

    await fetchItems()
  }

  const clearCart = async () => {
    const response = await cartApi.clear()
    if (response.code !== 200) {
      throw new Error(response.message || '清空购物车失败')
    }

    reset()
  }

  return {
    count,
    items,
    loading,
    totalAmount,
    syncBadge,
    reset,
    fetchCount,
    fetchItems,
    addToCart,
    updateQuantity,
    removeItems,
    clearCart,
  }
})

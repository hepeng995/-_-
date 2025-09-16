import { defineStore } from 'pinia'
import { ref } from 'vue'
import cartApi from '@/api/cart'

export const useCartStore = defineStore('cart', () => {
  const cartCount = ref(0)
  
  // 获取购物车数量
  const getCartCount = async () => {
    try {
      const res = await cartApi.getCartCount()
      if (res.code === 200) {
        cartCount.value = res.data
      }
    } catch (error) {
      console.error('获取购物车数量失败:', error)
    }
  }
  
  // 更新购物车数量（添加商品后增加）
  const updateCartCount = (count = 1) => {
    cartCount.value += count
  }
  
  // 减少购物车数量
  const decreaseCartCount = (count = 1) => {
    cartCount.value = Math.max(0, cartCount.value - count)
  }
  
  // 设置购物车数量
  const setCartCount = (count) => {
    cartCount.value = count >= 0 ? count : 0
  }
  
  return {
    cartCount,
    getCartCount,
    updateCartCount,
    decreaseCartCount,
    setCartCount
  }
})

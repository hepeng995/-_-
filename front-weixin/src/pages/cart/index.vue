<script setup lang="ts">
import { computed } from 'vue'
import { onPullDownRefresh, onShow } from '@dcloudio/uni-app'

import AiFloatingButton from '@/components/AiFloatingButton.vue'
import EmptyState from '@/components/EmptyState.vue'
import ListSkeleton from '@/components/ListSkeleton.vue'
import SectionBlock from '@/components/SectionBlock.vue'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { AI_FAB_OFFSET } from '@/utils/ai-fab'
import { formatPrice, toNumber } from '@/utils/format'
import { resolveImage } from '@/utils/assets'
import { goToLogin } from '@/utils/nav'

const authStore = useAuthStore()
const cartStore = useCartStore()

const selectedItems = computed(() => cartStore.items.filter((item) => item.selected !== false))
const selectedAmount = computed(() => {
  return selectedItems.value.reduce((sum, item) => {
    return sum + toNumber(item.totalPrice ?? item.productPrice) * item.quantity
  }, 0)
})

const bootstrap = async () => {
  if (!authStore.isLoggedIn) {
    cartStore.reset()
    uni.stopPullDownRefresh()
    return
  }

  try {
    await cartStore.fetchItems()
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : '购物车加载失败',
      icon: 'none',
    })
  } finally {
    uni.stopPullDownRefresh()
  }
}

const toggleItem = (productId: number) => {
  cartStore.items = cartStore.items.map((item) => {
    if (item.productId !== productId) return item
    return {
      ...item,
      selected: !(item.selected !== false),
    }
  })
}

const changeQuantity = async (productId: number, nextQuantity: number) => {
  if (nextQuantity < 1) return

  try {
    await cartStore.updateQuantity(productId, nextQuantity)
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : '更新数量失败',
      icon: 'none',
    })
  }
}

const removeItem = (productId: number) => {
  uni.showModal({
    title: '移出购物车',
    content: '确认删除这件商品吗？',
    success: async ({ confirm }) => {
      if (!confirm) return
      try {
        await cartStore.removeItems([productId])
      } catch (error) {
        uni.showToast({
          title: error instanceof Error ? error.message : '删除失败',
          icon: 'none',
        })
      }
    },
  })
}

const clearCart = () => {
  uni.showModal({
    title: '清空购物车',
    content: '确认清空全部商品吗？',
    success: async ({ confirm }) => {
      if (!confirm) return
      try {
        await cartStore.clearCart()
      } catch (error) {
        uni.showToast({
          title: error instanceof Error ? error.message : '清空失败',
          icon: 'none',
        })
      }
    },
  })
}

const goToShop = () => {
  uni.switchTab({
    url: '/pages/shop/index',
  })
}

const checkout = () => {
  if (!selectedItems.value.length) {
    uni.showToast({
      title: '请先勾选要结算的商品',
      icon: 'none',
    })
    return
  }

  const cartIds = selectedItems.value.map((item) => item.id).join(',')
  uni.navigateTo({
    url: `/pages-order/confirm?type=cart&cartIds=${cartIds}`,
  })
}

onShow(() => {
  bootstrap()
})

onPullDownRefresh(() => {
  bootstrap()
})
</script>

<template>
  <view class="page-shell safe-bottom">
    <view class="page-padding cart-page">
      <SectionBlock
        v-if="authStore.isLoggedIn"
        eyebrow="Cart"
        title="购物车"
        subtitle="这版先把加购、数量调整和删除打通，下单放在下一阶段。"
      >
        <template #action>
          <button v-if="cartStore.items.length" class="clear-btn" @tap="clearCart">清空</button>
        </template>

        <ListSkeleton v-if="cartStore.loading" mode="card" :rows="2" />
        <view v-else-if="cartStore.items.length" class="cart-list">
          <view v-for="item in cartStore.items" :key="item.id" class="cart-card glass-card">
            <button class="selector" :class="{ active: item.selected !== false }" @tap="toggleItem(item.productId)" />
            <image class="cover" :src="resolveImage(item.productImage, '/static/images/hero-product.jpg')" mode="aspectFill" />
            <view class="body">
              <text class="title text-ellipsis-2">{{ item.productName }}</text>
              <text class="meta text-ellipsis-1">{{ item.productUnit || '桃源好物' }} · 库存 {{ item.productStock || 0 }}</text>
              <text class="price">{{ formatPrice(item.productPrice) }}</text>
              <view class="actions">
                <view class="stepper">
                  <button class="step-btn" @tap="changeQuantity(item.productId, item.quantity - 1)">-</button>
                  <text class="qty">{{ item.quantity }}</text>
                  <button class="step-btn" @tap="changeQuantity(item.productId, item.quantity + 1)">+</button>
                </view>
                <button class="delete-btn" @tap="removeItem(item.productId)">删除</button>
              </view>
            </view>
          </view>
        </view>
        <EmptyState
          v-else
          title="购物车还是空的"
          description="先去桃源集挑几件喜欢的土产，再回来慢慢整理。"
          action-text="去逛桃源集"
          @action="goToShop"
        />
      </SectionBlock>

      <EmptyState
        v-else
        class="section-gap"
        title="登录后才能查看购物车"
        description="先用现有账号登录，购物车里的商品就能自动同步。"
        action-text="去登录"
        @action="goToLogin()"
      />
    </view>

    <view v-if="authStore.isLoggedIn && cartStore.items.length" class="bottom-bar glass-card">
      <view class="summary">
        <text class="summary-title">已选 {{ selectedItems.length }} 件</text>
        <text class="summary-price">{{ formatPrice(selectedAmount) }}</text>
      </view>
      <button class="checkout-btn" @tap="checkout">去结算</button>
    </view>

    <AiFloatingButton :bottom-offset="AI_FAB_OFFSET.elevated" />
  </view>
</template>

<style lang="scss" scoped>
.cart-page {
  padding-bottom: calc(env(safe-area-inset-bottom) + 170rpx);
}

.clear-btn {
  min-width: 92rpx;
  height: 52rpx;
  padding: 0 18rpx;
  border-radius: 999rpx;
  background: rgba(31, 106, 69, 0.08);
  color: $brand-green;
  font-size: 22rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.cart-card {
  padding: 18rpx;
  display: grid;
  grid-template-columns: 42rpx 180rpx minmax(0, 1fr);
  gap: 16rpx;
  align-items: center;
}

.selector {
  width: 34rpx;
  height: 34rpx;
  border-radius: 17rpx;
  border: 2rpx solid rgba(31, 106, 69, 0.22);
  background: transparent;
}

.selector.active {
  border-color: $brand-green;
  background: radial-gradient(circle at center, $brand-green 0 48%, transparent 50%);
}

.cover {
  width: 180rpx;
  height: 148rpx;
  border-radius: 20rpx;
}

.body {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.title {
  font-size: 28rpx;
  line-height: 1.45;
  font-weight: 700;
  color: $text-primary;
}

.meta {
  font-size: 22rpx;
  color: $text-muted;
}

.price {
  font-size: 30rpx;
  font-weight: 800;
  color: $brand-gold;
}

.actions {
  margin-top: 6rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14rpx;
}

.stepper {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.step-btn {
  width: 56rpx;
  height: 56rpx;
  border-radius: 18rpx;
  background: rgba(31, 106, 69, 0.08);
  color: $brand-green;
  font-size: 30rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qty {
  min-width: 40rpx;
  text-align: center;
  font-size: 26rpx;
  font-weight: 700;
  color: $text-primary;
}

.delete-btn {
  min-width: 96rpx;
  height: 52rpx;
  border-radius: 999rpx;
  background: rgba(184, 80, 66, 0.08);
  color: $brand-danger;
  font-size: 22rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bottom-bar {
  position: fixed;
  left: 28rpx;
  right: 28rpx;
  bottom: calc(env(safe-area-inset-bottom) + 22rpx);
  padding: 20rpx 22rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14rpx;
}

.summary {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.summary-title {
  font-size: 22rpx;
  color: $text-muted;
}

.summary-price {
  font-size: 34rpx;
  font-weight: 800;
  color: $brand-gold;
}

.checkout-btn {
  min-width: 240rpx;
  height: 76rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, $brand-green, $brand-green-soft);
  color: $text-inverse;
  font-size: 24rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media screen and (max-width: 420px) {
  .cart-card {
    grid-template-columns: 34rpx 1fr;
  }

  .cover {
    width: 100%;
    height: 220rpx;
    grid-column: 1 / -1;
  }

  .body {
    grid-column: 1 / -1;
  }

  .bottom-bar {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>

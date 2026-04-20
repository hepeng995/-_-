<script setup lang="ts">
import { onLaunch, onShow } from '@dcloudio/uni-app'

import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

const BOOTSTRAP_THROTTLE_MS = 12000

let bootstrapPromise: Promise<void> | null = null
let lastBootstrapAt = 0

const bootstrapSession = async (force = false) => {
  if (bootstrapPromise) {
    return bootstrapPromise
  }

  if (!force && Date.now() - lastBootstrapAt < BOOTSTRAP_THROTTLE_MS) {
    return
  }

  bootstrapPromise = (async () => {
    const authStore = useAuthStore()
    const cartStore = useCartStore()

    lastBootstrapAt = Date.now()
    authStore.restoreSession()

    if (!authStore.isLoggedIn) {
      cartStore.reset()
      return
    }

    await Promise.allSettled([
      authStore.fetchProfile(true),
      cartStore.fetchCount(true),
    ])
  })().finally(() => {
    bootstrapPromise = null
  })

  return bootstrapPromise
}

onLaunch(() => {
  bootstrapSession(true)
})

onShow(() => {
  bootstrapSession()
})
</script>

<style lang="scss">
@import './uni.scss';

page {
  background: $app-bg;
  color: $text-primary;
  font-size: 28rpx;
  line-height: 1.5;
}

view,
text,
button,
input,
textarea,
swiper,
scroll-view {
  box-sizing: border-box;
}

button {
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  line-height: 1;
}

button::after {
  border: 0;
}

.page-shell {
  min-height: 100vh;
  background:
    radial-gradient(circle at top right, rgba(214, 139, 42, 0.04), transparent 20%),
    linear-gradient(180deg, rgba(255, 250, 240, 0.97), #f7f3ea 22%, #f7f3ea 100%);
}

.page-padding {
  padding: 0 28rpx 40rpx;
}

.safe-bottom {
  padding-bottom: calc(env(safe-area-inset-bottom) + 24rpx);
}

.glass-card {
  background: rgba(255, 252, 246, 0.92);
  border: 1rpx solid rgba(31, 106, 69, 0.08);
  border-radius: 28rpx;
  box-shadow: 0 10rpx 24rpx rgba(31, 106, 69, 0.06);
}

.section-gap {
  margin-top: 28rpx;
}

.text-ellipsis-1 {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-ellipsis-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.text-ellipsis-3 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}
</style>

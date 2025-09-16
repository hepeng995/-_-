<template>
  <div class="app-container">
    <router-view />
  </div>
</template>

<script setup>
import { useUserStore } from '@/stores/user'
import { onMounted } from 'vue'

const userStore = useUserStore()

onMounted(() => {
  // 如果有token，则尝试获取用户信息
  if (userStore.token && !userStore.isLoggedIn) {
    userStore.getInfo().catch(() => {
      userStore.resetState()
    })
  }
})
</script>

<style>
.app-container {
  height: 100%;
  width: 100%;
}

html, body {
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  height: 100%;
}

/* 消除默认边距 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 链接样式 */
a {
  text-decoration: none;
}
</style> 
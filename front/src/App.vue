<template>
  <router-view />
</template>

<script setup>
import { useUserStore } from '@/stores/user'
import { onMounted } from 'vue'

const userStore = useUserStore()

onMounted(() => {
  if (userStore.token && !userStore.isLoggedIn) {
    userStore.getInfo().catch(() => {
      userStore.resetState()
    })
  }
})
</script>

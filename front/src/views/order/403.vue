<template>
  <div class="error-container">
    <div class="error-box">
      <div class="error-code">403</div>
      <div class="error-title">访问受限</div>
      <div class="error-message">抱歉，您没有权限访问此页面</div>
      <div class="error-actions">
        <el-button type="primary" @click="goHome">返回首页</el-button>
        <el-button @click="goBack">返回上一页</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();

// 根据用户角色返回相应的首页
const goHome = () => {
  const role = userStore.userRole;

  if (role === 'ADMIN') {
    router.push('/admin');
  } else {
    router.push('/home');
  }
};

// 返回上一页
const goBack = () => {
  router.go(-1);
};
</script>

<style scoped>
.error-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--color-bg-body);
}

.error-box {
  text-align: center;
  padding: 40px;
  background-color: var(--color-bg-surface);
  border-radius: 8px;
  box-shadow: var(--shadow-card);
  width: 90%;
  max-width: 500px;
}

.error-code {
  font-size: 120px;
  font-weight: bold;
  color: var(--color-warning);
  line-height: 1.2;
}

.error-title {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 20px;
  color: var(--color-text-primary);
}

.error-message {
  font-size: 16px;
  color: var(--color-text-secondary);
  margin-bottom: 30px;
}

.error-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
}
</style>
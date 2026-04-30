<template>
  <div class="error-container">
    <div class="error-box">
      <div class="error-code">404</div>
      <div class="error-title">页面不存在</div>
      <div class="error-message">抱歉，您访问的页面不存在或已被删除</div>
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
  min-height: var(--app-height);
  min-height: var(--app-dvh);
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--color-bg-body);
  padding: max(20px, var(--safe-area-top)) 16px max(20px, var(--safe-area-bottom));
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
  color: var(--color-danger);
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

@media (max-width: 767px) {
  .error-box {
    padding: 28px 20px;
  }

  .error-code {
    font-size: 84px;
  }

  .error-title {
    font-size: 24px;
    margin-bottom: 16px;
  }

  .error-message {
    font-size: 14px;
    margin-bottom: 24px;
  }

  .error-actions {
    flex-direction: column;
  }
}
</style>

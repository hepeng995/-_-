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
  } else if (role === 'STAFF') {
    router.push('/staff');
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
  background-color: #f5f7fa;
}

.error-box {
  text-align: center;
  padding: 40px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 500px;
}

.error-code {
  font-size: 120px;
  font-weight: bold;
  color: #e6a23c;
  line-height: 1.2;
}

.error-title {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #303133;
}

.error-message {
  font-size: 16px;
  color: #606266;
  margin-bottom: 30px;
}

.error-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
}
</style> 
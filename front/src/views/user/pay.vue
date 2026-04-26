<template>
  <div class="payment-page">
    <div class="container">
      <div class="page-header">
        <h1>订单支付</h1>
        <p>请选择支付方式完成支付</p>
      </div>
      
      <div class="payment-content" v-loading="loading">
        <div class="payment-info">
          <div class="order-info">
            <div class="order-no">
              <span class="label">订单号：</span>
              <span class="value">{{ orderNo }}</span>
            </div>
            <div class="order-amount">
              <span class="label">支付金额：</span>
              <span class="value price">￥{{ amount }}</span>
            </div>
          </div>
          
          <div class="payment-methods">
            <h2>支付方式</h2>
            <el-radio-group v-model="selectedPayment" class="payment-radio-group" @change="showQRCode = true">
              <div class="payment-options-container">
                <el-radio label="alipay" class="payment-option">
                  <div class="payment-option-info">
                    <el-icon class="payment-icon"><CreditCard /></el-icon>
                    <span>支付宝</span>
                  </div>
                </el-radio>
                <el-radio label="wechat" class="payment-option" style="margin-left:-25px">
                  <div class="payment-option-info">
                    <el-icon class="payment-icon"><Wallet /></el-icon>
                    <span>微信支付</span>
                  </div>
                </el-radio>
              </div>
            </el-radio-group>
          </div>
          
          <div class="payment-actions">
            <el-button type="primary" size="large" @click="handlePay" :loading="paying">
              确认支付
            </el-button>
            <el-button @click="goBack">返回订单</el-button>
          </div>
          
          <div class="payment-tips">
            <p>提示：本系统为演示系统，支付为模拟支付，不会产生真实交易。</p>
          </div>
        </div>
        
        <div class="payment-qr" v-if="showQRCode">
          <h3>{{ getPaymentMethodName }} 扫码支付</h3>
          <div class="qr-code">
            <el-image src="/images/qrcode-demo.png" alt="支付二维码" class="qr-image" />
          </div>
          <div class="qr-tips">
            <p>请使用{{ getPaymentMethodName }}扫描二维码完成支付</p>
            <p>支付金额: <span class="price">￥{{ amount }}</span></p>
          </div>
          <div class="mock-payment">
            <p>模拟支付结果：</p>
            <el-button type="success" @click="mockPaymentSuccess">支付成功</el-button>
            <el-button type="danger" @click="mockPaymentFailed">支付失败</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { CreditCard, Wallet, Money } from '@element-plus/icons-vue'
import orderApi from '@/api/order'
import { useCartStore } from '@/stores/cart'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

// 数据状态
const loading = ref(false)
const paying = ref(false)
const orderNo = ref('')
const amount = ref(0)
const selectedPayment = ref('')
const showQRCode = ref(true) // Show QR code on page load
const paymentTimer = ref(null)
const itemCount = ref(0) // 订单中的商品数量

// 计算属性
const getPaymentMethodName = computed(() => {
  switch (selectedPayment.value) {
    case 'alipay':
      return '支付宝'
    case 'wechat':
      return '微信'
    case 'bank':
      return '银行卡'
    default:
      return '支付宝'
  }
})

// 初始化数据
const initData = () => {
  const { orderNo: routeOrderNo, amount: routeAmount, paymentMethod, itemCount: routeItemCount } = route.query
  
  if (!routeOrderNo || !routeAmount) {
    ElMessage.error('订单信息不完整')
    router.push('/user/orders')
    return
  }
  
  orderNo.value = routeOrderNo
  amount.value = parseFloat(routeAmount)
  selectedPayment.value = paymentMethod || 'alipay'
  
  // 获取订单中的商品数量，用于支付成功后更新购物车数量
  if (routeItemCount) {
    itemCount.value = parseInt(routeItemCount)
  }
}

// 返回订单页面
const goBack = () => {
  router.push('/user/orders')
}

// 处理支付
const handlePay = async () => {
  if (!selectedPayment.value) {
    ElMessage.warning('请选择支付方式')
    return
  }
  
  try {
    await ElMessageBox.confirm(`确认使用${getPaymentMethodName.value}支付￥${amount.value}吗？`, '确认支付', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'info'
    })
    
    // 显示支付二维码
    showQRCode.value = true
    
    // 模拟支付倒计时
    startPaymentTimer()
    
  } catch (error) {
    if (error !== 'cancel') {
      console.error('支付失败:', error)
      ElMessage.error('支付失败')
    }
  }
}

// 开始支付倒计时
const startPaymentTimer = () => {
  // 清除可能存在的定时器
  if (paymentTimer.value) {
    clearTimeout(paymentTimer.value)
  }
  
  // 设置2分钟超时
  paymentTimer.value = setTimeout(() => {
    ElMessage.warning('支付超时，请重新发起支付')
    showQRCode.value = false
  }, 2 * 60 * 1000)
}

// 模拟支付成功
const mockPaymentSuccess = async () => {
  try {
    paying.value = true
    
    const res = await orderApi.payOrder(orderNo.value, {
      orderNo: orderNo.value,
      paymentMethod: selectedPayment.value
    })
    
    if (res.code === 200) {
      ElMessage.success('支付成功')
      
      // 清除支付定时器
      if (paymentTimer.value) {
        clearTimeout(paymentTimer.value)
        paymentTimer.value = null
      }
      
      // 更新顶部购物车数量（减少订单中的商品数量）
      if (itemCount.value > 0) {
        cartStore.decreaseCartCount(itemCount.value)
      } else {
        // 如果没有传递商品数量，则直接重新获取购物车数量
        cartStore.getCartCount()
      }
      
      // 跳转到订单详情页
      setTimeout(() => {
        router.push('/user/orders')
      }, 1500)
    } else {
      ElMessage.error(res.message || '支付失败')
    }
  } catch (error) {
    console.error('支付失败:', error)
    ElMessage.error('支付失败: ' + (error.message || '未知错误'))
  } finally {
    paying.value = false
  }
}

// 模拟支付失败
const mockPaymentFailed = () => {
  ElMessage.error('支付失败，请重新支付')
  showQRCode.value = false
  
  // 清除支付定时器
  if (paymentTimer.value) {
    clearTimeout(paymentTimer.value)
    paymentTimer.value = null
  }
}

// 组件挂载时
onMounted(() => {
  initData()
})

// 组件卸载前清除定时器
onBeforeUnmount(() => {
  if (paymentTimer.value) {
    clearTimeout(paymentTimer.value)
    paymentTimer.value = null
  }
})
</script>

<style scoped>
.payment-page {
  min-height: 100vh;
  background: var(--color-bg-body);
  padding: 40px 0;
}

.container {
  margin: 0 auto;
  padding: 0 20px;
}

/* 页面头部 */
.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 32px;
  color: var(--color-text-primary);
  margin-bottom: 8px;
  font-weight: 700;
}

.page-header p {
  font-size: 16px;
  color: var(--color-text-tertiary);
}

/* 支付内容 */
.payment-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  align-items: start;
}

.payment-info,
.payment-qr {
  background: var(--color-bg-surface);
  border-radius: var(--radius-lg);
  padding: 30px;
  box-shadow: var(--shadow-card);
}

/* 订单信息 */
.order-info {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--color-border);
}

.order-no,
.order-amount {
  margin-bottom: 10px;
  font-size: 16px;
}

.label {
  color: var(--color-text-tertiary);
  margin-right: 10px;
}

.value {
  color: var(--color-text-primary);
  font-weight: 500;
}

.price {
  color: var(--color-danger);
  font-weight: 600;
  font-size: 20px;
}

/* 支付方式 */
.payment-methods h2 {
  font-size: 18px;
  color: var(--color-text-primary);
  margin-bottom: 20px;
  font-weight: 600;
}

.payment-radio-group {
  width: 100%;
}

.payment-options-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.payment-option {
  display: flex;
  align-items: center;
  padding: 16px;
  margin-bottom: 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  width: 100%;
}

.payment-option-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: 12px;
}

.payment-icon {
  font-size: 20px;
  color: var(--color-info);
}

/* 支付操作 */
.payment-actions {
  margin-top: 30px;
  display: flex;
  gap: 16px;
}

.payment-tips {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--color-border);
  color: var(--color-text-tertiary);
  font-size: 14px;
}

/* 支付二维码 */
.payment-qr {
  text-align: center;
}

.payment-qr h3 {
  font-size: 18px;
  color: var(--color-text-primary);
  margin-bottom: 20px;
  font-weight: 600;
}

.qr-code {
  margin-bottom: 20px;
  padding: 20px;
  background: var(--color-bg-body);
  border-radius: 8px;
  display: inline-block;
}

.qr-image {
  width: 200px;
  height: 200px;
}

.qr-tips {
  margin-bottom: 30px;
  color: var(--color-text-tertiary);
}

.qr-tips .price {
  font-size: 18px;
}

.mock-payment {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid var(--color-border);
}

.mock-payment p {
  margin-bottom: 10px;
  color: var(--color-text-tertiary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .payment-content {
    grid-template-columns: 1fr;
  }

  .payment-qr {
    order: -1;
  }

  .payment-actions {
    flex-direction: column;
  }
}
</style>

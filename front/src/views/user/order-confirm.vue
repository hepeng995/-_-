<template>
  <div class="order-confirm">
    <div class="container">
      <div class="page-header">
        <h1>确认订单</h1>
        <p>请确认订单信息并选择支付方式</p>
      </div>

      <div class="confirm-content" v-loading="loading">
        <!-- 收货地址 -->
        <div class="address-section">
          <h2>收货地址</h2>
          <div v-if="selectedAddress" class="address-card selected">
            <div class="address-info">
              <div class="address-header">
                <span class="receiver-name">{{ selectedAddress.receiverName }}</span>
                <span class="receiver-phone">{{ selectedAddress.receiverPhone }}</span>
                <el-tag v-if="selectedAddress.isDefault" type="primary" size="small">默认</el-tag>
              </div>
              <div class="address-detail">
                {{ selectedAddress.province }} {{ selectedAddress.city }} {{ selectedAddress.district }} {{ selectedAddress.detailAddress }}
              </div>
            </div>
            <div class="address-actions">
              <el-button text @click="showAddressDialog = true">更换地址</el-button>
            </div>
          </div>
          <div v-else class="no-address">
            <el-empty description="暂无收货地址">
              <el-button type="primary" @click="showAddressDialog = true">添加地址</el-button>
            </el-empty>
          </div>
        </div>

        <!-- 商品信息 -->
        <div class="products-section">
          <h2>商品信息</h2>
          <div class="products-list">
            <div v-for="item in orderItems" :key="item.id" class="product-item">
              <div class="product-image">
                <img :src="item.productImage || '/images/default-product.jpg'" :alt="item.productName" />
              </div>
              <div class="product-info">
                <h3>{{ item.productName }}</h3>
                <div class="product-spec" v-if="item.specification">
                  规格：{{ item.specification }}
                </div>
                <div class="product-origin" v-if="item.productOrigin">
                  产地：{{ item.productOrigin }}
                </div>
              </div>
              <div class="product-price">
                <span class="price">￥{{ item.productPrice || item.price }}</span>
                <span class="quantity">×{{ item.quantity }}</span>
              </div>
              <div class="product-subtotal">
                ￥{{ ((item.productPrice || item.price) * item.quantity).toFixed(2) }}
              </div>
            </div>
          </div>
        </div>

        <!-- 配送方式 -->
        <div class="delivery-section">
          <h2>配送方式</h2>
          <el-radio-group v-model="selectedDelivery">
            <div class="delivery-options-container">
              <el-radio value="standard" class="delivery-option">
                <div class="delivery-info">
                  <div class="delivery-name">标准配送</div>
                  <div class="delivery-desc">预计3-5个工作日送达</div>
                </div>
                <div class="delivery-fee">免运费</div>
              </el-radio>
              <el-radio value="express" class="delivery-option">
                <div class="delivery-info">
                  <div class="delivery-name">快速配送</div>
                  <div class="delivery-desc">预计1-2个工作日送达</div>
                </div>
                <div class="delivery-fee">￥10.00</div>
              </el-radio>
            </div>
          </el-radio-group>
        </div>

        <!-- 支付方式 -->
        <div class="payment-section">
          <h2>支付方式</h2>
          <el-radio-group v-model="selectedPayment">
            <div class="payment-options-container">
              <el-radio value="alipay" class="payment-option">
                <div class="payment-info">
                  <el-icon class="payment-icon"><CreditCard /></el-icon>
                  <span>支付宝</span>
                </div>
              </el-radio>
              <el-radio value="wechat" class="payment-option">
                <div class="payment-info">
                  <el-icon class="payment-icon"><Wallet /></el-icon>
                  <span>微信支付</span>
                </div>
              </el-radio>
            </div>
          </el-radio-group>
        </div>

        <!-- 订单备注 -->
        <div class="remark-section">
          <h2>订单备注</h2>
          <el-input
            v-model="orderRemark"
            type="textarea"
            :rows="3"
            placeholder="选填，可以告诉我们您的特殊需求"
            maxlength="200"
            show-word-limit
          />
        </div>
      </div>

      <!-- 订单结算 -->
      <div class="order-summary">
        <div class="summary-card">
          <div class="summary-items">
            <div class="summary-item">
              <span>商品总价</span>
              <span>￥{{ totalPrice.toFixed(2) }}</span>
            </div>
            <div class="summary-item">
              <span>运费</span>
              <span>{{ deliveryFee > 0 ? `￥${deliveryFee.toFixed(2)}` : '免运费' }}</span>
            </div>
            <div class="summary-item discount" v-if="discountAmount > 0">
              <span>优惠金额</span>
              <span>-￥{{ discountAmount.toFixed(2) }}</span>
            </div>
          </div>
          <div class="summary-total">
            <span>实付款</span>
            <span class="total-amount">￥{{ finalAmount.toFixed(2) }}</span>
          </div>
          <el-button 
            type="primary" 
            size="large" 
            class="submit-btn"
            :disabled="!canSubmit"
            @click="submitOrder"
          >
            提交订单
          </el-button>
        </div>
      </div>

      <!-- 地址选择弹窗 -->
      <el-dialog 
        v-model="showAddressDialog" 
        title="选择收货地址" 
        width="600px"
        :before-close="handleAddressDialogClose"
      >
        <div class="address-list">
          <div 
            v-for="address in addresses"
            :key="address.id"
            class="address-item"
            :class="{ selected: selectedAddress?.id === address.id }"
            @click="selectAddress(address)"
          >
            <div class="address-info">
              <div class="address-header">
                <span class="receiver-name">{{ address.receiverName }}</span>
                <span class="receiver-phone">{{ address.receiverPhone }}</span>
                <el-tag v-if="address.isDefault" type="primary" size="small">默认</el-tag>
              </div>
              <div class="address-detail">
                {{ address.province }} {{ address.city }} {{ address.district }} {{ address.detailAddress }}
              </div>
            </div>
            <div class="address-radio">
              <el-radio :model-value="selectedAddress?.id === address.id" />
            </div>
          </div>
        </div>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="showAddressDialog = false">取消</el-button>
            <el-button type="primary" @click="showAddressDialog = false">确定</el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { CreditCard, Wallet, Money } from '@element-plus/icons-vue'
import orderApi from '@/api/order'
import addressApi from '@/api/address'

const route = useRoute()
const router = useRouter()

// 数据状态
const loading = ref(false)
const orderItems = ref([])
const addresses = ref([])
const selectedAddress = ref(null)
const selectedDelivery = ref('standard')
const selectedPayment = ref('alipay')
const orderRemark = ref('')
const showAddressDialog = ref(false)

// 费用计算
const discountAmount = ref(0)

// 计算属性
const totalPrice = computed(() => {
  return orderItems.value.reduce((total, item) => {
    const price = item.productPrice || item.price
    return total + (price * item.quantity)
  }, 0)
})

const deliveryFee = computed(() => {
  return selectedDelivery.value === 'express' ? 10 : 0
})

const finalAmount = computed(() => {
  return Math.max(totalPrice.value + deliveryFee.value - discountAmount.value, 0)
})

const canSubmit = computed(() => {
  return selectedAddress.value && orderItems.value.length > 0 && selectedPayment.value
})

// 获取订单商品信息
const getOrderItems = async () => {
  const { type, productId, quantity, specification, cartItems } = route.query
  
  try {
    loading.value = true
    if (type === 'buy_now' && productId) {
      // 立即购买
      const res = await orderApi.getProductForOrder(productId, {
        quantity: parseInt(quantity) || 1,
        specification
      })
      if (res.code === 200) {
        orderItems.value = [res.data]
      }
    } else if (type === 'cart' && cartItems) {
      // 购物车结算
      const itemIds = cartItems.split(',').map(id => parseInt(id))
      const res = await orderApi.getCartItemsForOrder(itemIds)
      if (res.code === 200) {
        orderItems.value = res.data
      }
    }
  } catch (error) {
    console.error('获取订单商品失败:', error)
    ElMessage.error('获取订单商品失败: ' + (error.message || '未知错误'))
    router.go(-1)
  } finally {
    loading.value = false
  }
}

// 获取收货地址
const getAddresses = async () => {
  try {
    const res = await addressApi.getUserAddresses()
    if (res.code === 200) {
      addresses.value = res.data
      // 选择默认地址
      const defaultAddress = addresses.value.find(addr => addr.isDefault)
      if (defaultAddress) {
        selectedAddress.value = defaultAddress
      } else if (addresses.value.length > 0) {
        selectedAddress.value = addresses.value[0]
      }
    }
  } catch (error) {
    console.error('获取收货地址失败:', error)
  }
}

// 选择地址
const selectAddress = (address) => {
  selectedAddress.value = address
}

// 关闭地址弹窗
const handleAddressDialogClose = () => {
  showAddressDialog.value = false
}

// 提交订单
const submitOrder = async () => {
  if (!canSubmit.value) {
    ElMessage.warning('请完善订单信息')
    return
  }

  try {
    await ElMessageBox.confirm('确认提交订单吗？', '提示', {
      confirmButtonText: '确认提交',
      cancelButtonText: '取消',
      type: 'info'
    })

    loading.value = true
    
    const { type, cartItems } = route.query
    let res
    
    if (type === 'cart' && cartItems) {
      // 从购物车创建订单
      const productIds = orderItems.value.map(item => item.productId)
      const orderData = {
        productIds: productIds,
        deliveryAddress: `${selectedAddress.value.province} ${selectedAddress.value.city} ${selectedAddress.value.district} ${selectedAddress.value.detailAddress}`,
        deliveryName: selectedAddress.value.receiverName,
        deliveryPhone: selectedAddress.value.receiverPhone,
        paymentMethod: selectedPayment.value,
        totalAmount: finalAmount.value,
        actualAmount: finalAmount.value,  // 添加实付金额字段
        discountAmount: discountAmount.value,
        remark: orderRemark.value
      }
      
      res = await orderApi.createOrderFromCart(orderData)
    } else {
      // 直接创建订单
      const orderData = {
        deliveryAddress: `${selectedAddress.value.province} ${selectedAddress.value.city} ${selectedAddress.value.district} ${selectedAddress.value.detailAddress}`,
        deliveryName: selectedAddress.value.receiverName,
        deliveryPhone: selectedAddress.value.receiverPhone,
        paymentMethod: selectedPayment.value,
        orderItems: orderItems.value.map(item => ({
          productId: item.productId || item.id,
          productName: item.productName,
          productImage: item.productImage,
          quantity: item.quantity,
          productPrice: item.productPrice || item.price,
          totalPrice: (item.productPrice || item.price) * item.quantity,
          productOrigin: item.productOrigin
        })),
        remark: orderRemark.value,
        totalAmount: finalAmount.value,
        actualAmount: finalAmount.value,  // 添加实付金额字段
        discountAmount: discountAmount.value
      }
      
      res = await orderApi.createOrder(orderData)
    }
    
    if (res.code === 200) {
      ElMessage.success('订单提交成功')
      
      // 跳转到支付页面
      router.push({
        path: '/user/pay',
        query: {
          orderNo: res.data.orderNo,
          amount: res.data.actualAmount,
          paymentMethod: selectedPayment.value,
          itemCount: getTotalQuantity() // 传递商品总数量
        }
      })
    } else {
      ElMessage.error(res.message || '提交订单失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('提交订单失败:', error)
      ElMessage.error('提交订单失败: ' + (error.message || '未知错误'))
    }
  } finally {
    loading.value = false
  }
}

// 计算商品总数量
const getTotalQuantity = () => {
  return orderItems.value.reduce((total, item) => total + item.quantity, 0)
}

// 初始化
onMounted(() => {
  getOrderItems()
  getAddresses()
})
</script>

<style scoped>
.order-confirm {
  min-height: 100vh;
  background: #f8fafc;
  padding: 40px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  align-items: start;
}

/* 页面头部 */
.page-header {
  grid-column: 1 / -1;
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 32px;
  color: #1e293b;
  margin-bottom: 8px;
  font-weight: 700;
}

.page-header p {
  font-size: 16px;
  color: #64748b;
}

/* 确认内容 */
.confirm-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 通用section样式 */
.address-section,
.products-section,
.delivery-section,
.payment-section,
.remark-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}

.address-section h2,
.products-section h2,
.delivery-section h2,
.payment-section h2,
.remark-section h2 {
  font-size: 18px;
  color: #1e293b;
  margin-bottom: 20px;
  font-weight: 600;
}

/* 收货地址 */
.address-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.address-card.selected {
  border-color: #3b82f6;
  background: #eff6ff;
}

.address-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.receiver-name {
  font-weight: 600;
  color: #1e293b;
}

.receiver-phone {
  color: #64748b;
}

.address-detail {
  color: #4b5563;
  line-height: 1.5;
}

.no-address {
  text-align: center;
  padding: 40px 20px;
}

/* 商品信息 */
.products-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.product-item {
  display: grid;
  grid-template-columns: 80px 1fr auto auto;
  gap: 16px;
  align-items: center;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: 6px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info h3 {
  font-size: 16px;
  color: #1e293b;
  margin-bottom: 8px;
  font-weight: 600;
}

.product-spec,
.product-origin {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 4px;
}

.product-price {
  text-align: right;
}

.price {
  font-size: 16px;
  color: #e74c3c;
  font-weight: 600;
  display: block;
}

.quantity {
  font-size: 14px;
  color: #64748b;
}

.product-subtotal {
  font-size: 18px;
  color: #e74c3c;
  font-weight: 600;
}

/* 配送方式 */
.delivery-options-container {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.delivery-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 40px;
  margin-bottom: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  
}

.el-radio-group {
  width: 100%;
}

.delivery-info {
  flex: 1;
  margin-left: 12px;
}

.delivery-name {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
}

.delivery-desc {
  font-size: 14px;
  color: #64748b;
  margin:5px 0;
}

.delivery-fee {
  font-weight: 600;
  color: #e74c3c;
  margin-left:12px;
}

/* 支付方式 */
.payment-options-container {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.payment-option {
  display: flex;
  align-items: center;
  padding: 16px;
  margin-bottom: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  width: 100%;
}

.payment-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: 12px;
}

.payment-icon {
  font-size: 20px;
  color: #3b82f6;
}

/* 订单结算 */
.order-summary {
  position: sticky;
  top: 100px;
}

.summary-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}

.summary-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #4b5563;
}

.summary-item.discount {
  color: #10b981;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  margin-bottom: 24px;
  border-top: 2px solid #e2e8f0;
  font-size: 18px;
  font-weight: 600;
}

.total-amount {
  color: #e74c3c;
  font-size: 24px;
}

.submit-btn {
  width: 100%;
  height: 50px;
  font-size: 16px;
  font-weight: 600;
}

/* 地址弹窗 */
.address-list {
  max-height: 400px;
  overflow-y: auto;
}

.address-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  margin-bottom: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.address-item:hover {
  border-color: #3b82f6;
}

.address-item.selected {
  border-color: #3b82f6;
  background: #eff6ff;
}

/* 响应式设计 */
@media (max-width: 968px) {
  .container {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .order-summary {
    position: static;
  }
}

@media (max-width: 768px) {
  .page-header h1 {
    font-size: 24px;
  }
  
  .product-item {
    grid-template-columns: 60px 1fr;
    gap: 12px;
  }
  
  .product-price,
  .product-subtotal {
    grid-column: 1 / -1;
    text-align: left;
    margin-top: 8px;
  }
  
  .delivery-option,
  .payment-option {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .address-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>

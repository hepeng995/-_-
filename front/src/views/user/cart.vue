<template>
  <div class="shopping-cart">
    <div class="container">
      <div class="page-header">
        <h1>购物车</h1>
        <p>{{ cartItems.length }}件商品</p>
      </div>

      <div class="cart-content" v-loading="loading">
        <!-- 购物车商品列表 -->
        <div v-if="cartItems.length > 0" class="cart-main">
          <div class="cart-list">
            <!-- 全选控制 -->
            <div class="select-all">
              <el-checkbox 
                v-model="selectAll" 
                @change="handleSelectAll"
                :indeterminate="isIndeterminate"
              >
                全选
              </el-checkbox>
              <span class="selected-count">已选择{{ selectedItems.length }}件商品</span>
              <el-button 
                type="danger" 
                text 
                @click="deleteSelected"
                :disabled="selectedItems.length === 0"
              >
                删除选中
              </el-button>
            </div>

            <!-- 购物车商品项 -->
            <div class="cart-items">
              <div 
                v-for="item in cartItems" 
                :key="item.id"
                class="cart-item"
                :class="{ selected: selectedItemIds.includes(item.id) }"
              >
                <div class="item-select">
                  <el-checkbox 
                    :model-value="selectedItemIds.includes(item.id)"
                    @change="(checked) => handleItemSelect(item.id, checked)"
                  />
                </div>
                
                <div class="item-image">
                  <img :src="item.productImage || '/images/default-product.jpg'" :alt="item.productName" />
                </div>
                
                <div class="item-info">
                  <h3 class="item-name">{{ item.productName }}</h3>
                  <div class="item-spec" v-if="item.specification">
                    规格：{{ item.specification }}
                  </div>
                  <div class="item-origin" v-if="item.productOrigin">
                    产地：{{ item.productOrigin }}
                  </div>
                </div>
                
                <div class="item-price">
                  <span class="current-price">￥{{ item.productPrice }}</span>
                  <span v-if="item.originalPrice" class="original-price">￥{{ item.originalPrice }}</span>
                </div>
                
                <div class="item-quantity">
                  <el-input-number
                    v-model="item.quantity"
                    :min="1"
                    :max="item.productStock"
                    size="small"
                    @change="(value) => updateQuantity(item.id, value)"
                  />
                  <div class="stock-info">库存{{ item.productStock }}件</div>
                </div>
                
                <div class="item-subtotal">
                  ￥{{ item.totalPrice ? item.totalPrice.toFixed(2) : (item.productPrice * item.quantity).toFixed(2) }}
                </div>
                
                <div class="item-actions">
                  <el-button 
                    type="danger" 
                    text 
                    size="small"
                    @click="deleteItem(item.id)"
                  >
                    删除
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <!-- 购物车结算 -->
          <div class="cart-summary">
            <div class="summary-card">
              <h3>订单摘要</h3>
              <div class="summary-items">
                <div class="summary-item">
                  <span>商品件数</span>
                  <span>{{ selectedItems.length }}件</span>
                </div>
                <div class="summary-item">
                  <span>商品总价</span>
                  <span>￥{{ totalPrice.toFixed(2) }}</span>
                </div>
                <div class="summary-item discount" v-if="discountAmount > 0">
                  <span>优惠金额</span>
                  <span>-￥{{ discountAmount.toFixed(2) }}</span>
                </div>
                <div class="summary-item shipping">
                  <span>运费</span>
                  <span>{{ shippingFee > 0 ? `￥${shippingFee.toFixed(2)}` : '免运费' }}</span>
                </div>
              </div>
              <div class="summary-total">
                <span>实付款</span>
                <span class="total-amount">￥{{ finalAmount.toFixed(2) }}</span>
              </div>
              <el-button 
                type="primary" 
                size="large" 
                class="checkout-btn"
                :disabled="selectedItems.length === 0"
                @click="checkout"
              >
                去结算({{ selectedItems.length }})
              </el-button>
            </div>
          </div>
        </div>

        <!-- 空购物车状态 -->
        <div v-else class="empty-cart">
          <el-empty description="购物车是空的">
            <el-button type="primary" @click="goToProducts">去购物</el-button>
          </el-empty>
        </div>
      </div>

      <!-- 推荐商品 -->
      <div class="recommended-products" v-if="recommendedProducts.length > 0">
        <h2>为你推荐</h2>
        <div class="products-grid">
          <div 
            v-for="product in recommendedProducts"
            :key="product.id"
            class="product-card"
            @click="goToProduct(product.id)"
          >
            <div class="product-image">
              <img :src="product.coverImage || '/images/default-product.jpg'" :alt="product.name" />
            </div>
            <div class="product-info">
              <h4>{{ product.name }}</h4>
              <div class="product-price">￥{{ product.price }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import cartApi from '@/api/cart'
import productApi from '@/api/product'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const cartStore = useCartStore()

// 数据状态
const loading = ref(false)
const cartItems = ref([])
const selectedItemIds = ref([])
const recommendedProducts = ref([])

// 运费和折扣设置
const shippingFee = ref(0) // 免运费
const discountAmount = ref(0) // 优惠金额

// 计算属性
const selectedItems = computed(() => {
  return cartItems.value.filter(item => selectedItemIds.value.includes(item.id))
})

const totalPrice = computed(() => {
  return selectedItems.value.reduce((total, item) => {
    // 使用后端提供的totalPrice或自己计算
    if (item.totalPrice) {
      return total + parseFloat(item.totalPrice)
    } else {
      return total + (parseFloat(item.productPrice || 0) * item.quantity)
    }
  }, 0)
})

const finalAmount = computed(() => {
  return Math.max(totalPrice.value - discountAmount.value + shippingFee.value, 0)
})

const selectAll = computed({
  get() {
    return cartItems.value.length > 0 && selectedItemIds.value.length === cartItems.value.length
  },
  set(value) {
    if (value) {
      selectedItemIds.value = cartItems.value.map(item => item.id)
    } else {
      selectedItemIds.value = []
    }
  }
})

const isIndeterminate = computed(() => {
  const selectedCount = selectedItemIds.value.length
  return selectedCount > 0 && selectedCount < cartItems.value.length
})

// 获取购物车列表
const getCartItems = async () => {
  loading.value = true
  try {
    const res = await cartApi.getCartItems()
    if (res.code === 200) {
      cartItems.value = res.data
      // 默认全选
      selectedItemIds.value = cartItems.value.map(item => item.id)
    }
  } catch (error) {
    console.error('获取购物车失败:', error)
    ElMessage.error('获取购物车失败')
  } finally {
    loading.value = false
  }
}

// 获取推荐商品
const getRecommendedProducts = async () => {
  try {
    const res = await productApi.getRecommendProducts(6)
    if (res.code === 200) {
      recommendedProducts.value = res.data
    }
  } catch (error) {
    console.error('获取推荐商品失败:', error)
  }
}

// 全选处理
const handleSelectAll = (checked) => {
  if (checked) {
    selectedItemIds.value = cartItems.value.map(item => item.id)
  } else {
    selectedItemIds.value = []
  }
}

// 单项选择处理
const handleItemSelect = (itemId, checked) => {
  if (checked) {
    if (!selectedItemIds.value.includes(itemId)) {
      selectedItemIds.value.push(itemId)
    }
  } else {
    const index = selectedItemIds.value.indexOf(itemId)
    if (index > -1) {
      selectedItemIds.value.splice(index, 1)
    }
  }
}

// 更新商品数量
const updateQuantity = async (itemId, quantity) => {
  if (quantity < 1) return
  
  try {
    // 找到对应的购物车项
    const item = cartItems.value.find(item => item.id === itemId)
    if (!item) {
      ElMessage.error('商品不存在')
      return
    }
    
    // 计算数量变化
    const quantityChange = quantity - item.quantity
    
    // 使用productId而不是购物车项ID
    const res = await cartApi.updateCartItem(item.productId, quantity)
    if (res.code === 200) {
      // 更新本地数据
      const oldQuantity = item.quantity
      item.quantity = quantity
      // 更新小计金额
      if (item.productPrice) {
        item.totalPrice = parseFloat(item.productPrice) * quantity
      }
      
      // 更新顶部购物车数量
      if (quantityChange > 0) {
        // 数量增加
        cartStore.updateCartCount(quantityChange)
      } else if (quantityChange < 0) {
        // 数量减少
        cartStore.decreaseCartCount(Math.abs(quantityChange))
      }
    } else {
      ElMessage.error(res.message || '更新数量失败')
      // 恢复原数量
      getCartItems()
    }
  } catch (error) {
    console.error('更新数量失败:', error)
    ElMessage.error('更新数量失败')
    getCartItems()
  }
}

// 删除单个商品
const deleteItem = async (itemId) => {
  try {
    await ElMessageBox.confirm('确认删除该商品吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 找到对应的购物车项
    const item = cartItems.value.find(item => item.id === itemId)
    if (!item) {
      ElMessage.error('商品不存在')
      return
    }
    
    // 使用productId而不是购物车项ID
    const res = await cartApi.deleteCartItem([item.productId])
    if (res.code === 200) {
      ElMessage.success('删除成功')
      
      // 更新顶部购物车数量（减少被删除商品的数量）
      cartStore.decreaseCartCount(item.quantity)
      
      // 从本地数据中移除
      cartItems.value = cartItems.value.filter(item => item.id !== itemId)
      // 从选中列表中移除
      const index = selectedItemIds.value.indexOf(itemId)
      if (index > -1) {
        selectedItemIds.value.splice(index, 1)
      }
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除商品失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 删除选中商品
const deleteSelected = async () => {
  if (selectedItemIds.value.length === 0) return
  
  try {
    await ElMessageBox.confirm(`确认删除选中的${selectedItemIds.value.length}件商品吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 获取选中项的productId列表
    const selectedProductIds = selectedItems.value.map(item => item.productId)
    
    // 计算要删除的商品总数量
    const totalQuantity = selectedItems.value.reduce((sum, item) => sum + item.quantity, 0)
    
    const res = await cartApi.batchDeleteCartItems(selectedProductIds)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      
      // 更新顶部购物车数量（减少被删除商品的总数量）
      cartStore.decreaseCartCount(totalQuantity)
      
      // 从本地数据中移除
      cartItems.value = cartItems.value.filter(item => !selectedItemIds.value.includes(item.id))
      selectedItemIds.value = []
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 去结算
const checkout = () => {
  if (selectedItems.value.length === 0) {
    ElMessage.warning('请选择要结算的商品')
    return
  }
  
  // 跳转到订单确认页面
  router.push({
    path: '/order/confirm',
    query: {
      cartItems: selectedItemIds.value.join(','),
      type: 'cart'
    }
  })
}

// 跳转到商品页面
const goToProducts = () => {
  router.push('/products')
}

// 跳转到商品详情
const goToProduct = (id) => {
  router.push(`/products/${id}`)
}

// 初始化
onMounted(() => {
  getCartItems()
  getRecommendedProducts()
})
</script>

<style scoped>
.shopping-cart {
  min-height: 100vh;
  background: #f8fafc;
  padding: 40px 0;
}

.container {
  max-width: 1200px;
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
  color: #1e293b;
  margin-bottom: 8px;
  font-weight: 700;
}

.page-header p {
  font-size: 16px;
  color: #64748b;
}

/* 购物车主要内容 */
.cart-main {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  align-items: start;
}

/* 购物车列表 */
.cart-list {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}

.select-all {
  display: flex;
  align-items: center;
  gap: 20px;
  padding-bottom: 20px;
  margin-bottom: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.selected-count {
  color: #64748b;
  font-size: 14px;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cart-item {
  display: grid;
  grid-template-columns: auto 100px 1fr auto auto auto auto;
  gap: 16px;
  align-items: center;
  padding: 20px;
  border: 2px solid transparent;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.cart-item:hover {
  background: #f8fafc;
}

.cart-item.selected {
  border-color: #3b82f6;
  background: #eff6ff;
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  min-width: 0;
}

.item-name {
  font-size: 16px;
  color: #1e293b;
  margin-bottom: 8px;
  font-weight: 600;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-spec,
.item-origin {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 4px;
}

.item-price {
  text-align: right;
}

.current-price {
  font-size: 16px;
  color: #e74c3c;
  font-weight: 600;
  display: block;
}

.original-price {
  font-size: 14px;
  color: #94a3b8;
  text-decoration: line-through;
}

.item-quantity {
  text-align: center;
}

.stock-info {
  font-size: 12px;
  color: #64748b;
  margin-top: 4px;
}

.item-subtotal {
  font-size: 18px;
  color: #e74c3c;
  font-weight: 600;
  text-align: right;
}

.item-actions {
  text-align: center;
}

/* 购物车结算 */
.cart-summary {
  position: sticky;
  top: 100px;
}

.summary-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}

.summary-card h3 {
  font-size: 20px;
  color: #1e293b;
  margin-bottom: 20px;
  font-weight: 600;
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

.summary-item.shipping {
  color: #64748b;
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

.checkout-btn {
  width: 100%;
  height: 50px;
  font-size: 16px;
  font-weight: 600;
}

/* 空购物车 */
.empty-cart {
  text-align: center;
  padding: 80px 20px;
}

/* 推荐商品 */
.recommended-products {
  margin-top: 60px;
}

.recommended-products h2 {
  font-size: 24px;
  color: #1e293b;
  margin-bottom: 24px;
  font-weight: 600;
  text-align: center;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
}

.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
}

.product-image {
  height: 140px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  padding: 16px;
}

.product-info h4 {
  font-size: 14px;
  color: #1e293b;
  margin-bottom: 8px;
  font-weight: 600;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-price {
  font-size: 16px;
  color: #e74c3c;
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 968px) {
  .cart-main {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .cart-summary {
    position: static;
  }
}

@media (max-width: 768px) {
  .page-header h1 {
    font-size: 24px;
  }
  
  .cart-item {
    grid-template-columns: auto 60px 1fr;
    gap: 12px;
  }
  
  .item-price,
  .item-quantity,
  .item-subtotal,
  .item-actions {
    grid-column: 1 / -1;
    text-align: left;
    margin-top: 12px;
  }
  
  .select-all {
    flex-wrap: wrap;
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>

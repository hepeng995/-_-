<template>
  <div class="user-orders">
    <div class="container">
      <div class="page-header">
        <h1>我的订单</h1>
        <p>查看和管理您的所有订单</p>
      </div>

      <!-- 订单状态筛选 -->
      <div class="order-tabs">
        <div class="tabs-wrapper">
          <div 
            class="tab-item"
            :class="{ active: activeTab === 'all' }"
            @click="selectTab('all')"
          >
            全部订单
          </div>
          <div 
            class="tab-item"
            :class="{ active: activeTab === 'pending' }"
            @click="selectTab('pending')"
          >
            待付款
          </div>
          <div 
            class="tab-item"
            :class="{ active: activeTab === 'paid' }"
            @click="selectTab('paid')"
          >
            待发货
          </div>
          <div 
            class="tab-item"
            :class="{ active: activeTab === 'shipped' }"
            @click="selectTab('shipped')"
          >
            待收货
          </div>
          <div 
            class="tab-item"
            :class="{ active: activeTab === 'completed' }"
            @click="selectTab('completed')"
          >
            已完成
          </div>
          <div 
            class="tab-item"
            :class="{ active: activeTab === 'cancelled' }"
            @click="selectTab('cancelled')"
          >
            已取消
          </div>
        </div>
      </div>

      <!-- 订单列表 -->
      <div class="orders-content" v-loading="loading">
        <div v-if="orders.length > 0" class="orders-list">
          <div v-for="order in orders" :key="order.id" class="order-card">
            <!-- 订单头部 -->
            <div class="order-header">
              <div class="order-info">
                <span class="order-number">订单号：{{ order.orderNo }}</span>
                <span class="order-date">{{ formatDate(order.createdAt) }}</span>
              </div>
              <div class="order-status">
                <el-tag :type="getStatusType(order.orderStatus)">
                  {{ getStatusText(order.orderStatus) }}
                </el-tag>
              </div>
            </div>

            <!-- 订单商品 -->
            <div class="order-items">
              <div 
                v-for="item in order.orderItems" 
                :key="item.id"
                class="order-item"
              >
                <div class="item-image">
                  <img :src="item.productImage || '/images/default-product.jpg'" :alt="item.productName" />
                </div>
                <div class="item-info">
                  <h4 class="item-name">{{ item.productName }}</h4>
                  <div class="item-spec" v-if="item.specification">
                    规格：{{ item.specification }}
                  </div>
                  <div class="item-meta">
                    <span class="item-price">￥{{ item.productPrice }}</span>
                    <span class="item-quantity">×{{ item.quantity }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 订单总计 -->
            <div class="order-total">
              <div class="total-info">
                <span>共{{ getTotalQuantity(order.orderItems) }}件商品</span>
                <span class="total-amount">实付款：￥{{ order.actualAmount || order.totalAmount }}</span>
              </div>
            </div>

            <!-- 订单操作 -->
            <div class="order-actions">
              <el-button 
                v-if="order.orderStatus === 1"
                type="primary"
                size="small"
                @click="payOrder(order)"
              >
                立即付款
              </el-button>
              <el-button 
                v-if="order.orderStatus === 1"
                size="small"
                @click="cancelOrder(order)"
              >
                取消订单
              </el-button>
              <el-button 
                v-if="order.orderStatus === 3"
                type="primary"
                size="small"
                @click="confirmOrder(order)"
              >
                确认收货
              </el-button>
              <el-button 
                v-if="order.orderStatus === 4"
                size="small"
                @click="reviewOrder(order)"
              >
                评价订单
              </el-button>
              <el-button 
                size="small"
                @click="viewOrderDetail(order)"
              >
                查看详情
              </el-button>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else-if="!loading" class="empty-state">
          <el-empty :description="getEmptyText()">
            <el-button type="primary" @click="goToProducts">去购物</el-button>
          </el-empty>
        </div>

        <!-- 分页 -->
        <div class="pagination-wrapper" v-if="total > 0">
          <el-pagination
            :current-page="searchParams.pageNum"
            :page-size="searchParams.pageSize"
            :page-sizes="[10, 20, 30, 50]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>
    
    <!-- 订单详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="订单详情" width="800px">
      <div v-if="currentOrder" class="order-detail">
        <!-- 订单基本信息 -->
        <el-card class="order-info-card">
          <template #header>
            <span>订单信息</span>
          </template>
          <el-row :gutter="20">
            <el-col :span="12">
              <p><strong>订单号：</strong>{{ currentOrder.orderNo }}</p>
              <p><strong>下单时间：</strong>{{ formatDate(currentOrder.createdAt) }}</p>
              <p><strong>订单状态：</strong>
                <el-tag :type="getStatusType(currentOrder.orderStatus)">
                  {{ getStatusText(currentOrder.orderStatus) }}
                </el-tag>
              </p>
              <p><strong>支付状态：</strong>
                <el-tag :type="currentOrder.paymentStatus === 1 ? 'success' : 'warning'">
                  {{ currentOrder.paymentStatus === 1 ? '已支付' : '待支付' }}
                </el-tag>
              </p>
            </el-col>
            <el-col :span="12">
              <p><strong>收货人：</strong>{{ currentOrder.deliveryName }}</p>
              <p><strong>收货电话：</strong>{{ currentOrder.deliveryPhone }}</p>
              <p><strong>收货地址：</strong>{{ currentOrder.deliveryAddress }}</p>
              <p v-if="currentOrder.remark"><strong>订单备注：</strong>{{ currentOrder.remark }}</p>
            </el-col>
          </el-row>
        </el-card>

        <!-- 商品信息 -->
        <el-card class="order-items-card">
          <template #header>
            <span>商品信息</span>
          </template>
          <el-table :data="currentOrder.orderItems" border>
            <el-table-column prop="productImage" label="商品图片" width="100">
              <template #default="scope">
                <el-image
                  v-if="scope.row.productImage"
                  :src="scope.row.productImage"
                  style="width: 60px; height: 45px"
                  fit="cover"
                />
              </template>
            </el-table-column>
            <el-table-column prop="productName" label="商品名称" />
            <el-table-column prop="productPrice" label="单价" width="100">
              <template #default="scope">
                ￥{{ scope.row.productPrice }}
              </template>
            </el-table-column>
            <el-table-column prop="quantity" label="数量" width="80" />
            <el-table-column prop="totalPrice" label="小计" width="100">
              <template #default="scope">
                <span class="amount">￥{{ scope.row.totalPrice }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <!-- 金额信息 -->
        <el-card class="order-amount-card">
          <template #header>
            <span>金额信息</span>
          </template>
          <div class="amount-info">
            <p><strong>商品总金额：</strong><span class="amount">￥{{ currentOrder.totalAmount }}</span></p>
            <p v-if="currentOrder.discountAmount > 0">
              <strong>优惠金额：</strong><span class="discount">-￥{{ currentOrder.discountAmount }}</span>
            </p>
            <p class="total"><strong>实付金额：</strong><span class="amount-actual">￥{{ currentOrder.actualAmount || currentOrder.totalAmount }}</span></p>
          </div>
        </el-card>
        
        <!-- 订单操作 -->
        <div class="dialog-actions">
          <el-button 
            v-if="currentOrder.orderStatus === 1"
            type="primary"
            @click="payOrder(currentOrder); detailDialogVisible = false"
          >
            立即付款
          </el-button>
          <el-button 
            v-if="currentOrder.orderStatus === 1"
            @click="cancelOrder(currentOrder); detailDialogVisible = false"
          >
            取消订单
          </el-button>
          <el-button 
            v-if="currentOrder.orderStatus === 3"
            type="primary"
            @click="confirmOrder(currentOrder); detailDialogVisible = false"
          >
            确认收货
          </el-button>
          <el-button 
            v-if="currentOrder.orderStatus === 4"
            @click="reviewOrder(currentOrder); detailDialogVisible = false"
          >
            评价订单
          </el-button>
          <el-button @click="detailDialogVisible = false">关闭</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import orderApi from '@/api/order'

const router = useRouter()

// 数据状态
const loading = ref(false)
const orders = ref([])
const total = ref(0)
const activeTab = ref('all')

// 搜索参数
const searchParams = reactive({
  pageNum: 1,
  pageSize: 10,
  status: null
})

// 订单状态映射 (后端使用数字状态)
const statusMap = {
  1: '待付款',
  2: '待发货', 
  3: '待收货',
  4: '已完成',
  5: '已取消',
  6: '已退款'
}

const statusTypeMap = {
  1: 'warning',
  2: 'primary',
  3: 'info', 
  4: 'success',
  5: 'danger',
  6: 'warning'
}

// 获取状态文本
const getStatusText = (status) => {
  return statusMap[status] || status
}

// 获取状态类型
const getStatusType = (status) => {
  return statusTypeMap[status] || 'info'
}

// 获取空状态文本
const getEmptyText = () => {
  const tabTexts = {
    all: '暂无订单',
    pending: '暂无待付款订单',
    paid: '暂无待发货订单',
    shipped: '暂无待收货订单',
    completed: '暂无已完成订单',
    cancelled: '暂无已取消订单'
  }
  return tabTexts[activeTab.value] || '暂无订单'
}

// 获取订单列表
const getOrders = async () => {
  loading.value = true
  try {
    // 构建查询参数，使用orderStatus而不是status
    const params = {
      pageNum: searchParams.pageNum,
      pageSize: searchParams.pageSize
    }
    
    // 如果有状态筛选，添加orderStatus参数
    if (searchParams.status !== null) {
      params.orderStatus = searchParams.status
    }
    
    const res = await orderApi.getOrderPage(params)
    if (res.code === 200) {
      orders.value = res.data.records
      total.value = res.data.total
    }
  } catch (error) {
    console.error('获取订单列表失败:', error)
    ElMessage.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

// 选择标签
const selectTab = (tab) => {
  activeTab.value = tab
  searchParams.pageNum = 1
  
  // 设置状态筛选
  const statusMapping = {
    all: null,
    pending: 1,  // 待付款
    paid: 2,     // 待发货
    shipped: 3,  // 待收货
    completed: 4, // 已完成
    cancelled: 5  // 已取消
  }
  searchParams.status = statusMapping[tab]
  
  getOrders()
}

// 分页处理
const handleSizeChange = (size) => {
  searchParams.pageSize = size
  searchParams.pageNum = 1
  getOrders()
}

const handleCurrentChange = (page) => {
  searchParams.pageNum = page
  getOrders()
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 支付订单
const payOrder = (order) => {
  // 跳转到支付页面
  router.push({
    path: '/user/pay',
    query: {
      orderNo: order.orderNo,
      amount: order.actualAmount || order.totalAmount
    }
  })
}

// 取消订单
const cancelOrder = async (order) => {
  try {
    await ElMessageBox.confirm('确认取消此订单吗？', '提示', {
      confirmButtonText: '确认取消',
      cancelButtonText: '不取消',
      type: 'warning'
    })
    
    const res = await orderApi.cancelOrder(order.id)
    if (res.code === 200) {
      ElMessage.success('订单已取消')
      getOrders() // 刷新订单列表
    } else {
      ElMessage.error(res.message || '取消订单失败')
    }
  } catch (error) {
    console.error('取消订单失败:', error)
    if (error.message) {
      ElMessage.error('取消订单失败')
    }
  }
}

// 确认收货
const confirmOrder = async (order) => {
  try {
    await ElMessageBox.confirm('确认已收到商品吗？', '提示', {
      confirmButtonText: '确认收货',
      cancelButtonText: '取消',
      type: 'info'
    })
    
    const res = await orderApi.confirmOrder(order.id)
    if (res.code === 200) {
      ElMessage.success('确认收货成功')
      getOrders() // 刷新订单列表
    } else {
      ElMessage.error(res.message || '确认收货失败')
    }
  } catch (error) {
    console.error('确认收货失败:', error)
    if (error.message) {
      ElMessage.error('确认收货失败')
    }
  }
}

// 评价订单
const reviewOrder = (order) => {
  // 跳转到评价页面或打开评价弹窗
  ElMessage.info('评价功能开发中...')
}

// 查看订单详情
const detailDialogVisible = ref(false)
const currentOrder = ref(null)

const viewOrderDetail = async (order) => {
  try {
    // 获取完整的订单详情
    const res = await orderApi.getOrderById(order.id)
    if (res.code === 200) {
      currentOrder.value = res.data
      detailDialogVisible.value = true
    } else {
      ElMessage.error(res.message || '获取订单详情失败')
    }
  } catch (error) {
    console.error('获取订单详情失败:', error)
    ElMessage.error('获取订单详情失败')
  }
}

// 跳转到商品页面
const goToProducts = () => {
  router.push('/products')
}

// 计算订单商品总数量
const getTotalQuantity = (orderItems) => {
  if (!orderItems || orderItems.length === 0) return 0
  return orderItems.reduce((total, item) => total + item.quantity, 0)
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString()
}

// 初始化
onMounted(() => {
  getOrders()
})
</script>

<style scoped>
.user-orders {
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
  margin-bottom: 12px;
  font-weight: 700;
}

.page-header p {
  font-size: 16px;
  color: #64748b;
}

/* 订单标签 */
.order-tabs {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}

.tabs-wrapper {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.tab-item {
  padding: 10px 20px;
  border-radius: 20px;
  background: #f1f5f9;
  color: #64748b;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.tab-item:hover {
  background: #e2e8f0;
  color: #475569;
}

.tab-item.active {
  background: #3b82f6;
  color: white;
}

/* 订单内容 */
.orders-content {
  min-height: 400px;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
}

.order-card:hover {
  box-shadow: 0 8px 32px rgba(0,0,0,0.12);
}

/* 订单头部 */
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.order-info {
  display: flex;
  gap: 20px;
  align-items: center;
}

.order-number {
  font-weight: 600;
  color: #1e293b;
}

.order-date {
  color: #64748b;
  font-size: 14px;
}

/* 订单商品 */
.order-items {
  margin-bottom: 20px;
}

.order-item {
  display: flex;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #f1f5f9;
}

.order-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: 16px;
  color: #1e293b;
  margin-bottom: 8px;
  font-weight: 600;
}

.item-spec {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 8px;
}

.item-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-price {
  font-size: 16px;
  color: #e74c3c;
  font-weight: 600;
}

.item-quantity {
  color: #64748b;
}

/* 订单总计 */
.order-total {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
}

.total-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-amount {
  font-size: 18px;
  color: #e74c3c;
  font-weight: 600;
}

/* 订单操作 */
.order-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  flex-wrap: wrap;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

/* 订单详情弹窗样式 */
.order-detail {
  padding: 10px 0;
}

.order-info-card,
.order-items-card,
.order-amount-card {
  margin-bottom: 20px;
}

.amount-info {
  text-align: right;
}

.amount-info p {
  margin: 10px 0;
}

.amount-info .total {
  font-size: 16px;
  border-top: 1px solid #eee;
  padding-top: 10px;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
  flex-wrap: wrap;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header h1 {
    font-size: 24px;
  }
  
  .tabs-wrapper {
    gap: 12px;
  }
  
  .tab-item {
    padding: 8px 16px;
    font-size: 14px;
  }
  
  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .order-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .item-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .total-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .order-actions {
    justify-content: flex-start;
  }
  
  .dialog-actions {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .order-item {
    flex-direction: column;
  }
  
  .item-image {
    width: 100%;
    height: 200px;
  }
}
</style>

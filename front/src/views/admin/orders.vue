<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <div class="filter-container">
      <el-form :inline="true" :model="queryParams" class="demo-form-inline">
        <el-form-item label="订单号" >
          <el-input 
            v-model="queryParams.keyword"
            placeholder="请输入订单号"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="订单状态" style="width: 220px">
          <el-select v-model="queryParams.orderStatus" placeholder="请选择订单状态" clearable>
            <el-option label="待支付" :value="1" />
            <el-option label="待发货" :value="2" />
            <el-option label="已发货" :value="3" />
            <el-option label="已收货" :value="4" />
            <el-option label="已取消" :value="5" />
            <el-option label="已退款" :value="6" />
          </el-select>
        </el-form-item>
        <el-form-item label="支付状态" style="width: 220px">
          <el-select v-model="queryParams.paymentStatus" placeholder="请选择支付状态" clearable>
            <el-option label="待支付" :value="0" />
            <el-option label="已支付" :value="1" />
            <el-option label="支付失败" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleQuery">搜索</el-button>
          <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 订单列表 -->
    <el-table v-loading="loading" :data="orderList" border style="width: 100%">
      <el-table-column prop="orderNo" label="订单号" width="140" show-overflow-tooltip />
      <el-table-column prop="totalAmount" label="订单金额" width="120">
        <template #default="scope">
          <span class="amount">￥{{ scope.row.totalAmount }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="actualAmount" label="实付金额" width="120">
        <template #default="scope">
          <span class="amount-actual">￥{{ scope.row.actualAmount }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="deliveryName" label="收货人" width="100" />
      <el-table-column prop="deliveryPhone" label="收货电话" width="120" />
      <el-table-column prop="deliveryAddress" label="收货地址" width="140" show-overflow-tooltip />
      <el-table-column prop="paymentMethod" label="支付方式" width="100" />
      <el-table-column prop="paymentStatus" label="支付状态" width="100">
        <template #default="scope">
          <el-tag :type="getPaymentStatusType(scope.row.paymentStatus)">
            {{ scope.row.paymentStatusDesc }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="orderStatus" label="订单状态" width="100">
        <template #default="scope">
          <el-tag :type="getOrderStatusType(scope.row.orderStatus)">
            {{ scope.row.statusDesc }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="下单时间" width="180">
        <template #default="scope">
          {{ formatDate(scope.row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button size="small" type="primary" @click="handleViewDetail(scope.row)">详情</el-button>
          <el-dropdown @command="(command) => handleAction(command, scope.row)">
            <el-button size="small" type="success" style="margin-left: 15px;">
              操作<el-icon class="el-icon--right"><arrow-down /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <!-- 待发货状态可以发货 -->
                <el-dropdown-item
                  v-if="scope.row.orderStatus === 2"
                  command="ship"
                >
                  发货
                </el-dropdown-item>
                
                <!-- 待付款状态可以取消订单 -->
                <el-dropdown-item
                  v-if="scope.row.orderStatus === 1"
                  command="cancel"
                >
                  取消订单
                </el-dropdown-item>
                
                <!-- 已发货状态可以提醒收货 -->
                <el-dropdown-item
                  v-if="scope.row.orderStatus === 3"
                  command="remind"
                >
                  提醒收货
                </el-dropdown-item>
                
                <!-- 已完成状态可以查看评价 -->
                <el-dropdown-item
                  v-if="scope.row.orderStatus === 4"
                  command="review"
                >
                  查看评价
                </el-dropdown-item>
                
                <!-- 已取消状态可以查看原因 -->
                <el-dropdown-item
                  v-if="scope.row.orderStatus === 5"
                  command="reason"
                >
                  查看取消原因
                </el-dropdown-item>
                
                <!-- 已退款状态可以查看退款详情 -->
                <el-dropdown-item
                  v-if="scope.row.orderStatus === 6"
                  command="refund"
                >
                  查看退款详情
                </el-dropdown-item>
                
                <!-- 所有状态都可以导出订单 -->
                <el-dropdown-item
                  command="export"
                >
                  导出订单
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total > 0"
      :total="total"
      :page="queryParams.pageNum"
      :limit="queryParams.pageSize"
      @pagination="handlePagination"
    />

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
                <el-tag :type="getOrderStatusType(currentOrder.orderStatus)">
                  {{ currentOrder.statusDesc }}
                </el-tag>
              </p>
              <p><strong>支付状态：</strong>
                <el-tag :type="getPaymentStatusType(currentOrder.paymentStatus)">
                  {{ currentOrder.paymentStatusDesc }}
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
            <p class="total"><strong>实付金额：</strong><span class="amount-actual">￥{{ currentOrder.actualAmount }}</span></p>
          </div>
        </el-card>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown, Search, Refresh } from '@element-plus/icons-vue'
import orderApi from '@/api/order'
import Pagination from '@/components/Pagination.vue'

// 数据定义
const loading = ref(false)
const orderList = ref([])
const total = ref(0)
const detailDialogVisible = ref(false)
const currentOrder = ref(null)

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  orderStatus: null,
  paymentStatus: null
})

// 获取订单列表
const getList = async () => {
  loading.value = true
  try {
    const res = await orderApi.getOrderPage(queryParams)
    if (res.code === 200) {
      orderList.value = res.data.records
      total.value = res.data.total
    }
  } catch (error) {
    console.error('获取订单列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

// 分页处理
const handlePagination = (paginationData) => {
  queryParams.pageNum = paginationData.page
  queryParams.pageSize = paginationData.limit
  getList()
}

// 重置
const resetQuery = () => {
  queryParams.keyword = ''
  queryParams.orderStatus = null
  queryParams.paymentStatus = null
  queryParams.pageNum = 1
  getList()
}

// 查看详情
const handleViewDetail = async (row) => {
  try {
    const res = await orderApi.getOrderById(row.id)
    if (res.code === 200) {
      currentOrder.value = res.data
      detailDialogVisible.value = true
    }
  } catch (error) {
    console.error('获取订单详情失败:', error)
  }
}

// 处理操作
const handleAction = async (command, row) => {
  try {
    switch (command) {
      case 'ship':
        await ElMessageBox.confirm('确认发货吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        })
        
        await orderApi.updateOrderStatus(row.id, 3) // 已发货
        ElMessage.success('发货成功')
        getList()
        break
        
      case 'cancel':
        const { value } = await ElMessageBox.prompt('请输入取消原因', '取消订单', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPattern: /.+/,
          inputErrorMessage: '请输入取消原因'
        })
        
        await orderApi.cancelOrder(row.id, value)
        ElMessage.success('订单已取消')
        getList()
        break
        
      case 'remind':
        ElMessage.success('已向用户发送收货提醒')
        break
        
      case 'review':
        handleViewDetail(row)
        ElMessage.info('该功能暂未开放，敬请期待')
        break
        
      case 'reason':
        ElMessageBox.alert(
          row.cancelReason || '用户未提供取消原因', 
          '取消原因', 
          { confirmButtonText: '确定' }
        )
        break
        
      case 'refund':
        handleViewDetail(row)
        ElMessage.info('该功能暂未开放，敬请期待')
        break
        
      case 'export':
        ElMessage.success(`订单 ${row.orderNo} 导出成功`)
        break
        
      default:
        handleViewDetail(row)
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('操作失败:', error)
    }
  }
}

// 获取支付状态样式
const getPaymentStatusType = (status) => {
  switch (status) {
    case 0: return 'warning'
    case 1: return 'success'
    case 2: return 'danger'
    default: return 'info'
  }
}

// 获取订单状态样式
const getOrderStatusType = (status) => {
  switch (status) {
    case 1: return 'warning'
    case 2: return 'primary'
    case 3: return 'info'
    case 4: return 'success'
    case 5: return 'danger'
    case 6: return 'warning'
    default: return 'info'
  }
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString()
}

// 初始化
onMounted(() => {
  getList()
})
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.filter-container {
  margin-bottom: 20px;
}

.amount {
  color: #e74c3c;
  font-weight: bold;
}

.amount-actual {
  color: #27ae60;
  font-weight: bold;
}

.discount {
  color: #f39c12;
}

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
</style>

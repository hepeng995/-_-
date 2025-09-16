<template>
  <div class="user-addresses">
    <div class="container">
      <div class="page-header">
        <h1>我的地址</h1>
        <p>管理您的收货地址</p>
      </div>

      <div class="addresses-content" v-loading="loading">
        <!-- 地址列表 -->
        <div class="addresses-list">
          <div 
            v-for="address in addresses" 
            :key="address.id"
            class="address-card"
            :class="{ 'default-address': address.isDefault }"
          >
            <div class="address-info">
              <div class="address-header">
                <div class="receiver-info">
                  <span class="receiver-name">{{ address.receiverName }}</span>
                  <span class="receiver-phone">{{ address.receiverPhone }}</span>
                </div>
                <el-tag v-if="address.isDefault" type="danger" size="small">默认</el-tag>
              </div>
              <div class="address-detail">
                {{ address.province }} {{ address.city }} {{ address.district }} {{ address.detailAddress }}
              </div>
            </div>
            <div class="address-actions">
              <el-button size="small" @click="editAddress(address)">编辑</el-button>
              <el-button 
                v-if="!address.isDefault" 
                size="small" 
                type="primary"
                @click="setDefault(address.id)"
              >
                设为默认
              </el-button>
              <el-button 
                size="small" 
                type="danger"
                @click="deleteAddress(address.id)"
                :disabled="address.isDefault"
              >
                删除
              </el-button>
            </div>
          </div>

          <!-- 添加新地址卡片 -->
          <div class="add-address-card" @click="addAddress">
            <el-icon class="add-icon"><Plus /></el-icon>
            <span>添加新地址</span>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="addresses.length === 0 && !loading" class="empty-state">
          <el-empty description="暂无收货地址">
            <el-button type="primary" @click="addAddress">添加地址</el-button>
          </el-empty>
        </div>
      </div>
    </div>

    <!-- 地址编辑弹窗 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="isEdit ? '编辑地址' : '添加地址'" 
      width="600px"
      @close="resetForm"
    >
      <el-form 
        ref="formRef" 
        :model="form" 
        :rules="rules" 
        label-width="80px"
        @submit.prevent
      >
        <el-form-item label="收货人" prop="receiverName">
          <el-input v-model="form.receiverName" placeholder="请输入收货人姓名" />
        </el-form-item>
        
        <el-form-item label="手机号码" prop="receiverPhone">
          <el-input v-model="form.receiverPhone" placeholder="请输入手机号码" />
        </el-form-item>
        
        <el-form-item label="省份" prop="province">
          <el-select v-model="form.province" placeholder="请选择省份" @change="onProvinceChange">
            <el-option 
              v-for="province in provinces" 
              :key="province.value" 
              :label="province.label" 
              :value="province.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="城市" prop="city">
          <el-select v-model="form.city" placeholder="请选择城市" @change="onCityChange">
            <el-option 
              v-for="city in cities" 
              :key="city.value" 
              :label="city.label" 
              :value="city.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="区县" prop="district">
          <el-select v-model="form.district" placeholder="请选择区县">
            <el-option 
              v-for="district in districts" 
              :key="district.value" 
              :label="district.label" 
              :value="district.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="详细地址" prop="detailAddress">
          <el-input 
            v-model="form.detailAddress" 
            type="textarea" 
            :rows="3"
            placeholder="请输入详细地址"
          />
        </el-form-item>
        
        <el-form-item>
          <el-checkbox v-model="form.isDefault">设为默认地址</el-checkbox>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitLoading">
            {{ isEdit ? '更新' : '添加' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import addressApi from '@/api/address'

// 数据状态
const loading = ref(false)
const submitLoading = ref(false)
const addresses = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)

// 表单数据
const form = reactive({
  id: null,
  receiverName: '',
  receiverPhone: '',
  province: '',
  city: '',
  district: '',
  detailAddress: '',
  isDefault: false
})

// 地区数据（简化版，实际项目可以使用完整的地区数据）
const provinces = ref([
  { value: '湖南省', label: '湖南省' },
  { value: '湖北省', label: '湖北省' },
  { value: '广东省', label: '广东省' },
  { value: '江苏省', label: '江苏省' },
  { value: '浙江省', label: '浙江省' }
])

const cities = ref([])
const districts = ref([])

// 城市数据映射
const cityMap = {
  '湖南省': [
    { value: '长沙市', label: '长沙市' },
    { value: '常德市', label: '常德市' },
    { value: '张家界市', label: '张家界市' },
    { value: '株洲市', label: '株洲市' },
    { value: '湘潭市', label: '湘潭市' }
  ],
  '湖北省': [
    { value: '武汉市', label: '武汉市' },
    { value: '宜昌市', label: '宜昌市' },
    { value: '襄阳市', label: '襄阳市' }
  ],
  '广东省': [
    { value: '广州市', label: '广州市' },
    { value: '深圳市', label: '深圳市' },
    { value: '珠海市', label: '珠海市' }
  ]
}

// 区县数据映射
const districtMap = {
  '长沙市': [
    { value: '岳麓区', label: '岳麓区' },
    { value: '芙蓉区', label: '芙蓉区' },
    { value: '天心区', label: '天心区' },
    { value: '开福区', label: '开福区' },
    { value: '雨花区', label: '雨花区' }
  ],
  '常德市': [
    { value: '武陵区', label: '武陵区' },
    { value: '鼎城区', label: '鼎城区' },
    { value: '桃源县', label: '桃源县' },
    { value: '汉寿县', label: '汉寿县' }
  ],
  '武汉市': [
    { value: '江岸区', label: '江岸区' },
    { value: '江汉区', label: '江汉区' },
    { value: '硚口区', label: '硚口区' }
  ]
}

// 表单验证规则
const rules = {
  receiverName: [
    { required: true, message: '请输入收货人姓名', trigger: 'blur' },
    { min: 2, max: 10, message: '姓名长度在2到10个字符', trigger: 'blur' }
  ],
  receiverPhone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  province: [
    { required: true, message: '请选择省份', trigger: 'change' }
  ],
  city: [
    { required: true, message: '请选择城市', trigger: 'change' }
  ],
  district: [
    { required: true, message: '请选择区县', trigger: 'change' }
  ],
  detailAddress: [
    { required: true, message: '请输入详细地址', trigger: 'blur' },
    { min: 5, max: 100, message: '详细地址长度在5到100个字符', trigger: 'blur' }
  ]
}

// 获取地址列表
const getAddresses = async () => {
  loading.value = true
  try {
    const res = await addressApi.getUserAddresses()
    if (res.code === 200) {
      addresses.value = res.data
    }
  } catch (error) {
    console.error('获取地址列表失败:', error)
    ElMessage.error('获取地址列表失败')
  } finally {
    loading.value = false
  }
}

// 省份变化处理
const onProvinceChange = (province) => {
  form.city = ''
  form.district = ''
  cities.value = cityMap[province] || []
  districts.value = []
}

// 城市变化处理
const onCityChange = (city) => {
  form.district = ''
  districts.value = districtMap[city] || []
}

// 添加地址
const addAddress = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

// 编辑地址
const editAddress = (address) => {
  isEdit.value = true
  form.id = address.id
  form.receiverName = address.receiverName
  form.receiverPhone = address.receiverPhone
  form.province = address.province
  form.city = address.city
  form.district = address.district
  form.detailAddress = address.detailAddress
  form.isDefault = address.isDefault
  
  // 设置级联选择器的数据
  onProvinceChange(address.province)
  onCityChange(address.city)
  
  dialogVisible.value = true
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  Object.assign(form, {
    id: null,
    receiverName: '',
    receiverPhone: '',
    province: '',
    city: '',
    district: '',
    detailAddress: '',
    isDefault: false
  })
  cities.value = []
  districts.value = []
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitLoading.value = true
    
    const addressData = { ...form }
    let res
    
    if (isEdit.value) {
      res = await addressApi.updateAddress(form.id, addressData)
    } else {
      res = await addressApi.createAddress(addressData)
    }
    
    if (res.code === 200) {
      ElMessage.success(isEdit.value ? '地址更新成功' : '地址添加成功')
      dialogVisible.value = false
      await getAddresses()
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (error) {
    console.error('提交失败:', error)
    if (error !== 'validation') {
      ElMessage.error('操作失败')
    }
  } finally {
    submitLoading.value = false
  }
}

// 设置默认地址
const setDefault = async (id) => {
  try {
    const res = await addressApi.setDefaultAddress(id)
    if (res.code === 200) {
      ElMessage.success('设置默认地址成功')
      await getAddresses()
    } else {
      ElMessage.error(res.message || '设置失败')
    }
  } catch (error) {
    console.error('设置默认地址失败:', error)
    ElMessage.error('设置失败')
  }
}

// 删除地址
const deleteAddress = async (id) => {
  try {
    await ElMessageBox.confirm('确认删除这个地址吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const res = await addressApi.deleteAddress(id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      await getAddresses()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除地址失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 初始化
onMounted(() => {
  getAddresses()
})
</script>

<style scoped>
.user-addresses {
  min-height: 100vh;
  background: #f8fafc;
  padding: 40px 0;
}

.container {
  max-width: 1000px;
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

/* 地址列表 */
.addresses-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.address-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.address-card:hover {
  box-shadow: 0 8px 32px rgba(0,0,0,0.12);
}

.address-card.default-address {
  border-color: #10b981;
  background: linear-gradient(135deg, #f0fdfa 0%, #ffffff 100%);
}

.address-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.receiver-info {
  display: flex;
  gap: 12px;
  align-items: center;
}

.receiver-name {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.receiver-phone {
  font-size: 14px;
  color: #64748b;
}

.address-detail {
  color: #4b5563;
  line-height: 1.6;
  margin-bottom: 16px;
}

.address-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

/* 添加地址卡片 */
.add-address-card {
  background: white;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 160px;
}

.add-address-card:hover {
  border-color: #10b981;
  background: #f0fdfa;
}

.add-icon {
  font-size: 32px;
  color: #94a3b8;
  margin-bottom: 8px;
}

.add-address-card span {
  color: #64748b;
  font-size: 16px;
}

/* 空状态 */
.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
}

/* 弹窗样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .addresses-list {
    grid-template-columns: 1fr;
  }
  
  .page-header h1 {
    font-size: 24px;
  }
  
  .address-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .address-actions {
    justify-content: flex-start;
    flex-wrap: wrap;
  }
  
}

@media (max-width: 480px) {
  .add-address-card {
    padding: 30px 20px;
  }
}
</style>

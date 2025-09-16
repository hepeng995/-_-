<template>
  <div class="system-config-container">
    <!-- 顶部操作区域 -->
    <el-card class="top-card" shadow="never">
      <div class="card-header">
        <div class="title-section">
          <h3>系统参数设置</h3>
          <span class="description">配置系统的各项参数，修改后需刷新缓存生效</span>
        </div>
        <div class="action-section">
          <el-button type="primary" @click="handleAddConfig">新增配置</el-button>
          <el-button type="warning" @click="updatePaymentConfigsRemoveCash">移除现金支付</el-button>
          <el-button type="success" @click="handleRefreshCache">刷新缓存</el-button>
        </div>
      </div>
    </el-card>

    <!-- 配置分组和列表 -->
    <el-card shadow="never" class="config-card">
      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane v-for="group in groups" :key="group" :label="group" :name="group">
          <el-table
            :data="groupConfigMap[group]"
            style="width: 100%"
            :border="true"
            v-loading="loading"
          >
            <el-table-column prop="configName" label="参数名称" width="180">
              <template #default="scope">
                <el-tooltip :content="scope.row.remark" placement="top" :disabled="!scope.row.remark">
                  <span>{{ scope.row.configName }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column prop="configKey" label="参数键名" width="180" />
            <el-table-column label="参数值" min-width="250">
              <template #default="scope">
                <!-- 文本类型 -->
                <el-input
                  v-if="scope.row.configType === 'text'"
                  v-model="scope.row.configValue"
                  placeholder="请输入参数值"
                />
                
                <!-- 数字类型 -->
                <el-input-number
                  v-else-if="scope.row.configType === 'number'"
                  v-model="scope.row.configValue"
                  :precision="0"
                  :step="1"
                  :min="0"
                  style="width: 100%"
                />
                
                <!-- 布尔类型 -->
                <el-switch
                  v-else-if="scope.row.configType === 'boolean'"
                  v-model="booleanValues[scope.row.configKey]"
                  active-text="是"
                  inactive-text="否"
                  @change="value => handleBooleanChange(scope.row.configKey, value)"
                />
                
                <!-- 选择类型 -->
                <el-select
                  v-else-if="scope.row.configType === 'select'"
                  v-model="scope.row.configValue"
                  placeholder="请选择"
                  style="width: 100%"
                >
                  <el-option
                    v-for="option in scope.row.options"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
                
                <!-- 日期类型 -->
                <el-date-picker
                  v-else-if="scope.row.configType === 'date'"
                  v-model="scope.row.configValue"
                  type="date"
                  placeholder="选择日期"
                  style="width: 100%"
                  value-format="YYYY-MM-DD"
                />
                
                <!-- 默认文本展示 -->
                <span v-else>{{ scope.row.configValue }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="configType" label="参数类型" width="100">
              <template #default="scope">
                <el-tag v-if="scope.row.configType === 'text'">文本</el-tag>
                <el-tag v-else-if="scope.row.configType === 'number'" type="success">数字</el-tag>
                <el-tag v-else-if="scope.row.configType === 'boolean'" type="warning">布尔</el-tag>
                <el-tag v-else-if="scope.row.configType === 'select'" type="info">选项</el-tag>
                <el-tag v-else-if="scope.row.configType === 'date'" type="danger">日期</el-tag>
                <el-tag v-else>{{ scope.row.configType }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180">
              <template #default="scope">
                <el-button type="primary" link @click="handleSaveConfig(scope.row)">保存</el-button>
                <el-button type="success" link @click="handleEditConfig(scope.row)">编辑</el-button>
                <el-button type="danger" link @click="handleDeleteConfig(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 编辑配置对话框 -->
    <el-dialog v-model="editDialog.visible" :title="editDialog.title" width="600px">
      <el-form :model="editDialog.form" label-width="100px" :rules="editDialog.rules" ref="editFormRef">
        <el-form-item label="参数名称" prop="configName">
          <el-input v-model="editDialog.form.configName" placeholder="请输入参数名称" />
        </el-form-item>
        <el-form-item label="参数键名" prop="configKey">
          <el-input v-model="editDialog.form.configKey" placeholder="请输入参数键名" :disabled="editDialog.isEdit" />
        </el-form-item>
        <el-form-item label="参数值" prop="configValue">
          <el-input v-model="editDialog.form.configValue" placeholder="请输入参数值" />
        </el-form-item>
        <el-form-item label="参数类型" prop="configType">
          <el-select v-model="editDialog.form.configType" placeholder="请选择参数类型" style="width: 100%">
            <el-option label="文本" value="text" />
            <el-option label="数字" value="number" />
            <el-option label="布尔" value="boolean" />
            <el-option label="选项" value="select" />
            <el-option label="日期" value="date" />
          </el-select>
        </el-form-item>
        <el-form-item label="选项设置" v-if="editDialog.form.configType === 'select'">
          <el-input
            v-model="editDialog.form.configOptions"
            type="textarea"
            placeholder="格式：值:显示文本,值:显示文本 例如：ALIPAY:支付宝,WECHAT:微信支付"
          />
        </el-form-item>
        <el-form-item label="分组名称" prop="groupName">
          <el-input v-model="editDialog.form.groupName" placeholder="请输入分组名称" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="editDialog.form.sort" :min="0" :step="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="备注说明" prop="remark">
          <el-input
            v-model="editDialog.form.remark"
            type="textarea"
            placeholder="请输入备注说明"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveEditConfig">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { 
  getAllConfigs, 
  getConfigsByGroup,
  getAllGroups,
  updateConfigValue,
  addConfig,
  updateConfig,
  deleteConfig as deleteConfigApi,
  refreshCache as refreshCacheApi
} from '@/api/system-config'
import { ElMessage, ElMessageBox } from 'element-plus'

// 加载状态
const loading = ref(false)

// 当前激活的标签页
const activeTab = ref('')

// 所有分组
const groups = ref([])

// 分组配置映射
const groupConfigMap = ref({})

// 布尔值映射，因为el-switch需要布尔类型
const booleanValues = reactive({})

// 获取所有配置分组
const fetchGroups = async () => {
  try {
    const res = await getAllGroups()
    if (res.code === 200) {
      groups.value = res.data || []
      if (groups.value.length > 0) {
        activeTab.value = groups.value[0]
        await fetchConfigsByGroup()
      }
    } else {
      ElMessage.error(res.message || '获取配置分组失败')
    }
  } catch (error) {
    console.error('获取配置分组失败:', error)
    ElMessage.error('获取配置分组失败')
  }
}

// 按分组获取配置
const fetchConfigsByGroup = async () => {
  loading.value = true
  try {
    const res = await getConfigsByGroup()
    if (res.code === 200) {
      groupConfigMap.value = res.data || {}
      
      // 处理布尔类型的值
      Object.values(groupConfigMap.value).flat().forEach(config => {
        if (config.configType === 'boolean') {
          booleanValues[config.configKey] = config.configValue === 'true'
        }
      })
      
      // 从基本设置分组中删除system_logo配置行
      if (groupConfigMap.value['基本设置']) {
        groupConfigMap.value['基本设置'] = groupConfigMap.value['基本设置'].filter(item => item.configKey !== 'system_logo')
      }
      
      // 移除现金支付选项
      removeAllCashPaymentOptions()
    } else {
      ElMessage.error(res.message || '获取配置列表失败')
    }
  } catch (error) {
    console.error('获取配置列表失败:', error)
    ElMessage.error('获取配置列表失败')
  } finally {
    loading.value = false
  }
}

// 移除所有配置中的现金支付选项
const removeAllCashPaymentOptions = () => {
  if (!groupConfigMap.value || !groupConfigMap.value['支付设置']) return
  
  groupConfigMap.value['支付设置'].forEach(config => {
    // 处理支付方式相关配置
    if (config.configKey === 'payment_methods' || config.configKey === 'default_payment') {
      // 处理configOptions
      if (config.configOptions) {
        const optionPairs = config.configOptions.split(',')
        const filteredOptions = optionPairs.filter(option => !option.startsWith('CASH:'))
        config.configOptions = filteredOptions.join(',')
        
        // 重建options数组
        if (config.options) {
          config.options = config.options.filter(option => option.value !== 'CASH')
        }
      }
      
      // 处理configValue
      if (config.configValue) {
        if (config.configKey === 'payment_methods') {
          const values = config.configValue.split(',')
          const filteredValues = values.filter(value => value !== 'CASH')
          config.configValue = filteredValues.join(',')
        } else if (config.configKey === 'default_payment' && config.configValue === 'CASH') {
          config.configValue = 'ALIPAY'
        }
      }
    }
  })
}

// 直接更新支付配置并移除现金支付
const updatePaymentConfigsRemoveCash = async () => {
  try {
    loading.value = true
    
    // 查找支付相关配置
    let paymentMethodsConfig = null
    let defaultPaymentConfig = null
    
    if (groupConfigMap.value && groupConfigMap.value['支付设置']) {
      paymentMethodsConfig = groupConfigMap.value['支付设置'].find(c => c.configKey === 'payment_methods')
      defaultPaymentConfig = groupConfigMap.value['支付设置'].find(c => c.configKey === 'default_payment')
    }
    
    // 更新支持的支付方式
    if (paymentMethodsConfig) {
      const values = paymentMethodsConfig.configValue.split(',')
      const filteredValues = values.filter(v => v !== 'CASH')
      const newValue = filteredValues.join(',')
      
      // 更新选项配置
      const optionPairs = paymentMethodsConfig.configOptions.split(',')
      const filteredOptions = optionPairs.filter(opt => !opt.startsWith('CASH:'))
      const newOptions = filteredOptions.join(',')
      
      // 保存到数据库
      await updateConfig({
        ...paymentMethodsConfig,
        configValue: newValue,
        configOptions: newOptions
      })
    }
    
    // 更新默认支付方式
    if (defaultPaymentConfig && defaultPaymentConfig.configValue === 'CASH') {
      // 更新选项配置
      const optionPairs = defaultPaymentConfig.configOptions.split(',')
      const filteredOptions = optionPairs.filter(opt => !opt.startsWith('CASH:'))
      const newOptions = filteredOptions.join(',')
      
      // 保存到数据库
      await updateConfig({
        ...defaultPaymentConfig,
        configValue: 'ALIPAY',
        configOptions: newOptions
      })
    }
    
    // 刷新缓存
    await refreshCacheApi()
    
    // 重新加载配置
    await fetchConfigsByGroup()
    
    ElMessage.success('已成功移除现金支付选项并刷新配置')
  } catch (error) {
    console.error('更新支付配置失败:', error)
    ElMessage.error('更新支付配置失败')
  } finally {
    loading.value = false
  }
}

// 处理布尔类型值变化
const handleBooleanChange = (key, value) => {
  const configItem = Object.values(groupConfigMap.value).flat().find(item => item.configKey === key)
  if (configItem) {
    configItem.configValue = value.toString()
  }
}

// 处理标签页点击事件
const handleTabClick = () => {
  // 切换标签页时可以做一些操作
}

// 保存配置
const handleSaveConfig = async (config) => {
  try {
    // 如果是支付方式相关配置且值包含CASH，移除它
    let configValue = config.configValue
    
    if ((config.configKey === 'payment_methods' || config.configKey === 'default_payment')) {
      if (config.configKey === 'payment_methods') {
        // 对于支持的支付方式，移除CASH
        const values = configValue.split(',')
        const filteredValues = values.filter(value => value !== 'CASH')
        configValue = filteredValues.join(',')
      } else if (config.configKey === 'default_payment' && configValue === 'CASH') {
        // 对于默认支付方式，如果是CASH，改为ALIPAY
        configValue = 'ALIPAY'
      }
    }
    
    // 如果修改的是系统名称，发送事件通知其他组件更新
    if (config.configKey === 'system_name') {
      // 触发全局事件，通知布局组件更新系统名称
      window.dispatchEvent(new CustomEvent('system-name-changed', { detail: configValue }))
    }
    
    const res = await updateConfigValue(config.configKey, configValue)
    if (res.code === 200) {
      ElMessage.success('保存成功')
      // 重新获取配置，确保UI更新
      await fetchConfigsByGroup()
    } else {
      ElMessage.error(res.message || '保存失败')
    }
  } catch (error) {
    console.error('保存配置失败:', error)
    ElMessage.error('保存配置失败')
  }
}

// 编辑对话框
const editDialog = reactive({
  visible: false,
  title: '编辑配置',
  isEdit: false,
  form: {
    id: null,
    configName: '',
    configKey: '',
    configValue: '',
    configType: 'text',
    configOptions: '',
    groupName: '',
    sort: 0,
    remark: ''
  },
  rules: {
    configName: [{ required: true, message: '请输入参数名称', trigger: 'blur' }],
    configKey: [{ required: true, message: '请输入参数键名', trigger: 'blur' }],
    configValue: [{ required: true, message: '请输入参数值', trigger: 'blur' }],
    configType: [{ required: true, message: '请选择参数类型', trigger: 'change' }],
    groupName: [{ required: true, message: '请输入分组名称', trigger: 'blur' }]
  }
})

const editFormRef = ref(null)

// 新增配置
const handleAddConfig = () => {
  editDialog.visible = true
  editDialog.title = '新增配置'
  editDialog.isEdit = false
  editDialog.form = {
    id: null,
    configName: '',
    configKey: '',
    configValue: '',
    configType: 'text',
    configOptions: '',
    groupName: activeTab.value || '默认',
    sort: 0,
    remark: ''
  }
}

// 编辑配置
const handleEditConfig = (config) => {
  editDialog.visible = true
  editDialog.title = '编辑配置'
  editDialog.isEdit = true
  
  // 复制配置对象
  const configCopy = { ...config }
  
  // 如果是支付方式相关配置，预处理选项和值，移除现金支付
  if (config.configKey === 'payment_methods' || config.configKey === 'default_payment') {
    // 处理configOptions，移除CASH选项
    if (configCopy.configOptions) {
      const optionPairs = configCopy.configOptions.split(',')
      const filteredOptions = optionPairs.filter(option => !option.startsWith('CASH:'))
      configCopy.configOptions = filteredOptions.join(',')
    }
    
    // 处理configValue，如果是以逗号分隔的列表，移除CASH
    if (configCopy.configValue) {
      if (config.configKey === 'payment_methods') {
        const values = configCopy.configValue.split(',')
        const filteredValues = values.filter(value => value !== 'CASH')
        configCopy.configValue = filteredValues.join(',')
      } else if (config.configKey === 'default_payment' && configCopy.configValue === 'CASH') {
        // 如果默认支付方式是CASH，改为ALIPAY
        configCopy.configValue = 'ALIPAY'
      }
    }
  }
  
  editDialog.form = {
    id: configCopy.id,
    configName: configCopy.configName,
    configKey: configCopy.configKey,
    configValue: configCopy.configValue,
    configType: configCopy.configType,
    configOptions: configCopy.configOptions,
    groupName: configCopy.groupName,
    sort: configCopy.sort,
    remark: configCopy.remark
  }
}

// 保存编辑配置
const handleSaveEditConfig = async () => {
  if (!editFormRef.value) return
  
  await editFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 处理支付方式配置，移除现金支付选项
        if (editDialog.form.configKey === 'payment_methods' || editDialog.form.configKey === 'default_payment') {
          // 处理configOptions，移除CASH选项
          if (editDialog.form.configOptions) {
            const optionPairs = editDialog.form.configOptions.split(',')
            const filteredOptions = optionPairs.filter(option => !option.startsWith('CASH:'))
            editDialog.form.configOptions = filteredOptions.join(',')
          }
          
          // 处理configValue，如果是以逗号分隔的列表，移除CASH
          if (editDialog.form.configValue) {
            const values = editDialog.form.configValue.split(',')
            const filteredValues = values.filter(value => value !== 'CASH')
            editDialog.form.configValue = filteredValues.join(',')
            
            // 如果是default_payment且值为CASH，设置为ALIPAY
            if (editDialog.form.configKey === 'default_payment' && editDialog.form.configValue === 'CASH') {
              editDialog.form.configValue = 'ALIPAY'
            }
          }
        }
        
        const api = editDialog.isEdit ? updateConfig : addConfig
        const res = await api(editDialog.form)
        if (res.code === 200) {
          ElMessage.success(`${editDialog.isEdit ? '编辑' : '新增'}成功`)
          editDialog.visible = false
          
          // 如果修改的是系统名称，触发全局事件
          if (editDialog.form.configKey === 'system_name') {
            window.dispatchEvent(new CustomEvent('system-name-changed', { detail: editDialog.form.configValue }))
          }
          
          // 重新获取配置
          await fetchConfigsByGroup()
        } else {
          ElMessage.error(res.message || `${editDialog.isEdit ? '编辑' : '新增'}失败`)
        }
      } catch (error) {
        console.error(`${editDialog.isEdit ? '编辑' : '新增'}配置失败:`, error)
        ElMessage.error(`${editDialog.isEdit ? '编辑' : '新增'}配置失败`)
      }
    }
  })
}

// 删除配置
const handleDeleteConfig = (config) => {
  ElMessageBox.confirm(`确定要删除配置"${config.configName}"吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteConfigApi(config.id)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        // 重新获取配置
        await fetchConfigsByGroup()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch (error) {
      console.error('删除配置失败:', error)
      ElMessage.error('删除配置失败')
    }
  }).catch(() => {})
}

// 刷新缓存
const handleRefreshCache = async () => {
  try {
    const res = await refreshCacheApi()
    if (res.code === 200) {
      ElMessage.success('刷新缓存成功')
    } else {
      ElMessage.error(res.message || '刷新缓存失败')
    }
  } catch (error) {
    console.error('刷新缓存失败:', error)
    ElMessage.error('刷新缓存失败')
  }
}

// 初始化
onMounted(async () => {
  await fetchGroups()
})
</script>

<style scoped>
.system-config-container {
  padding: 0 10px;
}

.top-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-section {
  display: flex;
  flex-direction: column;
}

.title-section h3 {
  margin: 0;
  font-size: 18px;
}

.description {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.action-section {
  display: flex;
  gap: 10px;
}

.config-card {
  margin-bottom: 20px;
}

:deep(.el-input-number .el-input__inner) {
  text-align: left;
}
</style> 
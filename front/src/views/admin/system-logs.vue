<template>
  <div class="system-logs-container">
    <!-- 搜索条件 -->
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="用户名">
          <el-input v-model="queryParams.username" placeholder="请输入用户名" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="操作模块">
          <el-select v-model="queryParams.module" placeholder="请选择操作模块" clearable style="width: 200px">
            <el-option v-for="item in moduleOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作类型">
          <el-select v-model="queryParams.operation" placeholder="请选择操作类型" clearable style="width: 200px">
            <el-option v-for="item in operationOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作状态">
          <el-select v-model="queryParams.status" placeholder="请选择操作状态" clearable style="width: 200px">
            <el-option label="成功" :value="1" />
            <el-option label="失败" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作时间">
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd HH:mm:ss"
            style="width: 380px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">搜索</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作统计 -->
    

    <!-- 操作按钮和表格 -->
    <el-card class="table-card" shadow="never" v-loading="loading">
      <template #header>
        <div class="card-header">
          <span class="card-title">系统日志列表</span>
          <div class="button-group">
            <el-button type="primary" @click="handleExport">导出</el-button>
            <el-button type="danger" @click="handleClear">清空日志</el-button>
          </div>
        </div>
      </template>

      <el-table :data="logList" style="width: 100%" border>
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column type="index" label="序号" width="80" align="center" />
        <el-table-column prop="username" label="操作用户" width="120" />
        <el-table-column prop="module" label="操作模块" width="120" />
        <el-table-column prop="operation" label="操作类型" width="120" />
        <el-table-column prop="description" label="操作描述" min-width="200" :show-overflow-tooltip="true" />
        <el-table-column prop="ipAddress" label="IP地址" width="130" />
        <el-table-column prop="statusStr" label="操作状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.statusStr }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="executionTime" label="执行时长(ms)" width="120" />
        <el-table-column prop="createdAtStr" label="操作时间" width="170" />
        <el-table-column label="操作" width="120" align="center">
          <template #default="scope">
            <el-button type="text" @click="handleDetail(scope.row)">详情</el-button>
            <el-button type="text" class="delete-btn" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          :current-page="queryParams.pageNum"
          :page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @update:current-page="handleCurrentChange"
          @update:page-size="handleSizeChange"
        />
      </div>
    </el-card>

    <!-- 日志详情对话框 -->
    <el-dialog v-model="detailDialog.open" title="日志详情" width="700px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="操作用户" :span="2">{{ detailDialog.data.username }}</el-descriptions-item>
        <el-descriptions-item label="操作模块">{{ detailDialog.data.module }}</el-descriptions-item>
        <el-descriptions-item label="操作类型">{{ detailDialog.data.operation }}</el-descriptions-item>
        <el-descriptions-item label="操作描述" :span="2">{{ detailDialog.data.description }}</el-descriptions-item>
        <el-descriptions-item label="请求方法">{{ detailDialog.data.requestMethod }}</el-descriptions-item>
        <el-descriptions-item label="请求URL">{{ detailDialog.data.requestUrl }}</el-descriptions-item>
        <el-descriptions-item label="请求参数" :span="2">
          <div class="param-content">{{ formatParams(detailDialog.data.requestParams) }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="IP地址">{{ detailDialog.data.ipAddress }}</el-descriptions-item>
        <el-descriptions-item label="操作状态">
          <el-tag :type="detailDialog.data.status === 1 ? 'success' : 'danger'">
            {{ detailDialog.data.statusStr }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="执行时长">{{ detailDialog.data.executionTime }} ms</el-descriptions-item>
        <el-descriptions-item label="操作时间">{{ detailDialog.data.createdAtStr }}</el-descriptions-item>
        <el-descriptions-item label="错误信息" :span="2" v-if="detailDialog.data.errorMessage">
          <div class="error-content">{{ detailDialog.data.errorMessage }}</div>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailDialog.open = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { 
  getSystemLogPage, 
  getSystemLogDetail, 
  deleteSystemLog, 
  batchDeleteSystemLogs, 
  clearSystemLogs,
  exportSystemLogs,
  getOperationTypes,
  getModules,
  getOperationStats
} from '@/api/system-log'
import { ElMessage, ElMessageBox } from 'element-plus'
// import * as echarts from 'echarts'

// 查询参数
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  username: '',
  module: '',
  operation: '',
  status: null,
  startTime: null,
  endTime: null
})

// 日期范围
const dateRange = ref([])

// 统计日期范围
const statsDateRange = ref([])

// 下拉选项
const moduleOptions = ref([])
const operationOptions = ref([])

// 表格数据
const logList = ref([])
const total = ref(0)
const loading = ref(false)
const statsLoading = ref(false)

// 图表实例
const dailyStatsChart = ref(null)
const moduleStatsChart = ref(null)
let dailyChart = null
let moduleChart = null

// 详情对话框
const detailDialog = ref({
  open: false,
  data: {}
})

// 初始化
onMounted(() => {
  fetchData()
  fetchOptions()
  fetchOperationStats()
})

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    // 处理日期范围
    if (dateRange.value && dateRange.value.length === 2) {
      queryParams.value.startTime = dateRange.value[0]
      queryParams.value.endTime = dateRange.value[1]
    } else {
      queryParams.value.startTime = null
      queryParams.value.endTime = null
    }

    const res = await getSystemLogPage(queryParams.value)
    if (res.code === 200) {
      logList.value = res.data.list || []
      total.value = res.data.total
    } else {
      ElMessage.error(res.message || '获取系统日志失败')
    }
  } catch (error) {
    console.error('获取系统日志失败:', error)
    ElMessage.error('获取系统日志失败')
  } finally {
    loading.value = false
  }
}

// 获取下拉选项
const fetchOptions = async () => {
  try {
    // 获取操作类型
    const operationRes = await getOperationTypes()
    if (operationRes.code === 200) {
      operationOptions.value = operationRes.data || []
    }

    // 获取模块列表
    const moduleRes = await getModules()
    if (moduleRes.code === 200) {
      moduleOptions.value = moduleRes.data || []
    }
  } catch (error) {
    console.error('获取选项数据失败:', error)
  }
}

// 获取操作统计数据
const fetchOperationStats = async () => {
  statsLoading.value = true
  try {
    const params = {}
    // 确保日期格式正确
    if (statsDateRange.value && statsDateRange.value.length === 2 && 
        statsDateRange.value[0] && statsDateRange.value[1]) {
      params.startTime = statsDateRange.value[0]
      params.endTime = statsDateRange.value[1]
    }

    console.log('获取统计数据，参数:', params)
    const res = await getOperationStats(params)
    console.log('统计数据响应:', res)
    
    if (res.code === 200 && res.data) {
      nextTick(() => {
        initDailyChart(res.data.dailyStats || [])
        initModuleChart(res.data.moduleStats || [], res.data.operationStats || [])
      })
    } else {
      ElMessage.error(res.message || '获取操作统计数据失败')
      // 即使失败也初始化空的图表
      nextTick(() => {
        initDailyChart([])
        initModuleChart([], [])
      })
    }
  } catch (error) {
    console.error('获取操作统计数据失败:', error)
    ElMessage.error('获取操作统计数据失败')
    // 出错时也初始化空的图表
    nextTick(() => {
      initDailyChart([])
      initModuleChart([], [])
    })
  } finally {
    statsLoading.value = false
  }
}

// 初始化日期统计图表
const initDailyChart = (data) => {
  if (!dailyStatsChart.value) {
    console.warn('日期统计图表DOM元素不存在')
    return
  }

  try {
    // 若图表实例不存在，则创建
    if (!dailyChart) {
      console.log('创建日期统计图表')
      dailyChart = echarts.init(dailyStatsChart.value)
      window.addEventListener('resize', () => {
        if (dailyChart) {
          dailyChart.resize()
        }
      })
    } else {
      // 先清除现有图表
      dailyChart.clear()
    }

    // 确保数据不为空
    if (!data || data.length === 0) {
      console.log('日期统计数据为空，显示提示信息')
      dailyChart.setOption({
        title: {
          text: '日操作量统计',
          left: 'center',
          textStyle: {
            fontSize: 16
          }
        },
        graphic: {
          type: 'text',
          left: 'center',
          top: 'middle',
          style: {
            text: '暂无数据',
            fontSize: 16,
            fill: '#999'
          }
        }
      }, true)
      return
    }

    console.log('渲染日期统计图表，数据:', data)
    const dates = data.map(item => item.date || '')
    const counts = data.map(item => item.count || 0)

    const option = {
      title: {
        text: '日操作量统计'
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: {
          rotate: 45
        }
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '操作次数',
          type: 'line',
          data: counts,
          smooth: true,
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(64, 158, 255, 0.7)' },
              { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
            ])
          }
        }
      ]
    }

    dailyChart.setOption(option, true)
  } catch (error) {
    console.error('初始化日期统计图表失败:', error)
  }
}

// 初始化模块统计图表
const initModuleChart = (moduleData, operationData) => {
  if (!moduleStatsChart.value) {
    console.warn('模块统计图表DOM元素不存在')
    return
  }

  try {
    // 若图表实例不存在，则创建
    if (!moduleChart) {
      console.log('创建模块统计图表')
      moduleChart = echarts.init(moduleStatsChart.value)
      window.addEventListener('resize', () => {
        if (moduleChart) {
          moduleChart.resize()
        }
      })
    } else {
      // 先清除现有图表
      moduleChart.clear()
    }

    // 确保数据不为空
    if (!moduleData || moduleData.length === 0) {
      console.log('模块统计数据为空，显示提示信息')
      moduleChart.setOption({
        title: {
          text: '模块操作统计',
          left: 'center',
          textStyle: {
            fontSize: 16
          }
        },
        graphic: {
          type: 'text',
          left: 'center',
          top: 'middle',
          style: {
            text: '暂无数据',
            fontSize: 16,
            fill: '#999'
          }
        }
      }, true)
      return
    }

    console.log('渲染模块统计图表，数据:', moduleData)
    const option = {
      title: {
        text: '模块操作统计'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 10,
        top: 'middle',
        itemGap: 10,
        textStyle: {
          overflow: 'truncate',
          width: 80
        },
        data: moduleData.map(item => item.module || '未知模块')
      },
      series: [
        {
          name: '模块分布',
          type: 'pie',
          radius: ['50%', '70%'],
          center: ['60%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '18',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: moduleData.map(item => ({
            name: item.module || '未知模块',
            value: item.count || 0
          }))
        }
      ]
    }

    moduleChart.setOption(option, true)
  } catch (error) {
    console.error('初始化模块统计图表失败:', error)
  }
}

// 查询
const handleQuery = () => {
  queryParams.value.pageNum = 1
  fetchData()
}

// 重置
const resetQuery = () => {
  dateRange.value = []
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    username: '',
    module: '',
    operation: '',
    status: null,
    startTime: null,
    endTime: null
  }
  fetchData()
}

// 查看详情
const handleDetail = async (row) => {
  try {
    const res = await getSystemLogDetail(row.id)
    if (res.code === 200) {
      detailDialog.value.data = res.data
      detailDialog.value.open = true
    } else {
      ElMessage.error(res.message || '获取日志详情失败')
    }
  } catch (error) {
    console.error('获取日志详情失败:', error)
    ElMessage.error('获取日志详情失败')
  }
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm('确认删除该条日志记录吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteSystemLog(row.id)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        fetchData()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch (error) {
      console.error('删除日志失败:', error)
      ElMessage.error('删除日志失败')
    }
  }).catch(() => {})
}

// 清空日志
const handleClear = () => {
  ElMessageBox.confirm('确认清空所有日志记录吗? 此操作不可逆!', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await clearSystemLogs()
      if (res.code === 200) {
        ElMessage.success('清空成功')
        fetchData()
        fetchOperationStats()
      } else {
        ElMessage.error(res.message || '清空失败')
      }
    } catch (error) {
      console.error('清空日志失败:', error)
      ElMessage.error('清空日志失败')
    }
  }).catch(() => {})
}

// 导出
const handleExport = async () => {
  try {
    // 不再调用后端API，改为前端直接生成CSV文件
    ElMessage.info('正在准备导出系统日志，请稍候...');
    
    // 准备导出数据
    let exportData = logList.value;
    if (!exportData || exportData.length === 0) {
      ElMessage.warning('暂无数据可导出');
      return;
    }
    
    // 定义CSV表头
    const headers = ['序号', '操作用户', '操作模块', '操作类型', '操作描述', 'IP地址', '操作状态', '执行时长(ms)', '操作时间'];
    
    // 添加BOM标记，确保Excel正确识别UTF-8编码
    let csvContent = '\uFEFF' + headers.join(',') + '\n';
    
    // 添加数据行
    exportData.forEach((item, index) => {
      const row = [
        index + 1,
        item.username || '',
        item.module || '',
        item.operation || '',
        item.description || '',
        item.ipAddress || '',
        item.status === 1 ? '成功' : '失败',
        item.executionTime || '0',
        item.createdAtStr || ''
      ];
      
      // 处理可能包含逗号的字段，用双引号包围
      const processedRow = row.map(field => {
        const fieldStr = String(field);
        return fieldStr.includes(',') ? `"${fieldStr}"` : fieldStr;
      });
      
      csvContent += processedRow.join(',') + '\n';
    });
    
    // 创建下载链接
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const fileName = `系统日志_${new Date().getTime()}.csv`;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    ElMessage.success('导出成功');
  } catch (error) {
    console.error('导出日志失败:', error);
    ElMessage.error('导出日志失败: ' + (error.message || '未知错误'));
  }
};

// 分页大小变化
const handleSizeChange = (size) => {
  queryParams.value.pageSize = size
  fetchData()
}

// 页码变化
const handleCurrentChange = (page) => {
  queryParams.value.pageNum = page
  fetchData()
}

// 格式化请求参数
const formatParams = (params) => {
  if (!params) return ''
  try {
    // 尝试解析JSON
    const obj = JSON.parse(params)
    return JSON.stringify(obj, null, 2)
  } catch (e) {
    // 解析失败，直接返回原字符串
    return params
  }
}
</script>

<style scoped>
.system-logs-container {
  padding: 0 10px;
}

.search-card, .stats-card, .table-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 16px;
  font-weight: bold;
}

.button-group {
  display: flex;
  gap: 10px;
}

.chart {
  height: 300px;
  width: 100%;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.param-content, .error-content {
  max-height: 200px;
  overflow-y: auto;
  background-color: #f5f7fa;
  padding: 8px;
  border-radius: 4px;
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-all;
}

.error-content {
  color: #f56c6c;
}

.delete-btn {
  color: #f56c6c;
}

.delete-btn:hover {
  color: #f78989;
}

.search-form .el-form-item {
  margin-bottom: 10px;
}
</style> 
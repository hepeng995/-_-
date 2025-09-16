<template>
  <div class="location-picker">
    <!-- 地址输入和搜索 -->
    <div class="address-input">
      <el-input
        v-model="addressInput"
        placeholder="输入地址进行搜索或在地图上点击选择位置"
        clearable
        @keyup.enter="searchAddress"
        @input="handleAddressInput"
      >
        <template #append>
          <el-button @click="searchAddress" :loading="searching">
            <el-icon><Search /></el-icon>
          </el-button>
        </template>
      </el-input>
    </div>
    
    <!-- 当前选中位置信息 -->
    <div class="location-info" v-if="selectedLocation.longitude && selectedLocation.latitude">
      <div class="location-item">
        <span class="label">经度：</span>
        <span class="value">{{ selectedLocation.longitude.toFixed(6) }}</span>
      </div>
      <div class="location-item">
        <span class="label">纬度：</span>
        <span class="value">{{ selectedLocation.latitude.toFixed(6) }}</span>
      </div>
      <div class="location-item" v-if="selectedLocation.address">
        <span class="label">地址：</span>
        <span class="value">{{ selectedLocation.address }}</span>
      </div>
    </div>
    
    <!-- 地图容器 -->
    <div class="map-wrapper">
      <div id="location-picker-map" class="location-map"></div>
      
      <!-- 地图工具栏 -->
      <div class="map-toolbar">
        <el-button-group>
          <el-button @click="getCurrentLocation" size="small">
            <el-icon><Location /></el-icon>
            当前位置
          </el-button>
          <el-button @click="clearSelection" size="small">
            <el-icon><Delete /></el-icon>
            清除选择
          </el-button>
        </el-button-group>
      </div>
    </div>
    
    <!-- 搜索结果 -->
    <div class="search-results" v-if="searchResults.length > 0">
      <h4>搜索结果</h4>
      <div class="results-list">
        <div 
          v-for="result in searchResults" 
          :key="result.id"
          class="result-item"
          @click="selectSearchResult(result)"
        >
          <div class="result-name">{{ result.name }}</div>
          <div class="result-address">{{ result.address }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Location, Delete } from '@element-plus/icons-vue'
import { loadAmapScript, createMap, createMarker, geocode, reverseGeocode, searchPlace, getCurrentPosition } from '@/utils/map'

// Props
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ longitude: null, latitude: null, address: '' })
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'change'])

// 响应式数据
const map = ref(null)
const marker = ref(null)
const geocoder = ref(null)
const addressInput = ref('')
const searching = ref(false)
const searchResults = ref([])
const searchTimer = ref(null)
const selectedLocation = ref({
  longitude: null,
  latitude: null,
  address: ''
})

// 地图配置已移到工具函数中

// 监听外部值变化
watch(() => props.modelValue, (newVal) => {
  if (newVal && newVal.longitude && newVal.latitude) {
    selectedLocation.value = { ...newVal }
    if (map.value) {
      updateMapLocation(newVal.longitude, newVal.latitude, newVal.address)
    }
  }
}, { immediate: true, deep: true })

// 监听内部选择变化
watch(selectedLocation, (newVal) => {
  emit('update:modelValue', { ...newVal })
  emit('change', { ...newVal })
}, { deep: true })

// 初始化地图
const initMap = async () => {
  try {
    // 创建地图实例
    map.value = await createMap('location-picker-map', {
      zoom: 13,
      center: [112.345678, 28.123456] // 桃源县中心坐标
    })
    
    // 添加地图控件
    map.value.addControl(new window.AMap.Scale())
    map.value.addControl(new window.AMap.ToolBar({
      locate: false
    }))
    
    // 创建地理编码服务
    geocoder.value = new window.AMap.Geocoder({
      city: '桃源县'
    })
    
    // 地图点击事件
    map.value.on('click', handleMapClick)
    
    // 如果有初始位置，显示标记
    if (selectedLocation.value.longitude && selectedLocation.value.latitude) {
      updateMapLocation(selectedLocation.value.longitude, selectedLocation.value.latitude, selectedLocation.value.address)
    }
    
  } catch (error) {
    console.error('地图初始化失败:', error)
    ElMessage.error('地图加载失败，请检查网络连接')
  }
}

// 处理地图点击
const handleMapClick = async (e) => {
  const { lng, lat } = e.lnglat
  
  try {
    const result = await reverseGeocode(lng, lat)
    
    selectedLocation.value = {
      longitude: lng,
      latitude: lat,
      address: result.formattedAddress
    }
    
    // 更新地图标记
    updateMapMarker(lng, lat, result.formattedAddress)
  } catch (error) {
    console.error('逆地理编码失败:', error)
    selectedLocation.value = {
      longitude: lng,
      latitude: lat,
      address: ''
    }
    updateMapMarker(lng, lat)
  }
}

// 更新地图位置
const updateMapLocation = (lng, lat, address = '') => {
  if (!map.value) return
  
  map.value.setCenter([lng, lat])
  map.value.setZoom(15)
  updateMapMarker(lng, lat, address)
}

// 更新地图标记
const updateMapMarker = (lng, lat, address = '') => {
  if (!map.value) return
  
  // 移除旧标记
  if (marker.value) {
    map.value.remove(marker.value)
  }
  
  // 添加新标记
  marker.value = createMarker([lng, lat], {
    draggable: true,
    icon: new window.AMap.Icon({
      size: new window.AMap.Size(36, 36),
      image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png'
    })
  })
  
  // 标记拖拽事件
  marker.value.on('dragend', async (e) => {
    const { lng: newLng, lat: newLat } = e.lnglat
    
    try {
      const result = await reverseGeocode(newLng, newLat)
      selectedLocation.value = {
        longitude: newLng,
        latitude: newLat,
        address: result.formattedAddress
      }
    } catch (error) {
      selectedLocation.value = {
        longitude: newLng,
        latitude: newLat,
        address: ''
      }
    }
  })
  
  map.value.add(marker.value)
  
  // 创建信息窗体
  if (address) {
    const infoWindow = new window.AMap.InfoWindow({
      content: `<div style="padding: 8px;">${address}</div>`,
      offset: new window.AMap.Pixel(0, -30)
    })
    
    marker.value.on('click', () => {
      infoWindow.open(map.value, [lng, lat])
    })
  }
}

// 搜索地址
const searchAddress = async () => {
  if (!addressInput.value.trim()) {
    ElMessage.warning('请输入搜索地址')
    return
  }
  
  searching.value = true
  
  try {
    // 确保地图API已加载
    if (!window.AMap) {
      await loadAmapScript()
    }
    
    const results = await searchPlace(addressInput.value, '桃源县')
    searchResults.value = results.map(result => ({
      id: result.id,
      name: result.name,
      address: result.address,
      location: result.location
    }))
    
    if (searchResults.value.length === 0) {
      ElMessage.info('未找到相关地址')
    }
  } catch (error) {
    console.error('搜索失败:', error)
    ElMessage.error('搜索失败，请重试')
    searchResults.value = []
  } finally {
    searching.value = false
  }
}

// 选择搜索结果
const selectSearchResult = (result) => {
  const { longitude, latitude } = result.location
  
  selectedLocation.value = {
    longitude,
    latitude,
    address: result.address || result.name
  }
  
  updateMapLocation(longitude, latitude, result.address || result.name)
  searchResults.value = []
  addressInput.value = result.name
}

// 处理地址输入防抖搜索
const handleAddressInput = (value) => {
  // 清除之前的定时器
  if (searchTimer.value) {
    clearTimeout(searchTimer.value)
  }
  
  // 如果输入为空，清空搜索结果
  if (!value || value.length < 2) {
    searchResults.value = []
    return
  }
  
  // 设置防抖延迟搜索
  searchTimer.value = setTimeout(() => {
    performSearch(value)
  }, 500)
}

// 执行搜索
const performSearch = async (keyword) => {
  if (!keyword.trim()) return
  
  searching.value = true
  
  try {
    // 确保地图API已加载
    if (!window.AMap) {
      await loadAmapScript()
    }
    
    const results = await searchPlace(keyword, '桃源县')
    searchResults.value = results.map(result => ({
      id: result.id,
      name: result.name,
      address: result.address,
      location: result.location
    }))
    
    // 如果有搜索结果，自动定位到第一个结果
    if (searchResults.value.length > 0) {
      const firstResult = searchResults.value[0]
      if (map.value && firstResult.location) {
        map.value.setCenter([firstResult.location.longitude, firstResult.location.latitude])
        map.value.setZoom(15)
      }
    }
    
  } catch (error) {
    console.error('搜索失败:', error)
  } finally {
    searching.value = false
  }
}

// 获取当前位置
const getCurrentLocation = async () => {
  try {
    const position = await getCurrentPosition()
    
    selectedLocation.value = {
      longitude: position.longitude,
      latitude: position.latitude,
      address: position.address
    }
    
    updateMapLocation(position.longitude, position.latitude, position.address)
    ElMessage.success('定位成功')
  } catch (error) {
    ElMessage.error('定位失败: ' + error.message)
  }
}

// 清除选择
const clearSelection = () => {
  selectedLocation.value = {
    longitude: null,
    latitude: null,
    address: ''
  }
  
  if (marker.value) {
    map.value.remove(marker.value)
    marker.value = null
  }
  
  addressInput.value = ''
  searchResults.value = []
}

// 组件挂载
onMounted(() => {
  // 延迟初始化地图，确保DOM已渲染
  setTimeout(() => {
    initMap()
  }, 100)
})

// 组件卸载
onUnmounted(() => {
  // 清除定时器
  if (searchTimer.value) {
    clearTimeout(searchTimer.value)
  }
  
  // 销毁地图
  if (map.value) {
    map.value.destroy()
  }
})
</script>

<style scoped>
.location-picker {
  width: 100%;
}

.address-input {
  margin-bottom: 16px;
}

.location-info {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 14px;
}

.location-item {
  display: flex;
  align-items: center;
}

.location-item .label {
  color: #64748b;
  margin-right: 8px;
  font-weight: 500;
}

.location-item .value {
  color: #1e293b;
}

.map-wrapper {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.location-map {
  width: 100%;
  height: 400px;
}

.map-toolbar {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 999;
}

.search-results {
  margin-top: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.search-results h4 {
  margin: 0;
  padding: 12px 16px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-size: 14px;
  color: #374151;
}

.results-list {
  max-height: 200px;
  overflow-y: auto;
}

.result-item {
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.result-item:hover {
  background: #f1f5f9;
}

.result-item:not(:last-child) {
  border-bottom: 1px solid #f1f5f9;
}

.result-name {
  font-weight: 500;
  color: #1e293b;
  margin-bottom: 4px;
}

.result-address {
  font-size: 12px;
  color: #64748b;
}

/* 高德地图样式覆盖 */
:deep(.amap-logo) {
  display: none !important;
}

:deep(.amap-copyright) {
  display: none !important;
}
</style>

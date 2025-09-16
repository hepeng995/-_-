<template>
  <el-dialog
    v-model="dialogVisible"
    title="景点位置"
    width="90%"
    top="5vh"
    :close-on-click-modal="false"
    :close-on-press-escape="true"
    @close="handleClose"
  >
    <div class="map-container">
      <div class="map-toolbar">
        <div class="location-info">
          <h3>{{ attraction?.name }}</h3>
          <p class="address">
            <el-icon><MapLocation /></el-icon>
            {{ attraction?.address }}
          </p>
        </div>
        <div class="map-actions">
          <el-button type="primary" @click="getCurrentLocation">
            <el-icon><Location /></el-icon>
            定位到景区
          </el-button>
          <el-button @click="handleNavigation">
            <el-icon><Compass /></el-icon>
            导航
          </el-button>
        </div>
      </div>
      
      <div id="amap-container" class="amap-container"></div>
      
      <div class="map-controls">
        <div class="zoom-controls">
          <el-button-group>
            <el-button @click="zoomIn">
              <el-icon><Plus /></el-icon>
            </el-button>
            <el-button @click="zoomOut">
              <el-icon><Minus /></el-icon>
            </el-button>
          </el-button-group>
        </div>
        
      </div>
      
      <div class="nearby-places" v-if="nearbyPlaces.length > 0">
        <h4>附近地点</h4>
        <div class="places-list">
          <div 
            v-for="place in nearbyPlaces" 
            :key="place.id"
            class="place-item"
            @click="focusOnPlace(place)"
          >
            <div class="place-icon">
              <el-icon><LocationFilled /></el-icon>
            </div>
            <div class="place-info">
              <div class="place-name">{{ place.name }}</div>
              <div class="place-distance">{{ place.distance }}m</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { MapLocation, Location, Compass, Plus, Minus, LocationFilled } from '@element-plus/icons-vue'
import { loadAmapScript, createMap, createMarker, createInfoWindow, searchNearby, getCurrentPosition, openNavigation } from '@/utils/map'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  attraction: {
    type: Object,
    default: () => ({})
  }
})

// Emits
const emit = defineEmits(['update:visible', 'close'])

// 响应式数据
const dialogVisible = ref(false)
const map = ref(null)
const marker = ref(null)
const userMarker = ref(null)
const nearbyPlaces = ref([])
const userLocation = ref(null)

// 监听弹窗显示状态
watch(() => props.visible, (newVal) => {
  dialogVisible.value = newVal
  if (newVal && props.attraction?.longitude && props.attraction?.latitude) {
    // 延迟初始化，确保DOM已渲染
    setTimeout(() => {
      initMap()
    }, 200)
  }
})

// 初始化地图
const initMap = async () => {
  try {
    if (!props.attraction?.longitude || !props.attraction?.latitude) {
      ElMessage.error('景点位置信息不完整')
      return
    }
    
    // 创建地图实例
    map.value = await createMap('amap-container', {
      zoom: 15,
      center: [props.attraction.longitude, props.attraction.latitude]
    })
    
    // 添加地图控件
    map.value.addControl(new window.AMap.Scale())
    map.value.addControl(new window.AMap.ToolBar())
    
    // 添加景点标记
    addAttractionMarker()
    
    // 搜索附近地点
    searchNearbyPlaces()
    
  } catch (error) {
    console.error('地图初始化失败:', error)
    ElMessage.error('地图加载失败，请检查网络连接')
  }
}

// 添加景点标记
const addAttractionMarker = () => {
  if (!map.value) return
  
  const position = [props.attraction.longitude, props.attraction.latitude]
  
  marker.value = createMarker(position, {
    title: props.attraction.name,
    icon: new window.AMap.Icon({
      size: new window.AMap.Size(40, 50),
      image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
      imageOffset: new window.AMap.Pixel(0, 0)
    })
  })
  
  // 创建信息窗体
  const infoContent = `
    <div style="padding: 10px;">
      <h4>${props.attraction.name}</h4>
      <p>${props.attraction.address}</p>
      <p>评分: ${props.attraction.rating || '暂无'}</p>
      ${props.attraction.ticketPrice ? `<p>门票: ¥${props.attraction.ticketPrice}</p>` : ''}
    </div>
  `
  
  const infoWindow = createInfoWindow(infoContent)
  
  // 点击标记显示信息窗体
  marker.value.on('click', () => {
    infoWindow.open(map.value, position)
  })
  
  map.value.add(marker.value)
}

// 搜索附近地点
const searchNearbyPlaces = async () => {
  try {
    const center = [props.attraction.longitude, props.attraction.latitude]
    const places = await searchNearby(center, 2000)
    nearbyPlaces.value = places.filter(place => place.distance > 0) // 过滤掉当前景点
  } catch (error) {
    console.error('搜索附近地点失败:', error)
  }
}

// 获取用户当前位置 - 修改为定位到当前景区
const getCurrentLocation = () => {
  if (!props.attraction?.longitude || !props.attraction?.latitude) {
    ElMessage.warning('景点位置信息不完整')
    return
  }
  
  // 定位到当前景区位置
  map.value.setCenter([props.attraction.longitude, props.attraction.latitude])
  map.value.setZoom(16)
  
  ElMessage.success('已定位到景区位置')
}

// 打开导航
const handleNavigation = () => {
  const destination = {
    longitude: props.attraction.longitude,
    latitude: props.attraction.latitude,
    name: props.attraction.name
  }
  
  openNavigation(destination, userLocation.value)
}

// 地图缩放
const zoomIn = () => {
  if (map.value) {
    map.value.zoomIn()
  }
}

const zoomOut = () => {
  if (map.value) {
    map.value.zoomOut()
  }
}


// 聚焦到指定地点
const focusOnPlace = (place) => {
  if (map.value && place.location) {
    map.value.setCenter([place.location.lng, place.location.lat])
    map.value.setZoom(16)
    
    // 添加临时标记
    const tempMarker = new AMap.Marker({
      position: [place.location.lng, place.location.lat],
      title: place.name
    })
    
    map.value.add(tempMarker)
    
    // 3秒后移除临时标记
    setTimeout(() => {
      map.value.remove(tempMarker)
    }, 3000)
  }
}

// 关闭弹窗
const handleClose = () => {
  emit('update:visible', false)
  emit('close')
  
  // 清理地图资源
  if (map.value) {
    map.value.destroy()
    map.value = null
  }
  marker.value = null
  userMarker.value = null
  nearbyPlaces.value = []
  userLocation.value = null
}

// 组件卸载时清理
onUnmounted(() => {
  if (map.value) {
    map.value.destroy()
  }
})
</script>

<style scoped>
.map-container {
  height: 80vh;
  position: relative;
  display: flex;
  flex-direction: column;
}

.map-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  border-radius: 8px 8px 0 0;
}

.location-info h3 {
  margin: 0 0 8px 0;
  color: #1e293b;
  font-size: 18px;
  font-weight: 600;
}

.address {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #64748b;
  font-size: 14px;
}

.map-actions {
  display: flex;
  gap: 12px;
}

.amap-container {
  flex: 1;
  min-height: 500px;
  position: relative;
}

.map-controls {
  position: absolute;
  top: 80px;
  right: 20px;
  z-index: 999;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.zoom-controls {
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}


.nearby-places {
  position: absolute;
  left: 20px;
  top: 80px;
  width: 280px;
  max-height: 300px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  overflow: hidden;
  z-index: 999;
}

.nearby-places h4 {
  margin: 0;
  padding: 16px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-size: 14px;
  color: #374151;
  font-weight: 600;
}

.places-list {
  max-height: 250px;
  overflow-y: auto;
}

.place-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.place-item:hover {
  background: #f1f5f9;
}

.place-item:not(:last-child) {
  border-bottom: 1px solid #f1f5f9;
}

.place-icon {
  color: #3b82f6;
  margin-right: 12px;
}

.place-info {
  flex: 1;
}

.place-name {
  font-size: 14px;
  color: #1e293b;
  margin-bottom: 4px;
}

.place-distance {
  font-size: 12px;
  color: #64748b;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .map-toolbar {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .map-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .nearby-places {
    position: relative;
    width: 100%;
    left: 0;
    top: 0;
    margin-top: 16px;
  }
  
  .map-controls {
    right: 10px;
    top: 60px;
  }
  
  .zoom-controls {
    margin-bottom: 12px;
  }
}

/* 高德地图样式覆盖 */
:deep(.amap-logo) {
  display: none !important;
}

:deep(.amap-copyright) {
  display: none !important;
}
</style>

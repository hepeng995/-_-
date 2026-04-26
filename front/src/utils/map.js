/**
 * 地图相关工具函数
 */

// 高德地图API配置
export const AMAP_CONFIG = {
  key: '6308c87836db572478a7040d02401c31', // 🔑 请在这里替换您的高德地图API Key
  version: '2.0',
  plugins: [
    'AMap.Geocoder',
    'AMap.PlaceSearch', 
    'AMap.Geolocation',
    'AMap.AutoComplete',
    'AMap.Scale',
    'AMap.ToolBar'
  ]
}

// 地图样式配置
export const MAP_STYLES = {
  normal: 'amap://styles/normal',      // 标准地图
  satellite: 'amap://styles/satellite', // 卫星地图
  roadnet: 'amap://styles/roadnet',    // 路网地图
  dark: 'amap://styles/dark',          // 暗色地图
  light: 'amap://styles/light',        // 浅色地图
  fresh: 'amap://styles/fresh'         // 清新地图
}

// 默认地图中心点（全国中心）
export const DEFAULT_CENTER = [106.551557, 29.563009]

// 默认地图缩放级别
export const DEFAULT_ZOOM = 13

/**
 * 加载高德地图API
 * @returns {Promise}
 */
export function loadAmapScript() {
  return new Promise((resolve, reject) => {
    if (window.AMap) {
      resolve(window.AMap)
      return
    }
    
    const script = document.createElement('script')
    const pluginStr = AMAP_CONFIG.plugins.join(',')
    script.src = `https://webapi.amap.com/maps?v=${AMAP_CONFIG.version}&key=${AMAP_CONFIG.key}&plugin=${pluginStr}`
    script.onload = () => resolve(window.AMap)
    script.onerror = reject
    document.head.appendChild(script)
  })
}

/**
 * 创建地图实例
 * @param {string} container - 地图容器ID
 * @param {Object} options - 地图配置选项
 * @returns {Promise<AMap.Map>}
 */
export async function createMap(container, options = {}) {
  const AMap = await loadAmapScript()
  
  const defaultOptions = {
    zoom: DEFAULT_ZOOM,
    center: DEFAULT_CENTER,
    mapStyle: MAP_STYLES.normal,
    resizeEnable: true,
    rotateEnable: true,
    pitchEnable: true,
    zoomEnable: true,
    dragEnable: true
  }
  
  return new AMap.Map(container, { ...defaultOptions, ...options })
}

/**
 * 创建标记点
 * @param {Array} position - [经度, 纬度]
 * @param {Object} options - 标记选项
 * @returns {AMap.Marker}
 */
export function createMarker(position, options = {}) {
  const defaultOptions = {
    position,
    draggable: false,
    icon: new window.AMap.Icon({
      size: new window.AMap.Size(25, 34),
      image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png'
    })
  }
  
  return new window.AMap.Marker({ ...defaultOptions, ...options })
}

/**
 * 创建信息窗体
 * @param {string} content - 窗体内容
 * @param {Object} options - 窗体选项
 * @returns {AMap.InfoWindow}
 */
export function createInfoWindow(content, options = {}) {
  const defaultOptions = {
    content,
    offset: new window.AMap.Pixel(0, -30),
    closeWhenClickMap: true
  }
  
  return new window.AMap.InfoWindow({ ...defaultOptions, ...options })
}

/**
 * 地理编码 - 地址转坐标
 * @param {string} address - 地址
 * @param {string} city - 城市（可选）
 * @returns {Promise<Object>}
 */
export function geocode(address, city = '') {
  return new Promise((resolve, reject) => {
    const geocoder = new window.AMap.Geocoder({ city })
    
    geocoder.getLocation(address, (status, result) => {
      if (status === 'complete' && result.geocodes.length > 0) {
        const location = result.geocodes[0].location
        resolve({
          longitude: location.lng,
          latitude: location.lat,
          formattedAddress: result.geocodes[0].formattedAddress
        })
      } else {
        reject(new Error('地址解析失败'))
      }
    })
  })
}

/**
 * 逆地理编码 - 坐标转地址
 * @param {number} lng - 经度
 * @param {number} lat - 纬度
 * @returns {Promise<Object>}
 */
export function reverseGeocode(lng, lat) {
  return new Promise((resolve, reject) => {
    const geocoder = new window.AMap.Geocoder()
    
    geocoder.getAddress([lng, lat], (status, result) => {
      if (status === 'complete' && result.regeocode) {
        const regeocode = result.regeocode
        resolve({
          formattedAddress: regeocode.formattedAddress,
          addressComponent: regeocode.addressComponent,
          pois: regeocode.pois || []
        })
      } else {
        reject(new Error('坐标解析失败'))
      }
    })
  })
}

/**
 * 搜索地点
 * @param {string} keyword - 搜索关键词
 * @param {string} city - 城市
 * @param {Object} options - 搜索选项
 * @returns {Promise<Array>}
 */
export function searchPlace(keyword, city = '', options = {}) {
  return new Promise((resolve, reject) => {
    const defaultOptions = {
      city,
      pageSize: 20,
      pageIndex: 1
    }
    
    const placeSearch = new window.AMap.PlaceSearch({ ...defaultOptions, ...options })
    
    placeSearch.search(keyword, (status, result) => {
      if (status === 'complete' && result.poiList) {
        const places = result.poiList.pois.map(poi => ({
          id: poi.id,
          name: poi.name,
          address: poi.address,
          location: {
            longitude: poi.location.lng,
            latitude: poi.location.lat
          },
          distance: poi.distance,
          type: poi.type,
          tel: poi.tel
        }))
        resolve(places)
      } else {
        reject(new Error('搜索失败'))
      }
    })
  })
}

/**
 * 搜索附近地点
 * @param {Array} center - 中心点坐标 [经度, 纬度]
 * @param {number} radius - 搜索半径（米）
 * @param {string} type - 地点类型
 * @returns {Promise<Array>}
 */
export function searchNearby(center, radius = 2000, type = '') {
  return new Promise((resolve, reject) => {
    const placeSearch = new window.AMap.PlaceSearch({
      type: type || '风景名胜|旅游景点|餐饮服务|购物服务|生活服务',
      pageSize: 20,
      pageIndex: 1,
      city: ''
    })
    
    placeSearch.searchNearBy('', center, radius, (status, result) => {
      if (status === 'complete' && result.poiList) {
        const places = result.poiList.pois.map(poi => ({
          id: poi.id,
          name: poi.name,
          address: poi.address,
          location: {
            longitude: poi.location.lng,
            latitude: poi.location.lat
          },
          distance: Math.round(poi.distance),
          type: poi.type,
          tel: poi.tel
        }))
        resolve(places)
      } else {
        resolve([])
      }
    })
  })
}

/**
 * 获取当前位置
 * @param {Object} options - 定位选项
 * @returns {Promise<Object>}
 */
export function getCurrentPosition(options = {}) {
  return new Promise((resolve, reject) => {
    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    }
    
    const geolocation = new window.AMap.Geolocation({ ...defaultOptions, ...options })
    
    geolocation.getCurrentPosition((status, result) => {
      if (status === 'complete') {
        resolve({
          longitude: result.position.lng,
          latitude: result.position.lat,
          accuracy: result.accuracy,
          address: result.formattedAddress || ''
        })
      } else {
        reject(new Error(result.message || '定位失败'))
      }
    })
  })
}

/**
 * 计算两点间距离
 * @param {Array} point1 - 点1坐标 [经度, 纬度]
 * @param {Array} point2 - 点2坐标 [经度, 纬度]
 * @returns {number} 距离（米）
 */
export function calculateDistance(point1, point2) {
  const lngLat1 = new window.AMap.LngLat(point1[0], point1[1])
  const lngLat2 = new window.AMap.LngLat(point2[0], point2[1])
  return Math.round(lngLat1.distance(lngLat2))
}

/**
 * 打开高德地图导航
 * @param {Object} destination - 目的地信息
 * @param {Object} origin - 起点信息（可选）
 * @param {string} mode - 导航模式：car, bus, walk
 */
export function openNavigation(destination, origin = null, mode = 'car') {
  const { longitude: toLng, latitude: toLat, name: toName } = destination
  
  let url = `https://uri.amap.com/navigation?`
  
  if (origin) {
    const { longitude: fromLng, latitude: fromLat } = origin
    url += `from=${fromLng},${fromLat}&`
  }
  
  url += `to=${toLng},${toLat}&toname=${encodeURIComponent(toName || '目的地')}&mode=${mode}`
  
  window.open(url, '_blank')
}

/**
 * 格式化坐标显示
 * @param {number} coordinate - 坐标值
 * @param {number} precision - 精度（小数位数）
 * @returns {string}
 */
export function formatCoordinate(coordinate, precision = 6) {
  return coordinate ? coordinate.toFixed(precision) : '0.000000'
}

/**
 * 验证坐标是否有效
 * @param {number} lng - 经度
 * @param {number} lat - 纬度
 * @returns {boolean}
 */
export function isValidCoordinate(lng, lat) {
  return (
    typeof lng === 'number' && 
    typeof lat === 'number' &&
    lng >= -180 && lng <= 180 &&
    lat >= -90 && lat <= 90
  )
}

/**
 * 坐标转换 - WGS84转GCJ02（高德地图坐标系）
 * @param {number} lng - WGS84经度
 * @param {number} lat - WGS84纬度
 * @returns {Array} [GCJ02经度, GCJ02纬度]
 */
export function wgs84ToGcj02(lng, lat) {
  const a = 6378245.0
  const ee = 0.00669342162296594323
  
  let dLat = transformLat(lng - 105.0, lat - 35.0)
  let dLng = transformLng(lng - 105.0, lat - 35.0)
  
  const radLat = (lat / 180.0) * Math.PI
  let magic = Math.sin(radLat)
  magic = 1 - ee * magic * magic
  const sqrtMagic = Math.sqrt(magic)
  
  dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * Math.PI)
  dLng = (dLng * 180.0) / (a / sqrtMagic * Math.cos(radLat) * Math.PI)
  
  return [lng + dLng, lat + dLat]
}

// 辅助函数
function transformLat(lng, lat) {
  let ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng))
  ret += (20.0 * Math.sin(6.0 * lng * Math.PI) + 20.0 * Math.sin(2.0 * lng * Math.PI)) * 2.0 / 3.0
  ret += (20.0 * Math.sin(lat * Math.PI) + 40.0 * Math.sin(lat / 3.0 * Math.PI)) * 2.0 / 3.0
  ret += (160.0 * Math.sin(lat / 12.0 * Math.PI) + 320 * Math.sin(lat * Math.PI / 30.0)) * 2.0 / 3.0
  return ret
}

function transformLng(lng, lat) {
  let ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng))
  ret += (20.0 * Math.sin(6.0 * lng * Math.PI) + 20.0 * Math.sin(2.0 * lng * Math.PI)) * 2.0 / 3.0
  ret += (20.0 * Math.sin(lng * Math.PI) + 40.0 * Math.sin(lng / 3.0 * Math.PI)) * 2.0 / 3.0
  ret += (150.0 * Math.sin(lng / 12.0 * Math.PI) + 300.0 * Math.sin(lng / 30.0 * Math.PI)) * 2.0 / 3.0
  return ret
}

export default {
  AMAP_CONFIG,
  MAP_STYLES,
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  loadAmapScript,
  createMap,
  createMarker,
  createInfoWindow,
  geocode,
  reverseGeocode,
  searchPlace,
  searchNearby,
  getCurrentPosition,
  calculateDistance,
  openNavigation,
  formatCoordinate,
  isValidCoordinate,
  wgs84ToGcj02
}

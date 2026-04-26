<template>
  <div class="route-map-section" v-if="hasValidItems">
    <div class="section-card">
      <h2 class="section-title">路线地图</h2>
      <div class="map-container" ref="mapContainer"></div>
      <div class="map-actions">
        <a
          :href="amapFullLink"
          target="_blank"
          class="amap-view-btn"
        >
          📍 在高德地图中查看完整行程
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  routeName: {
    type: String,
    default: '旅游路线'
  }
})

const mapContainer = ref(null)
let mapInstance = null

const dayColors = ['#3366FF', '#FF6633', '#33CC66', '#9966FF', '#FF3399', '#00CCCC']

const hasValidItems = computed(() => {
  return props.items.some(item => item.attractionLongitude && item.attractionLatitude)
})

const validItems = computed(() => {
  return props.items.filter(item => item.attractionLongitude && item.attractionLatitude)
})

const groupedByDay = computed(() => {
  const groups = {}
  validItems.value.forEach(item => {
    const day = item.dayNumber
    if (!groups[day]) groups[day] = []
    groups[day].push(item)
  })
  return groups
})

const amapFullLink = computed(() => {
  if (validItems.value.length === 0) return '#'
  const first = validItems.value[0]
  const last = validItems.value[validItems.value.length - 1]
  return `https://uri.amap.com/navigation?to=${last.attractionLongitude},${last.attractionLatitude},${last.attractionName || '目的地'}&from=${first.attractionLongitude},${first.attractionLatitude},${first.attractionName || '起点'}&mode=car&policy=1`
})

const initMap = () => {
  if (!window.AMap || !mapContainer.value || validItems.value.length === 0) return

  const center = getCenter()
  mapInstance = new window.AMap.Map(mapContainer.value, {
    zoom: 11,
    center: center,
    viewMode: '2D'
  })

  const days = Object.keys(groupedByDay.value).sort((a, b) => a - b)
  days.forEach((day, idx) => {
    const dayItems = groupedByDay.value[day]
    const color = dayColors[idx % dayColors.length]
    addMarkersAndPath(dayItems, color, `第${day}天`, idx + 1)
  })

  fitView()
}

const getCenter = () => {
  if (validItems.value.length === 0) return [112.0, 28.9]
  const lngs = validItems.value.map(i => Number(i.attractionLongitude))
  const lats = validItems.value.map(i => Number(i.attractionLatitude))
  return [
    (Math.min(...lngs) + Math.max(...lngs)) / 2,
    (Math.min(...lats) + Math.max(...lats)) / 2
  ]
}

const addMarkersAndPath = (dayItems, color, dayTitle, dayNum) => {
  const path = []

  dayItems.forEach((item, index) => {
    const position = [Number(item.attractionLongitude), Number(item.attractionLatitude)]
    path.push(position)

    const marker = new window.AMap.Marker({
      position,
      title: item.attractionName || '',
      map: mapInstance,
      label: {
        content: `<span style="background:${color};color:#fff;padding:2px 6px;border-radius:10px;font-size:12px;white-space:nowrap;">${dayTitle} · ${item.attractionName || '景点'}</span>`,
        direction: 'top'
      }
    })

    const infoWindow = new window.AMap.InfoWindow({
      content: `<div style="padding:8px 12px;font-size:14px;"><b style="color:${color}">${dayTitle}</b><br/>${item.attractionName || '景点'}${item.suggestedDuration ? '（' + item.suggestedDuration + '）' : ''}</div>`,
      offset: new window.AMap.Pixel(0, -30),
      closeWhenClickMap: true
    })

    marker.on('click', () => {
      infoWindow.open(mapInstance, marker.getPosition())
    })
  })

  if (path.length > 1) {
    new window.AMap.Polyline({
      path,
      isOutline: true,
      outlineColor: '#ffffff',
      borderWeight: 2,
      strokeColor: color,
      strokeWeight: 4,
      strokeStyle: 'solid',
      strokeOpacity: 0.85,
      map: mapInstance
    })
  }
}

const fitView = () => {
  if (!mapInstance) return
  const allLngs = validItems.value.map(i => Number(i.attractionLongitude))
  const allLats = validItems.value.map(i => Number(i.attractionLatitude))
  if (allLngs.length > 0) {
    mapInstance.setFitView(null, false, [50, 50, 50, 50])
  }
}

const loadAMapScript = () => {
  if (window.AMap) {
    initMap()
    return
  }
  const url = `https://webapi.amap.com/maps?v=2.0&key=${import.meta.env.VITE_AMAP_KEY || ''}`
  const script = document.createElement('script')
  script.charset = 'utf-8'
  script.src = url
  script.onload = () => initMap()
  script.onerror = () => console.warn('高德地图加载失败，地图功能不可用')
  document.head.appendChild(script)
}

watch(() => props.items, () => {
  if (mapInstance) {
    mapInstance.destroy()
    mapInstance = null
  }
  loadAMapScript()
}, { deep: true })

onMounted(() => {
  loadAMapScript()
})
</script>

<style scoped>
.route-map-section {
  margin-top: 20px;
}

.section-card {
  background: var(--color-bg-surface);
  border-radius: var(--radius-xl);
  padding: 32px;
  box-shadow: var(--shadow-card);
}

.section-title {
  font-size: 22px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 18px;
  padding-left: 14px;
  border-left: 4px solid var(--color-primary-600);
}

.map-container {
  height: 450px;
  border-radius: 12px;
  overflow: hidden;
  background: #f0f0f0;
}

.map-actions {
  margin-top: 16px;
  text-align: center;
}

.amap-view-btn {
  display: inline-block;
  background: linear-gradient(135deg, #3366FF, #3665ff);
  color: white;
  padding: 10px 24px;
  border-radius: 20px;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(51, 102, 255, 0.3);
  transition: all 0.2s ease;
}

.amap-view-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(51, 102, 255, 0.4);
}

@media (max-width: 768px) {
  .map-container {
    height: 300px;
  }

  .section-card {
    padding: 20px;
  }
}
</style>

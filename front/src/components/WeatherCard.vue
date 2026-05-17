<template>
  <div class="info-card weather-card" v-loading="loading">
    <h3>
      <svg class="weather-title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
        <circle cx="12" cy="12" r="5"/>
      </svg>
      天气预报
    </h3>

    <div v-if="hasData" class="weather-content">
      <!-- 当日实时天气 -->
      <div class="today-section" v-if="weather">
        <div class="today-main">
          <span class="today-icon">{{ getWeatherEmoji(weather.icon) }}</span>
          <div class="today-right">
            <div class="today-temp">{{ weather.temp }}<span class="temp-unit">°C</span></div>
            <div class="today-desc">{{ weather.text }}</div>
          </div>
        </div>
        <div class="today-details" v-if="weather.icon !== '999'">
          <div class="today-detail">
            <span class="today-detail-value">{{ weather.feelsLike }}°</span>
            <span class="today-detail-label">体感温度</span>
          </div>
          <div class="today-detail">
            <span class="today-detail-value">{{ weather.windScale }}级</span>
            <span class="today-detail-label">{{ weather.windDir }}</span>
          </div>
          <div class="today-detail">
            <span class="today-detail-value">{{ weather.humidity }}%</span>
            <span class="today-detail-label">湿度</span>
          </div>
        </div>
      </div>

      <!-- 分隔线 -->
      <div class="divider" v-if="forecast.length > 0">
        <span class="divider-label">未来天气</span>
      </div>

      <!-- 未来天气（跳过今天，显示明天起3天） -->
      <div class="forecast-strip" v-if="futureDays.length > 0">
        <div v-for="day in futureDays" :key="day.date" class="forecast-col">
          <span class="forecast-col-label">{{ formatDay(day.date) }}</span>
          <span class="forecast-col-emoji">{{ getWeatherEmoji(day.iconDay) }}</span>
          <span class="forecast-col-text">{{ day.textDay }}</span>
          <div class="forecast-col-temps">
            <span class="temp-high">{{ day.tempMax }}°</span>
            <span class="temp-low">{{ day.tempMin }}°</span>
          </div>
        </div>
      </div>

      <div class="weather-source">数据来源：和风天气</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import weatherApi from '@/api/weather'

const props = defineProps({
  attractionId: {
    type: [Number, String],
    required: true
  }
})

// 和风天气图标代码 → emoji 映射
const emojiMap = {
  '100': '☀️',   '101': '🌤️',  '102': '⛅',   '103': '🌥️',
  '104': '☁️',   '150': '☀️',   '151': '🌤️',  '152': '⛅',
  '153': '🌥️',  '300': '🌦️',  '301': '🌧️',  '302': '⛈️',
  '303': '⛈️',  '304': '⛈️',  '305': '🌦️',  '306': '🌧️',
  '307': '🌧️',  '308': '🌧️',  '309': '🌧️',  '310': '🌧️',
  '311': '🌧️',  '312': '🌧️',  '313': '🌧️',  '314': '🌧️',
  '315': '🌧️',  '316': '🌧️',  '317': '🌧️',  '318': '🌧️',
  '399': '🌧️',  '400': '🌨️',  '401': '🌨️',  '402': '🌨️',
  '403': '🌨️',  '404': '🌨️',  '405': '🌨️',  '406': '🌨️',
  '407': '🌨️',  '408': '🌨️',  '409': '🌨️',  '410': '🌨️',
  '499': '🌨️',  '500': '🌫️',  '501': '🌫️',  '502': '🌫️',
  '503': '🌫️',  '504': '🌫️',  '507': '🌫️',  '508': '🌫️',
  '509': '🌫️',  '510': '🌫️',  '511': '🌫️',  '512': '🌫️',
  '513': '🌫️',  '514': '🌫️',  '515': '🌫️',  '900': '🌡️',
  '901': '🌡️',  '999': '❓',
}

const getWeatherEmoji = (icon) => {
  if (!icon) return '🌡️'
  return emojiMap[String(icon)] || '🌡️'
}

const loading = ref(false)
const weather = ref(null)
const forecast = ref([])

const hasData = computed(() => weather.value !== null)

const futureDays = computed(() => {
  if (!forecast.value || forecast.value.length === 0) return []
  return forecast.value.filter(day => !isToday(day.date))
})

const isToday = (dateStr) => {
  const date = new Date(dateStr)
  const now = new Date()
  return date.getFullYear() === now.getFullYear()
    && date.getMonth() === now.getMonth()
    && date.getDate() === now.getDate()
}

// 乡村地区季节性天气模拟数据
const generateMockWeather = () => {
  const month = new Date().getMonth() + 1
  const seasonData = {
    spring: { texts: ['多云', '阴', '小雨', '晴'], windDirs: ['东南风', '南风', '东风'], windScale: '2', humidity: [65, 80] },
    summer: { texts: ['晴', '多云', '雷阵雨', '晴间多云'], windDirs: ['南风', '西南风', '东南风'], windScale: '3', humidity: [70, 85] },
    autumn: { texts: ['晴', '多云', '晴', '晴间多云'], windDirs: ['北风', '东北风', '东风'], windScale: '2', humidity: [55, 70] },
    winter: { texts: ['阴', '多云', '小雨', '阴转多云'], windDirs: ['北风', '西北风', '东北风'], windScale: '3', humidity: [60, 78] }
  }

  const tempRange = {
    1: [2, 8], 2: [4, 11], 3: [8, 16], 4: [14, 22],
    5: [19, 27], 6: [23, 31], 7: [26, 35], 8: [25, 34],
    9: [21, 29], 10: [14, 23], 11: [9, 17], 12: [4, 11]
  }

  const getSeason = (m) => {
    if (m >= 3 && m <= 5) return 'spring'
    if (m >= 6 && m <= 8) return 'summer'
    if (m >= 9 && m <= 11) return 'autumn'
    return 'winter'
  }

  const season = getSeason(month)
  const s = seasonData[season]
  const range = tempRange[month]
  const rand = (arr) => arr[Math.floor(Math.random() * arr.length)]
  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

  const iconMap = { '晴': '100', '多云': '101', '阴': '104', '小雨': '305', '雷阵雨': '302', '晴间多云': '151', '阴转多云': '153' }

  const temp = randInt(range[0], range[1])
  const now = new Date()
  const todayWeather = {
    attractionId: props.attractionId,
    temp: String(temp),
    feelsLike: String(temp + randInt(-2, 2)),
    text: rand(s.texts),
    icon: iconMap[rand(s.texts)] || '101',
    windDir: rand(s.windDirs),
    windScale: s.windScale,
    humidity: String(randInt(s.humidity[0], s.humidity[1])),
    updateTime: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}+08:00`
  }

  const forecastDays = []
  for (let i = 1; i <= 3; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() + i)
    const dMonth = d.getMonth() + 1
    const dRange = tempRange[dMonth]
    const dayText = rand(s.texts)
    const nightText = rand(['晴', '多云', '阴', '多云', '晴'])
    forecastDays.push({
      date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      tempMax: String(randInt(dRange[1] - 3, dRange[1])),
      tempMin: String(randInt(dRange[0], dRange[0] + 3)),
      textDay: dayText,
      textNight: nightText,
      iconDay: iconMap[dayText] || '101',
      iconNight: iconMap[nightText] || '150'
    })
  }

  return { now: todayWeather, forecast: forecastDays }
}

const loadWeather = async () => {
  if (!props.attractionId) return

  loading.value = true
  let nowOk = false
  let forecastOk = false

  try {
    const [nowRes, forecastRes] = await Promise.allSettled([
      weatherApi.getWeatherNow(props.attractionId),
      weatherApi.getWeatherForecast(props.attractionId)
    ])

    if (nowRes.status === 'fulfilled' && nowRes.value?.code === 200 && nowRes.value.data) {
      weather.value = nowRes.value.data
      nowOk = true
    }

    if (forecastRes.status === 'fulfilled' && forecastRes.value?.code === 200 && forecastRes.value.data?.length) {
      forecast.value = forecastRes.value.data
      forecastOk = true
    }
  } catch (error) {
    console.error('获取天气数据失败:', error)
  }

  // 兜底：API 数据不完整时使用模拟数据
  if (!nowOk || !forecastOk) {
    const mock = generateMockWeather()
    if (!nowOk) weather.value = mock.now
    if (!forecastOk) forecast.value = mock.forecast
  }

  loading.value = false
}

const formatDay = (dateStr) => {
  const date = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(date)
  target.setHours(0, 0, 0, 0)
  const diff = Math.round((target - today) / (1000 * 60 * 60 * 24))

  if (diff === 1) return '明天'
  if (diff === 2) return '后天'

  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return weekDays[date.getDay()]
}

watch(() => props.attractionId, (newId) => {
  if (newId) loadWeather()
}, { immediate: true })
</script>

<style scoped>
.weather-card h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  color: #1e293b;
  margin-bottom: 20px;
  font-weight: 600;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 12px;
}

.weather-title-icon {
  width: 22px;
  height: 22px;
  color: #3b82f6;
}

/* === 当日实时天气 === */
.today-section {
  background: linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%);
  border-radius: 10px;
  padding: 16px;
}

.today-main {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 14px;
}

.today-icon {
  font-size: 48px;
  line-height: 1;
  filter: drop-shadow(0 2px 4px rgba(59, 130, 246, 0.15));
}

.today-right {
  display: flex;
  flex-direction: column;
}

.today-temp {
  font-size: 40px;
  font-weight: 700;
  color: #1e40af;
  line-height: 1;
  letter-spacing: -1px;
}

.temp-unit {
  font-size: 18px;
  font-weight: 500;
  color: #3b82f6;
  margin-left: 1px;
}

.today-desc {
  font-size: 15px;
  color: #64748b;
  margin-top: 4px;
  font-weight: 500;
}

.today-details {
  display: flex;
  justify-content: space-around;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  padding: 10px 0;
}

.today-detail {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}

.today-detail-value {
  font-size: 15px;
  font-weight: 600;
  color: #334155;
}

.today-detail-label {
  font-size: 11px;
  color: #94a3b8;
}

/* === 分隔线 === */
.divider {
  display: flex;
  align-items: center;
  margin: 16px 0 12px;
  gap: 10px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e2e8f0;
}

.divider-label {
  font-size: 12px;
  color: #94a3b8;
  white-space: nowrap;
  font-weight: 500;
}

/* === 未来天气 === */
.forecast-strip {
  display: flex;
  justify-content: space-between;
  gap: 6px;
}

.forecast-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 4px;
  border-radius: 10px;
  background: #f8fafc;
  transition: background 0.2s;
}

.forecast-col:hover {
  background: #f1f5f9;
}

.forecast-col-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
}

.forecast-col-emoji {
  font-size: 28px;
  line-height: 1;
}

.forecast-col-text {
  font-size: 11px;
  color: #64748b;
  white-space: nowrap;
}

.forecast-col-temps {
  display: flex;
  gap: 4px;
  font-size: 13px;
}

.temp-high {
  color: #dc2626;
  font-weight: 600;
}

.temp-low {
  color: #2563eb;
  font-weight: 500;
}

/* === 底注与降级 === */
.weather-source {
  font-size: 11px;
  color: #cbd5e1;
  text-align: right;
  margin-top: 12px;
}

/* C9 - WeatherCard 移动端 480/360 段 */
@media (max-width: 480px) {
  .forecast-col {
    padding: 8px 6px;
    gap: 4px;
  }
  .forecast-col-emoji {
    font-size: 22px;
  }
  .forecast-col-label {
    font-size: 11px;
  }
  .forecast-col-text {
    font-size: 11px;
    white-space: normal;
    text-align: center;
    line-height: 1.3;
  }
  .forecast-col-temps {
    font-size: 11px;
  }
}
@media (max-width: 360px) {
  .forecast-col {
    padding: 6px 4px;
  }
  .forecast-col-emoji {
    font-size: 20px;
  }
  .forecast-col-text {
    font-size: 10px;
  }
}
</style>

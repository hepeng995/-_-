import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import App from './App.vue'
import router from './router'
// import * as echarts from 'echarts'

import './assets/styles/main.scss'
import './assets/styles/ruoyi.scss' // 引入若依样式

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus, {
  locale: zhCn,
  size: 'default', // 设置组件默认尺寸
})

// 全局挂载echarts
// app.config.globalProperties.$echarts = echarts

app.mount('#app') 
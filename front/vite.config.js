import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:7070',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false,
        ws: true,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        },
        configure: (proxy, options) => {
          // 代理请求事件
          proxy.on('error', (err, req, res) => {
            console.log('代理请求错误:', err);
          })
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('发送请求到目标服务器:', req.url);
          })
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('收到目标服务器响应:', proxyRes.statusCode, req.url);
          })
        }
      }
    },
    cors: true
  }
}) 
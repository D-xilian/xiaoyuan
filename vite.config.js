import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    https: false, // 强制关闭 HTTPS
    port: 5173,   // 确认端口是你用的
    strictPort: true
  }
})
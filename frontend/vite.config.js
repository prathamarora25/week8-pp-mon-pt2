import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: String.fromCharCode(104,116,116,112,58,47,47,108,111,99,97,108,104,111,115,116,58,53,48,48,49),
        changeOrigin: true,
      },
    },
  },
})

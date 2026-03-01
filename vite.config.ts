import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    define: {
        'process.env': {}
    },
    server: {
        port: 5555,
        strictPort: true,
        host: true
    },
    preview: {
        port: 5555,
        strictPort: true,
        host: true
    }
})

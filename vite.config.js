import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// La tienda vive en la raíz del dominio (ej. https://louryx.com/)
export default defineConfig({ plugins: [react()], base: '/' })

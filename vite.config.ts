import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.png', 'logo-tasho.png'],
      manifest: {
        name: 'Tasho Personal Organizer',
        short_name: 'Tasho',
        description: 'Organizational tool for daily life',
        theme_color: '#175DFD',
        background_color: '#175DFD',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'logo-tasho.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'logo-tasho.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
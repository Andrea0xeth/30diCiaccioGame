import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  server: {
    // HTTPS RICHIESTO per WebAuthn su Safari iOS
    // Safari iOS blocca WebAuthn su HTTP anche su reti locali
    // L'utente dovrà accettare il certificato self-signed (normale in sviluppo)
    https: {}, // Usa il certificato generato da basicSsl()
    host: true, // Espone su rete locale
  },
  plugins: [
    react(),
    basicSsl(), // Genera certificato SSL self-signed per sviluppo
    VitePWA({
      // Usa 'prompt' per permettere all'utente di scegliere quando aggiornare
      // Il nostro hook intercetterà quando c'è un nuovo SW in attesa
      // e mostrerà la notifica per permettere all'utente di aggiornare manualmente
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: '30diCiaccioGame',
        short_name: '30CiaccioGame',
        description: 'Il gioco del 30° compleanno di Di Ciaccio!',
        theme_color: '#FF6B6B',
        background_color: '#1A1A1A',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Non saltare automaticamente l'attesa, permette controllo manuale
        skipWaiting: false,
        // Prendi controllo dei client solo quando esplicitamente attivato
        clientsClaim: false,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      // Configurazione per sviluppo
      devOptions: {
        enabled: true,
        type: 'module',
      },
    })
  ],
})

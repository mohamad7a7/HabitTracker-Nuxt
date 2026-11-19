export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  devtools: {
    enabled: true
  },

  devServer: {
    host: 'frappe.localhost',
    port: 3000
  },

  runtimeConfig: {
        public: {
            frappeBaseUrl: process.env.NUXT_PUBLIC_FRAPPE_BASE_URL || 'http://127.0.0.1:8000'
        }
    }
})
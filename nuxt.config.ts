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
      frappeBaseUrl: ''
    }
  }
})
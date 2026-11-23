
export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',

    ssr: true,

    devtools: {
        enabled: true
    },

    devServer: {
        host: 'frappe.localhost',
        port: 3000
    },

    runtimeConfig: {
    frappeBaseUrl: 'http://frappe.localhost:8000'
},

    app: {
        head: {
            htmlAttrs: {
                lang: 'fa'
            }
        }
    }
})


import {
    createError,
    getRequestURL,
    getRouterParam,
    proxyRequest
} from 'h3'

export default defineEventHandler(function (event) {
    const config = useRuntimeConfig(event)

    const path = getRouterParam(event, 'path') || ''

    if (!/^api\/method\/[a-zA-Z0-9_.-]+$/.test(path)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid Frappe API path'
        })
    }

    const serverUrl = String(config.frappeBaseUrl || '')
        .replace(/\/+$/, '')

    if (!serverUrl) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Frappe server URL is not configured'
        })
    }

    const targetUrl = serverUrl +
        '/' +
        path +
        getRequestURL(event).search

    return proxyRequest(event, targetUrl)
})

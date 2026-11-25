
import {
    createError,
    getMethod,
    getRequestHeader,
    getRequestURL,
    getRouterParam,
    proxyRequest
} from 'h3'

const ALLOWED_METHODS = new Set([
    'login',
    'logout',
    'frappe.auth.get_logged_user',
    'habit_tracker_register',
    'habit_tracker_get_habits',
    'habit_tracker_get_habit_detail',
    'habit_tracker_create_habit',
    'habit_tracker_update_habit',
    'habit_tracker_delete_habit',
    'habit_tracker_get_checkins',
    'habit_tracker_create_checkin'
])

const ALLOWED_HTTP_METHODS = new Set([
    'GET',
    'POST'
])

const MAX_BODY_SIZE = 1024 * 1024

export default defineEventHandler(function (event) {
    const path = getRouterParam(event, 'path') || ''

    const prefix = 'api/method/'

    if (!path.startsWith(prefix)) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Frappe API method not found'
        })
    }

    const methodName = path.slice(prefix.length)

    if (!ALLOWED_METHODS.has(methodName)) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Frappe API method not allowed'
        })
    }

    const requestMethod = getMethod(event).toUpperCase()

    if (!ALLOWED_HTTP_METHODS.has(requestMethod)) {
        throw createError({
            statusCode: 405,
            statusMessage: 'HTTP method not allowed'
        })
    }

    if (requestMethod === 'POST') {
        const contentLength = getRequestHeader(
            event,
            'content-length'
        )

        const transferEncoding = getRequestHeader(
            event,
            'transfer-encoding'
        )

        if (transferEncoding && contentLength !== undefined) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Invalid request headers'
            })
        }

        if (transferEncoding) {
            throw createError({
                statusCode: 411,
                statusMessage: 'Content-Length is required'
            })
        }

        if (contentLength === undefined) {
            throw createError({
                statusCode: 411,
                statusMessage: 'Content-Length is required'
            })
        }

        if (!/^\d+$/.test(contentLength)) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Invalid Content-Length'
            })
        }

        const bodySize = Number(contentLength)

        if (!Number.isSafeInteger(bodySize)) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Invalid Content-Length'
            })
        }

        if (bodySize > MAX_BODY_SIZE) {
            throw createError({
                statusCode: 413,
                statusMessage: 'Request body is too large'
            })
        }
    }

    const config = useRuntimeConfig(event)

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
        prefix +
        methodName +
        getRequestURL(event).search

    return proxyRequest(event, targetUrl)
})

export function useApi() {
    const requestFetch = useRequestFetch()
    const nuxtApp = useNuxtApp()

    const authState = useState('habitAuthState', function () {
        return {
            userName: null,
            checked: false
        }
    })

    function normalizeError(error) {
        const details = error && error.data
            ? error.data
            : error

        const statusCode = Number(
            error && error.statusCode ||
            error && error.response && error.response.status ||
            details && details.statusCode ||
            0
        )

        const normalized = details && typeof details === 'object'
            ? Object.assign({}, details)
            : {}

        normalized.statusCode = statusCode

        if (error && error.message) {
            normalized.clientMessage = error.message
        }

        return normalized
    }

    function getServerMessage(error) {
        const details = error && error.data
            ? error.data
            : error

        if (details && details._server_messages) {
            try {
                const messages = JSON.parse(details._server_messages)

                if (messages.length) {
                    const firstMessage = typeof messages[0] === 'string'
                        ? JSON.parse(messages[0])
                        : messages[0]

                    if (firstMessage && firstMessage.message) {
                        return firstMessage.message
                    }
                }
            } catch { }
        }

        if (details && typeof details.message === 'string') {
            return details.message
        }

        return ''
    }

    function getPlainText(message) {
        return String(message)
            .replace(/<[^>]*>/g, ' ')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/\s+/g, ' ')
            .trim()
    }

    function isExpiredSession(error) {
        const statusCode = error.statusCode || 0

        if (statusCode === 401) {
            return true
        }

        if (statusCode !== 403) {
            return false
        }

        const message = getServerMessage(error).toLowerCase()

        return /login to access|not logged in|session.*expired|invalid session|not authenticated/.test(message)
    }

    function clearAuth() {
        authState.value.userName = null
        authState.value.checked = true
    }

    function handleExpiredSession(error, methodName, wasLoggedIn) {
        if (!isExpiredSession(error)) {
            return
        }

        clearAuth()

        const authMethods = [
            'login',
            'logout',
            'frappe.auth.get_logged_user'
        ]

        if (
            import.meta.client &&
            wasLoggedIn &&
            !authMethods.includes(methodName)
        ) {
            const result = nuxtApp.runWithContext(function () {
                return navigateTo('/auth')
            })

            if (result && typeof result.catch === 'function') {
                result.catch(function () { })
            }
        }
    }

    function request(methodName, data, httpMethod) {
        const method = httpMethod || 'POST'

        const options = {
            method: method,
            credentials: 'include',
            headers: {
                Accept: 'application/json'
            }
        }

        if (method === 'GET') {
            options.query = data || {}
        } else {
            options.headers['Content-Type'] = 'application/json'
            options.body = data || {}
        }

        return requestFetch(
            '/api/frappe/api/method/' + encodeURIComponent(methodName),
            options
        )
            .then(function (result) {
                if (
                    result &&
                    Object.prototype.hasOwnProperty.call(result, 'message')
                ) {
                    return result.message
                }

                return result
            })
            .catch(function (error) {
                const normalized = normalizeError(error)
                const wasLoggedIn = Boolean(authState.value.userName)

                handleExpiredSession(
                    normalized,
                    methodName,
                    wasLoggedIn
                )

                return Promise.reject(normalized)
            })
    }

    function getErrorMessage(error) {
        const normalized = normalizeError(error)
        const statusCode = normalized.statusCode
        const serverMessage = getPlainText(
            getServerMessage(normalized)
        )

        if (isExpiredSession(normalized)) {
            return 'نشست شما منقضی شده است. دوباره وارد حساب شوید.'
        }

        if (statusCode === 403) {
            return 'شما اجازه انجام این عملیات را ندارید.'
        }

        if (statusCode === 404) {
            return 'اطلاعات موردنظر پیدا نشد.'
        }

        if (statusCode >= 500) {
            return 'سرور در حال حاضر با مشکل مواجه است.'
        }

        if (serverMessage) {
            return serverMessage
        }

        if (!statusCode) {
            return 'ارتباط با سرور با مشکل مواجه شد.'
        }

        return 'در انجام درخواست مشکلی رخ داد.'
    }

    return {
        request,
        getErrorMessage
    }
}
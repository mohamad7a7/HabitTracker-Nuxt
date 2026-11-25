
import {
    normalizeApiError,
    isExpiredSession,
    getApiErrorMessage
} from '../utils/apiErrors'

export function useApi() {
    const requestFetch = useRequestFetch()
    const nuxtApp = useNuxtApp()

    const {
        isLoggedIn,
        clearAuth
    } = useAuthState()

    function handleExpiredSession(error, methodName, wasLoggedIn) {
        if (!isExpiredSession(error, methodName)) {
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
                const normalized = normalizeApiError(error)

                normalized.methodName = methodName

                const wasLoggedIn = isLoggedIn.value

                handleExpiredSession(
                    normalized,
                    methodName,
                    wasLoggedIn
                )

                return Promise.reject(normalized)
            })
    }

    function getErrorMessage(error) {
        return getApiErrorMessage(error)
    }

    return {
        request,
        getErrorMessage
    }
}

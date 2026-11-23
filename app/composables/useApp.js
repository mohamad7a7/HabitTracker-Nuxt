
export function useApi() {
    const requestFetch = useRequestFetch()

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
                return Promise.reject(error.data || error)
            })
    }

    function getErrorMessage(error) {
        const details = error && error.data
            ? error.data
            : error

        if (details && details._server_messages) {
            try {
                const messages = JSON.parse(details._server_messages)
                const firstMessage = JSON.parse(messages[0])

                if (firstMessage.message) {
                    return firstMessage.message
                }
            } catch { }
        }

        if (details && typeof details.message === 'string') {
            return details.message
        }

        return 'ارتباط با سرور با مشکل مواجه شد.'
    }

    return {
        request,
        getErrorMessage
    }
}

export function useApi() {
    const config = useRuntimeConfig()

    const baseUrl = config.public.frappeBaseUrl.replace(/\/+$/, '')

    function request(methodName, data, httpMethod) {
        const method = httpMethod || 'POST'

        const url = new URL(
            baseUrl + '/api/method/' + methodName
        )

        const options = {
            method: method,
            credentials: 'include',
            headers: {
                Accept: 'application/json'
            }
        }

        if (method === 'GET') {
            Object.keys(data || {}).forEach(function (key) {
                if (data[key] !== undefined && data[key] !== null) {
                    url.searchParams.set(key, data[key])
                }
            })
        } else {
            options.headers['Content-Type'] = 'application/json'
            options.body = JSON.stringify(data || {})
        }

        return fetch(url.toString(), options).then(function (response) {
            return response.json().then(
                function (result) {
                    if (!response.ok) {
                        return Promise.reject(result)
                    }

                    return result.message
                },
            )
        })
    }

    function getErrorMessage(error) {
        if (error && error._server_messages) {
            try {
                const messages = JSON.parse(error._server_messages)

                const firstMessage = JSON.parse(messages[0])

                if (firstMessage.message) {
                    return firstMessage.message
                }
            } catch { }
        }

        if (error && typeof error.message === 'string') {
            return error.message
        }

        return 'ارتباط با سرور با مشکل مواجه شد.'
    }

    return {
        request,
        getErrorMessage
    }
}
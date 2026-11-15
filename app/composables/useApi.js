export function useApi() {
    const config = useRuntimeConfig()

    function request(methodName, data, httpMethod) {
        const method = httpMethod || 'POST'

        const baseUrl = config.public.frappeBaseUrl.replace(/\/+$/, '')

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
            return response.text().then(function (text) {
                let result = {}

                try {
                    result = text ? JSON.parse(text) : {}
                } catch {
                    result = {
                        message: text
                    }
                }

                if (!response.ok) {
                    return Promise.reject(result)
                }

                return result.message
            })
        })
    }

    return {
        request
    }
}
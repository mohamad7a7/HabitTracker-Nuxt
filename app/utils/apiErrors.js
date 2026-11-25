
export function normalizeApiError(error) {
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

export function getServerMessage(error) {
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

export function getPlainText(message) {
    return String(message)
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ')
        .trim()
}

export function isExpiredSession(error, methodName) {
    const normalized = normalizeApiError(error)

    const requestMethod = methodName ||
        normalized.methodName

    const statusCode = normalized.statusCode

    if (requestMethod === 'login' && statusCode === 401) {
        return false
    }

    if (statusCode === 401) {
        return true
    }

    if (statusCode !== 403) {
        return false
    }

    const message = getServerMessage(normalized).toLowerCase()

    return /login to access|not logged in|session.*expired|invalid session|not authenticated/.test(message)
}

export function getApiErrorMessage(error) {
    const normalized = normalizeApiError(error)

    const methodName = normalized.methodName
    const statusCode = normalized.statusCode

    const serverMessage = getPlainText(
        getServerMessage(normalized)
    )

    if (methodName === 'login' && statusCode === 401) {
        return 'نام کاربری یا رمز عبور اشتباه است.'
    }

    if (isExpiredSession(normalized, methodName)) {
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

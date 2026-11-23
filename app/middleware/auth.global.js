
export default defineNuxtRouteMiddleware(function (to) {
    const {
        auth,
        checkLogin
    } = useAuth()

    function checkAccess() {
        const isAuthPage = to.path === '/auth'

        if (!auth.value.isLoggedIn && !isAuthPage) {
            return navigateTo('/auth')
        }

        if (auth.value.isLoggedIn && isAuthPage) {
            return navigateTo('/')
        }
    }

    if (auth.value.checked) {
        return checkAccess()
    }

    return checkLogin()
        .then(function () {
            return checkAccess()
        })
        .catch(function () {
            throw createError({
                statusCode: 503,
                statusMessage: 'ارتباط با سرور احراز هویت برقرار نشد.'
            })
        })
})

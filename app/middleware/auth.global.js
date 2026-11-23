
export default defineNuxtRouteMiddleware(function (to) {
    const nuxtApp = useNuxtApp()

    const {
        auth,
        checkLogin
    } = useAuth()

    function checkAccess() {
        const isAuthPage = to.path === '/auth'

        if (!auth.value.isLoggedIn && !isAuthPage) {
            return nuxtApp.runWithContext(function () {
                return navigateTo('/auth')
            })
        }

        if (auth.value.isLoggedIn && isAuthPage) {
            return nuxtApp.runWithContext(function () {
                return navigateTo('/')
            })
        }
    }

    if (auth.value.checked) {
        return checkAccess()
    }

    return checkLogin()
        .then(function () {
            return checkAccess()
        })
        .catch(function (error) {
            console.error(
                'Authentication Middleware Error:',
                error
            )

            throw createError({
                statusCode: 503,
                statusMessage: 'ارتباط با سرور احراز هویت برقرار نشد.'
            })
        })
})

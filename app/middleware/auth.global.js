export default defineNuxtRouteMiddleware(function (to) {
    if (import.meta.server) {
        return
    }

    const {
        userName,
        checkLogin
    } = useApp()

    const isAuthPage = to.path === '/auth'

    function checkAccess() {
        if (!userName.value && !isAuthPage) {
            return navigateTo('/auth')
        }

        if (userName.value && isAuthPage) {
            return navigateTo('/')
        }
    }

    if (userName.value !== null) {
        return checkAccess()
    }

    return checkLogin()
        .then(function () {
            return checkAccess()
        })
        .catch(function () {
            if (!isAuthPage) {
                return navigateTo('/auth')
            }
        })
})
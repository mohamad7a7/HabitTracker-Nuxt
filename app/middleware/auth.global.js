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

})
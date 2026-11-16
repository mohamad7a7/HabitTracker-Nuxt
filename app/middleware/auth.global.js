export default defineNuxtRouteMiddleware(function (to) {
    if (import.meta.server) {
        return
    }

    const {
        currentUser,
        authChecked,
        checkAuth
    } = useAuth()

    const publicPaths = [
        '/login',
        '/register'
    ]

    const isPublicRoute = publicPaths.includes(to.path)

    function checkAccess() {
        if (!currentUser.value && !isPublicRoute) {
            return navigateTo('/login')
        }

        if (currentUser.value && isPublicRoute) {
            return navigateTo('/')
        }
    }

    if (authChecked.value) {
        return checkAccess()
    }

    return checkAuth()
        .then(function () {
            return checkAccess()
        })
        .catch(function () {
            if (!isPublicRoute) {
                return navigateTo('/login')
            }
        })
})
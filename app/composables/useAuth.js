export function useAuth() {
    const { request, getErrorMessage } = useApi()

    const currentUser = useState('habitTrackerUser', function () {
        return null
    })

    const authChecked = useState('habitTrackerAuthChecked', function () {
        return false
    })

    const isLoggedIn = computed(function () {
        return Boolean(currentUser.value)
    })

    function register(username, password) {
        return request(
            'habit_tracker_register',
            {
                username: username,
                password: password
            },
            'POST'
        )
    }

    function login(username, password) {
        return request(
            'login',
            {
                usr: username,
                pwd: password
            },
            'POST'
        )
            .then(function () {
                return checkAuth()
            })
            .then(function (isAuthenticated) {
                if (!isAuthenticated) {
                    return Promise.reject({
                        message: 'ورود به حساب کاربری انجام نشد.'
                    })
                }

                return currentUser.value
            })
    }

    function logout() {
        return request(
            'logout',
            {},
            'POST'
        ).then(function (result) {
            currentUser.value = null
            authChecked.value = true

            return result
        })
    }

    function checkAuth() {
        return request(
            'frappe.auth.get_logged_user',
            {},
            'GET'
        )
            .then(function (username) {
                if (username && username !== 'Guest') {
                    const suffix = '@users.habittracker.invalid'

                    currentUser.value = username.endsWith(suffix)
                        ? username.slice(0, -suffix.length)
                        : username
                } else {
                    currentUser.value = null
                }

                authChecked.value = true

                return isLoggedIn.value
            })
            .catch(function (error) {
                currentUser.value = null
                authChecked.value = false

                return Promise.reject(error)
            })
    }

    return {
        currentUser,
        authChecked,
        isLoggedIn,
        register,
        login,
        logout,
        checkAuth,
        getErrorMessage
    }
}
export function useAuth() {
    const currentUser = useState('habitTrackerUser', function () {
        return null
    })

    const { request } = useApi()

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
        ).then(function () {
            return checkAuth()
        })
    }

    function logout() {
        return request(
            'logout',
            {},
            'POST'
        ).then(function (result) {
            currentUser.value = null

            return result
        })
    }

    function checkAuth() {
        return request(
            'frappe.auth.get_logged_user',
            {},
            'GET'
        ).then(function (username) {
            if (username && username !== 'Guest') {
                currentUser.value = username

                return true
            }

            currentUser.value = null

            return false
        })
    }

    return {
        currentUser,
        isLoggedIn,
        register,
        login,
        logout,
        checkAuth
    }
}
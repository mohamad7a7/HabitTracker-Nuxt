
export function useAuth() {
    const {
        request,
        getErrorMessage
    } = useApi()

    const userName = useState('habitUserName', function () {
        return null
    })

    const authChecked = useState('habitAuthChecked', function () {
        return false
    })

    const isLoggedIn = computed(function () {
        return Boolean(userName.value)
    })

    function checkLogin() {
        return request(
            'frappe.auth.get_logged_user',
            {},
            'GET'
        )
            .then(function (result) {
                if (result && result !== 'Guest') {
                    const suffix = '@users.habittracker.invalid'

                    userName.value = result.endsWith(suffix)
                        ? result.slice(0, -suffix.length)
                        : result
                } else {
                    userName.value = null
                }

                authChecked.value = true

                return isLoggedIn.value
            })
            .catch(function (error) {
                userName.value = null
                authChecked.value = true

                if (
                    error &&
                    (
                        error.exc_type === 'PermissionError' ||
                        error.statusCode === 401 ||
                        error.statusCode === 403
                    )
                ) {
                    return false
                }

                return Promise.reject(error)
            })
    }

    function signIn(username, password) {
        userName.value = null
        authChecked.value = false

        return request(
            'login',
            {
                usr: username.trim(),
                pwd: password
            },
            'POST'
        )
            .then(function () {
                return checkLogin()
            })
            .then(function (result) {
                if (!result) {
                    return Promise.reject({
                        message: 'ورود به حساب کاربری انجام نشد.'
                    })
                }

                return userName.value
            })
    }

    function signUp(username, password) {
        return request(
            'habit_tracker_register',
            {
                username: username.trim(),
                password: password
            },
            'POST'
        )
    }

    function signOut() {
        return request(
            'logout',
            {},
            'POST'
        )
            .then(function (result) {
                userName.value = null
                authChecked.value = true

                return result
            })
    }

    function clearAuth() {
        userName.value = null
        authChecked.value = true
    }

    return {
        userName,
        authChecked,
        isLoggedIn,
        checkLogin,
        signIn,
        signUp,
        signOut,
        clearAuth,
        getErrorMessage
    }
}

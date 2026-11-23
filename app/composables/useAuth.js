
export function useAuth() {
    const {
        request,
        getErrorMessage
    } = useApi()

    const authState = useState('habitAuthState', function () {
        return {
            userName: null,
            checked: false
        }
    })

    const auth = computed(function () {
        return {
            userName: authState.value.userName,
            checked: authState.value.checked,
            isLoggedIn: Boolean(authState.value.userName)
        }
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

                    authState.value.userName = result.endsWith(suffix)
                        ? result.slice(0, -suffix.length)
                        : result
                } else {
                    authState.value.userName = null
                }

                authState.value.checked = true

                return auth.value.isLoggedIn
            })
            .catch(function (error) {
                authState.value.userName = null
                authState.value.checked = true

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
        authState.value.userName = null
        authState.value.checked = false

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

                return auth.value.userName
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
                authState.value.userName = null
                authState.value.checked = true

                return result
            })
    }

    function clearAuth() {
        authState.value.userName = null
        authState.value.checked = true
    }

    return {
        auth,
        checkLogin,
        signIn,
        signUp,
        signOut,
        clearAuth,
        getErrorMessage
    }
}

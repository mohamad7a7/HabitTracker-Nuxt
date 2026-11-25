
import {
    isExpiredSession
} from '../utils/apiErrors'

export function useAuth() {
    const {
        request,
        getErrorMessage
    } = useApi()

    const {
        authState,
        setUserName,
        setChecked,
        clearAuth
    } = useAuthState()

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

                    setUserName(
                        result.endsWith(suffix)
                            ? result.slice(0, -suffix.length)
                            : result
                    )
                } else {
                    setUserName(null)
                }

                setChecked(true)

                return auth.value.isLoggedIn
            })
            .catch(function (error) {
                if (
                    isExpiredSession(
                        error,
                        'frappe.auth.get_logged_user'
                    )
                ) {
                    clearAuth()
                    return false
                }

                setUserName(null)
                setChecked(false)

                return Promise.reject(error)
            })
    }

    function signIn(username, password) {
        setUserName(null)
        setChecked(false)

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
            .catch(function (error) {
                clearAuth()
                return Promise.reject(error)
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
                clearAuth()
                return result
            })
            .catch(function (error) {
                clearAuth()
                return Promise.reject(error)
            })
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


export function useAuthState() {
    const authState = useState('habitAuthState', function () {
        return {
            userName: null,
            checked: false
        }
    })

    const isLoggedIn = computed(function () {
        return Boolean(authState.value.userName)
    })

    function setUserName(userName) {
        authState.value.userName = userName || null
    }

    function setChecked(checked) {
        authState.value.checked = Boolean(checked)
    }

    function clearAuth() {
        authState.value.userName = null
        authState.value.checked = true
    }

    return {
        authState,
        isLoggedIn,
        setUserName,
        setChecked,
        clearAuth
    }
}

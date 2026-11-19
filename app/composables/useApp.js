export function useApp() {
    const settings = useRuntimeConfig()

    const serverUrl = (settings.public.frappeBaseUrl || '').replace(/\/+$/, '')

    const userName = useState('habitUserName', function () {
        return ''
    })

    const loginChecked = useState('habitLoginChecked', function () {
        return false
    })

    function sendRequest(methodName, data, httpMethod) {
        const method = httpMethod || 'POST'

        if (!serverUrl) {
            return Promise.reject({
                message: 'آدرس سرور مشخص نشده است.'
            })
        }

        const address = new URL(
            serverUrl + '/api/method/' + methodName
        )

        const options = {
            method: method,
            credentials: 'include',
            headers: {
                Accept: 'application/json'
            }
        }

        if (method === 'GET') {
            Object.keys(data || {}).forEach(function (key) {
                if (data[key] !== undefined && data[key] !== null) {
                    address.searchParams.set(key, data[key])
                }
            })
        } else {
            options.headers['Content-Type'] = 'application/json'
            options.body = JSON.stringify(data || {})
        }

        return fetch(address.toString(), options).then(function (response) {
            return response.text().then(function (text) {
                let result = {}

                try {
                    result = JSON.parse(text || '{}')
                } catch {
                    return Promise.reject({
                        message: 'پاسخ معتبر از سرور دریافت نشد.'
                    })
                }

                if (!response.ok) {
                    return Promise.reject(result)
                }

                return result.message
            })
        })
    }

    function showError(error) {
        if (error && error._server_messages) {
            try {
                const messages = JSON.parse(error._server_messages)
                const firstMessage = JSON.parse(messages[0])

                if (firstMessage.message) {
                    return firstMessage.message
                }
            } catch { }
        }

        if (error && typeof error.message === 'string') {
            return error.message
        }

        return 'ارتباط با سرور با مشکل مواجه شد.'
    }

    function checkLogin() {
        return sendRequest(
            'frappe.auth.get_logged_user',
            {},
            'GET'
        ).then(function (result) {
            if (result && result !== 'Guest') {
                const suffix = '@users.habittracker.invalid'

                userName.value = result.endsWith(suffix)
                    ? result.slice(0, -suffix.length)
                    : result
            } else {
                userName.value = ''
            }

            loginChecked.value = true

            return Boolean(userName.value)
        }).catch(function (error) {
            userName.value = ''
            loginChecked.value = false

            return Promise.reject(error)
        })
    }

    function signIn(username, password) {
        return sendRequest(
            'login',
            {
                usr: username,
                pwd: password
            },
            'POST'
        ).then(function () {
            return checkLogin()
        }).then(function (result) {
            if (!result) {
                return Promise.reject({
                    message: 'ورود به حساب کاربری انجام نشد.'
                })
            }

            return userName.value
        })
    }

    function signUp(username, password) {
        return sendRequest(
            'habit_tracker_register',
            {
                username: username,
                password: password
            },
            'POST'
        )
    }

    function signOut() {
        return sendRequest(
            'logout',
            {},
            'POST'
        ).then(function (result) {
            userName.value = ''
            loginChecked.value = true

            return result
        })
    }

    function listHabits() {
        return sendRequest(
            'habit_tracker_get_habits',
            {},
            'GET'
        )
    }

    function listCheckins() {
        return sendRequest(
            'habit_tracker_get_checkins',
            {},
            'GET'
        )
    }

    function inspectHabit(habitName) {
        return sendRequest(
            'habit_tracker_get_habit_detail',
            {
                habit_name: habitName
            },
            'GET'
        )
    }

    function storeHabit(habitName, habitData) {
        if (habitName) {
            const information = Object.assign(
                {},
                habitData,
                {
                    habit_name: habitName
                }
            )

            return sendRequest(
                'habit_tracker_update_habit',
                information,
                'POST'
            )
        }

        return sendRequest(
            'habit_tracker_create_habit',
            habitData,
            'POST'
        )
    }

    function eraseHabit(habitName) {
        return sendRequest(
            'habit_tracker_delete_habit',
            {
                habit_name: habitName
            },
            'POST'
        )
    }

    function saveCheckin(habitName, date, isDone) {
        return sendRequest(
            'habit_tracker_create_checkin',
            {
                habit: habitName,
                date: date,
                is_done: isDone
            },
            'POST'
        )
    }

    return {
        userName,
        loginChecked,
        sendRequest,
        showError,
        checkLogin,
        signIn,
        signUp,
        signOut,
        listHabits,
        listCheckins,
        inspectHabit,
        storeHabit,
        eraseHabit,
        saveCheckin
    }
}
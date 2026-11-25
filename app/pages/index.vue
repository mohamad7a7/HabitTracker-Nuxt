<script setup>
const {
    getHabits,
    deleteHabit
} = useHabit()

const {
    getCheckins,
    saveCheckin,
    updateCheckinRecords
} = useCheckIn()

const {
    getErrorMessage
} = useApi()

const deletingHabits = ref([])
const savingCheckins = ref([])

const todayDate = useState('habitTodayDate', function () {
    return ''
})

const deleteErrorMessage = ref('')
const deleteSuccessMessage = ref('')

const checkinSaveError = ref('')
const checkinSaveSuccess = ref('')

const actionMessages = {
    deleteError: deleteErrorMessage,
    deleteSuccess: deleteSuccessMessage,
    checkinError: checkinSaveError,
    checkinSuccess: checkinSaveSuccess
}

const messageTimers = {
    deleteError: null,
    deleteSuccess: null,
    checkinError: null,
    checkinSuccess: null
}

let midnightTimer = null

const {
    data: habitsResult,
    pending: isLoadingHabits,
    error: habitsError,
    refresh: refreshHabits
} = useAsyncData(
    'dashboard-habits',
    function () {
        return getHabits()
    },
    {
        default: function () {
            return {
                habits: []
            }
        }
    }
)

const {
    data: checkinsResult,
    pending: isLoadingCheckins,
    error: checkinsError,
    refresh: refreshCheckins
} = useAsyncData(
    'dashboard-checkins',
    function () {
        return getCheckins(todayDate.value)
    },
    {
        server: false,
        immediate: false,
        default: function () {
            return {
                checkins: []
            }
        }
    }
)

const habitCards = computed(function () {
    return habitsResult.value.habits || []
})

const dailyRecords = computed(function () {
    return checkinsResult.value.checkins || []
})

const habitsErrorMessage = computed(function () {
    return habitsError.value
        ? getErrorMessage(habitsError.value)
        : ''
})

const checkinsErrorMessage = computed(function () {
    return checkinsError.value
        ? getErrorMessage(checkinsError.value)
        : ''
})

function getTodayDate() {
    const today = new Date()

    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')

    return year + '-' + month + '-' + day
}

function clearActionMessage(messageName) {
    clearTimeout(messageTimers[messageName])

    messageTimers[messageName] = null
    actionMessages[messageName].value = ''
}

function showActionMessage(messageName, message) {
    clearActionMessage(messageName)

    actionMessages[messageName].value = message

    messageTimers[messageName] = setTimeout(function () {
        actionMessages[messageName].value = ''
        messageTimers[messageName] = null
    }, 10000)
}

function clearActionMessages() {
    Object.keys(actionMessages).forEach(function (messageName) {
        clearActionMessage(messageName)
    })
}

function updateTodayDate() {
    const nextDate = getTodayDate()

    if (todayDate.value !== nextDate) {
        todayDate.value = nextDate

        clearActionMessage('checkinError')
        clearActionMessage('checkinSuccess')

        refreshCheckins()
    }
}

function scheduleDateUpdate() {
    clearTimeout(midnightTimer)

    const now = new Date()

    const nextMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0,
        0,
        1
    )

    const delay = nextMidnight.getTime() - now.getTime()

    midnightTimer = setTimeout(function () {
        updateTodayDate()
        scheduleDateUpdate()
    }, delay)
}

function handleWindowFocus() {
    updateTodayDate()
    scheduleDateUpdate()
}

function handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
        updateTodayDate()
        scheduleDateUpdate()
    }
}

onMounted(function () {
    todayDate.value = getTodayDate()

    refreshCheckins()

    scheduleDateUpdate()

    window.addEventListener(
        'focus',
        handleWindowFocus
    )

    document.addEventListener(
        'visibilitychange',
        handleVisibilityChange
    )
})

onUnmounted(function () {
    clearTimeout(midnightTimer)
    clearActionMessages()

    window.removeEventListener(
        'focus',
        handleWindowFocus
    )

    document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange
    )
})

function isDueToday(habit) {
    if (!todayDate.value) {
        return false
    }

    if (habit.frequency === 'D') {
        return !habit.start_date ||
            habit.start_date <= todayDate.value
    }

    if (habit.frequency === 'O') {
        return habit.once_date === todayDate.value
    }

    if (habit.frequency === 'M') {
        const [year, month, day] = todayDate.value.split('-').map(Number)

        const lastDay = new Date(year, month, 0).getDate()

        const dueDay = Math.min(
            Number(habit.day_of_month),
            lastDay
        )

        return dueDay === day
    }

    return false
}

function habitIsComplete(habitName) {
    const record = dailyRecords.value.find(function (item) {
        return item.habit === habitName &&
            item.date === todayDate.value
    })

    return Boolean(record && Number(record.is_done) === 1)
}

function getHabitInfo(habit) {
    const labels = {
        D: 'روزانه',
        O: 'یک‌باره',
        M: 'ماهانه'
    }

    let schedule = ''

    if (habit.frequency === 'D') {
        schedule = 'شروع از: ' + (habit.start_date || 'نامشخص')
    }

    if (habit.frequency === 'O') {
        schedule = 'تاریخ انجام: ' + (habit.once_date || 'نامشخص')
    }

    if (habit.frequency === 'M') {
        schedule = 'روز ' + (habit.day_of_month || 'نامشخص') + ' هر ماه'
    }

    return 'تناوب: ' +
        (labels[habit.frequency] || 'نامشخص') +
        ' - ' +
        schedule
}

function toggleCompletion(habit) {
    if (
        savingCheckins.value.includes(habit.name) ||
        !isDueToday(habit) ||
        !todayDate.value
    ) {
        return
    }

    clearActionMessages()

    const checkinDate = getTodayDate()

    if (todayDate.value !== checkinDate) {
        todayDate.value = checkinDate
        refreshCheckins()
    }

    const nextStatus = !habitIsComplete(habit.name)

    savingCheckins.value.push(habit.name)

    saveCheckin(
        habit.name,
        checkinDate,
        nextStatus
    )
        .then(function () {
            checkinsResult.value = Object.assign(
                {},
                checkinsResult.value,
                {
                    checkins: updateCheckinRecords(
                        dailyRecords.value,
                        habit.name,
                        checkinDate,
                        nextStatus
                    )
                }
            )

            showActionMessage(
                'checkinSuccess',
                'وضعیت عادت با موفقیت ثبت شد.'
            )
        })
        .catch(function (error) {
            showActionMessage(
                'checkinError',
                getErrorMessage(error)
            )
        })
        .finally(function () {
            savingCheckins.value = savingCheckins.value.filter(
                function (name) {
                    return name !== habit.name
                }
            )
        })
}

function removeHabit(habit) {
    if (deletingHabits.value.includes(habit.name)) {
        return
    }

    const confirmed = window.confirm(
        'آیا از حذف این عادت مطمئن هستید؟'
    )

    if (!confirmed) {
        return
    }

    clearActionMessages()

    deletingHabits.value.push(habit.name)

    deleteHabit(habit.name)
        .then(function () {
            habitsResult.value = Object.assign(
                {},
                habitsResult.value,
                {
                    habits: habitCards.value.filter(
                        function (item) {
                            return item.name !== habit.name
                        }
                    )
                }
            )

            showActionMessage(
                'deleteSuccess',
                'عادت با موفقیت حذف شد.'
            )
        })
        .catch(function (error) {
            showActionMessage(
                'deleteError',
                getErrorMessage(error)
            )
        })
        .finally(function () {
            deletingHabits.value = deletingHabits.value.filter(
                function (name) {
                    return name !== habit.name
                }
            )
        })
}
</script>

<template>
    <main>
        <h1>عادت‌های من</h1>

        <p v-if="deleteErrorMessage" role="alert">
            {{ deleteErrorMessage }}
        </p>

        <p v-if="deleteSuccessMessage" role="status">
            {{ deleteSuccessMessage }}
        </p>

        <p v-if="checkinSaveError" role="alert">
            {{ checkinSaveError }}
        </p>

        <p v-if="checkinSaveSuccess" role="status">
            {{ checkinSaveSuccess }}
        </p>

        <p v-if="habitsErrorMessage" role="alert">
            خطا در دریافت عادت‌ها:
            {{ habitsErrorMessage }}
        </p>

        <p v-if="checkinsErrorMessage" role="alert">
            خطا در دریافت وضعیت عادت‌ها:
            {{ checkinsErrorMessage }}
        </p>

        <p v-if="isLoadingHabits">
            در حال دریافت عادت‌ها...
        </p>

        <p v-if="isLoadingCheckins">
            در حال دریافت وضعیت عادت‌ها...
        </p>

        <p v-if="!isLoadingHabits && !habitsErrorMessage && habitCards.length === 0">
            هنوز عادتی ثبت نکرده‌اید.
        </p>

        <section v-if="habitCards.length">
            <article v-for="habit in habitCards" :key="habit.name">
                <h2>{{ habit.title }}</h2>

                <p>{{ getHabitInfo(habit) }}</p>

                <p>
                    ساعت: {{ habit.time }}
                </p>

                <template v-if="todayDate && isDueToday(habit)">
                    <p>
                        وضعیت امروز:
                        {{ habitIsComplete(habit.name) ? 'انجام شده' : 'انجام نشده' }}
                    </p>

                    <button type="button" :disabled="savingCheckins.includes(habit.name) ||
                        isLoadingCheckins ||
                        Boolean(checkinsError)
                        " @click="toggleCompletion(habit)">
                        {{
                            savingCheckins.includes(habit.name)
                                ? 'در حال ثبت...'
                                : habitIsComplete(habit.name)
                                    ? 'ثبت انجام نشده'
                                    : 'ثبت انجام شده'
                        }}
                    </button>
                </template>

                <p v-else-if="todayDate">
                    امروز زمان انجام این عادت نیست.
                </p>

                <p v-else>
                    در حال تعیین وضعیت امروز...
                </p>

                <NuxtLink :to="'/habits/' + encodeURIComponent(habit.name)">
                    ویرایش
                </NuxtLink>

                <button type="button" :disabled="deletingHabits.includes(habit.name)" @click="removeHabit(habit)">
                    {{
                        deletingHabits.includes(habit.name)
                            ? 'در حال حذف...'
                            : 'حذف'
                    }}
                </button>

                <hr />
            </article>
        </section>
    </main>
</template>

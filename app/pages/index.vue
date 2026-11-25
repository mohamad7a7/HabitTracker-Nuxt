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

const {
    messages,
    showMessage,
    clearMessage,
    clearAllMessages
} = useToast()

const deletingHabits = ref([])
const savingCheckins = ref([])

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
        return getCheckins()
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

const {
    todayDate
} = useToday(function () {
    clearMessage('checkinError')
    clearMessage('checkinSuccess')

    refreshCheckins()
})

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

function canCheckIn(habit) {
    if (!todayDate.value) {
        return false
    }

    if (habit.frequency === 'D') {
        return !habit.start_date ||
            habit.start_date <= todayDate.value
    }

    if (habit.frequency === 'O') {
        return Boolean(
            habit.once_date &&
            habit.once_date <= todayDate.value
        )
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

function getCheckinDate(habit) {
    if (habit.frequency === 'O') {
        return habit.once_date
    }

    return todayDate.value
}

function habitIsComplete(habitName, date) {
    const record = dailyRecords.value.find(function (item) {
        return item.habit === habitName &&
            item.date === date
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

function retryHabits() {
    return refreshHabits()
}

function retryCheckins() {
    return refreshCheckins()
}

function toggleCompletion(habit) {
    if (
        savingCheckins.value.includes(habit.name) ||
        !canCheckIn(habit)
    ) {
        return
    }

    const checkinDate = getCheckinDate(habit)

    if (!checkinDate) {
        return
    }

    clearAllMessages()

    const nextStatus = !habitIsComplete(
        habit.name,
        checkinDate
    )

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

            showMessage(
                'checkinSuccess',
                'وضعیت عادت با موفقیت ثبت شد.'
            )
        })
        .catch(function (error) {
            showMessage(
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

    clearAllMessages()

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

            showMessage(
                'deleteSuccess',
                'عادت با موفقیت حذف شد.'
            )
        })
        .catch(function (error) {
            showMessage(
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

        <p v-if="messages.deleteError" role="alert">
            {{ messages.deleteError }}
        </p>

        <p v-if="messages.deleteSuccess" role="status">
            {{ messages.deleteSuccess }}
        </p>

        <p v-if="messages.checkinError" role="alert">
            {{ messages.checkinError }}
        </p>

        <p v-if="messages.checkinSuccess" role="status">
            {{ messages.checkinSuccess }}
        </p>

        <p v-if="habitsErrorMessage" role="alert">
            خطا در دریافت عادت‌ها:
            {{ habitsErrorMessage }}
        </p>

        <button v-if="habitsErrorMessage" type="button" :disabled="isLoadingHabits" @click="retryHabits">
            {{ isLoadingHabits ? 'در حال تلاش...' : 'تلاش مجدد برای دریافت عادت‌ها' }}
        </button>

        <p v-if="checkinsErrorMessage" role="alert">
            خطا در دریافت وضعیت عادت‌ها:
            {{ checkinsErrorMessage }}
        </p>

        <button v-if="checkinsErrorMessage" type="button" :disabled="isLoadingCheckins" @click="retryCheckins">
            {{ isLoadingCheckins ? 'در حال تلاش...' : 'تلاش مجدد برای دریافت وضعیت عادت‌ها' }}
        </button>

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

                <template v-if="todayDate && canCheckIn(habit)">
                    <p>
                        {{ habit.frequency === 'O' ? 'وضعیت عادت:' : 'وضعیت امروز:' }}
                        {{
                            habitIsComplete(
                                habit.name,
                                getCheckinDate(habit)
                            )
                                ? 'انجام شده'
                                : 'انجام نشده'
                        }}
                    </p>

                    <button type="button" :disabled="savingCheckins.includes(habit.name) ||
                        isLoadingCheckins ||
                        Boolean(checkinsError)
                        " @click="toggleCompletion(habit)">
                        {{
                            savingCheckins.includes(habit.name)
                                ? 'در حال ثبت...'
                                : habitIsComplete(
                                    habit.name,
                                    getCheckinDate(habit)
                                )
                                    ? 'ثبت انجام نشده'
                                    : 'ثبت انجام شده'
                        }}
                    </button>
                </template>

                <p v-else-if="todayDate && habit.frequency === 'O'">
                    {{
                        habit.once_date > todayDate
                            ? 'تاریخ انجام این عادت هنوز نرسیده است.'
                            : 'تاریخ انجام این عادت مشخص نشده است.'
                    }}
                </p>

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

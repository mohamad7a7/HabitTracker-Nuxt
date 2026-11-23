<script setup>
const {
    getHabits,
    deleteHabit
} = useHabit()

const {
    getCheckins,
    saveCheckin
} = useCheckIn()

const {
    getErrorMessage
} = useApi()

const deletingHabits = ref([])
const savingCheckins = ref([])

const todayDate = ref('')

const deleteErrorMessage = ref('')
const checkinSaveError = ref('')

const {
    data: habitsResult,
    pending: isLoadingHabits,
    error: habitsError,
    refresh: refreshHabits
} = await useAsyncData(
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
} = await useAsyncData(
    'dashboard-checkins',
    function () {
        return getCheckins()
    },
    {
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

onMounted(function () {
    todayDate.value = getTodayDate()
})

function getTodayDate() {
    const today = new Date()

    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')

    return year + '-' + month + '-' + day
}

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
        const todayDay = Number(todayDate.value.split('-')[2])

        return Number(habit.day_of_month) === todayDay
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

    todayDate.value = getTodayDate()

    const nextStatus = !habitIsComplete(habit.name)

    checkinSaveError.value = ''
    savingCheckins.value.push(habit.name)

    saveCheckin(
        habit.name,
        todayDate.value,
        nextStatus
    )
        .then(function () {
            return refreshCheckins()
        })
        .catch(function (error) {
            checkinSaveError.value = getErrorMessage(error)
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
    if (
        deletingHabits.value.includes(habit.name)
    ) {
        return
    }

    const confirmed = window.confirm(
        'آیا از حذف این عادت مطمئن هستید؟'
    )

    if (!confirmed) {
        return
    }

    deleteErrorMessage.value = ''
    deletingHabits.value.push(habit.name)

    deleteHabit(habit.name)
        .then(function () {
            return refreshHabits()
        })
        .then(function () {
            if (habitsError.value) {
                deleteErrorMessage.value = getErrorMessage(
                    habitsError.value
                )
            }
        })
        .catch(function (error) {
            deleteErrorMessage.value = getErrorMessage(error)
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

        <NuxtLink to="/habits/new">
            ایجاد عادت جدید
        </NuxtLink>

        <p v-if="deleteErrorMessage" role="alert">
            {{ deleteErrorMessage }}
        </p>

        <p v-if="checkinSaveError" role="alert">
            {{ checkinSaveError }}
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
                <h2>
                    {{ habit.title }}
                </h2>

                <p>
                    {{ getHabitInfo(habit) }}
                </p>

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

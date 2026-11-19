<script setup>
const {
    userName,
    signOut,
    listHabits,
    listCheckins,
    saveCheckin,
    eraseHabit,
    showError
} = useApp()

const habitCards = ref([])
const dailyRecords = ref([])

const loading = ref(true)
const busyHabit = ref('')

const errorMessage = ref('')
const successMessage = ref('')

const todayDate = ref('')

onMounted(function () {
    todayDate.value = getTodayDate()
    refreshDashboard()
})

function getTodayDate() {
    const today = new Date()

    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')

    return year + '-' + month + '-' + day
}

function refreshDashboard() {
    loading.value = true
    errorMessage.value = ''

    return Promise.all([
        listHabits(),
        listCheckins()
    ])
        .then(function (results) {
            habitCards.value = results[0].habits || []
            dailyRecords.value = results[1].checkins || []
        })
        .catch(function (error) {
            errorMessage.value = showError(error)
        })
        .finally(function () {
            loading.value = false
        })
}

function findTodayCheckin(habitName) {
    return dailyRecords.value.find(function (item) {
        return item.habit === habitName &&
            item.date === todayDate.value
    })
}

function habitIsComplete(habitName) {
    const record = findTodayCheckin(habitName)

    return Boolean(record && Number(record.is_done) === 1)
}

function toggleCompletion(habit) {
    if (busyHabit.value) {
        return
    }

    const previousRecord = findTodayCheckin(habit.name)

    const nextStatus = previousRecord
        ? Number(previousRecord.is_done) !== 1
        : true

    busyHabit.value = habit.name

    errorMessage.value = ''
    successMessage.value = ''

    saveCheckin(
        habit.name,
        todayDate.value,
        nextStatus
    )
        .then(function () {
            successMessage.value = 'وضعیت عادت ثبت شد.'

            return listCheckins()
        })
        .then(function (result) {
            dailyRecords.value = result.checkins || []
        })
        .catch(function (error) {
            errorMessage.value = showError(error)
        })
        .finally(function () {
            busyHabit.value = ''
        })
}

function removeSelectedHabit(habit) {
    if (busyHabit.value) {
        return
    }

    const confirmation = window.confirm(
        'آیا از حذف این عادت مطمئن هستید؟'
    )

    if (!confirmation) {
        return
    }

    busyHabit.value = habit.name

    errorMessage.value = ''
    successMessage.value = ''

    eraseHabit(habit.name)
        .then(function () {
            habitCards.value = habitCards.value.filter(function (item) {
                return item.name !== habit.name
            })

            dailyRecords.value = dailyRecords.value.filter(function (item) {
                return item.habit !== habit.name
            })

            successMessage.value = 'عادت حذف شد.'
        })
        .catch(function (error) {
            errorMessage.value = showError(error)
        })
        .finally(function () {
            busyHabit.value = ''
        })
}

function getFrequencyLabel(frequency) {
    const labels = {
        D: 'روزانه',
        O: 'یک‌باره',
        M: 'ماهانه'
    }

    return labels[frequency] || 'نامشخص'
}

function getSchedule(habit) {
    if (habit.frequency === 'D') {
        return 'شروع از: ' + (habit.start_date || 'نامشخص')
    }

    if (habit.frequency === 'O') {
        return 'تاریخ انجام: ' + (habit.once_date || 'نامشخص')
    }

    if (habit.frequency === 'M') {
        return 'روز ' + (habit.day_of_month || 'نامشخص') + ' هر ماه'
    }

    return ''
}

function leaveAccount() {
    if (busyHabit.value) {
        return
    }

    busyHabit.value = 'logout'

    errorMessage.value = ''

    signOut()
        .then(function () {
            return navigateTo('/auth')
        })
        .catch(function (error) {
            errorMessage.value = showError(error)
        })
        .finally(function () {
            busyHabit.value = ''
        })
}
</script>

<template>
    <main>
        <h1>عادت‌های من</h1>

        <p v-if="userName">
            خوش آمدید {{ userName }}
        </p>

        <button type="button" :disabled="busyHabit !== ''" @click="leaveAccount">
            {{ busyHabit === 'logout' ? 'در حال خروج...' : 'خروج' }}
        </button>

        <hr />

        <NuxtLink to="/habits/new">
            ایجاد عادت جدید
        </NuxtLink>

        <p v-if="successMessage" role="status">
            {{ successMessage }}
        </p>

        <p v-if="errorMessage" role="alert">
            {{ errorMessage }}
        </p>

        <p v-if="loading">
            در حال دریافت اطلاعات...
        </p>

        <p v-else-if="habitCards.length === 0">
            هنوز عادتی ثبت نکرده‌اید.
        </p>

        <section v-else>
            <article v-for="habit in habitCards" :key="habit.name">
                <h2>{{ habit.title }}</h2>

                <p>
                    تناوب:
                    {{ getFrequencyLabel(habit.frequency) }}
                </p>

                <p>
                    {{ getSchedule(habit) }}
                </p>

                <p>
                    ساعت: {{ habit.time }}
                </p>

                <p>
                    وضعیت امروز:
                    {{ habitIsComplete(habit.name) ? 'انجام شده' : 'انجام نشده' }}
                </p>

                <button type="button" :disabled="busyHabit !== ''" @click="toggleCompletion(habit)">
                    {{
                        busyHabit === habit.name
                            ? 'در حال ثبت...'
                            : habitIsComplete(habit.name)
                                ? 'علامت‌گذاری به‌عنوان انجام نشده'
                                : 'علامت‌گذاری به‌عنوان انجام شده'
                    }}
                </button>

                <NuxtLink :to="'/habits/' + habit.name">
                    ویرایش
                </NuxtLink>

                <button type="button" :disabled="busyHabit !== ''" @click="removeSelectedHabit(habit)">
                    حذف
                </button>

                <hr />
            </article>
        </section>
    </main>
</template>
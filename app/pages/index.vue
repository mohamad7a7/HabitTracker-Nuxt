<script setup>
const {
    signOut,
    listHabits,
    listCheckins,
    saveCheckin,
    eraseHabit,
    showError
} = useApp()

const habitCards = ref(null)
const dailyRecords = ref([])

const errorMessage = ref('')

const todayDate = getTodayDate()

onMounted(function () {
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
            habitCards.value = []
            errorMessage.value = showError(error)
        })
}

function findTodayCheckin(habitName) {
    return dailyRecords.value.find(function (item) {
        return item.habit === habitName &&
            item.date === todayDate
    })
}

function habitIsComplete(habitName) {
    const record = findTodayCheckin(habitName)

    return Boolean(record && Number(record.is_done) === 1)
}

function toggleCompletion(habit) {
    const previousRecord = findTodayCheckin(habit.name)

    const nextStatus = previousRecord
        ? Number(previousRecord.is_done) !== 1
        : true

    errorMessage.value = ''

    saveCheckin(
        habit.name,
        todayDate,
        nextStatus
    )
        .then(function () {
            return listCheckins()
        })
        .then(function (result) {
            dailyRecords.value = result.checkins || []
        })
        .catch(function (error) {
            errorMessage.value = showError(error)
        })
}

function removeSelectedHabit(habit) {
    const confirmation = window.confirm(
        'آیا از حذف این عادت مطمئن هستید؟'
    )

    if (!confirmation) {
        return
    }

    errorMessage.value = ''

    eraseHabit(habit.name)
        .then(function () {
            habitCards.value = habitCards.value.filter(function (item) {
                return item.name !== habit.name
            })

            dailyRecords.value = dailyRecords.value.filter(function (item) {
                return item.habit !== habit.name
            })
        })
        .catch(function (error) {
            errorMessage.value = showError(error)
        })
}

function leaveAccount() {
    errorMessage.value = ''

    signOut()
        .then(function () {
            return navigateTo('/auth')
        })
        .catch(function (error) {
            errorMessage.value = showError(error)
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
</script>

<template>
    <main>
        <h1>عادت‌های من</h1>

        <NuxtLink to="/habits/new">
            ایجاد عادت جدید
        </NuxtLink>

        <button type="button" @click="leaveAccount">
            خروج
        </button>

        <p v-if="errorMessage" role="alert">
            {{ errorMessage }}
        </p>

        <p v-else-if="habitCards === null">
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

                <button type="button" @click="toggleCompletion(habit)">
                    ثبت وضعیت امروز
                </button>

                <NuxtLink :to="'/habits/' + habit.name">
                    ویرایش
                </NuxtLink>

                <button type="button" @click="removeSelectedHabit(habit)">
                    حذف
                </button>

                <hr />
            </article>
        </section>
    </main>
</template>
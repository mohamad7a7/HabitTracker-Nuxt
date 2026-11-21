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

function habitIsComplete(habitName) {
    const record = dailyRecords.value.find(function (item) {
        return item.habit === habitName &&
            item.date === todayDate
    })

    return Boolean(record && Number(record.is_done) === 1)
}

function toggleCompletion(habit) {
    const nextStatus = !habitIsComplete(habit.name)

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

    return 'تناوب: ' + (labels[habit.frequency] || 'نامشخص') + ' - ' + schedule
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

        <p v-else-if="habitCards && habitCards.length === 0">
            هنوز عادتی ثبت نکرده‌اید.
        </p>

        <section v-else-if="habitCards">
            <article v-for="habit in habitCards" :key="habit.name">
                <h2>{{ habit.title }}</h2>

                <p>{{ getHabitInfo(habit) }}</p>

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

                <button type="button" @click="eraseHabit(habit.name)">
                    حذف
                </button>

                <hr />
            </article>
        </section>
    </main>
</template>
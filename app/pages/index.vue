<script setup>
const habits = ref([])
const checkins = ref([])

const loading = ref(true)
const busyHabit = ref('')

const errorMessage = ref('')
const successMessage = ref('')

const todayDate = ref('')

const { getHabits, deleteHabit } = useHabit()
const { getCheckIns, createCheckIn } = useCheckIn()
const { getErrorMessage } = useApi()

onMounted(function () {
    todayDate.value = getTodayDate()
    loadData()
})

function getTodayDate() {
    const today = new Date()

    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')

    return year + '-' + month + '-' + day
}

function loadData() {
    loading.value = true
    errorMessage.value = ''

    return Promise.all([
        getHabits(),
        getCheckIns()
    ])
        .then(function (results) {
            habits.value = results[0].habits || []
            checkins.value = results[1].checkins || []
        })
        .catch(function (error) {
            errorMessage.value = getErrorMessage(error)
        })
        .finally(function () {
            loading.value = false
        })
}

function loadCheckIns() {
    return getCheckIns().then(function (result) {
        checkins.value = result.checkins || []
    })
}

function getTodayCheckIn(habitName) {
    return checkins.value.find(function (checkin) {
        return checkin.habit === habitName &&
            checkin.date === todayDate.value
    })
}

function isHabitDone(habitName) {
    const checkin = getTodayCheckIn(habitName)

    return checkin && Number(checkin.is_done) === 1
}

function toggleCheckIn(habit) {
    if (busyHabit.value) {
        return
    }

    const existingCheckIn = getTodayCheckIn(habit.name)

    const nextStatus = existingCheckIn
        ? Number(existingCheckIn.is_done) !== 1
        : true

    busyHabit.value = habit.name
    errorMessage.value = ''
    successMessage.value = ''

    createCheckIn(
        habit.name,
        todayDate.value,
        nextStatus
    )
        .then(function () {
            successMessage.value = 'وضعیت عادت با موفقیت ثبت شد.'

            return loadCheckIns()
        })
        .catch(function (error) {
            errorMessage.value = getErrorMessage(error)
        })
        .finally(function () {
            busyHabit.value = ''
        })
}

function removeHabit(habit) {
    if (busyHabit.value) {
        return
    }

    const confirmed = window.confirm(
        'آیا از حذف این عادت و CheckInهای آن مطمئن هستید؟'
    )

    if (!confirmed) {
        return
    }

    busyHabit.value = habit.name
    errorMessage.value = ''
    successMessage.value = ''

    deleteHabit(habit.name)
        .then(function () {
            successMessage.value = 'عادت با موفقیت حذف شد.'

            return loadData()
        })
        .catch(function (error) {
            errorMessage.value = getErrorMessage(error)
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
</script>

<template>
    <main dir="rtl">
        <h1>عادت‌های من</h1>

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
            در حال دریافت عادت‌ها...
        </p>

        <p v-else-if="habits.length === 0">
            هنوز عادتی ثبت نکرده‌اید.
        </p>

        <section v-else>
            <article v-for="habit in habits" :key="habit.name">
                <h2>{{ habit.title }}</h2>

                <p>تناوب: {{ getFrequencyLabel(habit.frequency) }}</p>

                <p>{{ getSchedule(habit) }}</p>

                <p>ساعت: {{ habit.time }}</p>

                <p>
                    وضعیت امروز:
                    {{ isHabitDone(habit.name) ? 'انجام شده' : 'انجام نشده' }}
                </p>

                <button type="button" :disabled="busyHabit !== ''" @click="toggleCheckIn(habit)">
                    {{
                        busyHabit === habit.name
                            ? 'در حال ثبت...'
                            : isHabitDone(habit.name)
                                ? 'علامت‌گذاری به‌عنوان انجام نشده'
                                : 'علامت‌گذاری به‌عنوان انجام شده'
                    }}
                </button>

                <NuxtLink :to="'/habits/' + habit.name">
                    ویرایش
                </NuxtLink>

                <button type="button" :disabled="busyHabit !== ''" @click="removeHabit(habit)">
                    حذف
                </button>

                <hr />
            </article>
        </section>
    </main>
</template>
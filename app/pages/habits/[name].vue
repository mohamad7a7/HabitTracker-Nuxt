<script setup>
const route = useRoute()

const {
    inspectHabit,
    storeHabit,
    showError
} = useApp()

const habitName = computed(function () {
    return route.params.name
})

const isNewHabit = computed(function () {
    return habitName.value === 'new'
})

const habitFields = reactive({
    title: '',
    frequency: 'D',
    start_date: '',
    time: '',
    once_date: '',
    day_of_month: ''
})

const saving = ref(false)
const loadingData = ref(true)

const errorMessage = ref('')

function clearFields() {
    habitFields.title = ''
    habitFields.frequency = 'D'
    habitFields.start_date = ''
    habitFields.time = ''
    habitFields.once_date = ''
    habitFields.day_of_month = ''
}

function loadHabit() {
    errorMessage.value = ''

    if (isNewHabit.value) {
        clearFields()
        loadingData.value = false
        return
    }

    loadingData.value = true

    inspectHabit(habitName.value)
        .then(function (result) {
            const habit = result.habit

            habitFields.title = habit.title || ''
            habitFields.frequency = habit.frequency || 'D'
            habitFields.start_date = habit.start_date || ''
            habitFields.time = habit.time || ''
            habitFields.once_date = habit.once_date || ''
            habitFields.day_of_month = habit.day_of_month || ''
        })
        .catch(function (error) {
            errorMessage.value = showError(error)
        })
        .finally(function () {
            loadingData.value = false
        })
}

onMounted(function () {
    loadHabit()
})

watch(habitName, function () {
    loadHabit()
})

function submitHabit() {
    if (saving.value) {
        return
    }

    if (!habitFields.title.trim()) {
        errorMessage.value = 'عنوان عادت را وارد کنید.'
        return
    }

    saving.value = true
    errorMessage.value = ''

    const habitData = {
        title: habitFields.title.trim(),
        frequency: habitFields.frequency,
        time: habitFields.time,

        start_date: habitFields.frequency === 'D'
            ? habitFields.start_date
            : '',

        once_date: habitFields.frequency === 'O'
            ? habitFields.once_date
            : '',

        day_of_month: habitFields.frequency === 'M'
            ? habitFields.day_of_month
            : ''
    }

    storeHabit(
        isNewHabit.value ? '' : habitName.value,
        habitData
    )
        .then(function () {
            return navigateTo('/')
        })
        .catch(function (error) {
            errorMessage.value = showError(error)
        })
        .finally(function () {
            saving.value = false
        })
}
</script>

<template>
    <main>
        <h1>
            {{ isNewHabit ? 'ایجاد عادت جدید' : 'ویرایش عادت' }}
        </h1>

        <p v-if="loadingData">
            در حال دریافت اطلاعات...
        </p>

        <p v-if="errorMessage" role="alert">
            {{ errorMessage }}
        </p>

        <form v-if="!loadingData && !errorMessage" @submit.prevent="submitHabit">
            <div>
                <label for="title">
                    عنوان عادت
                </label>

                <input id="title" v-model="habitFields.title" type="text" required />
            </div>

            <div>
                <label for="frequency">
                    تناوب عادت
                </label>

                <select id="frequency" v-model="habitFields.frequency" required>
                    <option value="D">روزانه</option>
                    <option value="O">یک‌باره</option>
                    <option value="M">ماهانه</option>
                </select>
            </div>

            <div>
                <label for="time">
                    ساعت انجام
                </label>

                <input id="time" v-model="habitFields.time" type="time" required />
            </div>

            <div v-if="habitFields.frequency === 'D'">
                <label for="start_date">
                    تاریخ شروع
                </label>

                <input id="start_date" v-model="habitFields.start_date" type="date" required />
            </div>

            <div v-if="habitFields.frequency === 'O'">
                <label for="once_date">
                    تاریخ انجام
                </label>

                <input id="once_date" v-model="habitFields.once_date" type="date" required />
            </div>

            <div v-if="habitFields.frequency === 'M'">
                <label for="day_of_month">
                    روز ماه
                </label>

                <input id="day_of_month" v-model="habitFields.day_of_month" type="number" min="1" max="31" required />
            </div>

            <button type="submit" :disabled="saving">
                {{
                    saving
                        ? 'در حال ذخیره...'
                        : isNewHabit
                            ? 'ایجاد عادت'
                            : 'ذخیره تغییرات'
                }}
            </button>
        </form>

        <NuxtLink to="/">
            بازگشت به صفحه اصلی
        </NuxtLink>
    </main>
</template>
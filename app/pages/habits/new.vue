<script setup>
const initialData = reactive({
    title: '',
    frequency: 'D',
    start_date: '',
    time: '',
    once_date: '',
    day_of_month: ''
})

const loading = ref(false)
const errorMessage = ref('')

const { createHabit } = useHabit()
const { getErrorMessage } = useApi()

function submitHabit(formData) {
    loading.value = true
    errorMessage.value = ''

    createHabit(formData)
        .then(function () {
            return navigateTo('/')
        })
        .catch(function (error) {
            errorMessage.value = getErrorMessage(error)
        })
        .finally(function () {
            loading.value = false
        })
}
</script>

<template>
    <main dir="rtl">
        <h1>ایجاد عادت جدید</h1>

        <p v-if="errorMessage" role="alert">
            {{ errorMessage }}
        </p>

        <HabitForm mode="create" :initial-data="initialData" :loading="loading" @submit="submitHabit" />

        <NuxtLink to="/">
            بازگشت به صفحه اصلی
        </NuxtLink>
    </main>
</template>
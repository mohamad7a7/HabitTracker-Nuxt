<script setup>
const route = useRoute()

const habitId = computed(function () {
    return route.params.id
})

const initialData = reactive({
    title: '',
    frequency: 'D',
    start_date: '',
    time: '',
    once_date: '',
    day_of_month: ''
})

const loading = ref(false)
const isLoading = ref(true)

const errorMessage = ref('')

const { getHabitDetail, updateHabit } = useHabit()
const { getErrorMessage } = useApi()

function loadHabit() {
    isLoading.value = true
    errorMessage.value = ''

    getHabitDetail(habitId.value)
        .then(function (result) {
            Object.assign(initialData, result.habit)
        })
        .catch(function (error) {
            errorMessage.value = getErrorMessage(error)
        })
        .finally(function () {
            isLoading.value = false
        })
}

onMounted(function () {
    loadHabit()
})

watch(habitId, function () {
    loadHabit()
})

function submitHabit(formData) {
    loading.value = true
    errorMessage.value = ''

    updateHabit(habitId.value, formData)
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
        <h1>ویرایش عادت</h1>

        <p v-if="isLoading">
            در حال دریافت اطلاعات عادت...
        </p>

        <p v-if="errorMessage" role="alert">
            {{ errorMessage }}
        </p>

        <HabitForm v-if="!isLoading && !errorMessage" mode="edit" :initial-data="initialData" :loading="loading"
            @submit="submitHabit" />

        <NuxtLink to="/">
            بازگشت به صفحه اصلی
        </NuxtLink>
    </main>
</template>
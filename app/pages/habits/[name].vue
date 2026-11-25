<script setup>
const route = useRoute()

const {
    getHabit,
    updateHabit
} = useHabit()

const {
    getErrorMessage
} = useApi()

const habitName = computed(function () {
    return String(route.params.name || '')
})

const errorMessage = ref('')
const isSaving = ref(false)

const {
    data: habitResult,
    pending: isLoading,
    error: loadError
} = await useAsyncData(
    computed(function () {
        return 'habit-' + habitName.value
    }),
    function () {
        return getHabit(habitName.value)
    }
)

if (
    loadError.value &&
    Number(
        loadError.value.statusCode ||
        loadError.value.status ||
        0
    ) === 404
) {
    throw createError({
        statusCode: 404,
        statusMessage: 'Habit Not Found',
        fatal: true
    })
}

const loadErrorMessage = computed(function () {
    if (!loadError.value) {
        return ''
    }

    return getErrorMessage(loadError.value)
})

const initialData = computed(function () {
    if (!habitResult.value || !habitResult.value.habit) {
        return {}
    }

    return habitResult.value.habit
})

function submitHabit(habitData) {
    if (
        isSaving.value ||
        isLoading.value ||
        loadError.value ||
        !habitResult.value ||
        !habitResult.value.habit
    ) {
        return
    }

    errorMessage.value = ''
    isSaving.value = true

    updateHabit(
        habitName.value,
        habitData
    )
        .then(function () {
            return navigateTo('/')
        })
        .catch(function (error) {
            errorMessage.value = getErrorMessage(error)
        })
        .finally(function () {
            isSaving.value = false
        })
}
</script>

<template>
    <main>
        <h1>ویرایش عادت</h1>

        <p v-if="isLoading">
            در حال دریافت اطلاعات عادت...
        </p>

        <p v-else-if="loadErrorMessage" role="alert">
            {{ loadErrorMessage }}
        </p>

        <HabitForm v-else-if="habitResult && habitResult.habit" :initial-data="initialData" :loading="isSaving"
            :error-message="errorMessage" submit-text="ذخیره تغییرات" @submit="submitHabit" />

        <NuxtLink to="/">
            بازگشت
        </NuxtLink>
    </main>
</template>

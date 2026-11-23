<script setup>
const {
    createHabit
} = useHabit()

const {
    getErrorMessage
} = useApi()

const errorMessage = ref('')
const isSaving = ref(false)

function submitHabit(habitData) {
    if (isSaving.value) {
        return
    }

    errorMessage.value = ''
    isSaving.value = true

    createHabit(habitData)
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
        <h1>ایجاد عادت جدید</h1>

        <HabitForm :loading="isSaving" :error-message="errorMessage" submit-text="ایجاد عادت" @submit="submitHabit" />

        <NuxtLink to="/">
            بازگشت
        </NuxtLink>
    </main>
</template>

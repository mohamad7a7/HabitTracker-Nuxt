<script setup>
const { currentUser, logout, getErrorMessage } = useAuth()

const loading = ref(false)
const errorMessage = ref('')

function handleLogout() {
    if (loading.value) {
        return
    }

    loading.value = true
    errorMessage.value = ''

    logout()
        .then(function () {
            return navigateTo('/login')
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
    <header dir="rtl">
        <NuxtLink to="/">
            HabitTracker
        </NuxtLink>

        <span v-if="currentUser">
            {{ currentUser }}
        </span>

        <button type="button" :disabled="loading" @click="handleLogout">
            {{ loading ? 'در حال خروج...' : 'خروج' }}
        </button>

        <p v-if="errorMessage" role="alert">
            {{ errorMessage }}
        </p>
    </header>
</template>
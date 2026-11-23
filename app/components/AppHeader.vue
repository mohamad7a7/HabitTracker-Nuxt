<script setup>
const {
    auth,
    signOut,
    getErrorMessage
} = useAuth()

const errorMessage = ref('')
const isSigningOut = ref(false)

function leaveAccount() {
    if (isSigningOut.value) {
        return
    }

    errorMessage.value = ''
    isSigningOut.value = true

    signOut()
        .then(function () {
            return navigateTo('/auth')
        })
        .catch(function (error) {
            errorMessage.value = getErrorMessage(error)
        })
        .finally(function () {
            isSigningOut.value = false
        })
}
</script>

<template>
    <header v-if="auth.isLoggedIn">
        <nav>
            <NuxtLink to="/">
                خانه
            </NuxtLink>

            <NuxtLink to="/habits/new">
                ایجاد عادت
            </NuxtLink>

            <span>
                {{ auth.userName }}
            </span>

            <button type="button" :disabled="isSigningOut" @click="leaveAccount">
                {{ isSigningOut ? 'در حال خروج...' : 'خروج' }}
            </button>
        </nav>

        <p v-if="errorMessage" role="alert">
            {{ errorMessage }}
        </p>
    </header>
</template>

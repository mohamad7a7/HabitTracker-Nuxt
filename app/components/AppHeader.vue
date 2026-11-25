<script setup>
const {
    auth,
    signOut
} = useAuth()

const isSigningOut = ref(false)

function leaveAccount() {
    if (isSigningOut.value) {
        return
    }

    isSigningOut.value = true

    signOut()
        .then(function () {
            return navigateTo('/auth')
        })
        .catch(function (error) {
            console.error('Logout failed:', error)

            return navigateTo('/auth')
        })
        .finally(function () {
            isSigningOut.value = false
        })
}
</script>

<template>
    <header>
        <nav v-if="auth.isLoggedIn">
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
    </header>
</template>

<script setup>
definePageMeta({
    layout: 'auth'
})

const username = ref('')
const password = ref('')

const loading = ref(false)
const errorMessage = ref('')

const { login, getErrorMessage } = useAuth()

function submitLogin() {
    if (loading.value) {
        return
    }

    loading.value = true
    errorMessage.value = ''

    login(username.value.trim(), password.value)
        .then(function () {
            return navigateTo('/')
        }, function (error) {
            errorMessage.value = getErrorMessage(error)
        })
        .finally(function () {
            loading.value = false
        })
}
</script>

<template>
    <main dir="rtl">
        <h1>ورود به حساب کاربری</h1>

        <form @submit.prevent="submitLogin">
            <div>
                <label for="username">نام کاربری</label>

                <input id="username" v-model="username" type="text" autocomplete="username" required />
            </div>

            <div>
                <label for="password">رمز عبور</label>

                <input id="password" v-model="password" type="password" autocomplete="current-password" required />
            </div>

            <p v-if="errorMessage" role="alert">
                {{ errorMessage }}
            </p>

            <button type="submit" :disabled="loading">
                {{ loading ? 'در حال ورود...' : 'ورود' }}
            </button>
        </form>

        <p>
            حساب کاربری ندارید؟
            <NuxtLink to="/register">
                ثبت‌نام کنید
            </NuxtLink>
        </p>
    </main>
</template>
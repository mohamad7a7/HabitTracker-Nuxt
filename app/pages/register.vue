<script setup>
definePageMeta({
    layout: 'auth'
})

const username = ref('')
const password = ref('')

const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const { register, getErrorMessage } = useAuth()

function submitRegister() {
    if (loading.value) {
        return
    }

    loading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    register(username.value.trim(), password.value)
        .then(function (result) {
            successMessage.value =
                result.message || 'ثبت‌نام با موفقیت انجام شد.'

            password.value = ''
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
        <h1>ثبت‌نام</h1>

        <form @submit.prevent="submitRegister">
            <div>
                <label for="username">نام کاربری</label>

                <input id="username" v-model="username" type="text" autocomplete="username" required />
            </div>

            <div>
                <label for="password">رمز عبور</label>

                <input id="password" v-model="password" type="password" autocomplete="new-password" required />
            </div>

            <p v-if="errorMessage" role="alert">
                {{ errorMessage }}
            </p>

            <p v-if="successMessage" role="status">
                {{ successMessage }}
            </p>

            <button type="submit" :disabled="loading">
                {{ loading ? 'در حال ثبت‌نام...' : 'ثبت‌نام' }}
            </button>
        </form>

        <p>
            قبلاً ثبت‌نام کرده‌اید؟
            <NuxtLink to="/login">
                وارد شوید
            </NuxtLink>
        </p>
    </main>
</template>
<script setup>
const {
    signIn,
    signUp,
    showError
} = useApp()

const usernameInput = ref('')
const passwordInput = ref('')

const errorText = ref('')
const registrationDone = ref(false)

function enterAccount() {
    signIn(
        usernameInput.value,
        passwordInput.value
    )
        .then(function () {
            return navigateTo('/')
        })
        .catch(function (error) {
            errorText.value = showError(error)
        })
}

function createAccount() {
    signUp(
        usernameInput.value,
        passwordInput.value
    )
        .then(function () {
            registrationDone.value = true
            passwordInput.value = ''
        })
        .catch(function (error) {
            errorText.value = showError(error)
        })
}
</script>

<template>
    <main>
        <h1>حساب کاربری</h1>

        <form @submit.prevent="enterAccount">
            <div>
                <label for="username">
                    نام کاربری
                </label>

                <input id="username" v-model="usernameInput" type="text" autocomplete="username" required />
            </div>

            <div>
                <label for="password">
                    رمز عبور
                </label>

                <input id="password" v-model="passwordInput" type="password" autocomplete="current-password" required />
            </div>

            <p v-if="errorText">
                {{ errorText }}
            </p>

            <p v-if="registrationDone">
                ثبت‌نام با موفقیت انجام شد.
            </p>

            <button type="submit">
                ورود
            </button>

            <button type="button" @click="createAccount">
                ثبت‌نام
            </button>
        </form>
    </main>
</template>
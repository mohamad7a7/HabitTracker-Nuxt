<script setup>
const {
    signIn,
    signUp,
    showError
} = useApp()

const loginMode = ref(true)

const usernameInput = ref('')
const passwordInput = ref('')

const processing = ref(false)

const errorText = ref('')
const registrationDone = ref(false)

function changeMode() {
    loginMode.value = !loginMode.value

    errorText.value = ''
    registrationDone.value = false
    passwordInput.value = ''
}

function submitAccount() {
    if (processing.value) {
        return
    }

    processing.value = true
    errorText.value = ''
    registrationDone.value = false

    let accountRequest

    if (loginMode.value) {
        accountRequest = signIn(
            usernameInput.value.trim(),
            passwordInput.value
        )
    } else {
        accountRequest = signUp(
            usernameInput.value.trim(),
            passwordInput.value
        )
    }

    accountRequest
        .then(function () {
            if (loginMode.value) {
                return navigateTo('/')
            }

            registrationDone.value = true
            passwordInput.value = ''
        })
        .catch(function (error) {
            errorText.value = showError(error)
        })
        .finally(function () {
            processing.value = false
        })
}
</script>

<template>
    <main>
        <h1>حساب کاربری</h1>

        <form @submit.prevent="submitAccount">
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

                <input id="password" v-model="passwordInput" type="password"
                    :autocomplete="loginMode ? 'current-password' : 'new-password'" required />
            </div>

            <p v-if="errorText" role="alert">
                {{ errorText }}
            </p>

            <p v-if="registrationDone" role="status">
                ثبت‌نام با موفقیت انجام شد.
            </p>

            <button type="submit" :disabled="processing">
                ارسال
            </button>
        </form>

        <button type="button" :disabled="processing" @click="changeMode">
            تغییر حالت ورود و ثبت‌نام
        </button>
    </main>
</template>
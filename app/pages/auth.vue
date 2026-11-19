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
const successText = ref('')

function changeMode() {
    loginMode.value = !loginMode.value

    errorText.value = ''
    successText.value = ''
    passwordInput.value = ''
}

function submitAccount() {
    if (processing.value) {
        return
    }

    processing.value = true

    errorText.value = ''
    successText.value = ''

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

            successText.value = 'ثبت‌نام با موفقیت انجام شد.'

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
        <h1>
            {{ loginMode ? 'ورود به حساب کاربری' : 'ثبت‌نام' }}
        </h1>

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

            <p v-if="successText" role="status">
                {{ successText }}
            </p>

            <button type="submit" :disabled="processing">
                {{
                    processing
                        ? 'لطفاً صبر کنید...'
                        : loginMode
                            ? 'ورود'
                            : 'ثبت‌نام'
                }}
            </button>
        </form>

        <button type="button" :disabled="processing" @click="changeMode">
            {{
                loginMode
                    ? 'ایجاد حساب کاربری جدید'
                    : 'بازگشت به ورود'
            }}
        </button>
    </main>
</template>
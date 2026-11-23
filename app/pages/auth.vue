<script setup>
const {
    signIn,
    signUp,
    getErrorMessage
} = useAuth()

const authForm = ref(null)

const usernameInput = ref('')
const passwordInput = ref('')

const errorText = ref('')
const registrationDone = ref(false)

const isSubmitting = ref(false)
const submitAction = ref('')

function clearMessages() {
    errorText.value = ''
    registrationDone.value = false
}

function enterAccount() {
    if (isSubmitting.value) {
        return
    }

    clearMessages()

    if (!authForm.value.reportValidity()) {
        return
    }

    const username = usernameInput.value.trim()

    if (!username) {
        errorText.value = 'نام کاربری را وارد کنید.'
        return
    }

    isSubmitting.value = true
    submitAction.value = 'login'
    usernameInput.value = username

    signIn(
        username,
        passwordInput.value
    )
        .then(function () {
            return navigateTo('/')
        })
        .catch(function (error) {
            errorText.value = getErrorMessage(error)
        })
        .finally(function () {
            isSubmitting.value = false
            submitAction.value = ''
        })
}

function createAccount() {
    if (isSubmitting.value) {
        return
    }

    clearMessages()

    if (!authForm.value.reportValidity()) {
        return
    }

    const username = usernameInput.value.trim()

    if (!username) {
        errorText.value = 'نام کاربری را وارد کنید.'
        return
    }

    isSubmitting.value = true
    submitAction.value = 'register'
    usernameInput.value = username

    signUp(
        username,
        passwordInput.value
    )
        .then(function () {
            registrationDone.value = true
            passwordInput.value = ''
        })
        .catch(function (error) {
            errorText.value = getErrorMessage(error)
        })
        .finally(function () {
            isSubmitting.value = false
            submitAction.value = ''
        })
}
</script>

<template>
    <main>
        <h1>حساب کاربری</h1>

        <form ref="authForm" @submit.prevent="enterAccount">
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

            <p v-if="errorText" role="alert">
                {{ errorText }}
            </p>

            <p v-if="registrationDone" role="status">
                ثبت‌نام با موفقیت انجام شد. اکنون می‌توانید وارد شوید.
            </p>

            <button type="submit" :disabled="isSubmitting">
                {{
                    submitAction === 'login'
                        ? 'در حال ورود...'
                        : 'ورود'
                }}
            </button>

            <button type="button" :disabled="isSubmitting" @click="createAccount">
                {{
                    submitAction === 'register'
                        ? 'در حال ثبت‌نام...'
                        : 'ثبت‌نام'
                }}
            </button>
        </form>
    </main>
</template>

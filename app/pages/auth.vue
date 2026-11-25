<script setup>
const {
    signIn,
    signUp,
    getErrorMessage
} = useAuth()

const authForm = ref(null)

const usernameInput = ref('')
const passwordInput = ref('')

const authMode = ref('login')

const errorText = ref('')
const isSubmitting = ref(false)

function clearMessages() {
    errorText.value = ''
}

function switchAuthMode(mode) {
    if (isSubmitting.value) {
        return
    }

    authMode.value = mode
    passwordInput.value = ''

    clearMessages()
}

function validateForm() {
    clearMessages()

    if (!authForm.value.reportValidity()) {
        return null
    }

    const username = usernameInput.value.trim()

    if (!username) {
        errorText.value = 'نام کاربری را وارد کنید.'
        return null
    }

    if (
        authMode.value === 'register' &&
        Array.from(passwordInput.value).length < 8
    ) {
        errorText.value = 'رمز عبور باید حداقل ۸ کاراکتر داشته باشد.'
        return null
    }

    usernameInput.value = username

    return {
        username: username,
        password: passwordInput.value
    }
}

function submitForm() {
    if (isSubmitting.value) {
        return
    }

    const formData = validateForm()

    if (!formData) {
        return
    }

    isSubmitting.value = true

    if (authMode.value === 'login') {
        signIn(
            formData.username,
            formData.password
        )
            .then(function () {
                return navigateTo('/')
            })
            .catch(function (error) {
                errorText.value = getErrorMessage(error)
            })
            .finally(function () {
                isSubmitting.value = false
            })

        return
    }

    signUp(
        formData.username,
        formData.password
    )
        .then(function () {
            return signIn(
                formData.username,
                formData.password
            )
                .then(function () {
                    passwordInput.value = ''

                    return navigateTo('/')
                })
                .catch(function (error) {
                    passwordInput.value = ''

                    errorText.value =
                        'ثبت‌نام موفق بود، اما ورود خودکار انجام نشد. لطفاً وارد حساب شوید. ' +
                        getErrorMessage(error)
                })
        })
        .catch(function (error) {
            errorText.value = getErrorMessage(error)
        })
        .finally(function () {
            isSubmitting.value = false
        })
}
</script>

<template>
    <main>
        <h1>حساب کاربری</h1>

        <div>
            <button type="button" :disabled="isSubmitting" @click="switchAuthMode('login')">
                ورود
            </button>

            <button type="button" :disabled="isSubmitting" @click="switchAuthMode('register')">
                ثبت‌نام
            </button>
        </div>

        <form ref="authForm" @submit.prevent="submitForm">
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

                <input id="password" v-model="passwordInput" type="password" :autocomplete="authMode === 'register'
                        ? 'new-password'
                        : 'current-password'
                    " required />

                <p v-if="authMode === 'register'">
                    رمز عبور باید حداقل ۸ کاراکتر داشته باشد.
                </p>
            </div>

            <p v-if="errorText" role="alert">
                {{ errorText }}
            </p>

            <button type="submit" :disabled="isSubmitting">
                {{
                    isSubmitting
                        ? authMode === 'login'
                            ? 'در حال ورود...'
                            : 'در حال ثبت‌نام...'
                        : authMode === 'login'
                            ? 'ورود'
                            : 'ایجاد حساب کاربری'
                }}
            </button>
        </form>
    </main>
</template>

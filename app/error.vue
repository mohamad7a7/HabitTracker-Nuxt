<script setup>
const props = defineProps({
    error: {
        type: Object,
        required: true
    }
})

const errorCode = computed(function () {
    return props.error.statusCode || 500
})

const errorTitle = computed(function () {
    if (errorCode.value === 404) {
        return 'صفحه پیدا نشد'
    }

    if (errorCode.value === 401) {
        return 'نیاز به ورود مجدد'
    }

    if (errorCode.value === 403) {
        return 'دسترسی غیرمجاز'
    }

    if (errorCode.value === 503) {
        return 'ارتباط با سرور برقرار نشد'
    }

    return 'خطای غیرمنتظره'
})

const errorDescription = computed(function () {
    if (errorCode.value === 404) {
        return 'صفحه موردنظر پیدا نشد یا آدرس آن اشتباه است.'
    }

    if (errorCode.value === 401) {
        return 'نشست شما معتبر نیست. لطفاً دوباره وارد حساب شوید.'
    }

    if (errorCode.value === 403) {
        return 'شما اجازه دسترسی به این بخش را ندارید.'
    }

    if (errorCode.value === 503) {
        return 'ارتباط با سرور با مشکل مواجه شده است. لطفاً دوباره تلاش کنید.'
    }

    return 'هنگام اجرای برنامه مشکلی رخ داده است. لطفاً دوباره تلاش کنید.'
})

function returnHome() {
    clearError({
        redirect: '/'
    })
}

function goToLogin() {
    clearError({
        redirect: '/auth'
    })
}
</script>

<template>
    <main dir="rtl">
        <h1>{{ errorTitle }}</h1>

        <p>
            کد خطا: {{ errorCode }}
        </p>

        <p>
            {{ errorDescription }}
        </p>

        <button type="button" @click="returnHome">
            بازگشت به صفحه اصلی
        </button>

        <button v-if="errorCode === 401" type="button" @click="goToLogin">
            ورود به حساب کاربری
        </button>
    </main>
</template>

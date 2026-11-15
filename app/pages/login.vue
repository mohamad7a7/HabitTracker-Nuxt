<script setup>
definePageMeta({
    layout: 'auth'
})
</script>

<template>
    <main dir="rtl">
        <h1>ورود به حساب کاربری</h1>

        <form>
            <div>
                <label for="username">نام کاربری</label>
                <input id="username" type="text" name="username" autocomplete="username" required />
            </div>

            <div>
                <label for="password">رمز عبور</label>
                <input id="password" type="password" name="password" autocomplete="current-password" required />
            </div>

            <button type="button" disabled>
                ورود
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
<script setup>
definePageMeta({
    layout: 'auth'
})
</script>

<template>
    <main dir="rtl">
        <h1>ثبت‌نام</h1>

        <form>
            <div>
                <label for="username">نام کاربری</label>
                <input id="username" type="text" name="username" autocomplete="username" required />
            </div>

            <div>
                <label for="password">رمز عبور</label>
                <input id="password" type="password" name="password" autocomplete="new-password" required />
            </div>

            <button type="button" disabled>
                ثبت‌نام
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
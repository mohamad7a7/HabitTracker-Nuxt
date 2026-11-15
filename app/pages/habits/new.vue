<script setup>
const initialData = reactive({
    title: '',
    frequency: 'D',
    start_date: '',
    time: '',
    once_date: '',
    day_of_month: ''
})
</script>

<template>
    <main dir="rtl">
        <h1>ایجاد عادت جدید</h1>

        <HabitForm mode="create" :initial-data="initialData" />

        <NuxtLink to="/">
            بازگشت به صفحه اصلی
        </NuxtLink>
    </main>
</template>
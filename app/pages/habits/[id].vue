<script setup>
const route = useRoute()

const habitId = route.params.id

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
        <h1>ویرایش عادت</h1>

        <p>شناسه عادت: {{ habitId }}</p>

        <HabitForm mode="edit" :initial-data="initialData" />

        <NuxtLink to="/">
            بازگشت به صفحه اصلی
        </NuxtLink>
    </main>
</template>
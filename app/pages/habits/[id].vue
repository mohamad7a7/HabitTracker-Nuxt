<script setup>
const route = useRoute()

const habitId = route.params.id
</script>

<template>
    <main dir="rtl">
        <h1>ویرایش عادت</h1>
        <p>شناسه عادت: {{ habitId }}</p>
    </main>
</template>
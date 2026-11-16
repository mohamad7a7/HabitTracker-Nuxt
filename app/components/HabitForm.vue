<script setup>
const props = defineProps({
    mode: {
        type: String,
        default: 'create'
    },
    initialData: {
        type: Object,
        required: true
    },
    loading: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['submit'])

const form = reactive({
    title: '',
    frequency: 'D',
    start_date: '',
    time: '',
    once_date: '',
    day_of_month: ''
})

watch(
    () => props.initialData,
    function (value) {
        form.title = value.title || ''
        form.frequency = value.frequency || 'D'
        form.start_date = value.start_date || ''
        form.time = value.time || ''
        form.once_date = value.once_date || ''
        form.day_of_month = value.day_of_month || ''
    },
    {
        immediate: true,
        deep: true
    }
)

function submitForm() {
    emit('submit', {
        title: form.title.trim(),
        frequency: form.frequency,
        time: form.time,
        start_date: form.frequency === 'D' ? form.start_date : '',
        once_date: form.frequency === 'O' ? form.once_date : '',
        day_of_month: form.frequency === 'M' ? form.day_of_month : ''
    })
}
</script>

<template>
    <form @submit.prevent="submitForm">
        <div>
            <label for="title">عنوان عادت</label>

            <input id="title" v-model="form.title" type="text" required />
        </div>

        <div>
            <label for="frequency">تناوب عادت</label>

            <select id="frequency" v-model="form.frequency" required>
                <option value="D">روزانه</option>
                <option value="O">یک‌باره</option>
                <option value="M">ماهانه</option>
            </select>
        </div>

        <div>
            <label for="time">ساعت انجام</label>

            <input id="time" v-model="form.time" type="time" required />
        </div>

        <div v-if="form.frequency === 'D'">
            <label for="start_date">تاریخ شروع</label>

            <input id="start_date" v-model="form.start_date" type="date" required />
        </div>

        <div v-if="form.frequency === 'O'">
            <label for="once_date">تاریخ انجام</label>

            <input id="once_date" v-model="form.once_date" type="date" required />
        </div>

        <div v-if="form.frequency === 'M'">
            <label for="day_of_month">روز ماه</label>

            <input id="day_of_month" v-model="form.day_of_month" type="number" min="1" max="31" required />
        </div>

        <button type="submit" :disabled="loading">
            {{
                loading
                    ? 'در حال ذخیره...'
                    : mode === 'create'
                        ? 'ایجاد عادت'
                        : 'ذخیره تغییرات'
            }}
        </button>
    </form>
</template>
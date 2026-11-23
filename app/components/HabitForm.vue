<script setup>
const props = defineProps({
    initialData: {
        type: Object,
        default: function () {
            return {}
        }
    },
    loading: {
        type: Boolean,
        default: false
    },
    errorMessage: {
        type: String,
        default: ''
    },
    submitText: {
        type: String,
        default: 'ذخیره عادت'
    }
})

const emit = defineEmits(['submit'])

const habitFields = reactive({
    title: '',
    frequency: 'D',
    start_date: '',
    time: '',
    once_date: '',
    day_of_month: ''
})

const titleError = ref('')

function fillFields(habit) {
    habitFields.title = habit.title || ''
    habitFields.frequency = habit.frequency || 'D'
    habitFields.start_date = habit.start_date || ''
    habitFields.time = habit.time || ''
    habitFields.once_date = habit.once_date || ''
    habitFields.day_of_month = habit.day_of_month || ''
}

watch(
    function () {
        return props.initialData
    },
    function (habit) {
        fillFields(habit)
    },
    {
        immediate: true,
        deep: true
    }
)

function submitHabit() {
    const title = habitFields.title.trim()

    titleError.value = ''

    if (!title) {
        titleError.value = 'عنوان عادت را وارد کنید.'
        return
    }

    emit('submit', {
        title: title,
        frequency: habitFields.frequency,
        time: habitFields.time,

        start_date: habitFields.frequency === 'D'
            ? habitFields.start_date
            : '',

        once_date: habitFields.frequency === 'O'
            ? habitFields.once_date
            : '',

        day_of_month: habitFields.frequency === 'M'
            ? habitFields.day_of_month
            : ''
    })
}
</script>

<template>
    <form @submit.prevent="submitHabit">
        <div>
            <label for="title">
                عنوان عادت
            </label>

            <input id="title" v-model="habitFields.title" type="text" required @input="titleError = ''" />

            <p v-if="titleError" role="alert">
                {{ titleError }}
            </p>
        </div>

        <div>
            <label for="frequency">
                تناوب عادت
            </label>

            <select id="frequency" v-model="habitFields.frequency" required>
                <option value="D">روزانه</option>
                <option value="O">یک‌باره</option>
                <option value="M">ماهانه</option>
            </select>
        </div>

        <div>
            <label for="time">
                ساعت انجام
            </label>

            <input id="time" v-model="habitFields.time" type="time" required />
        </div>

        <div v-if="habitFields.frequency === 'D'">
            <label for="start_date">
                تاریخ شروع
            </label>

            <input id="start_date" v-model="habitFields.start_date" type="date" required />
        </div>

        <div v-if="habitFields.frequency === 'O'">
            <label for="once_date">
                تاریخ انجام
            </label>

            <input id="once_date" v-model="habitFields.once_date" type="date" required />
        </div>

        <div v-if="habitFields.frequency === 'M'">
            <label for="day_of_month">
                روز ماه
            </label>

            <input id="day_of_month" v-model="habitFields.day_of_month" type="number" min="1" max="31" required />
        </div>

        <p v-if="errorMessage" role="alert">
            {{ errorMessage }}
        </p>

        <button type="submit" :disabled="loading">
            {{ loading ? 'در حال ذخیره...' : submitText }}
        </button>
    </form>
</template>

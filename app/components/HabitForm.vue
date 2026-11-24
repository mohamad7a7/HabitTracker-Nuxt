<script setup>
const props = defineProps({
    initialData: {
        type: Object,
        default: function () {
            return {}
        },
    },

    loading: {
        type: Boolean,
        default: false,
    },

    errorMessage: {
        type: String,
        default: '',
    },

    submitText: {
        type: String,
        default: 'ذخیره عادت',
    },
})

const emit = defineEmits(['submit'])

const title = ref('')
const frequency = ref('D')
const startDate = ref('')
const time = ref('')
const onceDate = ref('')
const dayOfMonth = ref('')

watch(
    function () {
        return props.initialData
    },
    function (data) {
        title.value = data.title || ''
        frequency.value = data.frequency || 'D'
        startDate.value = data.start_date || ''
        time.value = data.time || ''
        onceDate.value = data.once_date || ''
        dayOfMonth.value = data.day_of_month ?? ''
    },
    {
        immediate: true,
    },
)

function submitForm() {
    const cleanTitle = title.value.trim()

    if (!cleanTitle) {
        return
    }

    if (cleanTitle.length > 100) {
        return
    }

    const habitData = {
        title: cleanTitle,
        frequency: frequency.value,
        time: time.value,
    }

    if (frequency.value === 'D') {
        habitData.start_date = startDate.value
    } else if (frequency.value === 'O') {
        habitData.once_date = onceDate.value
    } else if (frequency.value === 'M') {
        const day = Number(dayOfMonth.value)

        if (
            !Number.isInteger(day) ||
            day < 1 ||
            day > 31
        ) {
            return
        }

        habitData.day_of_month = day
    }

    emit('submit', habitData)
}
</script>

<template>
    <form @submit.prevent="submitForm">
        <div>
            <label for="habit-title">عنوان عادت:</label>

            <input id="habit-title" v-model="title" type="text" maxlength="100" required />
        </div>

        <div>
            <label for="habit-frequency">نوع تکرار:</label>

            <select id="habit-frequency" v-model="frequency" required>
                <option value="D">روزانه</option>
                <option value="O">یک‌باره</option>
                <option value="M">ماهانه</option>
            </select>
        </div>

        <div>
            <label for="habit-time">ساعت انجام:</label>

            <input id="habit-time" v-model="time" type="time" required />
        </div>

        <div v-if="frequency === 'D'">
            <label for="habit-start-date">تاریخ شروع:</label>

            <input id="habit-start-date" v-model="startDate" type="date" required />
        </div>

        <div v-if="frequency === 'O'">
            <label for="habit-once-date">تاریخ انجام:</label>

            <input id="habit-once-date" v-model="onceDate" type="date" required />
        </div>

        <div v-if="frequency === 'M'">
            <label for="habit-day-of-month">روز ماه:</label>

            <input id="habit-day-of-month" v-model.number="dayOfMonth" type="number" min="1" max="31" step="1"
                required />
        </div>

        <p v-if="errorMessage" role="alert">
            {{ errorMessage }}
        </p>

        <button type="submit" :disabled="loading">
            {{ loading ? 'در حال ذخیره...' : submitText }}
        </button>
    </form>
</template>
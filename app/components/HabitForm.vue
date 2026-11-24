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

const validationError = ref('')

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

        validationError.value = ''
    },
    {
        immediate: true,
    },
)

function clearValidationError() {
    validationError.value = ''
}

function submitForm() {
    if (props.loading) {
        return
    }

    const cleanTitle = title.value.trim()

    if (!cleanTitle) {
        validationError.value = 'لطفاً عنوان عادت را وارد کنید.'
        return
    }

    if (cleanTitle.length > 100) {
        validationError.value = 'عنوان عادت نباید بیشتر از ۱۰۰ کاراکتر باشد.'
        return
    }

    if (!['D', 'O', 'M'].includes(frequency.value)) {
        validationError.value = 'لطفاً نوع تکرار عادت را انتخاب کنید.'
        return
    }

    if (!time.value) {
        validationError.value = 'لطفاً ساعت انجام عادت را وارد کنید.'
        return
    }

    const habitData = {
        title: cleanTitle,
        frequency: frequency.value,
        time: time.value,
    }

    if (frequency.value === 'D') {
        if (!startDate.value) {
            validationError.value = 'لطفاً تاریخ شروع عادت را وارد کنید.'
            return
        }

        habitData.start_date = startDate.value
    } else if (frequency.value === 'O') {
        if (!onceDate.value) {
            validationError.value = 'لطفاً تاریخ انجام عادت را وارد کنید.'
            return
        }

        habitData.once_date = onceDate.value
    } else if (frequency.value === 'M') {
        const day = Number(dayOfMonth.value)

        if (
            !Number.isInteger(day) ||
            day < 1 ||
            day > 31
        ) {
            validationError.value = 'روز ماه باید عددی صحیح بین ۱ تا ۳۱ باشد.'
            return
        }

        habitData.day_of_month = day
    }

    validationError.value = ''

    emit('submit', habitData)
}
</script>

<template>
    <form novalidate @submit.prevent="submitForm">
        <div>
            <label for="habit-title">عنوان عادت:</label>

            <input id="habit-title" v-model="title" type="text" maxlength="100" required
                @input="clearValidationError" />
        </div>

        <div>
            <label for="habit-frequency">نوع تکرار:</label>

            <select id="habit-frequency" v-model="frequency" required @change="clearValidationError">
                <option value="D">روزانه</option>
                <option value="O">یک‌باره</option>
                <option value="M">ماهانه</option>
            </select>
        </div>

        <div>
            <label for="habit-time">ساعت انجام:</label>

            <input id="habit-time" v-model="time" type="time" required @input="clearValidationError" />
        </div>

        <div v-if="frequency === 'D'">
            <label for="habit-start-date">تاریخ شروع:</label>

            <input id="habit-start-date" v-model="startDate" type="date" required @input="clearValidationError" />
        </div>

        <div v-if="frequency === 'O'">
            <label for="habit-once-date">تاریخ انجام:</label>

            <input id="habit-once-date" v-model="onceDate" type="date" required @input="clearValidationError" />
        </div>

        <div v-if="frequency === 'M'">
            <label for="habit-day-of-month">روز ماه:</label>

            <input id="habit-day-of-month" v-model.number="dayOfMonth" type="number" min="1" max="31" step="1" required
                @input="clearValidationError" />
        </div>

        <p v-if="validationError" role="alert">
            {{ validationError }}
        </p>

        <p v-if="errorMessage" role="alert">
            {{ errorMessage }}
        </p>

        <button type="submit" :disabled="loading">
            {{ loading ? 'در حال ذخیره...' : submitText }}
        </button>
    </form>
</template>

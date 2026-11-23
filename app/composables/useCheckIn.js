
export function useCheckIn() {
    const {
        request
    } = useApi()

    function getCheckins() {
        return request(
            'habit_tracker_get_checkins',
            {},
            'GET'
        )
    }

    function saveCheckin(habitName, date, isDone) {
        return request(
            'habit_tracker_create_checkin',
            {
                habit: habitName,
                date: date,
                is_done: isDone
            },
            'POST'
        )
    }

    function updateCheckinRecords(records, habitName, date, isDone) {
        const updatedRecords = (records || []).slice()

        const index = updatedRecords.findIndex(function (item) {
            return item.habit === habitName &&
                item.date === date
        })

        const record = {
            habit: habitName,
            date: date,
            is_done: isDone ? 1 : 0
        }

        if (index !== -1) {
            updatedRecords[index] = Object.assign(
                {},
                updatedRecords[index],
                record
            )
        } else {
            updatedRecords.push(record)
        }

        return updatedRecords
    }

    return {
        getCheckins,
        saveCheckin,
        updateCheckinRecords
    }
}

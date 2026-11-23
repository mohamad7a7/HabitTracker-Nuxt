
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

    return {
        getCheckins,
        saveCheckin
    }
}

export function useCheckIn() {
    const { request } = useApi()

    function getCheckIns() {
        return request(
            'habit_tracker_get_checkins',
            {},
            'GET'
        )
    }

    function createCheckIn(habitName, date, isDone) {
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
        getCheckIns,
        createCheckIn
    }
}
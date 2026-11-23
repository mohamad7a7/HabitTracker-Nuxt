
export function useHabit() {
    const {
        request
    } = useApi()

    function getHabits() {
        return request(
            'habit_tracker_get_habits',
            {},
            'GET'
        )
    }

    function getHabit(habitName) {
        return request(
            'habit_tracker_get_habit_detail',
            {
                habit_name: habitName
            },
            'GET'
        )
    }

    function createHabit(habitData) {
        return request(
            'habit_tracker_create_habit',
            habitData,
            'POST'
        )
    }

    function updateHabit(habitName, habitData) {
        const information = Object.assign(
            {},
            habitData,
            {
                habit_name: habitName
            }
        )

        return request(
            'habit_tracker_update_habit',
            information,
            'POST'
        )
    }

    function deleteHabit(habitName) {
        return request(
            'habit_tracker_delete_habit',
            {
                habit_name: habitName
            },
            'POST'
        )
    }

    return {
        getHabits,
        getHabit,
        createHabit,
        updateHabit,
        deleteHabit
    }
}

export function useHabit() {
    const { request } = useApi()

    function getHabits() {
        return request(
            'habit_tracker_get_habits',
            {},
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

    function getHabitDetail(habitName) {
        return request(
            'habit_tracker_get_habit_detail',
            {
                habit_name: habitName
            },
            'GET'
        )
    }

    function updateHabit(habitName, habitData) {
        const data = Object.assign(
            {
                habit_name: habitName
            },
            habitData
        )

        return request(
            'habit_tracker_update_habit',
            data,
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
        createHabit,
        getHabitDetail,
        updateHabit,
        deleteHabit
    }
}
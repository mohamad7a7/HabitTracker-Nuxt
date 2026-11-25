
export function useToday(onDateChange) {
    const todayDate = useState('habitTodayDate', function () {
        return ''
    })

    let midnightTimer = null

    function getTodayDate() {
        const today = new Date()

        const year = today.getFullYear()
        const month = String(today.getMonth() + 1).padStart(2, '0')
        const day = String(today.getDate()).padStart(2, '0')

        return year + '-' + month + '-' + day
    }

    function updateTodayDate(forceCallback) {
        const nextDate = getTodayDate()

        const hasChanged = todayDate.value !== nextDate

        if (hasChanged) {
            todayDate.value = nextDate
        }

        if (
            (hasChanged || forceCallback) &&
            typeof onDateChange === 'function'
        ) {
            onDateChange(nextDate)
        }
    }

    function scheduleDateUpdate() {
        clearTimeout(midnightTimer)

        const now = new Date()

        const nextMidnight = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + 1,
            0,
            0,
            1
        )

        const delay = nextMidnight.getTime() - now.getTime()

        midnightTimer = setTimeout(function () {
            updateTodayDate()
            scheduleDateUpdate()
        }, delay)
    }

    function handleWindowFocus() {
        updateTodayDate()
        scheduleDateUpdate()
    }

    function handleVisibilityChange() {
        if (document.visibilityState === 'visible') {
            updateTodayDate()
            scheduleDateUpdate()
        }
    }

    onMounted(function () {
        updateTodayDate(true)
        scheduleDateUpdate()

        window.addEventListener(
            'focus',
            handleWindowFocus
        )

        document.addEventListener(
            'visibilitychange',
            handleVisibilityChange
        )
    })

    onUnmounted(function () {
        clearTimeout(midnightTimer)

        window.removeEventListener(
            'focus',
            handleWindowFocus
        )

        document.removeEventListener(
            'visibilitychange',
            handleVisibilityChange
        )
    })

    return {
        todayDate
    }
}

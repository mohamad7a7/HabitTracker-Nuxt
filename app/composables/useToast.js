
export function useToast() {
    const messages = reactive({
        deleteError: '',
        deleteSuccess: '',
        checkinError: '',
        checkinSuccess: ''
    })

    const timers = {
        deleteError: null,
        deleteSuccess: null,
        checkinError: null,
        checkinSuccess: null
    }

    function clearMessage(messageName) {
        clearTimeout(timers[messageName])

        timers[messageName] = null
        messages[messageName] = ''
    }

    function showMessage(messageName, message) {
        clearMessage(messageName)

        messages[messageName] = message

        timers[messageName] = setTimeout(function () {
            messages[messageName] = ''
            timers[messageName] = null
        }, 10000)
    }

    function clearAllMessages() {
        Object.keys(messages).forEach(function (messageName) {
            clearMessage(messageName)
        })
    }

    onUnmounted(function () {
        clearAllMessages()
    })

    return {
        messages,
        showMessage,
        clearMessage,
        clearAllMessages
    }
}

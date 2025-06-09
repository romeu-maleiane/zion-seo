export const formatDate = (date: string) => {
    const newDate = new Date(date)

    const formatedDate = newDate.toLocaleDateString('en-US', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit'
    })
    return formatedDate
}
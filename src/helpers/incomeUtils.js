export function getIncomeIcon(entry) {
    if (entry.isReceived) return 'check_circle';
    return 'schedule';
}

export function getIncomeColor(entry) {
    if (entry.isReceived) return 'positive';
    return 'grey';
}


const getHourBetween = (start, end) => {
    const startHour = new Date(start).getHours();
    const endHour = new Date(end).getHours();
    return endHour - startHour;
}

module.exports = {
    getHourBetween
}
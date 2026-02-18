
export const toLocalDateStr = (date: string | Date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const isSameDay = (date1: string | Date, date2: string | Date) => {
    return toLocalDateStr(date1) === toLocalDateStr(date2);
};

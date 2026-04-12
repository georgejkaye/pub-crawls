export const getDateFromNullableString = (dateString: string | null) =>
  !dateString ? null : new Date(Date.parse(dateString))

export const getDateRangeString = (start: Date | null, end: Date | null) => {
  const startString = !start
    ? ""
    : start.toLocaleDateString("en-UK", {
        weekday: "long",

        day: "2-digit",
        month: "long",
      })
  const lastDay = end
  if (lastDay) {
    lastDay.setDate(lastDay.getDate() - 1)
  }
  const endString = !lastDay
    ? ""
    : lastDay.toLocaleDateString("en-UK", {
        weekday: "long",
        day: "2-digit",
        month: "long",
      })
  return `${startString} - ${endString}`
}

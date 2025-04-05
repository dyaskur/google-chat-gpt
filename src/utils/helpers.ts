export function isCurrentTimeInRange(startTime: string, endTime: string): boolean {
  const now = new Date()
  const currentMinutes: number = now.getHours() * 60 + now.getMinutes()

  const [startHour, startMinute] = startTime.split(':').map(Number)
  const [endHour, endMinute] = endTime.split(':').map(Number)

  const startMinutes: number = startHour * 60 + startMinute
  const endMinutes: number = endHour * 60 + endMinute

  if (startMinutes <= endMinutes) {
    // Normal case: range does not cross midnight
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes
  } else {
    // Midnight case: valid if it's after startMinutes or before endMinutes
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes
  }
}
export type HourRange = {
  start: string
  end: string
}
export function isCurrentTimeInRanges(ranges: HourRange[]) {
  for (const range of ranges) {
    if (isCurrentTimeInRange(range.start, range.end)) {
      return true
    }
  }
  return false
}

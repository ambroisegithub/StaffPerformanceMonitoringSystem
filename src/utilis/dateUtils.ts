import { format, parseISO, isValid } from "date-fns"

export const formatDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString)
    if (!isValid(date)) return "Invalid date"
    return format(date, "MMM dd, yyyy")
  } catch (error) {
    return "Invalid date"
  }
}

export const formatDateTime = (dateString: string): string => {
  try {
    const date = parseISO(dateString)
    if (!isValid(date)) return "Invalid date"
    return format(date, "MMM dd, yyyy h:mm a")
  } catch (error) {
    return "Invalid date"
  }
}


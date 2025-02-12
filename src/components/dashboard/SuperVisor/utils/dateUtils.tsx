export const getStartDateFromTimeRange = (range: string): string => {
    const today = new Date()
    switch (range) {
      case "7days":
        return new Date(today.setDate(today.getDate() - 7)).toISOString().split("T")[0]
      case "30days":
        return new Date(today.setDate(today.getDate() - 30)).toISOString().split("T")[0]
      case "90days":
        return new Date(today.setDate(today.getDate() - 90)).toISOString().split("T")[0]
      case "year":
        return new Date(today.setFullYear(today.getFullYear() - 1)).toISOString().split("T")[0]
      default:
        return new Date(today.setDate(today.getDate() - 30)).toISOString().split("T")[0]
    }
  }
  
  export const formatDate = (dateString: string): string => {
    if (!dateString) return "Unknown Date"
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }
  
  
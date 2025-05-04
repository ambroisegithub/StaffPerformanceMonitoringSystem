/**
 * Validates an email address
 * @param email The email address to validate
 * @returns True if the email is valid, false otherwise
 */
export const isValidEmail = (email: string): boolean => {
    if (!email) return true // Allow empty email (not required)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
  
  /**
   * Validates a URL
   * @param url The URL to validate
   * @returns True if the URL is valid, false otherwise
   */
  export const isValidUrl = (url: string): boolean => {
    if (!url) return true // Allow empty URL (not required)
    try {
      new URL(url)
      return true
    } catch (e) {
      return false
    }
  }
  
  /**
   * Validates a phone number (basic validation)
   * @param phone The phone number to validate
   * @returns True if the phone number is valid, false otherwise
   */
  export const isValidPhone = (phone: string): boolean => {
    if (!phone) return true // Allow empty phone (not required)
    // Basic validation - at least 6 digits, can contain spaces, dashes, parentheses, and plus sign
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/
    return phoneRegex.test(phone)
  }
  
  /**
   * Validates a date string
   * @param dateStr The date string to validate
   * @returns True if the date is valid, false otherwise
   */
  export const isValidDate = (dateStr: string): boolean => {
    if (!dateStr) return true // Allow empty date (not required)
    const date = new Date(dateStr)
    return !isNaN(date.getTime())
  }
  
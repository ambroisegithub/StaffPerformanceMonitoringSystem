export const getAdminId = (): number | null => {
    if (typeof window === "undefined") return null
  
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      if (user && user.id && (user.role === "overall" || user.role === "admin")) {
        return user.id
      }
      return null
    } catch (error) {
      return null
    }
  }
  
  export const isadmin = (): boolean => {
    if (typeof window === "undefined") return false
  
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      return user && (user.role === "overall" || user.role === "admin")
    } catch (error) {
      return false
    }
  }
  
  
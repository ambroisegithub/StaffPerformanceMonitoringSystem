import React from "react"

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue"></div>
    </div>
  )
}

export default LoadingSpinner

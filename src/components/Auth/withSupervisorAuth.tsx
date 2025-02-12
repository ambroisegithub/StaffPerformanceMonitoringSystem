"use client"

import React from "react"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { isSupervisor } from "../../utilis/auth"

export default function withSupervisorAuth<P extends object>(WrappedComponent: React.ComponentType<P>) {
  return function WithSupervisorAuth(props: P) {
    const navigate = useNavigate()
    const [isAuthorized, setIsAuthorized] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      const checkAuth = () => {
        if (!isSupervisor()) {
          navigate("/login?redirect=" + window.location.pathname)
        } else {
          setIsAuthorized(true)
        }
        setLoading(false)
      }

      checkAuth()
    }, [navigate])

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      )
    }

    if (!isAuthorized) {
      return null
    }

    return <WrappedComponent {...props} />
  }
}


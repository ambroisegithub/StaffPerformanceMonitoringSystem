"use client"

import React from "react"
import { useEffect, useRef, useState } from "react"

interface VideoBackgroundProps {
  videoSrc: string
  fallbackImage?: string
  overlay?: boolean
  overlayOpacity?: number
  className?: string
  children?: React.ReactNode
  preserveAspectRatio?: boolean
}

const VideoBackground: React.FC<VideoBackgroundProps> = ({
  videoSrc,
  fallbackImage = "",
  overlay = true,
  overlayOpacity = 0,
  className = "",
  children,
  preserveAspectRatio = true,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if device is mobile for performance optimization
    const checkMobile = () => {
      setIsMobile(
        window.innerWidth < 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      )
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (video && !isMobile) {
      const handleCanPlay = () => {
        setIsVideoLoaded(true)
        video.play().catch(console.error)
      }

      const handleLoadedMetadata = () => {
        // Ensure video plays smoothly
        video.currentTime = 0
      }

      video.addEventListener("canplay", handleCanPlay)
      video.addEventListener("loadedmetadata", handleLoadedMetadata)

      return () => {
        video.removeEventListener("canplay", handleCanPlay)
        video.removeEventListener("loadedmetadata", handleLoadedMetadata)
      }
    }
  }, [isMobile])

  return (
    <div className={`relative ${className}`}>
      {/* Video Background - Hidden on mobile for performance */}
      {!isMobile && (
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
            isVideoLoaded ? "opacity-100" : "opacity-0"
          }`}
          style={{
            zIndex: 0,
            objectFit: preserveAspectRatio ? "contain" : "cover",
            objectPosition: "center",
            minWidth: "100%",
            minHeight: "100%",
          }}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          tabIndex={-1}
        >
          <source src={videoSrc} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}

      {/* Fallback Background Image */}
      {(isMobile || fallbackImage) && (
        <div
          className="absolute inset-0 bg-gradient-to-br from-blue-100 via-purple-50 to-blue-200"
          style={{
            zIndex: 1,
            backgroundImage: fallbackImage ? `url(${fallbackImage})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      )}

      {/* Semi-transparent Overlay */}
      {overlay && overlayOpacity > 0 && (
        <div
          className="absolute inset-0 bg-white"
          style={{
            zIndex: 2,
            opacity: overlayOpacity,
          }}
        />
      )}

      {/* Content Layer */}
      <div className="relative" style={{ zIndex: 10 }}>
        {children}
      </div>
    </div>
  )
}

export default VideoBackground

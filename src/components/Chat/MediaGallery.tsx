"use client"

import React from "react"
import { useState, useEffect } from "react"
import { X, ImageIcon, FileText, Video, File } from "lucide-react"
import { useAppSelector } from "../../Redux/hooks"

interface MediaGalleryProps {
  conversationId: string
  onClose: () => void
}

type MediaItem = {
  id: number
  type: string
  url: string
  name: string
  messageId: number
  created_at: string
}

const MediaGallery: React.FC<MediaGalleryProps> = ({ conversationId, onClose }) => {
  const [activeTab, setActiveTab] = useState<"all" | "images" | "videos" | "documents">("all")
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)

  const messages = useAppSelector((state) =>
    state.chat.messages
      .flatMap((group) => group.messages)
      .filter((message) => message.attachments && message.attachments.length > 0),
  )

  useEffect(() => {
    // Extract all media items from messages
    const items: MediaItem[] = []

    messages.forEach((message) => {
      if (message.attachments) {
        message.attachments.forEach((attachment) => {
          items.push({
            id: Math.random(), // In a real app, use a proper ID
            type: attachment.type,
            url: attachment.url,
            name: attachment.name,
            messageId: message.id,
            created_at: message.created_at,
          })
        })
      }
    })

    // Sort by date (newest first)
    items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    setMediaItems(items)
    setLoading(false)
  }, [messages])

  const filteredItems = mediaItems.filter((item) => {
    if (activeTab === "all") return true
    if (activeTab === "images") return item.type.startsWith("image/")
    if (activeTab === "videos") return item.type.startsWith("video/")
    if (activeTab === "documents") return !item.type.startsWith("image/") && !item.type.startsWith("video/")
    return true
  })

  const renderMediaItem = (item: MediaItem) => {
    if (item.type.startsWith("image/")) {
      return (
        <div className="relative group rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 aspect-square">
          <img src={item.url || "/placeholder.svg"} alt={item.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
          </div>
        </div>
      )
    }

    if (item.type.startsWith("video/")) {
      return (
        <div className="relative group rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 aspect-video">
          <video src={item.url} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </div>
        </div>
      )
    }

    // Document or other file
    return (
      <div className="relative group rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 p-4 flex flex-col items-center justify-center aspect-square">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
        <p className="mt-2 text-xs text-center truncate max-w-full">{item.name}</p>
      </div>
    )
  }

  return (
    <div className="absolute inset-0 z-10 bg-white dark:bg-gray-800 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Media Gallery</h3>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === "all"
              ? "text-blue border-b-2 border-blue"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
          onClick={() => setActiveTab("all")}
        >
          All
        </button>
        <button
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === "images"
              ? "text-blue border-b-2 border-blue"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
          onClick={() => setActiveTab("images")}
        >
          Images
        </button>
        <button
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === "videos"
              ? "text-blue border-b-2 border-blue"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
          onClick={() => setActiveTab("videos")}
        >
          Videos
        </button>
        <button
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === "documents"
              ? "text-blue border-b-2 border-blue"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
          onClick={() => setActiveTab("documents")}
        >
          Documents
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue border-t-transparent"></div>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <div key={item.id}>{renderMediaItem(item)}</div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            {activeTab === "images" ? (
              <ImageIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-2" />
            ) : activeTab === "videos" ? (
              <Video className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-2" />
            ) : activeTab === "documents" ? (
              <FileText className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-2" />
            ) : (
              <File className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-2" />
            )}
            <p className="text-gray-500 dark:text-gray-400">No media found</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default MediaGallery

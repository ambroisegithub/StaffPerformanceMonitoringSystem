"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../../Redux/hooks"
import {
  connectSocket,
  fetchConversations,
  fetchAvailableHelpers,
  selectIsConnected,
  disconnectSocket,
  clearSocket,
  fetchConversation,
} from "./ChatSlice"
import ChatSidebar from "./ChatSidebar"
import ChatPanel from "./ChatPanel"
import { Bell, Menu, X } from "lucide-react"
import { Button } from "../ui/button"

interface ChatLayoutProps {
  userId: number
  organizationId: number
  initialConversationId?: string | null
  onClose?: () => void
}

const ChatLayout: React.FC<ChatLayoutProps> = ({ userId, organizationId, initialConversationId, onClose }) => {
  const dispatch = useAppDispatch()
  const isConnected = useAppSelector(selectIsConnected)
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(initialConversationId || null)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  useEffect(() => {
    // Connect to socket when component mounts
    dispatch(connectSocket({ userId, organizationId }))

    // Fetch conversations and helpers
    dispatch(fetchConversations({ organizationId, userId }))
    dispatch(fetchAvailableHelpers({ organizationId, userId }))

    // If an initial conversation ID is provided, load that conversation
    if (initialConversationId) {
      dispatch(fetchConversation({ conversationId: initialConversationId, userId }))
    }

    // Cleanup when component unmounts
    return () => {
      dispatch(disconnectSocket())
      dispatch(clearSocket())
    }
  }, [dispatch, userId, organizationId, initialConversationId])

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId)
    setIsMobileSidebarOpen(false) // Close mobile sidebar when selecting a conversation
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Top Navbar */}
      <div className="h-16 bg-white border-b border-gray-200 px-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center">
          <button
            className="md:hidden mr-4 p-2 rounded-md hover:bg-gray-100"
            onClick={() => setIsMobileSidebarOpen(true)}
          >
            <Menu className="h-5 w-5 text-gray-500" />
          </button>
          <h2 className="text-lg font-semibold text-gray-800">Team Chat</h2>
          {isConnected ? (
            <span className="ml-2 px-2 py-1 text-xs bg-green text-white rounded-full">Connected</span>
          ) : (
            <span className="ml-2 px-2 py-1 text-xs bg-red text-white rounded-full">Disconnected</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5 text-gray-500" />
          </Button>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <ChatSidebar
          userId={userId}
          organizationId={organizationId}
          selectedConversationId={selectedConversationId}
          onSelectConversation={handleSelectConversation}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <ChatPanel userId={userId} organizationId={organizationId} conversationId={selectedConversationId} />
        </div>
      </div>
    </div>
  )
}

export default ChatLayout

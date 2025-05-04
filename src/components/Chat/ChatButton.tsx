"use client"

import React from "react"
import { MessageSquare, Loader } from "lucide-react"
import { useAppDispatch, useAppSelector } from "../../Redux/hooks"
import { toggleChat } from "./chatSlice"
import Chat from "./Chat"

interface ChatButtonProps {
  userId: number
  organizationId: number
}

const ChatButton: React.FC<ChatButtonProps> = ({ userId, organizationId }) => {
  const dispatch = useAppDispatch()
  const { isOpen, conversations, loading, sendingMessage } = useAppSelector((state) => state.chat)

  const totalUnread = conversations.reduce((total, conversation) => total + conversation.unreadCount, 0)

  const handleToggleChat = () => {
    dispatch(toggleChat())
  }

  return (
    <>
      <button
        className="relative p-2 bg-blue rounded-full hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-lg"
        onClick={handleToggleChat}
        aria-label={`Chat ${totalUnread > 0 ? `(${totalUnread} unread)` : ""}`}
      >
        {loading || sendingMessage ? (
          <Loader className="h-6 w-6 animate-spin text-white" />
        ) : (
          <MessageSquare className="h-6 w-6 text-white" />
        )}
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {totalUnread > 99 ? "99+" : totalUnread}
          </span>
        )}
      </button>

      <Chat userId={userId} organizationId={organizationId} />
    </>
  )
}

export default ChatButton

import React from "react"
import { MoreHorizontal, Phone, Video, Briefcase } from "lucide-react"
import type { Conversation } from "./chatSlice"

interface ChatHeaderProps {
  conversation: Conversation | undefined
  onlineUsers: number[]
  currentUserId: number
  taskContext?: TaskChatContext | null
}

interface TaskChatContext {
  taskId: number
  taskTitle: string
  userId: number
  userName: string
  taskDescription: string
  autoOpen: boolean
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ conversation, onlineUsers, currentUserId, taskContext }) => {
  // Use taskContext if no conversation is selected yet
  const displayUser =
    conversation?.otherUser ||
    (taskContext
      ? {
          id: taskContext.userId,
          name: taskContext.userName,
          profilePictureUrl: null,
        }
      : null)

  const displayTask =
    conversation?.task ||
    (taskContext
      ? {
          id: taskContext.taskId,
          title: taskContext.taskTitle,
        }
      : null)

  if (!displayUser) return null

  const isOnline = onlineUsers.includes(displayUser.id)

  return (
    <div className="flex items-center">
      <div className="relative mr-3">
        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-300 overflow-hidden">
          {displayUser.profilePictureUrl ? (
            <img
              src={displayUser.profilePictureUrl || "/placeholder.svg"}
              alt={displayUser.name}
              className="h-full w-full object-cover"
            />
          ) : (
            displayUser.name.charAt(0).toUpperCase()
          )}
        </div>
        {isOnline && (
          <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-800"></div>
        )}
      </div>

      <div className="flex-1">
        <h3 className="font-medium text-gray-900 dark:text-white">{displayUser.name}</h3>
        <div className="flex items-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {conversation ? (isOnline ? "Online" : "Offline") : "Starting conversation..."}
          </p>

          {displayTask && (
            <div className="ml-2 flex items-center text-xs text-blue-600 dark:text-blue-400">
              <Briefcase className="h-3 w-3 mr-1" />
              <span className="truncate max-w-[150px]" title={displayTask.title}>
                {displayTask.title}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
          aria-label="Voice call"
        >
          <Phone size={18} />
        </button>
        <button
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
          aria-label="Video call"
        >
          <Video size={18} />
        </button>
        <button
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
          aria-label="More options"
        >
          <MoreHorizontal size={18} />
        </button>
      </div>
    </div>
  )
}

export default ChatHeader

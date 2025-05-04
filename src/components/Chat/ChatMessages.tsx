// @ts-nocheck

"use client"

import React from "react"
import { useEffect, useRef, useState } from "react"
import { useAppSelector } from "../../Redux/hooks"
import {
  Check,
  CheckCheck,
  Copy,
  Reply,
  Pin,
  Forward,
  Trash2,
  SmileIcon as EmojiSmile,
  MessageSquare,
  Loader,
  Briefcase,
} from "lucide-react"
import type { Message } from "./chatSlice"
import EmojiPicker from "emoji-picker-react"
import { showErrorToast, showSuccessToast } from "../../utilis/ToastProps"

interface TaskChatContext {
  taskId: number
  taskTitle: string
  userId: number
  userName: string
  taskDescription: string
  autoOpen: boolean
}

interface ChatMessagesProps {
  conversationId: string
  currentUserId: number
  onPinMessage: (messageId: number) => void
  taskContext: TaskChatContext | null
  // Additional props for auto-conversation creation when no conversationId
  users?: any[]
  dispatch?: any
  currentUser?: any
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
  conversationId,
  currentUserId,
  onPinMessage,
  taskContext,
  users = [],
  dispatch,
  currentUser,
}) => {
  const { messages = [], typingUsers = {}, messagesLoading } = useAppSelector((state) => state.chat) || {}
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [selectedMessage, setSelectedMessage] = useState<number | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState<number | null>(null)
  const [messageReactions, setMessageReactions] = useState<Record<number, Record<string, number>>>({})
  const [userReactions, setUserReactions] = useState<Record<number, string>>({})
  const [isCreatingConversation, setIsCreatingConversation] = useState(false)
  const emojiPickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    // Close emoji picker when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // AUTO-CREATE CONVERSATION WHEN TASK CONTEXT EXISTS BUT NO CONVERSATION ID
  useEffect(() => {
    if (!conversationId && taskContext && users.length > 0 && dispatch && currentUser && !isCreatingConversation) {
      console.log("ChatMessages: Auto-creating conversation for task context")
      autoCreateTaskConversation()
    }
  }, [conversationId, taskContext, users.length, dispatch, currentUser, isCreatingConversation])

  const autoCreateTaskConversation = async () => {
    if (isCreatingConversation) return

    setIsCreatingConversation(true)

    try {
      // Find receiver information from users list or task context
      const receiverFromUsers = users.find((user) => user.id === taskContext?.userId)
      const receiverInfo = receiverFromUsers || {
        id: taskContext?.userId,
        name: taskContext?.userName,
        email: "", // Default empty email
      }

      console.log("ChatMessages: Auto-creating conversation for task:", taskContext?.taskTitle)
      console.log("ChatMessages: Receiver Info::", receiverInfo)

      // Import socket services - same as ChatInput
      const { createConversation, joinConversation } = await import("../../services/socketService")
      const { selectConversation, addNewConversation, fetchMessages } = await import("./chatSlice")

      // Create the conversation with proper payload
      const createPayload = {
        senderId: currentUser?.id,
        receiverId: taskContext?.userId,
        title: `Task: ${taskContext?.taskTitle}`,
        taskId: taskContext?.taskId,
        taskTitle: taskContext?.taskTitle,
      }

      console.log("ChatMessages: Creating conversation with payload:", createPayload)

      const result = await createConversation(
        taskContext?.userId,
        undefined, // No initial message
        undefined, // No daily task
        `Task: ${taskContext?.taskTitle}`,
        taskContext?.taskId,
        taskContext?.taskTitle,
      )

      console.log("ChatMessages: Resolving createConversation with:", result)

      if (result && result.conversationId) {
        console.log("ChatMessages: Conversation created successfully:", result.conversationId)

        // Add conversation to Redux store immediately with proper receiver info
        dispatch(
          addNewConversation({
            conversationId: result.conversationId,
            sender: result.sender || { id: currentUser?.id, name: currentUser?.name || "You" },
            receiver: receiverInfo, // Use the receiver info we found
            task: {
              id: taskContext?.taskId,
              title: taskContext?.taskTitle,
            },
          }),
        )

        console.log(`ChatMessages: Added new conversation to Redux: ${result.conversationId}`)

        // Select the conversation in Redux
        dispatch(selectConversation(result.conversationId))

        try {
          // Join the conversation first
          console.log("ChatMessages: Joining conversation:", result.conversationId)
          await joinConversation(result.conversationId)
          console.log("ChatMessages: Successfully joined conversation")

          // Small delay to ensure join is processed
          await new Promise((resolve) => setTimeout(resolve, 500))

          // Fetch messages to update the UI (will be empty initially)
          dispatch(fetchMessages({ conversationId: result.conversationId, userId: currentUserId }))

          showSuccessToast(`Ready to chat about task: ${taskContext?.taskTitle}`)
          setIsCreatingConversation(false)
        } catch (joinError) {
          console.error("ChatMessages: Error joining conversation:", joinError)
          showErrorToast("Created conversation but failed to join. Please try again.")
          setIsCreatingConversation(false)
        }
      } else {
        throw new Error("No conversation ID returned from auto-creation")
      }
    } catch (error) {
      console.error("ChatMessages: Error auto-creating task conversation:", error)
      showErrorToast("Failed to prepare task conversation. Please try again.")
      setIsCreatingConversation(false)
    }
  }

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()

    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    }

    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)

    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })}`
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleReaction = (messageId: number, emoji: string) => {
    setMessageReactions((prev) => {
      const messageReactions = prev[messageId] || {}
      const currentCount = messageReactions[emoji] || 0

      return {
        ...prev,
        [messageId]: {
          ...messageReactions,
          [emoji]: currentCount + 1,
        },
      }
    })

    setUserReactions((prev) => ({
      ...prev,
      [messageId]: emoji,
    }))

    setShowEmojiPicker(null)
  }

  const renderMessageStatus = (message: Message) => {
    const isCurrentUser = message.sender.id === currentUserId

    if (!isCurrentUser) return null

    return (
      <span className="ml-1 inline-flex items-center">
        {message.isRead ? <CheckCheck size={14} className="text-white" /> : <Check size={14} className="text-white" />}
      </span>
    )
  }

  const renderMessageActions = (message: Message) => {
    if (selectedMessage !== message.id) return null

    return (
      <div className="absolute -top-8 right-0 flex items-center space-x-1 bg-white dark:bg-gray-800 rounded-lg shadow-md p-1 border border-gray-200 dark:border-gray-700">
        <button
          className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
          onClick={() => setShowEmojiPicker(message.id)}
          aria-label="Add reaction"
        >
          <EmojiSmile size={16} />
        </button>
        <button
          className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
          onClick={() => {
            /* Reply to message */
          }}
          aria-label="Reply"
        >
          <Reply size={16} />
        </button>
        <button
          className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
          onClick={() => onPinMessage(message.id)}
          aria-label="Pin message"
        >
          <Pin size={16} />
        </button>
        <button
          className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
          onClick={() => {
            /* Forward message */
          }}
          aria-label="Forward"
        >
          <Forward size={16} />
        </button>
        <button
          className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
          onClick={() => {
            /* Copy message */
          }}
          aria-label="Copy"
        >
          <Copy size={16} />
        </button>
        <button
          className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"
          onClick={() => {
            /* Delete message */
          }}
          aria-label="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>
    )
  }

  const renderTaskBadge = (message: Message) => {
    if (!message.taskId && !message.taskTitle) return null

    return (
      <div className="task-badge bg-blue-600 dark:bg-blue-500 text-white px-3 py-1.5 rounded-t-lg text-xs font-medium flex items-center">
        <Briefcase size={14} className="mr-1.5" />
        <span>Task: {message.taskTitle || taskContext?.taskTitle || "Unknown Task"}</span>
        {message.taskId && <span className="text-xs ml-2 opacity-75">(#{message.taskId})</span>}
      </div>
    )
  }

  const renderMessage = (message: Message, isFirstInGroup: boolean) => {
    const isCurrentUser = message.sender.id === currentUserId
    const hasReplyTo = !!message.reply_to
    const hasAttachments = message.attachments && message.attachments.length > 0
    const hasTaskInfo = message.taskId || message.taskTitle
    const isTaskMessage = hasTaskInfo || (taskContext && message.taskId === taskContext.taskId)

    return (
      <div
        key={message.id}
        id={`message-${message.id}`}
        className={`group relative flex ${isCurrentUser ? "justify-end" : "justify-start"} ${isFirstInGroup ? "mt-4" : "mt-1"} px-4`}
        onMouseEnter={() => setSelectedMessage(message.id)}
        onMouseLeave={() => setSelectedMessage(null)}
      >
        <div
          className={`relative max-w-xs lg:max-w-md ${
            isCurrentUser
              ? isTaskMessage
                ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white"
                : "bg-gradient-to-br from-green-500 to-green-600 text-white"
              : isTaskMessage
                ? "bg-blue-50 dark:bg-blue-900/50 border-blue-200 dark:border-blue-700 text-gray-800 dark:text-gray-100"
                : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-600"
          } ${hasTaskInfo ? "rounded-b-lg" : "rounded-lg"} shadow-sm overflow-hidden`}
        >
          {renderMessageActions(message)}

          {showEmojiPicker === message.id && (
            <div
              ref={emojiPickerRef}
              className="absolute z-10 bottom-full mb-2"
              style={{ [isCurrentUser ? "right" : "left"]: 0 }}
            >
              <EmojiPicker
                onEmojiClick={(emojiData) => handleReaction(message.id, emojiData.emoji)}
                width={280}
                height={350}
              />
            </div>
          )}

          {renderTaskBadge(message)}

          {hasReplyTo && (
            <div
              className={`px-4 pt-3 pb-1 text-xs ${
                isCurrentUser ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
              } border-l-2 ${isCurrentUser ? "border-blue-300" : "border-gray-300 dark:border-gray-500"} ml-2 mt-2 mb-1`}
            >
              <p className="font-medium mb-0.5">{message.reply_to?.id === currentUserId ? "You" : "Reply to"}</p>
              <p className="truncate">{message.reply_to?.content || ""}</p>
            </div>
          )}

          {/* Attachments */}
          {hasAttachments && (
            <div className={`px-4 pt-3 ${message.content ? "pb-0" : "pb-3"}`}>
              {(message.attachments ?? []).map((attachment, index) => {
                if (attachment.type.startsWith("image/")) {
                  return (
                    <div key={index} className="mb-2 rounded-lg overflow-hidden">
                      <img
                        src={attachment.url || "/placeholder.svg"}
                        alt={attachment.name}
                        className="max-w-full h-auto max-h-60 object-contain"
                      />
                    </div>
                  )
                } else if (attachment.type.startsWith("video/")) {
                  return (
                    <div key={index} className="mb-2 rounded-lg overflow-hidden">
                      <video src={attachment.url} controls className="max-w-full h-auto max-h-60" />
                    </div>
                  )
                } else {
                  return (
                    <div key={index} className="mb-2 p-2 bg-gray-100 dark:bg-gray-600 rounded-lg flex items-center">
                      <div className="flex-1 truncate">
                        <p className="text-sm font-medium truncate">{attachment.name}</p>
                      </div>
                      <a
                        href={attachment.url}
                        download={attachment.name}
                        className="ml-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-500"
                      >
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
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="7 10 12 15 17 10"></polyline>
                          <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                      </a>
                    </div>
                  )
                }
              })}
            </div>
          )}

          {/* Message content */}
          {message.content && (
            <div className="px-4 py-3">
              <p>{message.content}</p>
            </div>
          )}

          {/* Message footer */}
          <div
            className={`px-4 pb-2 pt-1 flex items-center justify-between text-xs ${
              isCurrentUser ? "text-gray-100" : "text-gray-500 dark:text-gray-400"
            }`}
          >
            <span>{formatMessageDate(message.created_at)}</span>
            {renderMessageStatus(message)}
          </div>

          {/* Reactions */}
          {messageReactions[message.id] && Object.keys(messageReactions[message.id]).length > 0 && (
            <div
              className={`absolute ${isCurrentUser ? "left-0 -translate-x-1/2" : "right-0 translate-x-1/2"} bottom-0 flex -mb-2`}
            >
              <div className="bg-white dark:bg-gray-800 rounded-full shadow-md border border-gray-200 dark:border-gray-700 px-2 py-1 flex items-center space-x-1">
                {Object.entries(messageReactions[message.id]).map(([emoji, count]) => (
                  <div key={emoji} className="flex items-center">
                    <span>{emoji}</span>
                    {count > 1 && <span className="text-xs ml-1">{count}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Filter out duplicate messages by their unique ID
  const uniqueMessages = messages
    .flatMap((group) => group.messages)
    .reduce((acc, message) => {
      if (!acc.some((m) => m.id === message.id)) {
        acc.push(message)
      }
      return acc
    }, [] as Message[])

  // Group messages by date again after filtering duplicates
  const groupedMessages = uniqueMessages.reduce(
    (acc, message) => {
      const date = new Date(message.created_at).toLocaleDateString()
      const group = acc.find((g) => g.date === date)
      if (group) {
        group.messages.push(message)
      } else {
        acc.push({ date, messages: [message] })
      }
      return acc
    },
    [] as { date: string; messages: Message[] }[],
  )

  // Group messages by sender and task for consecutive messages
  const groupMessagesBySender = (messages: Message[]) => {
    return messages.reduce((groups, message, index, array) => {
      const prevMessage = array[index - 1]
      const senderChanged = !prevMessage || prevMessage.sender.id !== message.sender.id
      const taskChanged = prevMessage?.taskId !== message.taskId
      const timeGap =
        prevMessage &&
        new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() > 5 * 60 * 1000

      if (senderChanged || taskChanged || timeGap) {
        groups.push([message])
      } else {
        groups[groups.length - 1].push(message)
      }
      return groups
    }, [] as Message[][])
  }

  if (messagesLoading || isCreatingConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <Loader className="h-8 w-8 animate-spin text-gray-500 dark:text-gray-400 mb-2" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {isCreatingConversation ? "Creating conversation..." : "Loading messages..."}
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 p-4 overflow-y-auto">
      {/* Task context banner - only show at top if this is a dedicated task conversation */}
      {taskContext && (
        <div className="mb-6">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-700 mb-4">
            <div className="flex items-center">
              <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">{taskContext.taskTitle}</h3>
              <span className="ml-2 text-sm text-blue-700 dark:text-blue-300 bg-blue-200 dark:bg-blue-800 px-2 py-1 rounded">
                Task #{taskContext.taskId}
              </span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Conversation about this task with {taskContext.userName}
            </p>
            {taskContext.taskDescription && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 bg-blue-50 dark:bg-blue-800/50 p-2 rounded">
                {taskContext.taskDescription}
              </p>
            )}
          </div>
        </div>
      )}

      {groupedMessages.length > 0 ? (
        <div className="flex flex-col">
          {groupedMessages.map((group) => (
            <div key={group.date} className="mb-6">
              <div className="flex justify-center mb-4">
                <div className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-300">
                  {group.date}
                </div>
              </div>
              <div className="flex flex-col">
                {groupMessagesBySender(group.messages).map((messageGroup, groupIndex) => (
                  <div key={groupIndex} className="mb-3">
                    {messageGroup.map((message, msgIndex) => renderMessage(message, msgIndex === 0))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : !taskContext ? (
        <div className="flex flex-col items-center justify-center h-full text-center px-4">
          <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <MessageSquare className="h-10 w-10 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-1">No messages yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
            Start the conversation by sending your first message
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-center px-4">
          <div className="w-24 h-24 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mb-4">
            <Briefcase className="h-10 w-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-1">
            Ready to discuss: {taskContext.taskTitle}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
            Send your first message to start the conversation about this task
          </p>
        </div>
      )}

      {/* Typing indicator */}
      {Object.keys(typingUsers).length > 0 && (
        <div className="flex items-center mb-4 px-4">
          <div className="bg-white dark:bg-gray-700 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 text-sm shadow-sm border border-gray-200 dark:border-gray-600">
            <div className="flex items-center">
              <span className="mr-2">
                {Object.values(typingUsers)
                  .map((user: { userId: number; name: string }) => user.name)
                  .join(", ")}{" "}
                is typing
              </span>
              <span className="flex">
                <span
                  className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></span>
                <span
                  className="h-2 w-2 bg-gray-500 rounded-full animate-bounce mx-1"
                  style={{ animationDelay: "200ms" }}
                ></span>
                <span
                  className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "400ms" }}
                ></span>
              </span>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  )
}

export default ChatMessages

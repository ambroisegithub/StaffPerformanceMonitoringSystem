"use client"

import React from "react"
import { useState, useRef, useEffect } from "react"
import { Send, Paperclip, X, Loader, Smile, Mic, Briefcase } from "lucide-react"
import { sendTypingIndicator, sendStopTypingIndicator } from "../../services/socketService"
import { uploadAttachment } from "./chatSlice"
import { useAppDispatch, useAppSelector } from "../../Redux/hooks"
import { showErrorToast, showSuccessToast } from "../../utilis/ToastProps"
import EmojiPicker from "emoji-picker-react"

interface ChatInputProps {
  conversationId: string
  receiverId: number
  taskContext?: TaskChatContext | null
  onClearTaskContext?: () => void
}

interface TaskChatContext {
  taskId: number
  taskTitle: string
  userId: number
  userName: string
  taskDescription: string
  autoOpen: boolean
}

const ChatInput: React.FC<ChatInputProps> = ({ conversationId, receiverId, taskContext, onClearTaskContext }) => {
  const dispatch = useAppDispatch()
  const [message, setMessage] = useState("")
  const [attachments, setAttachments] = useState<{ type: string; url: string; name: string }[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  // Remove this line:
  // const [isCreatingConversation, setIsCreatingConversation] = useState(false)

  const { sendingMessage } = useAppSelector((state) => state.chat)
  const currentUser = useAppSelector((state) => state.login.user)
  const users = useAppSelector((state) => state.chat.users) || []

  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const emojiPickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
        if (conversationId) {
          sendStopTypingIndicator(conversationId, receiverId)
        }
      }
    }
  }, [conversationId, receiverId])

  useEffect(() => {
    // Close emoji picker when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSendMessage = async () => {
    if (message.trim() === "" && attachments.length === 0) return

    try {
      // Get task context for message metadata
      let currentTaskContext = taskContext
      if (!currentTaskContext) {
        const taskChatContextStr = localStorage.getItem("taskChatContext")
        if (taskChatContextStr) {
          try {
            currentTaskContext = JSON.parse(taskChatContextStr)
          } catch (error) {
            console.error("Error parsing task chat context:", error)
          }
        }
      }

      // Send message to existing conversation (conversation should already exist from auto-creation)
      if (conversationId) {
        const { sendMessage } = await import("../../services/socketService")

        // Use receiverId from props, or fallback to task context
        const targetReceiverId = receiverId || currentTaskContext?.userId

        if (!targetReceiverId) {
          showErrorToast("Receiver not found. Please try again.")
          return
        }

        console.log("Sending message payload:")

        await sendMessage(
          conversationId,
          targetReceiverId,
          message,
          attachments,
          currentTaskContext?.taskId || null,
          currentTaskContext?.taskTitle || null,
          currentTaskContext?.taskDescription || null,
        )

        // Reset input state
        setMessage("")
        setAttachments([])

        // Clear task context after first message is sent
        if (currentTaskContext) {
          localStorage.removeItem("taskChatContext")
          if (onClearTaskContext) {
            onClearTaskContext()
          }
          showSuccessToast(`Message sent for task: ${currentTaskContext.taskTitle}`)
        }
      } else {
        showErrorToast("No conversation available. Please wait for conversation to be created.")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      showErrorToast("Failed to send message. Please try again.")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleTyping = () => {
    if (!conversationId) return // Don't send typing indicator if no conversation

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    } else {
      sendTypingIndicator(conversationId, receiverId)
    }

    typingTimeoutRef.current = setTimeout(() => {
      sendStopTypingIndicator(conversationId, receiverId)
      typingTimeoutRef.current = null
    }, 3000)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    try {
      const newAttachments: any[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const result = await dispatch(uploadAttachment(file)).unwrap()
        newAttachments.push(result)
      }
      setAttachments((prev) => [...prev, ...newAttachments])
    } catch (error) {
      console.error("Error uploading file:", error)
      showErrorToast("Failed to upload file")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  const handleEmojiSelect = (emojiData: any) => {
    setMessage((prev) => prev + emojiData.emoji)
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  const startRecording = () => {
    setIsRecording(true)
    // Implement audio recording logic here
  }

  const stopRecording = () => {
    setIsRecording(false)
  }

  const renderAttachmentPreview = (attachment: { type: string; url: string; name: string }, index: number) => {
    if (attachment.type.startsWith("image/")) {
      return (
        <div className="relative group">
          <div className="h-16 w-16 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700">
            <img
              src={attachment.url || "/placeholder.svg"}
              alt={attachment.name}
              className="h-full w-full object-cover"
            />
          </div>
          <button
            className="absolute top-1 right-1 p-0.5 rounded-full bg-gray-800/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => removeAttachment(index)}
          >
            <X size={12} />
          </button>
        </div>
      )
    }

    if (attachment.type.startsWith("video/")) {
      return (
        <div className="relative group">
          <div className="h-16 w-16 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="23 7 16 12 23 17 23 7"></polygon>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
            </svg>
          </div>
          <button
            className="absolute top-1 right-1 p-0.5 rounded-full bg-gray-800/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => removeAttachment(index)}
          >
            <X size={12} />
          </button>
        </div>
      )
    }

    return (
      <div className="relative group">
        <div className="h-16 w-16 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
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
        </div>
        <button
          className="absolute top-1 right-1 p-0.5 rounded-full bg-gray-800/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => removeAttachment(index)}
        >
          <X size={12} />
        </button>
      </div>
    )
  }

  // Get current task context for display
  const currentTaskContext =
    taskContext ||
    (() => {
      const taskChatContextStr = localStorage.getItem("taskChatContext")
      if (taskChatContextStr) {
        try {
          return JSON.parse(taskChatContextStr) as TaskChatContext
        } catch (error) {
          return null
        }
      }
      return null
    })()

  // Update the isDisabled calculation:
  const isDisabled = isUploading || sendingMessage

  return (
    <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      {/* Task context indicator - only show if task context exists */}
      {currentTaskContext && (
        <div className="mb-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Briefcase size={14} className="mr-1.5 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                Discussing task: {currentTaskContext.taskTitle}
              </span>
              {currentTaskContext.taskId && (
                <span className="ml-2 text-xs text-blue-500 dark:text-blue-400">(#{currentTaskContext.taskId})</span>
              )}
            </div>
            <button
              className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              onClick={() => {
                localStorage.removeItem("taskChatContext")
                if (onClearTaskContext) {
                  onClearTaskContext()
                }
              }}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
          {attachments.map((attachment, index) => (
            <div key={index}>{renderAttachmentPreview(attachment, index)}</div>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="flex justify-center gap-2 items-center">
        <div className="flex space-x-1">
          <button
            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            onClick={() => fileInputRef.current?.click()}
            disabled={isDisabled}
            aria-label="Attach file"
          >
            <Paperclip size={20} />
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileUpload}
              multiple
              disabled={isDisabled}
            />
          </button>
          <button
            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            disabled={isDisabled}
            aria-label="Add emoji"
          >
            <Smile size={20} />
          </button>
          <button
            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onMouseLeave={isRecording ? stopRecording : undefined}
            disabled={isDisabled}
            aria-label="Record audio"
          >
            <Mic size={20} className={isRecording ? "text-red-500 animate-pulse" : ""} />
          </button>
        </div>

        <div className="relative flex-1">
          {showEmojiPicker && (
            <div ref={emojiPickerRef} className="absolute bottom-full mb-2 z-10">
              <EmojiPicker onEmojiClick={handleEmojiSelect} width={320} height={350} />
            </div>
          )}

          <textarea
            ref={textareaRef}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            // Update the textarea placeholder:
            placeholder={currentTaskContext ? `Message about ${currentTaskContext.taskTitle}...` : "Type a message..."}
            rows={1}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value)
              adjustTextareaHeight()
              handleTyping()
            }}
            onKeyDown={handleKeyPress}
            style={{ minHeight: "40px", maxHeight: "120px" }}
            disabled={isDisabled}
          />

          {isUploading && (
            <div className="absolute inset-0 bg-white/70 dark:bg-gray-800/70 flex items-center justify-center rounded-lg">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
            </div>
          )}
        </div>

        <button
          className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors"
          onClick={handleSendMessage}
          // Update the send button disabled condition:
          disabled={isDisabled || (message.trim() === "" && attachments.length === 0)}
          aria-label="Send message"
        >
          {/* Update the send button content: */}
          {sendingMessage ? <Loader size={20} className="animate-spin" /> : <Send size={20} />}
        </button>
      </div>
    </div>
  )
}

export default ChatInput

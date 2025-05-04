// @ts-nocheck
"use client"

import React from "react"
import { useEffect, useRef, useState } from "react"
import { useAppDispatch, useAppSelector } from "../../Redux/hooks"
import {
  fetchUsers,
  fetchConversations,
  fetchMessages,
  selectConversation,
  toggleChat,
  resetChat,
  pinMessage,
  archiveConversation,
} from "./chatSlice"
import { initializeSocket, disconnectSocket, joinConversation } from "../../services/socketService"
import ChatSidebar from "./ChatSidebar"
import ChatMessages from "./ChatMessages"
import ChatInput from "./ChatInput"
import ChatHeader from "./ChatHeader"
import MediaGallery from "./MediaGallery"
import SearchMessages from "./SearchMessages"
import { X, Minimize2, Maximize2, MessageSquare, Loader, Search, ImageIcon, Moon, Sun } from "lucide-react"
import { socket } from "../../services/socketService"
import { showErrorToast, showSuccessToast } from "../../utilis/ToastProps"

interface ChatProps {
  userId: number
  organizationId: number
}

interface TaskChatContext {
  taskId: number
  taskTitle: string
  userId: number
  userName: string
  taskDescription: string
  autoOpen: boolean
}

const Chat: React.FC<ChatProps> = ({ userId, organizationId }) => {
  const dispatch = useAppDispatch()
  const isOpen = useAppSelector((state) => state.chat?.isOpen) || false
  const selectedConversation = useAppSelector((state) => state.chat?.selectedConversation) || null
  const conversations = useAppSelector((state) => state.chat?.conversations) || []
  const users = useAppSelector((state) => state.chat?.users) || []
  const loading = useAppSelector((state) => state.chat?.loading) || false
  const messagesLoading = useAppSelector((state) => state.chat?.messagesLoading) || false
  const pinnedMessages = useAppSelector((state) => state.chat?.pinnedMessages) || []
  const archivedConversations = useAppSelector((state) => state.chat?.archivedConversations) || []
  const onlineUsers = useAppSelector((state) => state.chat.onlineUsers) || []
  const currentUser = useAppSelector((state) => state.login.user)

  const [taskChatContext, setTaskChatContext] = useState<TaskChatContext | null>(null)
  const [minimized, setMinimized] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("chatDarkMode") === "true"
    }
    return false
  })
  const [showGallery, setShowGallery] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [wallpaper, setWallpaper] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("chatWallpaper") || "default"
    }
    return "default"
  })
  const [fontSize, setFontSize] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("chatFontSize") || "medium"
    }
    return "medium"
  })

  const chatContainerRef = useRef<HTMLDivElement>(null)
  const selectedConversationData = conversations.find((c) => c.id === selectedConversation)

  // Enhanced task context handling - NO auto-join, only load context
  useEffect(() => {
    if (isOpen) {
      const taskChatContextStr = localStorage.getItem("taskChatContext")
      if (taskChatContextStr) {
        try {
          const context: TaskChatContext = JSON.parse(taskChatContextStr)
          setTaskChatContext(context)
          console.log("Task chat context loaded:", {
            taskId: context.taskId,
            taskTitle: context.taskTitle,
            userName: context.userName,
            autoOpen: context.autoOpen,
          })

          // Only check for existing conversations, don't create new ones
          if (conversations.length > 0 && context.autoOpen) {
            checkForExistingTaskConversation(context)
          }
        } catch (error) {
          console.error("Error parsing task chat context:", error)
          localStorage.removeItem("taskChatContext")
        }
      }
    }
  }, [isOpen, conversations.length, dispatch, userId])

  const checkForExistingTaskConversation = async (context: TaskChatContext) => {
    try {
      // Find existing conversations with this user
      const existingConversations = conversations.filter((c) => c.otherUser.id === context.userId)
      // Check for task-specific conversation
      const taskConversation = existingConversations.find((c) => c.task?.id === context.taskId)

      if (taskConversation) {
        // Select existing task-specific conversation
        console.log("Found existing task conversation:", taskConversation.id)
        dispatch(selectConversation(taskConversation.id))
        try {
          await joinConversation(taskConversation.id)
          dispatch(fetchMessages({ conversationId: taskConversation.id, userId }))
          showSuccessToast(`Opened chat for task: ${context.taskTitle}`)
        } catch (error) {
          console.error("Error joining existing conversation:", error)
        }
      } else {
        // Check for general conversation
        const generalConversation = existingConversations.find((c) => !c.task || c.task.id !== context.taskId)
        if (generalConversation) {
          console.log("Found existing general conversation:", generalConversation.id)
          dispatch(selectConversation(generalConversation.id))
          try {
            await joinConversation(generalConversation.id)
            dispatch(fetchMessages({ conversationId: generalConversation.id, userId }))
            showSuccessToast(`Opened chat with ${context.userName} for task: ${context.taskTitle}`)
          } catch (error) {
            console.error("Error joining general conversation:", error)
          }
        }
        // If no existing conversation found, do nothing - let user create it by sending first message
      }

      // Update context to prevent auto-checking again
      localStorage.setItem("taskChatContext", JSON.stringify({ ...context, autoOpen: false }))
    } catch (error) {
      console.error("Error checking for existing conversations:", error)
    }
  }

  // Clear task context callback
  const handleClearTaskContext = () => {
    setTaskChatContext(null)
    localStorage.removeItem("taskChatContext")
  }

  useEffect(() => {
    if (isOpen) {
      // Initialize socket connection
      if (!socket.connected) {
        initializeSocket(userId, organizationId)
        console.log("Initializing socket connection for chat")
        setTimeout(() => {
          if (socket.connected) {
            console.log("Socket connection established successfully")
          } else {
            console.warn("Socket connection not established after delay")
          }
        }, 1000)
      }

      // Fetch user data and conversations
      dispatch(fetchUsers(organizationId))
      dispatch(fetchConversations({ userId, organizationId }))

      return () => {
        disconnectSocket()
        dispatch(resetChat())
      }
    }
  }, [dispatch, userId, organizationId, isOpen])

  // Clean up task context when chat is closed
  useEffect(() => {
    return () => {
      const taskChatContextStr = localStorage.getItem("taskChatContext")
      if (taskChatContextStr) {
        try {
          const context = JSON.parse(taskChatContextStr)
          if (!context.autoOpen) {
            localStorage.removeItem("taskChatContext")
          }
        } catch (error) {
          localStorage.removeItem("taskChatContext")
        }
      }
    }
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      if (!socket.connected) {
        console.log("Socket not connected, initializing...")
        initializeSocket(userId, organizationId)
        const timer = setTimeout(() => {
          if (socket.connected) {
            console.log("Socket connected, joining conversation:", selectedConversation)
            joinConversation(selectedConversation)
              .then(() => {
                console.log("Successfully joined conversation, fetching messages")
                dispatch(fetchMessages({ conversationId: selectedConversation, userId }))
              })
              .catch((error) => {
                console.error("Error joining conversation:", error)
                showErrorToast("Failed to join conversation. Retrying...")
                setTimeout(() => {
                  console.log("Retrying join conversation...")
                  joinConversation(selectedConversation)
                    .then(() => {
                      dispatch(fetchMessages({ conversationId: selectedConversation, userId }))
                    })
                    .catch((retryError) => {
                      console.error("Error on retry:", retryError)
                      showErrorToast("Failed to join conversation. Please refresh the page.")
                    })
                }, 2000)
              })
          } else {
            console.error("Socket still not connected after delay")
            showErrorToast("Failed to connect to chat server. Please refresh the page.")
          }
        }, 1000)
        return () => clearTimeout(timer)
      } else {
        console.log("Socket already connected, joining conversation:", selectedConversation)
        joinConversation(selectedConversation)
          .then(() => {
            console.log("Successfully joined conversation, fetching messages")
            dispatch(fetchMessages({ conversationId: selectedConversation, userId }))
          })
          .catch((error) => {
            console.error("Error joining conversation:", error)
            showErrorToast("Failed to join conversation. Retrying...")
            setTimeout(() => {
              console.log("Retrying join conversation...")
              joinConversation(selectedConversation)
                .then(() => {
                  dispatch(fetchMessages({ conversationId: selectedConversation, userId }))
                })
                .catch((retryError) => {
                  console.error("Error on retry:", retryError)
                  showErrorToast("Failed to join conversation. Please refresh the page.")
                })
            }, 2000)
          })
      }
    }
  }, [dispatch, selectedConversation, userId, organizationId])

  useEffect(() => {
    localStorage.setItem("chatDarkMode", darkMode.toString())
    document.documentElement.classList.toggle("dark", darkMode)
  }, [darkMode])

  useEffect(() => {
    localStorage.setItem("chatWallpaper", wallpaper)
  }, [wallpaper])

  useEffect(() => {
    localStorage.setItem("chatFontSize", fontSize)
  }, [fontSize])

  const handleClose = () => {
    dispatch(toggleChat())
  }

  const handleMinimize = () => {
    setMinimized(!minimized)
  }

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev)
  }

  const getWallpaperStyle = () => {
    switch (wallpaper) {
      case "gradient-blue":
        return "bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800"
      case "gradient-green":
        return "bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900 dark:to-green-800"
      case "gradient-purple":
        return "bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800"
      case "solid-light":
        return "bg-gray-100 dark:bg-gray-800"
      case "solid-dark":
        return "bg-gray-200 dark:bg-gray-700"
      default:
        return "bg-white dark:bg-gray-800"
    }
  }

  const getFontSizeClass = () => {
    switch (fontSize) {
      case "small":
        return "text-sm"
      case "large":
        return "text-lg"
      default:
        return "text-base"
    }
  }

  const toggleShowSearch = () => {
    setShowSearch(!showSearch)
  }

  const toggleShowGallery = () => {
    setShowGallery(!showGallery)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300">
      <div
        ref={chatContainerRef}
        className={`relative flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden ${
          minimized ? "w-80 h-16" : "w-[95%] h-[90%] md:w-[85%] md:h-[85%] lg:w-[75%] lg:h-[80%]"
        } ${getFontSizeClass()}`}
        style={{ transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }}
      >
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          {selectedConversation || taskChatContext ? (
            <ChatHeader
              conversation={selectedConversationData}
              onlineUsers={onlineUsers}
              currentUserId={userId}
              taskContext={taskChatContext}
            />
          ) : (
            <div className="flex items-center">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white truncate">Messages</h3>
            </div>
          )}

          <div className="flex items-center space-x-2">
            {!minimized && (
              <>
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                  aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                {selectedConversation && (
                  <>
                    <button
                      onClick={toggleShowSearch}
                      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                      aria-label="Search messages"
                    >
                      <Search size={18} />
                    </button>
                    <button
                      onClick={toggleShowGallery}
                      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                      aria-label="Media gallery"
                    >
                      <ImageIcon size={18} />
                    </button>
                  </>
                )}
              </>
            )}
            <button
              onClick={handleMinimize}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
              aria-label={minimized ? "Maximize chat" : "Minimize chat"}
            >
              {minimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
            </button>
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {!minimized && (
          <div className="flex flex-1 overflow-hidden">
            <ChatSidebar
              conversations={conversations}
              archivedConversations={archivedConversations}
              users={users}
              selectedConversation={selectedConversation}
              onSelectConversation={(conversationId) => {
                dispatch(selectConversation(conversationId))
                dispatch(fetchMessages({ conversationId, userId }))
              }}
              currentUserId={userId}
              onArchiveConversation={(conversationId) => {
                dispatch(archiveConversation(conversationId))
              }}
              taskContext={taskChatContext}
            />

            {/* Main Chat Area */}
            <div className={`flex-1 flex flex-col ${getWallpaperStyle()}`}>
              {loading && !selectedConversation ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6">
                  <Loader className="h-8 w-8 animate-spin text-gray-500 dark:text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Loading conversations...</p>
                </div>
              ) : selectedConversation ? (
                <>
                  {showSearch && <SearchMessages conversationId={selectedConversation} onClose={toggleShowSearch} />}
                  {showGallery && <MediaGallery conversationId={selectedConversation} onClose={toggleShowGallery} />}
                  {pinnedMessages.length > 0 && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/30 p-2 border-b border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-yellow-800 dark:text-yellow-200">
                          Pinned Messages
                        </span>
                        <button
                          className="text-xs text-yellow-600 dark:text-yellow-400 hover:underline"
                          onClick={() => {
                            /* Toggle pinned messages view */
                          }}
                        >
                          View All
                        </button>
                      </div>
                    </div>
                  )}
                  <ChatMessages
                    conversationId={selectedConversation}
                    currentUserId={userId}
                    onPinMessage={(messageId) => dispatch(pinMessage(messageId))}
                    taskContext={taskChatContext}
                  />
                  <ChatInput
                    conversationId={selectedConversation}
                    receiverId={selectedConversationData?.otherUser.id || 0}
                    taskContext={taskChatContext}
                    onClearTaskContext={handleClearTaskContext}
                  />
                </>
              ) : taskChatContext ? (
                // When task context exists but no conversation selected, show minimal interface
                <div className="flex-1 flex flex-col">
                  <ChatMessages
                    conversationId=""
                    currentUserId={userId}
                    onPinMessage={(messageId) => dispatch(pinMessage(messageId))}
                    taskContext={taskChatContext}
                    // Pass additional props for auto-conversation creation
                    users={users}
                    dispatch={dispatch}
                    currentUser={currentUser}
                  />
                  <ChatInput
                    conversationId=""
                    receiverId={taskChatContext.userId}
                    taskContext={taskChatContext}
                    onClearTaskContext={handleClearTaskContext}
                  />
                </div>
              ) : (
                // Default empty state when no task context and no conversation
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <MessageSquare className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-1">
                    No conversation selected
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                    Select a conversation from the sidebar or start a new chat
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Chat

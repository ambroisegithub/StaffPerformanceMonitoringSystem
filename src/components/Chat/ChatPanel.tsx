"use client"

import React, { useMemo } from "react"
import { useState, useEffect, useRef } from "react"
import { useAppDispatch, useAppSelector } from "../../Redux/hooks"
import {
  fetchConversation,
  fetchConversationMessages,
  sendMessage,
  joinConversation,
  uploadAttachment,
  sendTypingIndicator,
  sendStopTypingIndicator,
  selectConversations,
  selectChatMessages,
  selectMessageLoading,
  selectTypingUsers,
  selectActiveUsers,
  fetchNewMessages,
  fetchDailyTaskMessages,
  ChatMessage,
} from "./ChatSlice"
import { format } from "date-fns"
import { Paperclip, Send, Smile, FileText, Film, X, MoreVertical, Calendar } from "lucide-react"
import { Button } from "../ui/button"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import EmojiPicker from "emoji-picker-react"

interface ChatPanelProps {
  userId: number
  organizationId: number
  conversationId: string | null
}

const ChatPanel: React.FC<ChatPanelProps> = ({ userId, organizationId, conversationId }) => {
  const dispatch = useAppDispatch()
  const conversations = useAppSelector(selectConversations)
  const messages = useAppSelector(selectChatMessages) as unknown as Record<string, ChatMessage[]> // Ensure messages is a record of arrays
  const loading = useAppSelector(selectMessageLoading)
  const typingUsers = useAppSelector(selectTypingUsers)
  const activeUsers = useAppSelector(selectActiveUsers)
  const [messageInput, setMessageInput] = useState("")
  const [attachments, setAttachments] = useState<{ type: string; url: string; name: string }[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const emojiPickerRef = useRef<HTMLDivElement>(null)
  const messagePollingRef = useRef<NodeJS.Timeout | null>(null)
  const lastMessageIdRef = useRef<number | null>(null)
  const conversation = conversations.find((conv) => conv.id === conversationId) || null

  // Join conversation when it changes
  useEffect(() => {
    if (conversationId) {
      dispatch(joinConversation({ conversationId }))
      dispatch(fetchConversation({ conversationId, userId }))

      // Fetch messages grouped by day
      dispatch(fetchConversationMessages({ conversationId, userId }))

      // Store the last message ID for polling
      if (Object.keys(messages).length > 0) {
        const lastDayMessages = messages[Object.keys(messages)[0]]
        if (lastDayMessages && lastDayMessages.length > 0) {
          lastMessageIdRef.current = lastDayMessages[lastDayMessages.length - 1].id
        }
      }

      // Set up polling for new messages
      if (messagePollingRef.current) {
        clearInterval(messagePollingRef.current)
      }

      messagePollingRef.current = setInterval(() => {
        if (lastMessageIdRef.current) {
          dispatch(
            fetchNewMessages({
              conversationId,
              userId,
              lastMessageId: lastMessageIdRef.current,
            }),
          )
        }
      }, 10000) // Poll every 10 seconds
    }

    return () => {
      if (messagePollingRef.current) {
        clearInterval(messagePollingRef.current)
      }
    }
  }, [dispatch, conversationId, userId, messages])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()

    // Update lastMessageId when messages change
    if (Object.keys(messages).length > 0) {
      const lastDayMessages = messages[Object.keys(messages)[0]]
      if (lastDayMessages && lastDayMessages.length > 0) {
        lastMessageIdRef.current = lastDayMessages[lastDayMessages.length - 1].id
      }
    }
  }, [messages])

  // Handle typing indicator
  useEffect(() => {
    if (messageInput && conversationId && conversation) {
      dispatch(
        sendTypingIndicator({
          conversationId,
          receiverId: conversation.otherUser.id,
        }),
      )

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      // Set new timeout to stop typing indicator after 3 seconds
      typingTimeoutRef.current = setTimeout(() => {
        dispatch(
          sendStopTypingIndicator({
            conversationId,
            receiverId: conversation.otherUser.id,
          }),
        )
      }, 3000)
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [messageInput, conversationId, conversation, dispatch])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false)
      }
    }

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showEmojiPicker])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    if (!conversationId || (!messageInput.trim() && attachments.length === 0)) return

    setIsSending(true) // Start loading indicator
    try {
      await dispatch(
        sendMessage({
          conversationId,
          receiverId: conversation?.otherUser.id || 0,
          content: messageInput.trim(),
          dailyTaskId: conversation?.dailyTask?.id,
          attachments,
        }),
      ).unwrap()

      setMessageInput("")
      setAttachments([])
      setShowEmojiPicker(false)
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setIsSending(false) // Stop loading indicator
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const result = await dispatch(uploadAttachment({ file, userId })).unwrap()

        if (result.success) {
          setAttachments((prev) => [...prev, result.data])
        }
      }
    } catch (error) {
      console.error("Failed to upload file:", error)
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

  const handleEmojiClick = (emojiData: any) => {
    setMessageInput((prev) => prev + emojiData.emoji)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  // Check if the other user is typing
  const isOtherUserTyping = conversation && typingUsers[conversation.otherUser.id] !== undefined

  if (!conversationId || !conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h3 className="text-xl font-medium text-gray-700 mb-2">No conversation selected</h3>
          <p className="text-gray-500">Select a contact from the sidebar to start chatting</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="relative mr-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>{getInitials(conversation.otherUser.name)}</AvatarFallback>
            </Avatar>
            {activeUsers.includes(conversation.otherUser.id) && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green border-2 border-white rounded-full"></span>
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{conversation.otherUser.name}</h3>
            <div className="text-sm text-gray-500">
              {activeUsers.includes(conversation.otherUser.id) ? (
                <span className="text-green-600">Online</span>
              ) : (
                <span>Offline</span>
              )}
              {isOtherUserTyping && <span className="ml-2 italic">typing...</span>}
            </div>
          </div>
        </div>

        {/* Daily Task Info Badge */}
        {conversation.dailyTask && (
          <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm flex items-center mr-2">
            <Calendar className="h-4 w-4 mr-1.5" />
            <span>Daily Task: {conversation.dailyTask.taskName || `#${conversation.dailyTask.id}`}</span>
          </div>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View Profile</DropdownMenuItem>
            <DropdownMenuItem>Search in Conversation</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Block User</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : Object.keys(messages).length > 0 ? (
          Object.entries(messages)
            .sort(([a], [b]) => {
              // Ensure "Today" is at the bottom, followed by "Yesterday" and "Older"
              const order = { Today: 3, Yesterday: 2, Older: 1 }
              return (order[a as keyof typeof order] || 0) - (order[b as keyof typeof order] || 0)
            })
            .map(([day, dayMessages]) => (
              <div key={day} className="space-y-4">
                <div className="flex justify-center">
                  <div className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">{day}</div>
                </div>

                {dayMessages.map((message:any) => {
                  const isSentByMe = message.sender.id === userId

                  return (
                    <div key={message.id} className={`flex ${isSentByMe ? "justify-end" : "justify-start"}`}>
                      <div className="flex max-w-[80%]">
                        {!isSentByMe && (
                          <Avatar className="h-8 w-8 mr-2 mt-1">
                            <AvatarFallback>{getInitials(message.sender.name)}</AvatarFallback>
                          </Avatar>
                        )}

                        <div>
                          <div
                            className={`rounded-lg p-3 ${
                              isSentByMe
                                ? "bg-blue text-white rounded-tr-none"
                                : "bg-white text-gray-800 rounded-tl-none shadow-sm"
                            }`}
                          >
                            {/* Daily Task Reference */}
                            {message.dailyTask && !isSentByMe && (
                              <div className="mb-1 text-xs font-medium text-blue-500 flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                <span>Re: Daily Task {message.dailyTask.taskName || `#${message.dailyTask.id}`}</span>
                              </div>
                            )}

                            <p className="whitespace-pre-wrap">{message.content}</p>

                            {message.attachments && message.attachments.length > 0 && (
                              <div className="mt-2 space-y-2">
                                {message.attachments.map((attachment:any, index:any) => (
                                  <div key={index} className="rounded overflow-hidden">
                                    {attachment.type === "image" ? (
                                      <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                                        <img
                                          src={attachment.url || "/placeholder.svg"}
                                          alt={attachment.name}
                                          className="max-w-full h-auto max-h-60 rounded"
                                        />
                                      </a>
                                    ) : attachment.type === "video" ? (
                                      <video
                                        src={attachment.url}
                                        controls
                                        className="max-w-full h-auto max-h-60 rounded"
                                      />
                                    ) : (
                                      <a
                                        href={attachment.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex items-center p-2 rounded ${
                                          isSentByMe ? "bg-blue" : "bg-gray-100"
                                        }`}
                                      >
                                        <FileText
                                          className={`h-5 w-5 mr-2 ${isSentByMe ? "text-blue-200" : "text-gray-500"}`}
                                        />
                                        <span className="truncate text-sm">{attachment.name}</span>
                                      </a>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className={`text-xs text-gray-500 mt-1 ${isSentByMe ? "text-right" : "text-left"}`}>
                            {format(new Date(message.created_at), "h:mm a")}
                            {isSentByMe && <span className="ml-1">{message.isRead ? "✓✓" : "✓"}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="bg-gray-100 p-6 rounded-full mb-4">
              <Send className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">No messages yet</h3>
            <p className="text-gray-500 max-w-md">
              Send a message to start the conversation with {conversation.otherUser.name}
              {conversation.dailyTask && (
                <span className="block mt-2">
                  This conversation is about Daily Task:{" "}
                  {conversation.dailyTask.taskName || `#${conversation.dailyTask.id}`}
                </span>
              )}
            </p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="bg-white border-t border-gray-200 p-3 flex flex-wrap gap-2">
          {attachments.map((attachment, index) => (
            <div key={index} className="relative group">
              <div className="w-20 h-20 border rounded-md overflow-hidden flex items-center justify-center bg-gray-50">
                {attachment.type === "image" ? (
                  <img
                    src={attachment.url || "/placeholder.svg"}
                    alt={attachment.name}
                    className="object-cover w-full h-full"
                  />
                ) : attachment.type === "video" ? (
                  <div className="relative w-full h-full">
                    <Film className="absolute inset-0 m-auto h-8 w-8 text-gray-400" />
                  </div>
                ) : (
                  <FileText className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <button
                className="absolute -top-2 -right-2 bg-red text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeAttachment(index)}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="relative">
          <textarea
            className="w-full border rounded-lg px-4 py-3 pr-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Type a message..."
            rows={2}
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={handleKeyPress}
          />

          <div className="absolute bottom-3 right-3 flex items-center space-x-2">
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" multiple />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <div className="animate-spin h-4 w-4 border-2 border-gray-500 rounded-full border-t-transparent" />
                    ) : (
                      <Paperclip className="h-5 w-5 text-gray-500" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Attach files</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="relative">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                      <Smile className="h-5 w-5 text-gray-500" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add emoji</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {showEmojiPicker && (
                <div
                  ref={emojiPickerRef}
                  className="absolute bottom-10 right-0 z-10 bg-gray-100 shadow-lg rounded-lg p-2"
                >
                  <div className="flex justify-end">
                    <button className="text-black hover:text-gray-700" onClick={() => setShowEmojiPicker(false)}>
                      <X className="h-5" />
                    </button>
                  </div>
                  <EmojiPicker onEmojiClick={handleEmojiClick} />
                </div>
              )}
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    className="h-8 w-8 rounded-full bg-blue hover:bg-blue-700"
                    onClick={handleSendMessage}
                    disabled={(!messageInput.trim() && attachments.length === 0) || isUploading || isSending}
                  >
                    {isSending ? (
                      <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent" />
                    ) : (
                      <Send className="h-4 w-4 text-white" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isSending ? "Sending..." : "Send message"}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatPanel

import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "../../Redux/store"
import axios from "axios"
import { io, type Socket } from "socket.io-client"

export interface ChatMessage {
  id: number
  content: string
  sender: {
    id: number
    name: string
  }
  receiver: {
    id: number
    name: string
  }
  attachments: {
    type: string
    url: string
    name: string
  }[]
  isRead: boolean
  created_at: string
  dailyTask?: {
    id: number
    taskName: string
    userId: number
    userName: string
    submissionDate: string
  }
}

export interface Conversation {
  id: string
  title: string
  otherUser: {
    id: number
    name: string
    email: string
  }
  task?: {
    id: number
    title: string
    description?: string
  }
  dailyTask?: {
    id: number
    taskName: string
    userId: number
    userName: string
    submissionDate: string
  }
  unreadCount: number
  lastMessage?: {
    content: string
    sender: number
    created_at: string
  }
  created_at: string
}

export interface Helper {
  id: number
  name: string
  role: string
  level: string
  team?: string
}

interface ChatState {
  socket: Socket | null
  connected: boolean
  conversations: Conversation[]
  currentConversation: Conversation | null
  messages: ChatMessage[]
  messageCache: Record<
    string,
    {
      messages: ChatMessage[]
      lastUpdated: number
    }
  >
  helpers: Helper[]
  loading: boolean
  messageLoading: boolean
  error: string | null
  typingUsers: Record<number, string>
  activeUsers: number[]
}

// Initial state
const initialState: ChatState = {
  socket: null,
  connected: false,
  conversations: [],
  currentConversation: null,
  messages: [],
  // Initialize empty message cache
  messageCache: {},
  helpers: [],
  loading: false,
  messageLoading: false,
  error: null,
  typingUsers: {},
  activeUsers: [],
}

// Cache configuration
const CACHE_EXPIRATION_TIME = 5 * 60 * 1000 // 5 minutes in milliseconds

// Helper function to load messages from cache
const loadMessagesFromCache = (conversationId: string): ChatMessage[] | null => {
  try {
    const cachedData = localStorage.getItem(`chat_messages_${conversationId}`)
    if (cachedData) {
      const { messages, timestamp } = JSON.parse(cachedData)
      // Check if cache is still valid
      if (Date.now() - timestamp < CACHE_EXPIRATION_TIME) {
        return messages
      }
    }
    return null
  } catch (error) {
    console.error("Error loading messages from cache:", error)
    return null
  }
}

// Helper function to save messages to cache
const saveMessagesToCache = (conversationId: string, messages: ChatMessage[]) => {
  try {
    const cacheData = {
      messages,
      timestamp: Date.now(),
    }
    localStorage.setItem(`chat_messages_${conversationId}`, JSON.stringify(cacheData))
  } catch (error) {
    console.error("Error saving messages to cache:", error)
  }
}

// Connect to socket
export const connectSocket = createAsyncThunk(
  "chat/connectSocket",
  async ({ userId, organizationId }: { userId: number; organizationId: number }, { dispatch }) => {
    try {
      const socketUrl = import.meta.env.VITE_SOCKET_URL || "https://staffmonitoringsystembackend.onrender.com"
      const socket = io(socketUrl, {
        transports: ["websocket", "polling"],
        path: "/socket.io/",
      })

      socket.on("connect", () => {
        console.log("Socket connected")
        socket.emit("authenticate", { userId, organizationId })
      })

      socket.on("authenticated", (data) => {
        console.log("Socket authenticated", data)
        if (data.success) {
          dispatch(setConnected(true))
        }
      })

      socket.on("new_message", (message) => {
        dispatch(addMessage(message))
      })

      socket.on("user_typing", (data) => {
        dispatch(setTypingUser({ userId: data.userId, name: data.name }))

        // Clear typing indicator after 3 seconds
        setTimeout(() => {
          dispatch(clearTypingUser(data.userId))
        }, 3000)
      })

      socket.on("user_stop_typing", (data) => {
        dispatch(clearTypingUser(data.userId))
      })

      socket.on("user_online", (data) => {
        dispatch(addActiveUser(data.userId)) // Ensure the user is added to the activeUsers array
      })

      socket.on("user_offline", (data) => {
        dispatch(removeActiveUser(data.userId)) // Ensure the user is removed from the activeUsers array
      })

      socket.on("new_conversation", (conversation) => {
        dispatch(fetchConversations({ organizationId, userId }))
      })

      socket.on("disconnect", () => {
        dispatch(setConnected(false))
      })

      return socket
    } catch (error) {
      console.error("Socket connection error:", error)
      throw error
    }
  },
)

// Fetch conversations
export const fetchConversations = createAsyncThunk(
  "chat/fetchConversations",
  async ({ organizationId, userId }: { organizationId: number; userId?: number }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { login: { user: { id: number } } }
      const resolvedUserId = userId || state.login.user.id

      const token = localStorage.getItem("token")
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/v1/chat/${organizationId}/user/${resolvedUserId}/conversations`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      // Ensure the response data is formatted as an array
      if (response.data && Array.isArray(response.data.data)) {
        return response.data
      } else {
        throw new Error("Invalid response format")
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch conversations")
    }
  },
)

// Fetch conversation details
export const fetchConversation = createAsyncThunk(
  "chat/fetchConversation",
  async ({ conversationId, userId }: { conversationId: string; userId?: number }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { login: { user: { id: number } } }
      const resolvedUserId = userId || state.login.user.id

      const token = localStorage.getItem("token")
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/v1/chat/conversation/${conversationId}/${resolvedUserId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch conversation")
    }
  },
)

// Fetch conversation messages
export const fetchConversationMessages = createAsyncThunk(
  "chat/fetchConversationMessages",
  async (
    {
      conversationId,
      userId,
      page = 1,
      limit = 50,
      forceRefresh = false,
    }: { conversationId: string; userId?: number; page?: number; limit?: number; forceRefresh?: boolean },
    { rejectWithValue, getState, dispatch },
  ) => {
    try {
      // Check if we have cached messages and forceRefresh is false
      if (!forceRefresh) {
        const state = getState() as RootState

        // First check Redux state cache
        const cachedData = state.chat.messageCache[conversationId]
        if (cachedData && Date.now() - cachedData.lastUpdated < CACHE_EXPIRATION_TIME) {
          // Return cached messages from Redux state without API call
          return { data: cachedData.messages, fromCache: true }
        }

        // If not in Redux, check localStorage
        const localStorageMessages = loadMessagesFromCache(conversationId)
        if (localStorageMessages) {
          // Store in Redux and return without API call
          dispatch(
            setCachedMessages({
              conversationId,
              messages: localStorageMessages,
              lastUpdated: Date.now(),
            }),
          )
          return { data: localStorageMessages, fromCache: true }
        }
      }

      // If we get here, we need to fetch from the API
      const state = getState() as { login: { user: { id: number } } }
      const resolvedUserId = userId || state.login.user.id

      const token = localStorage.getItem("token")
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/v1/chat/conversation/${conversationId}/${resolvedUserId}/messages?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      // Save to localStorage
      saveMessagesToCache(conversationId, response.data.data)

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch conversation messages")
    }
  },
)

export const fetchNewMessages = createAsyncThunk(
  "chat/fetchNewMessages",
  async (
    {
      conversationId,
      userId,
      lastMessageId,
    }: {
      conversationId: string
      userId?: number
      lastMessageId: number
    },
    { rejectWithValue, getState },
  ) => {
    try {
      const state = getState() as { login: { user: { id: number } } }
      const resolvedUserId = userId || state.login.user.id

      const token = localStorage.getItem("token")
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/v1/chat/conversation/${conversationId}/${resolvedUserId}/messages/new?lastMessageId=${lastMessageId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch new messages")
    }
  },
)

// Fetch daily task messages
export const fetchDailyTaskMessages = createAsyncThunk(
  "chat/fetchDailyTaskMessages",
  async (
    {
      dailyTaskId,
      userId,
    }: {
      dailyTaskId: number
      userId?: number
    },
    { rejectWithValue, getState },
  ) => {
    try {
      const state = getState() as { login: { user: { id: number } } }
      const resolvedUserId = userId || state.login.user.id

      const token = localStorage.getItem("token")
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/v1/chat/daily-task/${dailyTaskId}/${resolvedUserId}/messages`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch daily task messages")
    }
  },
)

// Fetch available helpers
export const fetchAvailableHelpers = createAsyncThunk(
  "chat/fetchAvailableHelpers",
  async ({ organizationId, userId }: { organizationId: number; userId?: number }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { login: { user: { id: number } } }
      const resolvedUserId = userId || state.login.user.id

      const token = localStorage.getItem("token")
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/v1/chat/${organizationId}/user/${resolvedUserId}/helpers`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch available helpers")
    }
  },
)

// Create conversation
export const createConversation = createAsyncThunk(
  "chat/createConversation",
  async (
    {
      senderId,
      receiverId,
      taskId,
      dailyTaskId,
      title,
      initialMessage,
    }: {
      senderId: number
      receiverId: number
      taskId?: number
      dailyTaskId?: number
      title?: string
      initialMessage?: string
    },
    { rejectWithValue },
  ) => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/v1/chat/conversation`,
        {
          senderId,
          receiverId,
          taskId,
          dailyTaskId,
          title,
          initialMessage,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create conversation")
    }
  },
)

// Send message
export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async (
    {
      conversationId,
      receiverId,
      content,
      dailyTaskId,
      attachments,
    }: {
      conversationId: string
      receiverId: number
      content: string
      dailyTaskId?: number
      attachments?: { type: string; url: string; name: string }[]
    },
    { getState, rejectWithValue },
  ) => {
    try {
      const state = getState() as RootState
      const socket = state.chat.socket

      if (!socket) {
        throw new Error("Socket not connected")
      }

      return new Promise((resolve, reject) => {
        socket.emit(
          "send_message",
          {
            conversationId,
            receiverId,
            content,
            dailyTaskId,
            attachments,
          },
          (response: any) => {
            if (response.success) {
              resolve(response)
            } else {
              reject(response.error)
            }
          },
        )
      })
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to send message")
    }
  },
)

// Join conversation
export const joinConversation = createAsyncThunk(
  "chat/joinConversation",
  async ({ conversationId }: { conversationId: string }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState
      const socket = state.chat.socket

      if (!socket) {
        throw new Error("Socket not connected")
      }

      return new Promise((resolve, reject) => {
        socket.emit("join_conversation", conversationId, (response: any) => {
          if (response.success) {
            resolve(response)
          } else {
            reject(response.error)
          }
        })
      })
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to join conversation")
    }
  },
)

// Upload attachment
export const uploadAttachment = createAsyncThunk(
  "chat/uploadAttachment",
  async ({ file, userId }: { file: File; userId?: number }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { login: { user: { id: number } } }
      const resolvedUserId = userId || state.login.user.id

      const token = localStorage.getItem("token")
      const formData = new FormData()
      formData.append("file", file)

      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/v1/chat/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to upload attachment")
    }
  },
)

// Send typing indicator
export const sendTypingIndicator = createAsyncThunk(
  "chat/sendTypingIndicator",
  async ({ conversationId, receiverId }: { conversationId: string; receiverId: number }, { getState }) => {
    const state = getState() as RootState
    const socket = state.chat.socket

    if (socket) {
      socket.emit("typing", { conversationId, receiverId })
    }
  },
)

// Send stop typing indicator
export const sendStopTypingIndicator = createAsyncThunk(
  "chat/sendStopTypingIndicator",
  async ({ conversationId, receiverId }: { conversationId: string; receiverId: number }, { getState }) => {
    const state = getState() as RootState
    const socket = state.chat.socket

    if (socket) {
      socket.emit("stop_typing", { conversationId, receiverId })
    }
  },
)

// Clear message cache
export const clearMessageCache = createAsyncThunk("chat/clearMessageCache", async (conversationId?: string) => {
  if (conversationId) {
    localStorage.removeItem(`chat_messages_${conversationId}`)
  } else {
    // Clear all message caches
    const keys = Object.keys(localStorage)
    keys.forEach((key) => {
      if (key.startsWith("chat_messages_")) {
        localStorage.removeItem(key)
      }
    })
  }
  return conversationId
})

// Disconnect socket
export const disconnectSocket = createAsyncThunk("chat/disconnectSocket", async (_, { getState }) => {
  const state = getState() as RootState
  const socket = state.chat.socket

  if (socket) {
    socket.disconnect()
  }
})

// Chat slice
const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.connected = action.payload
    },
    setCurrentConversation: (state, action: PayloadAction<Conversation | null>) => {
      state.currentConversation = action.payload
    },
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      // Add message to the current messages list if it's for the current conversation
      if (state.currentConversation && action.payload.id) {
        state.messages.push(action.payload)

        // Also update the message in cache
        if (state.currentConversation.id) {
          const conversationId = state.currentConversation.id

          if (state.messageCache[conversationId]) {
            state.messageCache[conversationId] = {
              messages: [...state.messageCache[conversationId].messages, action.payload],
              lastUpdated: Date.now(),
            }

            // Update localStorage cache
            try {
              const cachedData = localStorage.getItem(`chat_messages_${conversationId}`)
              if (cachedData) {
                const { messages } = JSON.parse(cachedData)
                saveMessagesToCache(conversationId, [...messages, action.payload])
              }
            } catch (error) {
              console.error("Error updating message cache:", error)
            }
          }
        }
      }

      // Update unread count in conversations list
      state.conversations = state.conversations.map((conversation) => {
        if (conversation.id === state.currentConversation?.id) {
          return {
            ...conversation,
            lastMessage: {
              content: action.payload.content,
              sender: action.payload.sender.id,
              created_at: action.payload.created_at,
            },
          }
        }
        return conversation
      })
    },
    setCachedMessages: (
      state,
      action: PayloadAction<{ conversationId: string; messages: ChatMessage[]; lastUpdated: number }>,
    ) => {
      const { conversationId, messages, lastUpdated } = action.payload
      state.messageCache[conversationId] = { messages, lastUpdated }
    },
    setTypingUser: (state, action: PayloadAction<{ userId: number; name: string }>) => {
      state.typingUsers[action.payload.userId] = action.payload.name
    },
    clearTypingUser: (state, action: PayloadAction<number>) => {
      delete state.typingUsers[action.payload]
    },
    addActiveUser: (state, action: PayloadAction<number>) => {
      if (!state.activeUsers.includes(action.payload)) {
        state.activeUsers.push(action.payload) // Add user only if not already present
      }
    },
    removeActiveUser: (state, action: PayloadAction<number>) => {
      state.activeUsers = state.activeUsers.filter((id) => id !== action.payload) // Remove user from the array
    },
    clearSocket: (state) => {
      if (state.socket) {
        state.socket.disconnect()
      }
      state.socket = null
      state.connected = false
    },
    clearCache: (state, action: PayloadAction<string | undefined>) => {
      if (action.payload) {
        // Clear specific conversation cache
        delete state.messageCache[action.payload]
      } else {
        // Clear all cache
        state.messageCache = {}
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // connectSocket
      .addCase(connectSocket.fulfilled, (state, action) => {
        state.socket = action.payload as any
      })

      // fetchConversations
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false
        state.conversations = action.payload.data // Ensure conversations are correctly set
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // fetchConversation
      .addCase(fetchConversation.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchConversation.fulfilled, (state, action) => {
        state.loading = false
        state.currentConversation = action.payload.data
      })
      .addCase(fetchConversation.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // fetchConversationMessages
      .addCase(fetchConversationMessages.pending, (state) => {
        state.messageLoading = true
        state.error = null
      })
      .addCase(fetchConversationMessages.fulfilled, (state, action) => {
        state.messageLoading = false

        // Check if data came from cache to avoid unnecessary updates
        if (!action.payload.fromCache) {
          const messages = action.payload.data
          state.messages = messages

          // Store in message cache if we have a current conversation
          if (state.currentConversation?.id) {
            state.messageCache[state.currentConversation.id] = {
              messages,
              lastUpdated: Date.now(),
            }
          }
        } else {
          // If from cache, just set the messages
          state.messages = action.payload.data
        }
      })
      .addCase(fetchConversationMessages.rejected, (state, action) => {
        state.messageLoading = false
        state.error = action.payload as string
      })

      // fetchNewMessages
      .addCase(fetchNewMessages.fulfilled, (state, action) => {
        const newMessages = action.payload.data

        if (newMessages.length > 0 && state.currentConversation?.id) {
          // Append new messages to existing messages
          state.messages = [...state.messages, ...newMessages]

          // Update cache
          const conversationId = state.currentConversation.id
          if (state.messageCache[conversationId]) {
            const updatedMessages = [...state.messageCache[conversationId].messages, ...newMessages]
            state.messageCache[conversationId] = {
              messages: updatedMessages,
              lastUpdated: Date.now(),
            }

            // Update localStorage
            saveMessagesToCache(conversationId, updatedMessages)
          }
        }
      })

      // fetchDailyTaskMessages
      .addCase(fetchDailyTaskMessages.pending, (state) => {
        state.messageLoading = true
        state.error = null
      })
      .addCase(fetchDailyTaskMessages.fulfilled, (state, action) => {
        state.messageLoading = false

        // If there are messages for this daily task, store them
        if (action.payload.data.messages && action.payload.data.messages.length > 0) {
          // Find the conversation ID from the first message
          const firstMessage = action.payload.data.messages[0]
          if (
            firstMessage &&
            firstMessage.conversationId &&
            state.currentConversation?.id === firstMessage.conversationId
          ) {
            state.messages = action.payload.data.messages

            // Update cache
            state.messageCache[firstMessage.conversationId] = {
              messages: action.payload.data.messages,
              lastUpdated: Date.now(),
            }

            // Update localStorage
            saveMessagesToCache(firstMessage.conversationId, action.payload.data.messages)
          }
        }
      })
      .addCase(fetchDailyTaskMessages.rejected, (state, action) => {
        state.messageLoading = false
        state.error = action.payload as string
      })

      // fetchAvailableHelpers
      .addCase(fetchAvailableHelpers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAvailableHelpers.fulfilled, (state, action) => {
        state.loading = false
        state.helpers = action.payload.data
      })
      .addCase(fetchAvailableHelpers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // clearMessageCache
      .addCase(clearMessageCache.fulfilled, (state, action) => {
        if (action.payload) {
          // Clear specific conversation cache
          delete state.messageCache[action.payload]
        } else {
          // Clear all cache
          state.messageCache = {}
        }
      })
  },
})

export const {
  setConnected,
  setCurrentConversation,
  addMessage,
  setCachedMessages,
  setTypingUser,
  clearTypingUser,
  addActiveUser,
  removeActiveUser,
  clearSocket,
  clearCache,
} = chatSlice.actions

export const selectConversations = (state: RootState) => state.chat.conversations
export const selectCurrentConversation = (state: RootState) => state.chat.currentConversation
export const selectChatMessages = (state: RootState) => state.chat.messages
export const selectChatHelpers = (state: RootState) => state.chat.helpers
export const selectChatLoading = (state: RootState) => state.chat.loading
export const selectMessageLoading = (state: RootState) => state.chat.messageLoading
export const selectChatError = (state: RootState) => state.chat.error
export const selectTypingUsers = (state: RootState) => state.chat.typingUsers
export const selectActiveUsers = (state: RootState) => state.chat.activeUsers
export const selectIsUserActive = (userId: number) => (state: RootState) => state.chat.activeUsers.includes(userId)
export const selectIsConnected = (state: RootState) => state.chat.connected
export const selectMessageCache = (state: RootState) => state.chat.messageCache

export default chatSlice.reducer

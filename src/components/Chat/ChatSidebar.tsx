"use client"

import React from "react"
import { useState } from "react"
import {
  Search,
  MessageSquare,
  Loader,
  Archive,
  Filter,
  Briefcase,
  ChevronDown,
  ChevronRight,
  Users,
  MessageCircle,
  UserPlus,
  User,
} from "lucide-react"
import { addNewConversation, type Conversation, type User as UserType } from "./chatSlice"
import { useAppDispatch, useAppSelector } from "../../Redux/hooks"
import { createConversation } from "../../services/socketService"

interface ChatSidebarProps {
  conversations: Conversation[]
  archivedConversations: Conversation[]
  users: UserType[]
  selectedConversation: string | null
  onSelectConversation: (conversationId: string) => void
  currentUserId: number
  onArchiveConversation: (conversationId: string) => void
}

type TabType = "conversations" | "contacts" | "archived"

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  archivedConversations,
  users,
  selectedConversation,
  onSelectConversation,
  currentUserId,
}) => {
  const dispatch = useAppDispatch()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<TabType>("contacts")
  const [showFilters, setShowFilters] = useState(false)
  const [filterType, setFilterType] = useState<"all" | "unread" | "tasks">("all")
  const [showOrgUsers, setShowOrgUsers] = useState(false)
  const { usersLoading, teamMembers, organizationUsers } = useAppSelector((state) => state.chat)
  const onlineUsers = useAppSelector((state) => state.chat?.onlineUsers || [])

  // Group conversations by user to avoid duplicates
  const groupedConversations = conversations.reduce(
    (acc, conversation) => {
      const userId = conversation.otherUser.id

      // If we already have a conversation with this user
      if (acc[userId]) {
        // If the current conversation is more recent, replace the existing one
        if (new Date(conversation.lastMessage.created_at) > new Date(acc[userId].lastMessage.created_at)) {
          acc[userId] = conversation
        }

        // If the current conversation has a task and the existing one doesn't, update the task info
        if (conversation.task && !acc[userId].task) {
          acc[userId].task = conversation.task
        }

        // Combine unread counts
        acc[userId].unreadCount += conversation.unreadCount
      } else {
        acc[userId] = { ...conversation }
      }

      return acc
    },
    {} as Record<number, Conversation>,
  )

  // Convert back to array
  const consolidatedConversations = Object.values(groupedConversations)

  // Filter team members - exclude current user for display
  const filteredTeamMembers = teamMembers.filter(
    (user) =>
      user.id !== currentUserId &&
      (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  // Get current user from team members (for display purposes)
  const currentUserInTeam = teamMembers.find((user) => user.id === currentUserId)

  // Filter organization users
  const filteredOrgUsers = organizationUsers.filter(
    (user) =>
      user.id !== currentUserId &&
      (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  // Filter all users (for backward compatibility)
  const filteredUsers = users.filter(
    (user) =>
      user.id !== currentUserId &&
      (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const filteredConversations = consolidatedConversations.filter((conv) => {
    const matchesSearch =
      searchTerm === "" ||
      conv.otherUser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.lastMessage.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (conv.task?.title && conv.task.title.toLowerCase().includes(searchTerm.toLowerCase()))

    if (!matchesSearch) return false

    switch (filterType) {
      case "unread":
        return conv.unreadCount > 0
      case "tasks":
        return !!conv.task || !!conv.dailyTask
      default:
        return true
    }
  })

  // Create a map of user IDs to their most recent conversation
  const userConversationMap = conversations.reduce(
    (map, conv) => {
      const userId = conv.otherUser.id
      if (!map[userId] || new Date(conv.lastMessage.created_at) > new Date(map[userId].lastMessage.created_at)) {
        map[userId] = conv
      }
      return map
    },
    {} as Record<number, Conversation>,
  )

  const handleStartChat = async (receiverId: number) => {
    try {
      // Find any existing conversation with this user
      const existingConversations = conversations.filter((conv) => conv.otherUser.id === receiverId)
      let conversationId = null

      if (existingConversations.length > 0) {
        // Use the most recent conversation with this user
        const mostRecentConv = existingConversations.sort(
          (a, b) => new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime(),
        )[0]

        conversationId = mostRecentConv.id
        console.log("Using existing conversation:", conversationId)
      } else {
        // Create a new conversation
        const receiver = [...teamMembers, ...organizationUsers].find((user) => user.id === receiverId)
        const result = (await createConversation(receiverId, "Hello! Let's chat.")) as any

        if (result && result.conversationId && receiver) {
          conversationId = result.conversationId
          console.log("Created new conversation:", conversationId)

          dispatch(
            addNewConversation({
              conversationId: result.conversationId,
              sender: { id: currentUserId, name: "You" },
              receiver,
            }),
          )
        } else {
          console.error("Failed to create conversation: Missing conversationId or receiver")
          return
        }
      }

      if (conversationId) {
        onSelectConversation(conversationId)
        setActiveTab("conversations")
      }
    } catch (error) {
      console.error("Error starting chat:", error)
    }
  }

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return "Yesterday"
    return date.toLocaleDateString()
  }

  const renderUserItem = (user: UserType, showLastMessage = false) => {
    const conversation = userConversationMap[user.id]
    const hasConversation = !!conversation

    return (
      <div
        key={user.id}
        className="px-4 py-3 flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
        onClick={() => handleStartChat(user.id)}
      >
        <div className="relative">
          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-300 overflow-hidden">
            {user.profilePictureUrl ? (
              <img
                src={user.profilePictureUrl || "/placeholder.svg"}
                alt={user.name}
                className="h-full w-full object-cover"
              />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </div>
          {onlineUsers.includes(user.id) && (
            <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green border-2 border-white dark:border-gray-800"></div>
          )}
        </div>
        <div className="ml-3 flex-1">
          <div className="flex justify-between">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
            {hasConversation && showLastMessage && (
              <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-1">
                {formatLastActive(conversation.lastMessage.created_at)}
              </span>
            )}
          </div>

          {showLastMessage && hasConversation ? (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {conversation.lastMessage.sender === currentUserId && "You: "}
              {conversation.lastMessage.content}
            </p>
          ) : (
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <span className="truncate">{user.email}</span>
              {user.role && (
                <>
                  <span className="mx-1">•</span>
                  <span className="capitalize">{user.role}</span>
                </>
              )}
            </div>
          )}

          {hasConversation && conversation.unreadCount > 0 && showLastMessage && (
            <span className="ml-auto text-xs font-semibold text-white bg-red rounded-full px-2 py-0.5 mt-1 inline-block">
              {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full md:w-80 flex flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      {/* Search and Tabs */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="relative mb-3">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Tabs */}
        <div className="flex border rounded-md overflow-hidden">
        <button
            className={`flex-1 py-1.5 text-xs font-medium flex items-center justify-center ${
              activeTab === "contacts"
                ? "bg-blue text-white"
                : "bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-300"
            }`}
            onClick={() => setActiveTab("contacts")}
          >
            <UserPlus size={14} className="mr-1" />
            Contacts
          </button>
          <button
            className={`flex-1 py-1.5 text-xs font-medium flex items-center justify-center ${
              activeTab === "conversations"
                ? "bg-blue text-white"
                : "bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-300"
            }`}
            onClick={() => setActiveTab("conversations")}
          >
            <MessageCircle size={14} className="mr-1" />
            Chats
          </button>

          <button
            className={`flex-1 py-1.5 text-xs font-medium flex items-center justify-center ${
              activeTab === "archived"
                ? "bg-blue text-white"
                : "bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-300"
            }`}
            onClick={() => setActiveTab("archived")}
          >
            <Archive size={14} className="mr-1" />
            Archived
          </button>
        </div>

        {/* Filters - Only show for conversations tab */}
        {activeTab === "conversations" && (
          <div className="mt-2 flex items-center justify-between">
            <button
              className="text-xs flex items-center text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={14} className="mr-1" />
              {filterType !== "all" ? `Filtered: ${filterType}` : "Filter"}
            </button>
          </div>
        )}

        {activeTab === "conversations" && showFilters && (
          <div className="mt-2 p-2 bg-white dark:bg-gray-700 rounded-md shadow-md border border-gray-200 dark:border-gray-600">
            <div className="flex flex-col space-y-1">
              <button
                className={`text-xs text-left px-2 py-1 rounded ${filterType === "all" ? "bg-blue dark:bg-green text-white dark:text-white" : "hover:bg-gray-100 dark:hover:bg-gray-600"}`}
                onClick={() => setFilterType("all")}
              >
                All Conversations
              </button>
              <button
                className={`text-xs text-left px-2 py-1 rounded ${filterType === "unread" ? "bg-blue dark:bg-green text-white dark:text-white" : "hover:bg-gray-100 dark:hover:bg-gray-600"}`}
                onClick={() => setFilterType("unread")}
              >
                Unread
              </button>
              <button
                className={`text-xs text-left px-2 py-1 rounded ${filterType === "tasks" ? "bg-blue dark:bg-green text-white dark:text-text-white" : "hover:bg-gray-100 dark:hover:bg-gray-600"}`}
                onClick={() => setFilterType("tasks")}
              >
                Tasks
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Loading Indicator */}
      {usersLoading && (
        <div className="flex items-center justify-center py-4">
          <Loader className="h-6 w-6 animate-spin text-gray-500 dark:text-gray-400" />
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Loading users...</span>
        </div>
      )}

      {/* Content based on active tab */}
      {!usersLoading && (
        <div className="flex-1 overflow-y-auto">
          {/* Archived Tab */}
          {activeTab === "archived" && (
            <>
              {archivedConversations.length > 0 ? (
                <div className="py-2">
                  <div className="px-4 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Archived
                  </div>
                  {archivedConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`px-4 py-3 flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                        selectedConversation === conversation.id ? "bg-gray-100 dark:bg-gray-700" : ""
                      }`}
                      onClick={() => onSelectConversation(conversation.id)}
                    >
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-300 overflow-hidden">
                          {conversation.otherUser.profilePictureUrl ? (
                            <img
                              src={conversation.otherUser.profilePictureUrl || "/placeholder.svg"}
                              alt={conversation.otherUser.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            conversation.otherUser.name.charAt(0).toUpperCase()
                          )}
                        </div>
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {conversation.otherUser.name}
                          </p>
                          <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-1">
                            {formatLastActive(conversation.lastMessage.created_at)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {conversation.lastMessage.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-center px-4">
                  <Archive className="h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">No archived conversations</p>
                </div>
              )}
            </>
          )}

          {/* Conversations Tab */}
          {activeTab === "conversations" && (
            <>
              {filteredConversations.length > 0 ? (
                <div className="py-2">
                  <div className="px-4 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Conversations
                  </div>
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`px-4 py-3 flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                        selectedConversation === conversation.id ? "bg-gray-100 dark:bg-gray-700" : ""
                      }`}
                      onClick={() => onSelectConversation(conversation.id)}
                    >
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-300 overflow-hidden">
                          {conversation.otherUser.profilePictureUrl ? (
                            <img
                              src={conversation.otherUser.profilePictureUrl || "/placeholder.svg"}
                              alt={conversation.otherUser.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            conversation.otherUser.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        {onlineUsers.includes(conversation.otherUser.id) && (
                          <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green border-2 border-white dark:border-gray-800"></div>
                        )}
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {conversation.otherUser.name}
                            </p>
                            {conversation.task && (
                              <span className="ml-2 flex items-center text-xs text-blue-600 dark:text-blue-400">
                                <Briefcase size={12} className="mr-1" />
                                Task
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-1">
                            {formatLastActive(conversation.lastMessage.created_at)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {conversation.lastMessage.sender === currentUserId && "You: "}
                          {conversation.task && !conversation.lastMessage.content.includes(conversation.task.title) && (
                            <span className="text-blue-600 dark:text-blue-400">[{conversation.task.title}] </span>
                          )}
                          {conversation.lastMessage.content}
                        </p>
                      </div>
                      {conversation.unreadCount > 0 && (
                        <span className="ml-2 text-xs font-semibold text-white bg-red rounded-full px-2 py-1">
                          {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : searchTerm ? (
                <div className="flex flex-col items-center justify-center h-40 text-center px-4">
                  <Search className="h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">No conversations found</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-center px-4">
                  <MessageSquare className="h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">No conversations yet</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Start chatting with someone from the Contacts tab
                  </p>
                </div>
              )}
            </>
          )}

          {/* Contacts Tab */}
          {activeTab === "contacts" && (
            <div className="py-2">
              {/* Team Members Section */}
              <div className="mb-2">
                <div className="px-4 py-2 flex items-center justify-between bg-gray-50 dark:bg-gray-900">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase flex items-center">
                    <Users size={14} className="mr-1" />
                    Team Members
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {/* Count team members excluding current user */}
                    {filteredTeamMembers.length}
                  </span>
                </div>

                {filteredTeamMembers.length > 0 ? (
                  <div>{filteredTeamMembers.map((user) => renderUserItem(user, true))}</div>
                ) : currentUserInTeam ? (
                  <div className="px-4 py-3 text-center">
                    <div className="flex justify-center mb-2">
                      <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-300 overflow-hidden">
                        {currentUserInTeam.profilePictureUrl ? (
                          <img
                            src={currentUserInTeam.profilePictureUrl || "/placeholder.svg"}
                            alt={currentUserInTeam.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User className="h-6 w-6" />
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{currentUserInTeam.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">You're the only team member</p>
                  </div>
                ) : (
                  <div className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                    No team members found
                  </div>
                )}
              </div>

              {/* Organization Users Section with toggle */}
              <div>
                <div
                  className="px-4 py-2 flex items-center justify-between bg-gray-50 dark:bg-gray-900 cursor-pointer"
                  onClick={() => setShowOrgUsers(!showOrgUsers)}
                >
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase flex items-center">
                    <Briefcase size={14} className="mr-1" />
                    Request In Organization Members
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-400 dark:text-gray-500 mr-2">{filteredOrgUsers.length}</span>
                    {showOrgUsers ? (
                      <ChevronDown size={16} className="text-gray-500" />
                    ) : (
                      <ChevronRight size={16} className="text-gray-500" />
                    )}
                  </div>
                </div>

                {showOrgUsers && (
                  <>
                    {filteredOrgUsers.length > 0 ? (
                      <div>{filteredOrgUsers.map((user) => renderUserItem(user, true))}</div>
                    ) : (
                      <div className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                        No organization users found
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Show message if no users at all */}
              {filteredTeamMembers.length === 0 && filteredOrgUsers.length === 0 && !currentUserInTeam && (
                <div className="flex flex-col items-center justify-center h-40 text-center px-4 mt-4">
                  <UserPlus className="h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">No contacts found</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Try adjusting your search</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ChatSidebar

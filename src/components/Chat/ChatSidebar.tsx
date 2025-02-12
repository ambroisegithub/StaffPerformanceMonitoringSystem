"use client"

import React from "react"
import { useState } from "react"
import { useAppDispatch, useAppSelector } from "../../Redux/hooks"
import {
  type Helper,
  createConversation,
  fetchConversation,
  fetchConversationMessages,
  fetchConversations,
  selectConversations,
  selectChatHelpers,
  selectChatLoading,
  selectActiveUsers,
} from "./ChatSlice"
import { Search, Plus, X, Users, Clock, MessageSquare } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"

interface ChatSidebarProps {
  organizationId: number
  userId: number
  isMobileOpen: boolean
  onMobileClose: () => void
  selectedConversationId: string | null
  onSelectConversation: (conversationId: string) => void
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  organizationId,
  userId,
  isMobileOpen,
  onMobileClose,
  selectedConversationId,
  onSelectConversation,
}) => {
  const dispatch = useAppDispatch()
  const conversations = useAppSelector(selectConversations)
  const helpers = useAppSelector(selectChatHelpers)
  const loading = useAppSelector(selectChatLoading)
  const activeUsers = useAppSelector(selectActiveUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [isNewChatOpen, setIsNewChatOpen] = useState(false)
  const [selectedHelper, setSelectedHelper] = useState<Helper | null>(null)
  const [initialMessage, setInitialMessage] = useState("")
  const [showOnlineOnly, setShowOnlineOnly] = useState(false)
  const [activeTab, setActiveTab] = useState<"conversations" | "contacts">(
    conversations.length > 0 ? "conversations" : "contacts",
  )

  const handleSelectConversation = (conversationId: string) => {
    dispatch(fetchConversation({ conversationId, userId }));
    dispatch(fetchConversationMessages({ conversationId, userId }));
    onSelectConversation(conversationId);
  };

  const handleCreateConversation = async () => {
    if (selectedHelper && initialMessage.trim()) {
      try {
        const result = await dispatch(
          createConversation({
            senderId: userId,
            receiverId: selectedHelper.id,
            initialMessage: initialMessage.trim(),
          }),
        ).unwrap()

        if (result.success) {
          setIsNewChatOpen(false)
          setSelectedHelper(null)
          setInitialMessage("")

          // Fetch updated conversations
          dispatch(fetchConversations({ organizationId, userId }))

          // Select the new conversation
          if (result.data.conversationId) {
            dispatch(fetchConversation({ conversationId: result.data.conversationId, userId }))
            dispatch(fetchConversationMessages({ conversationId: result.data.conversationId, userId }))
            onSelectConversation(result.data.conversationId)
          }
        }
      } catch (error) {
        console.error("Failed to create conversation:", error)
      }
    }
  }

  const handleStartConversation = (helper: Helper) => {
    setSelectedHelper(helper)
    setIsNewChatOpen(true)
  }

  // Filter conversations based on search term
  const filteredConversations = conversations.filter((conversation) => {
    const matchesSearch =
      conversation.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conversation.otherUser?.name?.toLowerCase().includes(searchTerm.toLowerCase())

    if (showOnlineOnly) {
      return matchesSearch && activeUsers.includes(conversation.otherUser.id)
    }

    return matchesSearch
  })

  // Filter helpers based on search term
  const filteredHelpers = helpers.filter((helper) => {
    const matchesSearch =
      helper.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      helper.role.toLowerCase().includes(searchTerm.toLowerCase())

    if (showOnlineOnly) {
      return matchesSearch && activeUsers.includes(helper.id)
    }

    return matchesSearch
  })

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden ${isMobileOpen ? "block" : "hidden"}`}
        onClick={onMobileClose}
      />

      {/* Sidebar */}
      <div
        className={`
          w-full md:w-80 lg:w-96 bg-white border-r border-gray-200 flex-shrink-0
          md:relative md:block
          fixed inset-y-0 left-0 z-40 md:z-auto
          transition-transform duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="h-full flex flex-col overflow-hidden">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Conversations</h2>
              <button className="md:hidden p-1 rounded-md hover:bg-gray-100" onClick={onMobileClose}>
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Search..."
                className="pl-9 py-2 h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="online-only"
                  checked={showOnlineOnly}
                  onChange={() => setShowOnlineOnly(!showOnlineOnly)}
                  className="mr-2"
                />
                <label htmlFor="online-only" className="text-sm text-gray-600">
                  Online only
                </label>
              </div>

              <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="flex items-center gap-1">
                    <Plus className="h-4 w-4" />
                    <span>New Chat</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Start a new conversation</DialogTitle>
                  </DialogHeader>
                  <div className="mt-4">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Select a team member</label>
                      <div className="max-h-60 overflow-y-auto border rounded-md divide-y">
                        {filteredHelpers.map((helper) => (
                          <div
                            key={helper.id}
                            className={`p-3 flex items-center hover:bg-gray-50 cursor-pointer ${
                              selectedHelper?.id === helper.id ? "bg-gray-100" : ""
                            }`}
                            onClick={() => setSelectedHelper(helper)}
                          >
                            <Avatar className="h-8 w-8 mr-3">
                              <AvatarFallback>{getInitials(helper.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{helper.name}</div>
                              <div className="text-xs text-gray-500">
                                {helper.role} • {helper.level}
                              </div>
                            </div>
                            {activeUsers.includes(helper.id) && (
                              <div className="ml-auto w-2 h-2 bg-green rounded-full"></div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Initial message</label>
                      <textarea
                        className="w-full border rounded-md p-2 h-24 resize-none"
                        placeholder="Type your message here..."
                        value={initialMessage}
                        onChange={(e) => setInitialMessage(e.target.value)}
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsNewChatOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateConversation} disabled={!selectedHelper || !initialMessage.trim()}>
                        Start Conversation
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Tabs for Conversations and Contacts */}
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "conversations" | "contacts")}
            className="w-full flex-1 flex flex-col overflow-hidden"
          >
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="conversations" className="text-sm">
                Conversations
              </TabsTrigger>
              <TabsTrigger value="contacts" className="text-sm">
                Contacts
              </TabsTrigger>
            </TabsList>

            {/* Conversations Tab */}
            <TabsContent value="conversations" className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center p-2 animate-pulse">
                      <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredConversations.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-3 flex items-start hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedConversationId === conversation.id ? "bg-gray-100" : ""
                      }`}
                      onClick={() => handleSelectConversation(conversation.id)}
                    >
                      <div className="relative mr-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{getInitials(conversation.otherUser.name)}</AvatarFallback>
                        </Avatar>
                        {activeUsers.includes(conversation.otherUser.id) && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green border-2 border-white rounded-full"></span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <h3 className="font-medium text-gray-900 truncate">{conversation.otherUser.name}</h3>
                          {conversation.lastMessage && (
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(conversation.lastMessage.created_at), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                        {conversation.lastMessage && (
                          <p className="text-sm text-gray-500 truncate">{conversation.lastMessage.content}</p>
                        )}
                        {conversation.unreadCount > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue text-white mt-1">
                            {conversation.unreadCount} new
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-gray-500 mb-1">No conversations yet</h3>
                  <p className="text-sm text-gray-400">Start a new conversation or select a contact</p>
                </div>
              )}
            </TabsContent>

            {/* Contacts Tab */}
            <TabsContent value="contacts" className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center p-2 animate-pulse">
                      <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredHelpers.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {filteredHelpers.map((helper) => (
                    <div
                      key={helper.id}
                      className="p-3 flex items-center hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleStartConversation(helper)}
                    >
                      <div className="relative mr-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{getInitials(helper.name)}</AvatarFallback>
                        </Avatar>
                        {activeUsers.includes(helper.id) && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{helper.name}</h3>
                        <p className="text-sm text-gray-500">
                          {helper.role} • {helper.level}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" className="ml-2">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-gray-500 mb-1">No contacts found</h3>
                  <p className="text-sm text-gray-400">
                    {searchTerm ? "Try a different search term" : "No team members available"}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-500">
                  {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="text-sm text-gray-500">{activeUsers.length} online</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ChatSidebar

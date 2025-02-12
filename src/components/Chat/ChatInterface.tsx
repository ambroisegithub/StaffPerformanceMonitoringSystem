"use client"

import React from "react"
import ChatLayout from "./ChatLayout"

interface ChatInterfaceProps {
  userId: number
  organizationId: number
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ userId, organizationId }) => {
  return <ChatLayout userId={userId} organizationId={organizationId} />
}

export default ChatInterface

"use client"

import React from "react"
import { useState } from "react"
import { MessageSquare } from "lucide-react"
import { Button } from "../ui/button"
import ChatLayout from "./ChatLayout"

interface ChatButtonProps {
  userId: number
  organizationId: number
}

const ChatButton: React.FC<ChatButtonProps> = ({ userId, organizationId }) => {
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setIsChatOpen(true)}
        className="flex items-center gap-2 bg-blue hover:bg-blue-700 text-white"
      >
        <MessageSquare className="h-4 w-4" />
        <span>Chat</span>
      </Button>

      {isChatOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-[95%] h-[100%] flex flex-col">
            <div className="flex-1 overflow-hidden">
              <ChatLayout userId={userId} organizationId={organizationId} onClose={() => setIsChatOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ChatButton

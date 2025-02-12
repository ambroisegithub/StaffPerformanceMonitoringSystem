"use client"

import React from "react"
import { useState } from "react"
import { MessageSquare } from "lucide-react"
import { Button } from "../ui/button"
import { useAppDispatch } from "../../Redux/hooks"
import { createConversation } from "./ChatSlice"
import ChatLayout from "./ChatLayout"

interface TaskChatButtonProps {
  taskId: number
  userId: number
  organizationId: number
  helperId: number
  isDailyTask?: boolean
}

const TaskChatButton: React.FC<TaskChatButtonProps> = ({
  taskId,
  userId,
  organizationId,
  helperId,
  isDailyTask = false,
}) => {
  const dispatch = useAppDispatch()
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)

  const handleOpenChat = async () => {
    try {
      // Create or get existing conversation for this task
      const result = await dispatch(
        createConversation({
          senderId: userId,
          receiverId: helperId,
          taskId: isDailyTask ? undefined : taskId,
          dailyTaskId: isDailyTask ? taskId : undefined,
          title: isDailyTask ? `Daily Task #${taskId} Discussion` : `Task #${taskId} Discussion`,
        }),
      ).unwrap()

      if (result.success) {
        setConversationId(result.data.conversationId)
        setIsChatOpen(true)
      }
    } catch (error) {
      console.error("Failed to create task conversation:", error)
    }
  }

  return (
    <>
      <Button onClick={handleOpenChat} variant="outline" size="sm" className="flex items-center gap-1">
        <MessageSquare className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Chat</span>
      </Button>

      {isChatOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
            <div className="flex-1 overflow-hidden">
              <ChatLayout
                userId={userId}
                organizationId={organizationId}
                initialConversationId={conversationId}
                onClose={() => setIsChatOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default TaskChatButton

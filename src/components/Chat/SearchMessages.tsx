"use client"

import React from "react"
import { useState, useEffect } from "react"
import { X, Search, ArrowUp, ArrowDown } from "lucide-react"
import { useAppSelector } from "../../Redux/hooks"

interface SearchMessagesProps {
  conversationId: string
  onClose: () => void
}

type SearchResult = {
  messageId: number
  content: string
  date: string
  sender: {
    id: number
    name: string
  }
}

const SearchMessages: React.FC<SearchMessagesProps> = ({ conversationId, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedResult, setSelectedResult] = useState<number | null>(null)

  const messages = useAppSelector((state) => state.chat.messages.flatMap((group) => group.messages))

  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setResults([])
      return
    }

    const term = searchTerm.toLowerCase()
    const matchingMessages = messages
      .filter((message) => message.content.toLowerCase().includes(term))
      .map((message) => ({
        messageId: message.id,
        content: message.content,
        date: new Date(message.created_at).toLocaleString(),
        sender: message.sender,
      }))

    setResults(matchingMessages)
    if (matchingMessages.length > 0) {
      setSelectedResult(0)
    } else {
      setSelectedResult(null)
    }
  }, [searchTerm, messages])

  const scrollToMessage = (messageId: number) => {
    const messageElement = document.getElementById(`message-${messageId}`)
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: "smooth", block: "center" })
      messageElement.classList.add("bg-yellow")
      setTimeout(() => {
        messageElement.classList.remove("bg-yellow")
      }, 2000)
    }
  }

  const handleResultClick = (index: number) => {
    setSelectedResult(index)
    scrollToMessage(results[index].messageId)
  }

  const navigateResults = (direction: "up" | "down") => {
    if (results.length === 0 || selectedResult === null) return

    let newIndex
    if (direction === "up") {
      newIndex = selectedResult > 0 ? selectedResult - 1 : results.length - 1
    } else {
      newIndex = selectedResult < results.length - 1 ? selectedResult + 1 : 0
    }

    setSelectedResult(newIndex)
    scrollToMessage(results[newIndex].messageId)
  }

  const highlightSearchTerm = (text: string) => {
    if (!searchTerm.trim()) return text

    const parts = text.split(new RegExp(`(${searchTerm})`, "gi"))
    return parts.map((part, i) =>
      part.toLowerCase() === searchTerm.toLowerCase() ? (
        <mark key={i} className="bg-yellow dark:bg-yellow-700">
          {part}
        </mark>
      ) : (
        part
      ),
    )
  }

  return (
    <div className="absolute top-0 left-0 right-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-md">
      <div className="p-2 flex items-center">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search in conversation..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </div>

        <div className="flex items-center ml-2">
          <button
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 disabled:opacity-50"
            onClick={() => navigateResults("up")}
            disabled={results.length === 0}
          >
            <ArrowUp size={16} />
          </button>
          <button
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 disabled:opacity-50"
            onClick={() => navigateResults("down")}
            disabled={results.length === 0}
          >
            <ArrowDown size={16} />
          </button>
          <button
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 ml-1"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="max-h-60 overflow-y-auto border-t border-gray-200 dark:border-gray-700">
          {results.map((result, index) => (
            <div
              key={result.messageId}
              className={`p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                selectedResult === index ? "bg-gray-100 dark:bg-gray-700" : ""
              }`}
              onClick={() => handleResultClick(index)}
            >
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{result.sender.name}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{result.date}</span>
              </div>
              <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-2">
                {highlightSearchTerm(result.content)}
              </p>
            </div>
          ))}
        </div>
      )}

      {searchTerm.trim().length >= 2 && results.length === 0 && (
        <div className="p-4 text-center border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">No messages found</p>
        </div>
      )}
    </div>
  )
}

export default SearchMessages

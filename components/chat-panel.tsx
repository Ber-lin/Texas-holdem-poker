"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Send, MessageCircle } from "lucide-react"
import type { ChatMessage } from "@/hooks/useWebSocket"
import type { Player } from "@/types/game"

interface ChatPanelProps {
  messages: ChatMessage[]
  currentPlayer: Player
  onSendMessage: (message: string) => void
}

export function ChatPanel({ messages, currentPlayer, onSendMessage }: ChatPanelProps) {
  const [inputMessage, setInputMessage] = useState("")
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // 自动滚动到底部
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      onSendMessage(inputMessage.trim())
      setInputMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <MessageCircle className="w-4 h-4" />
        <span className="font-medium">聊天室</span>
        <Badge variant="secondary" className="text-xs">
          {messages.length}
        </Badge>
      </div>

      <ScrollArea className="flex-1 h-64 mb-3 border rounded-md p-3" ref={scrollAreaRef}>
        <div className="space-y-2">
          {messages.map((message) => (
            <div key={message.id} className="text-sm">
              {message.type === "system" ? (
                <div className="text-center text-muted-foreground italic py-1">{message.message}</div>
              ) : message.type === "action" ? (
                <div className="text-center text-blue-600 italic py-1">{message.message}</div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${message.playerId === currentPlayer.id ? "text-green-600" : ""}`}>
                      {message.playerName}
                    </span>
                    <span className="text-xs text-muted-foreground">{formatTime(message.timestamp)}</span>
                  </div>
                  <div className="pl-2 border-l-2 border-muted">{message.message}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="flex gap-2">
        <Input
          placeholder="输入消息..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1"
        />
        <Button onClick={handleSendMessage} size="sm" disabled={!inputMessage.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

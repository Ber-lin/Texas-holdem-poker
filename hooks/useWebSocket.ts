"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import type { GameState, Player } from "@/types/game"

export interface WebSocketMessage {
  type: "join_room" | "leave_room" | "update_game_state" | "chat_message" | "player_action"
  payload: any
  timestamp: number
  playerId?: string
}

export interface ChatMessage {
  id: string
  playerId: string
  playerName: string
  message: string
  timestamp: number
  type: "chat" | "system" | "action"
}

// 模拟WebSocket服务器的行为
class MockWebSocketServer {
  private static instance: MockWebSocketServer
  private rooms: Map<string, GameState> = new Map()
  private connections: Map<string, Set<(message: WebSocketMessage) => void>> = new Map()
  private chatHistory: Map<string, ChatMessage[]> = new Map()

  static getInstance() {
    if (!MockWebSocketServer.instance) {
      MockWebSocketServer.instance = new MockWebSocketServer()
      // 从localStorage恢复数据
      MockWebSocketServer.instance.loadFromStorage()
    }
    return MockWebSocketServer.instance
  }

  // 保存到localStorage
  private saveToStorage() {
    try {
      const roomsData = Array.from(this.rooms.entries())
      const chatData = Array.from(this.chatHistory.entries())
      localStorage.setItem("poker_rooms", JSON.stringify(roomsData))
      localStorage.setItem("poker_chat", JSON.stringify(chatData))
    } catch (error) {
      console.error("Failed to save to localStorage:", error)
    }
  }

  // 从localStorage加载
  private loadFromStorage() {
    try {
      const roomsData = localStorage.getItem("poker_rooms")
      const chatData = localStorage.getItem("poker_chat")

      if (roomsData) {
        const rooms = JSON.parse(roomsData)
        this.rooms = new Map(rooms)
      }

      if (chatData) {
        const chat = JSON.parse(chatData)
        this.chatHistory = new Map(chat)
      }
    } catch (error) {
      console.error("Failed to load from localStorage:", error)
    }
  }

  subscribe(roomId: string, callback: (message: WebSocketMessage) => void) {
    if (!this.connections.has(roomId)) {
      this.connections.set(roomId, new Set())
    }
    this.connections.get(roomId)!.add(callback)

    return () => {
      this.connections.get(roomId)?.delete(callback)
    }
  }

  broadcast(roomId: string, message: WebSocketMessage) {
    const callbacks = this.connections.get(roomId)
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(message)
        } catch (error) {
          console.error("Broadcast error:", error)
        }
      })
    }
  }

  joinRoom(roomId: string, player: Player, password: string) {
    let room = this.rooms.get(roomId)

    if (!room) {
      // 创建新房间
      room = {
        id: roomId,
        password,
        baseAmount: 10,
        players: [player],
        currentGame: 1,
        currentRound: 0,
        gameStarted: false,
        roundStarted: false,
        pot: 0,
        currentPlayerIndex: 0,
        chatMessages: [],
      }
      this.rooms.set(roomId, room)
      this.chatHistory.set(roomId, [])
    } else {
      // 验证密码并加入房间
      if (room.password !== password) {
        throw new Error("密码错误")
      }

      // 检查玩家是否已存在
      const existingPlayer = room.players.find((p) => p.name === player.name)
      if (existingPlayer) {
        // 如果是重新连接，更新玩家信息
        room.players = room.players.map((p) => (p.name === player.name ? { ...p, ...player, chips: p.chips } : p))
      } else {
        room.players.push(player)
      }
    }

    // 保存状态
    this.saveToStorage()

    // 广播玩家加入消息
    this.broadcast(roomId, {
      type: "update_game_state",
      payload: room,
      timestamp: Date.now(),
    })

    // 添加系统消息
    const systemMessage: ChatMessage = {
      id: Date.now().toString(),
      playerId: "system",
      playerName: "System",
      message: `${player.name} 加入了房间`,
      timestamp: Date.now(),
      type: "system",
    }

    this.sendChatMessage(roomId, systemMessage)

    return room
  }

  updateGameState(roomId: string, newState: GameState) {
    this.rooms.set(roomId, newState)
    this.saveToStorage()

    this.broadcast(roomId, {
      type: "update_game_state",
      payload: newState,
      timestamp: Date.now(),
    })
  }

  sendChatMessage(roomId: string, message: ChatMessage) {
    const chatHistory = this.chatHistory.get(roomId) || []
    chatHistory.push(message)
    this.chatHistory.set(roomId, chatHistory)
    this.saveToStorage()

    this.broadcast(roomId, {
      type: "chat_message",
      payload: message,
      timestamp: Date.now(),
    })
  }

  getChatHistory(roomId: string): ChatMessage[] {
    return this.chatHistory.get(roomId) || []
  }

  getRoom(roomId: string): GameState | undefined {
    return this.rooms.get(roomId)
  }
}

export function useWebSocket(roomId: string) {
  const [isConnected, setIsConnected] = useState(false)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const serverRef = useRef<MockWebSocketServer>()

  useEffect(() => {
    serverRef.current = MockWebSocketServer.getInstance()
    setIsConnected(true)

    // 获取现有房间状态
    const existingRoom = serverRef.current.getRoom(roomId)
    if (existingRoom) {
      setGameState(existingRoom)
    }

    const unsubscribe = serverRef.current.subscribe(roomId, (message: WebSocketMessage) => {
      switch (message.type) {
        case "update_game_state":
          setGameState(message.payload)
          break
        case "chat_message":
          setChatMessages((prev) => {
            // 避免重复消息
            const exists = prev.find((m) => m.id === message.payload.id)
            if (exists) return prev
            return [...prev, message.payload]
          })
          break
      }
    })

    // 获取聊天历史
    setChatMessages(serverRef.current.getChatHistory(roomId))

    return unsubscribe
  }, [roomId])

  const joinRoom = useCallback(
    (player: Player, password: string) => {
      if (!serverRef.current) return null
      try {
        const room = serverRef.current.joinRoom(roomId, player, password)
        setGameState(room)
        return room
      } catch (error) {
        throw error
      }
    },
    [roomId],
  )

  const updateGameState = useCallback(
    (newState: GameState) => {
      if (!serverRef.current) return
      serverRef.current.updateGameState(roomId, newState)
    },
    [roomId],
  )

  const sendChatMessage = useCallback(
    (message: string, playerId: string, playerName: string) => {
      if (!serverRef.current) return

      const chatMessage: ChatMessage = {
        id: `${Date.now()}-${Math.random()}`,
        playerId,
        playerName,
        message,
        timestamp: Date.now(),
        type: "chat",
      }

      serverRef.current.sendChatMessage(roomId, chatMessage)
    },
    [roomId],
  )

  const sendActionMessage = useCallback(
    (action: string, playerId: string, playerName: string) => {
      if (!serverRef.current) return

      const actionMessage: ChatMessage = {
        id: `${Date.now()}-${Math.random()}`,
        playerId,
        playerName,
        message: action,
        timestamp: Date.now(),
        type: "action",
      }

      serverRef.current.sendChatMessage(roomId, actionMessage)
    },
    [roomId],
  )

  return {
    isConnected,
    gameState,
    chatMessages,
    joinRoom,
    updateGameState,
    sendChatMessage,
    sendActionMessage,
  }
}

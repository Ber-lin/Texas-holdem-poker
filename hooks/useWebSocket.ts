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
    }
    return MockWebSocketServer.instance
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
      callbacks.forEach((callback) => callback(message))
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
        throw new Error("玩家名称已存在")
      }

      room.players.push(player)
    }

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

    const chatHistory = this.chatHistory.get(roomId) || []
    chatHistory.push(systemMessage)
    this.chatHistory.set(roomId, chatHistory)

    return room
  }

  updateGameState(roomId: string, newState: GameState) {
    this.rooms.set(roomId, newState)
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

    this.broadcast(roomId, {
      type: "chat_message",
      payload: message,
      timestamp: Date.now(),
    })
  }

  getChatHistory(roomId: string): ChatMessage[] {
    return this.chatHistory.get(roomId) || []
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

    const unsubscribe = serverRef.current.subscribe(roomId, (message: WebSocketMessage) => {
      switch (message.type) {
        case "update_game_state":
          setGameState(message.payload)
          break
        case "chat_message":
          setChatMessages((prev) => [...prev, message.payload])
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
        id: Date.now().toString(),
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
        id: Date.now().toString(),
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

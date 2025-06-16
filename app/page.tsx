"use client"

import { useState, useEffect } from "react"
import { RoomEntry } from "@/components/room-entry"
import { PokerRoom } from "@/components/poker-room"
import type { Player } from "@/types/game"

export default function Home() {
  const [roomId, setRoomId] = useState<string>("")
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null)

  // 页面加载时恢复状态
  useEffect(() => {
    const savedRoomId = localStorage.getItem("current_room_id")
    const savedPlayer = localStorage.getItem("current_player")

    if (savedRoomId && savedPlayer) {
      try {
        setRoomId(savedRoomId)
        setCurrentPlayer(JSON.parse(savedPlayer))
      } catch (error) {
        console.error("Failed to restore state:", error)
        localStorage.removeItem("current_room_id")
        localStorage.removeItem("current_player")
      }
    }
  }, [])

  const handleRoomEntry = (playerName: string, password: string, isMaster: boolean, enteredRoomId: string) => {
    const newPlayer: Player = {
      id: Date.now().toString(),
      name: playerName,
      chips: 1000, // 默认初始筹码
      isMaster,
      isActive: true,
      currentBet: 0,
      hasActed: false,
      isFolded: false,
    }

    setCurrentPlayer(newPlayer)
    setRoomId(enteredRoomId)

    // 保存状态到localStorage
    localStorage.setItem("current_room_id", enteredRoomId)
    localStorage.setItem("current_player", JSON.stringify(newPlayer))
  }

  const handleLeaveRoom = () => {
    setCurrentPlayer(null)
    setRoomId("")
    localStorage.removeItem("current_room_id")
    localStorage.removeItem("current_player")
  }

  if (!roomId || !currentPlayer) {
    return <RoomEntry onRoomEntry={handleRoomEntry} />
  }

  return <PokerRoom roomId={roomId} currentPlayer={currentPlayer} onLeaveRoom={handleLeaveRoom} />
}

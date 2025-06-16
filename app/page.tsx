"use client"

import { useState } from "react"
import { RoomEntry } from "@/components/room-entry"
import { PokerRoom } from "@/components/poker-room"
import type { Player } from "@/types/game"

export default function Home() {
  const [roomId, setRoomId] = useState<string>("")
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null)

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
  }

  if (!roomId || !currentPlayer) {
    return <RoomEntry onRoomEntry={handleRoomEntry} />
  }

  return <PokerRoom roomId={roomId} currentPlayer={currentPlayer} />
}

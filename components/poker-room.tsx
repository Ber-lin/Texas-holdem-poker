"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Crown, Users, Settings, Plus, DollarSign, MessageCircle, Play, RotateCcw } from "lucide-react"
import { useWebSocket } from "@/hooks/useWebSocket"
import { ChatPanel } from "@/components/chat-panel"
import type { Player } from "@/types/game"

interface PokerRoomProps {
  roomId: string
  currentPlayer: Player
}

export function PokerRoom({ roomId, currentPlayer }: PokerRoomProps) {
  const { isConnected, gameState, chatMessages, joinRoom, updateGameState, sendChatMessage, sendActionMessage } =
    useWebSocket(roomId)
  const [betAmount, setBetAmount] = useState("")
  const [rechargeAmount, setRechargeAmount] = useState("")
  const [selectedPlayerId, setSelectedPlayerId] = useState("")
  const [hasJoined, setHasJoined] = useState(false)

  // 加入房间
  useEffect(() => {
    if (!hasJoined && isConnected) {
      try {
        joinRoom(currentPlayer, gameState?.password || "")
        setHasJoined(true)
      } catch (error) {
        alert(error instanceof Error ? error.message : "加入房间失败")
      }
    }
  }, [isConnected, hasJoined, joinRoom, currentPlayer, gameState?.password])

  if (!gameState || !hasJoined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900 flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">{isConnected ? "正在加入房间..." : "正在连接..."}</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentPlayerInGame = gameState.players.find((p) => p.id === currentPlayer.id)
  if (!currentPlayerInGame) return null

  const updatePlayerChips = (playerId: string, amount: number) => {
    const updatedPlayers = gameState.players.map((player) =>
      player.id === playerId ? { ...player, chips: Math.max(0, player.chips + amount) } : player,
    )
    updateGameState({ ...gameState, players: updatedPlayers })
  }

  const handleBet = (amount: number) => {
    if (currentPlayerInGame.chips >= amount) {
      updatePlayerChips(currentPlayer.id, -amount)
      sendActionMessage(`下注 $${amount}`, currentPlayer.id, currentPlayer.name)
    }
  }

  const handleRecharge = () => {
    const amount = Number.parseInt(rechargeAmount)
    if (amount > 0 && selectedPlayerId) {
      updatePlayerChips(selectedPlayerId, amount)
      const targetPlayer = gameState.players.find((p) => p.id === selectedPlayerId)
      if (targetPlayer) {
        sendActionMessage(`Master 为 ${targetPlayer.name} 充值 $${amount}`, "system", "System")
      }
      setRechargeAmount("")
      setSelectedPlayerId("")
    }
  }

  const updateBaseAmount = (newBase: number) => {
    updateGameState({ ...gameState, baseAmount: newBase })
    sendActionMessage(`Master 设置 Base 为 $${newBase}`, "system", "System")
  }

  const startNewRound = () => {
    const newState = {
      ...gameState,
      currentRound: gameState.currentRound + 1,
      roundStarted: true,
      players: gameState.players.map((p) => ({ ...p, currentBet: 0, hasActed: false, isFolded: false })),
    }
    updateGameState(newState)
    sendActionMessage(`开始第 ${gameState.currentGame} 局第 ${gameState.currentRound + 1} 轮`, "system", "System")
  }

  const startNewGame = () => {
    const newState = {
      ...gameState,
      currentGame: gameState.currentGame + 1,
      currentRound: 1,
      gameStarted: true,
      roundStarted: true,
      pot: 0,
      players: gameState.players.map((p) => ({ ...p, currentBet: 0, hasActed: false, isFolded: false })),
    }
    updateGameState(newState)
    sendActionMessage(`开始第 ${gameState.currentGame + 1} 局游戏`, "system", "System")
  }

  const endCurrentRound = () => {
    const newState = {
      ...gameState,
      roundStarted: false,
      players: gameState.players.map((p) => ({ ...p, currentBet: 0, hasActed: false, isFolded: false })),
    }
    updateGameState(newState)
    sendActionMessage(`第 ${gameState.currentGame} 局第 ${gameState.currentRound} 轮结束`, "system", "System")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900 p-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-4 h-screen">
        {/* 左侧 - 玩家列表 */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              玩家列表 ({gameState.players.length})
            </CardTitle>
            <div className="text-sm text-muted-foreground">房间ID: {roomId}</div>
          </CardHeader>
          <CardContent className="space-y-3">
            {gameState.players.map((player) => (
              <div key={player.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  {player.isMaster && <Crown className="w-4 h-4 text-yellow-500" />}
                  <span className={`font-medium ${player.id === currentPlayer.id ? "text-green-600" : ""}`}>
                    {player.name}
                  </span>
                  {player.id === currentPlayer.id && <Badge variant="secondary">你</Badge>}
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="font-mono font-bold">{player.chips}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 中间 - 游戏区域 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-center">
              德州扑克 - 第 {gameState.currentGame} 局 第 {gameState.currentRound} 轮
            </CardTitle>
            <div className="flex justify-center gap-4">
              <Badge variant="outline" className="text-lg px-3 py-1">
                Base: ${gameState.baseAmount}
              </Badge>
              <Badge variant={gameState.roundStarted ? "default" : "secondary"}>
                {gameState.roundStarted ? "进行中" : "等待开始"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-6 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">你的筹码</div>
              <div className="text-3xl font-bold text-green-600">${currentPlayerInGame.chips}</div>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>快速下注</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleBet(gameState.baseAmount)}
                  disabled={currentPlayerInGame.chips < gameState.baseAmount || !gameState.roundStarted}
                >
                  小盲注 (${gameState.baseAmount})
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleBet(gameState.baseAmount * 2)}
                  disabled={currentPlayerInGame.chips < gameState.baseAmount * 2 || !gameState.roundStarted}
                >
                  大盲注 (${gameState.baseAmount * 2})
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleBet(gameState.baseAmount * 4)}
                  disabled={currentPlayerInGame.chips < gameState.baseAmount * 4 || !gameState.roundStarted}
                >
                  加注 (${gameState.baseAmount * 4})
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleBet(currentPlayerInGame.chips)}
                  disabled={currentPlayerInGame.chips === 0 || !gameState.roundStarted}
                >
                  All In
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customBet">自定义下注</Label>
              <div className="flex gap-2">
                <Input
                  id="customBet"
                  type="number"
                  placeholder="输入金额"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  disabled={!gameState.roundStarted}
                />
                <Button
                  onClick={() => {
                    const amount = Number.parseInt(betAmount)
                    if (amount > 0) {
                      handleBet(amount)
                      setBetAmount("")
                    }
                  }}
                  disabled={
                    !betAmount || Number.parseInt(betAmount) > currentPlayerInGame.chips || !gameState.roundStarted
                  }
                >
                  下注
                </Button>
              </div>
            </div>

            {/* 游戏统计 */}
            <Separator />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-muted-foreground">总玩家</div>
                <div className="font-bold">{gameState.players.length}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">总筹码</div>
                <div className="font-bold">${gameState.players.reduce((sum, p) => sum + p.chips, 0)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">平均筹码</div>
                <div className="font-bold">
                  ${Math.round(gameState.players.reduce((sum, p) => sum + p.chips, 0) / gameState.players.length)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 右侧 - 控制面板和聊天 */}
        <Card className="lg:col-span-1 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentPlayer.isMaster ? (
                <>
                  <Settings className="w-5 h-5" />
                  Master 控制面板
                </>
              ) : (
                <>
                  <MessageCircle className="w-5 h-5" />
                  游戏信息
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col space-y-4">
            {currentPlayer.isMaster && (
              <>
                <div className="space-y-3">
                  <Label>游戏控制</Label>

                  <div className="grid grid-cols-1 gap-2">
                    <Button onClick={startNewGame} className="w-full" size="sm">
                      <Play className="w-4 h-4 mr-2" />
                      开始新局
                    </Button>
                    <Button onClick={startNewRound} className="w-full" variant="outline" size="sm">
                      开始新轮
                    </Button>
                    <Button onClick={endCurrentRound} className="w-full" variant="outline" size="sm">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      结束当前轮
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="baseAmount">设置 Base 数</Label>
                  <Select
                    value={gameState.baseAmount.toString()}
                    onValueChange={(value) => updateBaseAmount(Number.parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">$5</SelectItem>
                      <SelectItem value="10">$10</SelectItem>
                      <SelectItem value="20">$20</SelectItem>
                      <SelectItem value="50">$50</SelectItem>
                      <SelectItem value="100">$100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      玩家充值
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>玩家充值</DialogTitle>
                      <DialogDescription>为玩家充值虚拟筹码</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>选择玩家</Label>
                        <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
                          <SelectTrigger>
                            <SelectValue placeholder="选择要充值的玩家" />
                          </SelectTrigger>
                          <SelectContent>
                            {gameState.players
                              .filter((p) => p.id !== currentPlayer.id)
                              .map((player) => (
                                <SelectItem key={player.id} value={player.id}>
                                  {player.name} (当前: ${player.chips})
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>充值金额</Label>
                        <Input
                          type="number"
                          placeholder="输入充值金额"
                          value={rechargeAmount}
                          onChange={(e) => setRechargeAmount(e.target.value)}
                        />
                      </div>
                      <Button onClick={handleRecharge} className="w-full">
                        确认充值
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Separator />
              </>
            )}

            {/* 聊天面板 */}
            <div className="flex-1">
              <ChatPanel
                messages={chatMessages}
                currentPlayer={currentPlayer}
                onSendMessage={(message) => sendChatMessage(message, currentPlayer.id, currentPlayer.name)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

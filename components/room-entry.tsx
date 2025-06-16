"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SpadeIcon as Spades } from "lucide-react"

interface RoomEntryProps {
  onRoomEntry: (playerName: string, password: string, isMaster: boolean, roomId: string) => void
}

export function RoomEntry({ onRoomEntry }: RoomEntryProps) {
  const [playerName, setPlayerName] = useState("")
  const [password, setPassword] = useState("")
  const [roomId, setRoomId] = useState("")

  const handleSubmit = (isMaster: boolean) => {
    if (!playerName.trim()) {
      alert("请输入玩家名称")
      return
    }
    if (!password.trim()) {
      alert("请输入房间密码")
      return
    }

    let finalRoomId = roomId.trim()
    if (isMaster) {
      // Master创建房间，使用时间戳作为房间ID
      finalRoomId = Date.now().toString()
    } else {
      // Guest加入房间，需要输入房间ID
      if (!finalRoomId) {
        alert("请输入房间ID")
        return
      }
    }

    onRoomEntry(playerName.trim(), password.trim(), isMaster, finalRoomId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Spades className="w-8 h-8 text-green-600" />
            <CardTitle className="text-2xl">德州扑克积分器</CardTitle>
          </div>
          <CardDescription>输入玩家名称和房间信息进入游戏</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="playerName">玩家名称</Label>
              <Input
                id="playerName"
                placeholder="输入你的名称"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
              />
            </div>

            <Tabs defaultValue="guest" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="guest">加入房间</TabsTrigger>
                <TabsTrigger value="master">创建房间</TabsTrigger>
              </TabsList>

              <TabsContent value="guest" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="guestRoomId">房间ID</Label>
                  <Input
                    id="guestRoomId"
                    placeholder="输入房间ID"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guestPassword">房间密码</Label>
                  <Input
                    id="guestPassword"
                    type="password"
                    placeholder="输入房间密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button onClick={() => handleSubmit(false)} className="w-full">
                  加入房间
                </Button>
              </TabsContent>

              <TabsContent value="master" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="masterPassword">设置房间密码</Label>
                  <Input
                    id="masterPassword"
                    type="password"
                    placeholder="设置房间密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button onClick={() => handleSubmit(true)} className="w-full bg-green-600 hover:bg-green-700">
                  创建房间 (Master)
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

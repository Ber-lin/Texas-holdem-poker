export interface Player {
  id: string
  name: string
  chips: number
  isMaster: boolean
  isActive: boolean
  currentBet: number
  hasActed: boolean
  isFolded: boolean
}

export interface GameState {
  id: string
  password: string
  baseAmount: number
  players: Player[]
  currentGame: number // 当前第几局
  currentRound: number // 当前局的第几轮
  gameStarted: boolean // 是否开始游戏
  roundStarted: boolean // 是否开始当前轮
  pot: number // 底池
  currentPlayerIndex: number // 当前行动玩家索引
  chatMessages: any[]
}

export interface RoundResult {
  roundNumber: number
  pot: number
  winner?: string
  playerActions: Array<{
    playerId: string
    playerName: string
    action: string
    amount: number
  }>
}

export interface PlayerAction {
  playerId: string
  playerName: string
  action: "bet" | "call" | "raise" | "fold" | "check" | "all-in"
  amount: number
  timestamp: number
}

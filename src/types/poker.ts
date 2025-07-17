export interface PokerAction {
  id: string
  playerId: string
  type: 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all-in'
  amount: number
  street: 'preflop' | 'flop' | 'turn' | 'river'
  timestamp: number
  stackBefore: number
  stackAfter: number
  totalInvested: number
}

export interface SidePot {
  id: string
  amount: number
  eligiblePlayers: string[]
  isMainPot: boolean
}

export interface GameState {
  street: 'preflop' | 'flop' | 'turn' | 'river'
  pot: number
  sidePots: SidePot[]
  currentBet: number
  minRaise: number
  lastRaiseAmount: number
  lastRaiserPosition: number
  actionPosition: number
  dealerPosition: number
  smallBlind: number
  bigBlind: number
  actions: PokerAction[]
  communityCards: string[]
  usedCards: string[]
}

export interface PlayerState {
  id: string
  name: string
  position: number
  startingStack: number
  currentStack: number
  totalInvested: number
  currentBet: number
  cards: [string, string] | null
  isActive: boolean
  hasActed: boolean
  isFolded: boolean
  isAllIn: boolean
  lastAction?: PokerAction
}

export interface BettingRules {
  minBet: number
  maxBet: number
  minRaise: number
  maxRaise: number
  canCheck: boolean
  canCall: boolean
  canBet: boolean
  canRaise: boolean
  canFold: boolean
  callAmount: number
}

export interface HandHistory {
  id: string
  title: string
  stakes: string
  gameState: GameState
  players: PlayerState[]
  startTime: number
  endTime?: number
  winner?: string[]
  showdown?: boolean
  notes?: string
}
import type { 
  GameState, 
  PlayerState, 
  PokerAction, 
  BettingRules, 
  SidePot 
} from '@/types/poker'

export class PokerEngine {
  private gameState: GameState
  private players: PlayerState[]

  constructor(gameState: GameState, players: PlayerState[]) {
    this.gameState = { ...gameState }
    this.players = [...players]
  }

  // Get current game state
  getGameState(): GameState {
    return { ...this.gameState }
  }

  getPlayers(): PlayerState[] {
    return [...this.players]
  }

  // Get betting rules for a specific player
  getBettingRules(playerId: string): BettingRules {
    const player = this.players.find(p => p.id === playerId)
    if (!player || player.isFolded || player.isAllIn) {
      return {
        minBet: 0,
        maxBet: 0,
        minRaise: 0,
        maxRaise: 0,
        canCheck: false,
        canCall: false,
        canBet: false,
        canRaise: false,
        canFold: false,
        callAmount: 0
      }
    }

    const callAmount = Math.max(0, this.gameState.currentBet - player.currentBet)
    const canCheck = callAmount === 0
    const canCall = callAmount > 0 && callAmount <= player.currentStack
    const canFold = this.gameState.currentBet > player.currentBet
    
    // Betting/Raising logic
    const minBet = this.gameState.currentBet === 0 ? this.gameState.bigBlind : 0
    const minRaiseAmount = Math.max(this.gameState.minRaise, this.gameState.lastRaiseAmount)
    const minRaise = this.gameState.currentBet + minRaiseAmount
    const maxRaise = player.currentStack + player.currentBet
    
    const canBet = this.gameState.currentBet === 0 && player.currentStack >= minBet
    const canRaise = this.gameState.currentBet > 0 && player.currentStack + player.currentBet >= minRaise

    return {
      minBet,
      maxBet: player.currentStack + player.currentBet,
      minRaise,
      maxRaise,
      canCheck,
      canCall,
      canBet,
      canRaise,
      canFold,
      callAmount
    }
  }

  // Execute a player action
  executeAction(playerId: string, actionType: string, amount: number = 0): PokerAction | null {
    const player = this.players.find(p => p.id === playerId)
    if (!player || player.isFolded || player.isAllIn) {
      return null
    }

    const rules = this.getBettingRules(playerId)
    const stackBefore = player.currentStack
    let actualAmount = amount

    // Validate and execute action
    switch (actionType) {
      case 'fold':
        if (!rules.canFold && this.gameState.currentBet === 0) return null
        player.isFolded = true
        player.isActive = false
        actualAmount = 0
        break

      case 'check':
        if (!rules.canCheck) return null
        actualAmount = 0
        break

      case 'call':
        if (!rules.canCall) return null
        actualAmount = Math.min(rules.callAmount, player.currentStack)
        break

      case 'bet':
        if (!rules.canBet) return null
        actualAmount = Math.max(rules.minBet, Math.min(amount, player.currentStack))
        this.gameState.currentBet = player.currentBet + actualAmount
        this.gameState.minRaise = actualAmount
        this.gameState.lastRaiseAmount = actualAmount
        this.gameState.lastRaiserPosition = player.position
        break

      case 'raise': {
        if (!rules.canRaise) return null
        const totalBet = Math.max(rules.minRaise, Math.min(amount, player.currentStack + player.currentBet))
        actualAmount = totalBet - player.currentBet
        const raiseAmount = totalBet - this.gameState.currentBet
        this.gameState.currentBet = totalBet
        this.gameState.minRaise = Math.max(this.gameState.bigBlind, raiseAmount)
        this.gameState.lastRaiseAmount = raiseAmount
        this.gameState.lastRaiserPosition = player.position
        break
      }

      case 'all-in':
        actualAmount = player.currentStack
        if (player.currentBet + actualAmount > this.gameState.currentBet) {
          // All-in is a raise
          const totalBet = player.currentBet + actualAmount
          const raiseAmount = totalBet - this.gameState.currentBet
          this.gameState.currentBet = totalBet
          this.gameState.lastRaiseAmount = raiseAmount
          this.gameState.lastRaiserPosition = player.position
        }
        player.isAllIn = true
        break

      default:
        return null
    }

    // Update player state
    player.currentStack -= actualAmount
    player.currentBet += actualAmount
    player.totalInvested += actualAmount
    player.hasActed = true

    // Create action record
    const action: PokerAction = {
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      playerId,
      type: actionType as any,
      amount: actualAmount,
      street: this.gameState.street,
      timestamp: Date.now(),
      stackBefore,
      stackAfter: player.currentStack,
      totalInvested: player.totalInvested
    }

    this.gameState.actions.push(action)
    player.lastAction = action

    // Update pot
    this.updatePot()

    // Check if betting round is complete
    if (this.isBettingRoundComplete()) {
      this.completeBettingRound()
    }

    return action
  }

  // Update pot and handle side pots
  private updatePot(): void {
    const totalInvested = this.players.reduce((sum, p) => sum + p.totalInvested, 0)
    this.gameState.pot = totalInvested
    this.calculateSidePots()
  }

  // Calculate side pots for all-in situations
  private calculateSidePots(): void {
    const activePlayers = this.players.filter(p => !p.isFolded)
    if (activePlayers.length <= 1) return

    // Get all unique investment levels
    const investmentLevels = [...new Set(activePlayers.map(p => p.totalInvested))]
      .sort((a, b) => a - b)

    this.gameState.sidePots = []
    let previousLevel = 0

    investmentLevels.forEach((level, index) => {
      const potAmount = (level - previousLevel) * activePlayers.filter(p => p.totalInvested >= level).length
      
      if (potAmount > 0) {
        const eligiblePlayers = activePlayers
          .filter(p => p.totalInvested >= level)
          .map(p => p.id)

        this.gameState.sidePots.push({
          id: `pot_${index}`,
          amount: potAmount,
          eligiblePlayers,
          isMainPot: index === 0
        })
      }

      previousLevel = level
    })
  }

  // Check if betting round is complete
  private isBettingRoundComplete(): boolean {
    const activePlayers = this.players.filter(p => !p.isFolded && !p.isAllIn)
    
    if (activePlayers.length <= 1) return true

    // All active players must have acted and have equal bets
    const allActed = activePlayers.every(p => p.hasActed)
    const equalBets = activePlayers.every(p => p.currentBet === this.gameState.currentBet)

    return allActed && equalBets
  }

  // Complete betting round and move to next street
  private completeBettingRound(): void {
    // Reset for next street
    this.players.forEach(p => {
      p.hasActed = false
      p.currentBet = 0
    })

    this.gameState.currentBet = 0
    this.gameState.minRaise = this.gameState.bigBlind
    this.gameState.lastRaiseAmount = 0

    // Move to next street
    switch (this.gameState.street) {
      case 'preflop':
        this.gameState.street = 'flop'
        break
      case 'flop':
        this.gameState.street = 'turn'
        break
      case 'turn':
        this.gameState.street = 'river'
        break
      case 'river':
        // Hand is complete
        break
    }

    // Set action to first active player after dealer
    this.setActionToFirstActivePlayer()
  }

  // Set action to first active player after dealer
  private setActionToFirstActivePlayer(): void {
    const activePlayers = this.players.filter(p => !p.isFolded && !p.isAllIn)
    if (activePlayers.length === 0) return

    // Find first active player after dealer
    const sortedByPosition = activePlayers.sort((a, b) => {
      const aPos = (a.position - this.gameState.dealerPosition + 9) % 9
      const bPos = (b.position - this.gameState.dealerPosition + 9) % 9
      return aPos - bPos
    })

    this.gameState.actionPosition = sortedByPosition[0].position
  }

  // Move action to next player
  moveActionToNextPlayer(): void {
    const activePlayers = this.players.filter(p => !p.isFolded && !p.isAllIn && p.hasActed === false)
    if (activePlayers.length === 0) return

    const currentPlayerIndex = activePlayers.findIndex(p => p.position === this.gameState.actionPosition)
    const nextPlayerIndex = (currentPlayerIndex + 1) % activePlayers.length
    this.gameState.actionPosition = activePlayers[nextPlayerIndex].position
  }

  // Get next active player
  getActivePlayer(): PlayerState | null {
    return this.players.find(p => p.position === this.gameState.actionPosition) || null
  }

  // Check if hand is complete
  isHandComplete(): boolean {
    const activePlayers = this.players.filter(p => !p.isFolded)
    return activePlayers.length <= 1 || this.gameState.street === 'river' && this.isBettingRoundComplete()
  }

  // Get hand summary
  getHandSummary() {
    const totalPot = this.gameState.pot
    const activePlayers = this.players.filter(p => !p.isFolded)
    const allInPlayers = this.players.filter(p => p.isAllIn)
    
    return {
      totalPot,
      activePlayers: activePlayers.length,
      allInPlayers: allInPlayers.length,
      sidePots: this.gameState.sidePots,
      street: this.gameState.street,
      isComplete: this.isHandComplete()
    }
  }
}
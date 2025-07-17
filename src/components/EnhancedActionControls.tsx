import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { PokerEngine } from '@/utils/pokerEngine'
import type { BettingRules, PlayerState, GameState } from '@/types/poker'

export interface EnhancedActionControlsProps {
  gameState: GameState
  players: PlayerState[]
  activePlayerId: string
  onAction: (playerId: string, action: string, amount?: number) => void
}

export function EnhancedActionControls({ 
  gameState, 
  players, 
  activePlayerId, 
  onAction 
}: EnhancedActionControlsProps) {
  const [raiseAmount, setRaiseAmount] = useState(0)
  const [customAmount, setCustomAmount] = useState('')
  const [rules, setRules] = useState<BettingRules | null>(null)

  const engine = useMemo(() => new PokerEngine(gameState, players), [gameState, players])
  const activePlayer = players.find(p => p.id === activePlayerId)

  useEffect(() => {
    if (activePlayer) {
      const bettingRules = engine.getBettingRules(activePlayerId)
      setRules(bettingRules)
      setRaiseAmount(bettingRules.minRaise)
    }
  }, [activePlayer, activePlayerId, engine])

  if (!activePlayer || !rules) {
    return null
  }

  const handleAction = (action: string, amount?: number) => {
    onAction(activePlayerId, action, amount)
  }

  const handleSliderChange = (value: number[]) => {
    setRaiseAmount(value[0])
    setCustomAmount('')
  }

  const handleCustomAmountSet = () => {
    const amount = parseInt(customAmount)
    if (amount >= rules.minRaise && amount <= rules.maxRaise) {
      setRaiseAmount(amount)
    }
  }

  const potSizeRaise = gameState.pot
  const halfPotRaise = Math.floor(gameState.pot * 0.5) + gameState.currentBet
  const threeFourthsPotRaise = Math.floor(gameState.pot * 0.75) + gameState.currentBet
  const fullPotRaise = gameState.pot + gameState.currentBet

  return (
    <Card className="bg-black/95 border-gray-600 p-4 min-w-[450px] shadow-2xl">
      <div className="space-y-4">
        {/* Player Info */}
        <div className="text-center">
          <div className="text-white font-bold text-lg">{activePlayer.name}</div>
          <div className="text-gray-300 text-sm">
            Stack: ${activePlayer.currentStack.toLocaleString()} | 
            Invested: ${activePlayer.totalInvested.toLocaleString()}
          </div>
          {gameState.sidePots.length > 0 && (
            <div className="text-yellow-400 text-xs mt-1">
              Side pots active
            </div>
          )}
        </div>

        <Separator />

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-2">
          {rules.canFold && (
            <Button 
              variant="destructive" 
              onClick={() => handleAction('fold')}
              className="h-12"
            >
              Fold
            </Button>
          )}
          
          {rules.canCheck && (
            <Button 
              variant="secondary" 
              onClick={() => handleAction('check')}
              className="h-12"
            >
              Check
            </Button>
          )}
          
          {rules.canCall && (
            <Button 
              variant="default" 
              onClick={() => handleAction('call', rules.callAmount)}
              className="h-12 bg-blue-600 hover:bg-blue-700"
            >
              Call ${rules.callAmount.toLocaleString()}
            </Button>
          )}
        </div>

        {/* Betting/Raising Section */}
        {(rules.canBet || rules.canRaise) && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-white text-sm font-medium">
                {rules.canBet ? 'Bet' : 'Raise'} Amount: ${raiseAmount.toLocaleString()}
              </div>
              <Button 
                variant="default" 
                onClick={() => handleAction(rules.canBet ? 'bet' : 'raise', raiseAmount)}
                className="bg-red-600 hover:bg-red-700"
                disabled={raiseAmount > activePlayer.currentStack + activePlayer.currentBet}
              >
                {rules.canBet ? 'Bet' : 'Raise'} ${raiseAmount.toLocaleString()}
              </Button>
            </div>
            
            {/* Slider */}
            <Slider
              value={[raiseAmount]}
              onValueChange={handleSliderChange}
              min={rules.canBet ? rules.minBet : rules.minRaise}
              max={rules.canBet ? rules.maxBet : rules.maxRaise}
              step={Math.max(1, Math.floor((rules.maxRaise - rules.minRaise) / 100))}
              className="w-full"
            />
            
            {/* Quick Bet Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {gameState.pot > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRaiseAmount(Math.min(halfPotRaise, rules.maxRaise))}
                    className="text-xs"
                    disabled={halfPotRaise < rules.minRaise}
                  >
                    1/2 Pot
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRaiseAmount(Math.min(threeFourthsPotRaise, rules.maxRaise))}
                    className="text-xs"
                    disabled={threeFourthsPotRaise < rules.minRaise}
                  >
                    3/4 Pot
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRaiseAmount(Math.min(fullPotRaise, rules.maxRaise))}
                    className="text-xs"
                    disabled={fullPotRaise < rules.minRaise}
                  >
                    Pot
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction('all-in', activePlayer.currentStack)}
                className="text-xs bg-purple-600 hover:bg-purple-700 text-white"
              >
                All-In
              </Button>
            </div>

            {/* Custom Amount Input */}
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Custom amount"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                min={rules.canBet ? rules.minBet : rules.minRaise}
                max={rules.canBet ? rules.maxBet : rules.maxRaise}
                className="flex-1 bg-gray-800 border-gray-600 text-white"
              />
              <Button
                variant="outline"
                onClick={handleCustomAmountSet}
                disabled={
                  !customAmount || 
                  parseInt(customAmount) < (rules.canBet ? rules.minBet : rules.minRaise) || 
                  parseInt(customAmount) > (rules.canBet ? rules.maxBet : rules.maxRaise)
                }
              >
                Set
              </Button>
            </div>

            {/* Betting Constraints */}
            <div className="text-gray-400 text-xs space-y-1">
              <div className="flex justify-between">
                <span>Min {rules.canBet ? 'Bet' : 'Raise'}:</span>
                <span>${(rules.canBet ? rules.minBet : rules.minRaise).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Max {rules.canBet ? 'Bet' : 'Raise'}:</span>
                <span>${(rules.canBet ? rules.maxBet : rules.maxRaise).toLocaleString()}</span>
              </div>
              {gameState.pot > 0 && (
                <div className="flex justify-between">
                  <span>Current Pot:</span>
                  <span>${gameState.pot.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Game State Info */}
        <Separator />
        <div className="text-gray-400 text-xs space-y-1">
          <div className="flex justify-between">
            <span>Street:</span>
            <Badge variant="secondary" className="text-xs">
              {gameState.street.toUpperCase()}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>Current Bet:</span>
            <span>${gameState.currentBet.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Last Raise:</span>
            <span>${gameState.lastRaiseAmount.toLocaleString()}</span>
          </div>
          {gameState.sidePots.length > 0 && (
            <div className="mt-2">
              <div className="text-yellow-400 text-xs font-medium">Side Pots:</div>
              {gameState.sidePots.map((pot, index) => (
                <div key={pot.id} className="flex justify-between text-xs">
                  <span>{pot.isMainPot ? 'Main' : `Side ${index}`}:</span>
                  <span>${pot.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PlayingCard } from './PlayingCard'
import { PlayerSeat } from './PlayerSeat'
import { ActionControls } from './ActionControls'

export interface Player {
  id: string
  name: string
  position: number
  stack: number
  cards?: [string, string]
  isActive: boolean
  hasActed: boolean
  currentBet: number
  action?: 'fold' | 'call' | 'raise' | 'check' | 'all-in'
}

export interface PokerTableProps {
  players: Player[]
  communityCards: string[]
  pot: number
  currentBet: number
  activePlayer?: string
  dealerPosition: number
  onPlayerAction?: (playerId: string, action: string, amount?: number) => void
  isReplaying?: boolean
  replayStep?: number
}

export function PokerTable({
  players,
  communityCards,
  pot,
  currentBet,
  activePlayer,
  dealerPosition,
  onPlayerAction,
  isReplaying = false,
  replayStep = 0
}: PokerTableProps) {
  const [selectedAction, setSelectedAction] = useState<string>('')

  // Position players around the table (9-max layout)
  const seatPositions = [
    { top: '10%', left: '50%', transform: 'translateX(-50%)' }, // UTG
    { top: '20%', left: '75%', transform: 'translateX(-50%)' }, // UTG+1
    { top: '40%', left: '85%', transform: 'translateX(-50%)' }, // MP
    { top: '65%', left: '75%', transform: 'translateX(-50%)' }, // MP+1
    { bottom: '10%', left: '50%', transform: 'translateX(-50%)' }, // CO
    { top: '65%', left: '25%', transform: 'translateX(-50%)' }, // BTN
    { top: '40%', left: '15%', transform: 'translateX(-50%)' }, // SB
    { top: '20%', left: '25%', transform: 'translateX(-50%)' }, // BB
    { top: '10%', left: '35%', transform: 'translateX(-50%)' }, // UTG+2
  ]

  return (
    <div className="relative w-full h-[600px] bg-gradient-to-br from-green-800 to-green-900 rounded-3xl border-8 border-amber-600 shadow-2xl overflow-hidden">
      {/* Felt texture overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-700/20 via-transparent to-green-900/40" />
      
      {/* Table rail */}
      <div className="absolute inset-4 rounded-2xl border-4 border-amber-700 bg-gradient-to-br from-amber-800 to-amber-900 shadow-inner">
        <div className="absolute inset-2 rounded-xl bg-gradient-to-br from-green-700 to-green-800 shadow-inner">
          
          {/* Center area with community cards and pot */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            {/* Community Cards */}
            <div className="flex gap-2 mb-4 justify-center">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="relative">
                  {communityCards[index] ? (
                    <PlayingCard 
                      card={communityCards[index]} 
                      className={`transition-all duration-500 ${
                        replayStep > index + 1 ? 'opacity-100 scale-100' : 'opacity-50 scale-95'
                      }`}
                    />
                  ) : (
                    <div className="w-12 h-16 bg-gray-600 border border-gray-500 rounded-lg flex items-center justify-center">
                      <div className="w-8 h-10 bg-gray-700 rounded border border-gray-600" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Pot */}
            <Card className="bg-amber-900/80 border-amber-600 px-4 py-2">
              <div className="text-amber-100 font-bold text-lg">
                Pot: ${pot.toLocaleString()}
              </div>
              {currentBet > 0 && (
                <div className="text-amber-200 text-sm">
                  Current Bet: ${currentBet.toLocaleString()}
                </div>
              )}
            </Card>
          </div>

          {/* Player Seats */}
          {players.map((player, index) => {
            const position = seatPositions[player.position] || seatPositions[index]
            const isDealer = player.position === dealerPosition
            const isActiveNow = player.id === activePlayer
            
            return (
              <div
                key={player.id}
                className="absolute"
                style={position}
              >
                <PlayerSeat
                  player={player}
                  isDealer={isDealer}
                  isActive={isActiveNow}
                  isReplaying={isReplaying}
                  onAction={onPlayerAction}
                />
              </div>
            )
          })}

          {/* Action Controls (bottom center for active player) */}
          {!isReplaying && activePlayer && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <ActionControls
                currentBet={currentBet}
                playerStack={players.find(p => p.id === activePlayer)?.stack || 0}
                onAction={(action, amount) => onPlayerAction?.(activePlayer, action, amount)}
              />
            </div>
          )}

          {/* Replay Controls */}
          {isReplaying && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
              <Card className="bg-black/80 border-gray-600 px-4 py-2">
                <div className="flex items-center gap-4">
                  <Badge variant="secondary">Replay Mode</Badge>
                  <div className="text-white text-sm">
                    Step {replayStep} of Hand
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PlayingCard } from './PlayingCard'
import { cn } from '@/lib/utils'
import type { Player } from './PokerTable'

export interface PlayerSeatProps {
  player: Player
  isDealer: boolean
  isActive: boolean
  isReplaying?: boolean
  onAction?: (playerId: string, action: string, amount?: number) => void
}

export function PlayerSeat({ 
  player, 
  isDealer, 
  isActive, 
  isReplaying = false 
}: PlayerSeatProps) {
  const positionNames = [
    'UTG', 'UTG+1', 'UTG+2', 'MP', 'MP+1', 'CO', 'BTN', 'SB', 'BB'
  ]

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Player Cards */}
      {player.cards && (
        <div className="flex gap-1 mb-2">
          <PlayingCard 
            card={player.cards[0]} 
            size="sm"
            faceDown={!isReplaying && player.id !== 'hero'}
            className="transform -rotate-6"
          />
          <PlayingCard 
            card={player.cards[1]} 
            size="sm"
            faceDown={!isReplaying && player.id !== 'hero'}
            className="transform rotate-6"
          />
        </div>
      )}

      {/* Player Info Card */}
      <Card className={cn(
        'relative px-3 py-2 min-w-[120px] text-center transition-all duration-300',
        isActive && 'ring-2 ring-accent shadow-lg scale-105',
        player.action === 'fold' && 'opacity-50 grayscale',
        'bg-gray-800/90 border-gray-600'
      )}>
        {/* Dealer Button */}
        {isDealer && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-white border-2 border-gray-800 rounded-full flex items-center justify-center text-xs font-bold">
            D
          </div>
        )}

        {/* Player Name & Position */}
        <div className="text-white font-semibold text-sm">
          {player.name}
        </div>
        <div className="text-gray-300 text-xs">
          {positionNames[player.position] || `Seat ${player.position + 1}`}
        </div>

        {/* Stack */}
        <div className="text-green-400 font-bold text-sm mt-1">
          ${player.stack.toLocaleString()}
        </div>

        {/* Current Bet */}
        {player.currentBet > 0 && (
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
            <Badge variant="secondary" className="bg-amber-600 text-white">
              ${player.currentBet.toLocaleString()}
            </Badge>
          </div>
        )}

        {/* Action Badge */}
        {player.action && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
            <Badge 
              variant={
                player.action === 'fold' ? 'destructive' :
                player.action === 'raise' || player.action === 'all-in' ? 'default' :
                'secondary'
              }
              className={cn(
                player.action === 'raise' && 'bg-red-600',
                player.action === 'call' && 'bg-blue-600',
                player.action === 'check' && 'bg-green-600',
                player.action === 'all-in' && 'bg-purple-600 animate-pulse'
              )}
            >
              {player.action.toUpperCase()}
            </Badge>
          </div>
        )}

        {/* Active Player Indicator */}
        {isActive && (
          <div className="absolute inset-0 rounded-lg border-2 border-accent animate-pulse" />
        )}
      </Card>
    </div>
  )
}
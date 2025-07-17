import { cn } from '@/lib/utils'

export interface PlayingCardProps {
  card: string // Format: "As", "Kh", "Qd", "Jc", etc.
  className?: string
  size?: 'sm' | 'md' | 'lg'
  faceDown?: boolean
}

export function PlayingCard({ card, className, size = 'md', faceDown = false }: PlayingCardProps) {
  if (faceDown) {
    return (
      <div className={cn(
        'bg-gradient-to-br from-blue-900 to-blue-800 border-2 border-blue-700 rounded-lg flex items-center justify-center shadow-lg',
        size === 'sm' && 'w-8 h-11',
        size === 'md' && 'w-12 h-16',
        size === 'lg' && 'w-16 h-22',
        className
      )}>
        <div className="text-blue-300 text-xs font-bold transform rotate-12">♠</div>
      </div>
    )
  }

  const rank = card.slice(0, -1)
  const suit = card.slice(-1)
  
  const suitSymbols = {
    's': '♠',
    'h': '♥',
    'd': '♦',
    'c': '♣'
  }
  
  const suitColors = {
    's': 'text-black',
    'h': 'text-red-600',
    'd': 'text-red-600',
    'c': 'text-black'
  }

  const symbol = suitSymbols[suit as keyof typeof suitSymbols] || '?'
  const color = suitColors[suit as keyof typeof suitColors] || 'text-black'

  return (
    <div className={cn(
      'bg-white border-2 border-gray-300 rounded-lg flex flex-col items-center justify-between p-1 shadow-lg font-bold',
      size === 'sm' && 'w-8 h-11 text-xs',
      size === 'md' && 'w-12 h-16 text-sm',
      size === 'lg' && 'w-16 h-22 text-lg',
      className
    )}>
      <div className={cn('leading-none', color)}>
        <div>{rank}</div>
        <div className="text-center">{symbol}</div>
      </div>
      <div className={cn('transform rotate-180 leading-none', color)}>
        <div>{rank}</div>
        <div className="text-center">{symbol}</div>
      </div>
    </div>
  )
}
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlayingCard } from './PlayingCard'
import { cn } from '@/lib/utils'

export interface CardPickerProps {
  selectedCards: string[]
  onCardSelect: (card: string) => void
  onCardDeselect: (card: string) => void
  usedCards?: string[] // Cards already used elsewhere
  maxCards?: number
  title?: string
}

export function CardPicker({ 
  selectedCards, 
  onCardSelect, 
  onCardDeselect, 
  usedCards = [], 
  maxCards = 2,
  title = "Select Cards"
}: CardPickerProps) {
  const [selectedSuit, setSelectedSuit] = useState<string | null>(null)
  
  const suits = [
    { symbol: '♠', name: 'spades', code: 's', color: 'text-black' },
    { symbol: '♥', name: 'hearts', code: 'h', color: 'text-red-600' },
    { symbol: '♦', name: 'diamonds', code: 'd', color: 'text-red-600' },
    { symbol: '♣', name: 'clubs', code: 'c', color: 'text-black' }
  ]
  
  const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2']
  
  const isCardUsed = (card: string) => usedCards.includes(card)
  const isCardSelected = (card: string) => selectedCards.includes(card)
  const canSelectMore = selectedCards.length < maxCards
  
  const handleCardClick = (card: string) => {
    if (isCardUsed(card)) return
    
    if (isCardSelected(card)) {
      onCardDeselect(card)
    } else if (canSelectMore) {
      onCardSelect(card)
    }
  }
  
  const clearSelection = () => {
    selectedCards.forEach(card => onCardDeselect(card))
  }

  return (
    <Card className="p-4 bg-gray-800/50 border-gray-600">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">{title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">
            {selectedCards.length}/{maxCards}
          </span>
          {selectedCards.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearSelection}
              className="text-xs"
            >
              Clear
            </Button>
          )}
        </div>
      </div>
      
      {/* Selected Cards Display */}
      {selectedCards.length > 0 && (
        <div className="flex gap-2 mb-4 p-2 bg-gray-900/50 rounded-lg">
          {selectedCards.map((card, index) => (
            <div key={index} className="relative">
              <PlayingCard card={card} size="sm" />
              <Button
                variant="destructive"
                size="sm"
                className="absolute -top-1 -right-1 w-4 h-4 p-0 rounded-full text-xs"
                onClick={() => onCardDeselect(card)}
              >
                ×
              </Button>
            </div>
          ))}
        </div>
      )}
      
      {/* Suit Filter */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={selectedSuit === null ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedSuit(null)}
          className="text-xs"
        >
          All
        </Button>
        {suits.map((suit) => (
          <Button
            key={suit.code}
            variant={selectedSuit === suit.code ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedSuit(suit.code)}
            className={cn("text-lg", suit.color)}
          >
            {suit.symbol}
          </Button>
        ))}
      </div>
      
      {/* Card Grid */}
      <div className="grid grid-cols-13 gap-1">
        {ranks.map((rank) => 
          suits
            .filter(suit => selectedSuit === null || suit.code === selectedSuit)
            .map((suit) => {
              const card = rank + suit.code
              const used = isCardUsed(card)
              const selected = isCardSelected(card)
              const disabled = used || (!selected && !canSelectMore)
              
              return (
                <button
                  key={card}
                  onClick={() => handleCardClick(card)}
                  disabled={disabled}
                  className={cn(
                    "relative w-8 h-11 text-xs font-bold rounded border-2 transition-all duration-200",
                    "flex flex-col items-center justify-between p-0.5",
                    selected && "ring-2 ring-accent scale-110 z-10",
                    used && "opacity-30 cursor-not-allowed bg-gray-600",
                    !used && !selected && "bg-white hover:bg-gray-100 border-gray-300 hover:scale-105",
                    !used && !selected && disabled && "opacity-50 cursor-not-allowed",
                    suit.color
                  )}
                >
                  <div className="leading-none">
                    <div>{rank}</div>
                    <div className="text-center">{suit.symbol}</div>
                  </div>
                  <div className="transform rotate-180 leading-none">
                    <div>{rank}</div>
                    <div className="text-center">{suit.symbol}</div>
                  </div>
                  
                  {used && (
                    <div className="absolute inset-0 flex items-center justify-center bg-red-500/20 rounded">
                      <span className="text-red-600 font-bold text-lg">×</span>
                    </div>
                  )}
                </button>
              )
            })
        )}
      </div>
      
      {!canSelectMore && (
        <div className="text-center text-gray-400 text-sm mt-2">
          Maximum cards selected
        </div>
      )}
    </Card>
  )
}
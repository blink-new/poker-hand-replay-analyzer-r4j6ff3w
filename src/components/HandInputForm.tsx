import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { X, Plus } from 'lucide-react'
import { CardPicker } from './CardPicker'
import type { PlayerState, GameState } from '@/types/poker'

export interface HandData {
  id: string
  title: string
  stakes: string
  gameState: GameState
  players: PlayerState[]
  notes?: string
}

export interface HandInputFormProps {
  onSave: (hand: HandData) => void
  onCancel: () => void
  initialData?: Partial<HandData>
}

export function HandInputForm({ onSave, onCancel, initialData }: HandInputFormProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [stakes, setStakes] = useState(initialData?.stakes || '$1/$2')
  const [players, setPlayers] = useState<PlayerState[]>(initialData?.players || [
    {
      id: 'hero',
      name: 'Hero',
      position: 6, // BTN
      startingStack: 200,
      currentStack: 200,
      totalInvested: 0,
      currentBet: 0,
      cards: null,
      isActive: false,
      hasActed: false,
      isFolded: false,
      isAllIn: false
    },
    {
      id: 'villain1',
      name: 'Villain 1',
      position: 7, // SB
      startingStack: 180,
      currentStack: 180,
      totalInvested: 0,
      currentBet: 0,
      cards: null,
      isActive: false,
      hasActed: false,
      isFolded: false,
      isAllIn: false
    }
  ])
  const [communityCards, setCommunityCards] = useState<string[]>([])
  const [notes, setNotes] = useState(initialData?.notes || '')
  const [selectedPlayerForCards, setSelectedPlayerForCards] = useState<string | null>(null)

  const positions = ['UTG', 'UTG+1', 'UTG+2', 'MP', 'MP+1', 'CO', 'BTN', 'SB', 'BB']
  
  // Get all used cards to prevent duplicates
  const usedCards = useMemo(() => {
    const cards: string[] = []
    players.forEach(player => {
      if (player.cards) {
        cards.push(...player.cards)
      }
    })
    cards.push(...communityCards)
    return cards
  }, [players, communityCards])

  const addPlayer = () => {
    const newPlayer: PlayerState = {
      id: `player_${Date.now()}`,
      name: `Player ${players.length + 1}`,
      position: players.length,
      startingStack: 200,
      currentStack: 200,
      totalInvested: 0,
      currentBet: 0,
      cards: null,
      isActive: false,
      hasActed: false,
      isFolded: false,
      isAllIn: false
    }
    setPlayers([...players, newPlayer])
  }

  const removePlayer = (playerId: string) => {
    setPlayers(players.filter(p => p.id !== playerId))
    if (selectedPlayerForCards === playerId) {
      setSelectedPlayerForCards(null)
    }
  }

  const updatePlayer = (playerId: string, field: keyof PlayerState, value: any) => {
    setPlayers(players.map(p => 
      p.id === playerId ? { ...p, [field]: value } : p
    ))
  }

  const handlePlayerCardSelect = (playerId: string, card: string) => {
    const player = players.find(p => p.id === playerId)
    if (!player) return

    const currentCards = player.cards || [null, null] as [string | null, string | null]
    
    // Find first empty slot
    if (currentCards[0] === null) {
      currentCards[0] = card
    } else if (currentCards[1] === null) {
      currentCards[1] = card
    }

    updatePlayer(playerId, 'cards', currentCards[0] && currentCards[1] ? [currentCards[0], currentCards[1]] : null)
  }

  const handlePlayerCardDeselect = (playerId: string, card: string) => {
    const player = players.find(p => p.id === playerId)
    if (!player || !player.cards) return

    const newCards = player.cards.filter(c => c !== card)
    updatePlayer(playerId, 'cards', newCards.length === 2 ? [newCards[0], newCards[1]] : null)
  }

  const handleCommunityCardSelect = (card: string) => {
    if (communityCards.length < 5) {
      setCommunityCards([...communityCards, card])
    }
  }

  const handleCommunityCardDeselect = (card: string) => {
    setCommunityCards(communityCards.filter(c => c !== card))
  }

  const handleSave = () => {
    // Parse stakes to get blinds
    const stakesMatch = stakes.match(/\$(\d+(?:\.\d+)?)\s*\/\s*\$(\d+(?:\.\d+)?)/)
    const smallBlind = stakesMatch ? parseFloat(stakesMatch[1]) : 1
    const bigBlind = stakesMatch ? parseFloat(stakesMatch[2]) : 2

    const gameState: GameState = {
      street: 'preflop',
      pot: 0,
      sidePots: [],
      currentBet: 0,
      minRaise: bigBlind,
      lastRaiseAmount: 0,
      lastRaiserPosition: -1,
      actionPosition: 0, // UTG
      dealerPosition: players.find(p => p.position === 6)?.position || 6, // BTN
      smallBlind,
      bigBlind,
      actions: [],
      communityCards,
      usedCards
    }

    const handData: HandData = {
      id: Date.now().toString(),
      title: title || `${stakes} Hand`,
      stakes,
      gameState,
      players,
      notes
    }
    onSave(handData)
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4 text-white">Hand Setup</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <Label htmlFor="title" className="text-white">Hand Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., AA vs KK All-in"
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
          <div>
            <Label htmlFor="stakes" className="text-white">Stakes</Label>
            <Select value={stakes} onValueChange={setStakes}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="$0.25/$0.50">$0.25/$0.50</SelectItem>
                <SelectItem value="$0.50/$1">$0.50/$1</SelectItem>
                <SelectItem value="$1/$2">$1/$2</SelectItem>
                <SelectItem value="$2/$5">$2/$5</SelectItem>
                <SelectItem value="$5/$10">$5/$10</SelectItem>
                <SelectItem value="$10/$25">$10/$25</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="players" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="players">Players ({players.length}/9)</TabsTrigger>
            <TabsTrigger value="cards">Cards</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="players" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-white">Player Setup</Label>
              <Button 
                onClick={addPlayer} 
                disabled={players.length >= 9}
                size="sm"
                className="bg-accent hover:bg-accent/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Player
              </Button>
            </div>
            
            <div className="space-y-3">
              {players.map((player) => (
                <Card key={player.id} className="p-4 bg-gray-800/50 border-gray-600">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 grid grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs text-gray-300">Name</Label>
                        <Input
                          value={player.name}
                          onChange={(e) => updatePlayer(player.id, 'name', e.target.value)}
                          placeholder="Player name"
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-300">Position</Label>
                        <Select 
                          value={player.position.toString()} 
                          onValueChange={(value) => updatePlayer(player.id, 'position', parseInt(value))}
                        >
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {positions.map((pos, i) => (
                              <SelectItem key={i} value={i.toString()}>{pos}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-300">Stack ($)</Label>
                        <Input
                          type="number"
                          value={player.startingStack}
                          onChange={(e) => {
                            const stack = parseInt(e.target.value) || 0
                            updatePlayer(player.id, 'startingStack', stack)
                            updatePlayer(player.id, 'currentStack', stack)
                          }}
                          placeholder="200"
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-xs text-gray-300">Cards</div>
                      <div className="flex gap-1">
                        {player.cards ? (
                          player.cards.map((card, i) => (
                            <div key={i} className="relative">
                              <div className="w-8 h-11 bg-white rounded border text-xs flex items-center justify-center font-bold">
                                {card}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="flex gap-1">
                            <div className="w-8 h-11 bg-gray-600 rounded border border-gray-500" />
                            <div className="w-8 h-11 bg-gray-600 rounded border border-gray-500" />
                          </div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPlayerForCards(player.id)}
                        className="text-xs"
                      >
                        Set Cards
                      </Button>
                    </div>
                    
                    {players.length > 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePlayer(player.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="cards" className="space-y-4">
            {selectedPlayerForCards && (
              <CardPicker
                title={`Select cards for ${players.find(p => p.id === selectedPlayerForCards)?.name}`}
                selectedCards={players.find(p => p.id === selectedPlayerForCards)?.cards || []}
                onCardSelect={(card) => handlePlayerCardSelect(selectedPlayerForCards, card)}
                onCardDeselect={(card) => handlePlayerCardDeselect(selectedPlayerForCards, card)}
                usedCards={usedCards.filter(card => 
                  !players.find(p => p.id === selectedPlayerForCards)?.cards?.includes(card)
                )}
                maxCards={2}
              />
            )}
            
            <CardPicker
              title="Community Cards (Board)"
              selectedCards={communityCards}
              onCardSelect={handleCommunityCardSelect}
              onCardDeselect={handleCommunityCardDeselect}
              usedCards={usedCards.filter(card => !communityCards.includes(card))}
              maxCards={5}
            />
            
            {!selectedPlayerForCards && (
              <div className="text-center text-gray-400 py-8">
                <p>Select a player from the Players tab to set their hole cards</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="notes" className="space-y-4">
            <div>
              <Label htmlFor="notes" className="text-white">Hand Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this hand..."
                rows={6}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-3 mt-6">
          <Button onClick={handleSave} className="flex-1 bg-accent hover:bg-accent/90">
            Create Hand
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  )
}
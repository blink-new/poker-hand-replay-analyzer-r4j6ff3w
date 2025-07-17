import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

export interface HandData {
  id: string
  title: string
  stakes: string
  players: Array<{
    name: string
    position: number
    stack: number
    cards?: [string, string]
  }>
  actions: Array<{
    player: string
    action: string
    amount?: number
    street: 'preflop' | 'flop' | 'turn' | 'river'
  }>
  communityCards: {
    flop: [string, string, string]
    turn: string
    river: string
  }
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
  const [players, setPlayers] = useState(initialData?.players || [
    { name: 'Hero', position: 0, stack: 200, cards: ['As', 'Kh'] },
    { name: 'Villain', position: 1, stack: 180 }
  ])
  const [notes, setNotes] = useState(initialData?.notes || '')

  const positions = ['UTG', 'UTG+1', 'UTG+2', 'MP', 'MP+1', 'CO', 'BTN', 'SB', 'BB']
  const suits = ['s', 'h', 'd', 'c']
  const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2']

  const addPlayer = () => {
    setPlayers([...players, {
      name: `Player ${players.length + 1}`,
      position: players.length,
      stack: 200
    }])
  }

  const removePlayer = (index: number) => {
    setPlayers(players.filter((_, i) => i !== index))
  }

  const updatePlayer = (index: number, field: string, value: any) => {
    const updated = [...players]
    updated[index] = { ...updated[index], [field]: value }
    setPlayers(updated)
  }

  const handleSave = () => {
    const handData: HandData = {
      id: Date.now().toString(),
      title: title || `${stakes} Hand`,
      stakes,
      players,
      actions: [],
      communityCards: {
        flop: ['', '', ''],
        turn: '',
        river: ''
      },
      notes
    }
    onSave(handData)
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Hand Setup</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <Label htmlFor="title">Hand Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., AA vs KK All-in"
            />
          </div>
          <div>
            <Label htmlFor="stakes">Stakes</Label>
            <Select value={stakes} onValueChange={setStakes}>
              <SelectTrigger>
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

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Label>Players ({players.length}/9)</Label>
            <Button 
              onClick={addPlayer} 
              disabled={players.length >= 9}
              size="sm"
            >
              Add Player
            </Button>
          </div>
          
          <div className="space-y-3">
            {players.map((player, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 grid grid-cols-4 gap-3">
                    <div>
                      <Label className="text-xs">Name</Label>
                      <Input
                        value={player.name}
                        onChange={(e) => updatePlayer(index, 'name', e.target.value)}
                        placeholder="Player name"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Position</Label>
                      <Select 
                        value={player.position.toString()} 
                        onValueChange={(value) => updatePlayer(index, 'position', parseInt(value))}
                      >
                        <SelectTrigger>
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
                      <Label className="text-xs">Stack ($)</Label>
                      <Input
                        type="number"
                        value={player.stack}
                        onChange={(e) => updatePlayer(index, 'stack', parseInt(e.target.value) || 0)}
                        placeholder="200"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Hole Cards</Label>
                      <div className="flex gap-1">
                        <Select 
                          value={player.cards?.[0] || ''} 
                          onValueChange={(value) => {
                            const cards = player.cards || ['', '']
                            cards[0] = value
                            updatePlayer(index, 'cards', cards)
                          }}
                        >
                          <SelectTrigger className="w-16">
                            <SelectValue placeholder="?" />
                          </SelectTrigger>
                          <SelectContent>
                            {ranks.map(rank => 
                              suits.map(suit => (
                                <SelectItem key={rank + suit} value={rank + suit}>
                                  {rank + suit}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <Select 
                          value={player.cards?.[1] || ''} 
                          onValueChange={(value) => {
                            const cards = player.cards || ['', '']
                            cards[1] = value
                            updatePlayer(index, 'cards', cards)
                          }}
                        >
                          <SelectTrigger className="w-16">
                            <SelectValue placeholder="?" />
                          </SelectTrigger>
                          <SelectContent>
                            {ranks.map(rank => 
                              suits.map(suit => (
                                <SelectItem key={rank + suit} value={rank + suit}>
                                  {rank + suit}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  {players.length > 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePlayer(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this hand..."
            rows={3}
          />
        </div>

        <div className="flex gap-3">
          <Button onClick={handleSave} className="flex-1">
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
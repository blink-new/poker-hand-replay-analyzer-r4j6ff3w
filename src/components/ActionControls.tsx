import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'

export interface ActionControlsProps {
  currentBet: number
  playerStack: number
  onAction: (action: string, amount?: number) => void
}

export function ActionControls({ currentBet, playerStack, onAction }: ActionControlsProps) {
  const [raiseAmount, setRaiseAmount] = useState(currentBet * 2)
  const [customAmount, setCustomAmount] = useState('')

  const minRaise = Math.max(currentBet * 2, 1)
  const maxRaise = playerStack

  const handleRaise = () => {
    const amount = customAmount ? parseInt(customAmount) : raiseAmount
    if (amount >= minRaise && amount <= maxRaise) {
      onAction('raise', amount)
    }
  }

  const handleSliderChange = (value: number[]) => {
    setRaiseAmount(value[0])
    setCustomAmount('')
  }

  return (
    <Card className="bg-black/90 border-gray-600 p-4 min-w-[400px]">
      <div className="space-y-4">
        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button 
            variant="destructive" 
            onClick={() => onAction('fold')}
            className="flex-1"
          >
            Fold
          </Button>
          
          {currentBet === 0 ? (
            <Button 
              variant="secondary" 
              onClick={() => onAction('check')}
              className="flex-1"
            >
              Check
            </Button>
          ) : (
            <Button 
              variant="default" 
              onClick={() => onAction('call', currentBet)}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Call ${currentBet.toLocaleString()}
            </Button>
          )}
          
          <Button 
            variant="default" 
            onClick={handleRaise}
            className="flex-1 bg-red-600 hover:bg-red-700"
            disabled={raiseAmount > playerStack}
          >
            {currentBet === 0 ? 'Bet' : 'Raise'} ${raiseAmount.toLocaleString()}
          </Button>
        </div>

        {/* Raise Controls */}
        <div className="space-y-3">
          <div className="text-white text-sm font-medium">
            Raise Amount: ${raiseAmount.toLocaleString()}
          </div>
          
          {/* Slider */}
          <Slider
            value={[raiseAmount]}
            onValueChange={handleSliderChange}
            min={minRaise}
            max={maxRaise}
            step={Math.max(1, Math.floor(maxRaise / 100))}
            className="w-full"
          />
          
          {/* Quick Bet Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRaiseAmount(Math.floor(maxRaise * 0.25))}
              className="flex-1"
            >
              1/4 Pot
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRaiseAmount(Math.floor(maxRaise * 0.5))}
              className="flex-1"
            >
              1/2 Pot
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRaiseAmount(Math.floor(maxRaise * 0.75))}
              className="flex-1"
            >
              3/4 Pot
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAction('all-in', playerStack)}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
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
              min={minRaise}
              max={maxRaise}
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={() => {
                const amount = parseInt(customAmount)
                if (amount >= minRaise && amount <= maxRaise) {
                  setRaiseAmount(amount)
                }
              }}
              disabled={!customAmount || parseInt(customAmount) < minRaise || parseInt(customAmount) > maxRaise}
            >
              Set
            </Button>
          </div>

          <div className="text-gray-400 text-xs text-center">
            Min: ${minRaise.toLocaleString()} | Max: ${maxRaise.toLocaleString()}
          </div>
        </div>
      </div>
    </Card>
  )
}
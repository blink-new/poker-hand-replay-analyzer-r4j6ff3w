import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PokerTable, type Player } from '@/components/PokerTable'
import { HandInputForm, type HandData } from '@/components/HandInputForm'
import { Play, Pause, SkipForward, SkipBack, Plus, Library, BarChart3 } from 'lucide-react'

function App() {
  const [currentView, setCurrentView] = useState<'table' | 'input' | 'library'>('table')
  const [hands, setHands] = useState<HandData[]>([])
  const [currentHand, setCurrentHand] = useState<HandData | null>(null)
  const [isReplaying, setIsReplaying] = useState(false)
  const [replayStep, setReplayStep] = useState(0)

  // Sample data for demonstration
  const samplePlayers: Player[] = [
    {
      id: 'hero',
      name: 'Hero (You)',
      position: 6, // BTN
      stack: 200,
      cards: ['As', 'Kh'],
      isActive: false,
      hasActed: false,
      currentBet: 0
    },
    {
      id: 'villain1',
      name: 'TightAggro',
      position: 7, // SB
      stack: 180,
      isActive: false,
      hasActed: false,
      currentBet: 1
    },
    {
      id: 'villain2',
      name: 'FishyMcFish',
      position: 8, // BB
      stack: 150,
      isActive: true,
      hasActed: false,
      currentBet: 2
    },
    {
      id: 'villain3',
      name: 'RockSolid',
      position: 0, // UTG
      stack: 220,
      isActive: false,
      hasActed: false,
      currentBet: 0
    }
  ]

  const sampleCommunityCards = ['Ah', 'Kd', 'Qc']

  const handleNewHand = () => {
    setCurrentView('input')
  }

  const handleSaveHand = (hand: HandData) => {
    setHands([...hands, hand])
    setCurrentHand(hand)
    setCurrentView('table')
  }

  const handlePlayerAction = (playerId: string, action: string, amount?: number) => {
    console.log(`Player ${playerId} ${action}${amount ? ` $${amount}` : ''}`)
    // Here you would update the game state
  }

  const startReplay = () => {
    setIsReplaying(true)
    setReplayStep(0)
  }

  const stopReplay = () => {
    setIsReplaying(false)
    setReplayStep(0)
  }

  const nextStep = () => {
    setReplayStep(prev => prev + 1)
  }

  const prevStep = () => {
    setReplayStep(prev => Math.max(0, prev - 1))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-gray-700 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-white">
                🃏 Poker Hand Analyzer
              </h1>
              <Badge variant="secondary" className="bg-green-600 text-white">
                Pro Edition
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={currentView === 'table' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('table')}
                size="sm"
              >
                <Play className="w-4 h-4 mr-2" />
                Table
              </Button>
              <Button
                variant={currentView === 'library' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('library')}
                size="sm"
              >
                <Library className="w-4 h-4 mr-2" />
                Library ({hands.length})
              </Button>
              <Button
                onClick={handleNewHand}
                className="bg-accent hover:bg-accent/90"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Hand
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {currentView === 'input' && (
          <HandInputForm
            onSave={handleSaveHand}
            onCancel={() => setCurrentView('table')}
          />
        )}

        {currentView === 'library' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Hand Library</h2>
              <Button onClick={handleNewHand} className="bg-accent hover:bg-accent/90">
                <Plus className="w-4 h-4 mr-2" />
                New Hand
              </Button>
            </div>
            
            {hands.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <Library className="w-12 h-12 mx-auto mb-2" />
                  No hands saved yet
                </div>
                <Button onClick={handleNewHand} className="bg-accent hover:bg-accent/90">
                  Create Your First Hand
                </Button>
              </Card>
            ) : (
              <div className="grid gap-4">
                {hands.map((hand) => (
                  <Card key={hand.id} className="p-4 hover:bg-gray-800/50 cursor-pointer transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white">{hand.title}</h3>
                        <p className="text-gray-400 text-sm">{hand.stakes} • {hand.players.length} players</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setCurrentHand(hand)
                            setCurrentView('table')
                          }}
                        >
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {currentView === 'table' && (
          <div className="space-y-6">
            {/* Replay Controls */}
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-semibold text-white">
                    {currentHand?.title || 'Live Table'}
                  </h2>
                  {currentHand && (
                    <Badge variant="secondary">
                      {currentHand.stakes}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {!isReplaying ? (
                    <Button onClick={startReplay} size="sm">
                      <Play className="w-4 h-4 mr-2" />
                      Start Replay
                    </Button>
                  ) : (
                    <>
                      <Button onClick={prevStep} size="sm" variant="outline">
                        <SkipBack className="w-4 h-4" />
                      </Button>
                      <Button onClick={stopReplay} size="sm" variant="outline">
                        <Pause className="w-4 h-4" />
                      </Button>
                      <Button onClick={nextStep} size="sm" variant="outline">
                        <SkipForward className="w-4 h-4" />
                      </Button>
                      <Badge variant="secondary" className="ml-2">
                        Step {replayStep}
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </Card>

            {/* Poker Table */}
            <PokerTable
              players={samplePlayers}
              communityCards={sampleCommunityCards}
              pot={15}
              currentBet={2}
              activePlayer={isReplaying ? undefined : 'villain2'}
              dealerPosition={6}
              onPlayerAction={handlePlayerAction}
              isReplaying={isReplaying}
              replayStep={replayStep}
            />

            {/* Hand Analysis Panel */}
            <Tabs defaultValue="actions" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="actions">Action History</TabsTrigger>
                <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
                <TabsTrigger value="stats">Statistics</TabsTrigger>
              </TabsList>
              
              <TabsContent value="actions" className="space-y-4">
                <Card className="p-4">
                  <h3 className="font-semibold mb-3 text-white">Action Timeline</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Preflop:</span>
                      <span className="text-white">SB posts $1, BB posts $2</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">UTG:</span>
                      <span className="text-white">RockSolid folds</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">BTN:</span>
                      <span className="text-accent font-medium">Hero raises to $6</span>
                    </div>
                  </div>
                </Card>
              </TabsContent>
              
              <TabsContent value="analysis" className="space-y-4">
                <Card className="p-4">
                  <h3 className="font-semibold mb-3 text-white">AI Analysis</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-green-900/30 border border-green-700 rounded">
                      <div className="text-green-400 font-medium mb-1">✓ Good Play</div>
                      <div className="text-sm text-gray-300">
                        Raising AK from the button is standard. Good sizing at 3x.
                      </div>
                    </div>
                    <div className="p-3 bg-yellow-900/30 border border-yellow-700 rounded">
                      <div className="text-yellow-400 font-medium mb-1">⚠ Consider</div>
                      <div className="text-sm text-gray-300">
                        Against tight players, you could size up to 3.5x for more value.
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>
              
              <TabsContent value="stats" className="space-y-4">
                <Card className="p-4">
                  <h3 className="font-semibold mb-3 text-white">Hand Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-gray-400 text-sm">Pot Size</div>
                      <div className="text-white font-bold">$15</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">Effective Stack</div>
                      <div className="text-white font-bold">150 BB</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">Your Equity</div>
                      <div className="text-green-400 font-bold">68%</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">Pot Odds</div>
                      <div className="text-white font-bold">3:1</div>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
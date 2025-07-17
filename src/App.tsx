import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PokerTable, type Player } from '@/components/PokerTable'
import { HandInputForm, type HandData } from '@/components/HandInputForm'
import { EnhancedActionControls } from '@/components/EnhancedActionControls'
import { PokerEngine } from '@/utils/pokerEngine'
import { Play, Pause, SkipForward, SkipBack, Plus, Library, BarChart3 } from 'lucide-react'
import type { PlayerState, GameState } from '@/types/poker'

function App() {
  const [currentView, setCurrentView] = useState<'table' | 'input' | 'library'>('table')
  const [hands, setHands] = useState<HandData[]>([])
  const [currentHand, setCurrentHand] = useState<HandData | null>(null)
  const [isReplaying, setIsReplaying] = useState(false)
  const [replayStep, setReplayStep] = useState(0)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [players, setPlayers] = useState<PlayerState[]>([])
  const [pokerEngine, setPokerEngine] = useState<PokerEngine | null>(null)

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
    setGameState(hand.gameState)
    setPlayers(hand.players)
    setPokerEngine(new PokerEngine(hand.gameState, hand.players))
    setCurrentView('table')
  }

  const handlePlayerAction = (playerId: string, action: string, amount?: number) => {
    if (!pokerEngine || !gameState) return

    const actionResult = pokerEngine.executeAction(playerId, action, amount)
    if (actionResult) {
      // Update state with new game state and players
      const newGameState = pokerEngine.getGameState()
      const newPlayers = pokerEngine.getPlayers()
      
      setGameState(newGameState)
      setPlayers(newPlayers)
      
      // Move to next player if betting round isn't complete
      if (!pokerEngine.isHandComplete()) {
        pokerEngine.moveActionToNextPlayer()
        setGameState(pokerEngine.getGameState())
      }
      
      console.log(`${playerId} ${action}${amount ? ` ${amount}` : ''}`, actionResult)
    }
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
            {gameState && players.length > 0 ? (
              <div className="space-y-4">
                <PokerTable
                  players={players.map(p => ({
                    id: p.id,
                    name: p.name,
                    position: p.position,
                    stack: p.currentStack,
                    cards: p.cards,
                    isActive: p.position === gameState.actionPosition && !isReplaying,
                    hasActed: p.hasActed,
                    currentBet: p.currentBet,
                    action: p.lastAction?.type
                  }))}
                  communityCards={gameState.communityCards}
                  pot={gameState.pot}
                  currentBet={gameState.currentBet}
                  activePlayer={isReplaying ? undefined : players.find(p => p.position === gameState.actionPosition)?.id}
                  dealerPosition={gameState.dealerPosition}
                  onPlayerAction={handlePlayerAction}
                  isReplaying={isReplaying}
                  replayStep={replayStep}
                />
                
                {/* Enhanced Action Controls */}
                {!isReplaying && gameState && players.length > 0 && (
                  <div className="flex justify-center">
                    <EnhancedActionControls
                      gameState={gameState}
                      players={players}
                      activePlayerId={players.find(p => p.position === gameState.actionPosition)?.id || ''}
                      onAction={handlePlayerAction}
                    />
                  </div>
                )}
              </div>
            ) : (
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
            )}

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
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {gameState?.actions.length ? (
                      gameState.actions.map((action, index) => {
                        const player = players.find(p => p.id === action.playerId)
                        const actionText = action.type === 'fold' ? 'folds' :
                                         action.type === 'check' ? 'checks' :
                                         action.type === 'call' ? `calls ${action.amount}` :
                                         action.type === 'bet' ? `bets ${action.amount}` :
                                         action.type === 'raise' ? `raises to ${action.amount + (player?.currentBet || 0)}` :
                                         action.type === 'all-in' ? `goes all-in for ${action.amount}` :
                                         action.type
                        
                        return (
                          <div key={action.id} className="flex justify-between text-sm">
                            <span className="text-gray-400">
                              {action.street.charAt(0).toUpperCase() + action.street.slice(1)}:
                            </span>
                            <span className={`${action.playerId.includes('hero') ? 'text-accent font-medium' : 'text-white'}`}>
                              {player?.name} {actionText}
                            </span>
                          </div>
                        )
                      })
                    ) : (
                      <div className="text-gray-400 text-sm text-center py-4">
                        No actions yet. Create a hand to start tracking actions.
                      </div>
                    )}
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
                      <div className="text-white font-bold">${gameState?.pot.toLocaleString() || '0'}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">Current Bet</div>
                      <div className="text-white font-bold">${gameState?.currentBet.toLocaleString() || '0'}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">Active Players</div>
                      <div className="text-green-400 font-bold">
                        {players.filter(p => !p.isFolded).length}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">All-In Players</div>
                      <div className="text-white font-bold">
                        {players.filter(p => p.isAllIn).length}
                      </div>
                    </div>
                    {gameState?.sidePots.length > 0 && (
                      <>
                        <div>
                          <div className="text-gray-400 text-sm">Side Pots</div>
                          <div className="text-yellow-400 font-bold">{gameState.sidePots.length}</div>
                        </div>
                        <div>
                          <div className="text-gray-400 text-sm">Total Side Pot</div>
                          <div className="text-yellow-400 font-bold">
                            ${gameState.sidePots.reduce((sum, pot) => sum + pot.amount, 0).toLocaleString()}
                          </div>
                        </div>
                      </>
                    )}
                    <div>
                      <div className="text-gray-400 text-sm">Street</div>
                      <div className="text-white font-bold">
                        {gameState?.street.charAt(0).toUpperCase() + (gameState?.street.slice(1) || '')}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">Actions Taken</div>
                      <div className="text-white font-bold">{gameState?.actions.length || 0}</div>
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
import { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { useGameState } from '@/hooks/useGameState';
import { GameHeader } from '@/components/GameHeader';
import { GameBoard } from '@/components/GameBoard';
import { AIAnalysisPanel } from '@/components/AIAnalysisPanel';
import { GameStatusBar } from '@/components/GameStatusBar';
import { PINEntryModal } from '@/components/PINEntryModal';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Game() {
  const { gameId } = useParams<{ gameId: string }>();
  const [showPINModal, setShowPINModal] = useState(false);
  const [sessionStartTime] = useState(Date.now());
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false);
  const { toast } = useToast();

  const { 
    gameData, 
    gameState, 
    aiAnalysis, 
    isLoading, 
    rollDice, 
    requestAIAnalysis, 
    executeAIMove 
  } = useGameState(gameId || null);

  const [sessionTime, setSessionTime] = useState('0h 0m 0s');

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - sessionStartTime;
      const hours = Math.floor(elapsed / 3600000);
      const minutes = Math.floor((elapsed % 3600000) / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);
      setSessionTime(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStartTime]);

  const handleJoinGame = async (team: string) => {
    if (!gameId || !gameData) return;

    try {
      await apiRequest('POST', `/api/games/${gameId}/join`, {
        userId: 1, // TODO: Get from auth context
        team
      });

      toast({
        title: "Joined Game",
        description: `You joined as ${team} team!`,
      });
    } catch (error) {
      toast({
        title: "Failed to Join",
        description: "Could not join the game",
        variant: "destructive",
      });
    }
  };

  const handleClaimAI = async () => {
    if (!gameId) return;

    try {
      await apiRequest('POST', `/api/games/${gameId}/claim-ai`, {
        teamPosition: 1 // TODO: Get current player's team position
      });

      toast({
        title: "AI Claimed",
        description: "You now have access to AI analysis!",
      });
    } catch (error) {
      toast({
        title: "AI Already Claimed",
        description: "Another team has already claimed the AI",
        variant: "destructive",
      });
    }
  };

  const handleRequestAI = () => {
    setIsAIAnalyzing(true);
    requestAIAnalysis();
    
    // Simulate analysis completion
    setTimeout(() => {
      setIsAIAnalyzing(false);
    }, 3000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-game-primary text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-game-accent mx-auto mb-4"></div>
          <p className="text-xl">Loading game...</p>
        </div>
      </div>
    );
  }

  if (!gameData) {
    return (
      <div className="min-h-screen bg-game-primary text-white flex items-center justify-center">
        <Card className="bg-game-secondary border-game-accent">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-16 w-16 text-game-accent mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Game Not Found</h2>
            <p className="text-gray-400">The game you're looking for doesn't exist.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { game, players } = gameData;
  const isDeathMode = game.mode === 'death';
  const currentPlayer = players[gameState?.currentPlayer || 0];
  const gameStats = {
    totalMoves: game.currentMove,
    remainingMoves: game.maxMoves - game.currentMove,
    gameDuration: sessionTime
  };

  // Show join interface if not enough players
  if (players.length < 4) {
    const availableTeams = ['red', 'blue', 'green', 'yellow'].filter(
      team => !players.some(p => p.team === team)
    );

    return (
      <div className="min-h-screen bg-game-primary text-white">
        <GameHeader 
          gameId={game.gameId}
          currentMove={game.currentMove}
          maxMoves={game.maxMoves}
          isDeathMode={isDeathMode}
        />
        
        <div className="flex-1 flex items-center justify-center p-8">
          <Card className="bg-game-secondary border-game-accent max-w-2xl w-full">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <Users className="h-16 w-16 text-game-accent mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-2">Waiting for Players</h2>
                <p className="text-gray-400">
                  {players.length}/4 players joined
                </p>
                {isDeathMode && (
                  <Badge variant="destructive" className="bg-game-accent mt-2">
                    DEATH MODE - NO ESCAPE ONCE STARTED
                  </Badge>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Choose Your Team:</h3>
                <div className="grid grid-cols-2 gap-4">
                  {availableTeams.map(team => (
                    <Button
                      key={team}
                      onClick={() => handleJoinGame(team)}
                      className={`p-4 text-lg font-semibold capitalize ${
                        team === 'red' ? 'bg-red-600 hover:bg-red-700' :
                        team === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
                        team === 'green' ? 'bg-green-600 hover:bg-green-700' :
                        'bg-yellow-600 hover:bg-yellow-700'
                      }`}
                    >
                      {team} Team
                    </Button>
                  ))}
                </div>
              </div>

              <div className="mt-8 p-4 bg-game-primary rounded-lg">
                <h4 className="font-semibold mb-2">Current Players:</h4>
                <div className="space-y-2">
                  {players.map(player => (
                    <div key={player.id} className="flex items-center space-x-2">
                      <div className={`w-4 h-4 rounded-full ${
                        player.team === 'red' ? 'bg-red-500' :
                        player.team === 'blue' ? 'bg-blue-500' :
                        player.team === 'green' ? 'bg-green-500' :
                        'bg-yellow-500'
                      }`}></div>
                      <span className="capitalize">{player.team} Team</span>
                      {player.isAI && (
                        <Badge variant="secondary" className="text-xs">AI</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-game-primary text-white flex flex-col">
      <GameHeader 
        gameId={game.gameId}
        currentMove={game.currentMove}
        maxMoves={game.maxMoves}
        isDeathMode={isDeathMode}
      />
      
      <div className="flex-1 flex">
        <GameBoard 
          gameState={gameState}
          onRollDice={rollDice}
          onRequestAI={handleRequestAI}
          currentPlayer={currentPlayer?.team || 'Unknown'}
          isAIAnalyzing={isAIAnalyzing}
        />
        
        <AIAnalysisPanel 
          aiAnalysis={aiAnalysis}
          aiOwner={game.aiOwner ? `Team ${game.aiOwner}` : null}
          gameStats={gameStats}
          isDeathMode={isDeathMode}
          onEscapeAttempt={() => setShowPINModal(true)}
        />
      </div>
      
      <GameStatusBar 
        playerCount={players.length}
        sessionTime={sessionTime}
        pointsAtRisk={isDeathMode ? "10^-10" : "Normal"}
        isDeathMode={isDeathMode}
        aiStatus={game.aiOwner ? 'active' : 'inactive'}
      />

      <PINEntryModal 
        isOpen={showPINModal}
        onClose={() => setShowPINModal(false)}
        gameId={game.gameId}
        userId={1} // TODO: Get from auth context
      />

      {/* AI Claim Button */}
      {!game.aiOwner && (
        <div className="fixed bottom-20 right-6">
          <Button 
            onClick={handleClaimAI}
            className="bg-game-warning hover:bg-yellow-600 text-black font-semibold px-6 py-3"
          >
            Claim AI Analysis
          </Button>
        </div>
      )}
    </div>
  );
}

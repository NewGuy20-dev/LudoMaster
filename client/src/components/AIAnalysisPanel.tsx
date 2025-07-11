import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Home, AlertTriangle } from "lucide-react";

interface AIAnalysis {
  winProbabilities: {
    red: number;
    blue: number;
    green: number;
    yellow: number;
  };
  recommendations: Array<{
    move: string;
    score: number;
    description: string;
    risk: 'low' | 'medium' | 'high';
  }>;
  bestMove: {
    move: string;
    score: number;
    description: string;
    risk: 'low' | 'medium' | 'high';
  };
  calculationsPerformed: number;
}

interface AIAnalysisPanelProps {
  aiAnalysis: AIAnalysis | null;
  aiOwner: string | null;
  gameStats: {
    totalMoves: number;
    remainingMoves: number;
    gameDuration: string;
  };
  isDeathMode: boolean;
  onEscapeAttempt: () => void;
}

export function AIAnalysisPanel({ 
  aiAnalysis, 
  aiOwner, 
  gameStats, 
  isDeathMode, 
  onEscapeAttempt 
}: AIAnalysisPanelProps) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-900 border-green-500';
      case 'medium': return 'bg-yellow-900 border-yellow-500';
      case 'high': return 'bg-red-900 border-red-500';
      default: return 'bg-gray-900 border-gray-500';
    }
  };

  const getRiskTextColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="w-96 p-6 bg-game-secondary border-l border-game-accent">
      <div className="space-y-6">
        {/* AI Status */}
        <Card className="bg-game-primary border-game-accent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold">AI Analysis</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-green-400">ACTIVE</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-400 space-y-1">
              <p>Claimed by: <span className="text-white font-semibold">{aiOwner || 'Unclaimed'}</span></p>
              <p>Analysis Depth: <span className="text-white font-semibold">Complete Game Tree</span></p>
            </div>
          </CardContent>
        </Card>

        {/* Win Probability */}
        <Card className="bg-game-primary border-game-accent">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Win Probability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {aiAnalysis?.winProbabilities && Object.entries(aiAnalysis.winProbabilities).map(([team, probability]) => (
                <div key={team} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className={`text-${team}-400 capitalize`}>{team} Team</span>
                    <span className="font-bold">{probability}%</span>
                  </div>
                  <Progress 
                    value={probability} 
                    className="h-2"
                    style={{ 
                      backgroundColor: 'rgb(55, 65, 81)',
                    }}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Move Recommendations */}
        <Card className="bg-game-primary border-game-accent">
          <CardHeader>
            <CardTitle className="text-lg font-bold">AI Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {aiAnalysis?.bestMove && (
                <div className={`${getRiskColor(aiAnalysis.bestMove.risk)} border rounded-lg p-3`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`${getRiskTextColor(aiAnalysis.bestMove.risk)} font-semibold`}>
                      Best Move
                    </span>
                    <span className={`${getRiskTextColor(aiAnalysis.bestMove.risk)} font-bold`}>
                      +{aiAnalysis.bestMove.score}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">{aiAnalysis.bestMove.description}</p>
                </div>
              )}
              
              {aiAnalysis?.recommendations.slice(0, 2).map((rec, index) => (
                <div key={index} className={`${getRiskColor(rec.risk)} border rounded-lg p-3`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`${getRiskTextColor(rec.risk)} font-semibold`}>
                      {index === 0 ? 'Alternative' : 'Risky'}
                    </span>
                    <span className={`${getRiskTextColor(rec.risk)} font-bold`}>
                      {rec.score > 0 ? '+' : ''}{rec.score}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">{rec.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Game Statistics */}
        <Card className="bg-game-primary border-game-accent">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Game Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Moves:</span>
                <span className="font-semibold">{gameStats.totalMoves}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Remaining:</span>
                <span className="font-semibold text-game-accent">{gameStats.remainingMoves}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">AI Calculations:</span>
                <span className="font-semibold">{(aiAnalysis?.calculationsPerformed || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Game Duration:</span>
                <span className="font-semibold">{gameStats.gameDuration}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Controls */}
        {isDeathMode && (
          <Card className="bg-red-900 border-red-500">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-red-400">Emergency Controls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  onClick={onEscapeAttempt}
                  className="w-full bg-red-700 hover:bg-red-800 text-white"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go to House (PIN Required)
                </Button>
                <p className="text-xs text-gray-400">
                  <AlertTriangle className="inline mr-1 h-3 w-3" />
                  Only available escape method. Requires physical presence at designated location.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

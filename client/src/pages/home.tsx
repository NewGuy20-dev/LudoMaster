import { useState } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skull, Play, Users, AlertTriangle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [gameId, setGameId] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const createGame = async (mode: 'standard' | 'death') => {
    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/games', {
        gameId: `${mode.toUpperCase()}-${Date.now()}`,
        ownerId: 1, // TODO: Get from auth context
        mode,
        maxMoves: mode === 'death' ? 2000 : 1000,
      });

      const game = await response.json();
      toast({
        title: "Game Created",
        description: `${mode === 'death' ? 'Death Mode' : 'Standard'} game created successfully!`,
      });
      
      // Redirect to game
      window.location.href = `/game/${game.game.gameId}`;
    } catch (error) {
      toast({
        title: "Failed to Create Game",
        description: "There was an error creating the game",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const joinGame = () => {
    if (!gameId.trim()) {
      toast({
        title: "Invalid Game ID",
        description: "Please enter a valid game ID",
        variant: "destructive",
      });
      return;
    }
    
    window.location.href = `/game/${gameId}`;
  };

  return (
    <div className="min-h-screen bg-game-primary text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <Skull className="text-game-accent text-6xl" />
            <h1 className="text-6xl font-bold text-game-accent">LUDO</h1>
          </div>
          <p className="text-xl text-gray-400">AI-Powered Psychological Warfare</p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Standard Mode */}
          <Card className="bg-game-secondary border-game-accent">
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center space-x-2">
                <Play className="text-green-400" />
                <span>Standard Mode</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-green-400">Features:</h3>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Traditional Ludo gameplay</li>
                    <li>• 2-4 players</li>
                    <li>• Normal point rewards</li>
                    <li>• Can quit anytime</li>
                    <li>• No AI assistance</li>
                  </ul>
                </div>
                <Button 
                  onClick={() => createGame('standard')}
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Create Standard Game
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Death Mode */}
          <Card className="bg-game-secondary border-game-accent">
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center space-x-2">
                <Skull className="text-game-accent" />
                <span>Death Mode</span>
                <Badge variant="destructive" className="bg-game-accent">
                  EXTREME
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert className="bg-red-900 border-red-500">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-red-200">
                    <strong>WARNING:</strong> Death Mode is irreversible. Players cannot quit once started.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-game-accent">Features:</h3>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• High-stakes competitive mode</li>
                    <li>• AI analysis available</li>
                    <li>• Cannot quit once started</li>
                    <li>• Extreme rewards and penalties</li>
                    <li>• Psychological warfare elements</li>
                    <li>• Account deletion powers</li>
                  </ul>
                </div>
                
                <Button 
                  onClick={() => createGame('death')}
                  disabled={isLoading}
                  className="w-full bg-game-accent hover:bg-red-700"
                >
                  <Skull className="mr-2 h-4 w-4" />
                  Create Death Mode Game
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Join Game */}
        <Card className="bg-game-secondary border-game-accent max-w-md mx-auto mt-8">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center space-x-2">
              <Users className="text-blue-400" />
              <span>Join Existing Game</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="gameId" className="text-gray-400">Game ID</Label>
                <Input
                  id="gameId"
                  value={gameId}
                  onChange={(e) => setGameId(e.target.value)}
                  placeholder="Enter game ID"
                  className="bg-game-primary border-gray-600 text-white"
                />
              </div>
              <Button 
                onClick={joinGame}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Join Game
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

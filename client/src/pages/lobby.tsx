import { useParams, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skull, AlertTriangle, Users, Brain, Clock, Shield } from "lucide-react";

export default function Lobby() {
  const { gameId } = useParams() as { gameId: string };
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [userId, setUserId] = useState<number | null>(null);

  const { data: gameData, isLoading, refetch } = useQuery({
    queryKey: ["/api/games", gameId],
    enabled: !!gameId,
    refetchInterval: 2000,
  });

  const joinGameMutation = useMutation({
    mutationFn: async (data: { gameId: string; userId: number; playerIndex: number; color: string }) => {
      const response = await apiRequest("POST", `/api/games/${gameId}/join`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Joined Game",
        description: "You have successfully joined the game.",
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Join Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const claimAIMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/games/${gameId}/claim-ai`, { userId });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "AI Claimed",
        description: "You now have access to AI analysis for this game.",
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "AI Claim Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleJoinGame = () => {
    if (!userId || !selectedColor) {
      toast({
        title: "Missing Information",
        description: "Please select a color and ensure you're logged in.",
        variant: "destructive",
      });
      return;
    }

    const playerIndex = gameData?.players?.length || 0;
    joinGameMutation.mutate({
      gameId,
      userId,
      playerIndex,
      color: selectedColor,
    });
  };

  const handleStartGame = () => {
    if (gameData?.game?.mode === "death") {
      // Show final warning for Death Mode
      const confirmed = window.confirm(
        "⚠️ FINAL WARNING ⚠️\n\n" +
        "You are about to enter DEATH MODE.\n" +
        "Once started, you CANNOT quit until the game ends.\n" +
        "The only escape is entering your PIN at 'the house'.\n\n" +
        "Are you absolutely sure you want to proceed?"
      );
      
      if (!confirmed) return;
    }
    
    setLocation(`/game/${gameId}`);
  };

  useEffect(() => {
    // Get user ID from localStorage or context
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(parseInt(storedUserId));
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-game-primary flex items-center justify-center">
        <div className="text-center">
          <Skull className="h-16 w-16 text-game-accent mx-auto mb-4 animate-pulse" />
          <p className="text-xl text-gray-300">Loading game lobby...</p>
        </div>
      </div>
    );
  }

  if (!gameData) {
    return (
      <div className="min-h-screen bg-game-primary flex items-center justify-center">
        <Card className="bg-game-secondary border-game-accent">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-16 w-16 text-game-accent mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-game-accent mb-2">Game Not Found</h1>
              <p className="text-gray-300">The game you're looking for doesn't exist.</p>
              <Button
                onClick={() => setLocation("/")}
                className="mt-4 bg-game-accent hover:bg-red-700"
              >
                Return Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { game, players } = gameData;
  const isDeathMode = game.mode === "death";
  const availableColors = ["red", "blue", "green", "yellow"].filter(
    color => !players.some((p: any) => p.color === color)
  );
  const canStartGame = players.length >= 2;
  const isPlayerInGame = players.some((p: any) => p.userId === userId);

  return (
    <div className="min-h-screen bg-game-primary">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Skull className="h-12 w-12 text-game-accent" />
            <h1 className="text-4xl font-bold text-game-accent">
              {isDeathMode ? "DEATH MODE" : "STANDARD"} LOBBY
            </h1>
          </div>
          <p className="text-xl text-gray-300">
            Game ID: <span className="text-game-accent font-mono">{gameId}</span>
          </p>
        </div>

        {isDeathMode && (
          <Alert className="trapped-warning max-w-4xl mx-auto mb-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>DEATH MODE WARNING:</strong> Once this game starts, you cannot quit until it ends.
              The only escape is entering your PIN at "the house". Proceed with extreme caution.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <Card className="bg-game-secondary border-game-accent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-game-accent">
                <Users className="h-6 w-6" />
                Players ({players.length}/4)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {players.map((player: any, index: number) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-3 bg-game-primary rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full border-2 border-white`}
                      style={{ backgroundColor: player.color }}
                    />
                    <div>
                      <p className="font-semibold text-white">
                        {player.isAi ? "AI Player" : `Player ${index + 1}`}
                      </p>
                      <p className="text-sm text-gray-400">{player.color}</p>
                    </div>
                  </div>
                  {player.isAi && (
                    <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                      AI
                    </Badge>
                  )}
                  {player.isTrapped && (
                    <Badge variant="outline" className="border-red-500 text-red-500">
                      TRAPPED
                    </Badge>
                  )}
                </div>
              ))}
              
              {!isPlayerInGame && availableColors.length > 0 && (
                <div className="space-y-4 mt-6">
                  <h3 className="font-semibold text-white">Join as:</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {availableColors.map((color) => (
                      <Button
                        key={color}
                        variant={selectedColor === color ? "default" : "outline"}
                        onClick={() => setSelectedColor(color)}
                        className="flex items-center gap-2"
                      >
                        <div
                          className="w-4 h-4 rounded-full border border-white"
                          style={{ backgroundColor: color }}
                        />
                        {color}
                      </Button>
                    ))}
                  </div>
                  <Button
                    onClick={handleJoinGame}
                    disabled={!selectedColor || joinGameMutation.isPending}
                    className="w-full bg-game-accent hover:bg-red-700"
                  >
                    {joinGameMutation.isPending ? "Joining..." : "Join Game"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-game-secondary border-game-accent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-game-accent">
                <Brain className="h-6 w-6" />
                Game Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Game Mode:</span>
                  <Badge
                    variant={isDeathMode ? "destructive" : "default"}
                    className={isDeathMode ? "bg-red-700" : "bg-blue-600"}
                  >
                    {isDeathMode ? "DEATH MODE" : "STANDARD"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Max Moves:</span>
                  <span className="font-bold text-white">{game.maxMoves}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">AI Status:</span>
                  <span className="font-bold text-white">
                    {game.aiClaimedBy ? "CLAIMED" : "AVAILABLE"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Status:</span>
                  <Badge variant="outline" className="border-gray-500">
                    {game.status.toUpperCase()}
                  </Badge>
                </div>
              </div>

              {isDeathMode && !game.aiClaimedBy && isPlayerInGame && (
                <div className="space-y-2">
                  <Alert className="bg-yellow-900 border-yellow-600">
                    <Brain className="h-4 w-4" />
                    <AlertDescription>
                      AI analysis is available! First player to claim gets access for the entire game.
                    </AlertDescription>
                  </Alert>
                  <Button
                    onClick={() => claimAIMutation.mutate()}
                    disabled={claimAIMutation.isPending}
                    className="w-full bg-yellow-600 hover:bg-yellow-700"
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    {claimAIMutation.isPending ? "Claiming..." : "Claim AI Analysis"}
                  </Button>
                </div>
              )}

              {canStartGame && (
                <Button
                  onClick={handleStartGame}
                  className="w-full mt-6 btn-death-mode"
                  disabled={!isPlayerInGame}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  START GAME
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {isDeathMode && (
          <Card className="bg-game-secondary border-game-accent max-w-4xl mx-auto mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-game-warning">
                <Clock className="h-6 w-6" />
                Death Mode Rules Reminder
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-300">
              <p>• You will be <strong>TRAPPED</strong> once the game starts</p>
              <p>• AI opponents will disguise themselves as human players</p>
              <p>• Game ends after 2000 moves or when someone finishes</p>
              <p>• Winners can permanently delete opponent accounts</p>
              <p>• Only escape: Enter your PIN at "the house"</p>
              <p>• Extreme point rewards: 10^10 trillion (theoretical)</p>
              <p>• Stalemate penalty: 10^-10 points for trapped players</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

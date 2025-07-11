import { Badge } from "@/components/ui/badge";
import { Skull, Lock } from "lucide-react";

interface GameHeaderProps {
  gameId: string;
  currentMove: number;
  maxMoves: number;
  isDeathMode: boolean;
}

export function GameHeader({ gameId, currentMove, maxMoves, isDeathMode }: GameHeaderProps) {
  return (
    <header className="bg-game-secondary border-b border-game-accent shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <Skull className="text-game-accent text-2xl" />
            <h1 className="text-2xl font-bold text-game-accent">
              {isDeathMode ? 'DEATH MODE LUDO' : 'LUDO GAME'}
            </h1>
            {isDeathMode && (
              <Badge variant="destructive" className="bg-game-accent">
                COMPETITIVE
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-sm">
              <span className="text-gray-400">Game ID:</span>
              <span className="text-white font-mono ml-2">{gameId}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-400">Move:</span>
              <span className="text-white font-bold ml-2">{currentMove}</span>
              <span className="text-gray-400">/{maxMoves}</span>
            </div>
            {isDeathMode && (
              <div className="bg-game-accent px-4 py-2 rounded-lg flex items-center space-x-2">
                <Lock className="w-4 h-4" />
                <span className="font-semibold">LOCKED IN</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

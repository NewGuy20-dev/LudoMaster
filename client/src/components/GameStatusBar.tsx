import { Badge } from "@/components/ui/badge";
import { Users, Bot, Clock, AlertTriangle } from "lucide-react";

interface GameStatusBarProps {
  playerCount: number;
  sessionTime: string;
  pointsAtRisk: string;
  isDeathMode: boolean;
  aiStatus: 'active' | 'inactive';
}

export function GameStatusBar({ 
  playerCount, 
  sessionTime, 
  pointsAtRisk, 
  isDeathMode, 
  aiStatus 
}: GameStatusBarProps) {
  return (
    <div className="bg-game-secondary border-t border-game-accent p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Users className="text-game-accent h-4 w-4" />
            <span className="text-sm">Players: <span className="font-semibold">{playerCount}</span></span>
          </div>
          <div className="flex items-center space-x-2">
            <Bot className={`h-4 w-4 ${aiStatus === 'active' ? 'text-game-warning' : 'text-gray-400'}`} />
            <span className="text-sm">
              AI Status: <span className={`font-semibold ${aiStatus === 'active' ? 'text-game-warning' : 'text-gray-400'}`}>
                {aiStatus.toUpperCase()}
              </span>
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="text-gray-400 h-4 w-4" />
            <span className="text-sm">Session: <span className="font-semibold">{sessionTime}</span></span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm">
            <span className="text-gray-400">Points at Risk:</span>
            <span className="font-semibold text-game-accent ml-2">{pointsAtRisk}</span>
          </div>
          {isDeathMode && (
            <Badge className="bg-game-accent px-4 py-2">
              <AlertTriangle className="mr-2 h-4 w-4" />
              HIGH STAKES MODE
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

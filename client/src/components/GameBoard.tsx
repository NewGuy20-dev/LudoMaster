import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dice1, Bot } from "lucide-react";
import { GameState } from "@/hooks/useGameState";

interface GameBoardProps {
  gameState: GameState | null;
  onRollDice: () => void;
  onRequestAI: () => void;
  currentPlayer: string;
  isAIAnalyzing: boolean;
}

export function GameBoard({ 
  gameState, 
  onRollDice, 
  onRequestAI, 
  currentPlayer, 
  isAIAnalyzing 
}: GameBoardProps) {
  return (
    <div className="flex-1 p-6">
      <Card className="bg-game-secondary border-game-accent h-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold">Game Board</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <span className="text-gray-400">Current Turn:</span>
                <span className="text-game-accent font-bold ml-2">{currentPlayer}</span>
              </div>
              {isAIAnalyzing && (
                <div className="bg-game-warning px-3 py-1 rounded-full text-sm font-semibold text-black">
                  AI ANALYZING...
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Game Board Display */}
          <div className="relative bg-green-800 rounded-lg p-8 aspect-square max-w-2xl mx-auto">
            {/* Classic Ludo Board Layout */}
            <div className="absolute inset-0 grid grid-cols-15 grid-rows-15 gap-px">
              {/* Red Home */}
              <div className="col-span-6 row-span-6 bg-red-600 rounded-tl-lg flex items-center justify-center">
                <div className="text-white font-bold">RED HOME</div>
              </div>
              
              {/* Top Path */}
              <div className="col-span-3 row-span-6 bg-gray-100 grid grid-cols-3 grid-rows-6 gap-px">
                {Array.from({ length: 18 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`border border-gray-300 ${i === 9 ? 'bg-yellow-300' : 'bg-white'}`}
                  />
                ))}
              </div>
              
              {/* Blue Home */}
              <div className="col-span-6 row-span-6 bg-blue-600 rounded-tr-lg flex items-center justify-center">
                <div className="text-white font-bold">BLUE HOME</div>
              </div>
              
              {/* Center Finish Area */}
              <div className="col-span-3 row-span-3 col-start-7 row-start-7 bg-yellow-400 rounded-lg flex items-center justify-center">
                <div className="text-black font-bold text-lg">FINISH</div>
              </div>
              
              {/* Green Home */}
              <div className="col-span-6 row-span-6 row-start-10 bg-green-600 rounded-bl-lg flex items-center justify-center">
                <div className="text-white font-bold">GREEN HOME</div>
              </div>
              
              {/* Yellow Home */}
              <div className="col-span-6 row-span-6 col-start-10 row-start-10 bg-yellow-600 rounded-br-lg flex items-center justify-center">
                <div className="text-white font-bold">YELLOW HOME</div>
              </div>
            </div>

            {/* Game pieces */}
            {gameState?.pieces.map((piece, index) => (
              <div
                key={piece.id}
                className={`absolute w-6 h-6 rounded-full border-2 border-white shadow-lg ${
                  piece.team === 'red' ? 'bg-red-500' :
                  piece.team === 'blue' ? 'bg-blue-500' :
                  piece.team === 'green' ? 'bg-green-500' :
                  'bg-yellow-500'
                }`}
                style={{
                  left: piece.isInHome ? '20px' : `${(piece.position % 13) * 30 + 20}px`,
                  top: piece.isInHome ? `${20 + index * 15}px` : `${Math.floor(piece.position / 13) * 30 + 20}px`
                }}
              />
            ))}
          </div>

          {/* Game Controls */}
          <div className="mt-6 flex justify-center space-x-4">
            <Button 
              onClick={onRollDice}
              className="bg-game-accent hover:bg-red-700 px-6 py-3 rounded-lg font-semibold"
            >
              <Dice1 className="mr-2 h-4 w-4" />
              Roll Dice
            </Button>
            <Button 
              onClick={onRequestAI}
              className="bg-game-success hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold"
            >
              <Bot className="mr-2 h-4 w-4" />
              AI Suggest
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

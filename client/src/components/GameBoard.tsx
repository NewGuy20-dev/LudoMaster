import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dice1, Bot } from "lucide-react";
import { GameState } from "@/hooks/useGameState";
import { useState } from "react";

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
  const [selectedPiece, setSelectedPiece] = useState<string | null>(null);
  const [diceValue, setDiceValue] = useState<number>(0);

  const handleRollDice = () => {
    const newDiceValue = Math.floor(Math.random() * 6) + 1;
    setDiceValue(newDiceValue);
    onRollDice();
  };

  const handlePositionClick = (positionId: number) => {
    console.log('Position clicked:', positionId);
    // Handle piece movement logic here
  };

  const getPieceAtPosition = (positionId: number) => {
    if (!gameState?.pieces) return null;
    return gameState.pieces.find(piece => piece.position === positionId);
  };

  const renderGamePiece = (color: string, index: number) => (
    <div
      key={`${color}-${index}`}
      className={`w-8 h-8 bg-${color}-700 rounded-full border-2 border-white flex items-center justify-center cursor-pointer hover:bg-${color}-600 transition-colors`}
      onClick={() => handlePositionClick(-1 - index)}
    >
      <div className={`w-4 h-4 bg-${color}-300 rounded-full`} />
    </div>
  );

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
          <div className="flex flex-col items-center space-y-6">
            {/* Dice and Controls */}
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleRollDice}
                disabled={isAIAnalyzing}
                className="bg-game-accent hover:bg-game-accent/80 text-black font-bold px-6 py-3"
              >
                <Dice1 className="mr-2" />
                Roll Dice
              </Button>
              
              {diceValue > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-game-accent font-bold">Rolled:</span>
                  <div className="bg-white text-black rounded-lg p-3 text-2xl font-bold min-w-[3rem] text-center">
                    {diceValue}
                  </div>
                </div>
              )}
              
              <Button
                onClick={onRequestAI}
                disabled={isAIAnalyzing}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3"
              >
                <Bot className="mr-2" />
                Request AI
              </Button>
            </div>

            {/* Ludo Board */}
            <div className="relative bg-white rounded-lg p-4 border-4 border-gray-800">
              <div className="grid grid-cols-15 grid-rows-15 gap-1 w-[600px] h-[600px]">
                {/* Red Home Area */}
                <div className="col-span-6 row-span-6 bg-red-500 rounded-tl-lg flex items-center justify-center">
                  <div className="grid grid-cols-2 grid-rows-2 gap-2 p-4">
                    {[0, 1, 2, 3].map(i => renderGamePiece('red', i))}
                  </div>
                </div>

                {/* Top Path */}
                <div className="col-span-3 row-span-6 bg-gray-100 grid grid-cols-1 grid-rows-6 gap-1 p-1">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={`top-${i}`}
                      className={`border-2 border-gray-400 rounded cursor-pointer hover:bg-gray-200 flex items-center justify-center ${
                        i === 1 ? 'bg-blue-300' : 'bg-white'
                      }`}
                      onClick={() => handlePositionClick(13 + i)}
                    >
                      {getPieceAtPosition(13 + i) && (
                        <div className={`w-6 h-6 rounded-full border-2 border-white`} 
                          style={{backgroundColor: `${getPieceAtPosition(13 + i)?.team}`}} />
                      )}
                    </div>
                  ))}
                </div>

                {/* Blue Home Area */}
                <div className="col-span-6 row-span-6 bg-blue-500 rounded-tr-lg flex items-center justify-center">
                  <div className="grid grid-cols-2 grid-rows-2 gap-2 p-4">
                    {[0, 1, 2, 3].map(i => renderGamePiece('blue', i))}
                  </div>
                </div>

                {/* Left Path */}
                <div className="col-span-6 row-span-3 row-start-7 bg-gray-100 grid grid-cols-6 grid-rows-1 gap-1 p-1">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={`left-${i}`}
                      className={`border-2 border-gray-400 rounded cursor-pointer hover:bg-gray-200 flex items-center justify-center ${
                        i === 4 ? 'bg-red-300' : 'bg-white'
                      }`}
                      onClick={() => handlePositionClick(47 + i)}
                    >
                      {getPieceAtPosition(47 + i) && (
                        <div className={`w-6 h-6 rounded-full border-2 border-white`} 
                          style={{backgroundColor: `${getPieceAtPosition(47 + i)?.team}`}} />
                      )}
                    </div>
                  ))}
                </div>

                {/* Center Finish Area */}
                <div className="col-span-3 row-span-3 col-start-7 row-start-7 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center border-4 border-yellow-800">
                  <div className="text-black font-bold text-xl text-center">
                    <div className="text-3xl">🏆</div>
                    <div>FINISH</div>
                  </div>
                </div>

                {/* Right Path */}
                <div className="col-span-6 row-span-3 row-start-7 col-start-10 bg-gray-100 grid grid-cols-6 grid-rows-1 gap-1 p-1">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={`right-${i}`}
                      className={`border-2 border-gray-400 rounded cursor-pointer hover:bg-gray-200 flex items-center justify-center ${
                        i === 1 ? 'bg-green-300' : 'bg-white'
                      }`}
                      onClick={() => handlePositionClick(21 + i)}
                    >
                      {getPieceAtPosition(21 + i) && (
                        <div className={`w-6 h-6 rounded-full border-2 border-white`} 
                          style={{backgroundColor: `${getPieceAtPosition(21 + i)?.team}`}} />
                      )}
                    </div>
                  ))}
                </div>

                {/* Green Home Area */}
                <div className="col-span-6 row-span-6 row-start-10 bg-green-500 rounded-bl-lg flex items-center justify-center">
                  <div className="grid grid-cols-2 grid-rows-2 gap-2 p-4">
                    {[0, 1, 2, 3].map(i => renderGamePiece('green', i))}
                  </div>
                </div>

                {/* Bottom Path */}
                <div className="col-span-3 row-span-6 row-start-10 col-start-7 bg-gray-100 grid grid-cols-1 grid-rows-6 gap-1 p-1">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={`bottom-${i}`}
                      className={`border-2 border-gray-400 rounded cursor-pointer hover:bg-gray-200 flex items-center justify-center ${
                        i === 4 ? 'bg-yellow-300' : 'bg-white'
                      }`}
                      onClick={() => handlePositionClick(34 + i)}
                    >
                      {getPieceAtPosition(34 + i) && (
                        <div className={`w-6 h-6 rounded-full border-2 border-white`} 
                          style={{backgroundColor: `${getPieceAtPosition(34 + i)?.team}`}} />
                      )}
                    </div>
                  ))}
                </div>

                {/* Yellow Home Area */}
                <div className="col-span-6 row-span-6 row-start-10 col-start-10 bg-yellow-500 rounded-br-lg flex items-center justify-center">
                  <div className="grid grid-cols-2 grid-rows-2 gap-2 p-4">
                    {[0, 1, 2, 3].map(i => renderGamePiece('yellow', i))}
                  </div>
                </div>
              </div>
            </div>

            {/* Game Status */}
            <div className="text-center">
              <div className="text-sm text-gray-400">
                {gameState ? (
                  <>
                    <div>Move: {gameState.move}</div>
                    <div>Status: {gameState.status}</div>
                    <div>Dice: {gameState.dice}</div>
                  </>
                ) : (
                  <div>Waiting for game data...</div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
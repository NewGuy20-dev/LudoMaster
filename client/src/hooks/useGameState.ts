import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useWebSocket } from './useWebSocket';

export interface GameState {
  board: any[];
  pieces: any[];
  currentPlayer: number;
  dice: number;
  move: number;
  status: string;
  aiOwner?: number;
}

export interface GameData {
  id: number;
  gameId: string;
  ownerId: number;
  mode: string;
  status: string;
  currentMove: number;
  maxMoves: number;
  boardState: any;
  aiOwner?: number;
}

export interface Player {
  id: number;
  userId: number;
  team: string;
  position: number;
  isAI: boolean;
  isEscaped: boolean;
}

export function useGameState(gameId: string | null) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [aiAnalysis, setAIAnalysis] = useState<any>(null);
  const { sendMessage, addMessageHandler } = useWebSocket(gameId);

  const { data: gameData, isLoading } = useQuery({
    queryKey: ['/api/games', gameId],
    enabled: !!gameId,
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  useEffect(() => {
    if (gameData?.gameState) {
      setGameState(gameData.gameState);
    }
  }, [gameData]);

  useEffect(() => {
    if (!gameId) return;

    const removeHandler = addMessageHandler((message) => {
      switch (message.type) {
        case 'dice_rolled':
          setGameState(prev => prev ? { ...prev, dice: message.dice } : null);
          break;
          
        case 'move_made':
          setGameState(prev => message.gameState || prev);
          break;
          
        case 'ai_analysis':
          setAIAnalysis(message.analysis);
          break;
          
        case 'ai_claimed':
          setGameState(prev => prev ? { ...prev, aiOwner: message.team } : null);
          break;
          
        case 'owner_victory':
          setGameState(prev => prev ? { ...prev, status: 'finished' } : null);
          break;
      }
    });

    return removeHandler;
  }, [gameId, addMessageHandler]);

  const rollDice = () => {
    sendMessage({ type: 'roll_dice' });
  };

  const makeMove = (pieceId: string, targetPosition: number) => {
    sendMessage({ type: 'make_move', pieceId, targetPosition });
  };

  const requestAIAnalysis = () => {
    sendMessage({ type: 'request_ai_analysis' });
  };

  const executeAIMove = () => {
    sendMessage({ type: 'ai_move' });
  };

  return {
    gameData: gameData as { game: GameData; players: Player[]; gameState: GameState } | undefined,
    gameState,
    aiAnalysis,
    isLoading,
    rollDice,
    makeMove,
    requestAIAnalysis,
    executeAIMove
  };
}

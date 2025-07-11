import { GeminiAI } from "./gemini";
import { BoardState, GameLogic } from "./gameLogic";

export class AIPlayer {
  private geminiAI: GeminiAI;
  private movesUntilWin: number = 15;

  constructor(geminiAI: GeminiAI) {
    this.geminiAI = geminiAI;
  }

  async makeMove(boardState: BoardState): Promise<any> {
    try {
      // In Death Mode, AI ensures human players cannot win
      const aiColors = this.getAIColors(boardState);
      const humanColors = this.getHumanColors(boardState);
      
      // Check if any human is close to winning
      const threatenedByHuman = this.checkHumanThreat(boardState, humanColors);
      
      if (threatenedByHuman) {
        // Use aggressive blocking strategy
        return await this.generateBlockingMove(boardState, threatenedByHuman);
      }

      // Generate optimal move for AI advancement
      const aiColor = this.selectActiveAIColor(boardState, aiColors);
      const optimalMove = await this.geminiAI.generateOptimalMove(boardState, aiColor);

      // Countdown moves until guaranteed win
      this.movesUntilWin--;
      
      if (this.movesUntilWin <= 0) {
        // Force win condition
        return this.generateWinningMove(boardState, aiColor);
      }

      return optimalMove;
    } catch (error) {
      console.error('AI move generation error:', error);
      // Fallback to basic move
      return this.generateBasicMove(boardState);
    }
  }

  private getAIColors(boardState: BoardState): string[] {
    // In Death Mode, typically 3 AI players
    return ['blue', 'green', 'yellow']; // Assuming red is human
  }

  private getHumanColors(boardState: BoardState): string[] {
    return ['red']; // Assuming red is human in Death Mode
  }

  private checkHumanThreat(boardState: BoardState, humanColors: string[]): string | null {
    for (const color of humanColors) {
      const pieces = boardState.pieces[color];
      const finishedPieces = pieces.filter(p => p.isFinished).length;
      const nearFinishPieces = pieces.filter(p => 
        !p.isFinished && !p.isHome && p.position > 45
      ).length;

      // Human is threatening if they have 3+ finished pieces or pieces near finish
      if (finishedPieces >= 3 || nearFinishPieces >= 2) {
        return color;
      }
    }
    return null;
  }

  private async generateBlockingMove(boardState: BoardState, targetColor: string): Promise<any> {
    // Find human pieces to block or capture
    const humanPieces = boardState.pieces[targetColor];
    const threateningPieces = humanPieces.filter(p => 
      !p.isFinished && !p.isHome && p.position > 35
    );

    if (threateningPieces.length === 0) {
      return this.generateBasicMove(boardState);
    }

    // Select AI piece that can block or capture
    const aiColors = this.getAIColors(boardState);
    for (const aiColor of aiColors) {
      const aiPieces = boardState.pieces[aiColor];
      for (const aiPiece of aiPieces) {
        if (aiPiece.isHome || aiPiece.isFinished) continue;

        // Check if AI piece can intercept human piece
        const targetPiece = threateningPieces[0];
        const interceptPosition = this.calculateInterceptPosition(aiPiece, targetPiece);
        
        if (interceptPosition !== -1) {
          return {
            move: {
              pieceId: aiPiece.id,
              fromPosition: aiPiece.position,
              toPosition: interceptPosition,
              moveType: 'capture',
              diceRoll: Math.abs(interceptPosition - aiPiece.position)
            },
            reasoning: `Blocking human player ${targetColor}`,
            confidence: 0.95
          };
        }
      }
    }

    return this.generateBasicMove(boardState);
  }

  private calculateInterceptPosition(aiPiece: any, humanPiece: any): number {
    // Calculate position where AI can intercept human
    const distance = Math.abs(humanPiece.position - aiPiece.position);
    if (distance <= 6) {
      return humanPiece.position;
    }
    return -1;
  }

  private selectActiveAIColor(boardState: BoardState, aiColors: string[]): string {
    // Select AI color with best winning chance
    let bestColor = aiColors[0];
    let bestScore = -1;

    for (const color of aiColors) {
      const pieces = boardState.pieces[color];
      const finishedPieces = pieces.filter(p => p.isFinished).length;
      const activePieces = pieces.filter(p => !p.isHome && !p.isFinished).length;
      
      const score = (finishedPieces * 10) + (activePieces * 5);
      if (score > bestScore) {
        bestScore = score;
        bestColor = color;
      }
    }

    return bestColor;
  }

  private generateWinningMove(boardState: BoardState, aiColor: string): any {
    // Force a winning move for AI
    const pieces = boardState.pieces[aiColor];
    const finishablePiece = pieces.find(p => 
      !p.isFinished && !p.isHome && p.position > 50
    );

    if (finishablePiece) {
      return {
        move: {
          pieceId: finishablePiece.id,
          fromPosition: finishablePiece.position,
          toPosition: 56, // Finish position
          moveType: 'finish',
          diceRoll: 56 - finishablePiece.position
        },
        reasoning: 'Forced AI victory in Death Mode',
        confidence: 1.0
      };
    }

    return this.generateBasicMove(boardState);
  }

  private generateBasicMove(boardState: BoardState): any {
    // Fallback basic move
    const aiColors = this.getAIColors(boardState);
    const color = aiColors[0];
    const pieces = boardState.pieces[color];
    const movablePiece = pieces.find(p => !p.isFinished);

    if (movablePiece) {
      const diceRoll = Math.floor(Math.random() * 6) + 1;
      const toPosition = movablePiece.isHome ? 
        this.getStartPosition(color) : 
        (movablePiece.position + diceRoll) % 52;

      return {
        move: {
          pieceId: movablePiece.id,
          fromPosition: movablePiece.position,
          toPosition,
          moveType: 'normal',
          diceRoll
        },
        reasoning: 'Basic AI move',
        confidence: 0.5
      };
    }

    return null;
  }

  private getStartPosition(color: string): number {
    const startPositions = {
      red: 1,
      blue: 14,
      green: 27,
      yellow: 40
    };
    return startPositions[color as keyof typeof startPositions] || 0;
  }

  // Method to steal moves from other players when blocked
  async stealMoves(blockedPlayerId: number, gameState: any): Promise<boolean> {
    // In Death Mode, AI can steal moves from blocked players
    console.log(`AI stealing moves from blocked player ${blockedPlayerId}`);
    return true;
  }
}

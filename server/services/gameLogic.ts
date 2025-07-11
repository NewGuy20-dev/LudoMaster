export interface GamePiece {
  id: number;
  position: number;
  color: string;
  isHome: boolean;
  isFinished: boolean;
}

export interface BoardState {
  pieces: Record<string, GamePiece[]>;
  currentPlayer: number;
  lastDiceRoll: number;
  gamePhase: 'setup' | 'playing' | 'finished';
}

export interface MoveResult {
  valid: boolean;
  move?: any;
  newBoardState?: BoardState;
  winProbabilities?: Record<string, number>;
  reason?: string;
}

export class GameLogic {
  private gameId: number;
  private boardState: BoardState;

  constructor(gameId: number) {
    this.gameId = gameId;
    this.boardState = GameLogic.createInitialBoardState();
  }

  static createInitialBoardState(): BoardState {
    const colors = ['red', 'blue', 'green', 'yellow'];
    const pieces: Record<string, GamePiece[]> = {};

    colors.forEach(color => {
      pieces[color] = [];
      for (let i = 0; i < 4; i++) {
        pieces[color].push({
          id: i,
          position: -1, // -1 means in home area
          color,
          isHome: true,
          isFinished: false
        });
      }
    });

    return {
      pieces,
      currentPlayer: 0,
      lastDiceRoll: 0,
      gamePhase: 'setup'
    };
  }

  async processMove(move: any): Promise<MoveResult> {
    try {
      // Validate move
      const validation = this.validateMove(move);
      if (!validation.valid) {
        return validation;
      }

      // Apply move
      const newBoardState = this.applyMove(this.boardState, move);
      
      // Calculate win probabilities
      const winProbabilities = this.calculateWinProbabilities(newBoardState);
      
      // Update internal state
      this.boardState = newBoardState;
      
      return {
        valid: true,
        move,
        newBoardState,
        winProbabilities
      };
    } catch (error) {
      return {
        valid: false,
        reason: `Move processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private validateMove(move: any): MoveResult {
    const { pieceId, fromPosition, toPosition, color, diceRoll } = move;
    
    // Check if it's the player's turn
    const playerColors = ['red', 'blue', 'green', 'yellow'];
    const currentColor = playerColors[this.boardState.currentPlayer];
    
    if (color !== currentColor) {
      return { valid: false, reason: 'Not your turn' };
    }

    // Check if piece exists
    const piece = this.boardState.pieces[color]?.find(p => p.id === pieceId);
    if (!piece) {
      return { valid: false, reason: 'Invalid piece' };
    }

    // Check if piece is at expected position
    if (piece.position !== fromPosition) {
      return { valid: false, reason: 'Piece not at expected position' };
    }

    // Check if move distance matches dice roll
    if (piece.isHome && diceRoll !== 6) {
      return { valid: false, reason: 'Need 6 to move piece from home' };
    }

    // Validate destination
    const expectedDestination = this.calculateDestination(piece, diceRoll);
    if (expectedDestination !== toPosition) {
      return { valid: false, reason: 'Invalid destination' };
    }

    // Check for collisions (except captures)
    const collision = this.checkCollision(toPosition, color);
    if (collision.blocked) {
      return { valid: false, reason: 'Position blocked' };
    }

    return { valid: true };
  }

  private applyMove(boardState: BoardState, move: any): BoardState {
    const newState = JSON.parse(JSON.stringify(boardState));
    const { pieceId, color, toPosition, diceRoll } = move;
    
    // Find and update piece
    const piece = newState.pieces[color].find((p: GamePiece) => p.id === pieceId);
    if (!piece) return newState;

    // Update piece position
    piece.position = toPosition;
    piece.isHome = false;

    // Check if piece finished
    if (this.isFinishPosition(toPosition, color)) {
      piece.isFinished = true;
    }

    // Handle captures
    this.handleCaptures(newState, toPosition, color);

    // Update current player
    newState.currentPlayer = (newState.currentPlayer + 1) % 4;
    newState.lastDiceRoll = diceRoll;

    return newState;
  }

  private calculateDestination(piece: GamePiece, diceRoll: number): number {
    if (piece.isHome) {
      return this.getStartPosition(piece.color);
    }

    const boardSize = 52; // Standard Ludo board has 52 positions
    return (piece.position + diceRoll) % boardSize;
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

  private checkCollision(position: number, color: string): { blocked: boolean; capturable?: boolean } {
    const allPieces = Object.values(this.boardState.pieces).flat();
    const pieceAtPosition = allPieces.find(p => p.position === position && !p.isFinished);
    
    if (!pieceAtPosition) {
      return { blocked: false };
    }

    // Same color pieces block each other
    if (pieceAtPosition.color === color) {
      return { blocked: true };
    }

    // Different color pieces can be captured
    return { blocked: false, capturable: true };
  }

  private handleCaptures(boardState: BoardState, position: number, movingColor: string): void {
    Object.entries(boardState.pieces).forEach(([color, pieces]) => {
      if (color === movingColor) return;
      
      pieces.forEach(piece => {
        if (piece.position === position && !piece.isFinished) {
          // Send piece back to home
          piece.position = -1;
          piece.isHome = true;
        }
      });
    });
  }

  private isFinishPosition(position: number, color: string): boolean {
    const finishPositions = {
      red: 56,
      blue: 56,
      green: 56,
      yellow: 56
    };
    return position === finishPositions[color as keyof typeof finishPositions];
  }

  private calculateWinProbabilities(boardState: BoardState): Record<string, number> {
    const probabilities: Record<string, number> = {};
    const colors = ['red', 'blue', 'green', 'yellow'];
    
    colors.forEach(color => {
      const pieces = boardState.pieces[color];
      const finishedPieces = pieces.filter(p => p.isFinished).length;
      const homePieces = pieces.filter(p => p.isHome).length;
      const activePieces = pieces.filter(p => !p.isHome && !p.isFinished).length;
      
      // Basic probability calculation
      // More finished pieces = higher probability
      // More home pieces = lower probability
      // More active pieces = medium probability
      const baseScore = (finishedPieces * 40) + (activePieces * 15) - (homePieces * 5);
      probabilities[color] = Math.max(0, Math.min(100, baseScore));
    });

    // Normalize probabilities to sum to 100
    const total = Object.values(probabilities).reduce((sum, prob) => sum + prob, 0);
    if (total > 0) {
      Object.keys(probabilities).forEach(color => {
        probabilities[color] = (probabilities[color] / total) * 100;
      });
    } else {
      // Equal probabilities if no one has made progress
      Object.keys(probabilities).forEach(color => {
        probabilities[color] = 25;
      });
    }

    return probabilities;
  }

  getBoardState(): BoardState {
    return this.boardState;
  }

  setBoardState(state: BoardState): void {
    this.boardState = state;
  }
}

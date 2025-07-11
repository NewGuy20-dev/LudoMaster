import { storage } from "../storage";
import { analyzeGameState, generateAIMove, type AIAnalysisResult, type GameState } from "./gemini";

export interface LudoPosition {
  x: number;
  y: number;
  safe: boolean;
  home: boolean;
  finish: boolean;
  team?: string;
}

export interface GamePiece {
  id: string;
  team: string;
  position: number;
  isInHome: boolean;
  isFinished: boolean;
}

export interface LudoGameState {
  board: LudoPosition[];
  pieces: GamePiece[];
  currentPlayer: number;
  dice: number;
  move: number;
  status: string;
  aiOwner?: number;
}

export class GameEngine {
  private gameId: number;
  private gameState: LudoGameState;
  private maxMoves: number;
  private isDeathMode: boolean;

  constructor(gameId: number, maxMoves: number = 2000, isDeathMode: boolean = false) {
    this.gameId = gameId;
    this.maxMoves = maxMoves;
    this.isDeathMode = isDeathMode;
    this.gameState = this.initializeGame();
  }

  private initializeGame(): LudoGameState {
    // Initialize standard Ludo board with 4 teams
    const board = this.createLudoBoard();
    const pieces = this.createInitialPieces();
    
    return {
      board,
      pieces,
      currentPlayer: 0,
      dice: 0,
      move: 0,
      status: 'active'
    };
  }

  private createLudoBoard(): LudoPosition[] {
    const board: LudoPosition[] = [];
    
    // Create 52 main path positions + 4 home areas + 4 finish areas
    // This is a simplified representation
    for (let i = 0; i < 52; i++) {
      board.push({
        x: i % 13,
        y: Math.floor(i / 13),
        safe: i % 8 === 0, // Safe positions
        home: false,
        finish: false
      });
    }
    
    // Add home positions for each team
    ['red', 'blue', 'green', 'yellow'].forEach((team, teamIndex) => {
      for (let i = 0; i < 4; i++) {
        board.push({
          x: -1,
          y: teamIndex,
          safe: true,
          home: true,
          finish: false,
          team
        });
      }
    });
    
    return board;
  }

  private createInitialPieces(): GamePiece[] {
    const pieces: GamePiece[] = [];
    const teams = ['red', 'blue', 'green', 'yellow'];
    
    teams.forEach((team, teamIndex) => {
      for (let i = 0; i < 4; i++) {
        pieces.push({
          id: `${team}-${i}`,
          team,
          position: -1, // In home
          isInHome: true,
          isFinished: false
        });
      }
    });
    
    return pieces;
  }

  async rollDice(): Promise<number> {
    const dice = Math.floor(Math.random() * 6) + 1;
    this.gameState.dice = dice;
    return dice;
  }

  async makeMove(pieceId: string, targetPosition: number): Promise<boolean> {
    const piece = this.gameState.pieces.find(p => p.id === pieceId);
    if (!piece) return false;

    // Validate move
    if (!this.isValidMove(piece, targetPosition)) {
      return false;
    }

    // Execute move
    piece.position = targetPosition;
    piece.isInHome = targetPosition === -1;
    piece.isFinished = targetPosition >= 52;

    // Check for captures
    this.checkForCaptures(piece);

    // Update game state
    this.gameState.move++;
    this.nextPlayer();

    // Save state to database
    await storage.updateGameBoardState(this.gameId, this.gameState);
    await storage.updateGameMove(this.gameId, this.gameState.move);

    // Check win conditions
    if (this.checkWinCondition()) {
      this.gameState.status = 'finished';
      await storage.updateGameStatus(this.gameId, 'finished');
    }

    // Check move limit for Death Mode
    if (this.isDeathMode && this.gameState.move >= this.maxMoves) {
      this.gameState.status = 'terminated';
      await storage.updateGameStatus(this.gameId, 'terminated');
      await this.applyDeathModePenalties();
    }

    return true;
  }

  private isValidMove(piece: GamePiece, targetPosition: number): boolean {
    const dice = this.gameState.dice;
    
    // Can only move with dice roll
    if (dice === 0) return false;

    // From home: need 6 to get out
    if (piece.isInHome && dice !== 6) return false;

    // Calculate expected position
    const expectedPosition = piece.isInHome ? 0 : piece.position + dice;
    
    return expectedPosition === targetPosition;
  }

  private checkForCaptures(piece: GamePiece): void {
    const position = piece.position;
    const boardPos = this.gameState.board[position];
    
    // Can't capture on safe positions
    if (boardPos?.safe) return;

    // Find other pieces on same position
    const otherPieces = this.gameState.pieces.filter(p => 
      p.position === position && p.team !== piece.team && !p.isInHome
    );

    // Send captured pieces home
    otherPieces.forEach(p => {
      p.position = -1;
      p.isInHome = true;
    });
  }

  private nextPlayer(): void {
    this.gameState.currentPlayer = (this.gameState.currentPlayer + 1) % 4;
  }

  private checkWinCondition(): boolean {
    const teams = ['red', 'blue', 'green', 'yellow'];
    
    for (const team of teams) {
      const teamPieces = this.gameState.pieces.filter(p => p.team === team);
      if (teamPieces.every(p => p.isFinished)) {
        return true;
      }
    }
    
    return false;
  }

  private async applyDeathModePenalties(): Promise<void> {
    // Apply extreme penalties for Death Mode stalemate
    const players = await storage.getGamePlayers(this.gameId);
    
    for (const player of players) {
      if (!player.isEscaped) {
        // Apply 10^-10 points penalty
        await storage.updateUserPoints(player.userId!, Math.pow(10, -10));
      }
    }
  }

  async getAIAnalysis(): Promise<AIAnalysisResult> {
    const gameStateForAI: GameState = {
      board: this.gameState.board,
      players: this.gameState.pieces,
      currentPlayer: this.gameState.currentPlayer,
      dice: this.gameState.dice
    };

    const analysis = await analyzeGameState(gameStateForAI);
    
    // Save analysis to database
    await storage.saveAIAnalysis(this.gameId, this.gameState, analysis);
    await storage.incrementCalculationCount(this.gameId);
    
    return analysis;
  }

  async executeAIMove(): Promise<string> {
    const gameStateForAI: GameState = {
      board: this.gameState.board,
      players: this.gameState.pieces,
      currentPlayer: this.gameState.currentPlayer,
      dice: this.gameState.dice
    };

    const move = await generateAIMove(gameStateForAI, this.isDeathMode ? 'impossible' : 'normal');
    
    // In Death Mode, AI moves are designed to prevent human victory
    if (this.isDeathMode) {
      // AI gets extra moves when blocked
      await this.redistributeMovesToAI();
    }
    
    return move;
  }

  private async redistributeMovesToAI(): Promise<void> {
    // Death Mode: AI steals moves from other teams when blocked
    const players = await storage.getGamePlayers(this.gameId);
    const aiPlayer = players.find(p => p.isAI);
    
    if (aiPlayer) {
      // AI gets additional turns
      this.gameState.currentPlayer = aiPlayer.position - 1;
    }
  }

  getGameState(): LudoGameState {
    return { ...this.gameState };
  }

  async claimAI(teamPosition: number): Promise<boolean> {
    if (this.gameState.aiOwner) {
      return false; // AI already claimed
    }

    this.gameState.aiOwner = teamPosition;
    await storage.setGameAIOwner(this.gameId, teamPosition);
    return true;
  }

  async executeOwnerVictoryCommand(ownerId: number): Promise<boolean> {
    if (!this.isDeathMode) return false;

    const game = await storage.getGame(this.gameId);
    if (game?.ownerId !== ownerId) return false;

    // Owner always wins in Death Mode
    this.gameState.status = 'finished';
    await storage.updateGameStatus(this.gameId, 'finished');
    
    // Award 10^10 trillion points to owner (theoretical only)
    await storage.updateUserPoints(ownerId, Math.pow(10, 10) * Math.pow(10, 12));
    
    return true;
  }
}

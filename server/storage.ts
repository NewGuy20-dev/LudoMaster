import { users, games, gamePlayers, aiAnalysis, type User, type InsertUser, type Game, type InsertGame, type GamePlayer, type InsertGamePlayer, type AIAnalysis } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPoints(userId: number, points: number): Promise<void>;
  deleteUser(userId: number): Promise<void>;
  verifyUserPin(userId: number, pin: string): Promise<boolean>;

  // Game operations
  createGame(game: InsertGame): Promise<Game>;
  getGame(id: number): Promise<Game | undefined>;
  getGameByGameId(gameId: string): Promise<Game | undefined>;
  updateGameStatus(gameId: number, status: string): Promise<void>;
  updateGameMove(gameId: number, move: number): Promise<void>;
  updateGameBoardState(gameId: number, boardState: any): Promise<void>;
  setGameAIOwner(gameId: number, teamId: number): Promise<void>;

  // Game player operations
  addGamePlayer(player: InsertGamePlayer): Promise<GamePlayer>;
  getGamePlayers(gameId: number): Promise<GamePlayer[]>;
  setPlayerEscaped(gameId: number, userId: number): Promise<void>;

  // AI analysis operations
  saveAIAnalysis(gameId: number, boardState: any, analysis: any): Promise<AIAnalysis>;
  getLatestAIAnalysis(gameId: number): Promise<AIAnalysis | undefined>;
  incrementCalculationCount(gameId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(and(eq(users.id, id), eq(users.isDeleted, false)));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(and(eq(users.username, username), eq(users.isDeleted, false)));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserPoints(userId: number, points: number): Promise<void> {
    await db.update(users).set({ points }).where(eq(users.id, userId));
  }

  async deleteUser(userId: number): Promise<void> {
    await db.update(users).set({ isDeleted: true }).where(eq(users.id, userId));
  }

  async verifyUserPin(userId: number, pin: string): Promise<boolean> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    return user?.accountPin === pin;
  }

  async createGame(insertGame: InsertGame): Promise<Game> {
    const [game] = await db
      .insert(games)
      .values({
        ...insertGame,
        status: 'waiting'
      })
      .returning();
    return game;
  }

  async getGame(id: number): Promise<Game | undefined> {
    const [game] = await db.select().from(games).where(eq(games.id, id));
    return game || undefined;
  }

  async getGameByGameId(gameId: string): Promise<Game | undefined> {
    const [game] = await db.select().from(games).where(eq(games.gameId, gameId));
    return game || undefined;
  }

  async updateGameStatus(gameId: number, status: string): Promise<void> {
    await db.update(games).set({ status }).where(eq(games.id, gameId));
  }

  async updateGameMove(gameId: number, move: number): Promise<void> {
    await db.update(games).set({ currentMove: move }).where(eq(games.id, gameId));
  }

  async updateGameBoardState(gameId: number, boardState: any): Promise<void> {
    await db.update(games).set({ boardState }).where(eq(games.id, gameId));
  }

  async setGameAIOwner(gameId: number, teamId: number): Promise<void> {
    await db.update(games).set({ aiOwner: teamId }).where(eq(games.id, gameId));
  }

  async addGamePlayer(player: InsertGamePlayer): Promise<GamePlayer> {
    const [gamePlayer] = await db
      .insert(gamePlayers)
      .values(player)
      .returning();
    return gamePlayer;
  }

  async getGamePlayers(gameId: number): Promise<GamePlayer[]> {
    return await db.select().from(gamePlayers).where(eq(gamePlayers.gameId, gameId));
  }

  async setPlayerEscaped(gameId: number, userId: number): Promise<void> {
    await db.update(gamePlayers)
      .set({ isEscaped: true })
      .where(and(eq(gamePlayers.gameId, gameId), eq(gamePlayers.userId, userId)));
  }

  async saveAIAnalysis(gameId: number, boardState: any, analysis: any): Promise<AIAnalysis> {
    const [aiAnalysisRecord] = await db
      .insert(aiAnalysis)
      .values({ gameId, boardState, analysis })
      .returning();
    return aiAnalysisRecord;
  }

  async getLatestAIAnalysis(gameId: number): Promise<AIAnalysis | undefined> {
    const [analysis] = await db.select().from(aiAnalysis)
      .where(eq(aiAnalysis.gameId, gameId))
      .orderBy(desc(aiAnalysis.createdAt))
      .limit(1);
    return analysis || undefined;
  }

  async incrementCalculationCount(gameId: number): Promise<void> {
    const latest = await this.getLatestAIAnalysis(gameId);
    if (latest) {
      await db.update(aiAnalysis)
        .set({ calculationCount: (latest.calculationCount || 0) + 1 })
        .where(eq(aiAnalysis.id, latest.id));
    }
  }
}

export const storage = new DatabaseStorage();

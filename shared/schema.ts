import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  accountPin: varchar("account_pin", { length: 6 }).notNull(),
  points: integer("points").default(0),
  isDeleted: boolean("is_deleted").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  gameId: text("game_id").notNull().unique(),
  ownerId: integer("owner_id").references(() => users.id),
  mode: text("mode").notNull(), // 'standard' or 'death'
  status: text("status").notNull(), // 'waiting', 'active', 'finished', 'terminated'
  currentMove: integer("current_move").default(0),
  maxMoves: integer("max_moves").default(2000),
  boardState: jsonb("board_state"),
  players: jsonb("players"), // Array of player objects
  aiOwner: integer("ai_owner"), // Team that claimed AI
  startedAt: timestamp("started_at"),
  finishedAt: timestamp("finished_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const gamePlayers = pgTable("game_players", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").references(() => games.id),
  userId: integer("user_id").references(() => users.id),
  team: text("team").notNull(), // 'red', 'blue', 'green', 'yellow'
  position: integer("position").notNull(), // 1-4
  isAI: boolean("is_ai").default(false),
  isEscaped: boolean("is_escaped").default(false),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const aiAnalysis = pgTable("ai_analysis", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").references(() => games.id),
  boardState: jsonb("board_state"),
  analysis: jsonb("analysis"), // AI recommendations and probabilities
  calculationCount: integer("calculation_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  accountPin: true,
});

export const insertGameSchema = createInsertSchema(games).pick({
  gameId: true,
  ownerId: true,
  mode: true,
  maxMoves: true,
}).extend({
  maxMoves: z.number().default(1000),
});

export const insertGamePlayerSchema = createInsertSchema(gamePlayers).pick({
  gameId: true,
  userId: true,
  team: true,
  position: true,
  isAI: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof games.$inferSelect;
export type InsertGamePlayer = z.infer<typeof insertGamePlayerSchema>;
export type GamePlayer = typeof gamePlayers.$inferSelect;
export type AIAnalysis = typeof aiAnalysis.$inferSelect;

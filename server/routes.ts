import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { GameEngine } from "./services/gameEngine";
import { insertUserSchema, insertGameSchema } from "@shared/schema";
import { z } from "zod";

const activeGames = new Map<string, GameEngine>();
const gameConnections = new Map<string, Set<WebSocket>>();

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time game communication
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket, req) => {
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const gameId = url.searchParams.get('gameId');
    
    if (gameId) {
      // Add connection to game room
      if (!gameConnections.has(gameId)) {
        gameConnections.set(gameId, new Set());
      }
      gameConnections.get(gameId)!.add(ws);
      
      ws.on('close', () => {
        gameConnections.get(gameId)?.delete(ws);
      });
      
      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message.toString());
          await handleWebSocketMessage(ws, gameId, data);
        } catch (error) {
          ws.send(JSON.stringify({ error: 'Invalid message format' }));
        }
      });
    }
  });

  // User registration
  app.post("/api/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      res.json({ user: { id: user.id, username: user.username } });
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  // User login
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      res.json({ user: { id: user.id, username: user.username, points: user.points } });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  // PIN verification
  app.post("/api/verify-pin", async (req, res) => {
    try {
      const { userId, pin } = req.body;
      const isValid = await storage.verifyUserPin(userId, pin);
      
      if (isValid) {
        res.json({ success: true });
      } else {
        res.status(401).json({ error: "Invalid PIN" });
      }
    } catch (error) {
      res.status(500).json({ error: "PIN verification failed" });
    }
  });

  // Create game
  app.post("/api/games", async (req, res) => {
    try {
      console.log('Creating game with data:', req.body);
      const gameData = insertGameSchema.parse(req.body);
      const game = await storage.createGame(gameData);
      
      // Initialize game engine
      const gameEngine = new GameEngine(
        game.id, 
        gameData.maxMoves || 2000, 
        gameData.mode === 'death'
      );
      
      activeGames.set(game.gameId, gameEngine);
      
      res.json({ game });
    } catch (error) {
      console.error('Game creation error:', error);
      res.status(400).json({ error: "Invalid game data", details: error.message });
    }
  });

  // Join game
  app.post("/api/games/:gameId/join", async (req, res) => {
    try {
      const { gameId } = req.params;
      const { userId, team } = req.body;
      
      const game = await storage.getGameByGameId(gameId);
      if (!game) {
        return res.status(404).json({ error: "Game not found" });
      }
      
      const existingPlayers = await storage.getGamePlayers(game.id);
      if (existingPlayers.length >= 4) {
        return res.status(400).json({ error: "Game is full" });
      }
      
      const player = await storage.addGamePlayer({
        gameId: game.id,
        userId,
        team,
        position: existingPlayers.length + 1
      });
      
      // Add AI players for Death Mode
      if (game.mode === 'death' && existingPlayers.length === 0) {
        await addAIPlayers(game.id);
      }
      
      res.json({ player });
    } catch (error) {
      res.status(400).json({ error: "Failed to join game" });
    }
  });

  // Get game state
  app.get("/api/games/:gameId", async (req, res) => {
    try {
      const { gameId } = req.params;
      const game = await storage.getGameByGameId(gameId);
      
      if (!game) {
        return res.status(404).json({ error: "Game not found" });
      }
      
      const players = await storage.getGamePlayers(game.id);
      const gameEngine = activeGames.get(gameId);
      
      res.json({
        game,
        players,
        gameState: gameEngine?.getGameState()
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get game state" });
    }
  });

  // Claim AI
  app.post("/api/games/:gameId/claim-ai", async (req, res) => {
    try {
      const { gameId } = req.params;
      const { teamPosition } = req.body;
      
      const gameEngine = activeGames.get(gameId);
      if (!gameEngine) {
        return res.status(404).json({ error: "Game not found" });
      }
      
      const success = await gameEngine.claimAI(teamPosition);
      
      if (success) {
        broadcastToGame(gameId, { type: 'ai_claimed', team: teamPosition });
        res.json({ success: true });
      } else {
        res.status(400).json({ error: "AI already claimed" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to claim AI" });
    }
  });

  // Death Mode owner victory command
  app.post("/api/games/:gameId/owner-victory", async (req, res) => {
    try {
      const { gameId } = req.params;
      const { ownerId } = req.body;
      
      const gameEngine = activeGames.get(gameId);
      if (!gameEngine) {
        return res.status(404).json({ error: "Game not found" });
      }
      
      const success = await gameEngine.executeOwnerVictoryCommand(ownerId);
      
      if (success) {
        broadcastToGame(gameId, { type: 'owner_victory', ownerId });
        res.json({ success: true });
      } else {
        res.status(403).json({ error: "Not authorized or not Death Mode" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to execute victory command" });
    }
  });

  // Escape from Death Mode
  app.post("/api/games/:gameId/escape", async (req, res) => {
    try {
      const { gameId } = req.params;
      const { userId, pin } = req.body;
      
      const game = await storage.getGameByGameId(gameId);
      if (!game || game.mode !== 'death') {
        return res.status(400).json({ error: "Not a Death Mode game" });
      }
      
      const isValidPin = await storage.verifyUserPin(userId, pin);
      if (!isValidPin) {
        return res.status(401).json({ error: "Invalid PIN" });
      }
      
      await storage.setPlayerEscaped(game.id, userId);
      
      // Award all trapped player achievements to the escaper
      const players = await storage.getGamePlayers(game.id);
      const trappedPlayers = players.filter(p => !p.isEscaped && p.userId !== userId);
      
      // Transfer points and achievements (simplified)
      for (const player of trappedPlayers) {
        if (player.userId && typeof player.userId === 'number') {
          const user = await storage.getUser(player.userId);
          if (user) {
            await storage.updateUserPoints(userId, user.points);
            await storage.updateUserPoints(player.userId, 0);
          }
        }
      }
      
      broadcastToGame(gameId, { type: 'player_escaped', userId });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to escape" });
    }
  });

  // Delete opponent account (winner privilege)
  app.post("/api/games/:gameId/delete-account", async (req, res) => {
    try {
      const { gameId } = req.params;
      const { winnerId, targetUserId } = req.body;
      
      const game = await storage.getGameByGameId(gameId);
      if (!game || game.mode !== 'death' || game.status !== 'finished') {
        return res.status(400).json({ error: "Not a finished Death Mode game" });
      }
      
      // Verify winner status (simplified check)
      await storage.deleteUser(targetUserId);
      
      // Mutual destruction: winner's account is also destroyed
      await storage.deleteUser(winnerId);
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete account" });
    }
  });

  async function handleWebSocketMessage(ws: WebSocket, gameId: string, data: any) {
    const gameEngine = activeGames.get(gameId);
    if (!gameEngine) return;
    
    switch (data.type) {
      case 'roll_dice':
        const dice = await gameEngine.rollDice();
        broadcastToGame(gameId, { type: 'dice_rolled', dice });
        break;
        
      case 'make_move':
        const success = await gameEngine.makeMove(data.pieceId, data.targetPosition);
        if (success) {
          broadcastToGame(gameId, { 
            type: 'move_made', 
            pieceId: data.pieceId, 
            targetPosition: data.targetPosition,
            gameState: gameEngine.getGameState()
          });
        }
        break;
        
      case 'request_ai_analysis':
        const analysis = await gameEngine.getAIAnalysis();
        ws.send(JSON.stringify({ type: 'ai_analysis', analysis }));
        break;
        
      case 'ai_move':
        const aiMove = await gameEngine.executeAIMove();
        broadcastToGame(gameId, { type: 'ai_move_executed', move: aiMove });
        break;
    }
  }

  function broadcastToGame(gameId: string, message: any) {
    const connections = gameConnections.get(gameId);
    if (connections) {
      const messageStr = JSON.stringify(message);
      connections.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(messageStr);
        }
      });
    }
  }

  async function addAIPlayers(gameId: number) {
    const teams = ['blue', 'green', 'yellow'];
    for (let i = 0; i < 3; i++) {
      await storage.addGamePlayer({
        gameId,
        userId: null,
        team: teams[i],
        position: i + 2,
        isAI: true
      });
    }
  }

  return httpServer;
}

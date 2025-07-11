# AI-Powered Scalable Ludo Game

## Overview

This is a full-stack web application for an AI-powered multiplayer Ludo game with two distinct modes: Standard and "Death Mode" (high-stakes competitive). The application features dynamic team formation, real-time AI analysis powered by Google Gemini, and WebSocket-based multiplayer gameplay.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom game-specific color variables
- **State Management**: TanStack Query for server state, local React state for UI
- **Routing**: Wouter for lightweight client-side routing
- **Real-time Communication**: WebSocket client for live game updates

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ESM modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Real-time**: WebSocket server for multiplayer communication
- **AI Integration**: Google Gemini API for game analysis and strategic recommendations

### Key Components

1. **Game Engine** (`server/services/gameEngine.ts`)
   - Manages game state and rules enforcement
   - Handles player moves and board updates
   - Integrates with AI system for automated moves

2. **AI System** (`server/services/gemini.ts`, `server/services/aiPlayer.ts`)
   - Powered by Google Gemini for strategic analysis
   - Calculates win probabilities and move recommendations
   - Implements aggressive AI behavior in Death Mode

3. **WebSocket Manager** (`server/routes.ts`)
   - Handles real-time multiplayer communication
   - Manages game rooms and player connections
   - Broadcasts game state updates to connected clients

4. **Database Layer** (`server/storage.ts`)
   - Implements repository pattern for data access
   - Manages users, games, players, and AI analysis data
   - Provides abstraction over Drizzle ORM operations

## Data Flow

1. **Game Creation**: User creates game through REST API, stored in PostgreSQL
2. **Player Joining**: Players connect via WebSocket and join game rooms
3. **Game State**: Real-time updates broadcast to all connected players
4. **AI Analysis**: On-demand AI analysis triggered by players with results cached
5. **Move Processing**: Game engine validates moves and updates board state
6. **Database Persistence**: All game states and moves persisted for recovery

## External Dependencies

### Core Dependencies
- **@google/genai**: Google Gemini AI integration for game analysis
- **postgres**: PostgreSQL database connection for Supabase
- **drizzle-orm**: TypeScript ORM for database operations
- **ws**: WebSocket library for real-time communication
- **@tanstack/react-query**: Server state management for React

### UI Dependencies
- **@radix-ui/***: Headless UI components for accessibility
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **wouter**: Lightweight React router

### Development Dependencies
- **vite**: Fast build tool and dev server
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Fast JavaScript bundler for production

## Deployment Strategy

### Development Mode
- Frontend: Vite dev server with HMR
- Backend: tsx with file watching for auto-restart
- Database: Supabase PostgreSQL
- Environment: Replit-optimized with banner injection

### Production Build
- Frontend: Vite builds to `dist/public` directory
- Backend: esbuild bundles server code to `dist/index.js`
- Static serving: Express serves built frontend assets
- Database: Same Supabase connection string for consistency

### Database Schema (Supabase)
The application uses a relational schema with four main tables:
- `users`: Player accounts with authentication and points
- `games`: Game instances with state and configuration
- `gamePlayers`: Many-to-many relationship between users and games
- `aiAnalysis`: Cached AI analysis results for performance

**Migration to Supabase**: Project migrated from Neon to Supabase for better real-time features and community support.

### Key Features Implementation
- **Death Mode**: High-stakes mode with escape prevention and psychological elements
- **AI Ownership**: One team per game can claim AI analysis privileges
- **Dynamic Teams**: Configurable team sizes and player arrangements
- **Real-time Updates**: WebSocket-based live game state synchronization
- **PIN-based Escape**: Secure escape mechanism for Death Mode using account PIN

The architecture prioritizes real-time performance, scalability, and a rich user experience while maintaining data consistency and security.
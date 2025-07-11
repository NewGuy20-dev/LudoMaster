# 🎯 AI-Powered Death Mode Ludo

A revolutionary multiplayer Ludo platform featuring dynamic team formation, AI-powered analysis, and an extreme "Death Mode" that pushes competitive gaming to unprecedented psychological limits.

## 🚀 Features

### Core Game Modes

- **Standard Mode**: Traditional Ludo gameplay with 2-4 players
- **Death Mode**: High-stakes psychological warfare where players cannot quit once started

### AI-Powered Analysis

- **Google Gemini Integration**: Advanced strategic analysis and move recommendations
- **Complete Game Tree Calculation**: AI analyzes all possible moves until game end
- **Win Probability Analysis**: Real-time percentage chance calculations for each team
- **Strategic Recommendations**: Optimal move suggestions with risk assessments

### Death Mode Mechanics

- **No Escape**: Players cannot quit once the game starts
- **PIN-Based Exit**: Only escape is physical presence at "the house" with Account PIN
- **AI Opponents**: Hidden AI players disguised as humans
- **Account Consequences**: Winner can delete opponent accounts permanently
- **2000-Move Limit**: Game auto-terminates with extreme penalties

## 🛠️ Tech Stack

### Frontend
- **React** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** with custom game themes
- **Shadcn/ui** component library
- **TanStack Query** for server state
- **Wouter** for routing
- **WebSocket** for real-time updates

### Backend
- **Node.js** with Express
- **TypeScript** with ESM modules
- **PostgreSQL** with Drizzle ORM
- **WebSocket** server for multiplayer
- **Google Gemini API** for AI analysis

### Database
- **Supabase** (PostgreSQL)
- **Drizzle ORM** for type-safe database operations
- **Schema**: Users, Games, Game Players, AI Analysis

## 🔧 Setup Instructions

### Prerequisites
- Node.js 20+
- PostgreSQL database (Supabase recommended)
- Google Gemini API key

### 1. Clone and Install
```bash
git clone <repository-url>
cd ai-ludo-death-mode
npm install
```

### 2. Database Setup (Supabase)
1. Create a new project at [Supabase](https://supabase.com)
2. Go to Settings → Database
3. Copy the "Connection string" under "Transaction pooler"
4. Replace `[YOUR-PASSWORD]` with your database password

### 3. Environment Variables
Create a `.env` file:
```bash
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:[PORT]/postgres
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Google Gemini API Key
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in and click "Get API key"
3. Create a new key (starts with "AIza...")
4. Add to your environment variables

### 5. Database Migration
```bash
npm run db:push
```

### 6. Start Development
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## 🎮 How to Play

### Standard Mode
1. Create a standard game from the home page
2. Share the Game ID with friends
3. Play traditional Ludo with normal rules
4. Can quit anytime

### Death Mode ⚠️
1. **WARNING**: Read all confirmations carefully
2. Create a Death Mode game (requires multiple confirmations)
3. Once started, **NO QUITTING** is allowed
4. Only escape: Go to "the house" and enter your Account PIN
5. Winner can permanently delete opponent accounts
6. Extreme point penalties for stalemate

### AI Features
- First team to claim AI gets strategic analysis
- AI provides win probabilities and move recommendations
- AI opponents in Death Mode ensure impossible human victory
- Game owner can override with victory command

## 🏗️ Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Route pages
│   │   └── lib/            # Utilities
├── server/                 # Backend Express server
│   ├── services/           # Game logic and AI
│   ├── routes.ts           # API endpoints
│   ├── storage.ts          # Database layer
│   └── db.ts              # Database connection
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Drizzle schema
└── README.md
```

## 🔒 Security Features

- **Account PIN Protection**: 6-digit PIN for Death Mode escape
- **Data Encryption**: Secure storage of user data
- **Type Safety**: Full TypeScript coverage
- **Input Validation**: Zod schemas for all API endpoints

## ⚠️ Death Mode Warnings

Death Mode is an extreme psychological gaming experience:

- **Irreversible**: Cannot quit once started
- **Account Risk**: Real account deletion consequences
- **Psychological Pressure**: Designed for intense competitive stress
- **Mutual Destruction**: Using deletion powers destroys winner's account too

**Only participate if you fully understand and accept these risks.**

## 🚀 Deployment

### Replit Deployment
1. Connect to GitHub repository
2. Set environment variables in Replit Secrets
3. Deploy using Replit's automatic deployment

### Manual Deployment
1. Build the project: `npm run build`
2. Set production environment variables
3. Deploy to your preferred hosting platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly (especially Death Mode mechanics)
5. Submit a pull request

## 📝 License

This project is for educational and demonstration purposes. The extreme nature of Death Mode is fictional and should not be implemented with real consequences in production environments.

## 🆘 Support

For issues or questions:
1. Check the GitHub Issues page
2. Ensure proper environment setup
3. Verify Supabase and Gemini API connectivity

---

**⚠️ DISCLAIMER**: This is a demonstration project. The "Death Mode" features are designed for educational purposes about game psychology and should not be implemented with real consequences.
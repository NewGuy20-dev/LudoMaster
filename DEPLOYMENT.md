# 🚀 Deployment Guide

This guide covers deployment options for the AI-Powered Death Mode Ludo game.

## Prerequisites

- Node.js 20+
- Supabase account
- Google Gemini API key

## 🔧 Supabase Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New project"
3. Choose your organization
4. Set project name and database password

### 2. Get Database URL
1. Go to Settings → Database
2. Find "Connection string" under "Transaction pooler"
3. Copy the URI value
4. Replace `[YOUR-PASSWORD]` with your actual database password

Example format:
```
postgresql://postgres.abcdefghijklmnop:your-password@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

## 🤖 Google Gemini API Setup

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in with Google account
3. Click "Get API key"
4. Create new key (free tier available)
5. Copy the key (starts with "AIza...")

## 🌐 Replit Deployment

### 1. Environment Variables
Add these to Replit Secrets:
```
DATABASE_URL=your_supabase_connection_string
GEMINI_API_KEY=your_gemini_api_key
```

### 2. Deploy
1. The project will auto-deploy when you run it
2. Replit provides automatic HTTPS and domain
3. WebSocket connections work out of the box

## 📦 Vercel Deployment

### 1. Project Setup
```bash
npm install -g vercel
vercel
```

### 2. Environment Variables
Add in Vercel dashboard:
- `DATABASE_URL`
- `GEMINI_API_KEY`

### 3. Build Configuration
Create `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.ts",
      "use": "@vercel/node"
    },
    {
      "src": "client/**",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "../dist/public"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "client/$1"
    }
  ]
}
```

## 🐳 Docker Deployment

### 1. Dockerfile
```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 5000
CMD ["npm", "start"]
```

### 2. Docker Compose
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    restart: unless-stopped
```

## ☁️ Railway Deployment

1. Connect GitHub repository to Railway
2. Add environment variables in Railway dashboard
3. Railway auto-detects Node.js and deploys

## 🔒 Production Security

### 1. Environment Variables
```bash
# Production
NODE_ENV=production
DATABASE_URL=your_production_db_url
GEMINI_API_KEY=your_api_key

# Optional: Custom domain
DOMAIN=yourdomain.com
```

### 2. Security Headers
The Express server includes basic security headers:
- CORS configuration
- Rate limiting for API endpoints
- Input validation with Zod

### 3. Database Security
- Use connection pooling for production
- Enable SSL connections
- Rotate API keys regularly

## 📊 Monitoring

### 1. Health Checks
The server provides a health endpoint:
```
GET /health
```

### 2. Logging
- Express request logging
- WebSocket connection monitoring
- AI API usage tracking

## 🚨 Death Mode Considerations

### Legal and Ethical
- Death Mode is for demonstration purposes only
- Do not implement real account deletion in production
- Include clear disclaimers about fictional consequences
- Consider age restrictions and psychological warnings

### Technical Safeguards
- Implement account recovery mechanisms
- Add cooling-off periods
- Provide emergency override systems
- Log all critical actions

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Fails**
   - Verify Supabase URL format
   - Check password contains no special URL characters
   - Ensure IP allowlisting is configured

2. **Gemini API Errors**
   - Verify API key is active
   - Check usage quotas
   - Monitor rate limits

3. **WebSocket Issues**
   - Ensure HTTPS for production
   - Check firewall settings
   - Verify proper proxy configuration

### Debug Mode
Enable detailed logging:
```bash
NODE_ENV=development
DEBUG=true
```

## 📈 Scaling

### Database Optimization
- Add database indexes for game queries
- Implement connection pooling
- Consider read replicas for analytics

### Application Scaling
- Use horizontal scaling with load balancers
- Implement session affinity for WebSocket
- Cache frequently accessed data

### AI Optimization
- Implement response caching
- Use streaming for long calculations
- Consider AI service redundancy

---

**⚠️ IMPORTANT**: Always test Death Mode features thoroughly in staging environments before production deployment. The psychological aspects require careful handling and proper user warnings.
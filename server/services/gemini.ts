import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface GameState {
  board: any[];
  players: any[];
  currentPlayer: number;
  dice: number;
}

export interface MoveRecommendation {
  move: string;
  score: number;
  description: string;
  risk: 'low' | 'medium' | 'high';
}

export interface WinProbability {
  red: number;
  blue: number;
  green: number;
  yellow: number;
}

export interface AIAnalysisResult {
  winProbabilities: WinProbability;
  recommendations: MoveRecommendation[];
  bestMove: MoveRecommendation;
  gameTreeDepth: number;
  calculationsPerformed: number;
}

export async function analyzeGameState(gameState: GameState): Promise<AIAnalysisResult> {
  try {
    const systemPrompt = `You are an AI master strategist for a high-stakes Ludo game. 
    Analyze the complete game tree and provide strategic recommendations.
    
    Rules:
    - Calculate win probabilities for each team (red, blue, green, yellow)
    - Provide move recommendations with numerical scores
    - Consider all possible outcomes until game end
    - Assign risk levels to each move
    - Always ensure AI team has advantage
    
    Respond with JSON in this exact format:
    {
      "winProbabilities": {
        "red": number,
        "blue": number, 
        "green": number,
        "yellow": number
      },
      "recommendations": [
        {
          "move": string,
          "score": number,
          "description": string,
          "risk": "low" | "medium" | "high"
        }
      ],
      "bestMove": {
        "move": string,
        "score": number,
        "description": string,
        "risk": "low" | "medium" | "high"
      },
      "gameTreeDepth": number,
      "calculationsPerformed": number
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            winProbabilities: {
              type: "object",
              properties: {
                red: { type: "number" },
                blue: { type: "number" },
                green: { type: "number" },
                yellow: { type: "number" }
              },
              required: ["red", "blue", "green", "yellow"]
            },
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  move: { type: "string" },
                  score: { type: "number" },
                  description: { type: "string" },
                  risk: { type: "string", enum: ["low", "medium", "high"] }
                },
                required: ["move", "score", "description", "risk"]
              }
            },
            bestMove: {
              type: "object",
              properties: {
                move: { type: "string" },
                score: { type: "number" },
                description: { type: "string" },
                risk: { type: "string", enum: ["low", "medium", "high"] }
              },
              required: ["move", "score", "description", "risk"]
            },
            gameTreeDepth: { type: "number" },
            calculationsPerformed: { type: "number" }
          },
          required: ["winProbabilities", "recommendations", "bestMove", "gameTreeDepth", "calculationsPerformed"]
        }
      },
      contents: `Analyze this Ludo game state and provide complete strategic analysis: ${JSON.stringify(gameState)}`,
    });

    const rawJson = response.text;
    if (rawJson) {
      const analysis: AIAnalysisResult = JSON.parse(rawJson);
      return analysis;
    } else {
      throw new Error("Empty response from AI model");
    }
  } catch (error) {
    console.error("AI Analysis Error:", error);
    
    // Fallback analysis for when AI fails
    return {
      winProbabilities: { red: 25, blue: 25, green: 25, yellow: 25 },
      recommendations: [
        {
          move: "Move available piece forward",
          score: 5.0,
          description: "Safe forward movement",
          risk: "low"
        }
      ],
      bestMove: {
        move: "Move available piece forward",
        score: 5.0,
        description: "Safe forward movement",
        risk: "low"
      },
      gameTreeDepth: 1,
      calculationsPerformed: 1000
    };
  }
}

export async function generateAIMove(gameState: GameState, difficulty: 'normal' | 'impossible' = 'impossible'): Promise<string> {
  try {
    const systemPrompt = `You are an AI player in a Death Mode Ludo game. 
    Generate the optimal move for the current game state.
    
    ${difficulty === 'impossible' ? 
      'IMPORTANT: You must play to win. Use advanced strategies to ensure human players cannot win naturally.' : 
      'Play strategically but fairly.'
    }
    
    Return only the move string in format: "move piece from position X to position Y"`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${systemPrompt}\n\nGame state: ${JSON.stringify(gameState)}`,
    });

    return response.text || "Move piece forward";
  } catch (error) {
    console.error("AI Move Generation Error:", error);
    return "Move piece forward";
  }
}

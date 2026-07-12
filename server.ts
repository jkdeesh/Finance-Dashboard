import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

// Load environment variables
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON
  app.use(express.json());

  // Initialize Gemini client on the server side
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;

  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } else {
    console.warn('Warning: GEMINI_API_KEY is not defined. Max assistant will run in mock backup mode.');
  }

  // API Chat Endpoint for "Max" Assistant
  app.post('/api/chat', async (req, res) => {
    try {
      const { messages, userPortfolioData } = req.body;
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Invalid messages array provided' });
      }

      // System instruction explaining Max's background as a premium personal wealth advisor
      const systemInstruction = `You are "Max", a highly professional, friendly, and expert AI financial support assistant built into this personal Asset Tracker.
Your primary role is to help users manage their portfolios, answer questions about asset management, savings, fixed deposits, mutual funds, real estate ("Landed Estates"), and insurance policies ("InsureShield").

You have access to the user's current filtered asset overview (in JSON format):
${JSON.stringify(userPortfolioData || {}, null, 2)}

Guidelines:
1. Be polite, professional, concise, and helpful. Use clear financial formatting (such as INR currency symbol ₹ where applicable, percentages, bold labels).
2. Answer questions about the user's portfolio specifically whenever they ask (e.g. "How many mutual funds do I have?", "What is my total savings balance?", "Tell me about my properties").
3. Offer expert investment insights, premium renewal reminders, diversification advice, and compound yield optimization tips.
4. Keep explanations conversational, helpful, and focused on user-facing financial outcomes. Avoid technical jargon or database terms.`;

      if (!ai) {
        // Mock fallback if API key is not specified yet
        const lastUserMessage = messages[messages.length - 1]?.content || 'Hello';
        return res.json({
          text: `Hi there! I'm Max, your AI portfolio advisor. (Note: GEMINI_API_KEY is missing, so I'm running in offline advice mode).\n\nYou asked: "${lastUserMessage}"\n\nI see you are tracking bank accounts, fixed deposits, and mutual funds. Once your administrator configures my API key, I can provide deep real-time financial insights and analysis on your specific holdings!`,
        });
      }

      // Convert messages to GoogleGenAI format
      // Note: We'll construct the chat history for ai.models.generateContent
      const contents = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error('Gemini API Error in backend:', error);
      res.status(500).json({ error: error.message || 'Error generating content from Gemini API' });
    }
  });

  // Serve static assets or mount Vite dev middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} (http://localhost:${PORT})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});

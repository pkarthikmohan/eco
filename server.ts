import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import nodeFetch from "node-fetch";
import { GoogleGenAI, Type } from "@google/genai";

// Use global fetch if available (Node 18+), otherwise use node-fetch
const fetch = (globalThis.fetch || nodeFetch) as unknown as typeof nodeFetch;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Proxy for Open Food Facts Search to avoid CORS
  app.get("/api/search", async (req, res) => {
    const query = req.query.q as string;
    console.log("Search request received for query:", query);
    if (!query) return res.status(400).json({ error: "Missing query" });

    try {
      const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&json=1&page_size=5`;
      console.log("Fetching from Open Food Facts:", url);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'EcoCheck/1.0 (https://github.com/yourusername/ecocheck)'
        }
      });
      
      console.log("Open Food Facts response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Search results count:", data.products?.length || 0);
        return res.json(data);
      }
      
      throw new Error(`Open Food Facts returned ${response.status}`);
    } catch (error) {
      console.error("Search proxy error, attempting AI fallback:", error);
      
      // Fallback to Gemini if API is down
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.error("GEMINI_API_KEY is missing in server environment");
        return res.status(500).json({ 
          error: "Search failed and no AI fallback available", 
          details: "API key missing" 
        });
      }

      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `The user is searching for "${query}". The product database is currently unavailable. 
        Please provide a list of 3-5 real-world products that match this search query.
        Return the results in JSON format matching the Open Food Facts structure:
        {
          "products": [
            {
              "product_name": "Product Name",
              "brands": "Brand Name",
              "code": "unique_code_123",
              "categories": "Category1, Category2",
              "ingredients_text": "Ingredient 1, Ingredient 2..."
            }
          ]
        }`;

        const aiResponse = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                products: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      product_name: { type: Type.STRING },
                      brands: { type: Type.STRING },
                      code: { type: Type.STRING },
                      categories: { type: Type.STRING },
                      ingredients_text: { type: Type.STRING }
                    },
                    required: ["product_name", "brands", "code"]
                  }
                }
              },
              required: ["products"]
            }
          }
        });

        const text = aiResponse.text;
        if (text) {
          console.log("AI Fallback search results generated successfully");
          const parsedData = JSON.parse(text);
          return res.json(parsedData);
        }
        throw new Error("AI returned empty response");
      } catch (aiError) {
        console.error("AI Fallback also failed:", aiError);
        return res.status(500).json({ 
          error: "Failed to fetch products", 
          details: error instanceof Error ? error.message : String(error),
          aiError: aiError instanceof Error ? aiError.message : String(aiError)
        });
      }
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

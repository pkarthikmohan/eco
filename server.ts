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
        const data = (await response.json()) as any;
        console.log("Search results count:", data.products?.length || 0);
        return res.json(data);
      }
      
      res.status(response.status).json({ error: `Open Food Facts returned ${response.status}` });
    } catch (error) {
      console.error("Search proxy error:", error);
      res.status(500).json({ 
        error: "Failed to fetch from Open Food Facts", 
        details: error instanceof Error ? error.message : String(error)
      });
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

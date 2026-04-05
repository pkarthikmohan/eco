import { GoogleGenAI, Type } from "@google/genai";
import { EcoAnalysis, Product } from "../types";

export async function analyzeProduct(product: Product): Promise<EcoAnalysis> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  const prompt = `Analyze the environmental impact of this product based on its details:
  Name: ${product.product_name}
  Brand: ${product.brands || 'Unknown'}
  Categories: ${product.categories || 'Unknown'}
  Ingredients: ${product.ingredients_text || 'Not listed'}
  
  Provide a detailed sustainability analysis in JSON format.`;

  console.log("Analyzing product:", product.product_name);
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          ecoScore: { type: Type.NUMBER, description: "Score from 0-100" },
          grade: { type: Type.STRING, enum: ["A", "B", "C", "D", "F"] },
          carbonFootprint: { type: Type.STRING, description: "Estimated carbon footprint description" },
          waterUsage: { type: Type.STRING, description: "Estimated water usage description" },
          packagingScore: { type: Type.NUMBER, description: "Score from 0-100" },
          concerns: { type: Type.ARRAY, items: { type: Type.STRING } },
          alternatives: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                reason: { type: Type.STRING },
                ecoScore: { type: Type.NUMBER }
              },
              required: ["name", "reason", "ecoScore"]
            }
          },
          verdict: { type: Type.STRING, description: "2 sentence plain English summary" }
        },
        required: ["ecoScore", "grade", "carbonFootprint", "waterUsage", "packagingScore", "concerns", "alternatives", "verdict"]
      }
    }
  });

  const text = response.text;
  console.log("AI Response received");
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text) as EcoAnalysis;
}

export async function analyzeImage(base64Image: string, mimeType: string): Promise<EcoAnalysis & { productName: string; brand: string }> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  const prompt = `Identify the product in this image and analyze its environmental impact. 
  Provide a detailed sustainability analysis in JSON format.`;

  const imagePart = {
    inlineData: {
      data: base64Image.split(',')[1] || base64Image,
      mimeType: mimeType || 'image/jpeg',
    },
  };

  console.log("Analyzing image... MIME type:", mimeType);
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: [imagePart, { text: prompt }] },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          productName: { type: Type.STRING, description: "Identified product name" },
          brand: { type: Type.STRING, description: "Identified brand" },
          ecoScore: { type: Type.NUMBER, description: "Score from 0-100" },
          grade: { type: Type.STRING, enum: ["A", "B", "C", "D", "F"] },
          carbonFootprint: { type: Type.STRING, description: "Estimated carbon footprint description" },
          waterUsage: { type: Type.STRING, description: "Estimated water usage description" },
          packagingScore: { type: Type.NUMBER, description: "Score from 0-100" },
          concerns: { type: Type.ARRAY, items: { type: Type.STRING } },
          alternatives: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                reason: { type: Type.STRING },
                ecoScore: { type: Type.NUMBER }
              },
              required: ["name", "reason", "ecoScore"]
            }
          },
          verdict: { type: Type.STRING, description: "2 sentence plain English summary" }
        },
        required: ["productName", "brand", "ecoScore", "grade", "carbonFootprint", "waterUsage", "packagingScore", "concerns", "alternatives", "verdict"]
      }
    }
  });

  const text = response.text;
  console.log("Image analysis raw response received:", text);
  if (!text) throw new Error("No response from AI");
  try {
    return JSON.parse(text) as EcoAnalysis & { productName: string; brand: string };
  } catch (parseErr) {
    console.error("Failed to parse AI response as JSON:", text);
    throw new Error("Invalid response format from AI");
  }
}

export async function searchProducts(query: string): Promise<Product[]> {
  const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error("Failed to search products");
  const data = await response.json();
  return data.products || [];
}

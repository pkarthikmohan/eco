import { GoogleGenAI, Type } from "@google/genai";
import { EcoAnalysis, Product } from "../types";

export async function analyzeProduct(product: Product): Promise<EcoAnalysis> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  const prompt = `Analyze the environmental impact of this product based on its details:
  Name: ${product.product_name}
  Brand: ${product.brands || 'Unknown'}
  Categories: ${product.categories || 'Unknown'}
  Ingredients: ${product.ingredients_text || 'Not listed'}
  
  Provide a detailed sustainability analysis in JSON format.
  Include real-world citations or links to sources for the data.
  Provide explanations for the carbon footprint, water usage, and packaging scores.
  Suggest alternative products with real URLs (e.g., from official sites or major retailers).`;

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
          carbonExplanation: { type: Type.STRING, description: "Detailed explanation of why the carbon score is what it is" },
          waterUsage: { type: Type.STRING, description: "Estimated water usage description" },
          waterExplanation: { type: Type.STRING, description: "Detailed explanation of why the water usage score is what it is" },
          packagingScore: { type: Type.NUMBER, description: "Score from 0-100" },
          packagingExplanation: { type: Type.STRING, description: "Detailed explanation of why the packaging score is what it is" },
          concerns: { type: Type.ARRAY, items: { type: Type.STRING } },
          alternatives: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                reason: { type: Type.STRING },
                ecoScore: { type: Type.NUMBER },
                url: { type: Type.STRING, description: "Real URL for the alternative product" }
              },
              required: ["name", "reason", "ecoScore", "url"]
            }
          },
          citations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                url: { type: Type.STRING }
              },
              required: ["title", "url"]
            }
          },
          verdict: { type: Type.STRING, description: "2 sentence plain English summary" }
        },
        required: ["ecoScore", "grade", "carbonFootprint", "carbonExplanation", "waterUsage", "waterExplanation", "packagingScore", "packagingExplanation", "concerns", "alternatives", "citations", "verdict"]
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
  First, determine if the image contains a consumer product (like food, cosmetics, electronics, etc.).
  If the image is of a human, animal, or anything that is NOT a consumer product, set "isProduct" to false and provide a "rejectionReason".
  If it is a product, provide a detailed sustainability analysis in JSON format.
  Include real-world citations or links to sources for the data.
  Provide explanations for the carbon footprint, water usage, and packaging scores.
  Suggest alternative products with real URLs.`;

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
          isProduct: { type: Type.BOOLEAN, description: "Whether the image contains a consumer product" },
          rejectionReason: { type: Type.STRING, description: "Reason for rejection if not a product (e.g., 'Image contains a human, please upload a product')" },
          productName: { type: Type.STRING, description: "Identified product name" },
          brand: { type: Type.STRING, description: "Identified brand" },
          ecoScore: { type: Type.NUMBER, description: "Score from 0-100" },
          grade: { type: Type.STRING, enum: ["A", "B", "C", "D", "F"] },
          carbonFootprint: { type: Type.STRING, description: "Estimated carbon footprint description" },
          carbonExplanation: { type: Type.STRING, description: "Detailed explanation of carbon score" },
          waterUsage: { type: Type.STRING, description: "Estimated water usage description" },
          waterExplanation: { type: Type.STRING, description: "Detailed explanation of water score" },
          packagingScore: { type: Type.NUMBER, description: "Score from 0-100" },
          packagingExplanation: { type: Type.STRING, description: "Detailed explanation of packaging score" },
          concerns: { type: Type.ARRAY, items: { type: Type.STRING } },
          alternatives: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                reason: { type: Type.STRING },
                ecoScore: { type: Type.NUMBER },
                url: { type: Type.STRING }
              },
              required: ["name", "reason", "ecoScore", "url"]
            }
          },
          citations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                url: { type: Type.STRING }
              },
              required: ["title", "url"]
            }
          },
          verdict: { type: Type.STRING, description: "2 sentence plain English summary" }
        },
        required: ["isProduct", "productName", "brand", "ecoScore", "grade", "carbonFootprint", "carbonExplanation", "waterUsage", "waterExplanation", "packagingScore", "packagingExplanation", "concerns", "alternatives", "citations", "verdict"]
      }
    }
  });

  const text = response.text;
  console.log("Image analysis raw response received:", text);
  if (!text) throw new Error("No response from AI");
  try {
    const result = JSON.parse(text);
    return result as EcoAnalysis & { productName: string; brand: string };
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

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK lazily to protect against crashes if GEMINI_API_KEY is not defined.
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("GEMINI_API_KEY is missing.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: key || "dummy_key",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Main generate endpoint
app.post("/api/generate", async (req, res) => {
  try {
    const { toolType, params } = req.body;
    if (!toolType) {
      return res.status(400).json({ error: "toolType is required" });
    }

    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is empty. Please set it in the Settings/Secrets panel of high level AI Studio interface."
      });
    }

    const ai = getGeminiClient();

    let prompt = "";
    let schema: any = {};

    if (toolType === "idea") {
      const { niche, topic } = params || {};
      prompt = `Generate exactly 20 highly viral, micro-optimized, creative video ideas targeting the niche "${niche || 'any niche'}" on the topic "${topic || 'viral topic'}". Ensure these generate ultra-high CTR. Provide a catchy title, a dynamic clickbait angle summary, target audience specification, estimated viewer retention prediction (e.g. "87%", "92%"), and visual hook pacing tips.`;
      schema = {
        type: Type.OBJECT,
        properties: {
          ideas: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                angle: { type: Type.STRING },
                targetAudience: { type: Type.STRING },
                estimatedRetention: { type: Type.STRING },
                pacingTip: { type: Type.STRING }
              },
              required: ["id", "title", "angle", "targetAudience", "estimatedRetention", "pacingTip"]
            }
          }
        },
        required: ["ideas"]
      };
    } else if (toolType === "title") {
      const { topic, tone } = params || {};
      prompt = `Generate highly optimized, algorithm-optimized title variations for content about: "${topic || 'viral video'}". Tone: "${tone || 'High Energy'}". Output three diverse groups of exactly 10 ideas each: Clickable intrigue titles, SEO keyword titles, and punchy portrait Shorts titles.`;
      schema = {
        type: Type.OBJECT,
        properties: {
          clickable: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          seo: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          shorts: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["clickable", "seo", "shorts"]
      };
    } else if (toolType === "description") {
      const { topic, title, corePoints } = params || {};
      prompt = `Create a fully formatted, clean, structural YouTube description optimizing SEO tags, video chapters outlines, generic social templates, and engaging Calls to Action. Use title: "${title || 'Working Video Title'}", topic: "${topic || 'General Topic'}", and key outline details: "${corePoints || 'Points of interest'}". Also extract relevant keywords strings (tags) and hashtags.`;
      schema = {
        type: Type.OBJECT,
        properties: {
          formattedDescription: { type: Type.STRING },
          tags: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          hashtags: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["formattedDescription", "tags", "hashtags"]
      };
    } else if (toolType === "thumbnail") {
      const { topic, emotion } = params || {};
      prompt = `Generate 8 shocking thumbnail overlay text layouts (caps, punchy, strictly under 4 words max, e.g. "HE CRIED", "DON'T DO THIS") playing on the core human trigger "${emotion || 'Curiosity'}" for a video regarding: "${topic || 'viral theme'}". Supply clear styling specifications (contrasting backing design, focal element layout, text alignment guides for the canvas grid)`;
      schema = {
        type: Type.OBJECT,
        properties: {
          suggestions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                emotiveness: { type: Type.STRING },
                bgColor: { type: Type.STRING },
                textColor: { type: Type.STRING },
                compositionTip: { type: Type.STRING }
              },
              required: ["text", "emotiveness", "bgColor", "textColor", "compositionTip"]
            }
          }
        },
        required: ["suggestions"]
      };
    } else if (toolType === "thumbnail_prompt") {
      const { topic, niche, style } = params || {};
      prompt = `Create exactly 5 elite-level, production-ready thumbnail prompt concepts designed for high-CTR YouTube clicks. The target video is on topic: "${topic || 'viral theme'}" in the niche: "${niche || 'general'}". Style direction: "${style || 'Highly cinematic and hyper-realistic'}". For each concept, generate:
1. A highly descriptive, photorealistic "image prompt" for text-to-image generators (like Midjourney, Dall-E 3, or Imagen) specifying elements, composition, mood, and lighting.
2. A suggested "overlay text" (1-3 words in CAPS, highly contrasting).
3. A psychological "trigger description" explaining why this catches eyes.
4. "visualConcept" name/title for the thumbnail concept.
5. Layout placement hints.`;
      schema = {
        type: Type.OBJECT,
        properties: {
          prompts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                conceptName: { type: Type.STRING },
                imagePrompt: { type: Type.STRING },
                overlayText: { type: Type.STRING },
                psychologyTrigger: { type: Type.STRING },
                layoutPlacement: { type: Type.STRING }
              },
              required: ["conceptName", "imagePrompt", "overlayText", "psychologyTrigger", "layoutPlacement"]
            }
          }
        },
        required: ["prompts"]
      };
    } else if (toolType === "script") {
      const { title, format, tone } = params || {};
      prompt = `Generate a comprehensive narration script layout for a YouTube ${format || 'shorts'} video with the title: "${title || 'Amazing Video'}" in a distinct "${tone || 'energetic'}" tone. Create powerful hook visuals/audios, detailed incremental video scripting scenes detailing staging visual layouts, active spoken dialogue lines, SFX notes, and a high-converting channel subscription CTA.`;
      schema = {
        type: Type.OBJECT,
        properties: {
          format: { type: Type.STRING },
          hookVisual: { type: Type.STRING },
          hookAudio: { type: Type.STRING },
          sections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                sceneNum: { type: Type.NUMBER },
                visualStyle: { type: Type.STRING },
                spokenLine: { type: Type.STRING },
                sfx: { type: Type.STRING },
                duration: { type: Type.STRING }
              },
              required: ["sceneNum", "visualStyle", "spokenLine", "sfx", "duration"]
            }
          },
          ctaVisual: { type: Type.STRING },
          ctaSpoken: { type: Type.STRING }
        },
        required: ["format", "hookVisual", "hookAudio", "sections", "ctaVisual", "ctaSpoken"]
      };
    } else if (toolType === "trends" || toolType === "trend") {
      const { category, platform } = params || {};
      prompt = `Track 5 fresh, viral trend concepts in the "${category || 'general'}" creators sector customized specifically for "${platform || 'youtube'}". Detail why they are trending, audience psychology triggers, and 3 production concept angles for a creator to adopt.`;
      schema = {
        type: Type.OBJECT,
        properties: {
          trends: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                trendTitle: { type: Type.STRING },
                velocity: { type: Type.STRING },
                explanation: { type: Type.STRING },
                targetAudienceTip: { type: Type.STRING },
                angles: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ["trendTitle", "velocity", "explanation", "targetAudienceTip", "angles"]
            }
          }
        },
        required: ["trends"]
      };
    } else {
      return res.status(400).json({ error: "Invalid toolType" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 1.0,
      }
    });

    const text = response.text;
    if (!text) {
      return res.status(500).json({ error: "Empty response from Gemini AI" });
    }

    try {
      const parsedData = JSON.parse(text);
      res.json(parsedData);
    } catch (parseErr) {
      console.error("Failed to parse Gemini JSON:", text, parseErr);
      res.status(500).json({ error: "Invalid JSON structure returned by Gemini model", raw: text });
    }
  } catch (error: any) {
    console.error("Gemini server error:", error);
    res.status(500).json({ error: error.message || "An error occurred during generation." });
  }
});

// Real working image generation using Imagen with elegant dynamic fallback if subscription is free tier
app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt, aspectRatio } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "prompt is required" });
    }

    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is empty. Please set it in the Settings/Secrets panel of your AI Studio interface."
      });
    }

    const ai = getGeminiClient();

    let isFallback = false;
    let fallbackReason = "";
    let dataUrl = "";

    try {
      console.log("Calling ai.models.generateImages with prompt:", prompt);
      const response = await ai.models.generateImages({
        model: "imagen-4.0-generate-001",
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: "image/jpeg",
          aspectRatio: aspectRatio || "16:9",
        }
      });

      if (response && response.generatedImages && response.generatedImages.length > 0) {
        const img = response.generatedImages[0];
        const base64Bytes = img.image.imageBytes;
        dataUrl = `data:image/jpeg;base64,${base64Bytes}`;
      } else {
        throw new Error("No image was returned from Gemini/Imagen.");
      }
    } catch (apiError: any) {
      console.warn("Imagen API failed (requires paid upgrade). Renting a premium stock photo fallback match. Error:", apiError.message);
      isFallback = true;
      fallbackReason = apiError.message || "Imagen billing limit.";

      // Dimension mappings for Unsplash source
      let width = 1200;
      let height = 675;
      if (aspectRatio === "9:16") {
        width = 675;
        height = 1200;
      } else if (aspectRatio === "1:1") {
        width = 1000;
        height = 1000;
      } else if (aspectRatio === "4:3") {
        width = 1000;
        height = 750;
      } else if (aspectRatio === "3:4") {
        width = 750;
        height = 1000;
      }

      // Filter and pick 2-4 clean keywords from prompt for Unsplash search
      const cleanPromptForKeywords = (textStr: string): string => {
        const words = textStr
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, "")
          .split(/\s+/)
          .filter(w => w.length > 3 && !["with", "this", "that", "these", "those", "from", "your", "their", "only", "have", "some", "here", "there", "about", "photo", "image", "photorealistic", "cinematic", "resolution", "rendering", "hyperrealistic", "highly", "detailed", "render", "super", "realistic", "styled", "studio"].includes(w));
        if (words.length === 0) return "workspace,studio,tech";
        return words.slice(0, 4).join(",");
      };

      const keywords = cleanPromptForKeywords(prompt);
      dataUrl = `https://images.unsplash.com/featured/${width}x${height}/?${encodeURIComponent(keywords)}&sig=${Math.floor(Math.random() * 100000)}`;
    }

    res.json({
      imageUrl: dataUrl,
      isFallback,
      fallbackReason
    });
  } catch (error: any) {
    console.error("Image generation error:", error);
    res.status(500).json({ error: error.message || "An error occurred during image generation." });
  }
});

async function runServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

runServer();

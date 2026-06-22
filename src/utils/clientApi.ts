// Client-side API key Direct Routing Engine
// Designed for seamless operation in static file builds and APK bundles.
// This allows the client to bypass the backend `/api/generate` proxy completely when they input their own keys!

export const GET_PROMPT_AND_SCHEMA = (type: string, params: any) => {
  let prompt = "";
  let schema: any = {};

  if (type === "idea") {
    const { niche, topic } = params || {};
    prompt = `Generate exactly 20 highly viral, micro-optimized, creative video ideas targeting the niche "${niche || 'any niche'}" on the topic "${topic || 'viral topic'}". Ensure these generate ultra-high CTR. Provide a catchy title, a dynamic clickbait angle summary, target audience specification, estimated viewer retention prediction (e.g. "87%", "92%"), and visual hook pacing tips.`;
    schema = {
      type: "object",
      properties: {
        ideas: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              title: { type: "string" },
              angle: { type: "string" },
              targetAudience: { type: "string" },
              estimatedRetention: { type: "string" },
              pacingTip: { type: "string" }
            },
            required: ["id", "title", "angle", "targetAudience", "estimatedRetention", "pacingTip"]
          }
        }
      },
      required: ["ideas"]
    };
  } else if (type === "title") {
    const { topic, tone } = params || {};
    prompt = `Generate highly optimized, algorithm-optimized title variations for content about: "${topic || 'viral video'}". Tone: "${tone || 'High Energy'}". Output three diverse groups of exactly 10 ideas each: Clickable intrigue titles, SEO keyword titles, and punchy portrait Shorts titles.`;
    schema = {
      type: "object",
      properties: {
        clickable: {
          type: "array",
          items: { type: "string" }
        },
        seo: {
          type: "array",
          items: { type: "string" }
        },
        shorts: {
          type: "array",
          items: { type: "string" }
        }
      },
      required: ["clickable", "seo", "shorts"]
    };
  } else if (type === "description") {
    const { topic, title, corePoints } = params || {};
    prompt = `Create a fully formatted, clean, structural YouTube description optimizing SEO tags, video chapters outlines, generic social templates, and engaging Calls to Action. Use title: "${title || 'Working Video Title'}", topic: "${topic || 'General Topic'}", and key outline details: "${corePoints || 'Points of interest'}". Also extract relevant keywords strings (tags) and hashtags.`;
    schema = {
      type: "object",
      properties: {
        formattedDescription: { type: "string" },
        tags: {
          type: "array",
          items: { type: "string" }
        },
        hashtags: {
          type: "array",
          items: { type: "string" }
        }
      },
      required: ["formattedDescription", "tags", "hashtags"]
    };
  } else if (type === "thumbnail") {
    const { topic, emotion } = params || {};
    prompt = `Generate 8 shocking thumbnail overlay text layouts (caps, punchy, strictly under 4 words max, e.g. "HE CRIED", "DON'T DO THIS") playing on the core human trigger "${emotion || 'Curiosity'}" for a video regarding: "${topic || 'viral theme'}". Supply clear styling specifications (contrasting backing design, focal element layout, text alignment guides for the canvas grid)`;
    schema = {
      type: "object",
      properties: {
        suggestions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              text: { type: "string" },
              emotiveness: { type: "string" },
              bgColor: { type: "string" },
              textColor: { type: "string" },
              compositionTip: { type: "string" }
            },
            required: ["text", "emotiveness", "bgColor", "textColor", "compositionTip"]
          }
        }
      },
      required: ["suggestions"]
    };
  } else if (type === "thumbnail_prompt") {
    const { topic, niche, style } = params || {};
    prompt = `Create exactly 5 elite-level, production-ready thumbnail prompt concepts designed for high-CTR YouTube clicks. The target video is on topic: "${topic || 'viral theme'}" in the niche: "${niche || 'general'}". Style direction: "${style || 'Highly cinematic and hyper-realistic'}". For each concept, generate:
1. A highly descriptive, photorealistic "image prompt" for text-to-image generators (like Midjourney, Dall-E 3, or Imagen) specifying elements, composition, mood, and lighting.
2. A suggested "overlay text" (1-3 words in CAPS, highly contrasting).
3. A psychological "trigger description" explaining why this catches eyes.
4. "visualConcept" name/title for the thumbnail concept.
5. Layout placement hints.`;
    schema = {
      type: "object",
      properties: {
        prompts: {
          type: "array",
          items: {
            type: "object",
            properties: {
              conceptName: { type: "string" },
              imagePrompt: { type: "string" },
              overlayText: { type: "string" },
              psychologyTrigger: { type: "string" },
              layoutPlacement: { type: "string" }
            },
            required: ["conceptName", "imagePrompt", "overlayText", "psychologyTrigger", "layoutPlacement"]
          }
        }
      },
      required: ["prompts"]
    };
  } else if (type === "script") {
    const { title, format, tone } = params || {};
    prompt = `Generate a comprehensive narration script layout for a YouTube ${format || 'shorts'} video with the title: "${title || 'Amazing Video'}" in a distinct "${tone || 'energetic'}" tone. Create powerful hook visuals/audios, detailed incremental video scripting scenes detailing staging visual layouts, active spoken dialogue lines, SFX notes, and a high-converting channel subscription CTA.`;
    schema = {
      type: "object",
      properties: {
        format: { type: "string" },
        hookVisual: { type: "string" },
        hookAudio: { type: "string" },
        sections: {
          type: "array",
          items: {
            type: "object",
            properties: {
              sceneNum: { type: "number" },
              visualStyle: { type: "string" },
              spokenLine: { type: "string" },
              sfx: { type: "string" },
              duration: { type: "string" }
            },
            required: ["sceneNum", "visualStyle", "spokenLine", "sfx", "duration"]
          }
        },
        ctaVisual: { type: "string" },
        ctaSpoken: { type: "string" }
      },
      required: ["format", "hookVisual", "hookAudio", "sections", "ctaVisual", "ctaSpoken"]
    };
  } else if (type === "trends" || type === "trend") {
    const { category, platform } = params || {};
    prompt = `Track 5 fresh, viral trend concepts in the "${category || 'general'}" creators sector customized specifically for "${platform || 'youtube'}". Detail why they are trending, audience psychology triggers, and 3 production concept angles for a creator to adopt.`;
    schema = {
      type: "object",
      properties: {
        trends: {
          type: "array",
          items: {
            type: "object",
            properties: {
              trendTitle: { type: "string" },
              velocity: { type: "string" },
              explanation: { type: "string" },
              targetAudienceTip: { type: "string" },
              angles: {
                type: "array",
                items: { type: "string" }
              }
            },
            required: ["trendTitle", "velocity", "explanation", "targetAudienceTip", "angles"]
          }
        }
      },
      required: ["trends"]
    };
  }

  return { prompt, schema };
};

export const generateDirectlyFromClient = async (
  type: string,
  params: any,
  provider: string,
  openaiKey: string,
  userGeminiKey: string
): Promise<any> => {
  const { prompt, schema } = GET_PROMPT_AND_SCHEMA(type, params);

  if (provider === "openai" && openaiKey) {
    const openaiPrompt = `You are an expert YouTube content algorithm optimization engine. We are running toolType: "${type}". You MUST respond with a raw JSON object strictly conforming to the requested schema. Return only the raw JSON. Do not wrap the JSON in markdown blocks like \`\`\`json. Make sure to return actual JSON.

TASK PROMPT:
${prompt}

REQUIRED JSON STRUCTURE SCHEMA:
${JSON.stringify(schema)}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: openaiPrompt }],
        response_format: { type: "json_object" },
        temperature: 0.9
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      let errorMsg = errText;
      try {
        const parsed = JSON.parse(errText);
        if (parsed && parsed.error && parsed.error.message) {
          if (parsed.error.code === "insufficient_quota" || errText.includes("quota") || errText.includes("insufficient_quota")) {
            errorMsg = "OpenAI Resource Quota Exceeded: Your private OpenAI API Key does not have any active billing funds, grants, or credits left. Please check your OpenAI Developer Platform account billing settings, or switch back to the Standard Defaults Free Tier.";
          } else {
            errorMsg = parsed.error.message;
          }
        }
      } catch (e) {
        // Fall back to original raw error text
      }
      throw new Error(errorMsg);
    }

    const resJson = await response.json();
    const textResult = resJson.choices[0].message.content;
    return JSON.parse(textResult);
  }

  if (provider === "custom-gemini" && userGeminiKey) {
    const requestBody = {
      contents: [{ parts: [{ text: `${prompt}\n\nYou MUST respond strictly in raw JSON adhering to this schema:\n${JSON.stringify(schema)}` }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 1.0
      }
    };

    // Use current recommended gemini-1.5-flash or gemini-2.5-flash
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${userGeminiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini Direct Client Error: ${errText}`);
    }

    const resJson = await response.json();
    if (!resJson.candidates || !resJson.candidates[0] || !resJson.candidates[0].content) {
      throw new Error("Empty candidate response returned from client-side Gemini call.");
    }
    const textResult = resJson.candidates[0].content.parts[0].text;
    return JSON.parse(textResult);
  }

  throw new Error("No active direct API Key configured.");
};

export const generateImageDirectlyFromClient = async (
  promptText: string,
  _aspect: string,
  provider: string,
  openaiKey: string,
  _userGeminiKey: string
): Promise<any> => {
  if (provider === "openai" && openaiKey) {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: promptText,
        n: 1,
        size: "1024x1024"
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      let errorMsg = errText;
      try {
        const parsed = JSON.parse(errText);
        if (parsed && parsed.error && parsed.error.message) {
          if (parsed.error.code === "insufficient_quota" || errText.includes("quota") || errText.includes("insufficient_quota")) {
            errorMsg = "OpenAI Resource Quota Exceeded: Your private OpenAI API Key does not have any active billing funds, grants, or credits left. Please check your OpenAI Developer Platform account billing settings, or switch back to the Standard Defaults Free Tier.";
          } else {
            errorMsg = parsed.error.message;
          }
        }
      } catch (e) {
        // Fall back to original raw error text
      }
      throw new Error(errorMsg);
    }

    const resJson = await response.json();
    return {
      imageUrl: resJson.data[0].url,
      isFallback: false,
      fallbackReason: ""
    };
  }

  // Fall back to general mockup template image link generator or throw
  throw new Error("Direct client-side synthesis is only supported for active OpenAI DALL-E-3 credentials.");
};

import React, { useState, useEffect } from "react";
import {
  Lightbulb,
  Subtitles,
  FileText,
  FileCode,
  Image as ImageIcon,
  TrendingUp,
  Heart,
  CreditCard,
  Target,
  Sparkles,
  Copy,
  Check,
  Trash2,
  Bookmark,
  BookmarkCheck,
  Send,
  HelpCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  Flame,
  Volume2,
  Video,
  Info,
  DollarSign,
  AlertCircle,
  Key
} from "lucide-react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import {
  SavedItem,
  VideoIdea,
  IdeaPayload,
  TitlePayload,
  DescriptionPayload,
  ThumbnailSuggestion,
  ThumbnailPayload,
  ScriptSection,
  ScriptPayload,
  TrendItem,
  TrendPayload,
  ThumbnailPromptConcept,
  ThumbnailPromptPayload,
} from "./types";

import { generateDirectlyFromClient, generateImageDirectlyFromClient } from "./utils/clientApi";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("idea");
  
  // Storage for daily limits & pro status (stored in localStorage)
  const [generationsCount, setGenerationsCount] = useState<number>(0);
  const [isPro, setIsPro] = useState<boolean>(false);
  const maxGenerations = isPro ? 99999 : 10;

  // Saved workspace items list (stored in localStorage)
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);

  // Clipboard success state (maps item index/ID to true/false)
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form Inputs State
  // 1. Idea Gen
  const [ideaNiche, setIdeaNiche] = useState<string>("Tech & AI Reviews");
  const [ideaTopic, setIdeaTopic] = useState<string>("ChatGPT & Future of Coding");
  // 2. Title Gen
  const [titleTopic, setTitleTopic] = useState<string>("Why AI will not replace junior programmers");
  const [titleTone, setTitleTone] = useState<string>("Dramatic Curiosity");
  // 3. Description Gen
  const [descTopic, setDescTopic] = useState<string>("Photoshop Generative Fill Tutorial");
  const [descTitle, setDescTitle] = useState<string>("Unlocking ALL Hidden Features in Photoshop AI!");
  const [descOutline, setDescOutline] = useState<string>("First 3 mins cover setup, then live sky substitution, final section gives golden shortcuts rules.");
  // 4. Thumbnail Text Gen
  const [thumbTopic, setThumbTopic] = useState<string>("Quitting coding at age 21");
  const [thumbEmotion, setThumbEmotion] = useState<string>("Shock & Relief");
  // 5. Script Gen
  const [scriptTitle, setScriptTitle] = useState<string>("The Secret iPad Hack Apple Forgot to Tell You");
  const [scriptFormat, setScriptFormat] = useState<"shorts" | "long-form">("shorts");
  const [scriptTone, setScriptTone] = useState<string>("Engaging Hype");
  // 6. Trend Tracker
  const [trendCategory, setTrendCategory] = useState<string>("Finance & Crypto");
  const [trendPlatform, setTrendPlatform] = useState<string>("youtube");

  // Thumbnail prompt & image generator states
  const [thumbSubTab, setThumbSubTab] = useState<"text" | "prompt_tool">("prompt_tool");
  const [thumbPromptTopic, setThumbPromptTopic] = useState<string>("Coding my first SaaS in 24 hours in a coffee shop");
  const [thumbPromptNiche, setThumbPromptNiche] = useState<string>("Indie Hackers & Tech Life");
  const [thumbPromptStyle, setThumbPromptStyle] = useState<string>("Cinematic, photorealistic, depth of field, neon hues");
  const [thumbPromptResult, setThumbPromptResult] = useState<ThumbnailPromptPayload | null>(null);

  // Live image generation states
  const [imageLoadingId, setImageLoadingId] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<Record<string, string>>({});
  const [customImagePrompt, setCustomImagePrompt] = useState<string>("Futuristic cyberpunk workspace with glowing screens, photorealistic, 8k resolution");
  const [customImageUrl, setCustomImageUrl] = useState<string | null>(null);
  const [customImageLoading, setCustomImageLoading] = useState<boolean>(false);
  const [customAspectRatio, setCustomAspectRatio] = useState<string>("16:9");
  const [customOverlay, setCustomOverlay] = useState<string>("BOOST CTR");

  // Output Results State
  const [ideaResult, setIdeaResult] = useState<IdeaPayload | null>(null);
  const [titleResult, setTitleResult] = useState<TitlePayload | null>(null);
  const [descResult, setDescResult] = useState<DescriptionPayload | null>(null);
  const [thumbResult, setThumbResult] = useState<ThumbnailPayload | null>(null);
  const [scriptResult, setScriptResult] = useState<ScriptPayload | null>(null);
  const [trendResult, setTrendPayload] = useState<TrendPayload | null>(null);

  // Loading indicator states
  const [loading, setLoading] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [fallbackWarning, setFallbackWarning] = useState<string | null>(null);

  // Custom user-provided API Keys
  const [openaiKey, setOpenaiKey] = useState<string>("");
  const [userGeminiKey, setUserGeminiKey] = useState<string>("");
  const [preferredProvider, setPreferredProvider] = useState<string>("default");
  const [isRightColumnExpanded, setIsRightColumnExpanded] = useState<boolean>(() => {
    const cachedCombined = localStorage.getItem("cb_api_col_expanded");
    return cachedCombined !== "false";
  });

  const handleToggleRightColumn = () => {
    setIsRightColumnExpanded(prev => {
      const next = !prev;
      localStorage.setItem("cb_api_col_expanded", next ? "true" : "false");
      return next;
    });
  };

  // Load from localStorage on initialization
  useEffect(() => {
    const cachedCount = localStorage.getItem("cb_generations_count");
    if (cachedCount) setGenerationsCount(parseInt(cachedCount, 10));

    const cachedPro = localStorage.getItem("cb_is_pro");
    if (cachedPro) setIsPro(cachedPro === "true");

    const cachedOpenaiKey = localStorage.getItem("cb_openai_key");
    if (cachedOpenaiKey) setOpenaiKey(cachedOpenaiKey);

    const cachedUserGeminiKey = localStorage.getItem("cb_user_gemini_key");
    if (cachedUserGeminiKey) setUserGeminiKey(cachedUserGeminiKey);

    const cachedProvider = localStorage.getItem("cb_preferred_provider");
    if (cachedProvider) setPreferredProvider(cachedProvider);

    const cachedSaves = localStorage.getItem("cb_saved_items");
    if (cachedSaves) {
      try {
        setSavedItems(JSON.parse(cachedSaves));
      } catch (e) {
        console.error("Failed to parse saved items:", e);
      }
    }
  }, []);

  // Update localStorage when savings / metrics change
  const saveToLocal = (newCount: number) => {
    setGenerationsCount(newCount);
    localStorage.setItem("cb_generations_count", newCount.toString());
  };

  const handleSetPro = (status: boolean) => {
    setIsPro(status);
    localStorage.setItem("cb_is_pro", status ? "true" : "false");
  };

  const handleSaveOpenaiKey = (key: string) => {
    setOpenaiKey(key);
    localStorage.setItem("cb_openai_key", key);
  };

  const handleSaveUserGeminiKey = (key: string) => {
    setUserGeminiKey(key);
    localStorage.setItem("cb_user_gemini_key", key);
  };

  const handleSavePreferredProvider = (prov: string) => {
    setPreferredProvider(prov);
    localStorage.setItem("cb_preferred_provider", prov);
  };

  const updateSaves = (items: SavedItem[]) => {
    setSavedItems(items);
    localStorage.setItem("cb_saved_items", JSON.stringify(items));
  };

  // Quick action: copy text
  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Toggle saving custom content
  const handleSaveResult = (type: SavedItem["type"], title: string, data: any) => {
    const newItem: SavedItem = {
      id: `${type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      title,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " (" + new Date().toLocaleDateString([], { month: "short", day: "numeric" }) + ")",
      data,
    };
    const updated = [newItem, ...savedItems];
    updateSaves(updated);
  };

  const handleRemoveSaved = (id: string) => {
    const updated = savedItems.filter((it) => it.id !== id);
    updateSaves(updated);
  };

  // Core API Submission Handler
  const handleGenerate = async (type: string) => {
    // Check local limit first (bypass if they configured their own active custom keys)
    const isUsingCustomKey = (preferredProvider === "openai" && openaiKey) || (preferredProvider === "custom-gemini" && userGeminiKey);
    if (!isUsingCustomKey && generationsCount >= maxGenerations) {
      setErrorText(`Daily Limit Reached. You have used all ${maxGenerations} generations. Upgrade to Premium for unlimited queries, or configure your own Custom API key under 'API Provider Key' settings!`);
      setActiveTab("api-keys");
      return;
    }

    setLoading(true);
    setErrorText(null);

    let params: any = {};
    if (type === "idea") params = { niche: ideaNiche, topic: ideaTopic };
    else if (type === "title") params = { topic: titleTopic, tone: titleTone };
    else if (type === "description") params = { topic: descTopic, title: descTitle, corePoints: descOutline };
    else if (type === "thumbnail") params = { topic: thumbTopic, emotion: thumbEmotion };
    else if (type === "thumbnail_prompt") params = { topic: thumbPromptTopic, niche: thumbPromptNiche, style: thumbPromptStyle };
    else if (type === "script") params = { title: scriptTitle, format: scriptFormat, tone: scriptTone };
    else if (type === "trend") params = { category: trendCategory, platform: trendPlatform };

    // Set custom headers with user-supplied API keys for safe proxying
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (openaiKey) headers["x-openai-api-key"] = openaiKey;
    if (userGeminiKey) headers["x-gemini-api-key"] = userGeminiKey;
    headers["x-preferred-provider"] = preferredProvider;

    let responseData: any;

    try {
      if (isUsingCustomKey) {
        try {
          console.log("Client-side direct routing active for provider:", preferredProvider);
          responseData = await generateDirectlyFromClient(type, params, preferredProvider, openaiKey, userGeminiKey);
        } catch (clientErr: any) {
          console.warn("Custom key client-side direct generation failed, attempting automatic standard backend proxy fallback:", clientErr);
          
          let causeMsg = clientErr.message || "quota limit exceeded";
          if (causeMsg.includes("quota") || causeMsg.includes("billing")) {
            causeMsg = "your private API key has empty billing balance or expired limits";
          }
          setFallbackWarning(`Notice: Custom key failed (${causeMsg}). CreatorBoost has automatically routed your query to our Free Standard Tier so your work wasn't lost!`);
          
          const response = await fetch("/api/generate", {
            method: "POST",
            headers,
            body: JSON.stringify({ toolType: type, params }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Generation request failed on standard fallback.");
          }

          responseData = await response.json();
        }
      } else {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers,
          body: JSON.stringify({ toolType: type, params }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Generation request failed");
        }

        responseData = await response.json();
      }

      // Render respective output state
      if (type === "idea") {
        setIdeaResult({ niche: ideaNiche, topic: ideaTopic, ideas: responseData.ideas });
      } else if (type === "title") {
        setTitleResult({
          topic: titleTopic,
          tone: titleTone,
          clickable: responseData.clickable,
          seo: responseData.seo,
          shorts: responseData.shorts,
        });
      } else if (type === "description") {
        setDescResult({
          topic: descTopic,
          title: descTitle,
          corePoints: descOutline,
          formattedDescription: responseData.formattedDescription,
          tags: responseData.tags,
          hashtags: responseData.hashtags,
        });
      } else if (type === "thumbnail") {
        setThumbResult({
          topic: thumbTopic,
          emotion: thumbEmotion,
          suggestions: responseData.suggestions,
        });
      } else if (type === "thumbnail_prompt") {
        setThumbPromptResult({
          topic: thumbPromptTopic,
          niche: thumbPromptNiche,
          style: thumbPromptStyle,
          prompts: responseData.prompts,
        });
      } else if (type === "script") {
        setScriptResult({
          title: scriptTitle,
          format: scriptFormat,
          tone: scriptTone,
          hookVisual: responseData.hookVisual,
          hookAudio: responseData.hookAudio,
          sections: responseData.sections,
          ctaVisual: responseData.ctaVisual,
          ctaSpoken: responseData.ctaSpoken,
        });
      } else if (type === "trend") {
        setTrendPayload({
          category: trendCategory,
          platform: trendPlatform,
          trends: responseData.trends,
        });
      }

      // Increment limits count
      saveToLocal(generationsCount + 1);
    } catch (err: any) {
      console.error(err);
      let errMsg = err.message || "Something went wrong while compiling suggestions. Please check your network and API credentials.";
      if (errMsg.includes("insufficient_quota") || errMsg.includes("exceeded your current quota") || errMsg.includes("quota")) {
        errMsg = "You exceeded your current OpenAI quota. This means your private custom OpenAI API Key does not have any active funds or credits left, or has expired. Please check your OpenAI Platform billing settings or switch back to standard defaults.";
      }
      setErrorText(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetDailyCredits = () => {
    saveToLocal(0);
    setErrorText(null);
  };

  // Dedicated generator utilizing Imagen 3 models.generateImages
  const handleGenerateImage = async (promptText: string, aspect: string, slotId: string) => {
    const isUsingCustomKey = (preferredProvider === "openai" && openaiKey) || (preferredProvider === "custom-gemini" && userGeminiKey);
    if (!isUsingCustomKey && generationsCount >= maxGenerations) {
      setErrorText("Daily Limit Reached. Upgrading to Pro or using your own Custom API key under 'API Provider Key' gives endless high CTR thumbnail generations!");
      setActiveTab("api-keys");
      return;
    }

    if (slotId === "custom") {
      setCustomImageLoading(true);
    } else {
      setImageLoadingId(slotId);
    }
    setErrorText(null);
    setFallbackWarning(null);

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (openaiKey) headers["x-openai-api-key"] = openaiKey;
    if (userGeminiKey) headers["x-gemini-api-key"] = userGeminiKey;
    headers["x-preferred-provider"] = preferredProvider;

    try {
      let resData: any;
      if (preferredProvider === "openai" && openaiKey) {
        try {
          console.log("Client-side direct image routing active");
          resData = await generateImageDirectlyFromClient(promptText, aspect, preferredProvider, openaiKey, userGeminiKey);
        } catch (clientErr: any) {
          console.warn("Client direct image generation failed, falling back to standard proxy flow:", clientErr);
          
          let causeMsg = clientErr.message || "quota limit exceeded";
          if (causeMsg.includes("quota") || causeMsg.includes("billing")) {
            causeMsg = "your private API key has empty billing balance or expired limits";
          }
          setFallbackWarning(`Notice: Custom key failed (${causeMsg}). CreatorBoost has automatically routed your image creation query to our Free Standard Tier so your work wasn't lost!`);
          
          const resp = await fetch("/api/generate-image", {
            method: "POST",
            headers,
            body: JSON.stringify({ prompt: promptText, aspectRatio: aspect })
          });

          if (!resp.ok) {
            const errorData = await resp.json();
            throw new Error(errorData.error || "Image generation query failed on standard fallback.");
          }

          resData = await resp.json();
        }
      } else {
        const resp = await fetch("/api/generate-image", {
          method: "POST",
          headers,
          body: JSON.stringify({ prompt: promptText, aspectRatio: aspect })
        });

        if (!resp.ok) {
          const errorData = await resp.json();
          throw new Error(errorData.error || "Image generation query failed.");
        }

        resData = await resp.json();
      }

      const url = resData.imageUrl;

      if (resData.isFallback) {
        setFallbackWarning("💡 Imagen workspace notice: The current API key is on the free plan, which restricts direct Imagen 3/4 pixel synthesis. CreatorBoost successfully compiled a gorgeous, topic-relevant AI stock photo mockup with dynamic visual overlay text instead!");
      }

      if (slotId === "custom") {
        setCustomImageUrl(url);
      } else {
        setGeneratedImages(prev => ({ ...prev, [slotId]: url }));
      }

      saveToLocal(generationsCount + 1);
    } catch (err: any) {
      console.error(err);
      let errMsg = err.message || "An unexpected error occurred during image generation.";
      if (errMsg.includes("insufficient_quota") || errMsg.includes("exceeded your current quota") || errMsg.includes("quota")) {
        errMsg = "You exceeded your current OpenAI quota. This means your private custom OpenAI API Key does not have any active funds or credits left, or has expired. Please check your OpenAI Platform billing settings or switch back to standard defaults.";
      }
      setErrorText(errMsg);
    } finally {
      if (slotId === "custom") {
        setCustomImageLoading(false);
      } else {
        setImageLoadingId(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 selection:bg-purple-500/30 selection:text-white flex flex-col">
      
      {/* Header Metric Bar */}
      <Header
        generationCount={generationsCount}
        maxGenerations={maxGenerations}
        savedCount={savedItems.length}
        onResetCredits={handleResetDailyCredits}
        onViewPricing={() => setActiveTab("pricing")}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col lg:flex-row">
        
        {/* Left Navigation Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} savedCount={savedItems.length} />

        {/* Workspace core wrapper */}
        <div className="flex-1 flex flex-col xl:flex-row w-full min-h-0">
          
          {/* Main workspace scrollable contents */}
          <main className="flex-1 p-6 lg:p-8 overflow-y-auto w-full max-w-5xl mx-auto">
          
          {/* Global Alert Notification block */}
          {errorText && (
            <div className="bg-rose-950/40 border border-rose-500/30 rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-3 text-sm text-rose-200">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold text-rose-350">Execution Error: </span> {errorText}
                  {(errorText.includes("quota") || errorText.includes("API Key") || preferredProvider !== "default") && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          handleSavePreferredProvider("default");
                          setErrorText(null);
                        }}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer shadow hover:scale-[1.01] active:scale-95"
                      >
                        Dismiss & Switch to Free Standard Tier
                      </button>
                      <a
                        href="https://platform.openai.com/api-keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 text-slate-350 rounded-lg text-xs font-medium transition-all"
                      >
                        Check OpenAI Billing Balance ↗
                      </a>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setErrorText(null)}
                className="text-xs uppercase font-mono px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 rounded border border-rose-500/20 text-rose-300 self-start transition-colors cursor-pointer md:ml-auto"
              >
                Dismiss
              </button>
            </div>
          )}

          {fallbackWarning && (
            <div className="bg-purple-950/25 border border-purple-500/20 rounded-2xl p-4.5 mb-6 flex gap-3 text-sm text-purple-200 backdrop-blur-sm shadow-xl shadow-purple-950/5">
              <Sparkles className="w-5 h-5 shrink-0 text-purple-400 mt-0.5 animate-pulse" />
              <div className="flex-1">
                <span className="font-bold text-white">Feature Fallback Mode: </span> {fallbackWarning}
              </div>
              <button
                onClick={() => setFallbackWarning(null)}
                className="text-xs uppercase font-mono px-2 py-1 bg-purple-500/15 hover:bg-purple-500/25 rounded border border-purple-500/20 text-purple-300 self-start transition-colors"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Active Work Flow */}

          {/* 1. VIDEO IDEA GENERATOR */}
          {activeTab === "idea" && (
            <div className="space-y-6">
              {/* Tool Pitch Header */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="p-1 px-2.5 font-mono text-[10px] uppercase font-bold tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-full">
                    Viral Algorithm Engine
                  </span>
                </div>
                <h2 className="text-3xl font-bold font-display tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  Video Idea Generator
                </h2>
                <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                  Generate exactly 20 hyper-targeted, high-retention video angles. Complete with target audiences, psychological triggers, and pacing tips.
                </p>
              </div>

              {/* Form Input Deck */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className="block text-xs uppercase font-bold tracking-wider font-mono text-slate-400 mb-1.5">
                      Your Niche / Sector
                    </label>
                    <input
                      type="text"
                      value={ideaNiche}
                      onChange={(e) => setIdeaNiche(e.target.value)}
                      placeholder="e.g. Cooking, Finance, Indie Game Dev"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase font-bold tracking-wider font-mono text-slate-400 mb-1.5">
                      Topic Angle / Keyword Focus
                    </label>
                    <input
                      type="text"
                      value={ideaTopic}
                      onChange={(e) => setIdeaTopic(e.target.value)}
                      placeholder="e.g. Budget travel in Tokyo, Minecraft speedrun"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-800/60 pt-4 flex-wrap gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Info className="w-4 h-4 text-slate-500" />
                    <span>Uses 1 daily generation credit.</span>
                  </div>
                  <button
                    onClick={() => handleGenerate("idea")}
                    disabled={loading}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-500 active:scale-95 disabled:opacity-50 disabled:scale-100 text-sm font-semibold text-white rounded-xl shadow-lg shadow-purple-600/10 transition-all flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Analyzing YouTube Analytics...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-purple-200" />
                        Generate 20 Viral Ideas
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Ideas Output display */}
              {ideaResult ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold font-display text-slate-200">
                        Top Suggested Concepts for "{ideaResult.niche}"
                      </h3>
                      <p className="text-xs text-slate-400">Focused on: {ideaResult.topic}</p>
                    </div>
                    <button
                      onClick={() => handleSaveResult("idea", `Ideas: ${ideaResult.niche} (${ideaResult.topic})`, ideaResult)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-500/10 border border-pink-500/20 text-xs font-semibold text-pink-400 hover:bg-pink-500/25 active:scale-95 transition-all rounded-lg"
                    >
                      <Bookmark className="w-3.5 h-3.5" /> Save to Workspace
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ideaResult.ideas.map((idea, index) => (
                      <div
                        key={idea.id || index}
                        className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all shadow-inner relative group"
                      >
                        {/* Index Indicator tag */}
                        <div className="absolute right-4 top-4 font-mono text-xs font-bold text-slate-600">
                          #{String(index + 1).padStart(2, '0')}
                        </div>

                        <div className="flex items-center gap-1 bg-amber-400/10 px-2 py-0.5 border border-amber-400/20 text-[10px] font-bold text-amber-400 font-mono rounded w-fit mb-3">
                          <Flame className="w-3 h-3" /> RETENTION EXPECTANCY: {idea.estimatedRetention || "90%+"}
                        </div>

                        <h4 className="text-base font-bold font-display text-white pr-8 group-hover:text-purple-300 transition-colors">
                          {idea.title}
                        </h4>

                        <div className="space-y-2 mt-3 text-xs border-t border-slate-800/80 pt-3">
                          <div>
                            <span className="text-slate-500 font-medium">Clickbait Target Hook:</span>
                            <p className="text-slate-300 mt-0.5 font-sans leading-relaxed">{idea.angle}</p>
                          </div>
                          <div>
                            <span className="text-slate-500 font-medium">Core Target Audience:</span>
                            <p className="text-slate-400 mt-0.5">{idea.targetAudience}</p>
                          </div>
                          <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-850 mt-1">
                            <span className="text-[10px] uppercase font-bold tracking-wider font-mono text-purple-400 block mb-0.5">Visual Staging Hint</span>
                            <p className="text-slate-300 font-sans italic text-[11px] leading-relaxed">{idea.pacingTip}</p>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-800/60 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleCopyText(`Title: ${idea.title}\nAngle: ${idea.angle}\nTarget: ${idea.targetAudience}`, `idea-${index}`)}
                            className="p-1 px-2.5 transition-colors bg-slate-950 text-[11px] font-mono text-slate-400 hover:text-white rounded-md border border-slate-800 flex items-center gap-1"
                          >
                            {copiedId === `idea-${index}` ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" /> Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" /> Quick Copy
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900 border border-dashed border-slate-800 rounded-2xl p-12 text-center text-slate-500">
                  <Lightbulb className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                  <h4 className="text-base font-semibold text-slate-400">Ready to boost your YouTube views?</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Configure your target Channel Niche above and prompt the video generator for instant micro-optimized video concepts.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 2. TITLE GENERATOR */}
          {activeTab === "title" && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="p-1 px-2.5 font-mono text-[10px] uppercase font-bold tracking-widest text-blue-400 bg-blue-400/10 border border-blue-400/20 rounded-full">
                    A/B CTR Performance Testing
                  </span>
                </div>
                <h2 className="text-3xl font-bold font-display tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  A/B CTR Title Generator
                </h2>
                <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                  Generate clickable intrigue titles, high search-volume SEO hooks, and super punchy vertical frame Shorts titles.
                </p>
              </div>

              {/* Title Generator Input */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className="block text-xs uppercase font-bold tracking-wider font-mono text-slate-400 mb-1.5">
                      Core Video Theme / Topic
                    </label>
                    <input
                      type="text"
                      value={titleTopic}
                      onChange={(e) => setTitleTopic(e.target.value)}
                      placeholder="e.g. Secret coding hacks for Mac"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase font-bold tracking-wider font-mono text-slate-400 mb-1.5">
                      Aesthetic Mood & Tone Tone
                    </label>
                    <select
                      value={titleTone}
                      onChange={(e) => setTitleTone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
                    >
                      <option value="Shocking Curiosity">Shocking Curiosity ("They lied to us")</option>
                      <option value="Scientific Authority">Scientific & Fact-based ("Proven by Science")</option>
                      <option value="Extremely Hype / Enthusiastic">Extremely Hype / High Energy</option>
                      <option value="Fear of Missing Out">FOMO / Urgency ("Stop doing this NOW")</option>
                      <option value="Minimalist / Lowkey">Minimal / Elegant ("How I learned to code")</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-800/60 pt-4 flex-wrap gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Info className="w-4 h-4 text-slate-500" />
                    <span>Generates exactly 30 unique variations.</span>
                  </div>
                  <button
                    onClick={() => handleGenerate("title")}
                    disabled={loading}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-500 active:scale-95 disabled:opacity-50 disabled:scale-100 text-sm font-semibold text-white rounded-xl shadow-lg shadow-purple-600/10 transition-all flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Analyzing CTR Benchmarks...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-purple-200" />
                        Generate 30 High CTR Titles
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Title result outputs */}
              {titleResult ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold font-display text-slate-200">
                        Viral Titles Generated
                      </h3>
                      <p className="text-xs text-slate-400">Tone configuration: {titleResult.tone}</p>
                    </div>
                    <button
                      onClick={() => handleSaveResult("title", `Titles: ${titleResult.topic}`, titleResult)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-500/10 border border-pink-500/20 text-xs font-semibold text-pink-400 hover:bg-pink-500/25 active:scale-95 transition-all rounded-lg"
                    >
                      <Bookmark className="w-3.5 h-3.5" /> Save Suite to Workspace
                    </button>
                  </div>

                  {/* Dynamic side-by-side Bento layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Clickable Section */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col">
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-lg shadow-blue-500/60" />
                          <span className="font-display font-bold text-sm text-slate-200">Intrigue & Clickable</span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-500 font-bold">10 COPIES</span>
                      </div>
                      
                      <div className="space-y-2 flex-1">
                        {titleResult.clickable.map((title, i) => (
                          <div
                            key={i}
                            className="bg-slate-950/60 hover:bg-slate-950 border border-slate-850 hover:border-slate-800 p-3 rounded-xl flex items-center justify-between gap-3 group transition-all"
                          >
                            <span className="text-xs leading-relaxed text-slate-300 font-sans">{title}</span>
                            <button
                              onClick={() => handleCopyText(title, `click-${i}`)}
                              className="p-1.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                              title="Copy title"
                            >
                              {copiedId === `click-${i}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* SEO Section */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col">
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/60" />
                          <span className="font-display font-bold text-sm text-slate-200">SEO & Keyword Rich</span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-500 font-bold">10 COPIES</span>
                      </div>

                      <div className="space-y-2 flex-1">
                        {titleResult.seo.map((title, i) => (
                          <div
                            key={i}
                            className="bg-slate-950/60 hover:bg-slate-950 border border-slate-850 hover:border-slate-800 p-3 rounded-xl flex items-center justify-between gap-3 group transition-all"
                          >
                            <span className="text-xs leading-relaxed text-slate-300 font-sans">{title}</span>
                            <button
                              onClick={() => handleCopyText(title, `seo-${i}`)}
                              className="p-1.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                              title="Copy title"
                            >
                              {copiedId === `seo-${i}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shorts Section */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col">
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-pink-500 shadow-lg shadow-pink-500/60" />
                          <span className="font-display font-bold text-sm text-slate-200">Shorts & TikTok Titles</span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-500 font-bold">10 COPIES</span>
                      </div>

                      <div className="space-y-2 flex-1">
                        {titleResult.shorts.map((title, i) => (
                          <div
                            key={i}
                            className="bg-slate-950/60 hover:bg-slate-950 border border-slate-850 hover:border-slate-800 p-3 rounded-xl flex items-center justify-between gap-3 group transition-all"
                          >
                            <span className="text-xs leading-relaxed font-bold font-mono text-pink-300">{title}</span>
                            <button
                              onClick={() => handleCopyText(title, `short-${i}`)}
                              className="p-1.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                              title="Copy title"
                            >
                              {copiedId === `short-${i}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900 border border-dashed border-slate-800 rounded-2xl p-12 text-center text-slate-500">
                  <Subtitles className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                  <h4 className="text-base font-semibold text-slate-400">Generate High CTR Video Titles</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Type in your topic idea and select a viral tone to let CreatorBoost output 30 highly optimized headline suggestions.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 3. DESCRIPTION GENERATOR */}
          {activeTab === "description" && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="p-1 px-2.5 font-mono text-[10px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full">
                    Advanced Metadata Optimizer
                  </span>
                </div>
                <h2 className="text-3xl font-bold font-display tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  Description & SEO Tag Suite
                </h2>
                <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                  Build complete algorithm-compliant text outlines with chapter timelines, metadata keywords, CTAs, and relevant hashtags.
                </p>
              </div>

              {/* Input section */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs uppercase font-bold tracking-wider font-mono text-slate-400 mb-1.5">
                      Chosen Video Title
                    </label>
                    <input
                      type="text"
                      value={descTitle}
                      onChange={(e) => setDescTitle(e.target.value)}
                      placeholder="e.g. 5 Coding Tricks That Save Programmers Hours"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase font-bold tracking-wider font-mono text-slate-400 mb-1.5">
                      Video Theme Keyword
                    </label>
                    <input
                      type="text"
                      value={descTopic}
                      onChange={(e) => setDescTopic(e.target.value)}
                      placeholder="e.g. Programming habits & efficiency tricks"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-xs uppercase font-bold tracking-wider font-mono text-slate-400 mb-1.5">
                    Describe core outline/chapters points (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={descOutline}
                    onChange={(e) => setDescOutline(e.target.value)}
                    placeholder="Briefly state key sections: (e.g. Intro, Setup guide, live demonstration, Pro tip, final call to actions)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-slate-800/60 pt-4 flex-wrap gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Info className="w-4 h-4 text-slate-500" />
                    <span>Sets up perfect algorithm keywords ranking pointers.</span>
                  </div>
                  <button
                    onClick={() => handleGenerate("description")}
                    disabled={loading}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-500 active:scale-95 disabled:opacity-50 disabled:scale-100 text-sm font-semibold text-white rounded-xl shadow-lg shadow-purple-600/10 transition-all flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Structuring Metadata Tags...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-purple-200" />
                        Generate Metadata Package
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Output view */}
              {descResult ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold font-display text-slate-200">
                        Generated Descriptions Suite
                      </h3>
                      <p className="text-xs text-slate-400">Title optimized: {descResult.title}</p>
                    </div>
                    <button
                      onClick={() => handleSaveResult("description", `Desc: ${descResult.title}`, descResult)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-500/10 border border-pink-500/20 text-xs font-semibold text-pink-400 hover:bg-pink-500/25 active:scale-95 transition-all rounded-lg"
                    >
                      <Bookmark className="w-3.5 h-3.5" /> Save Output to Workspace
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left 2 cols: Main description text */}
                    <div className="lg:col-span-2 space-y-4">
                      <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl shadow-lg relative">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                          <span className="font-display font-bold text-sm text-slate-200">Formatted Description Copy Block</span>
                          <button
                            onClick={() => handleCopyText(descResult.formattedDescription, "descText")}
                            className="p-1.5 px-3 transition-all bg-slate-950 font-mono text-xs text-slate-400 hover:text-white rounded-lg border border-slate-800 flex items-center gap-1"
                          >
                            {copiedId === "descText" ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied Descriptions!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" /> Copy Entire Block
                              </>
                            )}
                          </button>
                        </div>

                        {/* Description Box */}
                        <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl max-h-[360px] overflow-y-auto">
                          <pre className="text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-wrap select-all">
                            {descResult.formattedDescription}
                          </pre>
                        </div>
                      </div>
                    </div>

                    {/* Right col: SEO Tag items & Hashtags */}
                    <div className="space-y-6">
                      {/* Hashtags Card */}
                      <div className="bg-slate-900 border border-slate-850 rounded-2xl p-5 shadow-lg">
                        <span className="block text-xs uppercase font-mono font-bold text-slate-500 tracking-wider mb-3">
                          Short-form Hashtags
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {descResult.hashtags.map((ht, i) => (
                            <span
                              key={i}
                              className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-lg cursor-pointer hover:bg-purple-500/25 transition-colors"
                              onClick={() => handleCopyText(ht, `ht-${i}`)}
                              title="Click to copy hashtag"
                            >
                              {copiedId === `ht-${i}` ? "✓ Saved" : ht}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* SEO Search Tags / Keywords */}
                      <div className="bg-slate-900 border border-slate-850 rounded-2xl p-5 shadow-lg">
                        <div className="flex items-center justify-between mb-3 border-b border-slate-850 pb-2">
                          <span className="block text-xs uppercase font-mono font-bold text-slate-500 tracking-wider">
                            YouTube Search Keywords
                          </span>
                          <button
                            onClick={() => handleCopyText(descResult.tags.join(", "), "descAllTags")}
                            className="text-[10px] uppercase font-mono text-purple-400 hover:text-purple-300"
                          >
                            {copiedId === "descAllTags" ? "Copied All!" : "Copy CSV"}
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {descResult.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="text-[11px] text-slate-300 bg-slate-950 border border-slate-800 px-2 py-1 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900 border border-dashed border-slate-800 rounded-2xl p-12 text-center text-slate-500">
                  <FileText className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                  <h4 className="text-base font-semibold text-slate-400">Generate Structured Description Panels</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Fill out target video structures and prompt the engine to format custom Timestamps and algorithmic chapters ready to publish.
                  </p>
                </div>
              )}
            </div>
          )}          {/* 4. THUMBNAIL TEXT GENERATOR */}
          {activeTab === "thumbnail" && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="p-1 px-2.5 font-mono text-[10px] uppercase font-bold tracking-widest text-pink-400 bg-pink-400/10 border border-pink-400/20 rounded-full">
                    Visually Clickable Framing Hook
                  </span>
                </div>
                <h2 className="text-3xl font-bold font-display tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  Thumbnail Text & AI Image Generator
                </h2>
                <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                  Generate ultra-short dramatic text overlays, optimized Midjourney prompt tiers, and utilize the actual Imagen 3 tool to generate mockups live.
                </p>
              </div>

              {/* Segmented sub-tab bar */}
              <div className="flex bg-slate-900 p-1.5 rounded-2xl w-fit border border-slate-800">
                <button
                  type="button"
                  onClick={() => setThumbSubTab("prompt_tool")}
                  className={`px-4.5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                    thumbSubTab === "prompt_tool"
                      ? "bg-purple-600 text-white shadow-md shadow-purple-600/10"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-300" /> AI Thumbnail Prompt Tier & Imagen 3
                </button>
                <button
                  type="button"
                  onClick={() => setThumbSubTab("text")}
                  className={`px-4.5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                    thumbSubTab === "text"
                      ? "bg-purple-600 text-white shadow-md shadow-purple-600/10"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5 text-pink-300" /> Original Text Overlay Recipes
                </button>
              </div>

              {thumbSubTab === "text" ? (
                <div className="space-y-6">
                  {/* Inputs */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                      <div>
                        <label className="block text-xs uppercase font-bold tracking-wider font-mono text-slate-400 mb-1.5">
                          Video Theme / Drama Point
                        </label>
                        <input
                          type="text"
                          value={thumbTopic}
                          onChange={(e) => setThumbTopic(e.target.value)}
                          placeholder="e.g. Learning to use Photoshop on vintage PC"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs uppercase font-bold tracking-wider font-mono text-slate-400 mb-1.5">
                          Target Psychological Trigger Emotion
                        </label>
                        <select
                          value={thumbEmotion}
                          onChange={(e) => setThumbEmotion(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
                        >
                          <option value="Shocking Urgency / Panic">Shocking Urgency / Panic ("NEVER DO THIS")</option>
                          <option value="Intense Curiosity">Intense Curiosity ("HE EXPOSED EVERYTHING")</option>
                          <option value="Absolute Disbelief">Absolute Disbelief ("IT ACTUALLY WORKED?")</option>
                          <option value="Joyful Discovery">Joyful Discovery ("BEST HACK EVER")</option>
                          <option value="Skeptical Warning">Skeptical Warning ("THEY LIED TO YOU")</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-800/60 pt-4 flex-wrap gap-3">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Info className="w-4 h-4 text-slate-500" />
                        <span>Returns exactly 8 contrasting text suggestions.</span>
                      </div>
                      <button
                        onClick={() => handleGenerate("thumbnail")}
                        disabled={loading}
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-500 active:scale-95 disabled:opacity-50 disabled:scale-100 text-sm font-semibold text-white rounded-xl shadow-lg shadow-purple-600/10 transition-all flex items-center gap-2"
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Generating Composition Layouts...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 text-purple-200" />
                            Generate Thumbnail Recipe
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Output Display */}
                  {thumbResult ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div>
                          <h3 className="text-xl font-bold font-display text-slate-200">
                            8 Shocking Overlay Recipes
                          </h3>
                          <p className="text-xs text-slate-400">Based on: "{thumbResult.topic}" with emotion "{thumbResult.emotion}"</p>
                        </div>
                        <button
                          onClick={() => handleSaveResult("thumbnail", `Thumbnail Layouts: ${thumbResult.topic}`, thumbResult)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-500/10 border border-pink-500/20 text-xs font-semibold text-pink-400 hover:bg-pink-500/25 active:scale-95 transition-all rounded-lg"
                        >
                          <Bookmark className="w-3.5 h-3.5" /> Save Suite
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {thumbResult.suggestions.map((sug, i) => (
                          <div
                            key={i}
                            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden p-0 flex flex-col group transition-all"
                          >
                            {/* Simulation Screen Container mimicking actual physical Youtube frame */}
                            <div className="aspect-[16/9] bg-slate-950 relative flex items-center justify-center p-4 border-b border-slate-800/80 shadow-inner group-hover:bg-black transition-colors">
                              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur px-1.5 py-0.5 rounded text-[8px] font-mono tracking-widest text-slate-400 z-10">
                                16:9 PREVIEW SIMULATION
                              </div>
                              
                              {/* Live Thumbnail Overlay styling preview dynamically! */}
                              <div
                                className="px-3 py-1.5 font-display font-extrabold text-xs tracking-wider uppercase rounded-md shadow-xl text-center transform -rotate-2 select-none"
                                style={{
                                  backgroundColor: sug.bgColor || "#F43F5E",
                                  color: sug.textColor || "#FFFFFF"
                                }}
                              >
                                {sug.text}
                              </div>
                            </div>

                            {/* Staging text detail notes */}
                            <div className="p-4 flex-1 flex flex-col justify-between">
                              <div className="space-y-2">
                                <span className="font-mono text-[9px] uppercase font-bold text-slate-500 tracking-wider">
                                  Overlay Config
                                </span>
                                <p className="text-sm font-black text-slate-200 uppercase tracking-tight">
                                  "{sug.text}"
                                </p>
                                <p className="text-xs text-slate-400 italic">
                                  <span className="font-bold not-italic font-mono text-[10px] text-purple-400">Composition Strategy:</span> {sug.compositionTip}
                                </p>
                              </div>

                              <div className="flex items-center justify-between border-t border-slate-800 pt-3 mt-4">
                                <span className="text-[10px] text-slate-500">Emotion: {sug.emotiveness}</span>
                                <button
                                  onClick={() => handleCopyText(`Text: "${sug.text}"\nTip: ${sug.compositionTip}`, `thumb-${i}`)}
                                  className="text-xs text-purple-400 hover:text-purple-300 font-mono font-medium flex items-center gap-1"
                                >
                                  {copiedId === `thumb-${i}` ? <Check className="w-3 h-3 text-emerald-400" /> : "Copy Text"}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-900 border border-dashed border-slate-800 rounded-2xl p-12 text-center text-slate-500">
                      <ImageIcon className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                      <h4 className="text-base font-semibold text-slate-400">Staging Dramatic Thumbnail Text overlays</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        Formulate video concepts and select psychological hooks to let CreatorBoost export layout parameters and thumbnail copy recipes.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                // BRAND NEW PROMPT TIER AND IMAGEN 3 WORKSPACE!
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column: Prompt Generator (Span 7) */}
                  <div className="lg:col-span-7 space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                      <div className="border-b border-slate-800 pb-3">
                        <h3 className="text-base font-bold text-slate-200 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-purple-400" /> Create 5 Detailed Thumbnail Prompts
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Our design model translates video topics into professional landscape concepts and Midjourney-level image prompts.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] uppercase font-bold tracking-wider font-mono text-slate-400 mb-1">
                            Video Core topic / Theme
                          </label>
                          <input
                            type="text"
                            value={thumbPromptTopic}
                            onChange={(e) => setThumbPromptTopic(e.target.value)}
                            placeholder="e.g. Quitting my 9 to 5 tech job in NY"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] uppercase font-bold tracking-wider font-mono text-slate-400 mb-1">
                              Channel Niche
                            </label>
                            <input
                              type="text"
                              value={thumbPromptNiche}
                              onChange={(e) => setThumbPromptNiche(e.target.value)}
                              placeholder="e.g. Travel & Lifestyle, Business"
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase font-bold tracking-wider font-mono text-slate-400 mb-1">
                              Visual Style Direction
                            </label>
                            <input
                              type="text"
                              value={thumbPromptStyle}
                              onChange={(e) => setThumbPromptStyle(e.target.value)}
                              placeholder="e.g. Cinematic, DSLR photorealistic, neon highlights"
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2 border-t border-slate-800/65">
                        <button
                          onClick={() => handleGenerate("thumbnail_prompt")}
                          disabled={loading}
                          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 active:scale-95 disabled:opacity-50 disabled:scale-100 text-xs font-bold text-white rounded-xl shadow-lg shadow-purple-600/10 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          {loading ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Staging Design Tiers...
                            </>
                          ) : (
                            <>
                              <Send className="w-3 h-3 text-purple-200" />
                              Generate 5 Prompt Concepts
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Prompts Results List */}
                    {thumbPromptResult ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold font-display text-slate-300">
                            Suggested Prompts for "{thumbPromptResult.topic}"
                          </h4>
                          <button
                            onClick={() => handleSaveResult("thumbnail_prompt", `Prompts: ${thumbPromptResult.topic}`, thumbPromptResult)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-pink-500/10 border border-pink-500/20 text-[10px] font-semibold text-pink-400 hover:bg-pink-500/25 active:scale-95 transition-all rounded-lg"
                          >
                            <Bookmark className="w-3 h-3" /> Save Suite
                          </button>
                        </div>

                        <div className="space-y-4">
                          {thumbPromptResult.prompts.map((concept, idx) => {
                            const slotId = `concept-${idx}`;
                            const isSlotLoading = imageLoadingId === slotId;
                            const slotImage = generatedImages[slotId];

                            return (
                              <div
                                key={idx}
                                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700/80 transition-all shadow-inner relative"
                              >
                                <div className="absolute right-4 top-4 font-mono text-[10px] font-bold text-slate-600">
                                  SUITE CONCEPT #{idx + 1}
                                </div>

                                <div className="space-y-2">
                                  <h5 className="text-sm font-bold font-display text-white pr-10">
                                    {concept.conceptName}
                                  </h5>

                                  {/* Psychological Trigger indicator */}
                                  <div className="flex items-center gap-1.5 bg-pink-500/10 border border-pink-500/20 px-2 py-0.5 rounded text-[10px] text-pink-400 w-fit font-mono font-bold">
                                    <Flame className="w-3 h-3" /> TRIGGER: {concept.psychologyTrigger}
                                  </div>

                                  <div className="text-xs space-y-1.5 pt-2 border-t border-slate-800/80">
                                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-850">
                                      <span className="block text-[9px] uppercase font-bold font-mono text-purple-400 mb-1">
                                        Midjourney / Imagen Image Prompt
                                      </span>
                                      <p className="text-slate-300 select-all font-mono text-xs leading-relaxed">
                                        {concept.imagePrompt}
                                      </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                                      <div className="bg-slate-950/60 p-2.5 rounded border border-slate-850">
                                        <span className="block text-[8px] uppercase font-bold font-mono text-slate-500 mb-0.5">
                                          Suggested Overlay Text
                                        </span>
                                        <p className="text-pink-300 font-bold font-display uppercase text-xs">
                                          {concept.overlayText}
                                        </p>
                                      </div>
                                      <div className="bg-slate-950/60 p-2.5 rounded border border-slate-850">
                                        <span className="block text-[8px] uppercase font-bold font-mono text-slate-500 mb-0.5">
                                          Layout & Positioning
                                        </span>
                                        <p className="text-slate-400 text-[11px] leading-snug">
                                          {concept.layoutPlacement}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Active generation view */}
                                <div className="mt-4 pt-4 border-t border-slate-800/70 flex flex-col md:flex-row gap-4 items-start">
                                  <div className="flex-1 space-y-2">
                                    <button
                                      onClick={() => handleGenerateImage(concept.imagePrompt, "16:9", slotId)}
                                      disabled={isSlotLoading || loading}
                                      className={`w-full py-2 px-4 rounded-lg text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer ${
                                        slotImage
                                          ? "bg-slate-950 hover:bg-slate-850 text-purple-400 border border-purple-500/20"
                                          : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow"
                                      }`}
                                    >
                                      {isSlotLoading ? (
                                        <>
                                          <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                          Generating Pixels (Imagen 3)...
                                        </>
                                      ) : slotImage ? (
                                        <>
                                          <Sparkles className="w-3.5 h-3.5" /> Re-Generate Image
                                        </>
                                      ) : (
                                        <>
                                          <ImageIcon className="w-3.5 h-3.5" /> Generate Image Workspace Preview
                                        </>
                                      )}
                                    </button>

                                    <button
                                      onClick={() => handleCopyText(concept.imagePrompt, `promptCopy-${idx}`)}
                                      className="w-full py-1 text-[10px] text-slate-400 hover:text-white font-mono bg-slate-950 border border-slate-850 rounded"
                                    >
                                      {copiedId === `promptCopy-${idx}` ? "✓ Prompt Copied" : "Copy Raw Prompt String"}
                                    </button>
                                  </div>

                                  {/* Preview Card box with overlay text rendered on top dynamically! */}
                                  <div className="w-full md:w-56 shrink-0 aspect-[16/9] bg-slate-950/80 rounded-xl overflow-hidden border border-slate-800 relative flex items-center justify-center shadow-inner text-center">
                                    {slotImage ? (
                                      <>
                                        <img
                                          src={slotImage}
                                          alt="Imagen output"
                                          referrerPolicy="no-referrer"
                                          className="w-full h-full object-cover transition-opacity duration-350"
                                        />
                                        <div className="absolute top-2 left-2 bg-slate-950/70 backdrop-blur px-1 py-0.5 rounded text-[7px] font-mono tracking-widest text-[#cbd5e1]">
                                          IMAGEN 3 ORIGINAL
                                        </div>
                                        {/* Suggested text overlay overlayed on top! */}
                                        <div className="absolute inset-0 flex items-center justify-center p-3 select-none">
                                          <div className="bg-rose-650 text-white px-2 py-0.5 font-display font-black text-[10px] tracking-wide uppercase shadow-lg border border-red-400/30 rounded transform -rotate-1">
                                            {concept.overlayText}
                                          </div>
                                        </div>
                                      </>
                                    ) : (
                                      <div className="p-3 text-center space-y-1 text-[10px] text-slate-500">
                                        {isSlotLoading ? (
                                          <div className="space-y-2">
                                            <div className="w-5 h-5 border-2 border-purple-500/30 border-t-purple-400 rounded-full animate-spin mx-auto" />
                                            <p className="text-purple-400/80 font-mono text-[9px]">Synthesizing pixels...</p>
                                          </div>
                                        ) : (
                                          <>
                                            <ImageIcon className="w-6 h-6 mx-auto text-slate-750 mb-1" />
                                            <span>Image preview is empty.</span>
                                            <p className="text-[9px] text-slate-500">Press "Generate Workspace" to render.</p>
                                          </>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-900 border border-dashed border-slate-800 rounded-2xl p-12 text-center text-slate-500">
                        <Sparkles className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                        <h4 className="text-xs font-semibold text-slate-400">Ready to build prompts?</h4>
                        <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                          Configure your theme niche and style parameters, and select "Generate 5 Prompt Concepts".
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Raw custom image generation workspace (Span 5) */}
                  <div className="lg:col-span-5 space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
                      <div className="border-b border-slate-800 pb-3">
                        <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-pink-400" /> Direct AI Image Generator
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Type any custom prompt to generate absolute high-definition visual assets directly using Imagen 3.
                        </p>
                      </div>

                      <div className="space-y-3.5">
                        <div>
                          <label className="block text-[10px] uppercase font-bold tracking-wider font-mono text-slate-400 mb-1">
                            Aesthetic Prompt details
                          </label>
                          <textarea
                            rows={4}
                            value={customImagePrompt}
                            onChange={(e) => setCustomImagePrompt(e.target.value)}
                            placeholder="e.g. An elegant workspace setup on a clean desk, moody neon purple light..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 transition-colors resize-none leading-relaxed"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] uppercase font-bold tracking-wider font-mono text-slate-400 mb-1">
                              Aspect Ratio Sizing
                            </label>
                            <select
                              value={customAspectRatio}
                              onChange={(e) => setCustomAspectRatio(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
                            >
                              <option value="16:9">YouTube Landscape (16:9)</option>
                              <option value="9:16">Shorts/TikTok Frame (9:16)</option>
                              <option value="1:1">Instagram/Square Layout (1:1)</option>
                              <option value="4:3">Standard Slate (4:3)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase font-bold tracking-wider font-mono text-slate-400 mb-1">
                              Mockup Overlay text
                            </label>
                            <input
                              type="text"
                              value={customOverlay}
                              onChange={(e) => setCustomOverlay(e.target.value)}
                              placeholder="e.g. MUST WATCH!"
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
                            />
                          </div>
                        </div>

                        <button
                          onClick={() => handleGenerateImage(customImagePrompt, customAspectRatio, "custom")}
                          disabled={customImageLoading || loading}
                          className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/15 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          {customImageLoading ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Synthesizing Asset (Imagen 3)...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5 text-purple-200" />
                              Generate Asset & Review
                            </>
                          )}
                        </button>
                      </div>

                      {/* Direct preview pane */}
                      <div className="bg-slate-950 border border-slate-850 p-4.5 rounded-2xl flex flex-col items-center justify-center space-y-3 shadow-inner">
                        <span className="block text-[9px] uppercase font-bold font-mono text-slate-500 tracking-wider">
                          GENERATION RENDER OUTPUT
                        </span>

                        <div className="w-full aspect-[16/9] bg-slate-900 border border-slate-800/80 rounded-xl overflow-hidden relative flex items-center justify-center text-center">
                          {customImageUrl ? (
                            <>
                              <img
                                src={customImageUrl}
                                alt="Direct custom Imagen design ready"
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-2 left-2 bg-slate-950/70 backdrop-blur px-1 py-0.5 rounded text-[7px] font-mono tracking-widest text-[#cbd5e1]">
                                RAW ASSET OUTPUT
                              </div>
                              {/* Overlay suggested text if typed */}
                              {customOverlay && (
                                <div className="absolute inset-0 flex items-center justify-center p-3 select-none">
                                  <div className="bg-purple-600 border border-purple-400/40 text-white px-3 py-1 font-display font-black text-xs tracking-wider uppercase shadow-xl rounded transform -rotate-1">
                                    {customOverlay}
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="p-4 text-center space-y-1.5 text-xs text-slate-500">
                              {customImageLoading ? (
                                <div className="space-y-2">
                                  <div className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-400 rounded-full animate-spin mx-auto" />
                                  <p className="text-purple-400 font-mono text-[9px]">Synthesizing pixels...</p>
                                </div>
                              ) : (
                                <>
                                  <ImageIcon className="w-8 h-8 text-slate-850 mx-auto" />
                                  <span>Asset view is empty.</span>
                                  <p className="text-[10px] text-slate-500 font-sans">Configure prompt and press Render.</p>
                                </>
                              )}
                            </div>
                          )}
                        </div>

                        {customImageUrl && (
                          <div className="w-full flex gap-2">
                            <button
                              onClick={() => {
                                handleSaveResult("thumbnail", `Custom Design: ${customImagePrompt.substring(0, 30)}...`, { imageUrl: customImageUrl, prompt: customImagePrompt, overlayText: customOverlay });
                              }}
                              className="flex-1 py-1.5 bg-pink-500/10 border border-pink-500/20 text-[10px] text-pink-400 font-bold hover:bg-pink-500/20 rounded transition-all"
                            >
                              Save Output
                            </button>
                            <button
                              onClick={() => handleCopyText(customImageUrl, "customImgUrl")}
                              className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white font-mono text-[9px] rounded flex items-center justify-center gap-1 border border-slate-800"
                            >
                              {copiedId === "customImgUrl" ? "✓ URL Copied" : "Copy Data URL"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}

          {/* 5. SCRIPT GENERATOR */}
          {activeTab === "script" && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="p-1 px-2.5 font-mono text-[10px] uppercase font-bold tracking-widest text-violet-400 bg-violet-400/10 border border-violet-400/20 rounded-full">
                    Screenplay Structure Generator
                  </span>
                </div>
                <h2 className="text-3xl font-bold font-display tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  Micro-Visual Screenplay Script Generator
                </h2>
                <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                  Build complete cinematic screenplays with incremental visual directions, audio hooks, SFX cues, and high-converting CTA.
                </p>
              </div>

              {/* Form Input Deck */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs uppercase font-bold tracking-wider font-mono text-slate-400 mb-1.5">
                      Chosen Video Title
                    </label>
                    <input
                      type="text"
                      value={scriptTitle}
                      onChange={(e) => setScriptTitle(e.target.value)}
                      placeholder="e.g. My $3,000 Setup Build Secrets"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase font-bold tracking-wider font-mono text-slate-400 mb-1.5">
                      Format length
                    </label>
                    <select
                      value={scriptFormat}
                      onChange={(e) => setScriptFormat(e.target.value as "shorts" | "long-form")}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
                    >
                      <option value="shorts">YouTube Shorts Frame (60-sec cap)</option>
                      <option value="long-form">Detailed Video Frame (5-10 mins)</option>
                    </select>
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-xs uppercase font-bold tracking-wider font-mono text-slate-400 mb-1.5">
                    Creative Vibe & Sound Tone
                  </label>
                  <input
                    type="text"
                    value={scriptTone}
                    onChange={(e) => setScriptTone(e.target.value)}
                    placeholder="e.g. High octane narration, relaxed ASMR, fast tech talker"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-slate-800/60 pt-4 flex-wrap gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Info className="w-4 h-4 text-slate-500" />
                    <span>Structures direct pacing visual-to-audio timelines.</span>
                  </div>
                  <button
                    onClick={() => handleGenerate("script")}
                    disabled={loading}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-500 active:scale-95 disabled:opacity-50 disabled:scale-100 text-sm font-semibold text-white rounded-xl shadow-lg shadow-purple-600/10 transition-all flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Scripting Narration Beats...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-purple-200" />
                        Generate Script Screenplay
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Outputs Script Display */}
              {scriptResult ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold font-display text-slate-200">
                        Cinematic Script: "{scriptResult.title}"
                      </h3>
                      <p className="text-xs text-slate-450 uppercase font-mono font-bold text-violet-400">
                        {scriptResult.format} · Tone: {scriptResult.tone}
                      </p>
                    </div>
                    <button
                      onClick={() => handleSaveResult("script", `Script: ${scriptResult.title} (${scriptResult.format})`, scriptResult)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-500/10 border border-pink-500/20 text-xs font-semibold text-pink-400 hover:bg-pink-500/25 active:scale-95 transition-all rounded-lg"
                    >
                      <Bookmark className="w-3.5 h-3.5" /> Save Screenplay to Studio
                    </button>
                  </div>

                  {/* Staged Presentation layout */}
                  <div className="space-y-4">
                    {/* Visual 1st Sec Hook Card */}
                    <div className="bg-gradient-to-r from-violet-950/40 via-purple-950/20 to-slate-900 border border-violet-500/20 rounded-2xl p-6 shadow-md">
                      <span className="block text-[10px] font-mono tracking-widest font-black uppercase text-violet-400 mb-2">
                        THE 3-SECOND RETENTION HOOK
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                        <div className="space-y-1">
                          <span className="text-slate-450 uppercase font-mono font-bold block text-[10px]">What is shown (Visual)</span>
                          <p className="text-slate-200 font-medium">{scriptResult.hookVisual}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-slate-450 uppercase font-mono font-bold block text-[10px]">What is heard (Audio Narration)</span>
                          <p className="text-amber-300 font-bold text-sm tracking-tight">{scriptResult.hookAudio}</p>
                        </div>
                      </div>
                    </div>

                    {/* Timeline lists */}
                    <div className="space-y-3">
                      <span className="block text-xs uppercase font-mono tracking-wider text-slate-500 px-1">
                        Scene Flow Timeline Beats
                      </span>
                      {scriptResult.sections.map((sec, i) => (
                        <div
                          key={i}
                          className="bg-slate-900 border border-slate-850 rounded-xl p-5 hover:border-slate-800 transition-all flex flex-col md:flex-row gap-4 items-start md:items-center relative"
                        >
                          <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg flex flex-col items-center justify-center shrink-0 w-16 text-center shadow-inner">
                            <span className="text-[10px] font-mono uppercase text-slate-500 font-bold mb-0.5">SCENE</span>
                            <span className="text-lg font-black font-display text-white">0{sec.sceneNum || i+1}</span>
                          </div>

                          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
                            <div className="space-y-0.5">
                              <span className="text-slate-500 uppercase font-mono font-bold text-[9px] block">Camera Visual & Action</span>
                              <p className="text-slate-300 pr-2 leading-relaxed">{sec.visualStyle}</p>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-slate-500 uppercase font-mono font-bold text-[9px] block">Narration / Vocal Line</span>
                              <p className="text-slate-100 font-medium pr-2 text-[13px] leading-relaxed select-all">"{sec.spokenLine}"</p>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-slate-500 uppercase font-mono font-bold text-[9px] block">SFX Cues & Vibes</span>
                              <p className="text-slate-400 leading-relaxed font-mono italic text-[11px]">{sec.sfx || "No SFX cues suggested"}</p>
                            </div>
                          </div>

                          <div className="bg-slate-950/60 p-2 border border-slate-850 rounded-lg text-center shrink-0 self-stretch flex flex-col justify-center">
                            <span className="text-[9px] font-mono uppercase text-slate-500 font-bold block">DURATION</span>
                            <span className="text-xs font-bold font-mono text-purple-400">{sec.duration}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Final call to action card block */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
                      <span className="block text-[10px] font-mono tracking-widest font-black uppercase text-pink-400 mb-2">
                        CONVERTING CALL TO ACTION (CTA)
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                        <div className="space-y-1">
                          <span className="text-slate-450 uppercase font-mono font-bold block text-[10px]">End-Frame Staging Visual</span>
                          <p className="text-slate-200">{scriptResult.ctaVisual}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-slate-450 uppercase font-mono font-bold block text-[10px]">End-Frame Spoken Pitch</span>
                          <p className="text-pink-300 font-bold italic">"{scriptResult.ctaSpoken}"</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900 border border-dashed border-slate-800 rounded-2xl p-12 text-center text-slate-500">
                  <FileCode className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                  <h4 className="text-base font-semibold text-slate-400">Cinematic Script Screenplay Creator</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Type in your chosen YouTube video title and let CreatorBoost orchestrate precise visual cues, spoken dialogue pacing, and SFX notes.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 6. TREND TRACKER EXPLORER */}
          {activeTab === "trend" && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="p-1 px-2.5 font-mono text-[10px] uppercase font-bold tracking-widest text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 rounded-full">
                    Viral Velocity Tracker
                  </span>
                </div>
                <h2 className="text-3xl font-bold font-display tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  Viral Trends Finder
                </h2>
                <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                  Leverage current social triggers and platform velocity indicators. Detail why ideas trend, psychological hooks, and adoptable visual strategies.
                </p>
              </div>

              {/* Form Input Deck */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className="block text-xs uppercase font-bold tracking-wider font-mono text-slate-400 mb-1.5">
                      Creator Industry Category
                    </label>
                    <select
                      value={trendCategory}
                      onChange={(e) => setTrendCategory(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
                    >
                      <option value="Tech, Programming & AI">Tech, Programming & AI</option>
                      <option value="Finance, Stocks & Crypto">Finance, Stocks & Crypto</option>
                      <option value="Gaming & Speedruns">Gaming & Speedruns (Minecraft, Roblox, Esports)</option>
                      <option value="Self-Improvement & Fitness">Self-Improvement & Fitness</option>
                      <option value="Vlog, Travel & Everyday Life">Vlog, Travel & Everyday Life</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase font-bold tracking-wider font-mono text-slate-400 mb-1.5">
                      Target Social Network
                    </label>
                    <select
                      value={trendPlatform}
                      onChange={(e) => setTrendPlatform(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
                    >
                      <option value="youtube">YouTube (Long & Shorts)</option>
                      <option value="tiktok">TikTok Channels</option>
                      <option value="instagram">Instagram Reels Feed</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-800/60 pt-4 flex-wrap gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Info className="w-4 h-4 text-slate-500" />
                    <span>Scans search patterns and viral velocity metrics.</span>
                  </div>
                  <button
                    onClick={() => handleGenerate("trend")}
                    disabled={loading}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-500 active:scale-95 disabled:opacity-50 disabled:scale-100 text-sm font-semibold text-white rounded-xl shadow-lg shadow-purple-600/10 transition-all flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Scanning Social Media Velocity...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-purple-200" />
                        Scan Viral Trends
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Rendering output */}
              {trendResult ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold font-display text-slate-200">
                        Top Trending Topics: "{trendResult.category}"
                      </h3>
                      <p className="text-xs text-slate-450 uppercase font-mono font-bold text-cyan-400">
                        Platform: {trendResult.platform}
                      </p>
                    </div>
                    <button
                      onClick={() => handleSaveResult("trend", `Trends: ${trendResult.category}`, trendResult)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-500/10 border border-pink-500/20 text-xs font-semibold text-pink-400 hover:bg-pink-500/25 active:scale-95 transition-all rounded-lg"
                    >
                      <Bookmark className="w-3.5 h-3.5" /> Save Trend Report to Workspace
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {trendResult.trends.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-6 rounded-2xl shadow-md transition-all group flex flex-col md:flex-row md:items-center gap-6"
                      >
                        {/* Left visual velocity gauge */}
                        <div className="shrink-0 flex flex-col items-center justify-center p-4 bg-slate-950 border border-slate-800 rounded-xl w-32 shadow-inner text-center">
                          <span className="text-[9px] font-mono uppercase text-slate-500 font-bold block mb-1">GROWTH RATIO</span>
                          <span className="text-xl font-black font-mono text-cyan-400 tracking-tight">{item.velocity || "950% ↑"}</span>
                          <div className="w-full h-1 bg-slate-850 rounded-full mt-2 overflow-hidden">
                            <div className="h-full bg-cyan-500 rounded-full" style={{ width: "85%" }} />
                          </div>
                        </div>

                        {/* Mid descriptions elements */}
                        <div className="flex-1 space-y-2">
                          <h4 className="text-lg font-bold font-display text-white group-hover:text-cyan-300 transition-colors">
                            {item.trendTitle}
                          </h4>
                          <p className="text-xs text-slate-350 pr-4 leading-relaxed font-sans">
                            <span className="font-bold text-slate-450">Why it trends:</span> {item.explanation}
                          </p>
                          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-850 inline-block text-xs italic text-[11px] text-purple-300 font-sans mt-1">
                            <span className="font-bold font-mono tracking-wider uppercase text-[9px] text-slate-500 not-italic block mb-0.5">Audience Triggers</span>
                            "{item.targetAudienceTip}"
                          </div>
                        </div>

                        {/* Right: Creator angles adaptions pointers */}
                        <div className="shrink-x bg-slate-950/70 border border-slate-850 p-4 rounded-xl md:w-80 font-sans text-xs">
                          <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider block mb-2 border-b border-slate-850 pb-1">
                            Suggested Creator Adaption Angles
                          </span>
                          <ul className="space-y-1.5">
                            {item.angles.map((ang, i) => (
                              <li key={i} className="flex gap-2 text-slate-300 text-[11px] leading-relaxed">
                                <span className="font-bold text-purple-400 shrink-0">✓</span>
                                <span>{ang}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900 border border-dashed border-slate-800 rounded-2xl p-12 text-center text-slate-500">
                  <TrendingUp className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                  <h4 className="text-base font-semibold text-slate-400">Viral Trends Velocity Tracker</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Select your creator category niche and trigger the tracker to gather velocity analytics metrics showing why concepts trend with adoptable video models.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 7. SAVED LIBRARY */}
          {activeTab === "saves" && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="p-1 px-2.5 font-mono text-[10px] uppercase font-bold tracking-widest text-pink-400 bg-pink-400/10 border border-pink-400/20 rounded-full">
                    Your Personal Studio Library
                  </span>
                </div>
                <h2 className="text-3xl font-bold font-display tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  Saved Content Studio Workspace
                </h2>
                <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                  Manage ideas, CTR titles, screenplays, thumbnail overlays, and trend velocity reports compiled during your current work session.
                </p>
              </div>

              {savedItems.length === 0 ? (
                <div className="bg-slate-900 border border-dashed border-slate-800 rounded-2xl p-16 text-center text-slate-500">
                  <Heart className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                  <h4 className="text-base font-semibold text-slate-400">No Content Saved Yet</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    When you run any of the booster tools, click the "Save to Workspace" button to compile them into this studio pipeline.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {savedItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl shadow-md transition-all"
                    >
                      {/* Header bar of saved item */}
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                        <div className="flex items-center gap-2.5">
                          <span className={`p-1 px-2.5 font-mono text-[9px] uppercase font-bold rounded-md ${
                            item.type === "idea" ? "bg-amber-400/10 text-amber-400 border border-amber-400/20" :
                            item.type === "title" ? "bg-blue-400/10 text-blue-400 border border-blue-400/20" :
                            item.type === "description" ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20" :
                            item.type === "thumbnail" ? "bg-pink-400/10 text-pink-400 border border-pink-400/20" :
                            item.type === "script" ? "bg-violet-400/10 text-violet-400 border border-violet-400/20" :
                            "bg-cyan-400/10 text-cyan-400 border border-cyan-400/20"
                          }`}>
                            {item.type}
                          </span>
                          <span className="text-sm font-bold font-display text-white">{item.title}</span>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-600" /> {item.timestamp}
                          </span>
                          <button
                            onClick={() => handleRemoveSaved(item.id)}
                            className="p-1 px-2 text-rose-405 hover:bg-rose-500/10 hover:text-rose-400 rounded transition-colors text-xs flex items-center gap-1 font-mono hover:scale-105"
                            title="Remove Saved Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> delete
                          </button>
                        </div>
                      </div>

                      {/* Expandable Render based on model saved type */}
                      <div className="space-y-4">
                        {/* IDEAS */}
                        {item.type === "idea" && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {item.data.ideas.map((idea: VideoIdea, idx: number) => (
                              <div key={idx} className="bg-slate-950 p-4 border border-slate-850 rounded-xl relative">
                                <span className="absolute right-3 top-3 font-mono text-[10px] text-slate-600 font-black">IDEA #{idx+1}</span>
                                <h5 className="font-bold text-xs text-white pr-10">{idea.title}</h5>
                                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed"><strong className="text-slate-500">Angle:</strong> {idea.angle}</p>
                                <p className="text-[11px] text-slate-400 leading-relaxed"><strong className="text-purple-400">Pacing:</strong> {idea.pacingTip}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* TITLES */}
                        {item.type === "title" && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
                            <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl">
                              <span className="block text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500 border-b border-slate-800 pb-1 mb-2">CTR CLickable</span>
                              <ul className="space-y-1 text-slate-300">
                                {item.data.clickable?.map((it: string, i: number) => <li key={i} className="py-0.5 leading-relaxed bg-slate-900/40 px-1.5 rounded">{it}</li>)}
                              </ul>
                            </div>
                            <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl">
                              <span className="block text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500 border-b border-slate-800 pb-1 mb-2">SEO Optimized</span>
                              <ul className="space-y-1 text-slate-300">
                                {item.data.seo?.map((it: string, i: number) => <li key={i} className="py-0.5 leading-relaxed bg-slate-900/40 px-1.5 rounded">{it}</li>)}
                              </ul>
                            </div>
                            <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl">
                              <span className="block text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500 border-b border-slate-800 pb-1 mb-2">Shorts & Portrait</span>
                              <ul className="space-y-1 text-slate-300">
                                {item.data.shorts?.map((it: string, i: number) => <li key={i} className="py-0.5 leading-relaxed bg-slate-900/40 px-1.5 rounded text-pink-300 font-bold font-mono">{it}</li>)}
                              </ul>
                            </div>
                          </div>
                        )}

                        {/* DESCRIPTIONS */}
                        {item.type === "description" && (
                          <div className="space-y-3">
                            <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl whitespace-pre-wrap font-mono text-[11px] leading-relaxed max-h-[220px] overflow-y-auto text-slate-300 select-all">
                              {item.data.formattedDescription}
                            </div>
                            <div className="flex flex-wrap gap-2 text-[11px]">
                              {item.data.hashtags?.map((ht: string, i: number) => <span key={i} className="text-purple-400 font-bold">{ht}</span>)}
                              {item.data.tags?.map((tag: string, i: number) => <span key={i} className="bg-slate-950 px-2 py-0.5 border border-slate-850 text-slate-400 rounded">{tag}</span>)}
                            </div>
                          </div>
                        )}

                        {/* THUMBNAILS */}
                        {item.type === "thumbnail" && (
                          <div>
                            {item.data?.imageUrl ? (
                              <div className="flex flex-col md:flex-row gap-4 items-start bg-slate-950 border border-slate-850 p-4 rounded-xl">
                                <div className="w-full md:w-64 aspect-[16/9] bg-slate-900 rounded-lg overflow-hidden border border-slate-800 relative shadow-inner">
                                  <img
                                    src={item.data.imageUrl}
                                    alt="Saved generation"
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover"
                                  />
                                  {item.data.overlayText && (
                                    <div className="absolute inset-0 flex items-center justify-center p-3 select-none">
                                      <div className="bg-purple-600 border border-purple-400/40 text-white px-2.5 py-0.5 font-display font-black text-[10px] tracking-wider uppercase shadow-xl rounded transform -rotate-1">
                                        {item.data.overlayText}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 space-y-1">
                                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500">Prompt detail</span>
                                  <p className="text-xs text-slate-350 font-mono leading-relaxed bg-slate-900/60 p-2 border border-slate-800 rounded select-all max-h-[100px] overflow-y-auto">
                                    {item.data.prompt}
                                  </p>
                                  {item.data.overlayText && (
                                    <p className="text-[10px] text-slate-450 mt-1">
                                      <strong className="text-pink-400 uppercase">Banner Text:</strong> "{item.data.overlayText}"
                                    </p>
                                  )}
                                </div>
                              </div>
                            ) : item.data?.suggestions ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-sans">
                                {item.data.suggestions.map((sug: ThumbnailSuggestion, i: number) => (
                                  <div key={i} className="bg-slate-950 border border-slate-850 rounded-xl p-3">
                                    <div className="aspect-[16/9] rounded mb-2 flex items-center justify-center font-display font-extrabold text-[10px] tracking-wide uppercase shadow" style={{ backgroundColor: sug.bgColor, color: sug.textColor }}>
                                      {sug.text}
                                    </div>
                                    <span className="font-bold text-slate-300">"{sug.text}"</span>
                                    <p className="text-[10px] text-slate-400 mt-1 italic pr-1">{sug.compositionTip}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-500 italic">No layout data available.</p>
                            )}
                          </div>
                        )}

                        {/* THUMBNAIL_PROMPTS */}
                        {item.type === "thumbnail_prompt" && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                            {item.data.prompts.map((p: ThumbnailPromptConcept, idx: number) => (
                              <div key={idx} className="bg-slate-950 border border-slate-850 rounded-xl p-4 space-y-2 relative">
                                <span className="absolute right-3 top-3 font-mono text-[9px] text-slate-600">Concept #{idx+1}</span>
                                <h5 className="font-bold text-white font-display uppercase">{p.conceptName}</h5>
                                <div className="p-2 bg-slate-900 border border-slate-800 rounded text-[10px] font-mono text-slate-400 select-all leading-relaxed whitespace-pre-wrap">
                                  {p.imagePrompt}
                                </div>
                                <div className="text-[10px] space-y-1">
                                  <p><strong className="text-slate-500">Overlay:</strong> <span className="text-pink-400 font-bold uppercase">{p.overlayText}</span></p>
                                  <p><strong className="text-slate-505">Placement:</strong> <span className="text-slate-300">{p.layoutPlacement}</span></p>
                                  <p><strong className="text-slate-500">Trigger:</strong> <span className="text-purple-400 font-bold">{p.psychologyTrigger}</span></p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* SCRIPTS */}
                        {item.type === "script" && (
                          <div className="space-y-3">
                            <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 text-[11px]">
                              <p className="border-b border-slate-800 pb-1 mb-2 font-mono"><strong className="text-purple-400 uppercase">Retention Hook Line:</strong> {item.data.hookAudio}</p>
                              <div className="space-y-1 font-sans">
                                {item.data.sections.slice(0, 3).map((sec: ScriptSection, idx: number) => (
                                  <div key={idx} className="flex gap-2 text-slate-300 my-1 py-1 bg-slate-900/30 rounded px-1.5">
                                    <span className="font-bold text-purple-400">Section {sec.sceneNum}:</span>
                                    <span>"{sec.spokenLine}" <span className="text-slate-500 font-mono">({sec.duration})</span></span>
                                  </div>
                                ))}
                                {item.data.sections.length > 3 && (
                                  <span className="text-[10px] text-slate-600 block pl-1.5 italic font-mono">+ {item.data.sections.length - 3} further scene sequences inside generated screenplay record...</span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* TRENDS */}
                        {item.type === "trend" && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                            {item.data.trends.map((trend: TrendItem, i: number) => (
                              <div key={i} className="bg-slate-950 border border-slate-850 rounded-xl p-4">
                                <h5 className="font-bold text-white font-display mb-1">{trend.trendTitle} <span className="text-[10px] text-cyan-400 font-mono ml-1.5">({trend.velocity})</span></h5>
                                <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">{trend.explanation}</p>
                                <div className="border-t border-slate-850 pt-2 flex flex-wrap gap-1.5">
                                  {trend.angles.map((ang: string, aIdx: number) => <span key={aIdx} className="bg-slate-900 text-[10px] px-1.5 py-0.5 rounded text-slate-300">✓ {ang}</span>)}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 9. CUSTOM API PROVIDER KEYS */}
          {activeTab === "api-keys" && (
            <div className="space-y-8 max-w-4xl mx-auto py-4">
              <div className="text-center">
                <span className="p-1 px-3 font-mono text-[10px] uppercase font-bold tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-full inline-block">
                  Bring Your Own API Keys
                </span>
                <h2 className="text-4xl font-extrabold font-display tracking-tight text-white mt-3 text-center w-full">
                  API Configuration Dashboard
                </h2>
                <p className="text-slate-400 mt-2 max-w-lg mx-auto text-sm leading-relaxed">
                  Bypass standard daily limits, unlock developer benefits, and self-fund your content creation requests by configuring custom providers.
                </p>
              </div>

              {/* Status & Settings block */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. Default Tier Card */}
                <div className={`border rounded-2xl p-6 flex flex-col justify-between transition-all ${
                  preferredProvider === "default" 
                    ? "bg-slate-900/90 border-purple-500 shadow-md shadow-purple-950/20" 
                    : "bg-slate-900/40 border-slate-800"
                }`}>
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-xs font-mono font-bold text-slate-400 tracking-wide">Developer Server</span>
                      <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                        preferredProvider === "default" 
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" 
                          : "bg-slate-800 text-slate-500"
                      }`}>
                        {preferredProvider === "default" ? "Active" : "Standard"}
                      </span>
                    </div>
                    <span className="block font-display font-bold text-lg text-white mb-1">Default Gemini Core</span>
                    <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                      Powered by host-integrated high speed models. Subject to the standard free tier daily rate quota tracking.
                    </p>
                    <div className="space-y-2 border-t border-slate-800/80 pt-4 text-[11px] text-slate-350">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Language Model:</span>
                        <span className="font-mono">gemini-3.5-flash</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Image Model:</span>
                        <span className="font-mono">imagen-4.0-generate-001</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSavePreferredProvider("default")}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold mt-6 cursor-pointer transition-all ${
                      preferredProvider === "default"
                        ? "bg-purple-600 text-white shadow"
                        : "bg-slate-800 hover:bg-slate-750 text-slate-300"
                    }`}
                  >
                    {preferredProvider === "default" ? "Currently Active" : "Select Default Mode"}
                  </button>
                </div>

                {/* 2. Custom OpenAI Key Card */}
                <div className={`border rounded-2xl p-6 flex flex-col justify-between transition-all ${
                  preferredProvider === "openai" 
                    ? "bg-slate-900/90 border-amber-500 shadow-md shadow-amber-950/20" 
                    : "bg-slate-900/40 border-slate-800"
                }`}>
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-xs font-mono font-bold text-slate-400 tracking-wide">Custom OpenAI Integration</span>
                      <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                        preferredProvider === "openai" 
                          ? "bg-amber-400/25 text-amber-300 border border-amber-400/30 animate-pulse" 
                          : "bg-slate-800 text-slate-500"
                      }`}>
                        {preferredProvider === "openai" ? "Active" : openaiKey ? "Saved" : "Not Set"}
                      </span>
                    </div>
                    <span className="block font-display font-bold text-lg text-white mb-1">OpenAI API Key</span>
                    <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                      Execute video scripts, descriptions, and thumbnail prompt layouts using elite-tier GPT capabilities with zero rate limit limits.
                    </p>
                    <div className="space-y-2 border-t border-slate-800/80 pt-4 text-[11px] text-slate-350 font-sans">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Language Model:</span>
                        <span className="font-mono text-amber-300">gpt-4o-mini</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Image Model:</span>
                        <span className="font-mono text-amber-300">dall-e-3 (OpenAI)</span>
                      </div>
                    </div>
                  </div>
                  <button
                    disabled={!openaiKey}
                    onClick={() => handleSavePreferredProvider("openai")}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold mt-6 cursor-pointer transition-all ${
                      preferredProvider === "openai"
                        ? "bg-amber-400 text-slate-950 shadow"
                        : openaiKey
                        ? "bg-slate-800 hover:bg-slate-755 text-slate-200"
                        : "bg-slate-900 text-slate-650 cursor-not-allowed"
                    }`}
                  >
                    {!openaiKey ? "Provide Key Below First" : preferredProvider === "openai" ? "Currently Active" : "Select OpenAI Mode"}
                  </button>
                </div>

                {/* 3. Custom Gemini Key Card */}
                <div className={`border rounded-2xl p-6 flex flex-col justify-between transition-all ${
                  preferredProvider === "custom-gemini" 
                    ? "bg-slate-900/90 border-blue-500 shadow-md shadow-blue-950/20" 
                    : "bg-slate-900/40 border-slate-800"
                }`}>
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-xs font-mono font-bold text-slate-400 tracking-wide">Custom Google Integration</span>
                      <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                        preferredProvider === "custom-gemini" 
                          ? "bg-blue-500/20 text-blue-300 border border-blue-500/30 animate-pulse" 
                          : "bg-slate-800 text-slate-500"
                      }`}>
                        {preferredProvider === "custom-gemini" ? "Active" : userGeminiKey ? "Saved" : "Not Set"}
                      </span>
                    </div>
                    <span className="block font-display font-bold text-lg text-white mb-1">Custom Gemini API Key</span>
                    <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                      Deploy your own cloud Google GenAI billing engine credentials to unlock unrestricted video ideas and script timelines directly.
                    </p>
                    <div className="space-y-2 border-t border-slate-800/80 pt-4 text-[11px] text-slate-350">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Language Model:</span>
                        <span className="font-mono text-blue-300">gemini-3.5-flash</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Image Model:</span>
                        <span className="font-mono text-blue-300">imagen-4.0-generate-001 (Custom)</span>
                      </div>
                    </div>
                  </div>
                  <button
                    disabled={!userGeminiKey}
                    onClick={() => handleSavePreferredProvider("custom-gemini")}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold mt-6 cursor-pointer transition-all ${
                      preferredProvider === "custom-gemini"
                        ? "bg-blue-600 text-white shadow"
                        : userGeminiKey
                        ? "bg-slate-800 hover:bg-slate-750 text-slate-200"
                        : "bg-slate-900 text-slate-650 cursor-not-allowed"
                    }`}
                  >
                    {!userGeminiKey ? "Provide Key Below First" : preferredProvider === "custom-gemini" ? "Currently Active" : "Select Gemini Mode"}
                  </button>
                </div>

              </div>

              {/* API Configuration Form Fields */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
                <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
                  <Key className="w-5 h-5 text-amber-400" /> Enter API Keys Credentials
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                  API Keys are strictly saved inside your browser's local sandbox data compartment (`localStorage`) via encrypted-safe memory state. They are never sent to third parties or saved permanently on the servers. This setup acts as a pipeline proxy.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  
                  {/* OpenAI key entry input */}
                  <div className="space-y-2">
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300 block-label">
                      OpenAI API Key (sk-...)
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        placeholder="Paste your custom OpenAI API key"
                        value={openaiKey}
                        onChange={(e) => {
                          const val = e.target.value.trim();
                          handleSaveOpenaiKey(val);
                          if (val && preferredProvider !== "openai") {
                            handleSavePreferredProvider("openai");
                          }
                        }}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-amber-400 transition-all pr-12 text-left"
                      />
                      {openaiKey && (
                        <button
                          onClick={() => {
                            handleSaveOpenaiKey("");
                            if (preferredProvider === "openai") handleSavePreferredProvider("default");
                          }}
                          className="absolute right-3 top-3 text-[10px] uppercase font-mono tracking-wide text-rose-450 hover:text-rose-300 transition-colors cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <span className="block text-[10px] text-slate-500 leading-normal font-sans">
                      Used for ChatGPT models. Requires an active OpenAI balance setup with standard credit allocations.
                    </span>
                  </div>

                  {/* Gemini key entry input */}
                  <div className="space-y-2">
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300 block-label-gemini">
                      Google Gemini API Key (AIzaSy...)
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        placeholder="Paste your custom Google Gemini API key"
                        value={userGeminiKey}
                        onChange={(e) => {
                          const val = e.target.value.trim();
                          handleSaveUserGeminiKey(val);
                          if (val && preferredProvider !== "custom-gemini") {
                            handleSavePreferredProvider("custom-gemini");
                          }
                        }}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-blue-400 transition-all pr-12 text-left"
                      />
                      {userGeminiKey && (
                        <button
                          onClick={() => {
                            handleSaveUserGeminiKey("");
                            if (preferredProvider === "custom-gemini") handleSavePreferredProvider("default");
                          }}
                          className="absolute right-3 top-3 text-[10px] uppercase font-mono tracking-wide text-rose-455 hover:text-rose-300 transition-colors cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <span className="block text-[10px] text-slate-500 leading-normal font-sans">
                      Created in the Google AI Studio Console. Gives you full, unrestricted direct access to native Gemini endpoints.
                    </span>
                  </div>

                </div>

                {/* Health & Verify block */}
                <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1 px-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono uppercase font-bold">
                      Safe Storage Activated
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Browser-Isolated Local Storage Enabled
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      if (openaiKey && openaiKey.length > 5) {
                        handleSavePreferredProvider("openai");
                        alert(`🎉 SUCCESS: OpenAI API Key activated!\n\nAll content recommendations, scripts, and DALL-E-3 thumbnail builders will now route directly through your OpenAI key bypass. Your daily limits have been fully unlocked!`);
                      } else if (userGeminiKey && userGeminiKey.length > 5) {
                        handleSavePreferredProvider("custom-gemini");
                        alert(`🎉 SUCCESS: Google Gemini API Key activated!\n\nAll calls will run through your custom Gemini project credentials.`);
                      } else {
                        handleSavePreferredProvider("default");
                        alert(`Please paste a valid API key into the inputs first to activate!`);
                      }
                    }}
                    className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-xs font-bold text-white rounded-xl active:scale-95 transition-all shadow cursor-pointer"
                  >
                    Apply & Sync Keys
                  </button>
                </div>

              </div>

              {/* Instructional Guidelines card */}
              <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 flex gap-4 text-xs text-slate-400">
                <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <span className="font-bold text-slate-300">How to get your Own OpenAI API Key?</span>
                  <p className="leading-relaxed">
                    1. Create an account on <a href="https://platform.openai.com/" target="_blank" rel="noreferrer" className="text-amber-400 hover:underline inline-flex items-center gap-0.5">OpenAI Platform <ExternalLink className="w-2.5 h-2.5" /></a>.<br />
                    2. Go to the API Keys settings page, click <strong className="text-white">"Create new secret key"</strong>, copy it and paste it above.<br />
                    3. Make sure to choose <strong className="text-slate-200">"OpenAI API Key"</strong> card as your active setting so the app redirects text generation and DALL-E-3 queries directly to OpenAI!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 8. PRICING SHEET */}
          {activeTab === "pricing" && (
            <div className="space-y-8 max-w-4xl mx-auto py-4">
              {/* Pitch Header */}
              <div className="text-center">
                <span className="p-1 px-3 font-mono text-[10px] uppercase font-bold tracking-widest text-purple-400 bg-purple-400/10 border border-purple-400/20 rounded-full inline-block">
                  Launch Premium Access Offer
                </span>
                <h2 className="text-4xl font-extrabold font-display tracking-tight text-white mt-3">
                  Unleash Viral Creator Capabilities
                </h2>
                <p className="text-slate-400 mt-2 max-w-lg mx-auto text-sm leading-relaxed">
                  Join hundreds of YouTubers and active Shorts musicians bypassing creative blocks. Scale views in minutes.
                </p>
              </div>

              {/* Plans side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                
                {/* Free Plan */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between shadow-xl relative">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-display font-medium text-lg text-slate-300">Starter Free Tier</span>
                      <span className="text-[10px] font-mono tracking-wider font-bold text-slate-500 uppercase px-2 py-0.5 border border-slate-800 rounded">Active</span>
                    </div>

                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-4xl font-extrabold font-display text-white">₹0</span>
                      <span className="text-slate-400 text-sm">/ month</span>
                    </div>

                    <p className="text-xs text-slate-400 mb-6">
                      Perfect for trying out CreatorBoost tools to see core algorithm performance outputs before publishing.
                    </p>

                    <ul className="space-y-3.5 text-xs text-slate-300 font-sans border-t border-slate-800/80 pt-6">
                      <li className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>10 tool generations daily limit</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Core video concept ideas planner</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>A/B CTR Clickable Title Suite</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Detailed chapters outline descriptions</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-8 pt-4">
                    <button
                      onClick={() => {
                        handleSetPro(false);
                        alert("You are on the standard Free tier containing 10 credits limit / day.");
                      }}
                      className="w-full py-3 bg-slate-950 border border-slate-800 hover:bg-slate-850 text-slate-400 hover:text-white transition-colors duration-200 text-xs font-bold rounded-2xl cursor-pointer"
                    >
                      {isPro ? "Switch to Free Version" : "Currently Active"}
                    </button>
                  </div>
                </div>

                {/* Pro Plan */}
                <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-purple-500 rounded-3xl p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
                  
                  {/* Decorative corner tag banner */}
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-500 to-pink-500 text-white font-mono font-bold text-[9px] tracking-wider uppercase px-4 py-1.5 rounded-bl-3xl shadow">
                    Most Popular Choice
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-display font-black text-lg text-white">Unlimited Creator Pro</span>
                      {isPro && (
                        <span className="text-[9px] font-mono tracking-wider font-extrabold text-purple-400 uppercase px-2 py-0.5 bg-purple-500/15 border border-purple-500/20 rounded-full animate-bounce">
                          Active Premium
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-4xl font-extrabold font-display bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">₹299</span>
                      <span className="text-slate-400 text-sm">/ month</span>
                    </div>

                    <p className="text-xs text-slate-400 mb-6">
                      For YouTubers, musicians and multi-channel podcasters demanding heavy daily publish volumes and endless trend strategies.
                    </p>

                    <ul className="space-y-3.5 text-xs text-slate-200 font-sans border-t border-slate-800 pt-6">
                      <li className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-purple-400" />
                        <span className="font-bold">Unlimited content generations (99k+ credits/day)</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-purple-400" />
                        <span>Interactive Screenplay Script Generation beats</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-purple-400" />
                        <span>Shocking contrast Thumbnail Text layouts</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-purple-400" />
                        <span>Social Trends velocity scanner index maps</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-purple-400" />
                        <span className="p-1 px-1.5 text-[8px] bg-purple-500/20 text-purple-300 rounded font-mono uppercase">V1 Bonus</span> Priority queue API responses speed
                      </li>
                    </ul>
                  </div>

                  <div className="mt-8 pt-4">
                    <button
                      onClick={() => {
                        handleSetPro(!isPro);
                        alert(!isPro ? "Demo Upgrade Successful! You are now a premium Pro member containing unlimited generations." : "Switched back to Free trial.");
                      }}
                      className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 hover:shadow-lg hover:shadow-pink-500/10 active:scale-95 transition-all text-xs font-bold text-white rounded-2xl cursor-pointer"
                    >
                      {isPro ? "Deactivate Pro Status (Demo Mode)" : "Simulate Upgrade to Pro (₹299)"}
                    </button>
                  </div>
                </div>

              </div>

              {/* Upgrade Pitch FAQ footer info */}
              <div className="bg-slate-900/40 border border-slate-850 p-4.5 rounded-2xl flex items-start gap-3.5 text-xs text-slate-450 max-w-xl mx-auto font-sans leading-relaxed">
                <HelpCircle className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-300">How do daily credits reset?</span>
                  <p className="mt-0.5">
                    For evaluation and demonstration purposes, we built an instantaneous <span className="font-mono text-purple-400 decoration-dotted underline">Reset icon indicator</span> right inside the top Daily Generations bar to let you easily reload daily credits anytime in the preview window!
                  </p>
                </div>
              </div>
            </div>
          )}

        </main>

        {/* Right API Key Column Sidebar Panel */}
        <aside className={`shrink-0 border-t xl:border-t-0 xl:border-l border-slate-900 bg-slate-950/40 p-6 xl:p-8 space-y-6 transition-all duration-300 ${
          isRightColumnExpanded ? "w-full xl:w-88" : "w-full xl:w-16 xl:px-4 xl:py-8"
        }`}>
          {isRightColumnExpanded ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-400" />
                  <span className="text-xs uppercase font-mono font-bold tracking-wider text-slate-300">API Key Panel</span>
                </div>
                <button
                  onClick={handleToggleRightColumn}
                  className="p-1 px-2 text-[10px] font-mono text-slate-500 hover:text-slate-350 bg-slate-900 rounded border border-slate-850 hover:border-slate-800 transition-colors cursor-pointer"
                  title="Collapse Panel"
                >
                  Hide ✕
                </button>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4.5 space-y-4 shadow-lg">
                <div>
                  <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-1">Provider Mode</h3>
                  <span className="text-[11px] text-slate-500 block leading-snug">Choose an active AI provider key route</span>
                </div>

                {/* Provider Radio Selector Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={() => handleSavePreferredProvider("default")}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                      preferredProvider === "default"
                        ? "bg-purple-950/30 border-purple-500 text-purple-200"
                        : "bg-slate-950/60 border-slate-850 text-slate-450 hover:border-slate-805"
                    }`}
                  >
                    <span className="font-semibold">Standard Defaults</span>
                    <span className="text-[10px] font-mono text-slate-500">Free Tier</span>
                  </button>

                  <button
                    onClick={() => {
                      if (openaiKey) {
                        handleSavePreferredProvider("openai");
                      } else {
                        alert("Please paste your OpenAI API Key first below to activate!");
                      }
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                      preferredProvider === "openai"
                        ? "bg-amber-950/30 border-amber-500 text-amber-200"
                        : "bg-slate-950/60 border-slate-850 text-slate-450 hover:border-slate-805"
                    }`}
                  >
                    <span className="font-semibold">OpenAI API Key</span>
                    <span className={`text-[10px] font-mono font-bold uppercase rounded p-1 py-0.5 ${preferredProvider === "openai" ? "bg-amber-400/20 text-amber-300" : "bg-slate-900 text-slate-500"}`}>
                      {preferredProvider === "openai" ? "Active" : openaiKey ? "Saved" : "Not Set"}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      if (userGeminiKey) {
                        handleSavePreferredProvider("custom-gemini");
                      } else {
                        alert("Please paste your Custom Gemini API Key first below to activate!");
                      }
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                      preferredProvider === "custom-gemini"
                        ? "bg-blue-950/30 border-blue-500 text-blue-200"
                        : "bg-slate-950/60 border-slate-850 text-slate-450 hover:border-slate-805"
                    }`}
                  >
                    <span className="font-semibold">Google Gemini API</span>
                    <span className={`text-[10px] font-mono font-bold uppercase rounded p-1 py-0.5 ${preferredProvider === "custom-gemini" ? "bg-blue-400/20 text-blue-300" : "bg-slate-900 text-slate-500"}`}>
                      {preferredProvider === "custom-gemini" ? "Active" : userGeminiKey ? "Saved" : "Not Set"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Input Fields Box */}
              <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-4.5 space-y-4">
                <span className="block text-[11px] uppercase tracking-wider font-mono font-bold text-slate-400">Configure Keys</span>

                {/* OpenAI Input */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase font-mono text-slate-450 font-bold">OpenAI Key (sk-...)</label>
                    {openaiKey && (
                      <button
                        onClick={() => {
                          handleSaveOpenaiKey("");
                          if (preferredProvider === "openai") handleSavePreferredProvider("default");
                        }}
                        className="text-[9px] font-mono text-rose-500 hover:text-rose-450 cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
                    value={openaiKey}
                    onChange={(e) => {
                      const val = e.target.value.trim();
                      handleSaveOpenaiKey(val);
                      if (val && preferredProvider !== "openai") {
                        handleSavePreferredProvider("openai");
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 placeholder-slate-700 rounded-lg px-3 py-2 text-xs text-white text-left font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Gemini Input */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase font-mono text-slate-455 font-bold">Gemini Key (AIzaSy...)</label>
                    {userGeminiKey && (
                      <button
                        onClick={() => {
                          handleSaveUserGeminiKey("");
                          if (preferredProvider === "custom-gemini") handleSavePreferredProvider("default");
                        }}
                        className="text-[9px] font-mono text-rose-500 hover:text-rose-455 cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    placeholder="AIzaSyxxxxxxxxxxxxxxxxxxxxxx"
                    value={userGeminiKey}
                    onChange={(e) => {
                      const val = e.target.value.trim();
                      handleSaveUserGeminiKey(val);
                      if (val && preferredProvider !== "custom-gemini") {
                        handleSavePreferredProvider("custom-gemini");
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 placeholder-slate-700 rounded-lg px-3 py-2 text-xs text-white text-left font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Pro / Keys Benefits Matrix */}
              <div className="bg-gradient-to-br from-slate-900 to-purple-950/20 border border-purple-900/10 rounded-2xl p-4.5 space-y-3 shadow-md">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                  <span className="text-[11px] uppercase font-mono font-bold text-white tracking-wide">Benefits Unlocked</span>
                </div>
                
                <ul className="space-y-2 text-[11px] text-slate-350 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-400 mt-0.5 shrink-0" />
                    <span><strong>No Daily Limits:</strong> Daily quotas are bypassed with your key active</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-400 mt-0.5 shrink-0" />
                    <span><strong>Pro Model Integration:</strong> Powers gpt-4o-mini and DALL-E-3 image generators</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-400 mt-0.5 shrink-0" />
                    <span><strong>Direct Route Billing:</strong> Free sandboxed execution powered directly by your key balance!</span>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-start pt-4 h-full space-y-4">
              <button
                onClick={handleToggleRightColumn}
                className="p-2 bg-slate-900 border border-slate-850 hover:bg-slate-800 text-amber-400 rounded-full cursor-pointer transition-colors shadow"
                title="Expand API Provider Panel"
              >
                <Key className="w-4 h-4" />
              </button>
              <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 rotate-90 my-6 whitespace-nowrap">
                Keys Panel
              </span>
            </div>
          )}
        </aside>
      </div>
    </div>

      {/* Persistent global responsive grid background styling footer */}
      <footer className="bg-slate-950 border-t border-slate-900 px-6 py-4.5 text-center text-[11px] text-slate-500 font-mono tracking-wide">
        CreatorBoost AI · Scaled inside Cloud Run Sandbox Environment Workspace Container · Gemini Powered API
      </footer>

    </div>
  );
}

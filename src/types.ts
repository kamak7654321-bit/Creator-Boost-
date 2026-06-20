// Types for CreatorBoost AI Application

export interface SavedItem {
  id: string;
  type: "idea" | "title" | "description" | "thumbnail" | "thumbnail_prompt" | "script" | "trend";
  title: string;
  timestamp: string;
  data: any; // Contains the specific payload of the generation
}

export interface VideoIdea {
  id: string;
  title: string;
  angle: string;
  targetAudience: string;
  estimatedRetention: string;
  pacingTip: string;
}

export interface IdeaPayload {
  ideas: VideoIdea[];
  niche: string;
  topic: string;
}

export interface TitlePayload {
  topic: string;
  tone: string;
  clickable: string[];
  seo: string[];
  shorts: string[];
}

export interface DescriptionPayload {
  topic: string;
  title: string;
  corePoints: string;
  formattedDescription: string;
  tags: string[];
  hashtags: string[];
}

export interface ThumbnailSuggestion {
  text: string;
  emotiveness: string;
  bgColor: string;
  textColor: string;
  compositionTip: string;
}

export interface ThumbnailPayload {
  topic: string;
  emotion: string;
  suggestions: ThumbnailSuggestion[];
}

export interface ScriptSection {
  sceneNum: number;
  visualStyle: string;
  spokenLine: string;
  sfx: string;
  duration: string;
}

export interface ScriptPayload {
  title: string;
  format: "shorts" | "long-form";
  tone: string;
  hookVisual: string;
  hookAudio: string;
  sections: ScriptSection[];
  ctaVisual: string;
  ctaSpoken: string;
}

export interface TrendItem {
  trendTitle: string;
  velocity: string;
  explanation: string;
  targetAudienceTip: string;
  angles: string[];
}

export interface TrendPayload {
  category: string;
  platform: string;
  trends: TrendItem[];
}

export interface ThumbnailPromptConcept {
  conceptName: string;
  imagePrompt: string;
  overlayText: string;
  psychologyTrigger: string;
  layoutPlacement: string;
}

export interface ThumbnailPromptPayload {
  topic: string;
  niche: string;
  style: string;
  prompts: ThumbnailPromptConcept[];
}

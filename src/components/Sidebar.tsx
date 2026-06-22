import React from "react";
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
  Key,
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  savedCount: number;
}

export default function Sidebar({ activeTab, setActiveTab, savedCount }: SidebarProps) {
  const menuItems = [
    {
      group: "Core Launch Tools",
      items: [
        { id: "idea", label: "Video Idea Generator", icon: Lightbulb, color: "text-amber-400" },
        { id: "title", label: "Title Generator", icon: Subtitles, color: "text-blue-400" },
        { id: "description", label: "Description & SEO", icon: FileText, color: "text-emerald-400" },
      ],
    },
    {
      group: "Production Tools",
      items: [
        { id: "thumbnail", label: "Thumbnail Overlay", icon: ImageIcon, color: "text-pink-400" },
        { id: "script", label: "Script Generator", icon: FileCode, color: "text-violet-400" },
        { id: "trend", label: "Trend Explorer", icon: TrendingUp, color: "text-cyan-400" },
      ],
    },
    {
      group: "My Library & Plans",
      items: [
        { id: "saves", label: "Saved Studio", icon: Heart, count: savedCount, color: "text-pink-500" },
        { id: "pricing", label: "Pricing & Pro Status", icon: CreditCard, color: "text-purple-400" },
        { id: "api-keys", label: "API Provider Key", icon: Key, color: "text-amber-400" },
      ],
    }
  ];

  return (
    <aside className="w-full lg:w-72 bg-slate-950 border-r border-slate-800 flex flex-col p-4 shrink-0">
      {/* Sidebar Top Pitch */}
      <div className="bg-slate-900/60 p-3.5 border border-slate-800 rounded-xl mb-6">
        <h4 className="flex items-center gap-1 text-xs font-semibold uppercase font-display tracking-wide text-slate-300">
          <Target className="w-3.5 h-3.5 text-purple-400" /> Target Creator
        </h4>
        <p className="text-[11px] text-slate-400 mt-1">
          Viral growth optimized for YouTubers, Shorts creators, TikTokers, musicians & podcasters.
        </p>
      </div>

      {/* Tabs navigation */}
      <div className="space-y-6 flex-1">
        {menuItems.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1.5">
            <span className="block text-[10px] font-mono tracking-widest font-bold uppercase text-slate-500 px-3">
              {group.group}
            </span>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-sm transition-all relative group/btn ${
                        isActive
                          ? "bg-slate-900 border border-slate-800 font-medium text-white ring-1 ring-purple-500/10"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 shrink-0 transition-transform ${item.color} ${isActive ? "scale-110" : ""}`} />
                        <span>{item.label}</span>
                      </div>
                      
                      {item.count !== undefined ? (
                        <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                          isActive ? "bg-purple-600 text-white" : "bg-slate-850 text-slate-400"
                        }`}>
                          {item.count}
                        </span>
                      ) : null}

                      {/* Active Left Indicator Pill */}
                      {isActive && (
                        <div className="absolute left-0 top-1/4 w-1 h-1/2 bg-gradient-to-b from-purple-500 to-pink-500 rounded-r" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Sidebar Footer Pitch */}
      <div className="mt-8 border-t border-slate-800/60 pt-4 text-center">
        <p className="text-[11px] font-mono text-slate-500">
          CreatorBoost v1.2.0 · Live Engine
        </p>
      </div>
    </aside>
  );
}

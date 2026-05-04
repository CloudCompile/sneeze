"use client";

interface ModeToggleProps {
  mode: "simple" | "advanced";
  onModeChange: (mode: "simple" | "advanced") => void;
}

export function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-slate-700/20 rounded-lg border border-slate-600/30">
      <span className="text-sm font-medium text-slate-300">Mode:</span>
      <button
        onClick={() => onModeChange("simple")}
        className={`px-4 py-1.5 rounded text-sm font-medium transition-all ${
          mode === "simple"
            ? "bg-green-600 text-white"
            : "bg-slate-700/30 text-slate-400 hover:bg-slate-600/30"
        }`}
      >
        🎯 Simple
      </button>
      <button
        onClick={() => onModeChange("advanced")}
        className={`px-4 py-1.5 rounded text-sm font-medium transition-all ${
          mode === "advanced"
            ? "bg-purple-600 text-white"
            : "bg-slate-700/30 text-slate-400 hover:bg-slate-600/30"
        }`}
      >
        ⚙️ Advanced
      </button>
      <div className="flex-1" />
      <div className="text-xs text-slate-400">
        {mode === "simple" ? (
          <span>👋 Beginner-friendly mode with helpful guidance</span>
        ) : (
          <span>👨‍💻 Advanced mode with all features and power options</span>
        )}
      </div>
    </div>
  );
}

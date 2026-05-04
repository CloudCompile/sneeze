"use client";

import { templates } from "@/lib/botBuilder/templates";
import type { BotState } from "@/lib/botBuilder/types";

interface TemplateSelectorProps {
  onSelectTemplate: (state: BotState) => void;
}

export function TemplateSelector({ onSelectTemplate }: TemplateSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
      {templates.map((template) => (
        <button
          key={template.id}
          onClick={() => onSelectTemplate(template.state)}
          className="flex flex-col gap-3 p-4 rounded-xl bg-gradient-to-br from-slate-700/30 to-slate-800/30 border border-slate-600/30 hover:from-slate-600/40 hover:to-slate-700/40 hover:border-slate-500/50 transition-all cursor-pointer group"
        >
          <div>
            <h3 className="text-lg font-semibold text-slate-100 group-hover:text-white transition-colors">
              {template.name}
            </h3>
            <p className="text-sm text-slate-400">{template.description}</p>
          </div>
          <div className="text-xs text-slate-500">
            {template.state.commands.length} commands ·{" "}
            {template.state.events.length} events
          </div>
        </button>
      ))}
    </div>
  );
}

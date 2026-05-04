"use client";

import type { BotConfig } from "@/lib/botBuilder/types";

interface ConfigFormProps {
  config: BotConfig;
  onConfigChange: (config: BotConfig) => void;
}

const intentOptions = [
  { value: "guilds", label: "Guilds" },
  { value: "messages", label: "Messages" },
  { value: "message_content", label: "Message Content" },
  { value: "members", label: "Members" },
  { value: "reactions", label: "Reactions" },
  { value: "voice_states", label: "Voice States" },
  { value: "moderation", label: "Moderation" },
  { value: "guild_messages", label: "Guild Messages" },
];

export function ConfigForm({ config, onConfigChange }: ConfigFormProps) {
  const toggleIntent = (intent: string) => {
    const intents = config.intents.includes(intent)
      ? config.intents.filter((i) => i !== intent)
      : [...config.intents, intent];
    onConfigChange({ ...config, intents });
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-gradient-to-b from-slate-800/40 to-slate-900/40 rounded-xl backdrop-blur-sm border border-slate-700/50">
      <h2 className="text-lg font-semibold text-slate-100">Bot Configuration</h2>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-300 block mb-2">
            Bot Name
          </label>
          <input
            type="text"
            value={config.name}
            onChange={(e) =>
              onConfigChange({ ...config, name: e.target.value })
            }
            className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 transition-colors"
            placeholder="My Discord Bot"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-300 block mb-2">
            Description
          </label>
          <textarea
            value={config.description}
            onChange={(e) =>
              onConfigChange({ ...config, description: e.target.value })
            }
            className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 transition-colors"
            placeholder="A cool Discord bot"
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-slate-300 block mb-2">
              Command Prefix
            </label>
            <input
              type="text"
              value={config.prefix}
              onChange={(e) =>
                onConfigChange({ ...config, prefix: e.target.value })
              }
              maxLength={5}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded text-slate-100 focus:outline-none focus:border-cyan-400/50 transition-colors"
              placeholder="!"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-300 block mb-2">
              Status Message
            </label>
            <input
              type="text"
              value={config.status}
              onChange={(e) =>
                onConfigChange({ ...config, status: e.target.value })
              }
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 transition-colors"
              placeholder="with slash commands"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-300 block mb-3">
            Gateway Intents
          </label>
          <div className="grid grid-cols-2 gap-2">
            {intentOptions.map((intent) => (
              <label key={intent.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.intents.includes(intent.value)}
                  onChange={() => toggleIntent(intent.value)}
                  className="w-4 h-4 rounded bg-slate-700/50 border border-slate-600/30 text-cyan-500 focus:outline-none focus:border-cyan-400/50 cursor-pointer"
                />
                <span className="text-sm text-slate-300">{intent.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { BotConfig } from "@/lib/botBuilder/types";

interface AdvancedBotConfigProps {
  config: BotConfig & {
    commandSync?: "global" | "guild";
    syncGuildId?: string;
    logging?: "debug" | "info" | "warning" | "error";
    database?: "none" | "sqlite" | "postgresql" | "mongodb";
    docker?: boolean;
    includeRequirementVersions?: boolean;
    customImports?: string[];
    errorHandler?: string;
    beforeInvoke?: string;
  };
  onConfigChange: (config: any) => void;
}

const ACTIVITY_TYPES = [
  { value: "playing", label: "🎮 Playing" },
  { value: "streaming", label: "📺 Streaming" },
  { value: "listening", label: "🎵 Listening to" },
  { value: "watching", label: "👁️ Watching" },
  { value: "competing", label: "🏆 Competing in" },
];

const INTENT_OPTIONS = [
  { value: "guilds", label: "Guilds", description: "Guild create/update/delete" },
  {
    value: "guild_members",
    label: "Guild Members",
    description: "Member join/update/remove",
  },
  {
    value: "guild_moderation",
    label: "Guild Moderation",
    description: "Bans, kicks, audit logs",
  },
  {
    value: "guild_emojis_and_stickers",
    label: "Guild Emojis & Stickers",
    description: "Emoji/sticker changes",
  },
  {
    value: "guild_integrations",
    label: "Guild Integrations",
    description: "Integrations and webhooks",
  },
  {
    value: "guild_webhooks",
    label: "Guild Webhooks",
    description: "Webhook updates",
  },
  { value: "guild_invites", label: "Guild Invites", description: "Invite create/delete" },
  {
    value: "guild_voice_states",
    label: "Guild Voice States",
    description: "Voice channel activity",
  },
  {
    value: "guild_presences",
    label: "Guild Presences",
    description: "User status updates",
  },
  {
    value: "guild_messages",
    label: "Guild Messages",
    description: "Messages in servers",
  },
  {
    value: "guild_message_reactions",
    label: "Guild Message Reactions",
    description: "Reactions in servers",
  },
  {
    value: "guild_message_typing",
    label: "Guild Message Typing",
    description: "Typing indicator in servers",
  },
  {
    value: "direct_messages",
    label: "Direct Messages",
    description: "DM messages",
  },
  {
    value: "direct_message_reactions",
    label: "DM Reactions",
    description: "Reactions in DMs",
  },
  {
    value: "direct_message_typing",
    label: "DM Typing",
    description: "Typing indicator in DMs",
  },
  {
    value: "message_content",
    label: "Message Content",
    description: "Read message content (required for text commands)",
  },
  {
    value: "guild_scheduled_events",
    label: "Guild Scheduled Events",
    description: "Scheduled event updates",
  },
  {
    value: "auto_moderation_configuration",
    label: "AutoMod Configuration",
    description: "AutoMod rules",
  },
  {
    value: "auto_moderation_execution",
    label: "AutoMod Execution",
    description: "AutoMod actions",
  },
];

export function AdvancedBotConfig({
  config,
  onConfigChange,
}: AdvancedBotConfigProps) {
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({
    activity: false,
    intents: false,
    commands: false,
    database: false,
    deployment: false,
    logging: false,
    advanced: false,
  });

  const toggleSection = (section: string) => {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleIntent = (intent: string) => {
    const intents = config.intents.includes(intent)
      ? config.intents.filter((i) => i !== intent)
      : [...config.intents, intent];
    onConfigChange({ ...config, intents });
  };

  return (
    <div className="space-y-3 p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
      {/* Activity Status */}
      <div>
        <button
          onClick={() => toggleSection("activity")}
          className="flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-slate-200 w-full"
        >
          <ChevronDown
            size={14}
            className={`transition-transform ${expanded.activity ? "" : "-rotate-90"}`}
          />
          🎮 Activity Status
        </button>
        {expanded.activity && (
          <div className="mt-2 space-y-2 ml-4">
            <div>
              <label className="text-xs text-slate-400">Activity Type</label>
              <select
                value={config.status || ""}
                onChange={(e) => onConfigChange({ ...config, status: e.target.value })}
                className="w-full px-2 py-1 bg-slate-700/50 border border-slate-600/30 rounded text-xs text-slate-100 focus:outline-none focus:border-cyan-400/50"
              >
                {ACTIVITY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <input
              type="text"
              placeholder="Activity text (e.g., 'your commands', 'music')"
              value={config.status || ""}
              onChange={(e) => onConfigChange({ ...config, status: e.target.value })}
              className="w-full px-2 py-1 bg-slate-700/50 border border-slate-600/30 rounded text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400/50"
            />
          </div>
        )}
      </div>

      {/* Intents */}
      <div>
        <button
          onClick={() => toggleSection("intents")}
          className="flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-slate-200 w-full"
        >
          <ChevronDown
            size={14}
            className={`transition-transform ${expanded.intents ? "" : "-rotate-90"}`}
          />
          📡 Gateway Intents ({config.intents.length})
        </button>
        {expanded.intents && (
          <div className="mt-2 space-y-2 ml-4">
            <p className="text-xs text-slate-400 mb-2">
              Select intents your bot needs (each has a cost)
            </p>
            <div className="grid grid-cols-2 gap-2">
              {INTENT_OPTIONS.map((intent) => (
                <label
                  key={intent.value}
                  className="flex items-start gap-2 cursor-pointer p-2 rounded bg-slate-700/20 hover:bg-slate-600/20"
                >
                  <input
                    type="checkbox"
                    checked={config.intents.includes(intent.value)}
                    onChange={() => toggleIntent(intent.value)}
                    className="w-3 h-3 mt-0.5"
                  />
                  <div>
                    <div className="text-xs font-medium text-slate-200">
                      {intent.label}
                    </div>
                    <div className="text-xs text-slate-500">{intent.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Command Sync */}
      <div>
        <button
          onClick={() => toggleSection("commands")}
          className="flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-slate-200 w-full"
        >
          <ChevronDown
            size={14}
            className={`transition-transform ${expanded.commands ? "" : "-rotate-90"}`}
          />
          ⚡ Command Sync Settings
        </button>
        {expanded.commands && (
          <div className="mt-2 space-y-2 ml-4">
            <div>
              <label className="text-xs text-slate-400">Command Registration</label>
              <select
                value={config.commandSync || "global"}
                onChange={(e) =>
                  onConfigChange({
                    ...config,
                    commandSync: e.target.value as "global" | "guild",
                  })
                }
                className="w-full px-2 py-1 bg-slate-700/50 border border-slate-600/30 rounded text-xs text-slate-100 focus:outline-none focus:border-cyan-400/50"
              >
                <option value="global">🌍 Global (production - takes 1 hour to sync)</option>
                <option value="guild">🏠 Guild Only (testing - instant sync)</option>
              </select>
            </div>
            {config.commandSync === "guild" && (
              <input
                type="text"
                placeholder="Guild ID for testing"
                value={config.syncGuildId || ""}
                onChange={(e) =>
                  onConfigChange({ ...config, syncGuildId: e.target.value })
                }
                className="w-full px-2 py-1 bg-slate-700/50 border border-slate-600/30 rounded text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400/50"
              />
            )}
          </div>
        )}
      </div>

      {/* Database */}
      <div>
        <button
          onClick={() => toggleSection("database")}
          className="flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-slate-200 w-full"
        >
          <ChevronDown
            size={14}
            className={`transition-transform ${expanded.database ? "" : "-rotate-90"}`}
          />
          💾 Database Setup
        </button>
        {expanded.database && (
          <div className="mt-2 space-y-2 ml-4">
            <select
              value={config.database || "none"}
              onChange={(e) =>
                onConfigChange({
                  ...config,
                  database: e.target.value as any,
                })
              }
              className="w-full px-2 py-1 bg-slate-700/50 border border-slate-600/30 rounded text-xs text-slate-100 focus:outline-none focus:border-cyan-400/50"
            >
              <option value="none">❌ No Database</option>
              <option value="sqlite">📊 SQLite (local file)</option>
              <option value="postgresql">🐘 PostgreSQL (production)</option>
              <option value="mongodb">🍃 MongoDB (document-based)</option>
            </select>
            {config.database !== "none" && (
              <p className="text-xs text-slate-400">
                Database setup code will be included in export
              </p>
            )}
          </div>
        )}
      </div>

      {/* Deployment */}
      <div>
        <button
          onClick={() => toggleSection("deployment")}
          className="flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-slate-200 w-full"
        >
          <ChevronDown
            size={14}
            className={`transition-transform ${
              expanded.deployment ? "" : "-rotate-90"
            }`}
          />
          🚀 Deployment Options
        </button>
        {expanded.deployment && (
          <div className="mt-2 space-y-2 ml-4">
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={config.docker || false}
                onChange={(e) => onConfigChange({ ...config, docker: e.target.checked })}
                className="w-3 h-3"
              />
              <span className="text-slate-300">Include Docker files (Dockerfile + docker-compose)</span>
            </label>
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={config.includeRequirementVersions || false}
                onChange={(e) =>
                  onConfigChange({
                    ...config,
                    includeRequirementVersions: e.target.checked,
                  })
                }
                className="w-3 h-3"
              />
              <span className="text-slate-300">Pin Python package versions (for reproducibility)</span>
            </label>
          </div>
        )}
      </div>

      {/* Logging */}
      <div>
        <button
          onClick={() => toggleSection("logging")}
          className="flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-slate-200 w-full"
        >
          <ChevronDown
            size={14}
            className={`transition-transform ${expanded.logging ? "" : "-rotate-90"}`}
          />
          📝 Logging & Debugging
        </button>
        {expanded.logging && (
          <div className="mt-2 space-y-2 ml-4">
            <select
              value={config.logging || "info"}
              onChange={(e) =>
                onConfigChange({
                  ...config,
                  logging: e.target.value as any,
                })
              }
              className="w-full px-2 py-1 bg-slate-700/50 border border-slate-600/30 rounded text-xs text-slate-100 focus:outline-none focus:border-cyan-400/50"
            >
              <option value="debug">🐛 Debug (verbose)</option>
              <option value="info">ℹ️ Info (normal)</option>
              <option value="warning">⚠️ Warning (important only)</option>
              <option value="error">🔴 Error (errors only)</option>
            </select>
          </div>
        )}
      </div>

      {/* Advanced Code Customization */}
      <div>
        <button
          onClick={() => toggleSection("advanced")}
          className="flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-slate-200 w-full"
        >
          <ChevronDown
            size={14}
            className={`transition-transform ${expanded.advanced ? "" : "-rotate-90"}`}
          />
          ⚙️ Advanced Code Customization
        </button>
        {expanded.advanced && (
          <div className="mt-2 space-y-2 ml-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">
                Custom Imports (one per line)
              </label>
              <textarea
                placeholder="from mymodule import something&#10;import requests"
                value={(config.customImports || []).join("\n")}
                onChange={(e) =>
                  onConfigChange({
                    ...config,
                    customImports: e.target.value.split("\n").filter(Boolean),
                  })
                }
                className="w-full px-2 py-1 bg-slate-700/50 border border-slate-600/30 rounded text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400/50"
                rows={2}
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">
                Error Handler Code
              </label>
              <textarea
                placeholder="@bot.event&#10;async def on_command_error(ctx, error)&#10;    await ctx.send(f'Error: {error}')"
                value={config.errorHandler || ""}
                onChange={(e) =>
                  onConfigChange({ ...config, errorHandler: e.target.value })
                }
                className="w-full px-2 py-1 bg-slate-700/50 border border-slate-600/30 rounded text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 font-mono"
                rows={3}
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">
                Before Invoke Hook (runs before every command)
              </label>
              <textarea
                placeholder="async def before_invoke(ctx)&#10;    print(f'Command called: {ctx.command.name}')"
                value={config.beforeInvoke || ""}
                onChange={(e) =>
                  onConfigChange({ ...config, beforeInvoke: e.target.value })
                }
                className="w-full px-2 py-1 bg-slate-700/50 border border-slate-600/30 rounded text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 font-mono"
                rows={3}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import type { Command, CommandParam } from "@/lib/botBuilder/types";
import { HelpIcon, HELP_TEXT } from "./Tooltip";
import { EmbedBuilder } from "./EmbedBuilder";

interface CommandBuilderProps {
  commands: Command[];
  onAddCommand: (command: Command) => void;
  onUpdateCommand: (id: string, command: Command) => void;
  onDeleteCommand: (id: string) => void;
  mode: "simple" | "advanced";
}

export function CommandBuilder({
  commands,
  onAddCommand,
  onUpdateCommand,
  onDeleteCommand,
  mode,
}: CommandBuilderProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [showEmbedBuilder, setShowEmbedBuilder] = useState(false);
  const [formData, setFormData] = useState<Partial<Command & { cooldown?: number; permissions?: string; embedData?: any }>>({
    name: "",
    description: "",
    type: "slash",
    params: [],
    response: { type: "text", content: "" },
    cooldown: 0,
    permissions: "everyone",
  });

  const handleAddClick = () => {
    setIsAdding(true);
    setSelectedId(null);
    setFormData({
      name: "",
      description: "",
      type: mode === "simple" ? "slash" : "slash",
      params: [],
      response: { type: "text", content: "" },
      cooldown: 0,
      permissions: "everyone",
    });
  };

  const handleSelectCommand = (cmd: Command) => {
    setIsAdding(false);
    setSelectedId(cmd.id);
    setFormData(cmd);
  };

  const handleSave = () => {
    if (!formData.name || !formData.description) {
      alert("Command name and description are required");
      return;
    }

    // Simple validation
    if (!/^[a-z0-9_]{1,32}$/.test(formData.name)) {
      alert("Command name must be lowercase alphanumeric (a-z, 0-9, _) and 1-32 characters");
      return;
    }

    const command: Command = {
      id: formData.id || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      type: formData.type as "slash" | "text" | "component",
      params: formData.params || [],
      response: formData.response || { type: "text", content: "" },
    };

    if (isAdding) {
      onAddCommand(command);
    } else if (selectedId) {
      onUpdateCommand(selectedId, command);
    }

    setIsAdding(false);
    setSelectedId(null);
    setShowEmbedBuilder(false);
  };

  const handleAddParam = () => {
    const newParam: CommandParam = {
      id: Date.now().toString(),
      name: "param_name",
      type: "string",
      required: true,
    };
    setFormData({
      ...formData,
      params: [...(formData.params || []), newParam],
    });
  };

  const handleRemoveParam = (paramId: string) => {
    setFormData({
      ...formData,
      params: (formData.params || []).filter((p) => p.id !== paramId),
    });
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-gradient-to-b from-slate-800/40 to-slate-900/40 rounded-xl backdrop-blur-sm border border-slate-700/50">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-100">Commands</h2>
        <span className="text-xs text-slate-400">{commands.length} commands</span>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {commands.map((cmd) => (
          <div
            key={cmd.id}
            onClick={() => handleSelectCommand(cmd)}
            className={`p-3 rounded-lg cursor-pointer transition-all ${
              selectedId === cmd.id
                ? "bg-indigo-500/30 border border-indigo-400/50"
                : "bg-slate-700/20 border border-slate-600/30 hover:bg-slate-600/30"
            }`}
          >
            <div className="text-sm font-medium text-slate-100">
              {cmd.type === "slash" ? "/" : "!"}
              {cmd.name}
              {cmd.params?.length ? (
                <span className="text-xs text-slate-400 ml-2">
                  [{cmd.params.length} param{cmd.params.length !== 1 ? "s" : ""}]
                </span>
              ) : null}
            </div>
            <div className="text-xs text-slate-400">{cmd.description}</div>
          </div>
        ))}
      </div>

      {commands.length === 0 && !isAdding && (
        <p className="text-xs text-slate-500 text-center py-4">
          Start by adding your first command!
        </p>
      )}

      {(isAdding || selectedId) && (
        <div className="space-y-4 p-4 bg-slate-800/50 rounded-lg border border-slate-600/30">
          {/* Command Name and Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Command Name <HelpIcon text={HELP_TEXT.commandName} />
              </label>
              <input
                type="text"
                placeholder="ping"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value.toLowerCase().replace(/\s+/g, "_") })
                }
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-400/50"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Type <HelpIcon text="How users will trigger this command" />
              </label>
              <select
                value={formData.type || "slash"}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as any })
                }
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded text-sm text-slate-100 focus:outline-none focus:border-indigo-400/50"
              >
                <option value="slash">⚡ Slash Command (/)</option>
                <option value="text">💬 Text Command (!)</option>
                {mode === "advanced" && (
                  <option value="component">🎛️ Component (Button/Menu)</option>
                )}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Description <HelpIcon text={HELP_TEXT.commandDescription} />
            </label>
            <textarea
              placeholder="What this command does..."
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              maxLength={100}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-400/50"
              rows={2}
            />
            <div className="text-xs text-slate-500 mt-1">
              {100 - (formData.description?.length || 0)} characters remaining
            </div>
          </div>

          {/* Parameters */}
          {mode !== "simple" || (formData.params?.length || 0) > 0 ? (
            <div className="space-y-2 p-3 bg-slate-700/20 rounded border border-slate-700/30">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-300">
                  Parameters <HelpIcon text={HELP_TEXT.parameters} />
                </label>
                <button
                  onClick={handleAddParam}
                  className="text-xs px-2 py-1 bg-indigo-600/30 hover:bg-indigo-500/40 text-indigo-300 rounded border border-indigo-400/30 transition-colors"
                >
                  + Add Parameter
                </button>
              </div>

              {(formData.params || []).map((param) => (
                <div key={param.id} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="username"
                    value={param.name}
                    onChange={(e) => {
                      const updated = (formData.params || []).map((p) =>
                        p.id === param.id
                          ? { ...p, name: e.target.value.toLowerCase() }
                          : p
                      );
                      setFormData({ ...formData, params: updated });
                    }}
                    className="flex-1 px-2 py-1 bg-slate-700/50 border border-slate-600/30 rounded text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-400/50"
                  />
                  <select
                    value={param.type}
                    onChange={(e) => {
                      const updated = (formData.params || []).map((p) =>
                        p.id === param.id
                          ? { ...p, type: e.target.value as any }
                          : p
                      );
                      setFormData({ ...formData, params: updated });
                    }}
                    className="px-2 py-1 bg-slate-700/50 border border-slate-600/30 rounded text-xs text-slate-100 focus:outline-none focus:border-indigo-400/50"
                  >
                    <option value="string">Text</option>
                    <option value="integer">Number</option>
                    <option value="boolean">Yes/No</option>
                    <option value="user">User</option>
                    <option value="role">Role</option>
                    <option value="channel">Channel</option>
                  </select>
                  <button
                    onClick={() => handleRemoveParam(param.id)}
                    className="px-2 py-1 bg-red-600/20 hover:bg-red-500/30 text-red-300 rounded text-xs border border-red-400/20 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          {/* Response Builder */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">
              Response Type <HelpIcon text="How the bot will respond" />
            </label>
            <select
              value={formData.response?.type || "text"}
              onChange={(e) => {
                const type = e.target.value;
                setFormData({
                  ...formData,
                  response: {
                    ...formData.response!,
                    type: type as any,
                  },
                });
                if (type === "embed") {
                  setShowEmbedBuilder(true);
                }
              }}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded text-sm text-slate-100 focus:outline-none focus:border-indigo-400/50"
            >
              <option value="text">📝 Plain Text</option>
              <option value="embed">🎨 Rich Embed (Formatted Card)</option>
              <option value="image">🖼️ Image</option>
            </select>
          </div>

          {/* Response Content */}
          {formData.response?.type === "embed" && showEmbedBuilder ? (
            <EmbedBuilder
              embed={formData.embedData || {}}
              onEmbedChange={(embed) =>
                setFormData({
                  ...formData,
                  embedData: embed,
                  response: {
                    ...formData.response!,
                    content: JSON.stringify(embed),
                  },
                })
              }
            />
          ) : (
            <textarea
              placeholder={
                formData.response?.type === "image"
                  ? "Image URL (https://...)"
                  : "Your bot's response message..."
              }
              value={formData.response?.content || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  response: { ...formData.response!, content: e.target.value },
                })
              }
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-400/50"
              rows={3}
            />
          )}

          {/* Advanced Options */}
          {mode === "advanced" && (
            <div className="p-3 bg-slate-700/20 rounded border border-slate-700/30 space-y-2">
              <div className="text-xs font-medium text-slate-300">⚙️ Advanced Options</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400">Cooldown (seconds)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.cooldown || 0}
                    onChange={(e) =>
                      setFormData({ ...formData, cooldown: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-2 py-1 bg-slate-700/50 border border-slate-600/30 rounded text-xs text-slate-100 focus:outline-none focus:border-indigo-400/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Who can use?</label>
                  <select
                    value={formData.permissions || "everyone"}
                    onChange={(e) =>
                      setFormData({ ...formData, permissions: e.target.value })
                    }
                    className="w-full px-2 py-1 bg-slate-700/50 border border-slate-600/30 rounded text-xs text-slate-100 focus:outline-none focus:border-indigo-400/50"
                  >
                    <option value="everyone">Everyone</option>
                    <option value="admin">Admins Only</option>
                    <option value="owner">Bot Owner Only</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2 border-t border-slate-700/30">
            <button
              onClick={handleSave}
              className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-sm font-medium transition-colors"
            >
              {isAdding ? "✅ Create Command" : "💾 Update Command"}
            </button>
            {selectedId && (
              <button
                onClick={() => {
                  onDeleteCommand(selectedId);
                  setSelectedId(null);
                }}
                className="flex-1 px-3 py-2 bg-red-600/20 hover:bg-red-500/30 text-red-300 rounded text-sm font-medium border border-red-400/20 transition-colors"
              >
                🗑️ Delete
              </button>
            )}
            <button
              onClick={() => {
                setIsAdding(false);
                setSelectedId(null);
                setShowEmbedBuilder(false);
              }}
              className="flex-1 px-3 py-2 bg-slate-700/30 hover:bg-slate-600/30 text-slate-300 rounded text-sm font-medium transition-colors"
            >
              ✕ Cancel
            </button>
          </div>
        </div>
      )}

      {!isAdding && !selectedId && (
        <button
          onClick={handleAddClick}
          className="w-full px-3 py-2 bg-indigo-600/20 hover:bg-indigo-500/30 text-indigo-300 rounded border border-indigo-400/30 text-sm font-medium transition-colors"
        >
          + Add Command
        </button>
      )}
    </div>
  );
}

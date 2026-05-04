"use client";

import { useState } from "react";
import { ChevronDown, Plus, Trash2 } from "lucide-react";

interface AutocompleteOption {
  id: string;
  name: string;
  value: string;
}

interface ParameterWithConstraints {
  id: string;
  name: string;
  type:
    | "string"
    | "integer"
    | "boolean"
    | "user"
    | "role"
    | "channel"
    | "number";
  required: boolean;
  description?: string;
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  choices?: AutocompleteOption[];
  autocomplete?: boolean;
}

interface AdvancedCommandOptionsProps {
  command: any;
  onUpdate: (command: any) => void;
}

export function AdvancedCommandOptions({
  command,
  onUpdate,
}: AdvancedCommandOptionsProps) {
  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>({
    aliases: false,
    subcommands: false,
    parameters: false,
    permissions: false,
    ratelimit: false,
    interactions: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const addAlias = () => {
    onUpdate({
      ...command,
      aliases: [...(command.aliases || []), ""],
    });
  };

  const addSubcommand = () => {
    onUpdate({
      ...command,
      subcommands: [
        ...(command.subcommands || []),
        { id: Date.now().toString(), name: "", description: "", params: [] },
      ],
    });
  };

  const addParameterChoice = (paramIndex: number) => {
    const params = [...(command.params || [])];
    if (!params[paramIndex].choices) params[paramIndex].choices = [];
    params[paramIndex].choices?.push({
      id: Date.now().toString(),
      name: "Option",
      value: "option",
    });
    onUpdate({ ...command, params });
  };

  return (
    <div className="space-y-3 p-3 bg-slate-700/20 rounded-lg border border-slate-700/30">
      {/* Aliases */}
      <div>
        <button
          onClick={() => toggleSection("aliases")}
          className="flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-slate-200 w-full"
        >
          <ChevronDown
            size={14}
            className={`transition-transform ${
              expandedSections.aliases ? "" : "-rotate-90"
            }`}
          />
          📝 Command Aliases
        </button>
        {expandedSections.aliases && (
          <div className="mt-2 space-y-2 ml-4">
            {(command.aliases || []).map((alias: string, i: number) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Alias (e.g., 'msg')"
                  value={alias}
                  onChange={(e) => {
                    const aliases = [...(command.aliases || [])];
                    aliases[i] = e.target.value;
                    onUpdate({ ...command, aliases });
                  }}
                  className="flex-1 px-2 py-1 bg-slate-700/50 border border-slate-600/30 rounded text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400/50"
                />
                <button
                  onClick={() => {
                    const aliases = (command.aliases || []).filter(
                      (_: string, idx: number) => idx !== i
                    );
                    onUpdate({ ...command, aliases });
                  }}
                  className="px-2 py-1 text-red-400 hover:text-red-300"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button
              onClick={addAlias}
              className="text-xs px-2 py-1 bg-cyan-600/20 text-cyan-300 rounded border border-cyan-400/30 hover:bg-cyan-500/30"
            >
              + Add Alias
            </button>
          </div>
        )}
      </div>

      {/* Subcommands */}
      <div>
        <button
          onClick={() => toggleSection("subcommands")}
          className="flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-slate-200 w-full"
        >
          <ChevronDown
            size={14}
            className={`transition-transform ${
              expandedSections.subcommands ? "" : "-rotate-90"
            }`}
          />
          🔀 Subcommands
        </button>
        {expandedSections.subcommands && (
          <div className="mt-2 space-y-2 ml-4">
            {(command.subcommands || []).map(
              (sub: any, i: number) => (
                <div key={sub.id} className="p-2 bg-slate-800/50 rounded">
                  <input
                    type="text"
                    placeholder="Subcommand name"
                    value={sub.name}
                    onChange={(e) => {
                      const subcommands = [...(command.subcommands || [])];
                      subcommands[i].name = e.target.value;
                      onUpdate({ ...command, subcommands });
                    }}
                    className="w-full px-2 py-1 bg-slate-700/50 border border-slate-600/30 rounded text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 mb-1"
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={sub.description}
                    onChange={(e) => {
                      const subcommands = [...(command.subcommands || [])];
                      subcommands[i].description = e.target.value;
                      onUpdate({ ...command, subcommands });
                    }}
                    className="w-full px-2 py-1 bg-slate-700/50 border border-slate-600/30 rounded text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400/50"
                  />
                </div>
              )
            )}
            <button
              onClick={addSubcommand}
              className="text-xs px-2 py-1 bg-cyan-600/20 text-cyan-300 rounded border border-cyan-400/30 hover:bg-cyan-500/30"
            >
              + Add Subcommand
            </button>
          </div>
        )}
      </div>

      {/* Permissions & Rate Limiting */}
      <div>
        <button
          onClick={() => toggleSection("permissions")}
          className="flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-slate-200 w-full"
        >
          <ChevronDown
            size={14}
            className={`transition-transform ${
              expandedSections.permissions ? "" : "-rotate-90"
            }`}
          />
          🔐 Permissions & Restrictions
        </button>
        {expandedSections.permissions && (
          <div className="mt-2 space-y-2 ml-4">
            <div>
              <label className="text-xs text-slate-400">User Permissions Required</label>
              <select
                multiple
                value={command.userPermissions || []}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, (o) =>
                    o.value
                  );
                  onUpdate({ ...command, userPermissions: selected });
                }}
                className="w-full px-2 py-1 bg-slate-700/50 border border-slate-600/30 rounded text-xs text-slate-100 focus:outline-none focus:border-cyan-400/50"
              >
                <option value="send_messages">Send Messages</option>
                <option value="manage_messages">Manage Messages</option>
                <option value="manage_roles">Manage Roles</option>
                <option value="manage_channels">Manage Channels</option>
                <option value="administrator">Administrator</option>
                <option value="ban_members">Ban Members</option>
                <option value="kick_members">Kick Members</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400">Bot Permissions Needed</label>
              <select
                multiple
                value={command.botPermissions || []}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, (o) =>
                    o.value
                  );
                  onUpdate({ ...command, botPermissions: selected });
                }}
                className="w-full px-2 py-1 bg-slate-700/50 border border-slate-600/30 rounded text-xs text-slate-100 focus:outline-none focus:border-cyan-400/50"
              >
                <option value="send_messages">Send Messages</option>
                <option value="embed_links">Embed Links</option>
                <option value="manage_messages">Manage Messages</option>
                <option value="manage_roles">Manage Roles</option>
                <option value="ban_members">Ban Members</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-400">NSFW Only</label>
                <input
                  type="checkbox"
                  checked={command.nsfw || false}
                  onChange={(e) =>
                    onUpdate({ ...command, nsfw: e.target.checked })
                  }
                  className="w-4 h-4"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Ephemeral Response</label>
                <input
                  type="checkbox"
                  checked={command.ephemeral || false}
                  onChange={(e) =>
                    onUpdate({ ...command, ephemeral: e.target.checked })
                  }
                  className="w-4 h-4"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rate Limiting */}
      <div>
        <button
          onClick={() => toggleSection("ratelimit")}
          className="flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-slate-200 w-full"
        >
          <ChevronDown
            size={14}
            className={`transition-transform ${
              expandedSections.ratelimit ? "" : "-rotate-90"
            }`}
          />
          ⏱️ Rate Limiting
        </button>
        {expandedSections.ratelimit && (
          <div className="mt-2 space-y-2 ml-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-400">Cooldown (sec)</label>
                <input
                  type="number"
                  min="0"
                  value={command.cooldown || 0}
                  onChange={(e) =>
                    onUpdate({ ...command, cooldown: parseInt(e.target.value) })
                  }
                  className="w-full px-2 py-1 bg-slate-700/50 border border-slate-600/30 rounded text-xs text-slate-100 focus:outline-none focus:border-cyan-400/50"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Max Uses</label>
                <input
                  type="number"
                  min="0"
                  value={command.maxUses || 0}
                  onChange={(e) =>
                    onUpdate({ ...command, maxUses: parseInt(e.target.value) })
                  }
                  className="w-full px-2 py-1 bg-slate-700/50 border border-slate-600/30 rounded text-xs text-slate-100 focus:outline-none focus:border-cyan-400/50"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Parameter Advanced Options */}
      <div>
        <button
          onClick={() => toggleSection("parameters")}
          className="flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-slate-200 w-full"
        >
          <ChevronDown
            size={14}
            className={`transition-transform ${
              expandedSections.parameters ? "" : "-rotate-90"
            }`}
          />
          🎛️ Parameter Details
        </button>
        {expandedSections.parameters && (
          <div className="mt-2 space-y-2 ml-4">
            {(command.params || []).map((param: any, i: number) => (
              <div key={param.id} className="p-2 bg-slate-800/50 rounded space-y-2">
                <div className="text-xs font-medium text-slate-300">
                  {param.name}
                </div>

                {param.type === "string" && (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min length"
                      min="0"
                      value={param.minLength || ""}
                      onChange={(e) => {
                        const params = [...(command.params || [])];
                        params[i].minLength = parseInt(e.target.value);
                        onUpdate({ ...command, params });
                      }}
                      className="px-2 py-1 bg-slate-700/50 border border-slate-600/30 rounded text-xs text-slate-100 focus:outline-none focus:border-cyan-400/50"
                    />
                    <input
                      type="number"
                      placeholder="Max length"
                      min="0"
                      max="100"
                      value={param.maxLength || ""}
                      onChange={(e) => {
                        const params = [...(command.params || [])];
                        params[i].maxLength = parseInt(e.target.value);
                        onUpdate({ ...command, params });
                      }}
                      className="px-2 py-1 bg-slate-700/50 border border-slate-600/30 rounded text-xs text-slate-100 focus:outline-none focus:border-cyan-400/50"
                    />
                  </div>
                )}

                {(param.type === "integer" || param.type === "number") && (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min value"
                      value={param.minValue || ""}
                      onChange={(e) => {
                        const params = [...(command.params || [])];
                        params[i].minValue = parseInt(e.target.value);
                        onUpdate({ ...command, params });
                      }}
                      className="px-2 py-1 bg-slate-700/50 border border-slate-600/30 rounded text-xs text-slate-100 focus:outline-none focus:border-cyan-400/50"
                    />
                    <input
                      type="number"
                      placeholder="Max value"
                      value={param.maxValue || ""}
                      onChange={(e) => {
                        const params = [...(command.params || [])];
                        params[i].maxValue = parseInt(e.target.value);
                        onUpdate({ ...command, params });
                      }}
                      className="px-2 py-1 bg-slate-700/50 border border-slate-600/30 rounded text-xs text-slate-100 focus:outline-none focus:border-cyan-400/50"
                    />
                  </div>
                )}

                {/* Autocomplete / Choices */}
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={param.autocomplete || false}
                    onChange={(e) => {
                      const params = [...(command.params || [])];
                      params[i].autocomplete = e.target.checked;
                      if (e.target.checked && !params[i].choices) {
                        params[i].choices = [];
                      }
                      onUpdate({ ...command, params });
                    }}
                    className="w-3 h-3"
                  />
                  <span className="text-slate-400">Add predefined choices</span>
                </label>

                {param.autocomplete && param.choices && (
                  <div className="space-y-1">
                    {param.choices.map((choice: any, cIdx: number) => (
                      <div key={choice.id} className="flex gap-1">
                        <input
                          type="text"
                          placeholder="Display name"
                          value={choice.name}
                          onChange={(e) => {
                            const params = [...(command.params || [])];
                            params[i].choices[cIdx].name = e.target.value;
                            onUpdate({ ...command, params });
                          }}
                          className="flex-1 px-1 py-0.5 bg-slate-700/50 border border-slate-600/30 rounded text-xs text-slate-100 focus:outline-none focus:border-cyan-400/50"
                        />
                        <button
                          onClick={() => {
                            const params = [...(command.params || [])];
                            params[i].choices = params[i].choices.filter(
                              (_: any, idx: number) => idx !== cIdx
                            );
                            onUpdate({ ...command, params });
                          }}
                          className="text-red-400 hover:text-red-300 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addParameterChoice(i)}
                      className="text-xs px-1 py-0.5 bg-cyan-600/20 text-cyan-300 rounded"
                    >
                      + Choice
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

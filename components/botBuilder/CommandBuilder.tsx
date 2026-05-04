"use client";

import { useState } from "react";
import type { Command, CommandParam } from "@/lib/botBuilder/types";

interface CommandBuilderProps {
  commands: Command[];
  onAddCommand: (command: Command) => void;
  onUpdateCommand: (id: string, command: Command) => void;
  onDeleteCommand: (id: string) => void;
}

export function CommandBuilder({
  commands,
  onAddCommand,
  onUpdateCommand,
  onDeleteCommand,
}: CommandBuilderProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Command>>({
    name: "",
    description: "",
    type: "slash",
    params: [],
    response: { type: "text", content: "" },
  });

  const handleAddClick = () => {
    setIsAdding(true);
    setSelectedId(null);
    setFormData({
      name: "",
      description: "",
      type: "slash",
      params: [],
      response: { type: "text", content: "" },
    });
  };

  const handleSelectCommand = (cmd: Command) => {
    setIsAdding(false);
    setSelectedId(cmd.id);
    setFormData(cmd);
  };

  const handleSave = () => {
    if (
      !formData.name ||
      !formData.description ||
      !formData.type ||
      !formData.response
    ) {
      alert("Please fill in all fields");
      return;
    }

    const command: Command = {
      id: formData.id || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      type: formData.type as "slash" | "text" | "component",
      params: formData.params || [],
      response: formData.response,
    };

    if (isAdding) {
      onAddCommand(command);
    } else if (selectedId) {
      onUpdateCommand(selectedId, command);
    }

    setIsAdding(false);
    setSelectedId(null);
  };

  const handleAddParam = () => {
    const newParam: CommandParam = {
      id: Date.now().toString(),
      name: "param_name",
      type: "string",
      required: false,
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
      <h2 className="text-lg font-semibold text-slate-100">Commands</h2>

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
            </div>
            <div className="text-xs text-slate-400">{cmd.description}</div>
          </div>
        ))}
      </div>

      {commands.length === 0 && !isAdding && (
        <p className="text-xs text-slate-500 text-center py-4">
          No commands yet
        </p>
      )}

      {(isAdding || selectedId) && (
        <div className="space-y-3 p-3 bg-slate-800/50 rounded-lg border border-slate-600/30">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Command name"
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-400/50"
            />
            <select
              value={formData.type || "slash"}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as any })
              }
              className="px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded text-sm text-slate-100 focus:outline-none focus:border-indigo-400/50"
            >
              <option value="slash">Slash Command</option>
              <option value="text">Text Command</option>
              <option value="component">Component</option>
            </select>
          </div>

          <textarea
            placeholder="Description"
            value={formData.description || ""}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-400/50"
            rows={2}
          />

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">
              Response Type
            </label>
            <select
              value={formData.response?.type || "text"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  response: {
                    ...formData.response!,
                    type: e.target.value as any,
                  },
                })
              }
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded text-sm text-slate-100 focus:outline-none focus:border-indigo-400/50"
            >
              <option value="text">Text</option>
              <option value="embed">Embed</option>
              <option value="image">Image</option>
            </select>
          </div>

          <textarea
            placeholder="Response content"
            value={formData.response?.content || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                response: { ...formData.response!, content: e.target.value },
              })
            }
            className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-400/50"
            rows={2}
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-300">
                Parameters
              </label>
              <button
                onClick={handleAddParam}
                className="text-xs px-2 py-1 bg-indigo-600/30 hover:bg-indigo-500/40 text-indigo-300 rounded border border-indigo-400/30 transition-colors"
              >
                Add
              </button>
            </div>

            {(formData.params || []).map((param) => (
              <div key={param.id} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Param name"
                  value={param.name}
                  onChange={(e) => {
                    const updated = (formData.params || []).map((p) =>
                      p.id === param.id ? { ...p, name: e.target.value } : p
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
                  <option value="string">String</option>
                  <option value="integer">Integer</option>
                  <option value="boolean">Boolean</option>
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

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-sm font-medium transition-colors"
            >
              {isAdding ? "Add" : "Update"}
            </button>
            {selectedId && (
              <button
                onClick={() => {
                  onDeleteCommand(selectedId);
                  setSelectedId(null);
                }}
                className="flex-1 px-3 py-2 bg-red-600/20 hover:bg-red-500/30 text-red-300 rounded text-sm font-medium border border-red-400/20 transition-colors"
              >
                Delete
              </button>
            )}
            <button
              onClick={() => {
                setIsAdding(false);
                setSelectedId(null);
              }}
              className="flex-1 px-3 py-2 bg-slate-700/30 hover:bg-slate-600/30 text-slate-300 rounded text-sm font-medium transition-colors"
            >
              Cancel
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

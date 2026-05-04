"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

interface InteractionBuilderProps {
  interactions: any[];
  onAddInteraction: (interaction: any) => void;
  onUpdateInteraction: (id: string, interaction: any) => void;
  onDeleteInteraction: (id: string) => void;
}

export function InteractionBuilder({
  interactions,
  onAddInteraction,
  onUpdateInteraction,
  onDeleteInteraction,
}: InteractionBuilderProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<any>({
    type: "button",
    label: "",
    customId: "",
    description: "",
  });

  const handleAddClick = () => {
    setIsAdding(true);
    setSelectedId(null);
    setFormData({
      type: "button",
      label: "",
      customId: "",
      description: "",
    });
  };

  const handleSave = () => {
    if (!formData.label || !formData.customId) {
      alert("Label and ID are required");
      return;
    }

    const interaction = {
      id: formData.id || Date.now().toString(),
      ...formData,
    };

    if (isAdding) {
      onAddInteraction(interaction);
    } else if (selectedId) {
      onUpdateInteraction(selectedId, interaction);
    }

    setIsAdding(false);
    setSelectedId(null);
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-gradient-to-b from-slate-800/40 to-slate-900/40 rounded-xl backdrop-blur-sm border border-slate-700/50">
      <h2 className="text-lg font-semibold text-slate-100">
        Interactions (Buttons, Menus, Modals)
      </h2>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {interactions.map((interaction) => (
          <div
            key={interaction.id}
            onClick={() => {
              setIsAdding(false);
              setSelectedId(interaction.id);
              setFormData(interaction);
            }}
            className={`p-3 rounded-lg cursor-pointer transition-all ${
              selectedId === interaction.id
                ? "bg-pink-500/30 border border-pink-400/50"
                : "bg-slate-700/20 border border-slate-600/30 hover:bg-slate-600/30"
            }`}
          >
            <div className="text-sm font-medium text-slate-100">
              {interaction.type === "button" && "🔘"}{" "}
              {interaction.type === "select_menu" && "📋"}{" "}
              {interaction.type === "modal" && "📝"} {interaction.label}
            </div>
            <div className="text-xs text-slate-400">{interaction.customId}</div>
          </div>
        ))}
      </div>

      {interactions.length === 0 && !isAdding && (
        <p className="text-xs text-slate-500 text-center py-4">
          No interactions yet
        </p>
      )}

      {(isAdding || selectedId) && (
        <div className="space-y-4 p-4 bg-slate-800/50 rounded-lg border border-slate-600/30">
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-2">
              Interaction Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded text-sm text-slate-100 focus:outline-none focus:border-pink-400/50"
            >
              <option value="button">🔘 Button</option>
              <option value="select_menu">📋 Select Menu</option>
              <option value="modal">📝 Modal</option>
              <option value="user_select">👤 User Select Menu</option>
              <option value="role_select">👑 Role Select Menu</option>
              <option value="channel_select">💬 Channel Select Menu</option>
              <option value="context_menu_user">👆 Context Menu (User)</option>
              <option value="context_menu_message">💬 Context Menu (Message)</option>
            </select>
          </div>

          <input
            type="text"
            placeholder="Label/Button Text"
            value={formData.label}
            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-pink-400/50"
          />

          <input
            type="text"
            placeholder="Custom ID (unique identifier)"
            value={formData.customId}
            onChange={(e) =>
              setFormData({
                ...formData,
                customId: e.target.value.toLowerCase().replace(/\s+/g, "_"),
              })
            }
            className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-pink-400/50"
          />

          <textarea
            placeholder="Handler code (what happens when interacted)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-pink-400/50 font-mono text-xs"
            rows={4}
          />

          {formData.type === "button" && (
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-2">
                Button Style
              </label>
              <select
                value={formData.style || "primary"}
                onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded text-sm text-slate-100 focus:outline-none focus:border-pink-400/50"
              >
                <option value="primary">🔵 Primary (Blue)</option>
                <option value="secondary">⚫ Secondary (Gray)</option>
                <option value="success">🟢 Success (Green)</option>
                <option value="danger">🔴 Danger (Red)</option>
              </select>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              className="flex-1 px-3 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded text-sm font-medium transition-colors"
            >
              {isAdding ? "Create" : "Update"}
            </button>
            {selectedId && (
              <button
                onClick={() => {
                  onDeleteInteraction(selectedId);
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
          className="w-full px-3 py-2 bg-pink-600/20 hover:bg-pink-500/30 text-pink-300 rounded border border-pink-400/30 text-sm font-medium transition-colors"
        >
          + Add Interaction (Button/Menu/Modal)
        </button>
      )}
    </div>
  );
}

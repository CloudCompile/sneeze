"use client";

import { useState } from "react";

interface EmbedData {
  title?: string;
  description?: string;
  color?: string;
  fields?: { name: string; value: string; inline?: boolean }[];
  footer?: string;
  thumbnail?: string;
  image?: string;
}

interface EmbedBuilderProps {
  embed: EmbedData;
  onEmbedChange: (embed: EmbedData) => void;
}

export function EmbedBuilder({ embed, onEmbedChange }: EmbedBuilderProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const addField = () => {
    onEmbedChange({
      ...embed,
      fields: [...(embed.fields || []), { name: "Field Name", value: "Field Value" }],
    });
  };

  const removeField = (index: number) => {
    onEmbedChange({
      ...embed,
      fields: (embed.fields || []).filter((_, i) => i !== index),
    });
  };

  const updateField = (index: number, name: string, value: string) => {
    const fields = [...(embed.fields || [])];
    fields[index] = { ...fields[index], name, value };
    onEmbedChange({ ...embed, fields });
  };

  // Convert color to discord format
  const colorValue = embed.color ? parseInt(embed.color.replace("#", ""), 16) : 3447003;

  return (
    <div className="space-y-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
      <h3 className="text-sm font-semibold text-slate-100">Embed Editor</h3>

      {/* Preview */}
      <div className="p-4 bg-slate-950/50 rounded border border-slate-700/30">
        <div
          className="rounded border-l-4 p-4 bg-slate-800/50"
          style={{ borderColor: embed.color || "#3447003" }}
        >
          {embed.title && (
            <div className="font-bold text-slate-100 mb-2">{embed.title}</div>
          )}
          {embed.description && (
            <div className="text-slate-300 text-sm mb-3">{embed.description}</div>
          )}
          {(embed.fields || []).map((field, i) => (
            <div key={i} className="text-xs mb-2">
              <div className="font-semibold text-slate-200">{field.name}</div>
              <div className="text-slate-400">{field.value}</div>
            </div>
          ))}
          {embed.footer && (
            <div className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-700/30">
              {embed.footer}
            </div>
          )}
        </div>
      </div>

      {/* Basic Fields */}
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Title (optional)"
          value={embed.title || ""}
          onChange={(e) => onEmbedChange({ ...embed, title: e.target.value })}
          maxLength={256}
          className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400/50"
        />

        <textarea
          placeholder="Description (optional)"
          value={embed.description || ""}
          onChange={(e) =>
            onEmbedChange({ ...embed, description: e.target.value })
          }
          maxLength={4096}
          rows={3}
          className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400/50"
        />

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs text-slate-400">Color</label>
            <input
              type="color"
              value={embed.color || "#3447003"}
              onChange={(e) => onEmbedChange({ ...embed, color: e.target.value })}
              className="w-full h-10 rounded cursor-pointer"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-slate-400">Footer</label>
            <input
              type="text"
              placeholder="Footer text"
              value={embed.footer || ""}
              onChange={(e) => onEmbedChange({ ...embed, footer: e.target.value })}
              maxLength={256}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400/50"
            />
          </div>
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-slate-300">Fields</label>
          <button
            onClick={addField}
            className="text-xs px-2 py-1 bg-cyan-600/20 hover:bg-cyan-500/30 text-cyan-300 rounded border border-cyan-400/30 transition-colors"
          >
            + Add Field
          </button>
        </div>

        {(embed.fields || []).map((field, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="text"
              placeholder="Field name"
              value={field.name}
              onChange={(e) => updateField(i, e.target.value, field.value)}
              maxLength={256}
              className="flex-1 px-2 py-1 bg-slate-700/50 border border-slate-600/30 rounded text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400/50"
            />
            <input
              type="text"
              placeholder="Field value"
              value={field.value}
              onChange={(e) => updateField(i, field.name, e.target.value)}
              maxLength={1024}
              className="flex-1 px-2 py-1 bg-slate-700/50 border border-slate-600/30 rounded text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400/50"
            />
            <button
              onClick={() => removeField(i)}
              className="px-2 py-1 bg-red-600/20 hover:bg-red-500/30 text-red-300 rounded text-xs border border-red-400/20 transition-colors"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Advanced */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-xs text-slate-400 hover:text-slate-300 transition-colors"
      >
        {showAdvanced ? "▼" : "▶"} Advanced Options
      </button>

      {showAdvanced && (
        <div className="space-y-2 pt-2 border-t border-slate-700/30">
          <input
            type="url"
            placeholder="Thumbnail URL"
            value={embed.thumbnail || ""}
            onChange={(e) => onEmbedChange({ ...embed, thumbnail: e.target.value })}
            className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400/50"
          />
          <input
            type="url"
            placeholder="Image URL"
            value={embed.image || ""}
            onChange={(e) => onEmbedChange({ ...embed, image: e.target.value })}
            className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400/50"
          />
        </div>
      )}
    </div>
  );
}

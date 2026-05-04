"use client";

import { useState } from "react";
import type { EventHandler } from "@/lib/botBuilder/types";

interface EventBuilderProps {
  events: EventHandler[];
  onAddEvent: (event: EventHandler) => void;
  onUpdateEvent: (id: string, event: EventHandler) => void;
  onDeleteEvent: (id: string) => void;
}

const eventTypes = [
  { value: "on_ready", label: "Bot Ready" },
  { value: "on_message", label: "Message Received" },
  { value: "on_member_join", label: "Member Joined" },
  { value: "on_member_remove", label: "Member Left" },
  { value: "on_reaction_add", label: "Reaction Added" },
  { value: "on_voice_state_update", label: "Voice State Changed" },
];

const actionTypes = [
  { value: "send_message", label: "Send Message" },
  { value: "add_role", label: "Add Role" },
  { value: "delete_message", label: "Delete Message" },
  { value: "log", label: "Log Event" },
];

export function EventBuilder({
  events,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
}: EventBuilderProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<EventHandler>>({
    type: "on_message",
    action: "send_message",
    content: "",
    filter: "all",
  });

  const handleAddClick = () => {
    setIsAdding(true);
    setSelectedId(null);
    setFormData({
      type: "on_message",
      action: "send_message",
      content: "",
      filter: "all",
    });
  };

  const handleSelectEvent = (evt: EventHandler) => {
    setIsAdding(false);
    setSelectedId(evt.id);
    setFormData(evt);
  };

  const handleSave = () => {
    if (!formData.type || !formData.action) {
      alert("Please fill in all fields");
      return;
    }

    const event: EventHandler = {
      id: formData.id || Date.now().toString(),
      type: formData.type as any,
      action: formData.action as any,
      content: formData.content || "",
      filter: formData.filter || "all",
    };

    if (isAdding) {
      onAddEvent(event);
    } else if (selectedId) {
      onUpdateEvent(selectedId, event);
    }

    setIsAdding(false);
    setSelectedId(null);
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-gradient-to-b from-slate-800/40 to-slate-900/40 rounded-xl backdrop-blur-sm border border-slate-700/50">
      <h2 className="text-lg font-semibold text-slate-100">Events</h2>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {events.map((evt) => {
          const typeLabel =
            eventTypes.find((t) => t.value === evt.type)?.label || evt.type;
          const actionLabel =
            actionTypes.find((a) => a.value === evt.action)?.label ||
            evt.action;

          return (
            <div
              key={evt.id}
              onClick={() => handleSelectEvent(evt)}
              className={`p-3 rounded-lg cursor-pointer transition-all ${
                selectedId === evt.id
                  ? "bg-purple-500/30 border border-purple-400/50"
                  : "bg-slate-700/20 border border-slate-600/30 hover:bg-slate-600/30"
              }`}
            >
              <div className="text-sm font-medium text-slate-100">
                {typeLabel}
              </div>
              <div className="text-xs text-slate-400">{actionLabel}</div>
            </div>
          );
        })}
      </div>

      {events.length === 0 && !isAdding && (
        <p className="text-xs text-slate-500 text-center py-4">No events yet</p>
      )}

      {(isAdding || selectedId) && (
        <div className="space-y-3 p-3 bg-slate-800/50 rounded-lg border border-slate-600/30">
          <div>
            <label className="text-xs font-medium text-slate-300">Event Type</label>
            <select
              value={formData.type || "on_message"}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as any })
              }
              className="w-full mt-1 px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded text-sm text-slate-100 focus:outline-none focus:border-purple-400/50"
            >
              {eventTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300">Action</label>
            <select
              value={formData.action || "send_message"}
              onChange={(e) =>
                setFormData({ ...formData, action: e.target.value as any })
              }
              className="w-full mt-1 px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded text-sm text-slate-100 focus:outline-none focus:border-purple-400/50"
            >
              {actionTypes.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300">Content</label>
            <textarea
              placeholder="Message content or action details"
              value={formData.content || ""}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              className="w-full mt-1 px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-400/50"
              rows={2}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded text-sm font-medium transition-colors"
            >
              {isAdding ? "Add" : "Update"}
            </button>
            {selectedId && (
              <button
                onClick={() => {
                  onDeleteEvent(selectedId);
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
          className="w-full px-3 py-2 bg-purple-600/20 hover:bg-purple-500/30 text-purple-300 rounded border border-purple-400/30 text-sm font-medium transition-colors"
        >
          + Add Event
        </button>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { CommandBuilder } from "./CommandBuilder";
import { EventBuilder } from "./EventBuilder";
import { ConfigForm } from "./ConfigForm";
import { CodePreview } from "./CodePreview";
import { TemplateSelector } from "./TemplateSelector";
import { ExportModal } from "./ExportModal";
import { generateBotCode } from "@/lib/botBuilder/codeGenerator";
import type { BotState, Command, EventHandler, BotConfig } from "@/lib/botBuilder/types";

import { ModeToggle } from "./ModeToggle";

export function BotBuilderApp() {
  const [view, setView] = useState<"template" | "builder">("template");
  const [showExport, setShowExport] = useState(false);
  const [showCodePreview, setShowCodePreview] = useState(false);
  const [mode, setMode] = useState<"simple" | "advanced">("simple");

  const [state, setState] = useState<BotState>({
    config: {
      name: "MyBot",
      description: "A cool Discord bot",
      prefix: "!",
      status: "with slash commands",
      intents: ["message_content", "members", "guilds", "messages"],
    },
    commands: [],
    events: [],
  });

  const handleSelectTemplate = (templateState: BotState) => {
    setState(templateState);
    setView("builder");
  };

  const handleAddCommand = (command: Command) => {
    setState({
      ...state,
      commands: [...state.commands, command],
    });
  };

  const handleUpdateCommand = (id: string, command: Command) => {
    setState({
      ...state,
      commands: state.commands.map((c) => (c.id === id ? command : c)),
    });
  };

  const handleDeleteCommand = (id: string) => {
    setState({
      ...state,
      commands: state.commands.filter((c) => c.id !== id),
    });
  };

  const handleAddEvent = (event: EventHandler) => {
    setState({
      ...state,
      events: [...state.events, event],
    });
  };

  const handleUpdateEvent = (id: string, event: EventHandler) => {
    setState({
      ...state,
      events: state.events.map((e) => (e.id === id ? event : e)),
    });
  };

  const handleDeleteEvent = (id: string) => {
    setState({
      ...state,
      events: state.events.filter((e) => e.id !== id),
    });
  };

  const handleConfigChange = (config: BotConfig) => {
    setState({
      ...state,
      config,
    });
  };

  const generatedCode = generateBotCode(state);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><rect fill=%22%230f172a%22 width=%22100%22 height=%22100%22/><circle cx=%2250%22 cy=%2250%22 r=%2230%22 fill=%22%234f46e5%22 opacity=%220.05%22/></svg>')] opacity-30" />
        <div className="absolute top-0 -right-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" />
        <div className="absolute -bottom-8 -left-1/2 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-slate-700/30 bg-gradient-to-b from-slate-800/50 to-transparent backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                  Discord Bot Builder
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  Create production-ready Discord bots visually
                </p>
              </div>
              <div className="flex items-center gap-3">
                {view === "builder" && (
                  <>
                    <button
                      onClick={() => setShowCodePreview(!showCodePreview)}
                      className="px-4 py-2 bg-slate-700/30 hover:bg-slate-600/40 text-slate-200 rounded-lg text-sm font-medium border border-slate-600/30 transition-colors"
                    >
                      {showCodePreview ? "Hide" : "Show"} Code
                    </button>
                    <button
                      onClick={() => setShowExport(true)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Export ZIP
                    </button>
                    <button
                      onClick={() => setView("template")}
                      className="px-4 py-2 bg-slate-700/30 hover:bg-slate-600/40 text-slate-200 rounded-lg text-sm font-medium border border-slate-600/30 transition-colors"
                    >
                      New Project
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {view === "template" ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-100 mb-2">
                  Choose a Template
                </h2>
                <p className="text-slate-400 text-sm mb-6">
                  Start with a pre-configured template or build from scratch
                </p>
              </div>
              <TemplateSelector onSelectTemplate={handleSelectTemplate} />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Mode Toggle */}
              <ModeToggle mode={mode} onModeChange={setMode} />

              {/* Builder Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Panel - Commands */}
                <div className="lg:col-span-1">
                  <CommandBuilder
                    commands={state.commands}
                    onAddCommand={handleAddCommand}
                    onUpdateCommand={handleUpdateCommand}
                    onDeleteCommand={handleDeleteCommand}
                    mode={mode}
                  />
                </div>

                {/* Center Panel - Events & Config */}
                <div className="lg:col-span-1 space-y-6">
                  <EventBuilder
                    events={state.events}
                    onAddEvent={handleAddEvent}
                    onUpdateEvent={handleUpdateEvent}
                    onDeleteEvent={handleDeleteEvent}
                  />
                  <ConfigForm
                    config={state.config}
                    onConfigChange={handleConfigChange}
                  />
                </div>

                {/* Right Panel - Code Preview */}
                <div className="lg:col-span-2">
                  {showCodePreview ? (
                    <CodePreview code={generatedCode} />
                  ) : (
                    <div className="flex items-center justify-center p-8 h-full rounded-xl bg-gradient-to-b from-slate-800/40 to-slate-900/40 border border-slate-700/50">
                      <div className="text-center">
                        <div className="text-slate-400 text-sm mb-3">
                          Code preview is hidden
                        </div>
                        <button
                          onClick={() => setShowCodePreview(true)}
                          className="px-4 py-2 bg-indigo-600/30 hover:bg-indigo-500/40 text-indigo-300 rounded border border-indigo-400/30 text-sm font-medium transition-colors"
                        >
                          Show Code
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border border-indigo-400/20">
                  <div className="text-2xl font-bold text-indigo-400">
                    {state.commands.length}
                  </div>
                  <div className="text-xs text-indigo-300">Commands</div>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-400/20">
                  <div className="text-2xl font-bold text-purple-400">
                    {state.events.length}
                  </div>
                  <div className="text-xs text-purple-300">Events</div>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-400/20">
                  <div className="text-2xl font-bold text-cyan-400">
                    {state.config.intents.length}
                  </div>
                  <div className="text-xs text-cyan-300">Intents</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Export Modal */}
      {showExport && <ExportModal state={state} onClose={() => setShowExport(false)} />}

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}

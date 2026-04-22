"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import "./ClaudeApp.css";

type Role = "user" | "assistant";
type ViewMode = "chats" | "projects" | "artifacts";
type ArtifactTab = "code" | "preview";

interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
}

interface Conversation {
  id: string;
  title: string;
  model: string;
  baseUrl: string;
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

interface AppSettings {
  apiKey: string;
  baseUrl: string;
  systemPrompt: string;
  displayName: string;
  models: string[];
  defaultModel: string;
  hasPaidPlan: boolean;
}

interface Artifact {
  id: string;
  filename: string;
  language: string;
  code: string;
  lineCount: number;
  conversationId: string;
  messageId: string;
}

const CONVERSATIONS_KEY = "cui_conversations";
const SETTINGS_KEY = "cui_settings";

const DEFAULT_MODELS = [
  "claude-sonnet-4-5",
  "gpt-4o",
  "gpt-4.1",
  "o4-mini",
  "deepseek-chat",
];

const DEFAULT_SETTINGS: AppSettings = {
  apiKey: "",
  baseUrl: "https://api.openai.com",
  systemPrompt: "You are a helpful assistant.",
  displayName: "You",
  models: DEFAULT_MODELS,
  defaultModel: DEFAULT_MODELS[0],
  hasPaidPlan: false,
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function truncateTitle(value: string) {
  return value.trim().slice(0, 36) || "New chat";
}

function modelLabel(model: string) {
  if (model.includes("claude-sonnet-4-5")) return "Sonnet 4.5";
  if (model.includes("gpt-4o")) return "GPT-4o";
  if (model.includes("gpt-4.1")) return "GPT-4.1";
  if (model.includes("o4-mini")) return "o4-mini";
  return model.length > 14 ? `${model.slice(0, 14)}…` : model;
}

function buildMessages(history: ChatMessage[], systemPrompt: string, baseUrl: string) {
  const msgs = history.map((m) => ({ role: m.role, content: m.content }));
  if (baseUrl.includes("anthropic.com")) return msgs;
  return [{ role: "system", content: systemPrompt }, ...msgs];
}

function detectArtifact(language: string, code: string) {
  const lines = code.replace(/\n+$/, "").split("\n");
  const firstLine = lines[0] ?? "";
  const match = firstLine.match(/^\s*(?:\/\/|#)\s*artifact:\s*(.+)$/i);
  const fromComment = match?.[1]?.trim();
  const isArtifact =
    Boolean(fromComment) || lines.length >= 20 || ["html", "svg"].includes(language.toLowerCase());
  const ext = language ? language.toLowerCase() : "txt";
  const filename = fromComment || `artifact.${ext}`;
  return { isArtifact, filename, lineCount: lines.length };
}

function parseArtifactsFromContent(content: string, conversationId: string, messageId: string) {
  const results: Artifact[] = [];
  const regex = /```([\w-]*)\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    const language = (match[1] || "text").toLowerCase();
    const code = match[2] || "";
    const detected = detectArtifact(language, code);
    if (!detected.isArtifact) continue;
    results.push({
      id: uid(),
      filename: detected.filename,
      language,
      code,
      lineCount: detected.lineCount,
      conversationId,
      messageId,
    });
  }
  return results;
}

function Icon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

function CLogo() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="c-logo">
      <path d="M48 14a22 22 0 1 0 0 36l-5-5a15 15 0 1 1 0-26z" />
    </svg>
  );
}

function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function ClaudeApp() {
  const [hydrated, setHydrated] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("chats");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showTitleMenu, setShowTitleMenu] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [openConversationMenu, setOpenConversationMenu] = useState<string | null>(null);
  const [showAllRecents, setShowAllRecents] = useState(false);
  const [artifactPanel, setArtifactPanel] = useState<{ artifact: Artifact | null; tab: ArtifactTab }>({
    artifact: null,
    tab: "code",
  });
  const [feedbackMap, setFeedbackMap] = useState<Record<string, "up" | "down">>({});

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      const rawConversations = localStorage.getItem(CONVERSATIONS_KEY);
      if (rawConversations) {
        const parsed = JSON.parse(rawConversations) as Conversation[];
        if (Array.isArray(parsed)) {
          setConversations(parsed);
          if (parsed.length > 0) setActiveConversationId(parsed[0].id);
        }
      }

      const rawSettings = localStorage.getItem(SETTINGS_KEY);
      if (rawSettings) {
        const parsedSettings = JSON.parse(rawSettings) as Partial<AppSettings>;
        setSettings((prev) => ({
          ...prev,
          ...parsedSettings,
          models:
            Array.isArray(parsedSettings.models) && parsedSettings.models.length > 0
              ? parsedSettings.models
              : prev.models,
        }));
      }
    } catch {
      setConversations([]);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
  }, [conversations, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings, hydrated]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "44px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  }, [input]);

  const sortedConversations = useMemo(() => {
    return [...conversations].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return b.updatedAt - a.updatedAt;
    });
  }, [conversations]);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId) ?? null,
    [activeConversationId, conversations]
  );

  const allArtifacts = useMemo(() => {
    return conversations.flatMap((conversation) =>
      conversation.messages
        .filter((m) => m.role === "assistant")
        .flatMap((m) => parseArtifactsFromContent(m.content, conversation.id, m.id))
    );
  }, [conversations]);

  const starredConversations = sortedConversations.filter((c) => c.pinned);
  const recentConversations = sortedConversations.filter((c) => !c.pinned);
  const visibleRecents = showAllRecents ? recentConversations : recentConversations.slice(0, 15);

  const updateConversation = (id: string, updater: (c: Conversation) => Conversation) => {
    setConversations((prev) => prev.map((c) => (c.id === id ? updater(c) : c)));
  };

  const createConversation = (firstMessage?: string) => {
    const now = Date.now();
    const conversation: Conversation = {
      id: uid(),
      title: firstMessage ? truncateTitle(firstMessage) : "New chat",
      model: settings.defaultModel,
      baseUrl: settings.baseUrl,
      pinned: false,
      createdAt: now,
      updatedAt: now,
      messages: [],
    };
    setConversations((prev) => [conversation, ...prev]);
    setActiveConversationId(conversation.id);
    return conversation;
  };

  const handleNewChat = () => {
    setViewMode("chats");
    setOpenConversationMenu(null);
    createConversation();
  };

  const removeConversation = (conversationId: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== conversationId));
    if (activeConversationId === conversationId) {
      setActiveConversationId(null);
      setArtifactPanel({ artifact: null, tab: "code" });
    }
  };

  const exportConversationMarkdown = (conversation: Conversation | null) => {
    if (!conversation) return;
    const markdown = [
      `# ${conversation.title}`,
      "",
      ...conversation.messages.flatMap((m) => [
        `## ${m.role === "user" ? settings.displayName : "Assistant"}`,
        "",
        m.content,
        "",
      ]),
    ].join("\n");
    downloadText(`${conversation.title.replace(/\s+/g, "-").toLowerCase() || "chat"}.md`, markdown);
  };

  const exportAllConversations = () => {
    downloadText("cui_conversations.json", JSON.stringify(conversations, null, 2));
  };

  const stopStreaming = () => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setIsStreaming(false);
  };

  const streamAssistantResponse = async (conversation: Conversation, history: ChatMessage[]) => {
    const apiKey = settings.apiKey.trim();
    const baseUrl = settings.baseUrl.trim();

    if (!apiKey || !baseUrl) {
      setShowSettings(true);
      return;
    }

    const assistantMessageId = uid();
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: Date.now(),
    };

    updateConversation(conversation.id, (c) => ({
      ...c,
      updatedAt: Date.now(),
      messages: [...c.messages, assistantMessage],
    }));

    const controller = new AbortController();
    controllerRef.current = controller;
    setIsStreaming(true);

    try {
      const response = await fetch(`${baseUrl.replace(/\/$/, "")}/v1/chat/completions`, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: conversation.model,
          stream: true,
          messages: buildMessages(history, settings.systemPrompt, baseUrl),
          ...(baseUrl.includes("anthropic.com") ? { system: settings.systemPrompt } : {}),
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const rawLine of lines) {
          const line = rawLine.trim();
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") break;

          try {
            const parsed = JSON.parse(data);
            const content = parsed?.choices?.[0]?.delta?.content;
            const delta =
              typeof content === "string"
                ? content
                : Array.isArray(content)
                  ? content.map((item) => item?.text || "").join("")
                  : "";

            if (!delta) continue;

            updateConversation(conversation.id, (c) => ({
              ...c,
              updatedAt: Date.now(),
              messages: c.messages.map((m) =>
                m.id === assistantMessageId ? { ...m, content: `${m.content}${delta}` } : m
              ),
            }));
          } catch {
            // ignore malformed stream chunks
          }
        }
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        updateConversation(conversation.id, (c) => ({
          ...c,
          updatedAt: Date.now(),
          messages: c.messages.map((m) =>
            m.id === assistantMessageId
              ? { ...m, content: "I hit an error while generating this response. Check your API settings and try again." }
              : m
          ),
        }));
      }
    } finally {
      controllerRef.current = null;
      setIsStreaming(false);
    }
  };

  const sendMessage = async (overrideText?: string) => {
    const content = (overrideText ?? input).trim();
    if (!content || isStreaming) return;

    let conversation = activeConversation;
    if (!conversation) {
      conversation = createConversation(content);
    }

    const userMessage: ChatMessage = {
      id: uid(),
      role: "user",
      content,
      timestamp: Date.now(),
    };

    const nextHistory = [...conversation.messages, userMessage];

    updateConversation(conversation.id, (c) => ({
      ...c,
      title: c.title === "New chat" ? truncateTitle(content) : c.title,
      updatedAt: Date.now(),
      messages: nextHistory,
    }));

    setInput("");
    await streamAssistantResponse(conversation, nextHistory);
  };

  const regenerateLatest = async () => {
    if (!activeConversation || isStreaming) return;
    const lastUserIndex = [...activeConversation.messages]
      .reverse()
      .findIndex((m) => m.role === "user");
    if (lastUserIndex < 0) return;

    const userMessage = activeConversation.messages[activeConversation.messages.length - 1 - lastUserIndex];
    const history = activeConversation.messages.slice(
      0,
      activeConversation.messages.length - lastUserIndex
    );
    const withoutLatestAssistant = history.filter((m, index, arr) => {
      if (index !== arr.length - 1) return true;
      return m.role !== "assistant";
    });

    updateConversation(activeConversation.id, (c) => ({
      ...c,
      updatedAt: Date.now(),
      messages: withoutLatestAssistant,
    }));

    await streamAssistantResponse(activeConversation, withoutLatestAssistant);

    if (userMessage?.content) {
      setInput("");
    }
  };

  const selectModel = (model: string) => {
    if (!activeConversation) {
      setSettings((prev) => ({ ...prev, defaultModel: model }));
      setShowModelMenu(false);
      return;
    }
    updateConversation(activeConversation.id, (c) => ({ ...c, model, updatedAt: Date.now() }));
    setShowModelMenu(false);
  };

  const activeModel = activeConversation?.model || settings.defaultModel;

  const currentTitle = activeConversation?.title || "New chat";

  const searchedConversations = sortedConversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const initials = settings.displayName
    .split(" ")
    .map((part) => part[0]?.toUpperCase() || "")
    .join("")
    .slice(0, 2);

  return (
    <div className="claude-root">
      <aside className="claude-sidebar">
        <div className="sidebar-nav">
          {[
            {
              key: "new",
              label: "New chat",
              action: handleNewChat,
              icon: <Icon path="M12 5v14M5 12h14" />,
            },
            {
              key: "search",
              label: "Search",
              action: () => setShowSearch(true),
              icon: <Icon path="M11 4a7 7 0 1 0 4.43 12.43L20 21l1-1-4.57-4.57A7 7 0 0 0 11 4z" />,
            },
            {
              key: "chats",
              label: "Chats",
              action: () => setViewMode("chats"),
              icon: <Icon path="M5 5h14v10H8l-3 3z" />,
            },
            {
              key: "projects",
              label: "Projects",
              action: () => setViewMode("projects"),
              icon: <Icon path="M4 6h6l2 2h8v10H4z" />,
            },
            {
              key: "artifacts",
              label: "Artifacts",
              action: () => setViewMode("artifacts"),
              icon: <Icon path="M5 4h8l6 6v10H5zM13 4v6h6" />,
            },
            {
              key: "code",
              label: "Code",
              action: () => {},
              icon: <Icon path="M8 7 3 12l5 5M16 7l5 5-5 5" />,
            },
            {
              key: "settings",
              label: "Customize",
              action: () => setShowSettings(true),
              icon: <Icon path="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm8 4-2.1.8.2 2.2-2 1.2-1.5-1.6-2 .8-.5 2.1h-2.3l-.5-2.1-2-.8-1.5 1.6-2-1.2.2-2.2L4 12l.8-2.1-1.6-1.5 1.2-2 2.2.2L8 4l2.1.8.8-2h2.2l.8 2 2.1-.8 1.5 1.6 2-1.2 1.2 2-1.6 1.5z" />,
            },
          ].map((item) => (
            <button
              key={item.key}
              className={`nav-row ${viewMode === item.key ? "active" : ""}`}
              onClick={item.action}
              type="button"
            >
              {item.icon}
              <span>{item.label}</span>
              {item.key === "code" && !settings.hasPaidPlan ? <em className="upgrade-pill">Upgrade</em> : null}
            </button>
          ))}
        </div>

        <div className="sidebar-divider" />

        <section className="sidebar-section">
          <h3>STARRED</h3>
          {starredConversations.length === 0 ? <p className="empty-section">No pinned chats yet</p> : null}
          {starredConversations.map((conversation) => (
            <button
              key={conversation.id}
              className={`conversation-item ${conversation.id === activeConversationId ? "active" : ""}`}
              onClick={() => {
                setViewMode("chats");
                setActiveConversationId(conversation.id);
              }}
              type="button"
            >
              <span>{conversation.title}</span>
            </button>
          ))}
        </section>

        <section className="sidebar-section recents">
          <h3>RECENTS</h3>
          {visibleRecents.map((conversation) => (
            <div
              key={conversation.id}
              className={`conversation-wrap ${conversation.id === activeConversationId ? "active" : ""}`}
            >
              <button
                className="conversation-item"
                onClick={() => {
                  setViewMode("chats");
                  setActiveConversationId(conversation.id);
                }}
                type="button"
              >
                <span>{conversation.title}</span>
              </button>
              <button
                className="overflow-btn"
                onClick={() =>
                  setOpenConversationMenu((prev) => (prev === conversation.id ? null : conversation.id))
                }
                type="button"
              >
                •••
              </button>
              {openConversationMenu === conversation.id ? (
                <div className="menu-popover">
                  <button
                    onClick={() => {
                      const renamed = window.prompt("Rename conversation", conversation.title);
                      if (renamed) {
                        updateConversation(conversation.id, (c) => ({ ...c, title: renamed.trim() || c.title }));
                      }
                      setOpenConversationMenu(null);
                    }}
                    type="button"
                  >
                    Rename
                  </button>
                  <button
                    onClick={() => {
                      updateConversation(conversation.id, (c) => ({ ...c, pinned: !c.pinned }));
                      setOpenConversationMenu(null);
                    }}
                    type="button"
                  >
                    {conversation.pinned ? "Unpin" : "Pin"}
                  </button>
                  <button
                    onClick={() => {
                      removeConversation(conversation.id);
                      setOpenConversationMenu(null);
                    }}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              ) : null}
            </div>
          ))}
          {recentConversations.length > 15 ? (
            <button className="view-all" onClick={() => setShowAllRecents((v) => !v)} type="button">
              {showAllRecents ? "Show less" : "View all"}
            </button>
          ) : null}
        </section>

        <div className="sidebar-footer">
          <div className="profile-avatar">{initials || "U"}</div>
          <div className="profile-meta">
            <strong>{settings.displayName}</strong>
            <span>Free plan</span>
          </div>
          <button className="footer-icon" onClick={exportAllConversations} type="button" aria-label="Export chats">
            <Icon path="M12 4v10m0 0 4-4m-4 4-4-4M5 18h14" />
          </button>
          <button className="footer-icon" onClick={() => setShowSettings(true)} type="button" aria-label="Open settings">
            <Icon path="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm8 4-2 .8.2 2.2-2 1.2-1.6-1.6-2 .8-.5 2.1h-2.2l-.5-2.1-2-.8-1.6 1.6-2-1.2.2-2.2-2-.8.8-2.1-1.6-1.5 1.2-2 2.2.2.8-2 2.1.8.8-2h2.2l.8 2 2.1-.8 1.5 1.6 2-1.2 1.2 2-1.6 1.5z" />
          </button>
        </div>
      </aside>

      <main className="claude-chat-area">
        <header className="chat-titlebar">
          <div className="title-wrap">
            {editingTitle && activeConversation ? (
              <input
                value={activeConversation.title}
                onChange={(e) => updateConversation(activeConversation.id, (c) => ({ ...c, title: e.target.value }))}
                onBlur={() => setEditingTitle(false)}
                autoFocus
              />
            ) : (
              <button className="title-button" onDoubleClick={() => setEditingTitle(true)} type="button">
                {currentTitle}
              </button>
            )}
            <button className="title-chevron" onClick={() => setShowTitleMenu((v) => !v)} type="button">
              ˅
            </button>
            {showTitleMenu ? (
              <div className="menu-popover title-menu">
                <button
                  onClick={() => {
                    setEditingTitle(true);
                    setShowTitleMenu(false);
                  }}
                  type="button"
                >
                  Rename
                </button>
                <button
                  onClick={() => {
                    exportConversationMarkdown(activeConversation);
                    setShowTitleMenu(false);
                  }}
                  type="button"
                >
                  Export as markdown
                </button>
                <button
                  onClick={() => {
                    if (activeConversation) removeConversation(activeConversation.id);
                    setShowTitleMenu(false);
                  }}
                  type="button"
                >
                  Delete
                </button>
              </div>
            ) : null}
          </div>
          {!settings.apiKey.trim() ? (
            <button className="get-pro" onClick={() => setShowSettings(true)} type="button">
              Get Pro
            </button>
          ) : null}
        </header>

        {viewMode === "projects" ? (
          <section className="placeholder-view">
            <h2>Projects</h2>
            <p>Projects view is a placeholder for now.</p>
          </section>
        ) : viewMode === "artifacts" ? (
          <section className="artifact-list-view">
            <h2>Artifacts</h2>
            {allArtifacts.length === 0 ? (
              <p>No artifacts yet.</p>
            ) : (
              <div className="artifact-list">
                {allArtifacts.map((artifact) => (
                  <button
                    key={artifact.id}
                    className="artifact-card"
                    onClick={() => setArtifactPanel({ artifact, tab: "code" })}
                    type="button"
                  >
                    <span className="artifact-file">{artifact.filename}</span>
                    <span className="artifact-meta">
                      {artifact.language} · {artifact.lineCount} lines
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>
        ) : (
          <section className="chat-messages-wrap">
            <div className="messages-column">
              {!activeConversation || activeConversation.messages.length === 0 ? (
                <div className="empty-state">
                  <CLogo />
                  <h1>How can I help you today?</h1>
                  <div className="suggestions-grid">
                    {[
                      "Explain a concept to me",
                      "Help me write some code",
                      "Analyze a document",
                      "Help me plan something",
                    ].map((suggestion) => (
                      <button key={suggestion} onClick={() => setInput(suggestion)} type="button">
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                activeConversation.messages.map((message, index) => {
                  const isStreamingMessage = isStreaming && index === activeConversation.messages.length - 1;
                  return (
                    <article key={message.id} className={`chat-message ${message.role}`}>
                      {message.role === "assistant" ? (
                        <div className="assistant-avatar">
                          <CLogo />
                        </div>
                      ) : null}
                      <div className="message-body">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code({ className, children, ...props }) {
                              const language = (className?.replace("language-", "") || "text").toLowerCase();
                              const code = String(children).replace(/\n$/, "");
                              const detected = detectArtifact(language, code);

                              if (detected.isArtifact) {
                                const artifact: Artifact = {
                                  id: uid(),
                                  filename: detected.filename,
                                  language,
                                  code,
                                  lineCount: detected.lineCount,
                                  conversationId: activeConversation.id,
                                  messageId: message.id,
                                };

                                return (
                                  <button
                                    className="artifact-inline"
                                    onClick={() => setArtifactPanel({ artifact, tab: "code" })}
                                    type="button"
                                  >
                                    <div>
                                      <strong>{artifact.filename}</strong>
                                      <span>
                                        {artifact.lineCount} lines · {artifact.language}
                                      </span>
                                    </div>
                                    <span>View →</span>
                                  </button>
                                );
                              }

                              return (
                                <SyntaxHighlighter
                                  style={oneDark}
                                  language={language}
                                  PreTag="div"
                                  customStyle={{ margin: 0, borderRadius: 12, fontSize: 13 }}
                                  {...props}
                                >
                                  {code}
                                </SyntaxHighlighter>
                              );
                            },
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                        {isStreamingMessage ? <span className="stream-cursor">▍</span> : null}

                        {message.role === "assistant" && !isStreamingMessage ? (
                          <div className="message-actions">
                            <button
                              onClick={() => navigator.clipboard.writeText(message.content)}
                              type="button"
                              aria-label="Copy response"
                            >
                              <Icon path="M8 8h10v12H8zM6 4h10v2H8v10H6z" />
                            </button>
                            <button onClick={regenerateLatest} type="button" aria-label="Regenerate response">
                              <Icon path="M12 5a7 7 0 1 0 7 7h-2l3-3 3 3h-2a9 9 0 1 1-2.6-6.4L17 7A7 7 0 0 0 12 5z" />
                            </button>
                            <button
                              onClick={() => setFeedbackMap((prev) => ({ ...prev, [message.id]: "up" }))}
                              type="button"
                              aria-label="Thumbs up"
                              className={feedbackMap[message.id] === "up" ? "picked" : ""}
                            >
                              <Icon path="M10 10V5l3-1v6h5l-1 8H8V10zM4 10h3v8H4z" />
                            </button>
                            <button
                              onClick={() => setFeedbackMap((prev) => ({ ...prev, [message.id]: "down" }))}
                              type="button"
                              aria-label="Thumbs down"
                              className={feedbackMap[message.id] === "down" ? "picked" : ""}
                            >
                              <Icon path="M14 14v5l-3 1v-6H6l1-8h9v8zM20 6h-3v8h3z" />
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>
        )}

        <footer className="chat-input-bar">
          <div className="input-pill">
            <button className="attach-btn" onClick={() => setShowAttachMenu((v) => !v)} type="button">
              <Icon path="M7 12a5 5 0 1 1 10 0v5a3 3 0 0 1-6 0v-6a1 1 0 1 1 2 0v6a1 1 0 0 0 2 0v-5a3 3 0 1 0-6 0v6a5 5 0 0 0 10 0v-4h2v4a7 7 0 0 1-14 0z" />
            </button>
            {showAttachMenu ? (
              <div className="menu-popover attach-menu">
                <button type="button">Attach file</button>
                <button type="button">Take screenshot</button>
              </div>
            ) : null}

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="How can I help?"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void sendMessage();
                }
              }}
              disabled={isStreaming}
            />

            <div className="input-right">
              <button className="model-btn" onClick={() => setShowModelMenu((v) => !v)} type="button">
                {modelLabel(activeModel)} <span>˅</span>
              </button>
              {showModelMenu ? (
                <div className="menu-popover model-menu">
                  {settings.models.map((model) => (
                    <button key={model} onClick={() => selectModel(model)} type="button">
                      {model}
                    </button>
                  ))}
                </div>
              ) : null}

              {isStreaming ? (
                <button className="send-btn active" onClick={stopStreaming} type="button" aria-label="Stop generation">
                  <span className="stop-square" />
                </button>
              ) : (
                <button
                  className={`send-btn ${input.trim() ? "active" : ""}`}
                  onClick={() => void sendMessage()}
                  disabled={!input.trim()}
                  type="button"
                  aria-label="Send message"
                >
                  <Icon path="M5 12h12M13 6l6 6-6 6" />
                </button>
              )}
            </div>
          </div>
          <p>Claude is AI and can make mistakes. Please double-check responses.</p>
        </footer>
      </main>

      <aside className={`artifact-panel ${artifactPanel.artifact ? "open" : ""}`}>
        {artifactPanel.artifact ? (
          <>
            <header>
              <div>
                <strong>{artifactPanel.artifact.filename}</strong>
                <span>{artifactPanel.artifact.language}</span>
              </div>
              <div className="artifact-actions">
                <button
                  onClick={() => navigator.clipboard.writeText(artifactPanel.artifact?.code || "")}
                  type="button"
                >
                  Copy
                </button>
                <button
                  onClick={() =>
                    downloadText(artifactPanel.artifact?.filename || "artifact.txt", artifactPanel.artifact?.code || "")
                  }
                  type="button"
                >
                  Download
                </button>
                <button onClick={() => setArtifactPanel({ artifact: null, tab: "code" })} type="button">
                  ✕
                </button>
              </div>
            </header>

            <div className="artifact-tabs">
              <button
                className={artifactPanel.tab === "code" ? "active" : ""}
                onClick={() => setArtifactPanel((prev) => ({ ...prev, tab: "code" }))}
                type="button"
              >
                Code
              </button>
              <button
                className={artifactPanel.tab === "preview" ? "active" : ""}
                onClick={() => setArtifactPanel((prev) => ({ ...prev, tab: "preview" }))}
                type="button"
              >
                Preview
              </button>
            </div>

            <div className="artifact-body">
              {artifactPanel.tab === "code" ? (
                <SyntaxHighlighter
                  style={oneDark}
                  language={artifactPanel.artifact.language}
                  PreTag="div"
                  customStyle={{ margin: 0, borderRadius: 8, height: "100%" }}
                >
                  {artifactPanel.artifact.code}
                </SyntaxHighlighter>
              ) : ["html", "svg"].includes(artifactPanel.artifact.language) ? (
                <iframe title="artifact preview" srcDoc={artifactPanel.artifact.code} className="artifact-preview" />
              ) : (
                <div className="preview-empty">Preview is available for HTML and SVG artifacts.</div>
              )}
            </div>
          </>
        ) : null}
      </aside>

      {showSettings ? (
        <div className="modal-backdrop" onClick={() => setShowSettings(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2>Customize</h2>
            <label>
              API key
              <input
                type="password"
                value={settings.apiKey}
                onChange={(e) => setSettings((prev) => ({ ...prev, apiKey: e.target.value }))}
                placeholder="sk-..."
              />
            </label>
            <label>
              Base URL
              <input
                value={settings.baseUrl}
                onChange={(e) => setSettings((prev) => ({ ...prev, baseUrl: e.target.value }))}
                placeholder="https://api.openai.com"
              />
            </label>
            <label>
              System prompt
              <textarea
                value={settings.systemPrompt}
                onChange={(e) => setSettings((prev) => ({ ...prev, systemPrompt: e.target.value }))}
                rows={4}
              />
            </label>
            <label>
              Display name
              <input
                value={settings.displayName}
                onChange={(e) => setSettings((prev) => ({ ...prev, displayName: e.target.value || "You" }))}
              />
            </label>
            <label>
              Models (comma or newline separated)
              <textarea
                value={settings.models.join("\n")}
                onChange={(e) => {
                  const models = e.target.value
                    .split(/[\n,]/)
                    .map((v) => v.trim())
                    .filter(Boolean);
                  setSettings((prev) => ({
                    ...prev,
                    models: models.length ? models : DEFAULT_MODELS,
                    defaultModel: models[0] || prev.defaultModel,
                  }));
                }}
                rows={4}
              />
            </label>
            <div className="modal-actions">
              <button onClick={() => setShowSettings(false)} type="button">
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showSearch ? (
        <div className="modal-backdrop" onClick={() => setShowSearch(false)}>
          <div className="modal-card search-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Search chats</h2>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
            />
            <div className="search-results">
              {searchedConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => {
                    setActiveConversationId(conversation.id);
                    setViewMode("chats");
                    setShowSearch(false);
                  }}
                  type="button"
                >
                  {conversation.title}
                </button>
              ))}
              {searchedConversations.length === 0 ? <p>No matches found.</p> : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

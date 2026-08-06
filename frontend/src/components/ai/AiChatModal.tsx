import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Send, Loader2, Bot, User, Trash2, Sparkles, Brain } from "lucide-react";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  summaries?: string[];
  intent?: string;
}

interface Props {
  pageName: string;
  summaryId: string;
  onClose: () => void;
}

export function AiChatModal({ pageName, summaryId, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const idRef = useRef(0);
  const [thinkingId, setThinkingId] = useState<number | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!loading) inputRef.current?.focus();
  }, [loading]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function send(text: string) {
    const question = text.trim();
    if (!question || loading) return;

    const userMsg: Message = { id: ++idRef.current, role: "user", content: question };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: `[Contexto: o usuário está na aba "${pageName}". Sumário preferencial: ${summaryId}] ${question}`,
          history,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Erro desconhecido" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setMessages((prev) => [...prev, {
        id: ++idRef.current,
        role: "assistant",
        content: data.answer,
        summaries: data.summaries,
        intent: data.intent,
      }]);
    } catch (err: unknown) {
      setMessages((prev) => [...prev, {
        id: ++idRef.current,
        role: "assistant",
        content: `Não foi possível obter resposta: ${(err as Error).message}`,
      }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  const isEmpty = messages.length === 0;

  return createPortal(
    <div className="fixed inset-0 z-[89] bg-black/40 backdrop-blur-[6px]" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      {/* Panel */}
      <div className="ai-chat-glow fixed bottom-[88px] right-[24px] z-[90] flex w-[380px] flex-col overflow-hidden rounded-2xl bg-app" style={{ height: "min(540px, calc(100vh - 120px))" }}>
        {/* Header */}
        <header className="flex items-center gap-3 border-b border-border px-5 py-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <Sparkles className="h-[18px] w-[18px]" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-[15px] font-semibold text-text">{pageName}</h2>
            <p className="truncate text-[11px] font-medium uppercase tracking-wider text-text-tertiary">
              {summaryId.replace(/_/g, " ")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-tertiary transition-colors hover:text-text"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {isEmpty && (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <Sparkles className="h-8 w-8 text-text-tertiary/40" />
              <p className="max-w-xs text-[13px] leading-relaxed text-text-tertiary">
                Pergunte qualquer coisa sobre <span className="font-semibold text-text-secondary">{pageName}</span>.
              </p>
            </div>
          )}

          <div className="flex flex-col justify-end" style={{ minHeight: isEmpty ? 0 : "100%" }}>
            {messages.map((msg) => (
              <div key={msg.id} className={`mb-4 flex gap-2.5 ${msg.role === "user" ? "justify-end" : ""}`}>
                {msg.role === "assistant" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                    msg.role === "user"
                      ? "rounded-br-md bg-primary text-on-primary"
                      : "rounded-bl-md border border-border bg-surface text-text-secondary shadow-token-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {msg.summaries && msg.summaries.length > 0 && (
                    <>
                      <button
                        onClick={() => setThinkingId(thinkingId === msg.id ? null : msg.id)}
                        className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-text-tertiary transition-colors hover:text-primary"
                      >
                        <Brain className="h-3 w-3" />
                        {thinkingId === msg.id ? "Fechar" : "Como a IA pensou"}
                      </button>
                      {thinkingId === msg.id && (
                        <div className="mt-2 rounded-lg border border-primary/20 bg-primary-soft/30 px-3 py-2.5 text-[11px] leading-relaxed">
                          <div className="mb-1.5 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-primary">
                            <Brain className="h-3 w-3" />
                            Raciocínio
                          </div>
                          {msg.intent && (
                            <p className="mb-1.5 text-text-secondary">
                              <span className="font-semibold text-text">Intenção:</span> {msg.intent}
                            </p>
                          )}
                          <p className="text-text-secondary">
                            <span className="font-semibold text-text">Dados consultados:</span>
                          </p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {msg.summaries!.map((s) => (
                              <span key={s} className="rounded-md border border-primary/20 bg-app-alt px-1.5 py-0.5 font-mono text-[9px] font-semibold text-primary">
                                {s.replace(/_/g, " ")}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-app-alt text-text-tertiary">
                    <User className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="mb-4 flex gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-border bg-surface px-3.5 py-2.5 shadow-token-sm">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  <span className="text-[12px] text-text-tertiary">Pensando...</span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-border px-3 py-3">
          <div className="flex items-center gap-1.5">
            {messages.length > 0 && (
              <button
                onClick={() => { setMessages([]); setInput(""); }}
                title="Limpar conversa"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-danger/60 transition-colors hover:text-danger"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
            <div className="relative flex-1">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Diga alguma coisa..."
                rows={1}
                disabled={loading}
                className="w-full resize-none overflow-hidden rounded-xl border border-border bg-app-alt py-2.5 pl-4 pr-11 text-[13px] text-text placeholder:text-text-tertiary outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary-soft disabled:opacity-50"
                style={{ maxHeight: 96 }}
                onInput={(e) => {
                  const t = e.currentTarget;
                  t.style.height = "auto";
                  t.style.height = `${Math.min(t.scrollHeight, 96)}px`;
                }}
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-on-primary transition-opacity disabled:opacity-30"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

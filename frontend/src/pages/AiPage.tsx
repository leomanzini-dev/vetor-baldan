import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, Loader2, Bot, User, Trash2, Brain } from "lucide-react";
import baldanLogo from "@/assets/baldan-logo.png";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  summaries?: string[];
  intent?: string;
}

const SUGGESTIONS = [
  "Como está o portfólio de inovação?",
  "Quais projetos estão críticos na execução?",
  "Qual o ranking dos top 5 projetos?",
  "Quem está sobrecarregado na equipe?",
];

export function AiPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const idRef = useRef(0);
  const [thinkingId, setThinkingId] = useState<number | null>(null);

  const isEmpty = messages.length === 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!loading) inputRef.current?.focus();
  }, [loading]);

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
        body: JSON.stringify({ question, history }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Erro desconhecido" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const aiMsg: Message = {
        id: ++idRef.current,
        role: "assistant",
        content: data.answer,
        summaries: data.summaries,
        intent: data.intent,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: unknown) {
      const aiMsg: Message = {
        id: ++idRef.current,
        role: "assistant",
        content: `Não foi possível obter resposta: ${(err as Error).message}`,
      };
      setMessages((prev) => [...prev, aiMsg]);
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

  function clear() {
    setMessages([]);
    setInput("");
  }

  return (
    <div className="flex h-[calc(100vh-68px)] flex-col">
      {/* ─── Área de mensagens / Estado vazio ─────────────────── */}
      <div className={`flex-1 ${isEmpty ? "overflow-hidden" : "overflow-y-auto"}`}>
        {isEmpty ? (
          <div className="flex h-full flex-col items-center justify-center gap-6 px-4 pb-4">
            {/* Logo + Marca */}
            <div className="flex flex-col items-center gap-6">
              <img src={baldanLogo} alt="Baldan" className="-mt-12 h-10 w-auto" />
              <div className="flex flex-col items-center text-center">
                <p className="max-w-md text-[13px] leading-relaxed text-text-tertiary">
                  Assistente inteligente do portfólio de inovação Baldan.
                  Pergunte sobre projetos, execução, equipe ou qualquer dado do sistema.
                </p>
              </div>
            </div>

            {/* Sugestões */}
            <div className="grid w-full max-w-lg grid-cols-1 gap-2 sm:grid-cols-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-xl border border-border bg-surface px-4 py-3 text-left text-[12.5px] leading-snug text-text-secondary shadow-token-sm transition-all hover:border-primary/30 hover:bg-primary-soft/30 hover:text-text"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Input no centro (estado vazio) */}
            <div className="w-full max-w-2xl">
              <div className="relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Pergunte ao VETOR IA..."
                  rows={1}
                  disabled={loading}
                  className="w-full resize-none rounded-xl border border-border bg-app-alt py-3 pl-4 pr-12 text-[13.5px] text-text placeholder:text-text-tertiary outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary-soft disabled:opacity-50"
                  style={{ maxHeight: 120 }}
                  onInput={(e) => {
                    const t = e.currentTarget;
                    t.style.height = "auto";
                    t.style.height = `${Math.min(t.scrollHeight, 120)}px`;
                  }}
                />
                <button
                  onClick={() => send(input)}
                  disabled={!input.trim() || loading}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-on-primary transition-opacity disabled:opacity-30"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto flex min-h-full max-w-2xl flex-col justify-end px-4 py-6">
            {messages.map((msg) => (
              <div key={msg.id} className={`mb-5 flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                {msg.role === "assistant" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-[13.5px] leading-relaxed ${
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
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-app-alt text-text-tertiary">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="mb-5 flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-border bg-surface px-4 py-3 shadow-token-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-[13px] text-text-tertiary">Pensando...</span>
                </div>
              </div>
            )}

            {/* Input inline após mensagens */}
            <div className="mt-8 mb-6 flex items-center gap-3">
              <button
                onClick={clear}
                title="Limpar conversa"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-surface text-text-tertiary shadow-token-sm transition-colors hover:border-danger/30 hover:text-danger"
              >
                <Trash2 className="h-[18px] w-[18px]" />
              </button>
              <div className="relative flex-1">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Pergunte ao VETOR IA..."
                  rows={1}
                  disabled={loading}
                  className="w-full resize-none rounded-2xl border border-border bg-app-alt py-3.5 pl-5 pr-14 text-[14px] text-text shadow-token-sm placeholder:text-text-tertiary outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary-soft disabled:opacity-50"
                  style={{ maxHeight: 120 }}
                  onInput={(e) => {
                    const t = e.currentTarget;
                    t.style.height = "auto";
                    t.style.height = `${Math.min(t.scrollHeight, 120)}px`;
                  }}
                />
                <button
                  onClick={() => send(input)}
                  disabled={!input.trim() || loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-on-primary shadow-token-sm transition-opacity disabled:opacity-30"
                >
                  <Send className="h-[18px] w-[18px]" />
                </button>
              </div>
            </div>

            <div ref={bottomRef} />
          </div>
        )}
      </div>
    </div>
  );
}

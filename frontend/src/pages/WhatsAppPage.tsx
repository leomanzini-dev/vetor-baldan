import { useCallback, useEffect, useState } from "react";
import { MessageCircle, RefreshCw, Loader2, CheckCircle2, QrCode } from "lucide-react";

type Status = "disconnected" | "qr_ready" | "connected" | "loading" | "error";

const ZAPPER_URL = "http://localhost:3031";
const POLL_MS = 3000;

export function WhatsAppPage() {
  const [status, setStatus] = useState<Status>("loading");
  const [qr, setQr] = useState<string | null>(null);
  const [jid, setJid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch(`${ZAPPER_URL}/session`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setStatus(data.status);
      setQr(data.qr || null);
      setJid(data.jid || null);
      setError(null);
    } catch {
      setStatus("error");
      setError("Zapper offline — inicie com: cd zapper && npm start");
    }
  }, []);

  useEffect(() => {
    fetchSession();
    const id = setInterval(fetchSession, POLL_MS);
    return () => clearInterval(id);
  }, [fetchSession]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[26px] font-semibold tracking-tight text-text">WhatsApp IA</h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          Conecte o WhatsApp para responder perguntas sobre o portfólio via <span className="font-mono font-semibold text-text-secondary">/baldan</span>
        </p>
      </div>

      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6 rounded-2xl border border-border bg-surface p-8 shadow-token-sm">
        {/* Status indicator */}
        <div className="flex items-center gap-2.5">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              status === "connected"
                ? "bg-success shadow-[0_0_8px_rgba(46,125,50,0.5)]"
                : status === "qr_ready"
                  ? "animate-pulse bg-warning"
                  : status === "error"
                    ? "bg-danger"
                    : "bg-text-tertiary"
            }`}
          />
          <span className="text-[13px] font-semibold text-text-secondary">
            {status === "connected" && "Conectado"}
            {status === "qr_ready" && "Aguardando escaneamento"}
            {status === "disconnected" && "Desconectado"}
            {status === "loading" && "Carregando..."}
            {status === "error" && "Offline"}
          </span>
        </div>

        {/* QR Code */}
        {status === "qr_ready" && qr && (
          <div className="flex flex-col items-center gap-4">
            <div className="overflow-hidden rounded-2xl border-2 border-border bg-white p-2">
              <img src={qr} alt="QR Code WhatsApp" className="h-[260px] w-[260px]" />
            </div>
            <p className="text-center text-[12px] text-text-tertiary">
              Abra o WhatsApp no celular e escaneie o código acima
            </p>
          </div>
        )}

        {/* Connected state */}
        {status === "connected" && (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <div className="text-center">
              <p className="text-[15px] font-semibold text-text">WhatsApp conectado</p>
              {jid && (
                <p className="mt-1 font-mono text-[12px] text-text-tertiary">{jid.split("@")[0]}</p>
              )}
            </div>
          </div>
        )}

        {/* Disconnected / Loading */}
        {(status === "disconnected" || status === "loading") && (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-app-alt">
              {status === "loading" ? (
                <Loader2 className="h-8 w-8 animate-spin text-text-tertiary" />
              ) : (
                <QrCode className="h-8 w-8 text-text-tertiary" />
              )}
            </div>
            <p className="text-[13px] text-text-tertiary">
              {status === "loading" ? "Conectando ao zapper..." : "Aguardando QR code..."}
            </p>
          </div>
        )}

        {/* Error */}
        {status === "error" && error && (
          <div className="flex flex-col items-center gap-3 py-4">
            <p className="rounded-lg border border-danger/20 bg-danger-soft px-4 py-2.5 text-center text-[12px] text-danger">
              {error}
            </p>
          </div>
        )}

        {/* Refresh button */}
        <button
          onClick={fetchSession}
          className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-[12px] font-semibold text-text-tertiary transition-colors hover:border-primary/30 hover:text-text"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Atualizar
        </button>
      </div>

      {/* How to use */}
      <div className="mx-auto w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-token-sm">
        <h3 className="flex items-center gap-2 text-[14px] font-semibold text-text">
          <MessageCircle className="h-4 w-4 text-success" />
          Como usar
        </h3>
        <div className="mt-3 flex flex-col gap-2.5 text-[12.5px] text-text-secondary">
          <p>
            <span className="font-mono font-semibold text-text">/baldan</span>{" "}
            como está o portfólio?
          </p>
          <p>
            <span className="font-mono font-semibold text-text">/baldan</span>{" "}
            quais projetos estão críticos?
          </p>
          <p>
            <span className="font-mono font-semibold text-text">/baldan</span>{" "}
            quem está sobrecarregado na equipe?
          </p>
        </div>
        <p className="mt-3 text-[11px] text-text-tertiary">
          A IA só responde mensagens que começam com <span className="font-mono font-semibold">/baldan</span>. Todas as outras são ignoradas.
        </p>
      </div>
    </div>
  );
}

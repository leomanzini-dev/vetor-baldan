// Cliente de IA com fallback: Gemini 3x → Arcee 3x → erro.
// Variáveis de ambiente: GEMINI_API_KEY, GEMINI_MODEL, ARCEE_API_KEY, ARCEE_BASE_URL, ARCEE_MODEL.

const GEMINI_MODEL = () => process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_API_KEY = () => process.env.GEMINI_API_KEY || "";
const ARCEE_MODEL = () => process.env.ARCEE_MODEL || "Trinity-Large-Thinking";
const ARCEE_API_KEY = () => process.env.ARCEE_API_KEY || "";
const ARCEE_BASE_URL = () => (process.env.ARCEE_BASE_URL || "https://api.arcee.ai/api/v1").replace(/\/+$/, "");

const AI_FETCH_TIMEOUT_MS = 30_000;

interface AiMessage {
  role: "user" | "assistant";
  content: string;
}

interface AiCallOptions {
  systemText: string;
  messages: AiMessage[];
  schema?: Record<string, unknown>;
  temperature?: number;
}

interface AiResult {
  data: Record<string, unknown>;
  provider: string;
  model: string;
  cycle: number;
}

/* ─── Helpers ───────────────────────────────────────────────── */

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = AI_FETCH_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function toGeminiContents(messages: AiMessage[]) {
  return messages
    .filter((m) => m.content)
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
}

function toOpenAiMessages(systemText: string, messages: AiMessage[], schema?: Record<string, unknown>) {
  const schemaHint = schema
    ? `\n\nResponda somente com JSON válido, sem markdown, seguindo este schema: ${JSON.stringify(schema)}`
    : "";
  const out: { role: string; content: string }[] = [
    { role: "system", content: `${systemText}${schemaHint}` },
  ];
  for (const m of messages) {
    if (m.content) out.push({ role: m.role, content: m.content });
  }
  return out;
}

function parseJsonText(text: string): Record<string, unknown> {
  const raw = text.trim();
  if (!raw) throw new Error("Resposta vazia do modelo");
  try { return JSON.parse(raw); } catch { /* fall through */ }
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return JSON.parse(fenced[1].trim());
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start >= 0 && end > start) return JSON.parse(raw.slice(start, end + 1));
  throw new Error("Resposta do modelo nao e JSON valido");
}

/* ─── Providers ─────────────────────────────────────────────── */

async function callGeminiOnce({ systemText, messages, schema, temperature }: AiCallOptions) {
  const apiKey = GEMINI_API_KEY();
  if (!apiKey) throw new Error("GEMINI_API_KEY nao configurada");

  const body: Record<string, unknown> = {
    systemInstruction: { parts: [{ text: systemText }] },
    contents: toGeminiContents(messages),
    generationConfig: {
      temperature,
      responseMimeType: "application/json",
      ...(schema ? { responseJsonSchema: schema } : {}),
    },
  };

  const res = await fetchWithTimeout(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL()}:generateContent?key=${apiKey}`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) },
  );

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    if (detail) console.error("[gemini] HTTP", res.status, detail.slice(0, 500));
    const err: Error & { status?: number } = new Error(`Gemini request failed (HTTP ${res.status})`);
    err.status = res.status;
    throw err;
  }

  const payload = await res.json();
  const text = payload.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || "").join("") || "";
  return parseJsonText(text);
}

async function callArceeOnce({ systemText, messages, schema, temperature }: AiCallOptions) {
  const apiKey = ARCEE_API_KEY();
  if (!apiKey) throw new Error("ARCEE_API_KEY nao configurada");

  const res = await fetchWithTimeout(`${ARCEE_BASE_URL()}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: ARCEE_MODEL(),
      messages: toOpenAiMessages(systemText, messages, schema),
      temperature,
      stream: false,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    if (detail) console.error("[arcee] HTTP", res.status, detail.slice(0, 500));
    const err: Error & { status?: number } = new Error(`Arcee request failed (HTTP ${res.status})`);
    err.status = res.status;
    throw err;
  }

  const payload = await res.json();
  const text = payload.choices?.[0]?.message?.content || "";
  return parseJsonText(text);
}

/* ─── Sequência de tentativas: Gemini 3x → Arcee 3x ────────── */

type Provider = "gemini" | "arcee";

const ATTEMPT_SEQUENCE: Provider[] = [
  "gemini", "gemini", "gemini",
  "arcee",  "arcee",  "arcee",
];

const runners: Record<Provider, (opts: AiCallOptions) => Promise<Record<string, unknown>>> = {
  gemini: callGeminiOnce,
  arcee: callArceeOnce,
};

export async function callAi(options: AiCallOptions): Promise<AiResult> {
  const { temperature = 0.2, ...rest } = options;
  const deadProviders = new Set<Provider>();
  let lastError: Error | null = null;

  for (let i = 0; i < ATTEMPT_SEQUENCE.length; i++) {
    const cycle = i + 1;
    const provider = ATTEMPT_SEQUENCE[i];
    if (deadProviders.has(provider)) continue;

    try {
      const data = await runners[provider]({ ...rest, temperature });
      console.log(`SUCESSO NO CICLO ${cycle} { MODEL = ${provider === "arcee" ? ARCEE_MODEL() : GEMINI_MODEL()} }`);
      return { data, provider, model: provider === "arcee" ? ARCEE_MODEL() : GEMINI_MODEL(), cycle };
    } catch (error: unknown) {
      lastError = error as Error;
      const model = provider === "arcee" ? ARCEE_MODEL() : GEMINI_MODEL();
      console.error(`ERRO NO CICLO ${cycle} { MODEL = ${model} }`, (error as Error)?.message || error);
      const s = Number((error as Error & { status?: number })?.status);
      if (s === 400 || s === 401 || s === 403 || s === 404) deadProviders.add(provider);
    }
  }

  throw lastError || new Error("Todas as tentativas de IA falharam");
}

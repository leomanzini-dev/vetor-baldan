// Handler de mensagens WhatsApp
// Só responde quando a mensagem começa com /baldan

const BACKEND_URL = process.env.VETOR_API_URL || "http://localhost:4000";
const COMMAND = "/baldan";

function extractText(msg) {
  return (
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    ""
  ).trim();
}

async function askAi(question) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch(`${BACKEND_URL}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }

    return res.json();
  } finally {
    clearTimeout(timer);
  }
}

function formatResponse(data) {
  const lines = [];

  lines.push(data.answer);

  // Linha de pensamento em negrito
  if (data.intent || (data.summaries && data.summaries.length)) {
    lines.push("");
    lines.push("─────────────────");

    if (data.intent) {
      lines.push(`*Intenção:* ${data.intent}`);
    }

    if (data.summaries && data.summaries.length) {
      const names = data.summaries.map((s) => s.replace(/_/g, " ")).join(", ");
      lines.push(`*Dados consultados:* ${names}`);
    }
  }

  return lines.join("\n");
}

export async function handleMessage(sock, msg) {
  // Ignorar mensagens próprias
  if (msg.key.fromMe) return;

  const text = extractText(msg);
  if (!text) return;

  // TRAVA: só responder ao comando /baldan — qualquer outra coisa é ignorada
  if (!text.toLowerCase().startsWith(COMMAND)) return;

  const question = text.slice(COMMAND.length).trim();
  const jid = msg.key.remoteJid;

  if (!question) {
    await sock.sendMessage(jid, {
      text: "Olá! Sou a *VETOR IA* 🤖\n\nDigite */baldan* seguido da sua pergunta.\n\nExemplo: */baldan como está o portfólio?*",
    });
    return;
  }

  console.log(`[ZAPPER] Pergunta de ${jid}: "${question.slice(0, 80)}"`);

  // Indicar que está digitando
  await sock.presenceSubscribe(jid);
  await sock.sendPresenceUpdate("composing", jid);

  try {
    const data = await askAi(question);
    const response = formatResponse(data);

    await new Promise((r) => setTimeout(r, 2000));
    await sock.sendMessage(jid, { text: response });
    console.log(`[ZAPPER] Resposta enviada (${response.length} chars)`);
  } catch (err) {
    console.error("[ZAPPER] Erro na IA:", err.message);
    await sock.sendMessage(jid, {
      text: "Não foi possível processar sua pergunta no momento. Tente novamente.",
    });
  } finally {
    await sock.sendPresenceUpdate("paused", jid);
  }
}

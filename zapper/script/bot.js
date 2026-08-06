import { makeWASocket, useMultiFileAuthState, DisconnectReason } from "@whiskeysockets/baileys";
import { toDataURL } from "qrcode";
import { updateSessionState } from "./bridge-state.js";
import { handleMessage } from "./message-handler.js";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const AUTH_DIR = resolve(__dirname, "../auth_info");

const silentLogger = { level: "silent", trace() {}, debug() {}, info() {}, warn() {}, error() {}, fatal() {}, child() { return this; } };

let activeSock = null;

function isCurrentSocket(sock) {
  return sock === activeSock;
}

export async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    logger: silentLogger,
  });

  activeSock = sock;

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    if (!isCurrentSocket(sock)) return;

    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      try {
        const qrDataUrl = await toDataURL(qr, { width: 300, margin: 2 });
        updateSessionState({ status: "qr_ready", qr: qrDataUrl });
        console.log("[ZAPPER] QR code pronto — escaneie no painel ou no terminal");
      } catch (err) {
        console.error("[ZAPPER] Erro ao gerar QR:", err.message);
      }
    }

    if (connection === "open") {
      updateSessionState({ status: "connected", qr: null, jid: sock.user?.id || null });
      console.log("[ZAPPER] Conectado ao WhatsApp:", sock.user?.id);
    }

    if (connection === "close") {
      const code = lastDisconnect?.error?.output?.statusCode;
      const loggedOut = code === DisconnectReason.loggedOut;

      if (loggedOut) {
        console.log("[ZAPPER] Deslogado — limpe auth_info e re-escaneie");
        updateSessionState({ status: "disconnected", qr: null, jid: null });
      } else {
        console.log("[ZAPPER] Conexão perdida, reconectando em 1.5s...");
        updateSessionState({ status: "disconnected", qr: null });
        setTimeout(() => startBot(), 1500);
      }
    }
  });

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (!isCurrentSocket(sock)) return;
    if (type !== "notify") return;

    for (const msg of messages) {
      await handleMessage(sock, msg);
    }
  });
}

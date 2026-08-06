import { startControlServer } from "./control-server.js";
import { startBot } from "./bot.js";

export async function main() {
  console.log("[ZAPPER] Iniciando VETOR WhatsApp IA...");
  startControlServer();
  await startBot();
}

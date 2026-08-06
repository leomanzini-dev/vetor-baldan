import { createServer } from "http";
import { getSessionState } from "./bridge-state.js";

const PORT = Number(process.env.ZAPPER_PORT || 3031);

export function startControlServer() {
  const server = createServer((req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.url === "/health") {
      const state = getSessionState();
      res.writeHead(200);
      res.end(JSON.stringify({ status: state.status, qr: state.qr ? "[redacted]" : null }));
      return;
    }

    if (req.url === "/session") {
      const state = getSessionState();
      res.writeHead(200);
      res.end(JSON.stringify(state));
      return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: "Not found" }));
  });

  server.listen(PORT, () => {
    console.log(`[ZAPPER] Control server rodando em http://localhost:${PORT}`);
  });
}

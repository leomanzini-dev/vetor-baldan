import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Carrega .env da raiz do projeto
config({ path: resolve(__dirname, "../.env") });
// Carrega .env local (sobrescreve)
config({ path: resolve(__dirname, ".env") });

const { main } = await import("./script/index.js");
main();

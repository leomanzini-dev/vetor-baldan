// Wrapper único para todas as chamadas aos endpoints /api/ai/* — o app é
// publicado como site 100% estático (GitHub Pages), então em produção não
// existe backend algum atendendo essas rotas: o host devolve sua própria
// página de erro (normalmente HTML, não JSON) para qualquer caminho /api.
// Sem isto, cada tela tentava fazer res.json() nessa resposta, falhava
// silenciosamente e mostrava "Erro desconhecido" — sem pista nenhuma do que
// realmente aconteceu. Aqui a causa mais provável fica explícita.
const BACKEND_UNAVAILABLE_MESSAGE =
  "Recurso de IA indisponível nesta versão — o backend não está hospedado aqui (esta é uma versão estática, tipo GitHub Pages). Rode o projeto localmente (npm run dev na raiz) para usar a IA.";

export async function aiFetch<T = { answer: string; summaries?: string[]; intent?: string }>(
  path: string,
  body: unknown
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(BACKEND_UNAVAILABLE_MESSAGE);
  }

  const raw = await res.text();
  let parsed: { answer?: string; error?: string } | null = null;
  try {
    parsed = raw ? JSON.parse(raw) : null;
  } catch {
    // resposta não é JSON — o host devolveu outra coisa no lugar da API
    // (ex.: a página 404 do GitHub Pages), sinal de que a rota não existe aqui.
  }

  if (!res.ok) {
    throw new Error(parsed?.error || BACKEND_UNAVAILABLE_MESSAGE);
  }
  if (parsed === null) {
    throw new Error(BACKEND_UNAVAILABLE_MESSAGE);
  }
  return parsed as T;
}

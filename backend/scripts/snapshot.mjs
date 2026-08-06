// Gera um snapshot estático de toda a API mockada, para publicar o front
// como site 100% estático (GitHub Pages) sem precisar hospedar o backend Node.
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = "http://localhost:4000/api";
const OUT = path.resolve(process.cwd(), "..", "frontend", "public", "data");

async function getJson(p) {
  const res = await fetch(`${BASE}${p}`);
  if (!res.ok) throw new Error(`Falha ao buscar ${p}: ${res.status}`);
  return res.json();
}

async function writeJson(relPath, data) {
  const full = path.join(OUT, relPath);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, JSON.stringify(data), "utf-8");
  console.log("escrito:", relPath);
}

async function main() {
  const verticals = await getJson("/verticals");
  await writeJson("verticals.json", verticals);

  const projectTypes = await getJson("/project-types");
  await writeJson("project-types.json", projectTypes);

  const funnelStages = await getJson("/funnel-stages");
  await writeJson("funnel-stages.json", funnelStages);

  const parameters = await getJson("/parameters");
  await writeJson("parameters.json", parameters);

  const people = await getJson("/people");
  await writeJson("people.json", people);

  const summary = await getJson("/portfolio/summary");
  await writeJson("portfolio-summary.json", summary);

  const highlights = await getJson("/portfolio/highlights");
  await writeJson("portfolio-highlights.json", highlights);

  const projectsResp = await getJson("/projects?limit=500");
  await writeJson("projects.json", projectsResp.items);

  const executionProjects = await getJson("/execution/projects");
  await writeJson("execution-projects.json", executionProjects);

  const capacity = await getJson("/execution/capacity");
  await writeJson("execution-capacity.json", capacity);

  for (const project of executionProjects) {
    const detail = await getJson(`/execution/${project.id}`);
    await writeJson(`execution/${project.id}.json`, detail);
  }

  console.log(`\nSnapshot completo: ${executionProjects.length} detalhes de execução.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

import type {
  CapacityResponse,
  FunnelStage,
  Person,
  PlatformParameters,
  PortfolioHighlights,
  PortfolioSummary,
  Project,
  ProjectExecutionDetail,
  ProjectType,
  Vertical,
} from "@/types/domain";

// Camada de dados 100% estática: o "backend" (backend/) só existe para GERAR
// estes JSONs (backend/scripts/snapshot.mjs) — em runtime, local ou publicado,
// o front lê sempre os arquivos estáticos em public/data/. Isso permite
// publicar o protótipo inteiro (GitHub Pages) sem hospedar um servidor Node.
const DATA_BASE = `${import.meta.env.BASE_URL}data`;

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${DATA_BASE}${path}`);
  if (!res.ok) {
    throw new Error(`Falha ao buscar ${path}: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export interface ProjectListParams {
  vertical?: string;
  type?: string;
  funnelStage?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

let projectsCache: Promise<Project[]> | null = null;
function getAllProjects(): Promise<Project[]> {
  if (!projectsCache) projectsCache = getJson<Project[]>("/projects.json");
  return projectsCache;
}

function filterProjects(all: Project[], params: ProjectListParams): Project[] {
  let result = all;
  if (params.vertical) result = result.filter((p) => p.vertical === params.vertical);
  if (params.type) result = result.filter((p) => p.type === params.type);
  if (params.funnelStage) result = result.filter((p) => p.funnelStage === params.funnelStage);
  if (params.search) {
    const term = params.search.toLowerCase();
    result = result.filter((p) => p.name.toLowerCase().includes(term) || p.code.toLowerCase().includes(term));
  }
  return result;
}

export const api = {
  getVerticals: () => getJson<Vertical[]>("/verticals.json"),
  getProjectTypes: () => getJson<ProjectType[]>("/project-types.json"),
  getFunnelStages: () => getJson<FunnelStage[]>("/funnel-stages.json"),
  getParameters: () => getJson<PlatformParameters>("/parameters.json"),
  getPeople: () => getJson<Person[]>("/people.json"),
  getSummary: () => getJson<PortfolioSummary>("/portfolio-summary.json"),
  getHighlights: () => getJson<PortfolioHighlights>("/portfolio-highlights.json"),

  getProjects: async (params: ProjectListParams = {}) => {
    const all = await getAllProjects();
    const filtered = filterProjects(all, params);
    const total = filtered.length;
    const offset = params.offset ?? 0;
    const limit = params.limit ?? total;
    return { items: filtered.slice(offset, offset + limit), total };
  },

  getProjectById: async (id: string) => {
    const all = await getAllProjects();
    const found = all.find((p) => p.id === id || p.code.toLowerCase() === id.toLowerCase());
    if (!found) throw new Error(`Projeto não encontrado: ${id}`);
    return found;
  },

  getExecutingProjects: () => getJson<Project[]>("/execution-projects.json"),
  getExecutionDetail: (projectId: string) => getJson<ProjectExecutionDetail>(`/execution/${projectId}.json`),
  getCapacitySummary: () => getJson<CapacityResponse>("/execution-capacity.json"),
};

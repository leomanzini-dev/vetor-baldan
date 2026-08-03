import type { Person } from "../types/domain.js";

function initials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

function person(p: Omit<Person, "avatarInitials">): Person {
  return { ...p, avatarInitials: initials(p.name) };
}

export const people: Person[] = [
  // Governança / visão executiva — não recebem micro-etapas nem pontos
  person({ id: "p-diretoria-1", name: "Renato Kappel", role: "Diretor de Inovação e Tecnologia", profile: "diretoria", vertical: null, dailyHours: 8 }),
  person({ id: "p-diretoria-2", name: "Marisa Uggeri", role: "Diretora Industrial", profile: "diretoria", vertical: null, dailyHours: 8 }),
  person({ id: "p-pmo-1", name: "Diego Bortolin", role: "Head de PMO Corporativo", profile: "pmo", vertical: null, dailyHours: 8 }),
  person({ id: "p-pmo-2", name: "Camila Fregonesi", role: "Analista de PMO Sênior", profile: "pmo", vertical: null, dailyHours: 8 }),
  person({ id: "p-pmo-3", name: "Thiago Meneghetti", role: "Analista de PMO", profile: "pmo", vertical: null, dailyHours: 6 }),
  person({ id: "p-area-1", name: "Bruna Zamboni", role: "Gerente de Engenharia — Preparo de Solo", profile: "area", vertical: "preparo-solo", dailyHours: 8 }),
  person({ id: "p-area-2", name: "Fábio Guariento", role: "Gerente de Engenharia — Plantio", profile: "area", vertical: "plantio", dailyHours: 8 }),
  person({ id: "p-area-3", name: "Letícia Piovesan", role: "Gerente de Engenharia — Pulverização", profile: "area", vertical: "pulverizacao", dailyHours: 8 }),
  person({ id: "p-area-4", name: "Gustavo Meirelles", role: "Gerente de Engenharia — Peças", profile: "area", vertical: "pecas", dailyHours: 8 }),
  person({ id: "p-controladoria-1", name: "Simone Ravanelli", role: "Controller de Projetos", profile: "controladoria", vertical: null, dailyHours: 8 }),
  person({ id: "p-controladoria-2", name: "André Luchesi", role: "Analista de Controladoria", profile: "controladoria", vertical: null, dailyHours: 6 }),

  // Executores — recebem micro-etapas e pontuação de capacidade
  person({ id: "p-exec-01", name: "Rafael Andreatta", role: "Engenheiro Mecânico Pleno", profile: "executor", vertical: "preparo-solo", dailyHours: 8 }),
  person({ id: "p-exec-02", name: "Juliana Cassol", role: "Engenheira de Materiais", profile: "executor", vertical: "preparo-solo", dailyHours: 6 }),
  person({ id: "p-exec-03", name: "Pedro Henrique Salla", role: "Projetista CAD Sênior", profile: "executor", vertical: "preparo-solo", dailyHours: 8 }),
  person({ id: "p-exec-04", name: "Mariana Costenaro", role: "Engenheira de Testes", profile: "executor", vertical: "preparo-solo", dailyHours: 4 }),
  person({ id: "p-exec-05", name: "Lucas Franceschini", role: "Engenheiro Mecânico Sênior", profile: "executor", vertical: "plantio", dailyHours: 8 }),
  person({ id: "p-exec-06", name: "Carolina Dal Pont", role: "Engenheira Eletrônica", profile: "executor", vertical: "plantio", dailyHours: 8 }),
  person({ id: "p-exec-07", name: "Vinícius Trentin", role: "Projetista Mecânico Pleno", profile: "executor", vertical: "plantio", dailyHours: 6 }),
  person({ id: "p-exec-08", name: "Amanda Bez", role: "Engenheira de Processos", profile: "executor", vertical: "plantio", dailyHours: 8 }),
  person({ id: "p-exec-09", name: "Felipe Ortolan", role: "Engenheiro de Automação", profile: "executor", vertical: "pulverizacao", dailyHours: 8 }),
  person({ id: "p-exec-10", name: "Bianca Segatto", role: "Engenheira de Software Embarcado", profile: "executor", vertical: "pulverizacao", dailyHours: 8 }),
  person({ id: "p-exec-11", name: "Otávio Baggio", role: "Engenheiro Mecânico Pleno", profile: "executor", vertical: "pulverizacao", dailyHours: 6 }),
  person({ id: "p-exec-12", name: "Isabela Rovaris", role: "Engenheira de Testes de Campo", profile: "executor", vertical: "pulverizacao", dailyHours: 8 }),
  person({ id: "p-exec-13", name: "Guilherme Piccoli", role: "Engenheiro de Produto", profile: "executor", vertical: "pecas", dailyHours: 8 }),
  person({ id: "p-exec-14", name: "Natália Zago", role: "Engenheira de Qualidade", profile: "executor", vertical: "pecas", dailyHours: 8 }),
  person({ id: "p-exec-15", name: "Rodrigo Casagrande", role: "Projetista Mecânico Júnior", profile: "executor", vertical: "pecas", dailyHours: 6 }),
  person({ id: "p-exec-16", name: "Débora Milani", role: "Engenheira de Manufatura", profile: "executor", vertical: "pecas", dailyHours: 4 }),
  person({ id: "p-exec-17", name: "Eduardo Sganzerla", role: "Analista de Dados de Engenharia", profile: "executor", vertical: null, dailyHours: 8 }),
  person({ id: "p-exec-18", name: "Priscila Gasparetto", role: "Engenheira de Inovação", profile: "executor", vertical: null, dailyHours: 8 }),
];

import type { PlatformParameters } from "../types/domain.js";

// Parâmetros globais da plataforma — editáveis no módulo de Parametrização (Módulo 5).
// Mantidos aqui como valor inicial "de fábrica".
export const platformParameters: PlatformParameters = {
  pointsPerHour: 10,
  workingDaysPerMonth: 21,
  currency: "BRL",
};

import type { VerticalId } from "@/types/domain";

export const verticalNames: Record<VerticalId, string> = {
  "preparo-solo": "Preparo de Solo",
  plantio: "Plantio",
  pulverizacao: "Pulverização",
  pecas: "Peças",
};

export const verticalOrder: VerticalId[] = ["preparo-solo", "plantio", "pulverizacao", "pecas"];

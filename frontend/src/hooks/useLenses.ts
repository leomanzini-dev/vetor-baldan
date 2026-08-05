import { useMemo } from "react";
import { Tag } from "lucide-react";
import { lensDefs, type LensDef } from "@/config/lenses";
import { useWeightsStore } from "@/store/weightsStore";

// Lentes fixas (ligadas a um campo real do dataset) + lentes que o usuário
// criou em tempo de execução — usado em qualquer tela que precise iterar
// "todas as lentes ativas", não só as 8 do modelo original.
export function useAllLenses(): LensDef[] {
  const customLenses = useWeightsStore((s) => s.customLenses);

  return useMemo(() => {
    const custom: LensDef[] = customLenses.map((lens) => ({
      id: lens.id,
      label: lens.label,
      short: lens.label,
      description: lens.description,
      icon: Tag,
    }));
    return [...lensDefs, ...custom];
  }, [customLenses]);
}

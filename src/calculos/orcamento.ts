export interface DimensoesAmbiente {
  largura: number;
  comprimento: number;
}

export interface ResultadoCalculoOrcamento {
  areaM2: number;
  quantidadePlacas: number;
  metragemLinear: number;
}

// Placa de gesso padrão: 60cm x 60cm
const AREA_PLACA_PADRAO_M2 = 0.6 * 0.6;
const MARGEM_PERDA = 0.1;

export function calcularOrcamento({
  largura,
  comprimento,
}: DimensoesAmbiente): ResultadoCalculoOrcamento {
  if (largura <= 0 || comprimento <= 0) {
    throw new Error("Largura e comprimento devem ser maiores que zero");
  }

  const areaM2 = largura * comprimento;
  const quantidadePlacas = Math.ceil(
    (areaM2 * (1 + MARGEM_PERDA)) / AREA_PLACA_PADRAO_M2,
  );
  const metragemLinear = 2 * (largura + comprimento);

  return { areaM2, quantidadePlacas, metragemLinear };
}

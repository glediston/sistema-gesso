import { calcularOrcamento } from "../calculos/orcamento";

describe("calcularOrcamento", () => {
  it("calcula área, quantidade de placas (com 10% de margem de perda) e metragem linear corretamente", () => {
    const resultado = calcularOrcamento({ largura: 4, comprimento: 5 });

    expect(resultado.areaM2).toBe(20);
    expect(resultado.quantidadePlacas).toBe(62);
    expect(resultado.metragemLinear).toBe(18);
  });

  it("arredonda a quantidade de placas para cima quando sobra área fracionada", () => {
    const resultado = calcularOrcamento({ largura: 2, comprimento: 2 });

    expect(resultado.areaM2).toBe(4);
    expect(resultado.quantidadePlacas).toBe(13);
  });

  it("lança erro quando largura é zero ou negativa", () => {
    expect(() => calcularOrcamento({ largura: 0, comprimento: 5 })).toThrow();
    expect(() => calcularOrcamento({ largura: -1, comprimento: 5 })).toThrow();
  });

  it("lança erro quando comprimento é zero ou negativo", () => {
    expect(() => calcularOrcamento({ largura: 5, comprimento: 0 })).toThrow();
    expect(() => calcularOrcamento({ largura: 5, comprimento: -1 })).toThrow();
  });
});

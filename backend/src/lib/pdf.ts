import PDFDocument from "pdfkit";
import type { Ambiente, Cliente, Orcamento } from "../generated/prisma/client";

const AREA_PLACA_M2 = 0.6 * 0.6;
const MARGEM_PERDA = 0.1;

type OrcamentoComRelacoes = Orcamento & { ambientes: Ambiente[]; cliente: Cliente };

export function gerarPdfOrcamento(orcamento: OrcamentoComRelacoes): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(18).text("Orçamento de Gesso", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Cliente: ${orcamento.cliente.nome}`);
    doc.text(`Telefone: ${orcamento.cliente.telefone}`);
    if (orcamento.cliente.endereco) {
      doc.text(`Endereço: ${orcamento.cliente.endereco}`);
    }
    doc.text(`Data: ${orcamento.createdAt.toLocaleDateString("pt-BR")}`);
    doc.moveDown();

    doc.fontSize(14).text("Ambientes");
    doc.moveDown(0.5);

    let areaTotal = 0;
    let linearTotal = 0;

    for (const ambiente of orcamento.ambientes) {
      const area = Number(ambiente.areaM2);
      const linear = Number(ambiente.metragemLinear);
      areaTotal += area;
      linearTotal += linear;

      doc
        .fontSize(11)
        .text(
          `${ambiente.nome} — ${Number(ambiente.largura).toFixed(2)}m x ${Number(ambiente.comprimento).toFixed(2)}m — Área: ${area.toFixed(2)} m² — Linear: ${linear.toFixed(2)} m`,
        );
    }

    const quantidadePlacas = Math.ceil((areaTotal * (1 + MARGEM_PERDA)) / AREA_PLACA_M2);

    doc.moveDown();
    doc.fontSize(14).text("Resumo");
    doc.moveDown(0.5);
    doc.fontSize(11).text(`Área total: ${areaTotal.toFixed(2)} m²`);
    doc.text(`Linear total: ${linearTotal.toFixed(2)} m`);
    doc.text(`Placas necessárias: ${quantidadePlacas}`);
    doc.text(`Preço por m²: R$ ${Number(orcamento.precoM2).toFixed(2)}`);
    doc.text(`Preço por linear: R$ ${Number(orcamento.precoLinear).toFixed(2)}`);
    doc.text(`Custos extras: R$ ${Number(orcamento.custosExtras).toFixed(2)}`);
    doc.moveDown(0.5);
    doc.fontSize(13).text(`Valor total: R$ ${Number(orcamento.valorTotal).toFixed(2)}`, {
      underline: true,
    });

    doc.end();
  });
}

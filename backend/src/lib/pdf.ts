import path from "node:path";
import PDFDocument from "pdfkit";
import type { Ambiente, Cliente, Orcamento } from "../generated/prisma/client";

const AREA_PLACA_M2 = 0.6 * 0.6;
const MARGEM_PERDA = 0.1;

const LOGO_PATH = path.join(__dirname, "..", "assets", "logo.png");
const TELEFONE_EMPRESA = "(77) 99107-2455";

type OrcamentoComRelacoes = Orcamento & { ambientes: Ambiente[]; cliente: Cliente };

export function gerarPdfOrcamento(orcamento: OrcamentoComRelacoes): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const topoY = doc.y;
    doc.image(LOGO_PATH, doc.page.margins.left, topoY, { width: 90 });

    const cabecalhoX = doc.page.margins.left + 110;
    const cabecalhoWidth = doc.page.width - doc.page.margins.right - cabecalhoX;
    doc
      .fontSize(18)
      .text("VE Gesso", cabecalhoX, topoY + 6, { width: cabecalhoWidth });
    doc
      .fontSize(10)
      .fillColor("#6b7280")
      .text("Instalações e Forros de Gesso", cabecalhoX, doc.y, { width: cabecalhoWidth });
    doc.text(`Tel.: ${TELEFONE_EMPRESA}`, cabecalhoX, doc.y, { width: cabecalhoWidth });
    doc.fillColor("#000000");

    doc.y = topoY + 90;
    doc
      .moveTo(doc.page.margins.left, doc.y)
      .lineTo(doc.page.width - doc.page.margins.right, doc.y)
      .strokeColor("#e2e5ea")
      .stroke();
    doc.moveDown();

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
          `${ambiente.nome} — ${Number(ambiente.largura).toFixed(2)}m x ${Number(ambiente.comprimento).toFixed(2)}m — Área: ${area.toFixed(2)} m² — Junta de Lotação - Linear: ${linear.toFixed(2)} m`,
        );
    }

    const quantidadePlacas = Math.ceil((areaTotal * (1 + MARGEM_PERDA)) / AREA_PLACA_M2);

    doc.moveDown();
    doc.fontSize(14).text("Resumo");
    doc.moveDown(0.5);
    doc.fontSize(11).text(`Área total: ${areaTotal.toFixed(2)} m²`);
    doc.text(`Junta de Lotação - Linear total: ${linearTotal.toFixed(2)} m`);
    doc.text(`Placas necessárias: ${quantidadePlacas}`);
    doc.text(`Preço por m²: R$ ${Number(orcamento.precoM2).toFixed(2)}`);
    doc.text(`Preço por linear: R$ ${Number(orcamento.precoLinear).toFixed(2)}`);
    doc.text(`Custos extras: R$ ${Number(orcamento.custosExtras).toFixed(2)}`);
    doc.moveDown(0.5);
    doc.fontSize(13).text(`Valor total: R$ ${Number(orcamento.valorTotal).toFixed(2)}`, {
      underline: true,
    });

    const rodapeY = doc.page.height - doc.page.margins.bottom + 10;
    doc
      .fontSize(9)
      .fillColor("#6b7280")
      .text(`VE Gesso — Instalações e Forros  •  ${TELEFONE_EMPRESA}`, doc.page.margins.left, rodapeY, {
        width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
        align: "center",
      });
    doc.fillColor("#000000");

    doc.end();
  });
}

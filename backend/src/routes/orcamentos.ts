import { Router } from "express";
import { z } from "zod";
import { calcularOrcamento } from "../calculos/orcamento";
import { prisma } from "../lib/prisma";
import { gerarPdfOrcamento } from "../lib/pdf";
import type { AuthRequest } from "../middlewares/auth";

export const orcamentosRouter = Router();

const ambienteSchema = z.object({
  nome: z.string().min(1, "nome do ambiente é obrigatório"),
  largura: z.number().positive(),
  comprimento: z.number().positive(),
});

const orcamentoSchema = z.object({
  clienteId: z.string().min(1),
  precoM2: z.number().nonnegative(),
  precoLinear: z.number().nonnegative(),
  custosExtras: z.number().nonnegative().optional().default(0),
  ambientes: z.array(ambienteSchema).min(1, "adicione ao menos um ambiente"),
});

const statusSchema = z.object({
  status: z.enum(["PENDENTE", "APROVADO", "CONCLUIDO", "RECUSADO"]),
});

const include = { ambientes: true, cliente: true } as const;

orcamentosRouter.post("/orcamentos", async (req: AuthRequest, res) => {
  const parsed = orcamentoSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }

  const { clienteId, precoM2, precoLinear, custosExtras, ambientes } = parsed.data;

  const cliente = await prisma.cliente.findUnique({ where: { id: clienteId } });
  if (!cliente) {
    res.status(404).json({ error: "Cliente não encontrado" });
    return;
  }

  const ambientesCalculados = ambientes.map((ambiente) => ({
    ...ambiente,
    ...calcularOrcamento(ambiente),
  }));

  const areaTotal = ambientesCalculados.reduce((soma, a) => soma + a.areaM2, 0);
  const linearTotal = ambientesCalculados.reduce((soma, a) => soma + a.metragemLinear, 0);
  const valorTotal = areaTotal * precoM2 + linearTotal * precoLinear + custosExtras;

  const orcamento = await prisma.orcamento.create({
    data: {
      clienteId,
      usuarioId: req.usuarioId as string,
      precoM2,
      precoLinear,
      custosExtras,
      valorTotal,
      ambientes: {
        create: ambientesCalculados.map((a) => ({
          nome: a.nome,
          largura: a.largura,
          comprimento: a.comprimento,
          areaM2: a.areaM2,
          metragemLinear: a.metragemLinear,
        })),
      },
    },
    include,
  });

  res.status(201).json(orcamento);
});

orcamentosRouter.get("/orcamentos/:id", async (req, res) => {
  const orcamento = await prisma.orcamento.findUnique({
    where: { id: req.params["id"] },
    include,
  });

  if (!orcamento || orcamento.excluido) {
    res.status(404).json({ error: "Orçamento não encontrado" });
    return;
  }

  res.json(orcamento);
});

orcamentosRouter.patch("/orcamentos/:id/status", async (req, res) => {
  const parsed = statusSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }

  const existente = await prisma.orcamento.findUnique({ where: { id: req.params["id"] } });
  if (!existente || existente.excluido) {
    res.status(404).json({ error: "Orçamento não encontrado" });
    return;
  }

  const orcamento = await prisma.orcamento.update({
    where: { id: req.params["id"] },
    data: {
      status: parsed.data.status,
      dataConclusao: parsed.data.status === "CONCLUIDO" ? new Date() : existente.dataConclusao,
    },
    include,
  });

  res.json(orcamento);
});

orcamentosRouter.delete("/orcamentos/:id", async (req, res) => {
  const existente = await prisma.orcamento.findUnique({ where: { id: req.params["id"] } });
  if (!existente || existente.excluido) {
    res.status(404).json({ error: "Orçamento não encontrado" });
    return;
  }

  await prisma.orcamento.update({ where: { id: req.params["id"] }, data: { excluido: true } });
  res.status(204).send();
});

orcamentosRouter.get("/orcamentos/:id/pdf", async (req, res) => {
  const orcamento = await prisma.orcamento.findUnique({
    where: { id: req.params["id"] },
    include,
  });

  if (!orcamento || orcamento.excluido) {
    res.status(404).json({ error: "Orçamento não encontrado" });
    return;
  }

  const pdfBuffer = await gerarPdfOrcamento(orcamento);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="orcamento-${orcamento.id}.pdf"`);
  res.send(pdfBuffer);
});

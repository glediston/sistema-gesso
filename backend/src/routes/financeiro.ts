import { Router } from "express";
import { prisma } from "../lib/prisma";
import type { StatusOrcamento } from "../generated/prisma/enums";

export const financeiroRouter = Router();

financeiroRouter.get("/financeiro", async (req, res) => {
  const mes = Number(req.query["mes"]);
  const ano = Number(req.query["ano"]);

  if (!mes || !ano || mes < 1 || mes > 12) {
    res.status(400).json({ error: "Parâmetros 'mes' e 'ano' são obrigatórios" });
    return;
  }

  const inicio = new Date(ano, mes - 1, 1);
  const fim = new Date(ano, mes, 1);

  const orcamentosDoPeriodo = await prisma.orcamento.findMany({
    where: { excluido: false, createdAt: { gte: inicio, lt: fim } },
    select: { status: true },
  });

  const contagemPorStatus: Record<StatusOrcamento, number> = {
    PENDENTE: 0,
    APROVADO: 0,
    CONCLUIDO: 0,
    RECUSADO: 0,
  };

  for (const { status } of orcamentosDoPeriodo) {
    contagemPorStatus[status] += 1;
  }

  const concluidosDoPeriodo = await prisma.orcamento.findMany({
    where: {
      excluido: false,
      status: "CONCLUIDO",
      dataConclusao: { gte: inicio, lt: fim },
    },
    orderBy: { dataConclusao: "desc" },
    include: { cliente: true },
  });

  const totalGanho = concluidosDoPeriodo.reduce((soma, o) => soma + Number(o.valorTotal), 0);

  res.json({
    totalGanho,
    contagemPorStatus,
    ultimosConcluidos: concluidosDoPeriodo.slice(0, 10),
  });
});

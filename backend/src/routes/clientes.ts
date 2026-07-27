import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";

export const clientesRouter = Router();

const clienteSchema = z.object({
  nome: z.string().min(1, "nome é obrigatório"),
  telefone: z.string().min(1, "telefone é obrigatório"),
  endereco: z
    .string()
    .nullish()
    .transform((valor) => valor ?? null),
});

clientesRouter.get("/clientes", async (req, res) => {
  const nome = typeof req.query["nome"] === "string" ? req.query["nome"] : undefined;

  const clientes = await prisma.cliente.findMany({
    where: nome ? { nome: { contains: nome, mode: "insensitive" } } : {},
    orderBy: { nome: "asc" },
  });

  res.json(clientes);
});

clientesRouter.post("/clientes", async (req, res) => {
  const parsed = clienteSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }

  const cliente = await prisma.cliente.create({ data: parsed.data });
  res.status(201).json(cliente);
});

clientesRouter.get("/clientes/:id", async (req, res) => {
  const cliente = await prisma.cliente.findUnique({ where: { id: req.params["id"] } });

  if (!cliente) {
    res.status(404).json({ error: "Cliente não encontrado" });
    return;
  }

  res.json(cliente);
});

clientesRouter.patch("/clientes/:id", async (req, res) => {
  const parsed = clienteSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }

  const existente = await prisma.cliente.findUnique({ where: { id: req.params["id"] } });
  if (!existente) {
    res.status(404).json({ error: "Cliente não encontrado" });
    return;
  }

  const cliente = await prisma.cliente.update({
    where: { id: req.params["id"] },
    data: parsed.data,
  });

  res.json(cliente);
});

clientesRouter.get("/clientes/:id/orcamentos", async (req, res) => {
  const orcamentos = await prisma.orcamento.findMany({
    where: { clienteId: req.params["id"], excluido: false },
    orderBy: { createdAt: "desc" },
  });

  res.json(orcamentos);
});

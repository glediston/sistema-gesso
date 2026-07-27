import "dotenv/config";
import bcrypt from "bcrypt";
import express from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "./lib/prisma";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

const loginSchema = z.object({
  login: z.string().min(1, "login é obrigatório"),
  senha: z.string().min(1, "senha é obrigatória"),
});

app.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }

  const { login, senha } = parsed.data;

  const usuario = await prisma.usuario.findUnique({ where: { login } });

  if (!usuario) {
    res.status(401).json({ error: "Credenciais inválidas" });
    return;
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senha);

  if (!senhaValida) {
    res.status(401).json({ error: "Credenciais inválidas" });
    return;
  }

  const jwtSecret = process.env["JWT_SECRET"];
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not set");
  }

  const token = jwt.sign({ sub: usuario.id, login: usuario.login }, jwtSecret, {
    expiresIn: "1h",
  });

  res.json({ token });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

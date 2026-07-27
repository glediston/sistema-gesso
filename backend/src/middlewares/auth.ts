import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  usuarioId?: string;
}

export function autenticar(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: "Token não informado" });
    return;
  }

  const jwtSecret = process.env["JWT_SECRET"];
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not set");
  }

  try {
    const payload = jwt.verify(token, jwtSecret) as { sub: string };
    req.usuarioId = payload.sub;
    next();
  } catch {
    res.status(401).json({ error: "Token inválido ou expirado" });
  }
}

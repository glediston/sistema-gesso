import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env["DATABASE_URL"] });
const prisma = new PrismaClient({ adapter });

async function main() {
  const senhaCriptografada = await bcrypt.hash("12345678", 10);

  const usuario = await prisma.usuario.upsert({
    where: { login: "vidal" },
    update: {},
    create: {
      nome: "vidal",
      login: "vidal",
      senha: senhaCriptografada,
    },
  });

  console.log("Usuário criado:", usuario);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

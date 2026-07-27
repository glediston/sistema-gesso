-- RenameColumn: Usuario.email -> Usuario.login
ALTER TABLE "Usuario" RENAME COLUMN "email" TO "login";
ALTER INDEX "Usuario_email_key" RENAME TO "Usuario_login_key";

-- AlterEnum: StatusOrcamento (remove REJEITADO/EM_EXECUCAO, add RECUSADO)
ALTER TABLE "Orcamento" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Orcamento" ALTER COLUMN "status" TYPE TEXT USING ("status"::TEXT);
DROP TYPE "StatusOrcamento";
CREATE TYPE "StatusOrcamento" AS ENUM ('PENDENTE', 'APROVADO', 'CONCLUIDO', 'RECUSADO');
ALTER TABLE "Orcamento" ALTER COLUMN "status" TYPE "StatusOrcamento" USING ("status"::"StatusOrcamento");
ALTER TABLE "Orcamento" ALTER COLUMN "status" SET DEFAULT 'PENDENTE';

-- AlterTable: Orcamento
ALTER TABLE "Orcamento"
  ADD COLUMN "precoM2" DECIMAL(10,2) NOT NULL,
  ADD COLUMN "precoLinear" DECIMAL(10,2) NOT NULL,
  ADD COLUMN "custosExtras" DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN "excluido" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "dataConclusao" TIMESTAMP(3);

-- AlterTable: Ambiente
ALTER TABLE "Ambiente"
  DROP COLUMN "altura",
  DROP COLUMN "valorM2",
  DROP COLUMN "valorTotal",
  ADD COLUMN "metragemLinear" DECIMAL(8,2) NOT NULL,
  ALTER COLUMN "areaM2" SET NOT NULL;

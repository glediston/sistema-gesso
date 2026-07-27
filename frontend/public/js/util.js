export const STATUS_LABELS = {
  PENDENTE: "Pendente",
  APROVADO: "Aprovado",
  CONCLUIDO: "Concluído",
  RECUSADO: "Recusado",
};

export const STATUS_ORDEM = ["PENDENTE", "APROVADO", "CONCLUIDO", "RECUSADO"];

export function formatarMoeda(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatarData(data) {
  return new Date(data).toLocaleDateString("pt-BR");
}

export function badgeStatus(status) {
  const classe = `badge badge--${status.toLowerCase()}`;
  const label = STATUS_LABELS[status] ?? status;
  return `<span class="${classe}">${label}</span>`;
}

// Formata progressivamente enquanto o usuário digita: (77) 9992-4982 ou
// (77) 99928-4982, dependendo se o número tem 8 ou 9 dígitos.
export function formatarTelefone(valor) {
  const digitos = valor.replace(/\D/g, "").slice(0, 11);

  if (digitos.length <= 2) {
    return digitos.length ? `(${digitos}` : "";
  }
  if (digitos.length <= 6) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  }
  if (digitos.length <= 10) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  }
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}

export function aplicarMascaraTelefone(input) {
  input.addEventListener("input", () => {
    input.value = formatarTelefone(input.value);
  });
}

export function exibirErro(elemento, erro) {
  elemento.textContent = erro?.message ?? "Ocorreu um erro inesperado.";
  elemento.hidden = false;
}

export function limparErro(elemento) {
  elemento.hidden = true;
  elemento.textContent = "";
}

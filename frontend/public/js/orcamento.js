import {
  atualizarStatusOrcamento,
  baixarPdfOrcamento,
  buscarOrcamento,
  excluirOrcamento,
  urlPdfOrcamento,
} from "./api.js";
import { exigirAutenticacao } from "./auth.js";
import { renderHeader } from "./header.js";
import { badgeStatus, exibirErro, formatarMoeda, limparErro } from "./util.js";

exigirAutenticacao();
renderHeader("clientes");

const params = new URLSearchParams(location.search);
const orcamentoId = params.get("id");

const mensagemEl = document.getElementById("mensagem");

if (!orcamentoId) {
  location.href = "clientes.html";
}

// Próximo(s) status possível(is) a partir do status atual.
const TRANSICOES = {
  PENDENTE: [
    { status: "APROVADO", label: "Aprovar", classe: "btn" },
    { status: "RECUSADO", label: "Recusar", classe: "btn btn--danger" },
  ],
  APROVADO: [
    { status: "CONCLUIDO", label: "Concluir", classe: "btn" },
    { status: "RECUSADO", label: "Recusar", classe: "btn btn--danger" },
  ],
  CONCLUIDO: [],
  RECUSADO: [],
};

let orcamentoAtual = null;

async function carregar() {
  try {
    orcamentoAtual = await buscarOrcamento(orcamentoId);
    renderizar();
  } catch (erro) {
    exibirErro(mensagemEl, erro);
  }
}

function renderizar() {
  const o = orcamentoAtual;

  document.getElementById("link-voltar").href = `cliente.html?id=${o.clienteId}`;
  document.getElementById("orcamento-status").innerHTML = badgeStatus(o.status);

  document.getElementById("resumo-tabela").innerHTML = o.ambientes
    .map(
      (a) => `
    <tr>
      <td>${a.nome}</td>
      <td>${Number(a.largura).toFixed(2)} m</td>
      <td>${Number(a.comprimento).toFixed(2)} m</td>
      <td>${Number(a.areaM2).toFixed(2)} m²</td>
      <td>${Number(a.metragemLinear).toFixed(2)} m</td>
    </tr>`,
    )
    .join("");

  const areaTotal = o.ambientes.reduce((soma, a) => soma + Number(a.areaM2), 0);
  const linearTotal = o.ambientes.reduce((soma, a) => soma + Number(a.metragemLinear), 0);
  const quantidadePlacas = Math.ceil((areaTotal * 1.1) / 0.36);
  const valorArea = areaTotal * Number(o.precoM2);
  const valorLinear = linearTotal * Number(o.precoLinear);

  document.getElementById("resumo-area-total").textContent = `${areaTotal.toFixed(2)} m²`;
  document.getElementById("resumo-linear-total").textContent = `${linearTotal.toFixed(2)} m`;
  document.getElementById("resumo-placas").textContent = quantidadePlacas;
  document.getElementById("resumo-valor-area").textContent = formatarMoeda(valorArea);
  document.getElementById("resumo-valor-linear").textContent = formatarMoeda(valorLinear);
  document.getElementById("resumo-custos-extras").textContent = formatarMoeda(o.custosExtras);
  document.getElementById("resumo-valor-total").textContent = formatarMoeda(o.valorTotal);

  renderizarAcoesStatus();
}

function renderizarAcoesStatus() {
  const container = document.getElementById("status-acoes");
  const opcoes = TRANSICOES[orcamentoAtual.status] ?? [];

  if (!opcoes.length) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = opcoes
    .map((op) => `<button type="button" class="${op.classe}" data-status="${op.status}">${op.label}</button>`)
    .join("");

  container.querySelectorAll("button").forEach((botao) => {
    botao.addEventListener("click", () => alterarStatus(botao.dataset.status));
  });
}

async function alterarStatus(novoStatus) {
  limparErro(mensagemEl);
  try {
    orcamentoAtual = await atualizarStatusOrcamento(orcamentoId, novoStatus);
    renderizar();
  } catch (erro) {
    exibirErro(mensagemEl, erro);
  }
}

document.getElementById("btn-excluir").addEventListener("click", async () => {
  const confirmado = window.confirm("Tem certeza que deseja excluir este orçamento?");
  if (!confirmado) return;

  try {
    await excluirOrcamento(orcamentoId);
    location.href = `cliente.html?id=${orcamentoAtual.clienteId}`;
  } catch (erro) {
    exibirErro(mensagemEl, erro);
  }
});

document.getElementById("btn-pdf").addEventListener("click", async () => {
  limparErro(mensagemEl);
  try {
    const blob = await baixarPdfOrcamento(orcamentoId);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `orcamento-${orcamentoId}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (erro) {
    exibirErro(mensagemEl, erro);
  }
});

document.getElementById("btn-whatsapp").addEventListener("click", () => {
  const nomeCliente = orcamentoAtual.cliente?.nome ?? "cliente";
  const valorTotal = formatarMoeda(orcamentoAtual.valorTotal);
  const linkPdf = urlPdfOrcamento(orcamentoId);

  const mensagem =
    `Olá ${nomeCliente}! Segue o orçamento de gesso no valor total de ${valorTotal}.\n` +
    `Confira o PDF: ${linkPdf}`;

  window.open(`https://wa.me/?text=${encodeURIComponent(mensagem)}`, "_blank");
});

carregar();

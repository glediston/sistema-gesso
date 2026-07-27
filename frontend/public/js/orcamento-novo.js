import { criarOrcamento } from "./api.js";
import { exigirAutenticacao } from "./auth.js";
import { renderHeader } from "./header.js";
import { exibirErro, formatarMoeda, limparErro } from "./util.js";

// Mesma regra do backend (src/calculos/orcamento.ts): placa 60cm x 60cm,
// margem de perda de 10% sobre a área antes de dividir pela placa.
const AREA_PLACA_M2 = 0.6 * 0.6;
const MARGEM_PERDA = 0.1;

exigirAutenticacao();
renderHeader("clientes");

const params = new URLSearchParams(location.search);
const clienteId = params.get("clienteId");

if (!clienteId) {
  location.href = "clientes.html";
}

document.getElementById("link-voltar").href = `cliente.html?id=${clienteId}`;

const listaAmbientesEl = document.getElementById("lista-ambientes");
const template = document.getElementById("template-ambiente");
const mensagemEl = document.getElementById("mensagem");

let contadorAmbientes = 0;

function adicionarAmbiente() {
  contadorAmbientes += 1;
  const node = template.content.cloneNode(true);
  const card = node.querySelector("[data-ambiente]");
  card.dataset.id = contadorAmbientes;

  card.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", atualizarResumo);
  });

  card.querySelector(".ambiente-card__remover").addEventListener("click", () => {
    card.remove();
    atualizarResumo();
  });

  listaAmbientesEl.appendChild(card);
  atualizarResumo();
}

function lerAmbientes() {
  return Array.from(listaAmbientesEl.querySelectorAll("[data-ambiente]")).map((card) => {
    const nome = card.querySelector("[data-campo=nome]").value.trim();
    const largura = Number(card.querySelector("[data-campo=largura]").value) || 0;
    const comprimento = Number(card.querySelector("[data-campo=comprimento]").value) || 0;
    const areaM2 = largura * comprimento;
    const metragemLinear = 2 * (largura + comprimento);

    card.querySelector("[data-saida=area]").textContent = `${areaM2.toFixed(2)} m²`;
    card.querySelector("[data-saida=linear]").textContent = `${metragemLinear.toFixed(2)} m`;

    return { nome, largura, comprimento, areaM2, metragemLinear };
  });
}

function atualizarResumo() {
  const ambientes = lerAmbientes();

  const areaTotal = ambientes.reduce((soma, a) => soma + a.areaM2, 0);
  const linearTotal = ambientes.reduce((soma, a) => soma + a.metragemLinear, 0);
  const quantidadePlacas = areaTotal > 0
    ? Math.ceil((areaTotal * (1 + MARGEM_PERDA)) / AREA_PLACA_M2)
    : 0;

  const precoM2 = Number(document.getElementById("preco-m2").value) || 0;
  const precoLinear = Number(document.getElementById("preco-linear").value) || 0;
  const custosExtras = Number(document.getElementById("custos-extras").value) || 0;

  const valorArea = areaTotal * precoM2;
  const valorLinear = linearTotal * precoLinear;
  const valorTotal = valorArea + valorLinear + custosExtras;

  document.getElementById("resumo-tabela").innerHTML = ambientes
    .map(
      (a) => `
    <tr>
      <td>${a.nome || "(sem nome)"}</td>
      <td>${a.largura.toFixed(2)} m</td>
      <td>${a.comprimento.toFixed(2)} m</td>
      <td>${a.areaM2.toFixed(2)} m²</td>
      <td>${a.metragemLinear.toFixed(2)} m</td>
    </tr>`,
    )
    .join("");

  document.getElementById("resumo-area-total").textContent = `${areaTotal.toFixed(2)} m²`;
  document.getElementById("resumo-linear-total").textContent = `${linearTotal.toFixed(2)} m`;
  document.getElementById("resumo-placas").textContent = quantidadePlacas;
  document.getElementById("resumo-valor-area").textContent = formatarMoeda(valorArea);
  document.getElementById("resumo-valor-linear").textContent = formatarMoeda(valorLinear);
  document.getElementById("resumo-custos-extras").textContent = formatarMoeda(custosExtras);
  document.getElementById("resumo-valor-total").textContent = formatarMoeda(valorTotal);
}

["preco-m2", "preco-linear", "custos-extras"].forEach((id) => {
  document.getElementById(id).addEventListener("input", atualizarResumo);
});

document.getElementById("btn-add-ambiente").addEventListener("click", adicionarAmbiente);

document.getElementById("btn-salvar").addEventListener("click", async () => {
  const ambientes = lerAmbientes();
  limparErro(mensagemEl);

  if (!ambientes.length) {
    exibirErro(mensagemEl, { message: "Adicione ao menos um ambiente." });
    return;
  }

  if (ambientes.some((a) => !a.nome || a.largura <= 0 || a.comprimento <= 0)) {
    exibirErro(mensagemEl, {
      message: "Preencha nome, largura e comprimento de todos os ambientes.",
    });
    return;
  }

  const dados = {
    clienteId,
    precoM2: Number(document.getElementById("preco-m2").value) || 0,
    precoLinear: Number(document.getElementById("preco-linear").value) || 0,
    custosExtras: Number(document.getElementById("custos-extras").value) || 0,
    ambientes: ambientes.map(({ nome, largura, comprimento }) => ({
      nome,
      largura,
      comprimento,
    })),
  };

  const botao = document.getElementById("btn-salvar");
  botao.disabled = true;

  try {
    await criarOrcamento(dados);
    location.href = `cliente.html?id=${clienteId}`;
  } catch (erro) {
    exibirErro(mensagemEl, erro);
  } finally {
    botao.disabled = false;
  }
});

adicionarAmbiente();

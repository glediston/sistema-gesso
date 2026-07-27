import { atualizarCliente, buscarCliente, listarOrcamentosDoCliente } from "./api.js";
import { exigirAutenticacao } from "./auth.js";
import { abrirModalCliente } from "./cliente-modal.js";
import { renderHeader } from "./header.js";
import { badgeStatus, exibirErro, formatarData, formatarMoeda } from "./util.js";

exigirAutenticacao();
renderHeader("clientes");

const params = new URLSearchParams(location.search);
const clienteId = params.get("id");

const mensagemEl = document.getElementById("mensagem");
const listaEl = document.getElementById("lista-orcamentos");

if (!clienteId) {
  location.href = "clientes.html";
}

document.getElementById("btn-novo-orcamento").addEventListener("click", () => {
  location.href = `orcamento-novo.html?clienteId=${clienteId}`;
});

let clienteAtual = null;

document.getElementById("btn-editar-cliente").addEventListener("click", () => {
  abrirModalCliente({
    titulo: "Editar Cliente",
    dadosIniciais: clienteAtual,
    aoSalvar: async (dados) => {
      clienteAtual = await atualizarCliente(clienteId, dados);
      renderizarDadosCliente();
    },
  });
});

function renderizarDadosCliente() {
  document.getElementById("cliente-nome").textContent = clienteAtual.nome;
  document.getElementById("cliente-telefone").textContent = clienteAtual.telefone;
  document.getElementById("cliente-endereco").textContent = clienteAtual.endereco || "—";
}

async function carregar() {
  try {
    const [cliente, orcamentos] = await Promise.all([
      buscarCliente(clienteId),
      listarOrcamentosDoCliente(clienteId),
    ]);

    clienteAtual = cliente;
    renderizarDadosCliente();
    renderizarOrcamentos(orcamentos);
  } catch (erro) {
    exibirErro(mensagemEl, erro);
  }
}

function renderizarOrcamentos(orcamentos) {
  if (!orcamentos.length) {
    listaEl.innerHTML = `<p class="lista-vazia">Nenhum orçamento cadastrado ainda.</p>`;
    return;
  }

  listaEl.innerHTML = orcamentos
    .map(
      (orcamento) => `
    <div class="lista-item" data-id="${orcamento.id}">
      <div>
        <div class="lista-item__titulo">${formatarMoeda(orcamento.valorTotal)}</div>
        <div class="lista-item__sub">${formatarData(orcamento.createdAt)}</div>
      </div>
      ${badgeStatus(orcamento.status)}
    </div>`,
    )
    .join("");

  listaEl.querySelectorAll(".lista-item").forEach((item) => {
    item.addEventListener("click", () => {
      location.href = `orcamento.html?id=${item.dataset.id}`;
    });
  });
}

carregar();

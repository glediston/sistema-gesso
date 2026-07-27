import { criarCliente, listarClientes } from "./api.js";
import { exigirAutenticacao } from "./auth.js";
import { abrirModalCliente } from "./cliente-modal.js";
import { renderHeader } from "./header.js";
import { exibirErro, limparErro } from "./util.js";

exigirAutenticacao();
renderHeader("clientes");

const listaEl = document.getElementById("lista-clientes");
const buscaInput = document.getElementById("busca-nome");
const mensagemEl = document.getElementById("mensagem");

let timeoutBusca = null;

async function carregarClientes(nome) {
  try {
    const clientes = await listarClientes(nome);
    renderizarClientes(clientes);
  } catch (erro) {
    exibirErro(mensagemEl, erro);
  }
}

function renderizarClientes(clientes) {
  limparErro(mensagemEl);

  if (!clientes.length) {
    listaEl.innerHTML = `<p class="lista-vazia">Nenhum cliente encontrado.</p>`;
    return;
  }

  listaEl.innerHTML = clientes
    .map(
      (cliente) => `
    <div class="lista-item" data-id="${cliente.id}">
      <div>
        <div class="lista-item__titulo">${cliente.nome}</div>
        <div class="lista-item__sub">${cliente.telefone}</div>
      </div>
    </div>`,
    )
    .join("");

  listaEl.querySelectorAll(".lista-item").forEach((item) => {
    item.addEventListener("click", () => {
      location.href = `cliente.html?id=${item.dataset.id}`;
    });
  });
}

buscaInput.addEventListener("input", () => {
  clearTimeout(timeoutBusca);
  timeoutBusca = setTimeout(() => carregarClientes(buscaInput.value.trim()), 300);
});

document.getElementById("btn-novo-cliente").addEventListener("click", () => {
  abrirModalCliente({
    titulo: "Novo Cliente",
    aoSalvar: async (dados) => {
      await criarCliente(dados);
      await carregarClientes(buscaInput.value.trim());
    },
  });
});

carregarClientes();

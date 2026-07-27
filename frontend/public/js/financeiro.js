import { buscarFinanceiro } from "./api.js";
import { exigirAutenticacao } from "./auth.js";
import { renderHeader } from "./header.js";
import { exibirErro, formatarData, formatarMoeda, limparErro } from "./util.js";

exigirAutenticacao();
renderHeader("financeiro");

const mensagemEl = document.getElementById("mensagem");
const periodoInput = document.getElementById("periodo");

const agora = new Date();
periodoInput.value = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}`;

async function carregar() {
  const [ano, mes] = periodoInput.value.split("-").map(Number);
  limparErro(mensagemEl);

  try {
    const dados = await buscarFinanceiro(mes, ano);

    document.getElementById("total-ganho").textContent = formatarMoeda(dados.totalGanho);
    document.getElementById("contagem-pendente").textContent = dados.contagemPorStatus?.PENDENTE ?? 0;
    document.getElementById("contagem-aprovado").textContent = dados.contagemPorStatus?.APROVADO ?? 0;
    document.getElementById("contagem-concluido").textContent = dados.contagemPorStatus?.CONCLUIDO ?? 0;
    document.getElementById("contagem-recusado").textContent = dados.contagemPorStatus?.RECUSADO ?? 0;

    renderizarConcluidos(dados.ultimosConcluidos ?? []);
  } catch (erro) {
    exibirErro(mensagemEl, erro);
  }
}

function renderizarConcluidos(lista) {
  const container = document.getElementById("lista-concluidos");

  if (!lista.length) {
    container.innerHTML = `<p class="lista-vazia">Nenhum orçamento concluído no período.</p>`;
    return;
  }

  container.innerHTML = lista
    .map(
      (orcamento) => `
    <div class="lista-item" data-id="${orcamento.id}">
      <div>
        <div class="lista-item__titulo">${orcamento.cliente?.nome ?? "Cliente"}</div>
        <div class="lista-item__sub">${formatarData(orcamento.dataConclusao ?? orcamento.updatedAt)}</div>
      </div>
      <strong>${formatarMoeda(orcamento.valorTotal)}</strong>
    </div>`,
    )
    .join("");

  container.querySelectorAll(".lista-item").forEach((item) => {
    item.addEventListener("click", () => {
      location.href = `orcamento.html?id=${item.dataset.id}`;
    });
  });
}

periodoInput.addEventListener("change", carregar);

carregar();

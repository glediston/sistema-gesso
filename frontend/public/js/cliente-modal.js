import { aplicarMascaraTelefone, exibirErro, limparErro } from "./util.js";

let elementos = null;

function garantirModal() {
  if (elementos) return elementos;

  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.hidden = true;
  backdrop.innerHTML = `
    <div class="modal">
      <h2 id="cliente-modal-titulo">Cliente</h2>
      <form id="cliente-modal-form">
        <label for="cliente-modal-nome">Nome</label>
        <input type="text" id="cliente-modal-nome" required />

        <label for="cliente-modal-telefone">Telefone</label>
        <input type="tel" id="cliente-modal-telefone" placeholder="(77) 99928-4982" required />

        <label for="cliente-modal-endereco">Endereço</label>
        <input type="text" id="cliente-modal-endereco" />

        <p id="cliente-modal-mensagem" class="mensagem" hidden></p>

        <div class="form-actions">
          <button type="submit" class="btn">Salvar</button>
          <button type="button" id="cliente-modal-cancelar" class="btn btn--secondary">Cancelar</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(backdrop);

  elementos = {
    backdrop,
    titulo: backdrop.querySelector("#cliente-modal-titulo"),
    form: backdrop.querySelector("#cliente-modal-form"),
    nome: backdrop.querySelector("#cliente-modal-nome"),
    telefone: backdrop.querySelector("#cliente-modal-telefone"),
    endereco: backdrop.querySelector("#cliente-modal-endereco"),
    mensagem: backdrop.querySelector("#cliente-modal-mensagem"),
    cancelar: backdrop.querySelector("#cliente-modal-cancelar"),
  };

  aplicarMascaraTelefone(elementos.telefone);
  elementos.cancelar.addEventListener("click", () => {
    elementos.backdrop.hidden = true;
  });

  return elementos;
}

export function abrirModalCliente({ titulo, dadosIniciais = {}, aoSalvar }) {
  const el = garantirModal();

  el.titulo.textContent = titulo;
  el.nome.value = dadosIniciais.nome ?? "";
  el.telefone.value = dadosIniciais.telefone ?? "";
  el.endereco.value = dadosIniciais.endereco ?? "";
  limparErro(el.mensagem);
  el.backdrop.hidden = false;

  el.form.onsubmit = async (event) => {
    event.preventDefault();

    const dados = {
      nome: el.nome.value,
      telefone: el.telefone.value,
      endereco: el.endereco.value || null,
    };

    const botao = el.form.querySelector("button[type=submit]");
    botao.disabled = true;
    limparErro(el.mensagem);

    try {
      await aoSalvar(dados);
      el.backdrop.hidden = true;
    } catch (erro) {
      exibirErro(el.mensagem, erro);
    } finally {
      botao.disabled = false;
    }
  };
}

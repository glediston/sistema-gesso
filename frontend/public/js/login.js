import { login } from "./api.js";
import { salvarToken, tokenValido } from "./auth.js";
import { exibirErro, limparErro } from "./util.js";

if (tokenValido()) {
  location.href = "clientes.html";
}

const form = document.getElementById("login-form");
const mensagem = document.getElementById("mensagem");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const loginValor = document.getElementById("login").value;
  const senha = document.getElementById("senha").value;
  const botao = form.querySelector("button");

  botao.disabled = true;
  limparErro(mensagem);

  try {
    const { token } = await login(loginValor, senha);
    salvarToken(token);
    location.href = "clientes.html";
  } catch (erro) {
    exibirErro(mensagem, erro);
  } finally {
    botao.disabled = false;
  }
});

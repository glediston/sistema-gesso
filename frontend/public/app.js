const API_URL = "http://localhost:3000";

const form = document.getElementById("login-form");
const mensagem = document.getElementById("mensagem");

function mostrarMensagem(texto, tipo) {
  mensagem.textContent = texto;
  mensagem.className = `mensagem ${tipo}`;
  mensagem.hidden = false;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const login = document.getElementById("login").value;
  const senha = document.getElementById("senha").value;
  const botao = form.querySelector("button");

  botao.disabled = true;
  mensagem.hidden = true;

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, senha }),
    });

    const dados = await response.json();

    if (!response.ok) {
      const erro = dados.error;
      const texto = typeof erro === "string" ? erro : "Credenciais inválidas";
      mostrarMensagem(texto, "erro");
      return;
    }

    localStorage.setItem("token", dados.token);
    mostrarMensagem("Login realizado com sucesso!", "sucesso");
  } catch (err) {
    mostrarMensagem("Erro ao conectar com o servidor.", "erro");
  } finally {
    botao.disabled = false;
  }
});

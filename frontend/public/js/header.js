import { logout } from "./auth.js";

export function renderHeader(paginaAtiva) {
  const container = document.getElementById("app-header");
  if (!container) return;

  const links = [
    { href: "clientes.html", label: "Clientes", chave: "clientes" },
    { href: "financeiro.html", label: "Financeiro", chave: "financeiro" },
  ];

  container.innerHTML = `
    <div class="app-header__inner">
      <span class="app-header__brand">Sistema Gesso</span>
      <nav class="app-header__nav">
        ${links
          .map(
            (link) => `
          <a href="${link.href}" class="${link.chave === paginaAtiva ? "is-active" : ""}">
            ${link.label}
          </a>`,
          )
          .join("")}
        <button type="button" id="btn-sair" class="app-header__logout">Sair</button>
      </nav>
    </div>
  `;

  document.getElementById("btn-sair").addEventListener("click", logout);
}

// Troque esta constante na hora de subir pra produção.
export const API_BASE_URL = "http://localhost:3000";

function getToken() {
  return localStorage.getItem("token");
}

class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { ...(options.headers || {}) };

  if (!(options.body instanceof Blob) && options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (response.status === 401) {
    localStorage.removeItem("token");
    if (!location.pathname.endsWith("index.html") && location.pathname !== "/") {
      location.href = "index.html";
    }
    throw new ApiError("Sessão expirada", 401, null);
  }

  if (!response.ok) {
    let payload = null;
    try {
      payload = await response.json();
    } catch {
      // resposta sem corpo JSON
    }
    const mensagem = payload?.error ?? `Erro na requisição (${response.status})`;
    throw new ApiError(
      typeof mensagem === "string" ? mensagem : "Erro na requisição",
      response.status,
      payload,
    );
  }

  return response;
}

async function requestJson(path, options = {}) {
  const response = await request(path, options);
  if (response.status === 204) return null;
  return response.json();
}

// --- Autenticação ---

export function login(login, senha) {
  return requestJson("/login", {
    method: "POST",
    body: JSON.stringify({ login, senha }),
  });
}

// --- Clientes ---

export function listarClientes(nome) {
  const query = nome ? `?nome=${encodeURIComponent(nome)}` : "";
  return requestJson(`/clientes${query}`);
}

export function buscarCliente(id) {
  return requestJson(`/clientes/${id}`);
}

export function criarCliente({ nome, telefone, endereco }) {
  return requestJson("/clientes", {
    method: "POST",
    body: JSON.stringify({ nome, telefone, endereco }),
  });
}

export function atualizarCliente(id, { nome, telefone, endereco }) {
  return requestJson(`/clientes/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ nome, telefone, endereco }),
  });
}

// --- Orçamentos ---

export function listarOrcamentosDoCliente(clienteId) {
  return requestJson(`/clientes/${clienteId}/orcamentos`);
}

export function buscarOrcamento(id) {
  return requestJson(`/orcamentos/${id}`);
}

export function criarOrcamento(dados) {
  return requestJson("/orcamentos", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export function atualizarStatusOrcamento(id, status) {
  return requestJson(`/orcamentos/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function excluirOrcamento(id) {
  return requestJson(`/orcamentos/${id}`, { method: "DELETE" });
}

export function urlPdfOrcamento(id) {
  return `${API_BASE_URL}/orcamentos/${id}/pdf`;
}

export async function baixarPdfOrcamento(id) {
  const response = await request(`/orcamentos/${id}/pdf`);
  return response.blob();
}

// --- Financeiro ---

export function buscarFinanceiro(mes, ano) {
  return requestJson(`/financeiro?mes=${mes}&ano=${ano}`);
}

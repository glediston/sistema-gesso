export function getToken() {
  return localStorage.getItem("token");
}

export function salvarToken(token) {
  localStorage.setItem("token", token);
}

// Checagem simples de formato/expiração do JWT (sem validar assinatura —
// isso é responsabilidade do backend em cada requisição).
export function tokenValido() {
  const token = getToken();
  if (!token) return false;

  const partes = token.split(".");
  if (partes.length !== 3) return false;

  try {
    const payload = JSON.parse(atob(partes[1]));
    if (!payload.exp) return true;
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function exigirAutenticacao() {
  if (!tokenValido()) {
    localStorage.removeItem("token");
    location.href = "index.html";
  }
}

export function logout() {
  localStorage.removeItem("token");
  location.href = "index.html";
}

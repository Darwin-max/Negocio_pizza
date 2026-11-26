export const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export function apiUrl(path) {
  const ruta = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${ruta}`;
}

export function resolverImagen(url) {
  const valor = String(url || "").trim();

  if (!valor) return "";
  if (/^(?:https?:)?\/\//i.test(valor)) return valor;
  if (/^(?:data|blob):/i.test(valor)) return valor;
  if (valor.startsWith("/")) return apiUrl(valor);

  return valor;
}

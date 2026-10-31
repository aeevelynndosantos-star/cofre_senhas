/* Funções utilitárias */

function nowISO() {
  return new Date().toISOString().replace(/\.\d+Z$/, "Z");
}

function toB64(buf) {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function fromB64(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function escapeAttr(s) { return escapeHtml(s); }
function h(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

function esperar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function reduzMovimento() {
  return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
}

async function copiarTexto(texto) {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch (e) {
    try {
      const ta = document.createElement("textarea");
      ta.value = texto;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      return true;
    } catch (e2) {
      return false;
    }
  }
}

function toast(msg, tipo = "ok") {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.dataset.tipo = tipo;
  t.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove("show"), 2400);
}

function pintarForca(barra, senha) {
  const score = forcaSenha(senha);
  barra.style.width = (score / 5) * 100 + "%";
  barra.style.background = score <= 2 ? "var(--danger)" : score <= 3 ? "var(--warn)" : "var(--ink)";
}

function mostrarErro(el, msg) { el.textContent = msg; el.hidden = false; }
function limparErro(el) { el.textContent = ""; el.hidden = true; }

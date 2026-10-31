/* gatos.js — cantinho animado
   A imagem do cantinho troca sozinha pelo CSS (css/gatos.css,
   conforme o data-theme do <html>). Este arquivo só reinicia a
   animação de entrada quando a cor muda (ou quando a abertura
   termina), sem precisar mexer no tema.js. */
const MASCOTE_CHAVE = "cofre_mascote";
const MASCOTE_CANTOS = [
  { id: "se", nome: "Superior esquerdo", seta: "↖" },
  { id: "sd", nome: "Superior direito", seta: "↗" },
  { id: "ie", nome: "Inferior esquerdo", seta: "↙" },
  { id: "id", nome: "Inferior direito", seta: "↘" },
];

let mascote = { pos: "sd", fx: 0, fy: 0 };

function lerMascote() {
  try {
    const bruto = JSON.parse(localStorage.getItem(MASCOTE_CHAVE));
    if (bruto && bruto.pos === "livre" && isFinite(bruto.fx) && isFinite(bruto.fy)) {
      return { pos: "livre", fx: Math.min(1, Math.max(0, bruto.fx)), fy: Math.min(1, Math.max(0, bruto.fy)) };
    }
    if (bruto && MASCOTE_CANTOS.some(c => c.id === bruto.pos)) {
      return { pos: bruto.pos, fx: 0, fy: 0 };
    }
  } catch (e) {}
  return { pos: "sd", fx: 0, fy: 0 };
}

function salvarMascote() {
  try { localStorage.setItem(MASCOTE_CHAVE, JSON.stringify(mascote)); } catch (e) {}
}

function aplicarMascote() {
  const c = document.getElementById("canto");
  if (!c) return;
  c.setAttribute("data-pos", mascote.pos);
  if (mascote.pos === "livre") {
    const larg = c.offsetWidth;
    const alt = c.offsetHeight;
    c.style.left = Math.round(mascote.fx * Math.max(0, window.innerWidth - larg)) + "px";
    c.style.top = Math.round(mascote.fy * Math.max(0, window.innerHeight - alt)) + "px";
  } else {
    c.style.left = "";
    c.style.top = "";
  }
  document.querySelectorAll("[data-canto]").forEach(b => {
    b.setAttribute("aria-pressed", String(b.dataset.canto === mascote.pos));
  });
}

function ligarArrasteDoMascote() {
  const c = document.getElementById("canto");
  if (!c) return;
  let arrastando = false;
  let moveu = false;
  let dx = 0;
  let dy = 0;

  c.addEventListener("pointerdown", (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    arrastando = true;
    moveu = false;
    c.classList.add("arrastando");
    const r = c.getBoundingClientRect();
    dx = e.clientX - r.left;
    dy = e.clientY - r.top;
    c.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  c.addEventListener("pointermove", (e) => {
    if (!arrastando) return;
    moveu = true;
    const maxX = Math.max(0, window.innerWidth - c.offsetWidth);
    const maxY = Math.max(0, window.innerHeight - c.offsetHeight);
    const x = Math.min(maxX, Math.max(0, e.clientX - dx));
    const y = Math.min(maxY, Math.max(0, e.clientY - dy));
    mascote = { pos: "livre", fx: maxX ? x / maxX : 0, fy: maxY ? y / maxY : 0 };
    c.setAttribute("data-pos", "livre");
    c.style.left = x + "px";
    c.style.top = y + "px";
    document.querySelectorAll("[data-canto]").forEach(b => b.setAttribute("aria-pressed", "false"));
  });

  const soltar = (e) => {
    if (!arrastando) return;
    arrastando = false;
    c.classList.remove("arrastando");
    try { c.releasePointerCapture(e.pointerId); } catch (err) {}
    if (moveu) salvarMascote();
  };
  c.addEventListener("pointerup", soltar);
  c.addEventListener("pointercancel", soltar);
}

function htmlPosicoesDoMascote() {
  const botoes = MASCOTE_CANTOS.map(c =>
    `<button type="button" data-canto="${c.id}" title="${c.nome}" aria-label="${c.nome}" aria-pressed="${c.id === mascote.pos}">${c.seta}</button>`
  ).join("");
  return `<div class="posicoes" role="group" aria-label="Posição do gatinho">${botoes}</div>`;
}

function ligarPosicoesDoMascote(raiz) {
  raiz.querySelectorAll("[data-canto]").forEach(b => {
    b.onclick = () => {
      mascote = { pos: b.dataset.canto, fx: 0, fy: 0 };
      salvarMascote();
      aplicarMascote();
    };
  });
}

function iniciarMascote() {
  const c = document.getElementById("canto");
  if (!c) return;
  c.title = "Arraste o gatinho";
  mascote = lerMascote();
  ligarArrasteDoMascote();
  window.addEventListener("resize", aplicarMascote);
  aplicarMascote();
}

function reiniciarCanto() {
  const c = document.getElementById("canto");
  if (!c) return;
  c.classList.remove("trocando");
  void c.offsetWidth;
  c.classList.add("trocando");
}

let ultimoTemaDoCanto = null;

function observarTemaDoCanto() {
  const raiz = document.documentElement;
  const checar = () => {
    const tema = raiz.getAttribute("data-theme");
    if (tema === ultimoTemaDoCanto) return;
    ultimoTemaDoCanto = tema;
    reiniciarCanto();
    aplicarMascote();
  };
  new MutationObserver(checar).observe(raiz, { attributes: true, attributeFilter: ["data-theme"] });
  checar();
}

iniciarMascote();
observarTemaDoCanto();



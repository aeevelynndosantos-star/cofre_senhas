/* escolha da cor do cofre a cor fica guardada dentro do cofre.*/

const TEMAS = [
  { id: "verde", nome: "Verde", a: "#07140c", b: "#5dff93" },
  { id: "clara", nome: "Clara", a: "#c5cfa4", b: "#1c2210" },
  { id: "preto", nome: "Preto", a: "#0b0b0b", b: "#f0f0f0" },
  { id: "rosa",  nome: "Rosa",  a: "#ffe6f0", b: "#ff5c9d" },
];

function aplicarTema(id) {
  const valido = TEMAS_VALIDOS.includes(id) ? id : "verde";
  document.documentElement.setAttribute("data-theme", valido);
}

function escolherTema(id) {
  if (state.view !== "app" || !state.sessao) return;  
  if (!TEMAS_VALIDOS.includes(id)) return;
  state.vault.prefs.tema = id;
  aplicarTema(id);
  aposMudancaPrefs();
}

// grupo em pixel, um por tema
function htmlSeletorDeCor() {
  const atual = state.vault.prefs.tema;
  const itens = TEMAS.map(t => `
    <label class="swatch" title="${t.nome}">
      <input type="radio" name="tema" value="${t.id}" ${t.id === atual ? "checked" : ""}>
      <span class="sw" style="--a:${t.a};--b:${t.b}"></span>
      <span class="sw-nome">${t.nome}</span>
    </label>`).join("");
  return `<div class="swatches" role="radiogroup" aria-label="Cor do tema">${itens}</div>`;
}

function ligarSeletorDeCor(raiz) {
  raiz.querySelectorAll('input[name="tema"]').forEach(r => {
    r.onchange = () => escolherTema(r.value);
  });
}

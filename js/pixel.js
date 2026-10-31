/* fonte bitmap 5x7 Fonte e ícones são desenhados em código*/

const FONTE_PIXEL = {
  A: ".###./#...#/#...#/#####/#...#/#...#/#...#",
  B: "####./#...#/#...#/####./#...#/#...#/####.",
  C: ".###./#...#/#..../#..../#..../#...#/.###.",
  D: "####./#...#/#...#/#...#/#...#/#...#/####.",
  E: "#####/#..../#..../####./#..../#..../#####",
  F: "#####/#..../#..../####./#..../#..../#....",
  G: ".###./#...#/#..../#.###/#...#/#...#/.####",
  H: "#...#/#...#/#...#/#####/#...#/#...#/#...#",
  I: ".###./..#../..#../..#../..#../..#../.###.",
  J: "..###/...#./...#./...#./...#./#..#./.##..",
  K: "#...#/#..#./#.#../##.../#.#../#..#./#...#",
  L: "#..../#..../#..../#..../#..../#..../#####",
  M: "#...#/##.##/#.#.#/#.#.#/#...#/#...#/#...#",
  N: "#...#/##..#/#.#.#/#..##/#...#/#...#/#...#",
  O: ".###./#...#/#...#/#...#/#...#/#...#/.###.",
  P: "####./#...#/#...#/####./#..../#..../#....",
  Q: ".###./#...#/#...#/#...#/#.#.#/#..#./.##.#",
  R: "####./#...#/#...#/####./#.#../#..#./#...#",
  S: ".####/#..../#..../.###./....#/....#/####.",
  T: "#####/..#../..#../..#../..#../..#../..#..",
  U: "#...#/#...#/#...#/#...#/#...#/#...#/.###.",
  V: "#...#/#...#/#...#/#...#/#...#/.#.#./..#..",
  W: "#...#/#...#/#...#/#.#.#/#.#.#/##.##/#...#",
  X: "#...#/#...#/.#.#./..#../.#.#./#...#/#...#",
  Y: "#...#/#...#/.#.#./..#../..#../..#../..#..",
  Z: "#####/....#/...#./..#../.#.../#..../#####",
  0: ".###./#...#/#..##/#.#.#/##..#/#...#/.###.",
  1: "..#../.##../..#../..#../..#../..#../.###.",
  2: ".###./#...#/....#/...#./..#../.#.../#####",
  3: "####./....#/....#/.###./....#/....#/####.",
  4: "...#./..##./.#.#./#..#./#####/...#./...#.",
  5: "#####/#..../####./....#/....#/#...#/.###.",
  6: ".###./#..../#..../####./#...#/#...#/.###.",
  7: "#####/....#/...#./..#../.#.../.#.../.#...",
  8: ".###./#...#/#...#/.###./#...#/#...#/.###.",
  9: ".###./#...#/#...#/.####/....#/....#/.###.",
  "!": "..#../..#../..#../..#../..#../...../..#..",
  ".": "...../...../...../...../...../...../..#..",
  "-": "...../...../...../.###./...../...../.....",
  ":": "...../..#../...../...../..#../...../.....",
  "_": "...../...../...../...../...../...../#####",
  "?": ".###./#...#/....#/...#./..#../...../..#..",
};

function pixelText(texto, px = 4, cls = "") {
  const limpo = String(texto).normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();
  let x = 0;
  let d = "";
  for (const ch of limpo) {
    if (ch === " ") { x += 4; continue; }
    const glifo = FONTE_PIXEL[ch];
    if (glifo) {
      const linhas = glifo.split("/");
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 5; c++) {
          if (linhas[r][c] === "#") d += `M${x + c} ${r}h1v1h-1z`;
        }
      }
    }
    x += 6;
  }
  const w = Math.max(x, 1);
  return `<svg class="pixel-text ${cls}" width="${w * px}" height="${8 * px}" viewBox="0 0 ${w} 8" role="img" aria-label="${escapeAttr(texto)}">` +
    `<path class="pt-shadow" transform="translate(1 1)" d="${d}"></path><path class="pt-main" d="${d}"></path></svg>`;
}

  function bitmapSvg(linhas, px = 3, cls = "") {
  let cheio = "";
  let furo = "";
  linhas.forEach((linha, y) => {
    [...linha].forEach((c, x) => {
      if (c === "#") cheio += `M${x} ${y}h1v1h-1z`;
      else if (c === "o") furo += `M${x} ${y}h1v1h-1z`;
    });
  });
  const w = linhas[0].length;
  const alt = linhas.length;
  return `<svg class="bmp ${cls}" width="${w * px}" height="${alt * px}" viewBox="0 0 ${w} ${alt}" aria-hidden="true" focusable="false">` +
    `<path fill="currentColor" d="${cheio}"></path>${furo ? `<path class="hole" d="${furo}"></path>` : ""}</svg>`;
}

const ICONE_USUARIO = [
  "...###...",
  "..#####..",
  "..#####..",
  "...###...",
  ".........",
  ".#######.",
  "#########",
  "#########",
];
const ICONE_CADEADO = [
  "..#####..",
  ".##...##.",
  ".##...##.",
  "#########",
  "#########",
  "####.####",
  "####.####",
  "#########",
  "#########",
];
const ICONE_PASTA = [
  "#####...........",
  "################",
  "#oooooooooooooo#",
  "################",
  "################",
  "################",
  "################",
  "################",
  "################",
  "################",
];
const ICONE_LIXEIRA = [
  "...#####...",
  "###########",
  ".#########.",
  ".#o#o#o#o#.",
  ".#o#o#o#o#.",
  ".#o#o#o#o#.",
  ".#o#o#o#o#.",
  ".#o#o#o#o#.",
  ".#########.",
];
const ICONE_POWER = [
  ".....#.....",
  ".....#.....",
  "..#..#..#..",
  ".#...#...#.",
  "#....#....#",
  "#.........#",
  "#.........#",
  ".#.......#.",
  "..#.....#..",
  "...#####...",
];

// moldura 
function monitor(inner, { foot = "", cls = "", tela = "" } = {}) {
  return `<div class="monitor ${cls}"><div class="screen ${tela}">${inner}</div>` +
    `<div class="mon-foot">${foot || '<span class="led" title="ligado"></span>'}</div></div>`;
}

// moldura "janela" COFRE.Exe
function janelaExe(inner, { cls = "", ctrl = "" } = {}) {
  const botoes = ctrl || `<span class="exe-ctrl" aria-hidden="true"><i>_</i><i>□</i><i>×</i></span>`;
  return `<div class="janela-exe ${cls}">` +
    `<div class="exe-bar"><span class="exe-title">COFRE.EXE</span>${botoes}</div>` +
    `<div class="exe-body">${inner}</div></div>`;
}

// gatinho da tela de entrada
function catStage() {
  return `
    <div class="cat-stage" aria-live="polite">
      <div class="cat">
        <div class="cat-sleep" role="img" aria-label="Gatinho dormindo">
          <i class="cm cm-dormindo"></i><i class="cm cm-z z1"></i><i class="cm cm-z z2"></i><i class="cm cm-z z3"></i>
        </div>
        <div class="cat-awake" role="img" aria-label="Gatinho trabalhando no notebook">
          <i class="cm cm-notebook"></i>
        </div>
      </div>
      <div class="caption">
        <span class="cap-sleep">esperando algo acontecer...</span>
        <span class="cap-awake">acordei! pode continuar :)</span>
      </div>
    </div>`;
}

let catTimer = null;

function wakeCat() {
  const c = document.querySelector(".cat-stage");
  if (!c) return;
  c.classList.add("awake");
  clearTimeout(catTimer);
  catTimer = setTimeout(sleepCat, 9000); // volta a dormir se a pessoa parar
}

function sleepCat() {
  const c = document.querySelector(".cat-stage");
  if (c) c.classList.remove("awake");
}

function digitouNaEntrada(e) {
  if (state.view === "app") return;
  if (e.type === "keydown") {
    const ignorar = ["Tab", "Shift", "Control", "Alt", "Meta", "CapsLock", "Escape"];
    if (ignorar.includes(e.key)) return;
  }
  wakeCat();
}
document.addEventListener("keydown", digitouNaEntrada);
document.addEventListener("input", digitouNaEntrada);

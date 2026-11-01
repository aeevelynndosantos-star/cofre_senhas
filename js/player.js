/* player de música com os MP3 da pasta musicas/ 
obs: Foi utilizado Y2mate para baixar as músicas */

const PASTA = "musicas/musicas/";

const MUSICAS = [
  { nome: "Avicii - Waiting For Love",      arquivo: PASTA + "avicii-waiting-for-love.mp3" },
  { nome: "Post Malone - Sunflower",        arquivo: PASTA + "post-malone-sunflower.mp3" },
  { nome: "Coldplay - A Sky Full Of Stars", arquivo: PASTA + "coldplay-a-sky-full-of-stars.mp3" },
  { nome: "Alok - Never Let Me Go",         arquivo: PASTA + "alok-never-let-me-go.mp3" },
  { nome: "Alok - Hear Me Now",             arquivo: PASTA + "alok-hear-me-now.mp3" },
  { nome: "Rubel - Grão de Areia",          arquivo: PASTA + "rubel-grao-de-areia.mp3" },
  { nome: "Coldplay - Paradise",            arquivo: PASTA + "Coldplay-Paradise.mp3" },
  { nome: "Tiko's Groove",                  arquivo: PASTA + "TIKOS-GROOVE-feat.mp3" },
];

const PL_ICONES = {
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="5" width="3.6" height="14"/><rect x="13.4" y="5" width="3.6" height="14"/></svg>',
};

const audio = new Audio();
audio.preload = "metadata";
audio.volume = 0.6;

const player = { idx: 0, estado: "parado", carregada: -1, erro: false };
const $pl = (id) => document.getElementById(id);

function plAtualizar() {
  const p = player, m = MUSICAS[p.idx];
  $pl("pl-nome").textContent = p.erro ? "✖ arquivo não encontrado" : "♪ " + m.nome;
  $pl("pl-estado").textContent = p.estado === "tocando" ? "TOCANDO" : p.estado === "pausado" ? "PAUSADO" : "PARADO";
  $pl("pl-num").textContent = String(p.idx + 1).padStart(2, "0") + "/" + String(MUSICAS.length).padStart(2, "0");
  const pp = $pl("pl-playpause");
  pp.innerHTML = p.estado === "tocando" ? PL_ICONES.pause : PL_ICONES.play;
  pp.classList.toggle("on", p.estado === "tocando");
  pp.setAttribute("aria-label", p.estado === "tocando" ? "Pausar" : "Tocar");
  $pl("player").classList.toggle("tocando", p.estado === "tocando");
  const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
  $pl("pl-prog").style.width = p.estado === "parado" ? "0%" : Math.min(100, pct) + "%";
}

// carrega o arquivo da faixa atual
function plCarregar() {
  const p = player;
  if (p.carregada === p.idx) return;
  audio.src = MUSICAS[p.idx].arquivo;
  p.carregada = p.idx;
  p.erro = false;
}

async function plTocar() {
  const p = player;
  if (p.estado === "tocando") return;
  plCarregar();
  try {
    await audio.play();
    p.estado = "tocando";
  } catch (e) {
    
    p.estado = "parado";
  }
  plAtualizar();
}

function plPausar() {
  const p = player;
  if (p.estado !== "tocando") return;
  audio.pause();
  p.estado = "pausado";
  plAtualizar();
}

function plParar() {
  const p = player;
  if (p.estado === "parado") return;
  audio.pause();
  audio.currentTime = 0;
  p.estado = "parado";
  plAtualizar();
}

function plTrocar(delta) {
  const p = player;
  if (delta !== 0) {
    p.idx = (p.idx + delta + MUSICAS.length) % MUSICAS.length;
    p.carregada = -1;
  } else if (p.carregada === p.idx) {
    audio.currentTime = 0;
  }
  p.estado = "parado";
  plTocar();
}

audio.addEventListener("ended", () => plTrocar(1));
audio.addEventListener("error", () => {
  player.erro = true;
  player.estado = "parado";
  plAtualizar();
});

function plAberto() { return !$pl("player").hidden; }

function plSincronizarBotao() {
  const b = document.getElementById("btn-musica");
  if (b) b.setAttribute("aria-pressed", String(plAberto()));
}

function plAbrir() {
  $pl("player").hidden = false;
  document.body.classList.add("com-player");
  plTocar();
  plSincronizarBotao();
}

function plFechar() {
  plParar();
  $pl("player").hidden = true;
  document.body.classList.remove("com-player");
  plSincronizarBotao();
}

function plAlternar() { plAberto() ? plFechar() : plAbrir(); }

$pl("pl-playpause").onclick = () => (player.estado === "tocando" ? plPausar() : plTocar());
$pl("pl-prev").onclick = () => plTrocar(-1);
$pl("pl-next").onclick = () => plTrocar(1);
$pl("pl-restart").onclick = () => plTrocar(0);
$pl("pl-stop").onclick = plParar;
setInterval(() => { if (player.estado === "tocando") plAtualizar(); }, 250);
plAtualizar();

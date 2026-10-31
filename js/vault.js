/* gerador de senha*/

const MAX_HISTORICO = 20;
const TEMAS_VALIDOS = ["verde", "clara", "preto", "rosa"];
const VISOES_VALIDAS = ["pastas", "lista"];

function novoVault() {
  return { entries: {}, prefs: { tema: "verde", visao: "pastas" } };
}

function normalizarVault(v) {
  if (!v || typeof v !== "object") v = novoVault();
  if (!v.entries || typeof v.entries !== "object") v.entries = {};
  if (!v.prefs || typeof v.prefs !== "object") v.prefs = {};
  if (!TEMAS_VALIDOS.includes(v.prefs.tema)) v.prefs.tema = "verde";
  if (!VISOES_VALIDAS.includes(v.prefs.visao)) v.prefs.visao = "pastas";
  for (const e of Object.values(v.entries)) {
    if (!Array.isArray(e.historico)) e.historico = [];
  }
  return v;
}

function estadoInicial() {
  return {
    view: "entrada",  
    aba: "entrar",   
    sessao: null,     
    vault: novoVault(),
    dirty: false,      // só apenas em sessão por arquivo 
    search: "",
    modal: null,   
  };
}
let state = estadoInicial();

function temCredencial(servico) {
  return Object.prototype.hasOwnProperty.call(state.vault.entries, servico);
}

function aposMudanca() {
  if (state.sessao && state.sessao.tipo === "conta") agendarSalvar();
  else state.dirty = true;
}

//guarda o backup
function aposMudancaPrefs() {
  if (state.sessao && state.sessao.tipo === "conta") agendarSalvar();
}

function registrarHistorico(servico, acao) {
  const e = state.vault.entries[servico];
  if (!e) return;
  e.historico = e.historico || [];
  e.historico.push({ acao, quando: nowISO() });
  if (e.historico.length > MAX_HISTORICO) e.historico = e.historico.slice(-MAX_HISTORICO);
}

function adicionarCredencial(servico, usuario, senha, notas) {
  state.vault.entries[servico] = {
    usuario, senha, notas: notas || "",
    criadoEm: nowISO(), atualizadoEm: nowISO(), historico: [],
  };
  registrarHistorico(servico, "credencial criada");
  aposMudanca();
}

function editarCredencial(servico, { usuario, senha, notas }) {
  const e = state.vault.entries[servico];
  if (!e) return;
  const mudancas = [];
  if (usuario !== undefined && usuario !== e.usuario) { e.usuario = usuario; mudancas.push("usuário alterado"); }
  if (senha !== undefined && senha !== e.senha) { e.senha = senha; mudancas.push("senha alterada"); }
  if (notas !== undefined && notas !== e.notas) { e.notas = notas; mudancas.push("notas alteradas"); }
  if (mudancas.length) {
    e.atualizadoEm = nowISO();
    mudancas.forEach(m => registrarHistorico(servico, m));
    aposMudanca();
  }
}

function removerCredencial(servico) {
  delete state.vault.entries[servico];
  aposMudanca();
}

function listaFiltrada() {
  const termo = state.search.trim().toLowerCase();
  let nomes = Object.keys(state.vault.entries);
  if (termo) {
    nomes = nomes.filter(s => {
      const e = state.vault.entries[s];
      return s.toLowerCase().includes(termo) || (e.usuario || "").toLowerCase().includes(termo);
    });
  }
  return nomes.sort((a, b) => a.localeCompare(b));
}

function sorteio(max) {
  const limite = Math.floor(0x100000000 / max) * max;
  const buf = new Uint32Array(1);
  let x;
  do { crypto.getRandomValues(buf); x = buf[0]; } while (x >= limite);
  return x % max;
}

function gerarSenha(tamanho, usarSimbolos) {
  const minus = "abcdefghijklmnopqrstuvwxyz";
  const maius = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numeros = "0123456789";
  const simbolos = "!@#$%^&*()-_=+[]{};:,.<>?";
  const alfabeto = minus + maius + numeros + (usarSimbolos ? simbolos : "");
  const pick = (s) => s[sorteio(s.length)];
  const chars = [pick(minus), pick(maius), pick(numeros)];
  if (usarSimbolos) chars.push(pick(simbolos));
  while (chars.length < tamanho) chars.push(pick(alfabeto));
  for (let i = chars.length - 1; i > 0; i--) {
    const j = sorteio(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

function forcaSenha(senha) {
  let score = 0;
  if (senha.length >= 8) score++;
  if (senha.length >= 14) score++;
  if (/[a-z]/.test(senha) && /[A-Z]/.test(senha)) score++;
  if (/[0-9]/.test(senha)) score++;
  if (/[^A-Za-z0-9]/.test(senha)) score++;
  return score; // 0 a 5
}

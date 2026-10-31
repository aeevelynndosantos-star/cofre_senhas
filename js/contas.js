/*contas.js — usuários únicos, login por arquivo e backup

   COMO FUNCIONA (sem servidor):
    - Cada conta fica no localStorage deste navegador, SEMPRE cifrada
     (AES-GCM). A senha nunca é guardada: ela só gera a chave.
    - O nome de usuário é único (sem diferenciar maiúsculas): se já
     existir nesta lista, o cadastro é recusado.
    - Para saber se a senha está certa, o app tenta decifrar o cofre:
     se a senha estiver errada, a decifragem falha.
    - Backup (.json) = o mesmo cofre cifrado, para abrir em outro lugar.*/

const CHAVE_CONTAS = "cofre:contas:v1";
const FORMATO_BACKUP = "cofre-senhas-backup";
const NOMES_RESERVADOS = ["__proto__", "constructor", "prototype"];

// armazenamento local
function armazenamentoDisponivel() {
  try {
    const k = "__cofre_teste__";
    localStorage.setItem(k, "1");
    localStorage.removeItem(k);
    return true;
  } catch (e) {
    return false;
  }
}

function lerContas() {
  try {
    const c = JSON.parse(localStorage.getItem(CHAVE_CONTAS));
    return c && typeof c === "object" ? c : {};
  } catch (e) {
    return {};
  }
}

function gravarContas(contas) {
  localStorage.setItem(CHAVE_CONTAS, JSON.stringify(contas));
}

function temConta(contas, id) {
  return Object.prototype.hasOwnProperty.call(contas, id);
}

// nome do usuário
function normalizarUsuario(nome) {
  return String(nome).trim().normalize("NFC").toLowerCase();
}

  function validarUsuario(nome) {
  const id = normalizarUsuario(nome);
  if (!/^[a-z0-9._-]{3,24}$/.test(id)) {
    return "Usuário: 3 a 24 caracteres (letras sem acento, números, ponto, hífen ou _).";
  }
  if (NOMES_RESERVADOS.includes(id)) return "Escolha outro nome de usuário.";
  return "";
}

// proteção contra tentativas seguidas 
const falhasLogin = new Map();

function verificarBloqueio(id) {
  const f = falhasLogin.get(id);
  if (f && f.ate > Date.now()) {
    throw new Error(`Muitas tentativas. Aguarde ${Math.ceil((f.ate - Date.now()) / 1000)}s.`);
  }
}
function registrarFalha(id) {
  const f = falhasLogin.get(id) || { n: 0, ate: 0 };
  f.n++;
  if (f.n >= 5) { f.ate = Date.now() + 30000; f.n = 0; }
  falhasLogin.set(id, f);
}

// cadastro e login 
async function cadastrarConta(nome, senha) {
  const erro = validarUsuario(nome);
  if (erro) throw new Error(erro);
  if (senha.length < 8) throw new Error("Use pelo menos 8 caracteres na senha.");
  if (!armazenamentoDisponivel()) {
    throw new Error("Este navegador bloqueou o armazenamento local. Use o arquivo criptografado.");
  }
  const id = normalizarUsuario(nome);
  const nomeExibicao = String(nome).trim();
  const jaExiste = "Esse usuário já está em uso. Escolha outro nome.";

  if (temConta(lerContas(), id)) throw new Error(jaExiste);

  const salt = novoSalt();
  const key = await derivarChave(senha, salt);
  const vault = novoVault();
  const enc = await cifrarObjeto(key, vault);

  //verificca de tem usuário existente com o mesmo id
  const contas = lerContas();
  if (temConta(contas, id)) throw new Error(jaExiste);
  contas[id] = { usuario: nomeExibicao, salt: toB64(salt), iv: enc.iv, dados: enc.dados, criadoEm: nowISO() };
  gravarContas(contas);

  return { sessao: { tipo: "conta", id, nome: nomeExibicao, salt, key }, vault };
}

async function entrarNaConta(nome, senha) {
  const id = normalizarUsuario(nome);
  const erroGenerico = new Error("Usuário ou senha incorretos.");
  verificarBloqueio(id);

  const contas = lerContas();
  if (!temConta(contas, id)) {

    await derivarChave(senha, new Uint8Array(16));
    registrarFalha(id);
    throw erroGenerico;
  }

  const conta = contas[id];
  let salt, key, vault;
  try {
    salt = fromB64(conta.salt);
    key = await derivarChave(senha, salt);
    vault = await decifrarObjeto(key, conta.iv, conta.dados);
  } catch (e) {
    registrarFalha(id);
    throw erroGenerico;
  }
  falhasLogin.delete(id);
  return { sessao: { tipo: "conta", id, nome: conta.usuario, salt, key }, vault: normalizarVault(vault) };
}

async function salvarContaAtual() {
  const s = state.sessao;
  if (!s || s.tipo !== "conta") return;
  const enc = await cifrarObjeto(s.key, state.vault);
  const contas = lerContas();
  if (!temConta(contas, s.id)) return;
  contas[s.id].iv = enc.iv;
  contas[s.id].dados = enc.dados;
  contas[s.id].atualizadoEm = nowISO();
  gravarContas(contas);
}

let filaSalvar = Promise.resolve();
function agendarSalvar() {
  filaSalvar = filaSalvar
    .then(salvarContaAtual)
    .catch(() => toast("Não foi possível salvar neste navegador. Exporte um backup.", "erro"));
}

// entrar com arquivo criptografado e senha 
async function abrirBackup(payload, senha) {
  if (!payload || payload.formato !== FORMATO_BACKUP) {
    throw new Error("Arquivo não é um backup válido deste app.");
  }
  let salt, key, vault;
  try {
    salt = fromB64(payload.salt);
    key = await derivarChave(senha, salt);
    vault = await decifrarObjeto(key, payload.iv, payload.dados);
  } catch (e) {
    throw new Error("Senha incorreta ou arquivo corrompido.");
  }
  return { sessao: { tipo: "arquivo", id: null, nome: "arquivo", salt, key }, vault: normalizarVault(vault) };
}

// cofre com arquivo 
async function criarCofreEmArquivo(senha) {
  if (senha.length < 8) throw new Error("Use pelo menos 8 caracteres na senha.");
  const salt = novoSalt();
  const key = await derivarChave(senha, salt);
  return { sessao: { tipo: "arquivo", id: null, nome: "arquivo", salt, key }, vault: novoVault() };
}

// backup (.json)
async function gerarPayloadBackup() {
  const s = state.sessao;
  const enc = await cifrarObjeto(s.key, state.vault);
  return { formato: FORMATO_BACKUP, versao: 2, criadoEm: nowISO(), salt: toB64(s.salt), iv: enc.iv, dados: enc.dados };
}

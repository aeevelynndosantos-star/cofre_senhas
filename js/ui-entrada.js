/*  telas antes de entrar no cofre
    Abas: ENTRAR (usuário + senha) e (arquivo criptografado e senha). */

const ABAS = [
  ["entrar", "Entrar"],
  ["criar", "Criar conta"],
  ["arquivo", "Arquivo"],
];

function renderEntrada() {
  const abaAtiva = state.aba === "novoarquivo" ? "arquivo" : state.aba;
  const tabs = ABAS.map(([id, nome]) =>
    `<button type="button" role="tab" class="tab" data-aba="${id}" aria-selected="${id === abaAtiva}">${nome}</button>`
  ).join("");

  const el = h(janelaExe(`
      <div class="titulo-pixel">${pixelText("COFRE DE SENHAS", 4)}</div>
      <p class="sub">Criptografia AES-GCM no seu navegador. Nada é enviado para servidor nenhum.</p>
      ${catStage()}
      <div class="tabs" role="tablist" aria-label="Forma de entrada">${tabs}</div>
      <div id="painel" role="tabpanel"></div>`,
    { cls: "estreito" }));

  el.querySelectorAll(".tab").forEach(b => {
    b.onclick = () => { state.aba = b.dataset.aba; render(); };
  });

  const paineis = { entrar: painelEntrar, criar: painelCriar, arquivo: painelArquivo, novoarquivo: painelNovoArquivo };
  el.querySelector("#painel").appendChild((paineis[state.aba] || painelEntrar)());
  return el;
}

// ícone em pixel
function htmlCampo({ id, rotulo, icone, tipo = "text", nome = "", auto = "off", dica = "" }) {
  return `
    <label for="${id}">${rotulo}</label>
    <div class="field-wrap">
      <span class="ico">${bitmapSvg(icone, 2)}</span>
      <input class="field" type="${tipo}" id="${id}" name="${nome}" autocomplete="${auto}" autocapitalize="none" spellcheck="false" placeholder="${dica}">
    </div>`;
}

function avisoSemArmazenamento() {
  return `<div class="aviso">Este navegador bloqueou o armazenamento local (modo privado?). Contas ficam indisponíveis: use a aba ARQUIVO.</div>`;
}
function concluirEntrada(resultado) {
  state.sessao = resultado.sessao;
  state.vault = normalizarVault(resultado.vault);
  state.dirty = false;
  state.search = "";
  state.modal = null;
  state.view = "app";
  aplicarTema(state.vault.prefs.tema);
  render();
}

function painelEntrar() {
  const dispo = armazenamentoDisponivel();
  const f = h(`
    <form id="f-entrar" novalidate>
      ${dispo ? "" : avisoSemArmazenamento()}
      ${htmlCampo({ id: "e-user", rotulo: "Usuário", icone: ICONE_USUARIO, nome: "username", auto: "username", dica: "seu usuario" })}
      ${htmlCampo({ id: "e-pass", rotulo: "Senha", icone: ICONE_CADEADO, tipo: "password", nome: "password", auto: "current-password", dica: "sua senha" })}
      <div class="error" id="err" hidden></div>
      <div class="choice-row"><button class="primary" type="submit">Entrar</button></div>
    </form>`);
  if (!dispo) f.querySelectorAll("input, button[type=submit]").forEach(x => { x.disabled = true; });

  f.onsubmit = async (ev) => {
    ev.preventDefault();
    const err = f.querySelector("#err");
    const user = f.querySelector("#e-user").value.trim();
    const pass = f.querySelector("#e-pass").value;
    limparErro(err);
    if (!user || !pass) return mostrarErro(err, "Informe usuário e senha.");

    const btn = f.querySelector("button[type=submit]");
    btn.disabled = true;
    try {
      const r = await executarComAcesso(() => entrarNaConta(user, pass), "DECIFRANDO");
      concluirEntrada(r);
    } catch (e) {
      f.querySelector("#e-pass").value = "";
      mostrarErro(err, e.message || "Não foi possível entrar.");
      btn.disabled = false;
    }
  };
  return f;
}

// criação de conta
function painelCriar() {
  const dispo = armazenamentoDisponivel();
  const f = h(`
    <form id="f-criar" novalidate>
      ${dispo ? "" : avisoSemArmazenamento()}
      ${htmlCampo({ id: "c-user", rotulo: "Escolha um usuário", icone: ICONE_USUARIO, nome: "username", auto: "username", dica: "3 a 24 caracteres" })}
      <p class="hint">O usuário é único: se já estiver em uso, você precisa escolher outro.</p>
      ${htmlCampo({ id: "c-pass", rotulo: "Senha", icone: ICONE_CADEADO, tipo: "password", nome: "new-password", auto: "new-password", dica: "minimo 8 caracteres" })}
      <div class="strength"><div class="bar"></div></div>
      ${htmlCampo({ id: "c-pass2", rotulo: "Confirmar senha", icone: ICONE_CADEADO, tipo: "password", nome: "confirm-password", auto: "new-password", dica: "repita a senha" })}
      <p class="hint">Se esquecer a senha, não há como recuperar o cofre. A conta fica salva (cifrada) só neste navegador: exporte backups.</p>
      <div class="error" id="err" hidden></div>
      <div class="choice-row"><button class="primary" type="submit">Criar conta</button></div>
    </form>`);
  if (!dispo) f.querySelectorAll("input, button[type=submit]").forEach(x => { x.disabled = true; });

  const barra = f.querySelector(".strength .bar");
  f.querySelector("#c-pass").oninput = (e) => pintarForca(barra, e.target.value);

  f.onsubmit = async (ev) => {
    ev.preventDefault();
    const err = f.querySelector("#err");
    const user = f.querySelector("#c-user").value.trim();
    const p1 = f.querySelector("#c-pass").value;
    const p2 = f.querySelector("#c-pass2").value;
    limparErro(err);

    const erroUsuario = validarUsuario(user);
    if (erroUsuario) return mostrarErro(err, erroUsuario);
    if (p1.length < 8) return mostrarErro(err, "Use pelo menos 8 caracteres na senha.");
    if (p1 !== p2) return mostrarErro(err, "As senhas não coincidem.");

    const btn = f.querySelector("button[type=submit]");
    btn.disabled = true;
    try {
      const r = await executarComAcesso(() => cadastrarConta(user, p1), "CRIANDO CONTA");
      concluirEntrada(r);
      toast("Conta criada. Exporte um backup para não perder o cofre.");
      } catch (e) {
      mostrarErro(err, e.message || "Não foi possível criar a conta.");
      btn.disabled = false;
     }
  };
  return f;
}

// (criptografia AES-GCM)
  function painelArquivo() {
    const f = h(`
    <form id="f-arquivo" novalidate>
      <label for="a-file">Arquivo de backup (.json)</label>
      <input class="field" type="file" id="a-file" accept="application/json,.json">
      ${htmlCampo({ id: "a-pass", rotulo: "Senha do arquivo", icone: ICONE_CADEADO, tipo: "password", nome: "password", auto: "off", dica: "senha usada no backup" })}
      <div class="error" id="err" hidden></div>
      <div class="choice-row">
        <button class="primary" type="submit">Abrir arquivo</button>
        <button class="ghost" type="button" id="btn-novo-arq">Criar cofre novo só em arquivo</button>
      </div>
    </form>`);

  f.querySelector("#btn-novo-arq").onclick = () => { state.aba = "novoarquivo"; render(); };

  f.onsubmit = async (ev) => {
    ev.preventDefault();
    const err = f.querySelector("#err");
    const arquivo = f.querySelector("#a-file").files[0];
    const pass = f.querySelector("#a-pass").value;
    limparErro(err);
    if (!arquivo) return mostrarErro(err, "Selecione o arquivo de backup.");
    if (!pass) return mostrarErro(err, "Digite a senha do arquivo.");

    const btn = f.querySelector("button[type=submit]");
    btn.disabled = true;
    try {
      let payload;
      try { payload = JSON.parse(await arquivo.text()); }
      catch (e) { throw new Error("Arquivo não é um backup válido deste app."); }
      const r = await executarComAcesso(() => abrirBackup(payload, pass), "DECIFRANDO");
      concluirEntrada(r);
      toast("Cofre aberto a partir do arquivo.");
      } catch (e) {
      f.querySelector("#a-pass").value = "";
      mostrarErro(err, e.message || "Não foi possível abrir o arquivo.");
      btn.disabled = false;
    }
  };
  return f;
}

      function painelNovoArquivo() {
      const f = h(`
      <form id="f-novo-arq" novalidate>
      <h3 class="titulo-sec">Novo cofre em arquivo</h3>
      ${htmlCampo({ id: "n-pass", rotulo: "Senha mestra", icone: ICONE_CADEADO, tipo: "password", nome: "new-password", auto: "new-password", dica: "minimo 8 caracteres" })}
      <div class="strength"><div class="bar"></div></div>
      ${htmlCampo({ id: "n-pass2", rotulo: "Confirmar senha mestra", icone: ICONE_CADEADO, tipo: "password", nome: "confirm-password", auto: "new-password", dica: "repita a senha" })}
      <p class="hint">Sem conta: nada fica salvo no navegador. Você guarda tudo exportando o backup.</p>
          <div class="error" id="err" hidden></div>
          <div class="choice-row">
        <button class="primary" type="submit">Criar cofre</button>
        <button class="ghost" type="button" id="btn-voltar">Voltar</button>
      </div>
    </form>`);

  const barra = f.querySelector(".strength .bar");
  f.querySelector("#n-pass").oninput = (e) => pintarForca(barra, e.target.value);
  f.querySelector("#btn-voltar").onclick = () => { state.aba = "arquivo"; render(); };

  f.onsubmit = async (ev) => {
    ev.preventDefault();
    const err = f.querySelector("#err");
    const p1 = f.querySelector("#n-pass").value;
    const p2 = f.querySelector("#n-pass2").value;
    limparErro(err);
    if (p1.length < 8) return mostrarErro(err, "Use pelo menos 8 caracteres.");
    if (p1 !== p2) return mostrarErro(err, "As senhas não coincidem.");

    const btn = f.querySelector("button[type=submit]");
    btn.disabled = true;
    try {
      const r = await executarComAcesso(() => criarCofreEmArquivo(p1), "CRIANDO COFRE");
      concluirEntrada(r);
      toast("Cofre criado. Não esqueça de exportar um backup.");
    } catch (e) {
      mostrarErro(err, e.message || "Não foi possível criar o cofre.");
      btn.disabled = false;
    }
  };
  return f;
}

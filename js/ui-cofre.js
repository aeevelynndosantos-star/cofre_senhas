/* ui-cofre.js — tela do cofre (depois da entrada)
   Pastas/lista de credenciais, seletor de cor, janelas, backup */

let listaEl = null;

function renderCofre() {
  const s = state.sessao;
  const quem = s.tipo === "conta" ? `usuário: ${s.nome}` : "sessão por arquivo";
  const visao = state.vault.prefs.visao;

  const el = h(janelaExe(`
      <header class="top">
        <div class="brand">
          ${pixelText("COFRE", 4)}
          <span class="who">${escapeHtml(quem)}</span>
        </div>
        <div class="actions">
          <button type="button" id="btn-musica" aria-pressed="false" title="Ouvir música">♪ Música</button>
          <button type="button" id="btn-gerar">Gerar senha</button>
          <button type="button" id="btn-exportar">Exportar backup</button>
        </div>
      </header>

      <div class="paleta">
        <span class="paleta-rot">Cor</span>
        ${htmlSeletorDeCor()}
      </div>

      <div id="area-aviso"></div>

      <div class="tabs mini" role="tablist" aria-label="Modo de exibição">
        <button type="button" role="tab" class="tab" data-visao="pastas" aria-selected="${visao === "pastas"}">Pastas</button>
        <button type="button" role="tab" class="tab" data-visao="lista" aria-selected="${visao === "lista"}">Lista</button>
      </div>

      <div class="toolbar">
        <input class="field" type="text" id="busca" placeholder="buscar por servico ou usuario" autocomplete="off" value="${escapeAttr(state.search)}">
        <button type="button" class="primary" id="btn-nova">+ Nova credencial</button>
      </div>

      <div id="lista"></div>

      <footer class="note">${s.tipo === "conta"
        ? "Salvo automaticamente (cifrado) neste navegador. Exporte backups de vez em quando."
        : "Sessão por arquivo: exporte o backup para guardar as alterações."}</footer>`,
    {
      cls: "cheia",
      ctrl: `<span class="exe-ctrl">
        <button type="button" id="btn-min" title="Minimizar" aria-label="Minimizar">_</button>
        <button type="button" id="btn-tela" title="Tela cheia" aria-label="Tela cheia do navegador">□</button>
        <button type="button" id="btn-fechar-cofre" title="Fechar e bloquear" aria-label="Fechar e bloquear o cofre">×</button>
      </span>`,
    }));

  // aviso de alteração não exp.
  if (s.tipo === "arquivo" && state.dirty) {
    const b = h(`
      <div class="banner">
        <span>Você tem alterações não salvas em backup.</span>
        <button type="button" id="btn-banner-exportar">Exportar agora</button>
      </div>`);
    b.querySelector("#btn-banner-exportar").onclick = exportarBackup;
    el.querySelector("#area-aviso").appendChild(b);
  }

  ligarSeletorDeCor(el);

  el.querySelectorAll("[data-visao]").forEach(b => {
    b.onclick = () => {
      state.vault.prefs.visao = b.dataset.visao;
      el.querySelectorAll("[data-visao]").forEach(x => x.setAttribute("aria-selected", String(x === b)));
      renderList();
      aposMudancaPrefs();
    };
  });

  el.querySelector("#busca").oninput = (e) => { state.search = e.target.value; renderList(); };
  el.querySelector("#btn-nova").onclick = () => openModal({ type: "add" });
  el.querySelector("#btn-gerar").onclick = () => openModal({ type: "generate" });
  el.querySelector("#btn-exportar").onclick = exportarBackup;
  el.querySelector("#btn-fechar-cofre").onclick = bloquear;
  el.querySelector("#btn-tela").onclick = alternarTelaCheia;
  el.querySelector("#btn-min").onclick = () => el.classList.toggle("minimizada");
  el.querySelector("#btn-musica").onclick = plAlternar;
  el.querySelector("#btn-musica").setAttribute("aria-pressed", String(plAberto()));

  listaEl = el.querySelector("#lista");
  renderList();
  return el;
}

// lista de cred.
function renderList() {
  if (!listaEl) return;
  listaEl.innerHTML = "";
  const nomes = listaFiltrada();

  if (!nomes.length) {
    const vazio = Object.keys(state.vault.entries).length === 0;
    listaEl.appendChild(h(`
      <div class="vazio">
        ${bitmapSvg(ICONE_CADEADO, 5)}
        <p>${vazio ? "Nenhuma credencial cadastrada ainda." : "Nenhum resultado para a busca."}</p>
      </div>`));
    return;
  }

  if (state.vault.prefs.visao === "lista") renderLinhas(nomes);
  else renderPastas(nomes);
}

function renderPastas(nomes) {
  const grade = h(`<div class="pastas"></div>`);
  nomes.forEach(servico => {
    const e = state.vault.entries[servico];
    const p = h(`
      <button type="button" class="pasta" draggable="true" title="Abrir ${escapeAttr(servico)}">
        ${bitmapSvg(ICONE_PASTA, 5)}
        <span class="nome">${escapeHtml(servico)}</span>
        <span class="sub">${escapeHtml(e.usuario || "")}</span>
      </button>`);
    p.onclick = () => openModal({ type: "detail", servico });
    p.ondragstart = (ev) => {
      ev.dataTransfer.setData("application/x-cofre-servico", servico);
      ev.dataTransfer.effectAllowed = "move";
    };
    grade.appendChild(p);
  });
  listaEl.appendChild(grade);

  const lixeira = h(`<div class="lixeira" title="Arraste uma pasta até aqui para excluir">${bitmapSvg(ICONE_LIXEIRA, 4)}<span>Lixeira</span></div>`);
  lixeira.ondragover = (ev) => { ev.preventDefault(); lixeira.classList.add("sobre"); };
  lixeira.ondragleave = () => lixeira.classList.remove("sobre");
  lixeira.ondrop = async (ev) => {
    ev.preventDefault();
    lixeira.classList.remove("sobre");
    const servico = ev.dataTransfer.getData("application/x-cofre-servico");
    if (servico && temCredencial(servico)) await excluirComConfirmacao(servico);
  };
  const rodape = h(`<div class="rodape-pasta"></div>`);
  rodape.appendChild(lixeira);
  listaEl.appendChild(rodape);
}

function renderLinhas(nomes) {
  const lista = h(`<div class="lista"></div>`);
  nomes.forEach(servico => {
    const e = state.vault.entries[servico];
    const row = h(`
      <div class="linha">
        <div class="info">
          <div class="servico">${escapeHtml(servico)}</div>
          <div class="usuario">${escapeHtml(e.usuario || "")}</div>
        </div>
        <div class="acoes">
          <button type="button" data-act="copy" title="Copiar senha">Copiar</button>
          <button type="button" data-act="view" title="Ver detalhes">Ver</button>
        </div>
      </div>`);
    row.querySelector('[data-act="copy"]').onclick = async (ev) => {
      ev.stopPropagation();
      const ok = await copiarTexto(e.senha);
      ok ? toast("Senha copiada!") : toast("Não foi possível copiar automaticamente.", "erro");
    };
    row.querySelector('[data-act="view"]').onclick = (ev) => {
      ev.stopPropagation();
      openModal({ type: "detail", servico });
    };
    row.onclick = () => openModal({ type: "detail", servico });
    lista.appendChild(row);
  });
  listaEl.appendChild(lista);
}

    function openModal(modal) { state.modal = modal; render(); }
    function closeModal() { state.modal = null; render(); }

  function htmlJanela(titulo, corpo) {
  return `
    <div class="win">
      <div class="win-bar">
        <span class="win-title">${escapeHtml(titulo)}</span>
        <button type="button" class="win-x" data-fechar aria-label="Fechar">x</button>
      </div>
      <div class="win-body">${corpo}</div>
    </div>`;
}

  function renderModal() {
  const overlay = h(`<div class="modal-overlay"></div>`);
  overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
  const m = state.modal;
  let dentro;
  if (m.type === "add" || m.type === "edit") dentro = renderFormModal(m);
  else if (m.type === "detail") dentro = renderDetailModal(m);
  else if (m.type === "history") dentro = renderHistoryModal(m);
  else dentro = renderGenerateModal();
  const fechar = dentro.querySelector("[data-fechar]");
  if (fechar) fechar.onclick = closeModal;
  overlay.appendChild(dentro);
  return overlay;
}

  function renderFormModal(m) {
  const editando = m.type === "edit";
  const ex = editando ? state.vault.entries[m.servico] : null;
  const modal = h(htmlJanela(editando ? "Editar credencial" : "Nova credencial", `
      <label for="f-servico">Serviço</label>
      <input class="field" id="f-servico" ${editando ? "disabled" : ""} value="${editando ? escapeAttr(m.servico) : ""}" placeholder="ex: gmail, github" autocomplete="off">
      <label for="f-usuario">Usuário / e-mail</label>
      <input class="field" id="f-usuario" value="${editando ? escapeAttr(ex.usuario) : ""}" autocomplete="off">
      <label for="f-senha">Senha</label>
      <div class="field-row">
        <input class="field mono" id="f-senha" type="text" value="${editando ? escapeAttr(ex.senha) : ""}" placeholder="digite ou gere" autocomplete="off">
        <button type="button" id="f-gerar">Gerar</button>
      </div>
      <div class="strength"><div class="bar" id="f-barra"></div></div>
      <label for="f-notas">Notas (opcional)</label>
      <textarea class="field" id="f-notas" rows="2">${editando ? escapeHtml(ex.notas || "") : ""}</textarea>
      <div class="error" id="f-err" hidden></div>
      <div class="modal-actions">
        <button type="button" class="ghost" id="f-cancelar">Cancelar</button>
        <button type="button" class="primary" id="f-salvar">Salvar</button>
      </div>`));

  const senhaInput = modal.querySelector("#f-senha");
  const barra = modal.querySelector("#f-barra");
  senhaInput.oninput = () => pintarForca(barra, senhaInput.value);
  pintarForca(barra, senhaInput.value);

  modal.querySelector("#f-gerar").onclick = () => {
    senhaInput.value = gerarSenha(20, true);
    pintarForca(barra, senhaInput.value);
  };
  modal.querySelector("#f-cancelar").onclick = closeModal;
  modal.querySelector("#f-salvar").onclick = () => {
    const err = modal.querySelector("#f-err");
    const servico = modal.querySelector("#f-servico").value.trim();
    const usuario = modal.querySelector("#f-usuario").value.trim();
    const senha = senhaInput.value;
    const notas = modal.querySelector("#f-notas").value.trim();
    limparErro(err);
    if (!servico) return mostrarErro(err, "Informe o nome do serviço.");
    if (NOMES_RESERVADOS.includes(servico)) return mostrarErro(err, "Esse nome de serviço não é permitido.");
    if (!senha) return mostrarErro(err, "Informe ou gere uma senha.");
    if (!editando && temCredencial(servico)) return mostrarErro(err, "Já existe uma credencial com esse nome de serviço.");
    if (editando) {
      editarCredencial(m.servico, { usuario, senha, notas });
      toast("Credencial atualizada.");
    } else {
      adicionarCredencial(servico, usuario, senha, notas);
      toast("Credencial adicionada.");
    }
    state.modal = null;
    render();
  };
  return modal;
}

  function renderDetailModal(m) {
  const e = state.vault.entries[m.servico];
  if (!e) { state.modal = null; return h(`<div></div>`); }

  const modal = h(htmlJanela(m.servico, `
      <div class="detail-row"><span class="rot">Usuário</span><span class="val">${escapeHtml(e.usuario || "")}</span></div>
      <div class="detail-row"><span class="rot">Senha</span><span class="val" id="d-senha">••••••••••••</span></div>
      ${e.notas ? `<div class="detail-row"><span class="rot">Notas</span><span class="val">${escapeHtml(e.notas)}</span></div>` : ""}
      <div class="detail-row"><span class="rot">Atualizado em</span><span class="val">${escapeHtml(e.atualizadoEm || "")}</span></div>
      <div class="modal-actions inicio">
        <button type="button" id="d-mostrar">Mostrar senha</button>
        <button type="button" id="d-copiar">Copiar senha</button>
        <button type="button" id="d-historico">Histórico</button>
      </div>
      <div class="modal-actions">
        <button type="button" class="danger" id="d-excluir">Excluir</button>
        <button type="button" id="d-editar">Editar</button>
        <button type="button" class="ghost" id="d-fechar">Fechar</button>
      </div>`));

  let mostrando = false;
  modal.querySelector("#d-mostrar").onclick = (ev) => {
    mostrando = !mostrando;
    modal.querySelector("#d-senha").textContent = mostrando ? e.senha : "••••••••••••";
    ev.target.textContent = mostrando ? "Ocultar senha" : "Mostrar senha";
  };
  modal.querySelector("#d-copiar").onclick = async () => {
    const ok = await copiarTexto(e.senha);
    ok ? toast("Senha copiada!") : toast("Não foi possível copiar automaticamente.", "erro");
  };
  modal.querySelector("#d-historico").onclick = () => openModal({ type: "history", servico: m.servico });
  modal.querySelector("#d-editar").onclick = () => openModal({ type: "edit", servico: m.servico });
  modal.querySelector("#d-excluir").onclick = () => excluirComConfirmacao(m.servico);
  modal.querySelector("#d-fechar").onclick = closeModal;
  return modal;
}

  function renderHistoryModal(m) {
  const e = state.vault.entries[m.servico];
  const hist = e && e.historico ? [...e.historico].reverse() : [];
  const lista = hist.length
    ? `<ul class="history-list">${hist.map(r => `<li><div>${escapeHtml(r.acao)}</div><div class="quando">${escapeHtml(r.quando)}</div></li>`).join("")}</ul>`
    : `<p class="sub" style="margin:0">Nenhum registro ainda.</p>`;
  const modal = h(htmlJanela(`Histórico — ${m.servico}`, `
      ${lista}
      <div class="modal-actions"><button type="button" id="h-voltar">Voltar</button></div>`));
  modal.querySelector("#h-voltar").onclick = () => openModal({ type: "detail", servico: m.servico });
  return modal;
}

  function renderGenerateModal() {
  const modal = h(htmlJanela("Gerador de senha forte", `
      <label for="g-tam">Tamanho</label>
      <div class="slider-row">
        <input type="range" id="g-tam" min="8" max="40" value="20">
        <span class="len-val" id="g-tam-val">20</span>
      </div>
      <div class="toggle-row">
        <input type="checkbox" class="tg" id="g-simbolos" checked>
        <label for="g-simbolos">Incluir símbolos</label>
      </div>
      <label for="g-resultado">Senha gerada</label>
      <div class="field-row">
        <input class="field mono" id="g-resultado" readonly>
        <button type="button" id="g-refazer">Gerar de novo</button>
      </div>
      <div class="strength"><div class="bar" id="g-barra"></div></div>
      <div class="modal-actions">
        <button type="button" class="ghost" id="g-fechar">Fechar</button>
        <button type="button" class="primary" id="g-copiar">Copiar</button>
      </div>`));

  const tam = modal.querySelector("#g-tam");
  const tamVal = modal.querySelector("#g-tam-val");
  const simbolos = modal.querySelector("#g-simbolos");
  const resultado = modal.querySelector("#g-resultado");
  const barra = modal.querySelector("#g-barra");

  const gerar = () => {
    resultado.value = gerarSenha(parseInt(tam.value, 10), simbolos.checked);
    pintarForca(barra, resultado.value);
  };
  tam.oninput = () => { tamVal.textContent = tam.value; gerar(); };
  simbolos.onchange = gerar;
  modal.querySelector("#g-refazer").onclick = gerar;
  modal.querySelector("#g-copiar").onclick = async () => {
    const ok = await copiarTexto(resultado.value);
    ok ? toast("Senha copiada!") : toast("Não foi possível copiar automaticamente.", "erro");
  };
  modal.querySelector("#g-fechar").onclick = closeModal;
  gerar();
  return modal;
}

async function excluirComConfirmacao(servico) {
  const ok = await confirmar({
    titulo: "Excluir credencial",
    texto: `Excluir a credencial de "${servico}"? Essa ação não pode ser desfeita.`,
    ok: "Excluir",
    perigo: true,
  });
  if (!ok) return false;
  removerCredencial(servico);
  toast("Credencial excluída.");
  state.modal = null;
  render();
  return true;
}

async function exportarBackup() {
  if (dlAtivo) return;
  try {
    const payload = await gerarPayloadBackup();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const carimbo = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const nomeArquivo = `backup_cofre_${carimbo}.json`;

    // janela "Downloading..." 
    const baixou = await mostrarDownload(nomeArquivo, () => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = nomeArquivo;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
    if (!baixou) return toast("Não foi possível exportar o backup.", "erro");

    state.dirty = false;
    toast("Backup exportado.");
    render();
  } catch (e) {
    toast("Não foi possível exportar o backup.", "erro");
  }
}

async function bloquear() {
  if (state.sessao && state.sessao.tipo === "arquivo" && state.dirty) {
    const ok = await confirmar({
      titulo: "Bloquear cofre",
      texto: "Há mudanças não exportadas. Bloquear mesmo assim?",
      ok: "Bloquear",
      perigo: true,
    });
    if (!ok) return;
  }
  await filaSalvar;               
  plFechar();                   
  if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
  state = estadoInicial();
  aplicarTema("verde");         
  render();
}

function alternarTelaCheia() {
  if (document.fullscreenElement) { document.exitFullscreen().catch(() => {}); return; }
  const raiz = document.documentElement;
  if (raiz.requestFullscreen) raiz.requestFullscreen().catch(() => toast("O navegador não permitiu a tela cheia.", "erro"));
}
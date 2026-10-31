/*  janela "Downloading...", tela ACESSO LIBERADO /
   NEGADO */

  function linhasDeCodigoFalso(n = 16) {
  const linhas = [];
  for (let i = 0; i < n; i++) {
    let l = "";
    const qtd = 3 + Math.floor(Math.random() * 5);
    for (let j = 0; j < qtd; j++) {
      l += "0x" + Math.floor(Math.random() * 0xffff).toString(16).padStart(4, "0").toUpperCase() + " ";
    }
    linhas.push(l);
  }
  return linhas.join("\n");
}

function htmlAcesso(ok) {
  const texto = ok ? "ACESSO LIBERADO" : "ACESSO NEGADO";
  return `<div class="granted ${ok ? "" : "negado"}" role="status">` +
    `<pre class="code-bg" aria-hidden="true">${linhasDeCodigoFalso()}</pre>` +
    `<div class="granted-box">${pixelText(texto, 5)}</div></div>`;
}

  function abrirOverlayAcesso(titulo) {
  const SEGS = 20;
  const barras = Array.from({ length: SEGS }, () => "<i></i>").join("");
  const ov = h(`
    <div class="access-overlay" role="alertdialog" aria-modal="true" aria-label="${escapeAttr(titulo)}">
      <div class="win">
        <div class="win-bar">
          <span class="win-title">${escapeHtml(titulo)}</span>
          <span class="win-btns" aria-hidden="true"><i>_</i><i class="max"></i><i>x</i></span>
        </div>
        <div class="win-body">
          <p class="win-text">Verificando credenciais<span class="dots"></span></p>
          <div class="prog"><div class="prog-bar">${barras}</div><span class="prog-pct">0%</span></div>
        </div>
      </div>
    </div>`);
  document.body.appendChild(ov);

  const segs = ov.querySelectorAll(".prog-bar i");
  const pctEl = ov.querySelector(".prog-pct");
  const rapido = reduzMovimento();
  let pct = rapido ? 99 : 0;
  const pintar = () => {
    const ligados = Math.round((pct / 100) * SEGS);
    segs.forEach((s, i) => s.classList.toggle("on", i < ligados));
    pctEl.textContent = Math.floor(pct) + "%";
  };
  pintar();
  const timer = setInterval(() => { pct = Math.min(99, pct + 3); pintar(); }, 40);

  return {
    async finalizar(ok) {
      clearInterval(timer);
      pct = 100;
      pintar();
      await esperar(rapido ? 0 : 250);
      ov.innerHTML = htmlAcesso(ok);
      await esperar(rapido ? 600 : ok ? 1000 : 1300);
      ov.remove();
    },
  };
}

// Sucesso -> ACESSO LIBERADO ou erro -> ACESSO NEGADO 
async function executarComAcesso(tarefa, titulo = "DECIFRANDO") {
  const ov = abrirOverlayAcesso(titulo);
  const minimo = esperar(reduzMovimento() ? 0 : 1300);
  let resultado;
  let erro = null;
  try { resultado = await tarefa(); } catch (e) { erro = e; }
  await minimo;
  await ov.finalizar(!erro);
  if (erro) throw erro;
  return resultado;
}

function confirmar({ titulo, texto, ok = "Confirmar", perigo = false }) {
  return new Promise(resolve => {
    const ov = h(`
      <div class="modal-overlay confirm" role="alertdialog" aria-modal="true">
        <div class="win">
          <div class="win-bar"><span class="win-title"></span></div>
          <div class="win-body">
            <p class="confirm-texto"></p>
            <div class="modal-actions">
              <button type="button" class="ghost" data-nao>Cancelar</button>
              <button type="button" class="${perigo ? "danger" : "primary"}" data-sim></button>
            </div>
          </div>
        </div>
      </div>`);
    ov.querySelector(".win-title").textContent = titulo;
    ov.querySelector(".confirm-texto").textContent = texto;
    ov.querySelector("[data-sim]").textContent = ok;

    const fechar = (valor) => {
      document.removeEventListener("keydown", aoTeclar, true);
      ov.remove();
      resolve(valor);
    };
    const aoTeclar = (e) => {
      if (e.key === "Escape") { e.stopPropagation(); fechar(false); }
    };
    document.addEventListener("keydown", aoTeclar, true);
    ov.querySelector("[data-nao]").onclick = () => fechar(false);
    ov.querySelector("[data-sim]").onclick = () => fechar(true);
    ov.onclick = (e) => { if (e.target === ov) fechar(false); };
    document.body.appendChild(ov);
    ov.querySelector("[data-nao]").focus();
  });
}

let dlAtivo = false;

function mostrarDownload(nomeArquivo, aoCompletar) {
  return new Promise((resolve) => {
    dlAtivo = true;
    const SEGS = 24;
    const ov = h(`
      <div class="access-overlay dl" role="alertdialog" aria-modal="true" aria-label="Download do backup">
        <div class="win">
          <div class="win-bar">
            <span class="win-title">DOWNLOAD.EXE</span>
            <span class="win-btns" aria-hidden="true"><i>_</i><i class="max"></i><i>x</i></span>
          </div>
          <div class="win-body">
            <p class="win-text dl-msg dots">Downloading</p>
            <div class="prog"><div class="prog-bar">${"<i></i>".repeat(SEGS)}</div><span class="prog-pct">0%</span></div>
            <div class="dl-file"></div>
            <div class="modal-actions"><button type="button" class="primary" data-ok hidden>OK</button></div>
          </div>
        </div>
      </div>`);
    const msg = ov.querySelector(".dl-msg");
    const segs = ov.querySelectorAll(".prog-bar i");
    const pctEl = ov.querySelector(".prog-pct");
    const ok = ov.querySelector("[data-ok]");
    ov.querySelector(".dl-file").textContent = nomeArquivo;

    const pintar = (p) => {
      const ligados = Math.floor((p / 100) * SEGS);
      segs.forEach((s, i) => s.classList.toggle("on", i < ligados));
      pctEl.textContent = p + "%";
    };
    pintar(0);
    document.body.appendChild(ov);

    let fechaTimer = null;
    let completo = false;
    const fechar = () => {
      clearTimeout(fechaTimer);
      document.removeEventListener("keydown", aoTeclar, true);
      ov.remove();
      dlAtivo = false;
    };
    const aoTeclar = (e) => {
      if (completo && (e.key === "Escape" || e.key === "Enter")) { e.stopPropagation(); fechar(); }
    };
    document.addEventListener("keydown", aoTeclar, true);
    ok.onclick = fechar;

    const finalizar = () => {
      clearInterval(timer);
      pintar(100);
      completo = true;
      msg.classList.remove("dots");
      let deuCerto = true;
      try { aoCompletar(); } catch (e) { deuCerto = false; }
      if (deuCerto) {
        msg.textContent = "Download complete!";
      } else {
        msg.textContent = "Falha no download";
        msg.classList.add("falhou");
      }
      ok.hidden = false;
      ok.focus();
      fechaTimer = setTimeout(fechar, deuCerto ? 1800 : 4000);
      resolve(deuCerto);
    };

    const rapido = reduzMovimento();
    const duracao = rapido ? 300 : 1800;
    const inicio = performance.now();
    const timer = setInterval(() => {
      const t = Math.min(1, (performance.now() - inicio) / duracao);
      const suave = 1 - Math.pow(1 - t, 2);
      pintar(Math.min(99, Math.floor(suave * 100)));
      if (t >= 1) {
        clearInterval(timer);
        setTimeout(finalizar, rapido ? 0 : 500);
      }
    }, 40);
  });
}

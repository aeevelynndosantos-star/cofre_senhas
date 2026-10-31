/* inicialização do site*/

const INTRO_DURACAO_MS = 6500;

function svgGatoIntro() {
  return `
  <svg viewBox="0 0 600 600" role="img" aria-label="Gatinho dormindo">
    <defs>
      <!-- textura pontilhada, lembra a imagem em "caracteres" -->
      <pattern id="gato-pontos" width="7" height="9" patternUnits="userSpaceOnUse">
        <circle cx="3.5" cy="3" r="1.5" fill="#3b3b3b"/>
        <rect x="2.5" y="5.5" width="2" height="3" fill="#2a2a2a"/>
      </pattern>
    </defs>

    <g class="gato-todo">
      <!-- rabo -->
      <g class="gato-rabo">
        <path d="M214 550 C282 522 388 524 462 506 C512 494 540 462 532 424
                 L516 428 C520 462 498 484 458 492 C392 508 286 506 214 550 Z" fill="#000"/>
        <path d="M214 550 C282 522 388 524 462 506 C512 494 540 462 532 424
                 L516 428 C520 462 498 484 458 492 C392 508 286 506 214 550 Z" fill="url(#gato-pontos)"/>
      </g>

      <!-- cabeça + corpo -->
      <g class="gato-corpo">
        <path id="gato-silhueta"
              d="M205 216 L222 82 L276 126 Q352 112 430 114 L466 98 L456 162
                 Q452 204 440 236 Q446 270 430 292
                 C470 322 500 384 505 440 Q508 482 480 492
                 L196 492 Q184 468 194 430
                 C200 372 214 330 222 292 Q198 262 205 216 Z" fill="#000"/>
        <use href="#gato-silhueta" fill="url(#gato-pontos)"/>

        <!-- detalhes em branco: orelhas, olhinhos fechados, focinho -->
        <g fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M238 108 L272 140"/>
          <path d="M440 122 L446 166"/>
          <path d="M246 222 Q268 190 306 200"/>
          <path d="M334 188 Q372 188 396 212"/>
          <path d="M294 213 L303 224 L312 214"/>
          <!-- contorno do corpo e patinhas -->
          <path d="M224 300 C214 340 204 372 202 420" stroke-width="3"/>
          <path d="M432 296 C466 330 492 380 496 438" stroke-width="3"/>
          <path d="M246 448 C252 486 300 486 310 452"/>
          <path d="M344 462 C350 492 400 492 406 462"/>
          <path d="M420 458 Q450 440 484 468"/>
        </g>
      </g>

      <!-- zzz -->
      <text class="gato-z z1" x="48"  y="132" font-size="34">Z</text>
      <text class="gato-z z2" x="102" y="128" font-size="42">Z</text>
      <text class="gato-z z3" x="156" y="136" font-size="50">Z</text>
    </g>
  </svg>`;
}

function abrirIntro() {
  if (document.getElementById("intro")) return;

  const el = h(`
    <div class="intro" id="intro" role="dialog" aria-modal="true" aria-label="Abertura">
      <div class="intro-gato">${svgGatoIntro()}</div>
      <p class="intro-dica">toque ou aperte uma tecla para entrar</p>
    </div>`);
  document.body.appendChild(el);
  document.body.classList.add("com-intro");

  let fechado = false;
  let timer = null;

  const fechar = () => {
    if (fechado) return;
    fechado = true;
    clearTimeout(timer);
    document.removeEventListener("keydown", aoTeclar, true);
    el.classList.add("saindo");
    setTimeout(() => {
      el.remove();
      document.body.classList.remove("com-intro");
      if (typeof reiniciarCanto === "function") reiniciarCanto();
    }, reduzMovimento() ? 0 : 600);
  };

    function aoTeclar(e) {
    e.stopPropagation();
    e.preventDefault();
    fechar();
  }

  el.addEventListener("click", fechar);
  document.addEventListener("keydown", aoTeclar, true);
  timer = setTimeout(fechar, INTRO_DURACAO_MS);
}

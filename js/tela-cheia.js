/* tela-cheia.js — liga o modo tela cheia dentro do cofre e faz o
   botão power (bloquear) fechar a moldura e voltar para a entrada.*/
(function () {
  var app = document.getElementById("app");
  if (!app) return;

  // 1) modo-cofre
  function atualizaModo() {
    document.body.classList.toggle("modo-cofre", !!app.querySelector(".monitor:not(.estreito)"));
  }
  new MutationObserver(atualizaModo).observe(app, { childList: true, subtree: true });
  atualizaModo();

  // 2) quando o render() forçar a animação de transição da moldura do cofre
  var renderOriginal = render;
  render = function () {
    var antigo = app.querySelector(".monitor:not(.estreito)");
    var fantasma = null;
    if (antigo && !(state.view === "app" && state.sessao)) {
      fantasma = antigo.cloneNode(true);
      fantasma.removeAttribute("id");
      fantasma.querySelectorAll("[id]").forEach(function (n) { n.removeAttribute("id"); });
      fantasma.classList.add("fantasma", "desligando");
    }
    renderOriginal.apply(this, arguments);
    if (fantasma) {
      document.body.appendChild(fantasma);
      var reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setTimeout(function () { fantasma.remove(); }, reduz ? 220 : 520);
    }
  };
})();

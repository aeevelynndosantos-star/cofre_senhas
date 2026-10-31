/* ponto de entrada */

const $app = document.getElementById("app");

function render() {
  clearTimeout(catTimer);
  document.body.classList.toggle("modo-cofre", state.view === "app" && !!state.sessao);
  $app.innerHTML = "";
  if (state.view === "app" && state.sessao) {
    $app.appendChild(renderCofre());
    if (state.modal) $app.appendChild(renderModal());
  } else {
    plFechar();               
    $app.appendChild(renderEntrada());
  }
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && state.modal) closeModal();
});


window.addEventListener("beforeunload", (e) => {
  if (state.sessao && state.sessao.tipo === "arquivo" && state.dirty) {
    e.preventDefault();
    e.returnValue = "";
  }
});

function iniciar() {
  if (!(window.crypto && window.crypto.subtle)) {
    $app.innerHTML = monitor(
      `<div class="titulo-pixel">${pixelText("ERRO", 5)}</div>
       <p class="sub">Este navegador não oferece a Web Crypto API. Abra o app em https, em localhost ou em um navegador atual.</p>`,
      { cls: "estreito" });
    return;
  }
  aplicarTema("verde");
  render();
}

iniciar();

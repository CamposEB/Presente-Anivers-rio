/* ============================================================
   MODO DIRETOR — só ativa com ?demo=1 na URL
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

  const params = new URLSearchParams(location.search);
  if (params.get("demo") !== "1") return;

  document.body.classList.add("demo-mode");

  const panel      = document.getElementById("directorPanel");
  const dirTime    = document.getElementById("dirTime");
  const dirScene   = document.getElementById("dirScene");
  const dirText    = document.getElementById("dirText");
  const dirProg    = document.getElementById("dirProgress");
  const btnPrev    = document.getElementById("dirPrev");
  const btnNext    = document.getElementById("dirNext");
  const btnPause   = document.getElementById("dirPause");
  const btnRestart = document.getElementById("dirRestart");
  const btnHide    = document.getElementById("dirHide");
  const btnEnd     = document.getElementById("dirEnd");
  const btnClose   = document.getElementById("dirClose");

  if (!panel) return;

  let hidden = false;
  let paused = false;
  let startTime = performance.now();

  panel.hidden = false;

  /* ---------- TEMPO ---------- */
  setInterval(() => {
    if (paused || !window.Surprise?.started) return;
    const ms = performance.now() - startTime;
    const s  = Math.floor(ms / 1000);
    const d  = Math.floor((ms % 1000) / 100);
    dirTime.textContent =
      String(Math.floor(s / 60)).padStart(2, "0") + ":" +
      String(s % 60).padStart(2, "0") + "." + d;
  }, 100);

  /* ---------- ATUALIZAR PAINEL ---------- */
  function atualizar() {
    const S = window.Surprise;
    if (!S) return;
    const idx = Math.min(S.current, S.total);
    dirScene.textContent = `${idx} / ${S.total}`;
    dirProg.style.width  = (S.total ? (idx / S.total) * 100 : 0) + "%";
    dirText.textContent  = S.scenes?.[Math.max(0, idx - 1)]?.text || "—";
    btnPause.textContent = paused ? "▶ Retomar" : "⏸ Pausar";
  }

  document.addEventListener("scene:change", atualizar);
  setInterval(atualizar, 250);

  /* ---------- BOTÕES ---------- */
  btnNext.addEventListener("click", () => { window.Surprise?.next(); atualizar(); });
  btnPrev.addEventListener("click", () => { window.Surprise?.prev(); atualizar(); });

  btnPause.addEventListener("click", () => {
    paused = !paused;
    window.Surprise?.toggle();
    atualizar();
  });

  btnRestart.addEventListener("click", () => {
    window.Surprise?.restart();
    paused = false;
    startTime = performance.now();
    setTimeout(atualizar, 100);
  });

  btnEnd.addEventListener("click", () => {
    window.Surprise?.end();
    atualizar();
  });

  btnHide.addEventListener("click", () => {
    hidden = !hidden;
    panel.classList.toggle("is-hidden", hidden);
    btnHide.textContent = hidden ? "👁 Mostrar" : "👁 Esconder";
  });

  btnClose.addEventListener("click", () => {
    panel.hidden = true;
    document.body.classList.remove("demo-mode");
  });

  /* ---------- ATALHOS ---------- */
  document.addEventListener("keydown", (e) => {
    if (e.target.matches("input, textarea")) return;

    if (e.key === "ArrowRight") { e.preventDefault(); window.Surprise?.next(); atualizar(); }
    if (e.key === "ArrowLeft")  { e.preventDefault(); window.Surprise?.prev(); atualizar(); }
    if (e.key === " ")          { e.preventDefault(); btnPause.click(); }
    if (e.key.toLowerCase() === "r") { btnRestart.click(); }
    if (e.key.toLowerCase() === "h") { btnHide.click(); }
    if (e.key === "Escape")     { btnClose.click(); }
  });

  atualizar();
});
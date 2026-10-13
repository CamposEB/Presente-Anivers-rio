/* ============================================================
   SURPRESA — script.js
   Fluxo: intro (envelope) → história (manual) → carta → galeria
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

  /* ─────── Referências ─────── */
  const intro        = document.getElementById("intro");
  const startBtn     = document.getElementById("startBtn");
  const story        = document.getElementById("story");
  const scene        = document.getElementById("scene");
  const nextBtn      = document.getElementById("nextBtn");
  const finale       = document.getElementById("finale");
  const gallery      = document.getElementById("gallery");
  const galleryGrid  = document.getElementById("galleryGrid");
  const openGallery  = document.getElementById("openGalleryBtn");
  const galleryBack  = document.getElementById("galleryBack");
  const shareBtn     = document.getElementById("shareBtn");
  const replayBtn    = document.getElementById("replayBtn");
  const music        = document.getElementById("music");
  const musicBtn     = document.getElementById("musicBtn");
  const skipBtn      = document.getElementById("skipBtn");
  const dust         = document.getElementById("dust");
  const dustCtx      = dust.getContext("2d");
  const lightbox     = document.getElementById("lightbox");
  const lightboxImg  = document.getElementById("lightboxImg");
  const lightboxCap  = document.getElementById("lightboxCap");
  const lightboxClose= document.getElementById("lightboxClose");

  if (!config || !Array.isArray(config.scenes)) {
    console.error("[surpresa] config.js inválido."); return;
  }

  /* ─────── Tema ─────── */
  if (config.theme)  document.documentElement.style.setProperty("--theme",  config.theme);
  if (config.accent) document.documentElement.style.setProperty("--accent", config.accent);

  /* ─────── Texto com substituição ─────── */
  function fill(text) {
    return String(text || "")
      .replace(/\{nome\}/g,      config.birthdayPerson || "")
      .replace(/\{remetente\}/g, config.sender || "");
  }
  document.querySelectorAll("[data-config]").forEach(el => {
    const key = el.dataset.config;
    if (config[key] != null) el.textContent = fill(config[key]);
  });

  /* ─────── Estado ─────── */
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const defaultDuration = Math.max(1200, Number(config.sceneDuration) || 3800);
  const autoAdvance = config.autoAdvance === true;

  let started    = false;
  let paused     = false;
  let current    = 0;
  let timer      = null;
  let fadeTimer  = null;
  let confettiRAF = null;
  let confettiParticles = [];
  let dustRAF    = null;
  let dustParticles = [];
  let activeH1   = null;
  let transitioning = false;

  /* ─────── Poeira dourada ─────── */
  function resizeDust() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    dust.width  = window.innerWidth  * dpr;
    dust.height = window.innerHeight * dpr;
    dust.style.width  = window.innerWidth  + "px";
    dust.style.height = window.innerHeight + "px";
    dustCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(70, Math.round((window.innerWidth * window.innerHeight) / 24000));
    dustParticles = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.6 + 0.4,
      vx: (Math.random() - 0.5) * 0.15,
      vy: -Math.random() * 0.25 - 0.05,
      a: Math.random() * Math.PI * 2,
      tw: Math.random() * 0.02 + 0.005
    }));
  }

  function drawDust() {
    dustCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (const p of dustParticles) {
      p.x += p.vx; p.y += p.vy; p.a += p.tw;
      if (p.y < -10) { p.y = window.innerHeight + 10; p.x = Math.random() * window.innerWidth; }
      const alpha = 0.35 + Math.sin(p.a) * 0.35;
      const grad = dustCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
      grad.addColorStop(0, `rgba(247, 212, 148, ${alpha})`);
      grad.addColorStop(1, "rgba(247, 212, 148, 0)");
      dustCtx.fillStyle = grad;
      dustCtx.beginPath();
      dustCtx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
      dustCtx.fill();
    }
    dustRAF = requestAnimationFrame(drawDust);
  }

  resizeDust();
  window.addEventListener("resize", resizeDust);
  if (!reducedMotion) drawDust();

  /* ─────── Música ─────── */
  if (config.music) music.src = config.music;

  musicBtn.addEventListener("click", () => {
    if (!music.src) return;
    if (music.paused) music.play().catch(() => {});
    else music.pause();
  });

  music.addEventListener("play", () => {
    musicBtn.classList.add("playing");
    musicBtn.innerHTML = '<i class="fa-solid fa-pause" aria-hidden="true"></i>';
    musicBtn.setAttribute("aria-label", "Pausar música");
  });
  music.addEventListener("pause", () => {
    musicBtn.classList.remove("playing");
    musicBtn.innerHTML = '<i class="fa-solid fa-music" aria-hidden="true"></i>';
    musicBtn.setAttribute("aria-label", "Tocar música");
  });

  /* ─────── Intro / Envelope ─────── */
  startBtn.addEventListener("click", openEnvelope);

  function openEnvelope() {
    if (started) return;
    started = true;

    startBtn.classList.add("is-open");
    startBtn.disabled = true;

    if (music.src) music.play().catch(() => {});

    setTimeout(() => {
      intro.classList.add("hide");
      story.classList.add("show");
      skipBtn.hidden = false;

      setTimeout(() => {
        proximaCena();
      }, 400);
    }, 900);
  }

  /* ─────── Cenas ─────── */
  function proximaCena() {
    if (transitioning) return;

    if (current >= config.scenes.length) {
      mostrarFinal();
      return;
    }

    transitioning = true;

    const cena = config.scenes[current];
    const idx = current;
    current++;

    renderCena(cena, idx);

    setTimeout(() => { transitioning = false; }, 250);
  }

  function renderCena(cena, idx) {
    const texto = fill(cena.text);
    const isLast = idx === config.scenes.length - 1;
    const isFinale = /feliz aniversário|feliz aniversario/i.test(texto);

    updateNextBtn(isLast);

    const h1 = document.createElement("h1");
    h1.textContent = texto;
    if (isFinale) h1.classList.add("is-finale");
    scene.appendChild(h1);

    void h1.offsetWidth;

    requestAnimationFrame(() => {
      h1.classList.add("is-shown");
      if (activeH1 && activeH1 !== h1) {
        const old = activeH1;
        old.classList.remove("is-shown");
        old.classList.add("is-leaving");
        setTimeout(() => old.remove(), 600);
      }
      activeH1 = h1;
    });

    if (cena.effect && !reducedMotion) {
      if (cena.effect === "sparkles") triggerSparkles();
      if (cena.effect === "bokeh")    triggerBokeh();
      if (cena.effect === "confetti") triggerConfetti();
    }

    document.dispatchEvent(new CustomEvent("scene:change", {
      detail: { index: idx, total: config.scenes.length, text: cena.text }
    }));

    if (autoAdvance) {
      const dur = Number(cena.duration) || defaultDuration;
      scheduleAuto(dur);
    }
  }

  function updateNextBtn(isLast) {
    if (!nextBtn) return;
    if (autoAdvance) { nextBtn.hidden = true; return; }
    nextBtn.hidden = false;
    const label = nextBtn.querySelector(".next-btn-label");
    if (label) label.textContent = isLast ? "Ver mensagem" : "Continuar";
    nextBtn.classList.toggle("is-last", isLast);
  }

  function scheduleAuto(delay) {
    pararTimer();
    timer = setTimeout(() => {
      if (!paused) proximaCena();
      else {
        const wait = setInterval(() => {
          if (!paused) { clearInterval(wait); proximaCena(); }
        }, 200);
      }
    }, delay);
  }

  function pararTimer() {
    if (timer) { clearTimeout(timer); timer = null; }
  }

  /* ─────── Botão Continuar ─────── */
  nextBtn.addEventListener("click", () => {
    if (!started) return;
    proximaCena();
  });

  /* ─────── Final ─────── */
  function mostrarFinal() {
    pararTimer();
    nextBtn.hidden = true;

    if (!reducedMotion) triggerConfetti(4000);

    setTimeout(() => {
      story.classList.remove("show");
      finale.hidden = false;
      requestAnimationFrame(() => finale.classList.add("show"));
      skipBtn.hidden = true;
      encerrarMusica();
    }, 400);
  }

  function encerrarMusica() {
    if (!config.fadeOutMusic || music.paused || fadeTimer) return;
    let v = music.volume;
    fadeTimer = setInterval(() => {
      v -= 0.05;
      if (v <= 0.05) {
        clearInterval(fadeTimer); fadeTimer = null;
        music.pause(); music.currentTime = 0; music.volume = 1;
      } else music.volume = v;
    }, 200);
  }

  /* ─────── Pular ─────── */
  skipBtn.addEventListener("click", () => {
    if (!started) return;
    current = config.scenes.length;
    pararTimer();
    mostrarFinal();
  });

  /* ─────── Efeitos ─────── */
  function triggerSparkles() {
    const wrap = document.createElement("div");
    wrap.className = "sparkles";
    wrap.setAttribute("aria-hidden", "true");
    for (let i = 0; i < 22; i++) {
      const s = document.createElement("span");
      const ang = Math.random() * Math.PI * 2;
      const dist = 100 + Math.random() * 220;
      s.style.setProperty("--tx", Math.cos(ang) * dist + "px");
      s.style.setProperty("--ty", Math.sin(ang) * dist + "px");
      s.style.left = 50 + (Math.random() * 30 - 15) + "%";
      s.style.top  = 50 + (Math.random() * 20 - 10) + "%";
      s.style.animationDelay = (Math.random() * 0.4) + "s";
      wrap.appendChild(s);
    }
    document.body.appendChild(wrap);
    setTimeout(() => wrap.remove(), 2200);
  }

  function triggerBokeh() {
    const wrap = document.createElement("div");
    wrap.className = "bokeh";
    wrap.setAttribute("aria-hidden", "true");
    for (let i = 0; i < 14; i++) {
      const b = document.createElement("span");
      const size = 30 + Math.random() * 90;
      b.style.width  = size + "px";
      b.style.height = size + "px";
      b.style.left = (Math.random() * 100) + "%";
      b.style.bottom = (-20 - Math.random() * 40) + "%";
      b.style.animationDuration = (6 + Math.random() * 5) + "s";
      b.style.animationDelay = (Math.random() * 2) + "s";
      wrap.appendChild(b);
    }
    document.body.appendChild(wrap);
    setTimeout(() => wrap.remove(), 12000);
  }

  function triggerConfetti(duration = 6000) {
    if (confettiRAF) return;

    const canvas = ensureConfettiCanvas();
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = window.innerWidth  * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width  = window.innerWidth  + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.scale(dpr, dpr);

    const colors = ["#f7d494", "#e3b96b", "#b8862c", "#f39ab6", "#f5ecdf"];
    const pieces = [];
    for (let i = 0; i < 130; i++) {
      pieces.push({
        x: Math.random() * window.innerWidth,
        y: -20 - Math.random() * window.innerHeight * 0.5,
        vx: (Math.random() - 0.5) * 1.6,
        vy: 1 + Math.random() * 2.2,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.15,
        w: 4 + Math.random() * 5,
        h: 8 + Math.random() * 8,
        color: colors[(Math.random() * colors.length) | 0],
        wobble: Math.random() * 0.8,
        wt: Math.random() * Math.PI * 2
      });
    }
    confettiParticles = pieces;

    const start = performance.now();
    let last = start;

    function frame(now) {
      const dt = Math.min((now - last) / 16.67, 3);
      last = now;
      const elapsed = now - start;

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (const p of confettiParticles) {
        p.wt += 0.04 * dt;
        p.x += (p.vx + Math.sin(p.wt) * 0.5 * p.wobble) * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }

      if (elapsed < duration) {
        confettiRAF = requestAnimationFrame(frame);
      } else {
        cancelAnimationFrame(confettiRAF);
        confettiRAF = null;
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      }
    }
    confettiRAF = requestAnimationFrame(frame);
  }

  function ensureConfettiCanvas() {
    let c = document.getElementById("confetti");
    if (!c) {
      c = document.createElement("canvas");
      c.id = "confetti";
      document.body.appendChild(c);
    }
    return c;
  }

  /* ─────── Galeria ─────── */
  const photos = Array.isArray(config.photos) ? config.photos : [];

  function buildGallery() {
    galleryGrid.innerHTML = "";
    photos.forEach((p, i) => {
      const fig = document.createElement("figure");
      fig.className = "gallery-item";
      fig.setAttribute("role", "listitem");
      fig.tabIndex = 0;
      fig.setAttribute("aria-label", "Abrir foto " + (i + 1) + (p.caption ? ": " + p.caption : ""));

      const img = document.createElement("img");
      img.src = p.src;
      img.alt = p.caption || "";
      img.loading = "lazy";
      img.decoding = "async";
      img.onerror = () => {
        img.remove();
        const ph = document.createElement("div");
        ph.className = "gallery-item-placeholder";
        ph.textContent = "📷";
        fig.prepend(ph);
      };
      fig.appendChild(img);

      if (p.caption) {
        const cap = document.createElement("figcaption");
        cap.textContent = fill(p.caption);
        fig.appendChild(cap);
      }

      fig.addEventListener("click", () => abrirLightbox(i));
      fig.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); abrirLightbox(i); }
      });

      galleryGrid.appendChild(fig);
    });
  }

  if (photos.length) {
    openGallery.hidden = false;
    buildGallery();
  }

  openGallery.addEventListener("click", () => {
    finale.classList.remove("show");
    setTimeout(() => {
      finale.hidden = true;
      gallery.hidden = false;
      requestAnimationFrame(() => gallery.classList.add("show"));
      gallery.scrollTop = 0;
    }, 400);
  });

  galleryBack.addEventListener("click", () => {
    gallery.classList.remove("show");
    setTimeout(() => {
      gallery.hidden = true;
      finale.hidden = false;
      requestAnimationFrame(() => finale.classList.add("show"));
    }, 400);
  });

  /* ─────── Lightbox ─────── */
  function abrirLightbox(i) {
    const p = photos[i];
    if (!p) return;
    lightboxImg.src = p.src;
    lightboxImg.alt = p.caption || "";
    lightboxCap.textContent = p.caption ? fill(p.caption) : "";
    lightbox.hidden = false;
    requestAnimationFrame(() => lightbox.classList.add("show"));
    document.body.style.overflow = "hidden";
  }

  function fecharLightbox() {
    lightbox.classList.remove("show");
    setTimeout(() => {
      lightbox.hidden = true;
      lightboxImg.src = "";
      document.body.style.overflow = "";
    }, 300);
  }

  lightboxClose.addEventListener("click", fecharLightbox);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) fecharLightbox();
  });

  /* ─────── Compartilhar ─────── */
  shareBtn.addEventListener("click", async () => {
    const text = fill(config.shareText || "Olha essa surpresa!");
    const url = location.href;
    if (navigator.share) {
      try { await navigator.share({ title: document.title, text, url }); return; }
      catch {}
    }
    window.open("https://wa.me/?text=" + encodeURIComponent(text + "\n" + url), "_blank");
  });

  /* ─────── Replay ─────── */
  replayBtn.addEventListener("click", () => {
    pararTimer();
    if (fadeTimer) { clearInterval(fadeTimer); fadeTimer = null; }
    if (confettiRAF) { cancelAnimationFrame(confettiRAF); confettiRAF = null; }

    started = false; paused = false; current = 0; activeH1 = null;

    finale.classList.remove("show");
    setTimeout(() => {
      finale.hidden = true;
      story.classList.remove("show");
      scene.innerHTML = "";
      intro.classList.remove("hide");
      startBtn.classList.remove("is-open");
      startBtn.disabled = false;
      nextBtn.hidden = true;
      skipBtn.hidden = true;
      music.pause(); music.currentTime = 0; music.volume = 1;
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 400);
  });

  /* ─────── Teclado ─────── */
  document.addEventListener("keydown", (e) => {
    if (e.target.matches("input, textarea")) return;
    if (document.body.classList.contains("demo-mode")) return;

    if (e.key === "Escape" && !lightbox.hidden) { fecharLightbox(); return; }
    if (e.key.toLowerCase() === "m") musicBtn.click();

    if (started && !nextBtn.hidden && (e.key === " " || e.key === "ArrowRight")) {
      e.preventDefault();
      proximaCena();
    }
  });

  /* ─────── Limpeza ─────── */
  window.addEventListener("beforeunload", () => {
    pararTimer();
    if (fadeTimer) clearInterval(fadeTimer);
    if (dustRAF) cancelAnimationFrame(dustRAF);
    if (confettiRAF) cancelAnimationFrame(confettiRAF);
  });

  /* ─────── API (modo diretor) ─────── */
  window.Surprise = {
    get started() { return started; },
    get paused()  { return paused; },
    get current() { return current; },
    get total()   { return config.scenes.length; },
    scenes: config.scenes,

    start:  () => openEnvelope(),
    next:   () => { proximaCena(); },
    prev:   () => { current = Math.max(0, current - 2); proximaCena(); },
    goto:   (i) => { current = Math.max(0, Math.min(i, config.scenes.length - 1)); proximaCena(); },
    pause:  () => { paused = true; },
    resume: () => { paused = false; },
    toggle: () => { paused = !paused; },
    end:    () => { current = config.scenes.length; pararTimer(); mostrarFinal(); },
    restart: () => replayBtn.click(),
    openGallery: () => { if (photos.length) openGallery.click(); }
  };
});
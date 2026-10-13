/* ============================================================
   CONFIGURAÇÃO — edite APENAS este arquivo
   ============================================================ */

const config = {

  /* ───────────── DADOS BÁSICOS ───────────── */
  birthdayPerson: "Maria",
  sender: "João",

  /* ───────────── RITMO ───────────── */
  delayBeforeStart: 600,     // espera antes da primeira cena
  sceneDuration:    3800,    // só é usado se autoAdvance = true
  autoAdvance:      false,   // false = botão "Continuar" | true = passa sozinho
  fadeOutMusic:     true,    // música vai sumindo no fim?

  /* ───────────── APARÊNCIA ───────────── */
  theme:  "#e3b96b",         // dourado
  accent: "#f39ab6",         // rosa poeira

  /* ───────────── MÚSICA ───────────── */
  music: "happy-birthday.mp3",

  /* ───────────── CENAS ─────────────
     efeitos: "sparkles" | "bokeh" | "confetti"
     duration sobrescreve a duração apenas daquela cena (só faz efeito se autoAdvance). */
  scenes: [
    { text: "Oi, {nome}." },
    { text: "Antes de qualquer coisa…" },
    { text: "respira fundo." },
    { text: "Hoje não é um dia qualquer." },
    { text: "É o dia em que o mundo ganhou você." },
    { text: "E eu queria te lembrar de uma coisa." },
    { text: "Você é luz.", effect: "sparkles" },
    { text: "Cada sorriso seu." },
    { text: "Cada palavra sua." },
    { text: "Cada silêncio também." },
    { text: "Tudo em você importa." },
    { text: "Mais um ano de histórias." },
    { text: "Mais um ano de conquistas." },
    { text: "Mais um ano de você sendo você.", effect: "bokeh" },
    { text: "E eu espero estar por perto em todos." },
    { text: "🎂 Feliz aniversário, {nome}", effect: "confetti" },
    { text: "Que esse novo ciclo seja do tamanho dos seus sonhos." }
  ],

  /* ───────────── CARTA FINAL ───────────── */
  finalEyebrow:   "com todo meu carinho",
  finalTitle:     "Feliz Aniversário",
  finalBody:      "Que este novo ano traga leveza pros dias difíceis, coragem pros desafios e pessoas que te façam bem. Você merece o mundo — e um pouquinho mais.",
  finalSignature: "com amor,\n{remetente}",

  /* ───────────── GALERIA (opcional) ─────────────
     Deixe o array vazio [] para esconder a galeria. */
  galleryEyebrow: "Memórias",
  galleryTitle:   "Nossos momentos",
  photos: [
    { src: "fotos/foto1.jpg", caption: "Aquele dia que a gente não parava de rir" },
    { src: "fotos/foto2.jpg", caption: "Nossa melhor viagem" },
    { src: "fotos/foto3.jpg", caption: "Só nós dois" },
    { src: "fotos/foto4.jpg", caption: "Mais um capítulo da nossa história" },
    { src: "fotos/foto5.jpg", caption: "Momentos simples" },
    { src: "fotos/foto6.jpg", caption: "Pra sempre na memória" }
  ],

  /* ───────────── COMPARTILHAR ───────────── */
  shareText: "Fiz uma surpresa pra você ✨"
};
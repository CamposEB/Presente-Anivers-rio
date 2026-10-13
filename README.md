# 🎂 Presente de Aniversário

Uma experiência interativa para comemorar aniversários de um jeito que emociona.
Envelope que abre, história cinematográfica, carta final e galeria de fotos — tudo
personalizável em um único arquivo.

## 🚀 Demo

👉 [Ver demonstração](https://camposeb.github.io/Presente-Anivers-rio/)

---

## ✨ O que tem dentro

- 💌 **Envelope animado** que abre ao clicar no selo
- 📖 **História em cenas** com transições suaves (avanço manual pelo botão "Continuar")
- 🎬 **Modo cinema** — fundo noturno, luzes que respiram, poeira dourada em canvas
- 🎵 **Player de música** com fade-out no final
- 🎊 **Efeitos especiais** — sparkles, bokeh e confete dourado com física
- ✍️ **Carta final personalizada** com assinatura em caligrafia
- 🖼️ **Galeria de fotos** com lightbox, legendas e navegação por teclado
- 🔗 **Compartilhar** direto no WhatsApp ou via Web Share API
- 📱 **100% responsivo** — funciona igual no celular e no desktop
- ♿ **Acessível** — respeita `prefers-reduced-motion`, navegação por teclado
- 🎬 **Modo diretor** — painel oculto pra gravar vídeos de demonstração

---

## ⚙️ Como personalizar

**Toda a personalização acontece em um único arquivo: `config.js`.** Não é preciso
mexer em mais nada.

Abra o `config.js` com qualquer editor de texto (Notepad, VS Code, etc.) e edite:

```javascript
const config = {
  // Nomes
  birthdayPerson: "Maria",
  sender: "João",

  // Ritmo
  autoAdvance: false,   // false = usuário clica "Continuar"
                        // true  = passa sozinho a cada sceneDuration

  // Cores (hex)
  theme:  "#e3b96b",    // dourado
  accent: "#f39ab6",    // rosa

  // Textos da história
  scenes: [
    { text: "Oi, {nome}." },
    { text: "Hoje não é um dia qualquer." },
    { text: "🎂 Feliz aniversário, {nome}", effect: "confetti" }
  ],

  // Carta final
  finalTitle: "Feliz Aniversário",
  finalBody:  "Sua mensagem aqui...",
  finalSignature: "com amor,\n{remetente}",

  // Galeria (deixe [] para esconder)
  photos: [
    { src: "fotos/foto1.jpg", caption: "Legenda da foto" }
  ]
};
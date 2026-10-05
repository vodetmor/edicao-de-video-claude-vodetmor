# Modelo de brief de motion (para passar a qualquer chat)

Criado em 29/09/2026 a partir do prompt que o Vítor colou (o "caderno de motion" do Twitter, cuja referência está em `anuncio-vslplay/referencias/ref-brain.mp4`). Primeiro uso completo: `anuncio-vslplay/BRIEF.md`.

## Por que esse formato funciona
- **Números no lugar de adjetivos.** "Squash 2,6 por 1 quadro" não deixa espaço para a média genérica que "bonito e premium" produz.
- **Linha do tempo com carimbo de tempo.** Cada trecho tem início, fim, o que entra, como entra e o texto exato na tela.
- **O que é proibido está escrito.** O modelo não "decora" com o que você odeia.
- **Checagem final.** O próprio brief diz como conferir antes de entregar.

## Como usar
1. Estude a referência antes (`SPEC.md` com números medidos, ver `LICOES-MOTION.md` §1). O brief só copia números que foram medidos.
2. Preencha o esqueleto abaixo **em inglês** (os modelos seguem melhor), com todo texto de tela em português, exatamente como vai aparecer, com acentos.
3. Cole junto: o link ou arquivo da referência, as regras do `DESIGN-SYSTEM.md` que importam para a peça e os arquivos reais (logo, prints, dados com fonte).
4. Tudo que está entre `<>` é para trocar. Apague as linhas de orientação (as que começam com `//`).

---

```text
OUTPUT
<width> × <height>, <aspect>, <fps> fps, <duration> s (<frames> frames).
Genuinely smooth motion with directional motion blur only while things move.
Finished video with synchronized audio. Master −14 LUFS integrated, true peak ≤ −1 dBTP. <Voiceover: none | from file X>.

CREATIVE DIRECTION
<One sentence: what the piece is and for whom.>
<Two or three sentences: the single idea that organizes everything (the "spine").
  // ex.: "the real logo is built from its parts, taken apart, and rebuilt; its pieces are the cast">
<What the piece should feel like, in one concrete image.
  // ex.: "a motion designer's notebook", "a documentary evidence board">
Do not introduce <the project's banned list: decorative gradients, background glow, glass,
generic blue/purple, particle explosions, stock footage, emoji, on-screen em-dashes,
redrawn logos, fake product UI, invented numbers>.

VISUAL SYSTEM
Stages: <each background with hex and when it is used; how often they alternate>.
Accents: <one accent per scene or chapter, hex, where it comes from (sampled from the logo, the reference, the brand)>.
Type: <display family + weights + width/tracking + sizes>; <text family + sizes>; minimum 23 px at 1080p;
  tabular figures for numbers. Maximum 2 families.
Decoration: <timecode, timeline, guides, callouts>, always subordinate (opacity ceiling).
Product/UI: <how the real UI is reproduced and from which source (CSS, screenshots)>.
Match the actual reference colors when available.

SEQUENCE
<m:ss.ss> to <m:ss.ss> (f<start> to f<end>) · <SCENE NAME>, <stage>
<What is on screen at the start.>
<Each action in order, with the frame it lands on, the curve and the measured numbers
  (distance per frame, overshoot, stagger, squash ratio, blur).>
<Exact on-screen text in quotes, in Portuguese.>
<How the scene exits and hands its main element to the next one.>
// Repeat per scene. Put cuts and hits on the music grid (beat = frames per beat).
// For every number shown on screen, give the source line that appears on screen.

MOTION REQUIREMENTS
Entrances: approach curve, each frame covers 12 to 19% of the remaining distance.
Camera: symmetric ease-in-out, 30 to 45 frames per trip.
Holds: push-in of about 0.25% per frame; nothing frozen more than 8 frames.
Durations: ≥ 9 frames per move, 15 to 23 for large ones; stagger 2 to 4 frames.
Readability: text still ≥ 8 frames before moving again.
One focal point per frame. Subpixel precision. Crisp still text.
Use anticipation, overlapping action, squash and stretch, follow-through and damped overshoot
where the reference uses them; intentional sharp actions stay sharp.
Preserve continuous velocity through connected moves.
Do not crossfade between stills, duplicate frames, jitter, or wobble without reason.

AUDIO
<BPM and why (match the reference, or frames-per-beat that divide the fps)>.
<Structure: intro, drops, breakdowns, the 0.3 to 0.6 s silence before the biggest impact, the ending>.
<List of sound effects, each tied to a visible action on the exact frame>.
<Mix rules: music under voice 18 to 22 LU below; effects in speech gaps>.

FINAL CHECK
Compare against the reference at matching timestamps: <the moments that matter>.
Verify spelling, numbers against sources, logo against the original file.
Watch the full video at normal speed. Inspect for accidental stops, discontinuities,
repeated frames, broken motion blur, unreadable text, sound off its hit.
A fresh session that did not build it reviews it starting from rejection; nothing ships below 8/10.
Preserve the reference's identity and restraint. Do not substitute a new creative direction.
```

## Dicas que o prompt original ensina
- **Ancore cada anotação ao que ela explica** ("slow in, slow out" ao lado do topo do arco). Anotação solta vira enfeite.
- **Diga o que cada palavra faz, não só o que ela diz** (BOUNCE quica, STRETCH estica, SNAP para seco). Isso transforma lista de recursos em demonstração.
- **Nomeie o que deve continuar ao longo do vídeo** (timecode, timeline, o ponto azul). A repetição é o que dá unidade.
- **Termine pelo "não substitua a direção criativa".** Evita que o modelo "melhore" a referência para o genérico.

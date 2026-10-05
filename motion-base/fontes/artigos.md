# Artigos lidos (resumos extraídos em 28/09/2026)

Os artigos pagos ou do X não abriram inteiros, e isso está indicado em cada um.

## promptteardown: "Claude motion graphics prompt for a promo video"
https://promptteardown.com/blog/ai-prompt-claude-motion-graphics-promo-video/

```text
Make a dynamic 15-second motion graphics video that shows what an
incredible motion designer you are, like it's your showreel. go all
out. make it for [BUSINESS NAME] ([WEBSITE]). The [ONE SHAPE OR COLOR
FROM YOUR LOGO] is the star: it leads every shot, and the eye follows
it from scene to scene. Use the words exactly as written:
"[OPENING LINE]"
"[THING YOU DO 1]"
"[THING YOU DO 2]"
"[THING YOU DO 3]"
"[YOUR OFFER]"
"[TAGLINE AND WEBSITE]"
```
- "Like it's your showreel. Go all out" faz o modelo usar todo o repertório de transições.
- "The [shape] is the star" cria um fio visual que une frases soltas.
- "Use the words exactly as written" impede o modelo de reescrever a copy.
- **Limite:** pedir ajustes em texto corrido "achata" o vídeo. É melhor trocar só o que está entre colchetes e rodar de novo.

## Louise de Sadeleer: "How I make custom motion graphics using Claude Code + Remotion"
https://louisedesadeleer.substack.com/p/how-i-make-custom-motion-graphics
- Pinterest e YouTube como fonte de referência. Comece simples: barras, Venn, texto animado.
- Dê a imagem com pouca instrução e depois itere.
- Para usar vídeo como referência, **extraia quadros com FFmpeg**, porque o Claude não assiste vídeo.
- Exporte em ProRes `.mov` para usar como título ou divisor de capítulo no editor.
- "O gargalo sai da técnica e vai para o gosto."

## dplooy: "Claude Code video with Remotion, best motion guide 2026"
https://www.dplooy.com/blog/claude-code-video-with-remotion-best-motion-guide-2026
- Setup: `npx create-video@latest` com Agent Skills, depois `npx skills add remotion-dev/skills`.
- Remotion é grátis para uso individual. A licença de empresa custa a partir de US$ 1.200/ano, e só é exigida acima de 3 pessoas.
- O ganho está na produção em lote: centenas de variações personalizadas a partir do mesmo componente.

## Revid: "Claude Opus 5.5 motion graphics: 63 examples"
https://www.revid.ai/claude-motion-graphics
- Os formatos que viralizam são showreels curtos (15–32 s), lançamentos de produto, tipografia cinematográfica e plano-sequência.
- Estilos recorrentes: cromado/metálico, pixel art, synthwave, geometria Bauhaus e tipografia mínima.

## Pagos ou bloqueados (só a introdução estava visível)
- Charlie Hills, "Claude Code motion graphics and video with Opus 5.5": https://charliehills.substack.com/p/claude-code-motion-graphics (menciona "6 free motion graphics skills")
- Daria Cupareanu, "Claude Design Animations": https://aiblewmymind.substack.com/p/claude-design-animations
- Movez, "How to build motion design studio with Opus 5.5 (full course)": https://x.com/0xMovez/article/2104216919033192746 (X)
- **@notdwd**: https://x.com/notdwd/status/2104684539142648062 (X, **pendente: colar o texto**)

## Repositórios úteis
- HyperFrames (HeyGen): https://github.com/heygen-com/hyperframes. Os documentos principais estão copiados em `hyperframes/`.
- Motion-graphics skills para Claude Code: https://github.com/Barty-Bart/motion-graphics
- Guia Claude + Remotion: https://github.com/ThamJiaHe/claude-code-handbook/blob/main/docs/motion-graphics-claude-remotion-guide.md
- Biblioteca de prompts virais: https://github.com/0xpratzyy/specimen-and-signal (convertida em `prompts/prompts-virais-opus.md`)

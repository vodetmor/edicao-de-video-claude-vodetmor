# Estado: ponte com os apps "Craft" (storytold) · 08/10/2026

Notas de pesquisa completas: `motion-base/fontes/ferramentas/storytold/NOTAS.md`.

## O que é
EffectCraft (After Effects) e FilmCraft (Premiere) em Rust, código aberto (MIT/Apache-2.0), sem tela,
dirigíveis por linha de comando, script JS no modelo do After Effects e servidor MCP.
Aqui eles entram como **fornecedores de peças** para o nosso motor Remotion, não como substitutos.

## Feito (08/10/2026)
- `instalar.sh`: baixa os binários oficiais do GitHub e confere o SHA256 (≈ 30 s; compilar leva 13 min).
- Testado na nuvem, só CPU:
  - EffectCraft: script `.jsx` monta comp → PNG em 30–80 ms/quadro, MP4 1080p 3 s em 10 s, ProRes 4444 com alfa, Lottie.
    Servidor MCP headless respondeu (22 ferramentas). Expressão de mola do AE funciona; para Lottie, "assar" com
    `prop.convertExpressionToKeyframes` antes de exportar (Lottie ignora expressões por padrão).
  - Ponte: o mesmo cartão em Lottie (`@remotion/lottie`, já no motor) e em ProRes 4444 (`<OffthreadVideo transparent>`)
    saiu idêntico dentro do Remotion (`provas/ponte-sheet.png`, `provas/ponte.mp4`).
  - FilmCraft: importa clipes, monta sequência, legenda queimada, exporta H.264+AAC e a timeline em FCPXML/OTIO/XML do
    Premiere/EDL/AAF (`provas/filmcraft-legenda.png`).
  - VectorCraft: `.ai` compatível com PDF → SVG limpo (útil para logo real de cliente).

## Refazer
```
bash /mnt/project-files/estudio/craft/instalar.sh            # effectcraft + filmcraft em ~/craft/bin
EC=~/craft/bin/effectcraft-cli
$EC script exemplos/cartao.jsx --empty --save-as cartao.ecproj
$EC run prop.convertExpressionToKeyframes '{"layer":"Squircle","path":"transform/scale"}' \
    file.exportLottie '{"comp":"Cartao","path":"'$PWD'/cartao.json","textAsShapes":true}' --project cartao.ecproj --save
$EC render --project cartao.ecproj --comp Cartao --out cartao.mov --format prores --prores 4444 --channels rgba
# Remotion: copiar exemplos/remotion/{index.ts,Raiz.tsx} para motor/src/teste-craft/ e cartao.json/.mov para motor/public/craft/
npx remotion render src/teste-craft/index.ts TesteCraft out/ponte.mp4
FC=~/craft/bin/filmcraft-cli
$FC import $PWD/a.mp4 $PWD/b.mp4 --save-as t.fcproj && $FC run exemplos/filmcraft-passos.jsonl --project t.fcproj --save
$FC export t.mp4 --project t.fcproj --settings '{"burnCaptions":true}'
# MCP (Claude Code): claude mcp add effectcraft -- ~/craft/bin/effectcraft-cli mcp
```

## DECISÃO 08/10/2026 19:21 UTC
Vítor achou o visual horrível: "remotion + javascript é muito melhor". Bloco `Craft` NÃO será feito. Pasta fica só como registro e utilitário (VectorCraft .ai→SVG, FilmCraft FCPXML).

## Próximo passo (cancelado)
- Esperar o Vítor decidir o uso. Proposta: bloco `Craft` no motor (spec aponta para um `.jsx`/`.ecproj` e o motor
  renderiza ProRes 4444 ou Lottie e encaixa na palavra falada) para o que o Remotion não faz bem: 3D com luz e
  sombra, partículas, Fractal Noise, tracking, keying/roto, expressões do AE vindas de tutoriais.
- Nunca usar como master final de áudio/vídeo ainda (app de 1 semana); ffmpeg continua sendo o fecho.

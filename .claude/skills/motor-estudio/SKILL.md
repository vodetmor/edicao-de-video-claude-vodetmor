---
name: motor-estudio
description: Como usar o nosso motor de vídeo "Estúdio" (Remotion + spec JSON com eventos presos às palavras faladas, blocos, variações em lote, GLSL). Use ao fazer criativos, ganchos, variações de anúncio ou ao adicionar blocos ao motor.
---

# Motor "Estúdio"

Código em `estudio/motor/`. Estado e decisões em `estudio/ESTADO.md`; plano em `organizacao/ESTUDIO-PLANO.md`. Shaders/3D em `estudio/glsl/` e `estudio/motor/src/glsl/`.

## Ideia
Uma composição Remotion genérica ("Video") lê uma spec JSON (`specs/*.json`). Cada evento é ancorado numa palavra falada em vez de um segundo fixo: `"botão"`, `"botão#2"` (2ª ocorrência), `"oferta:fim+6"` (6 quadros após o fim da palavra), `"@45"` (quadro 45), `"fim"`. Os blocos vêm de um catálogo (`src/motor/blocos/`: Batida, Slam, Botao, Trilha, Legenda, HtmlGsap). Trocar copy, cor ou formato = trocar a spec, não o código.

## Rodar
```
cd estudio/motor && npm i
python3 -m pip install numpy scipy pillow
python3 audio/sons.py                 # só se mudar voz/efeitos
node fabrica.mjs specs/gancho-c2.json # todas as variantes; "... A,C" escolhe; "--stills" só quadros
```
Saída em `out/<spec>/<variante>.mp4`, já normalizada a -14 LUFS.

## Decisões do Vítor
- Linguagem A (tipografia React: título subindo da máscara, botão com mola, palavra batendo) é o padrão dos criativos: "muito mais fluido".
- Só Remotion. HyperFrames = livro de receitas a reescrever em React (`motion-base/fontes/hyperframes/`); Hypit = só a ideia de ancorar na palavra. A ponte HtmlGsap fica como plano B.
- Cada técnica nova aprendida vira um bloco no catálogo + uma lição em LICOES-MOTION.

## Próximos passos do plano
Portar blueprints do HyperFrames, testar Lottie (`@remotion/lottie`), módulo "anúncio escalado" (modelar anúncios que escalaram no Meta/TikTok; Apify actor `apify~facebook-ads-scraper` funciona), kit de prompts do Google Flow. Chaves pagas futuras: `estudio/motor/.env.exemplo` → `.env`.

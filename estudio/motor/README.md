# Estado: Estúdio (nosso motor de vídeo)

Plano completo: /mnt/project-files/organizacao/ESTUDIO-PLANO.md

## Feito (02/10/2026)
- Motor genérico em Remotion: `motor/`. Uma composição só ("Video") que lê uma SPEC em JSON (eventos presos a palavras) e monta blocos React, cenas HTML/GSAP (estilo HyperFrames) e sons.
- Teste "gancho do criativo 2" com 3 variações em `teste-gancho/` (5,3 s cada, -14 LUFS, render de 7 a 9 s cada):
  - A: tipográfico em React (9:16). B: cena HTML + GSAP escrita do jeito HyperFrames rodando dentro do Remotion (9:16). C: feed 4:5 com outra copy e outra cor, só mudando a spec.

## Peças do motor
- `src/motor/ancora.ts`: "botão", "botão#2", "oferta:fim+6", "@45", "fim".
- `src/motor/Video.tsx`: composição genérica + calculateMetadata (formato e duração saem da spec).
- `src/motor/blocos/`: Batida, Slam, Botao, Trilha, Legenda, HtmlGsap (catálogo em index.ts).
- `public/html/*.html`: cenas HTML/GSAP. O script recebe gsap, root, M (segundos das palavras), W, H e devolve `tl`. `$static/` = pasta public.
- `audio/sons.py`: efeitos sintetizados + corte da voz + cama com ducking. `fabrica.mjs`: renderiza todas as variações e normaliza o áudio.

## Refazer (numa pasta fora do /mnt)
```
cp -r /mnt/project-files/estudio/motor ~/motor && cd ~/motor && npm i
python3 -m pip install numpy scipy pillow   # se faltar
python3 audio/sons.py                        # só se mudar voz/efeitos
node fabrica.mjs specs/gancho-c2.json        # todas; ou: ... A,C   ou: ... --stills
```
Saída: `out/<spec>/<variante>.mp4`.

## Próximo passo
- Esperar o Vítor escolher a linguagem preferida dos 3 testes e o primeiro brief/anúncio escalado.
- Depois: portar os blueprints do HyperFrames para o catálogo, testar Lottie, módulo "anúncio escalado" e kit de prompts do Flow (ver plano, seção 6).

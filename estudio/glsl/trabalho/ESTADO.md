# Estado: vídeo GLSL "Isso não foi filmado" (thread GLSL, 02/10/2026)

Plano aprovado por padrão (Vítor pediu plano em PDF e depois construir): ../plano/plano-glsl.pdf (fonte .html ao lado).
Referência estudada: github.com/oprogramadorreal/pdoom-video (MIT), clone em scratchpad (não guardado; reclonar se precisar).

## Feito
- Camada GLSL no motor: motor/src/glsl/Shader.tsx (canvas WebGL2, uniforms por quadro). Render precisa de `--gl=angle` (ou chromiumOptions.gl='angle').
- Testes: ../testes/teste-3d-raymarching.png/.mp4 (30 quadros em 19 s na nuvem).
- Locução: voz/voz.py (edge-tts Thalita, frase por frase com respiros) -> voz/voz.wav + voz/palavras.json (28,43 s).

## Próximo
- comum.ts, chaves.ts, blocos Objeto3D/Campo/Dissolve/Acabamento/Hud/Rotulo, spec specs/glsl-vitrine.json, áudio, render, crítica.
- Depois: teste do cavalo galopando (esqueleto + SDF), prometido ao Vítor.

## 02/10/2026 22:25 UTC: quadros-chave enviados, ESPERANDO aprovação do Vítor
- Vítor pediu (22:00): antes do vídeo completo, mostrar storytelling + quadros-chave para aprovar (processo do VSL Play).
- Prancha: ../keyframes/quadros-chave.pdf (12 quadros reais, fonte .html ao lado).
- Código da vitrine: motor/src/glsl/Vitrine.tsx (uniforms por palavra em K), cena.ts (raymarching), overlays.ts (Dissolve, Acabamento), comum.ts (biblioteca), motor/src/motor/chaves.ts.
- Quadros: `cd ~/motor && node glsl-stills.mjs <pasta> 0.9,2.0,...` (segundos). Render completo: `npx remotion render src/index.ts GlslVitrine out/glsl.mp4 --gl=angle --concurrency=4`.
- Falta depois do OK: motion blur no giro (CameraMotionBlur), som (cama + efeitos + ducking, -14 LUFS), render, crítica com sessão nova, lições na motion-base. Depois: teste do cavalo.
- Atenção âncoras: normaliza tira acento, então "É" = "e" (1ª ocorrência é "E também"); "A" = "a" (1ª é "a luz"). Use palavras únicas ("uma-4", "mesma-3").

## 02/10/2026 23:15 UTC: quadros aprovados ("sim foda aprovadisso"); render final em andamento
- Teste do cavalo DISPENSADO pelo Vítor (23:10). Código fica em motor/src/glsl/Cavalo.tsx só como referência.
- Som: motor/audio/glsl_som.py -> public/audio/glsl/mix.wav (voz + cama ducked ~18 LU abaixo + efeitos) e so_musica.wav.
- Motion blur: CameraMotionBlur (8 amostras) só no giro "modelado".
- Render retomável: `cd ~/motor && bash glsl-render.sh` (blocos de 60 quadros em trabalho/blocos/, pula os prontos; log em trabalho/render.log). Saída: estudio/glsl/isso-nao-foi-filmado.mp4.
- Se o container reiniciar: `cp -r /mnt/project-files/estudio/motor ~/motor && cd ~/motor && npm i` e rodar o script de novo.
- Depois: crítica com sessão nova, ajustes, entrega.

## 03/10/2026 00:45 UTC: ENTREGUE
- estudio/glsl/isso-nao-foi-filmado.mp4 (28,4 s, 1920x1080, 30 fps, -14,1 LUFS). Revisão dispensada pelo Vítor ("é só uma amostra"). Esperando a opinião dele.
- Render levou ~62 min na nuvem (15 blocos de 60 quadros). Pico amostral -0,3 dBFS: se for reaproveitar, fazer loudnorm em 2 passadas.

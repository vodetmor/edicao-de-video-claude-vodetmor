# Meu Terceirão: ESTADO

## Feito (12/11/2026)
- Músicas em MP3: `musica/tempo-perdido.mp3` (5:02) e `musica/pelo-tempo-que-durar.mp3` (3:20).
- Áudio do piloto (80,6 s): `musica/piloto-audio.mp3` = Tempo Perdido 12,0→41,2 s + 122,4→154,6 s + 185,3→206,5 s, crossfades de 1 s, fade-out 76,5→81 s. Letra com tempo por palavra conferida: `musica/piloto-audio.palavras.json`.
- Inventário da 232: 45 fotos renomeadas em `fotos/f01v..f45h` (h = horizontal, v = vertical), 15 vídeos (`videos/` tem só as miniaturas; os mp4 ficam em `232/`), folhas de contato `fotos/_folha.jpg` e `videos/_folha.jpg`. Pasta `231/` ainda vazia.
- Recortes de pessoas (rembg u2net) em `recortes/` (f22h usado no efeito de profundidade).
- TV de tubo real (Pexels, livre) em `referencias/tv-crt/` (licença em LICENCAS.md); usada a #8.
- Composição Remotion: `estudio/motor/src/obras/terceirao/Terceirao.tsx` (id `Terceirao`, 1920x1080, 30 fps, 2430 quadros). Assets copiados para `estudio/motor/public/terceirao/` (fora do Git).
- Quadros-chave: `previa/quadros/_folha-quadros.jpg`.
- Prévia 720p: `previa/piloto-720p-bruto.mp4` (render) → `previa/piloto-720p.mp4` (loudnorm -14 LUFS).

## v2 (12/11/2026, depois do 1º piloto): feedback do Vítor aplicado
- Todas as 45 fotos no vídeo (tira de filme em "mas tenho muito tempo" absorveu f16h, f25h, f33v, f35h); conferido por script (só f22h e f13h repetem de propósito).
- "tempo": recorte e fundo com a mesma transformação (sem meninas duplicadas); fundo desfoca quando a palavra entra.
- Cor: nada de P&B; filtro quente/amarelado de lembrança (sepia 0,38, saturate 1,4) → cor viva.
- Intro: sala retrô quente (Pexels #12: TV, xadrez, videogame, vaso) no lugar da TV no escuro; câmera parte da sala inteira e entra na tela.
- Referências PMV do Vítor (links.md) → scrapbook: papel kraft + fita + sombra de planta no mural, vazamento de luz nas trocas de cena, parede "tempo" atrás da tira, HUD REC no clipe, fecho "terceirão" com a turma dentro das letras.
- Assets novos em `estudio/motor/public/terceirao/`: tv2.jpg, papel.jpg, planta-sombra.png, recortes PNG.

## Decisões do Vítor
- Piloto 60–90 s com começo/meio/fim, Tempo Perdido; horizontal; sem fala; todas as fotos ficam (a do trote também); direitos da música não preocupam (exibição interna).
- Intro "lembranças": TV de tubo real com fita VHS dentro (PLAY, timecode, chuvisco, scanlines) e a câmera entra na tela. Blender descartado (sem GPU, sem referência).
- Uma ideia tipográfica por frase (foco, passa, cresce, profundidade com recorte, encosta, afasta, dissolve, extrusão 3D) e transições de edit (zoom, empurra com blur direcional, cruza).
- Efeito "lembrança" (bordas clareiam e desfocam, brilho sobe) nos picos: entrada pela TV, "temos todo o tempo do mundo", "somos tão jovens". Só nas fotos, nunca no texto.

## Como refazer
```
cd estudio/motor
npx remotion still src/index.ts Terceirao saida.jpg --frame=800          # um quadro
npx remotion render src/index.ts Terceirao previa.mp4 --scale=0.6667     # 720p
npx remotion render src/index.ts Terceirao final.mp4                     # 1080p
ffmpeg -i previa.mp4 -af loudnorm=I=-14:TP=-1:LRA=11 -c:v copy saida.mp4 # master
```
Trocar a música: refazer `piloto-audio.mp3` (ffmpeg atrim/acrossfade), transcrever com `groq_transcrever.py --palavras` e atualizar a tabela `T` no .tsx.

## Próximo passo
- Vítor avaliar a prévia 720p; ajustes pontuais na fonte; depois render 1080p.
- Quando chegar a 231: entram no Mural (D) e na sequência final; nada precisa ser refeito.
- Versão completa de 5 min: 5 atos do plano em `referencias/PESQUISA.md`.

## Feedback do Vítor sobre a v2 (12/11/2026 18:55) — PARADO até o Luiz mandar a 231; a próxima edição é a FINAL (5 min)
1. Fundo de papel kraft ("branco com pelos"): fora. Incomodou muito.
2. Efeito "lembrança": não é vinheta branca. É o BRILHO subindo com leve desfoque (bloom), sem véu nas bordas.
3. Mural sem senso de 3D (fotos diminuíram, fundo não). Fazer 3D de verdade: câmera num espaço 3D, cenário 3D, transições 3D (three/GLSL do motor liberados).
4. Faltaram os vídeos: todos entram, trecho divertido de cada, música abaixa e o som do vídeo toca como lembrança.
5. Faltou motion 3D de cenário e transições.
6. Textos: "DF" (não SP), "Escola La Salle Sobradinho", 2026. Fotos de vários anos.
7. Final: 232 + 231 misturados (grupo de amigos), nunca separado por sala. Todas as fotos e vídeos das duas turmas.

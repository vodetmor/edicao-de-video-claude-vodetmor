# Vitrine de estilos (Jerônimo) · ESTADO

Pedido (30/10/2026): Jerônimo grava ~30 s "não sei editar, uma gravação virou vários vídeos"; Vítor quer edição
fora da curva, por código, nível das aulas de física/matemática e do racismo ambiental, com referências do X.
Roteiro enviado no thread em 30/10 (frase por estilo). Áudio dele transcrito: outros/maquina-edicaoia/contexto-jeronimo/audio-2026-10-29-WA0168.txt.

## Direção (v1)
O vídeo principal troca de estilo na palavra em que ele fala o nome do estilo. Cada estilo é um cartão que toca ao vivo
(edições reais). Câmera presa a palavras: foco (cartão em tela cheia) · leque (5 cartões em perspectiva) · grade (3+2 + "1 gravação / 5 vídeos / 0 edição").
- Cartão 0 "Estúdio": bruto com interface de câmera (REC, tempo, terços) e palavra gigante ATRÁS da cabeça; o quarto vai embora (wipe) e fica estúdio preto.
- 1 Corte seco (reels-forte) · 2 Tela dividida (split) · 3 Aula (moldura) · 4 3D: objetos 3D orbitando e passando atrás da cabeça.
- CTA: "EDIÇÃO" gigante atrás da cabeça + campo de comentário digitando.
- Paleta: preto #0A0A0B, osso #F2F2EF (Jerônimo pediu preto e branco); REC vermelho é o único vermelho.

## Peças (repo estudio/editor)
- pipeline/recortar.py: pessoa recortada (rembg u2net_human_seg, ~1 s/quadro, webm com alfa). BiRefNet = 45 s/quadro, inviável em CPU.
- remotion/src/Vitrine.tsx + Orbita.tsx (composição "Vitrine"); renderizar.mjs --vitrine projeto/vitrine.json [--quadros --quadros-em 1,3.5,...].

## Próximo
Quadros-chave com o bruto de teste (IMG_4309) para aprovação → bruto novo do Jerônimo → limpar.py, recortar.py, vitrine.json com as palavras dele → som (whoosh nas trocas, riser no leque, trilha com ducking) → crítica → render.

## v5 · roteiro novo (30/10/2026, noite)
- Visual 'colagem' (paleta do Claude via ferramentas/paleta/paleta.py: papel #E1DDD6, terracota #D97757, tinta #110E0D).
- Motion único da IA (src/MotionIA.tsx, ligado por `palco.ia`): 2,1 s "Nunca" a tela divide; janela do programa cai; carimbo
  NUNCA ABERTO em "vida"; "Mesmo" entra o asterisco real do Claude; clipes cortados e juntados; barra QUALIDADE 0→100% + check em "qualidade"; "E" volta ao estúdio.
- Câmera: atras em "virou", foco 1..4 em corte/tela/aula/objetos, grade em "Uma" (fecho por palavra: gravação#2/Cinco/Zero), CTA em "Quer"/"Comenta".
- Stand-in: /tmp/claude-0/ed/roteiro-jer (base antiga em laço + voz edge-tts provisória). JSON: trabalho/vitrine-roteiro-novo.json.
- Refazer: `node renderizar.mjs <proj> --vitrine trabalho/vitrine-roteiro-novo.json --nome v5` (projeto precisa de assets/claude.svg = motion-base/logos/lobehub-claude-color.svg e assets/musica.mp3).
- No PC do Vítor existe outra versão do motion da IA (HTML, roteiro antigo "grava uma vez / joga nessa IA") em Backup-GitHub/outros/oferta-edicao-ia-jeronimo/motion-ia/trabalho/.

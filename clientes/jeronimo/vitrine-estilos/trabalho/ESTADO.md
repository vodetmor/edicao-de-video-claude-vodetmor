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

## v6 (30/10 03:10 UTC): feedback do Vítor na v5
Música = Scott Buckley "Catalyst" (CC BY 4.0, crédito na descrição: "Música: Catalyst, Scott Buckley, scottbuckley.com.au, CC BY 4.0"), trecho 78–120 s normalizado a −16 LUFS → assets/musica.mp3.
Efeitos esparsos e variados (sons/sfx_ar, _baque, _thud-suave = versões filtradas). Print real assets/programa-davinci.png
(Wikimedia "DaVinci resolve 17 screenshot.png", CC BY-SA 4.0). Leque 'atras' novo (palco desce, versões em cima).

## v7 (30/10 ~03:30 UTC)
Formato da ref "8 Claude effects": camera modo 'app' (src/AppClaude.tsx) antes de cada versão: digita a skill, "Editando com…",
miniatura com dissolução em pixels, zoom no nome da versão. Prévia: previas/vitrine-previa-v7.mp4. JSON atualizado em
trabalho/vitrine-roteiro-novo.json (assets copiados para trabalho/). Esperando opinião do Vítor e o bruto do Jerônimo.

## Bruto OFICIAL (30/10 ~03:50 UTC) → previas/jeronimo-oficial-v1.mp4
Bruto: bruto/video-raw-jeronimo-oficial.mp4 (576x1024, 25 fps). Projeto de trabalho: /tmp/claude-0/ed/jer-oficial (novo_projeto.py + limpar.py
--parar-nos-cortes; pausas < 0,4 s mantidas; "Eu" inserido à mão em base-palavras (Whisper errou o início); montar.py, enquadrar.py, recortar.py).
Cópias em trabalho/oficial/ (vitrine.json, cortes.json, base-palavras.json, rosto.json, assets: música Acuarium de Dj-Nen CC BY 3.0 trecho 186–222 s,
claude.svg, programa-davinci.png, miniatura.jpg). Novidades: palco.melhora (varredura de luz/cor + zoom no rosto), digitação com autocompletar, gráfico novo.
Refazer: node renderizar.mjs <proj> --vitrine <proj>/projeto/vitrine.json --nome jeronimo-v1
Créditos na descrição: "Música: Acuarium, Dj-Nen (Jamendo), CC BY 3.0 · Print: DaVinci Resolve 17 (Wikimedia Commons, CC BY-SA 4.0)".

## v2 oficial (31/10 ~01:10 UTC) → previas/jeronimo-oficial-v2(-celular).mp4
Jerônimo achou a v1 amadora comparada à vitrine do edicaomia.com.br. v2 = tema 'estudio' (grafite #0F0E0D, destaque #D97757,
tinta #F4F1EC), PainelIAEstudio, LegendaCaixa, baseCartoes = assets/base-estudio.mp4 (gerado: fundo-estudio.png + pessoa.webm com eq,
comando ffmpeg no histórico; refazer: overlay de pessoa.webm sobre fundo-estudio.png). Gráfico da aula começa em "com#3".

## v3 (31/10/2026 01:55 UTC) — entregue: previas/jeronimo-oficial-v3(-celular).mp4
Pedido: animações fluidas, legenda dinâmica, cores, divisão, fontes (filtro do Jerônimo aprovado, mantido).
Feito: saída a 50 qps (`fpsSaida: 50` no vitrine.json, relógio da base via useQuadroBase), app entra com fade+mola,
legenda dinâmica (Geist + Bricolage na palavra forte, cor do tema; crua no trecho "0 editado"), divisão em 2 cartões
arredondados com calha, grafite frio (#0D0E10) sem brilho laranja forte. Refazer:
node renderizar.mjs /tmp/claude-0/ed/jer-oficial --vitrine <proj>/projeto/vitrine.json --nome jeronimo-oficial-v3

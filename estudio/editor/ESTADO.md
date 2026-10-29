# Estado: editor de vídeo falado (estudio/editor)

## Feito (29/10/2026)
- Pipeline Python: transcrição local (faster-whisper large-v3-turbo, grátis), proposta de cortes (energia do áudio,
  tomadas repetidas, pedidos "corta", repetições, vícios), montagem da base com voz tratada, rosto quadro a quadro (YuNet).
- Remotion próprio (`remotion/`): composição `Editor` com 5 layouts e troca por mola, recorte pelo rosto, punch-in,
  9 elementos explicativos, 5 estilos de legenda, marca configurável. `renderizar.mjs` (quadros, amostra, trecho, final).
- Painel de revisão `painel.mjs` (localhost:8080): prévia ao vivo pelo Remotion Player, notas no quadro exato em
  `projeto/revisao/notas.json`, recarrega sozinho quando o projeto ou o código mudam. Testado com Playwright.
- 5 estilos testados no bruto do Jerônimo (IMG_4309, 20,2 s → 17,5 s): split, corte-limpo, moldura, painel, reels-forte.
  Vídeos e folhas em /mnt/project-files/outros/maquina-edicaoia/teste-editor/ (mídia fora do Git).
- Skill `.claude/skills/editar-video` (SKILL.md + 9 referências) escrita para "o usuário", sem nomes do projeto.

## Próximo passo
- Feedback do Vítor nos 5 estilos. Depois: elemento `mapa` (Canvas funil / Funil Miro do Jerônimo), B-roll em tela
  cheia, `ranking`, exemplo 16:9 de aula, teste de recorte com alfa (5 s).
- Empacotar para venda (instalador, skills por estilo) só depois da decisão de produto.

## Refazer o teste
```
python3 -m pip install faster-whisper opencv-python-headless numpy scipy
cd estudio/editor/remotion && npm i && cd ../pipeline
python3 novo_projeto.py /tmp/teste --video <bruto.mp4>
python3 limpar.py /tmp/teste
cp ../estilos/exemplos/split.json /tmp/teste/projeto/roteiro-visual.json   # só serve para a fala do teste
cd ../remotion && node renderizar.mjs /tmp/teste --quadros && node painel.mjs /tmp/teste
```

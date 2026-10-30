# Editor de vídeo falado

Pega um vídeo bruto de alguém falando e entrega o vídeo editado: sem pausas e tomadas repetidas, rosto sempre
centralizado, legenda sincronizada e um estilo visual (tela dividida, moldura com quadro, corte limpo...).
Funciona para qualquer usuário, em qualquer computador sem placa de vídeo. O Claude **dirige** (escolhe estilo,
escreve o roteiro visual, revisa); o trabalho pesado é feito por **scripts**, que não gastam token.

Skill que conduz tudo: `.claude/skills/editar-video/` (comece por ela).

## Fluxo (um projeto = uma pasta)

```
python3 pipeline/novo_projeto.py <pasta> --video bruto.mp4      # cria originais/ assets/ projeto/ entregas/ + briefing
python3 pipeline/limpar.py <pasta> --ritmo conteudo             # transcreve, propõe cortes, monta a base, acha o rosto
#   o Claude escreve <pasta>/projeto/roteiro-visual.json a partir de projeto/transcricao-base (ver skill)
node remotion/renderizar.mjs <pasta> --quadros                  # quadros-chave para aprovar a direção (segundos)
node remotion/painel.mjs <pasta>                                # http://localhost:8080 : prévia AO VIVO + notas no quadro exato
node remotion/artefato.mjs <pasta> --saida <tmp>                # o mesmo painel como artefato do claude.ai (notas no banco do artefato)
#   visual padrão dos dois: vidro preto e branco; --visual claro para o claro
node remotion/renderizar.mjs <pasta> --amostra 8                # amostra curta renderizada
node remotion/renderizar.mjs <pasta> --nome V01                 # vídeo final em entregas/V01.mp4 (-14 LUFS)
```

## O que tem aqui

| Pasta | O quê |
|---|---|
| `pipeline/` | Python: `transcrever.py` (faster-whisper local, grátis; Groq opcional), `cortes.py` (pausas pela energia do áudio, tomadas repetidas, "corta", repetições, vícios), `montar.py` (aplica cortes, trata a voz, remapeia as palavras), `enquadrar.py` (rosto quadro a quadro, YuNet), `limpar.py` (tudo junto), `novo_projeto.py`. |
| `remotion/` | Projeto Remotion próprio: composição `Editor` (layouts cheio / split / split-cima / moldura / tela com transição por mola, recorte pelo rosto, punch-in, 9 elementos explicativos, 5 estilos de legenda), `renderizar.mjs`, `painel.mjs` (painel de revisão), `icones.lista.txt` (Phosphor). |
| `estilos/` | `CATALOGO.md` (prontos e planejados, incluindo o mapa dos estilos de referência do mercado) e `exemplos/` (um roteiro visual por estilo). |
| `modelos/` | Briefing, ficha de custos, matriz de variações. |

## Instalação (uma vez)

- Python 3.10+, Node 18+, ffmpeg no PATH.
- `python3 -m pip install faster-whisper opencv-python-headless numpy scipy`
- `cd remotion && npm i` (o Remotion baixa sozinho um Chrome para renderizar, se não houver).
- Primeira transcrição baixa o modelo de fala (~1,6 GB o `large-v3-turbo`; `--modelo small` tem ~0,5 GB e é mais rápido em PC fraco).

## Tempo medido (CPU de 4 núcleos, sem GPU, vídeo de 20 s em 720p)

Transcrição 18 s · cortes < 1 s · montagem 13 s · rosto 10 s · quadros-chave 30 s · render final ~60–70 s.

## Licenças das peças

Remotion (licença própria: grátis para pessoa física e empresas pequenas; empresa maior precisa de licença, ver remotion.dev/license),
faster-whisper (MIT), modelo YuNet de rosto (MIT, OpenCV Zoo), ícones Phosphor (MIT), Inter e Archivo (OFL).

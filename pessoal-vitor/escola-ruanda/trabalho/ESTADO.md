# Ruanda · ESTADO (23/11/2026 19h BRT)

Vídeo escolar de um grupo (não é do Vítor): "Guerra Civil e Genocídio de Ruanda". Ordem: Anna Júlia, Ana Isabel (falta), Maria Alice, João Victor, Eustáquio, Joaquim.

## Feito
- `originais/`: 5 áudios como chegaram.
- `audio/limpo/`: limpos e no mesmo volume (-16 LUFS). Refazer: `for f in originais/*; do n=$(basename ${f%.*}); python3 scripts/limpar_voz.py $f audio/etapa1/$n.wav; done; python3 scripts/acabar_vozes.py audio/etapa1 audio/limpo` (precisa `pip install deepfilternet torch torchaudio` + patch em df/io.py do import torchaudio.backend + modelo em /tmp/claude-0/dfm/DeepFilterNet3 vindo de raw.githubusercontent.com).
- `transcricoes/`: texto com tempos (Maria Alice e Joaquim corrigidos à mão). Groq: chave em `.env` (GROQ_API_KEY, fora do Git); `curl api.groq.com/openai/v1/audio/transcriptions -F model=whisper-large-v3`.
- `ANALISE.md`: o que cada um cobre, erros (Maria "8 mil", João "1984"), lacuna 1990-93 e briefing da Ana Isabel.

## Direção (Vítor 23/11)
Estilo DIFERENTE da casa: documentário simples e limpo, com arquivo real (fotos, documentos, prints de notícias com trechos grifados), fontes creditadas, nada gráfico. Modular: cada fala é um segmento com render próprio; slot da Ana Isabel pronto para encaixar e sair rápido.

## Produção (Vítor liberou produzir direto, 23/11 19h31)
- Motor: `video/` (Remotion). Cada parte = `video/public/segmentos/<n>-<id>.json` (eventos presos às palavras faladas: foto, doc, mapa, texto; selos checagem/contexto). Fala editada + legenda corrigida em `video/public/falas/` (gerado por `scripts/prep_falas.py`).
- Visual: documentário de arquivo. Preto quente, Source Serif 4 + IBM Plex Mono, legenda Inter 500 numa faixa preta embaixo (nunca sobre papel/foto), fotos de 1994 em P&B, hoje em cor, documentos reais com marca-texto na frase exata (posição via `scripts/docs_marca.py`: pdftotext -bbox ou OCR tesseract).
- Arquivo: `arquivo/docs/` (PDFs ONU e despachos), `arquivo/fotos/` (Wikimedia + Pexels; créditos em `arquivo/fotos/creditos.csv` e `pesquisa/pexels-Kigali/LICENCAS.md`).
- Render: `bash video/render.sh <partes...>|todos` (cada parte vira `video/renders/partes/*.mp4`, node_modules em /home/user/ruanda-nm, recriado sozinho). Juntar + música + master: `python3 video/montar.py` -> `video/renders/ruanda-previa.mp4`. Conferir quadros: `bash video/stills.sh <parte> <segundos...>`; faltas: `python3 scripts/verificar.py`.
- Música: "Tears in Rain", Scott Buckley (CC BY 4.0), -36 LUFS sob a voz, -23 nos cartões; master -14 LUFS / -1 dBTP.

## Quando a Ana Isabel mandar
`bash scripts/chegou_audio.sh <arquivo> ana-isabel` -> escrever eventos em `video/public/segmentos/2-ana-isabel.json` (tirar "aguardando"; material pronto: mapa-relevo com pino em Uganda, bandeira-fpr, doc res872 marca 0 = Arusha, doc res872b = UNAMIR) -> `bash video/render.sh 2-ana-isabel` -> `python3 video/montar.py`. Só a parte dela renderiza (~2 min).

## Pendências
- Wikimedia bloqueou downloads (429) em 23/11 ~22h40 UTC. Faltam fotos do Joaquim (refugiados x4, gacaca, memorial x2) e o fundo do encerramento (memorial-jardim). Download lento rodando com /tmp/claude-0/s/pega.py (lista em /tmp/claude-0/s/lista.txt). Partes 1,3,4,5 trocaram foto que faltava por documento/cartão de texto; dá para voltar às fotos (kagame, memorial, belgas, boinas, kangura) quando baixarem.

## Regra: SEM regravações (Vítor 23/11). Correções na tela
Formato: valor dito riscado + valor certo + selo "Correção" com fonte; legenda já corrigida; voz intacta.
| Fala | Tempo | Dito | Certo | Como | Fonte |
|---|---|---|---|---|---|
| Maria Alice | ~79,5 s | "8 mil" | ~800 mil | ~~8 mil~~ → 800 mil, selo Correção | ONU / IRMCT |
| João Victor | ~2,7 s | "em 1984" | 1994 | ~~1984~~ → 1994 (alternativa: cortar "em 1984") | — |
| João Victor | ~74 s | "2.165" soldados | ~2.500 (→ 270) | selo Contexto + Resolução 912 do CSNU | S/RES/912 (1994) |
| Ana Isabel | ~30 s | "1903" | 1993 | ~~1903~~ → 1993 | Acordo de Arusha, 4 ago. 1993 |
| Joaquim | ~12 s | "morte de milhares" | cerca de 800 mil | selo Contexto | ONU |


## 24/11 00h40 UTC · v1 COMPLETA entregue
- `ruanda/previas/ruanda-v1.mp4` (8:01, -14 LUFS, 137 MB; master sem compressão em `video/renders/ruanda-previa.mp4`).
- Ana Isabel chegou 23/11 23h52 UTC: limpa (-16 LUFS), Groq; cortadas 2 retomadas (31-38 s "todos os tut..." e 79-83 s "empatar, não"), tempos corrigidos à mão em `transcricoes/groq/ana-isabel.json` (original da Groq em `ana-isabel.groq-original.json`). Legenda: "enfureceu" (ela diz "ofereceu"), "importar armas" (ela diz "impor"). Checagem na tela: "1903" -> 1993.
- Fotos que ainda faltam no Wikimedia (429): refugiados-fila, refugiados-familia, boinas-azuis. Kangura baixada mas NÃO usada (capa com facão).
- montar.py agora reencoda na emenda (com -c copy o h264 quebrava). Entrega: `ffmpeg -i video/renders/ruanda-previa.mp4 -vf hqdn3d=2:1:3:3 -c:v libx264 -crf 26 ...` (o grão animado pesa no arquivo).

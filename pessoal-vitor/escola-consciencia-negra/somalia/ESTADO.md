# ESTADO · vídeo da Somália (Consciência Negra, 20/11/2026)

Atualizado em 18/11/2026.

## Feito
- Roteiro v3 já existe: `../roteiro-somalia-v3.pdf` (3 min 30 s, 8 pessoas, trilha Sade "Pearls").
- **Mídia baixada** em `midia/`, separada em `triste/`, `bonito/`, `mapas-historia/` (cada uma com `videos/`, `fotos/` e, em história, `mapas/`).
- `midia/catalogo.md`: cada arquivo com trecho, local, autor, licença e link da página. Créditos finais saem dele (CC BY e CC BY-SA pedem crédito).
- `midia/folha-de-contato.jpg`: os ~30 melhores quadros.

## Fontes e cuidados
- Vídeos reais da Somália: reportagens da VOA (domínio público, têm selo "a54"/VOA no canto: usar com zoom ~1,15x ou máscara), vídeos do Commons (Mogadíscio 2012/2016/2018, Somalilândia, Laas Geel, Hargeisa, dança somali em 240p).
- Pexels: muitos clipes são **ilustrativos** (seca, galões, camelos, pôr do sol) e não são da Somália. O catálogo marca isso; não legendar como Somália.
- Fotos: Openverse/Flickr (AMISOM CC0, DFID CC BY, USAID CC BY-NC, Feed My Starving Children CC BY), ~1024 px.
- Excluídas de propósito: licenças ND (UN Photo) e vídeos de campos da Síria/Rohingya que aparecem em buscas de "refugiados".

## Bloqueios encontrados
- Wikimedia (upload.wikimedia.org) devolve 429 para a nuvem quando baixa em sequência: baixar devagar (1 arquivo a cada 40 s) ou usar os "transcoded" (`/transcoded/.../X.webm.480p.vp9.webm`), que passam.
- Flickr bloqueia a nuvem (403); o atalho que funciona é `https://api.openverse.org/v1/images/<id>/thumb/?full_size=true` com User-Agent próprio (não "Mozilla").
- A VM do PC do Vítor (device_bash) não alcança o Wikimedia (proxy 403).

## Feito em 18/11/2026 (thread "Montar vídeo Somália: áudio e motion")
- **Áudio** em `audio/`: `bruto/` (vitor-WA0017.opus, vitor-WA0018.opus, sade-pearls.mp3 intactos), `limpo/` (falas do Vítor limpas, 48 kHz, -16 LUFS), `amostras-ab/` (6 ferramentas + antes-depois), `METODO-DENOISE.md`. Venceu DeepFilterNet3. Transcrição bate com o roteiro v4 (WA0017 = abertura "Quando você pensa na África...", WA0018 = final "Da próxima vez...").
- **Motion** (Remotion) em `trabalho/motion/`: composições AfricaPais (África como um país, "?" na fronteira, 54 bandeiras derramando, mergulho na Somália, travada na fala WA0017), Globo (satélite NASA girando e mergulhando no Chifre, bandeira e nome), Partilha (mapa real de 1884 de Ravenstein -> estrela somali se parte em 5: britânica, italiana, francesa, Etiópia, Quênia), Ficha (povo), Tempo (1960/1969/1991 com mapa rachando), Atentado (14/10/2017, 500+), Seca (250.000 em pontos), Final (estrela + título).
- Dados: Natural Earth 50m/10m (domínio público) -> `scripts/prep-geo.mjs` e `prep-globo.mjs` geram `src/data/*.json`; bandeiras flagcdn (domínio público) em `public/flags/`.
- **Aprovação**: `plano/somalia-aprovacao-quadros.pdf` (14 quadros K01-K14, gerado com a skill pdf-aprovacao a partir de `plano/plano.json`). Prévia: `previas/previa-motion-v1.mp4` (globo + África com a voz + partilha, Pearls com ducking).
- Mídia nova: `midia/triste/al-shabaab/` (Wikimedia, domínio público; créditos em `al-shabaab.log`).

## Refazer
```
cp -r trabalho/motion /tmp/m && cd /tmp/m && npm i   # node_modules fora do projeto (o mount não aceita symlink)
mkdir -p public/audio && cp ../../audio/limpo/*.wav ../../audio/bruto/sade-pearls.mp3 public/audio/
npx remotion still src/index.ts AfricaPais q.jpg --frame=340
npx remotion render src/index.ts AfricaPais out.mp4
python3 trabalho/scripts/limpar_voz.py <audio> <saida.wav>   # precisa pip install deepfilternet + modelo (ver audio/METODO-DENOISE.md)
```
Tempos da Partilha são provisórios (TP em Partilha.tsx): trocar pelo início das palavras quando chegar a fala do Urley.

## Próximo passo
1. Vítor aprova (ou ajusta por código K01-K14) o PDF de quadros-chave.
2. Chegam as falas dos outros 7: limpar com limpar_voz.py, transcrever, travar cada bloco de motion nas palavras.
3. Montagem completa (composição Video.tsx encadeando blocos + B-roll), som (Pearls 18-22 LU abaixo da voz), crítica por sessão nova, render.

## Refazer a busca
Scripts em `trabalho/scripts/` (pex.py, cms.py, ov.py, dlc.sh, trim.py, catalogo.py, folha.py) e listas de candidatos em `trabalho/candidatos/` (cortes.tsv = trechos escolhidos). Rodar a partir de uma pasta com `raw/` e `cand/`. Busca simples: `python3 ferramentas/busca/busca.py "<termo>"` (Pexels) e a API do Commons/Openverse como descrito acima.

## Falas recebidas (18/11/2026, 23h) · bruto/ e limpo/ (DeepFilterNet3)
| Arquivo | Fala do roteiro v4 | Confere? |
|---|---|---|
| vitor-WA0017 / WA0018 | abertura e reflexão final | sim |
| luisa-WA0042 | a riqueza | sim (cortei o "riqueza" lido do título, 0,5 s) |
| luisa-WA0043 | a seca | sim |
| urley-WA0045 | colonização | sim |
| urley-WA0046 | a mulher | sim ("com o filho" no lugar de "com um filho") |
| jose-WA0041 | Brasil | sim |
| anna-WA0038 | o povo | sim ("camelo" no singular) |
| vitor-anna2-WA0053 | política e pirataria (fala da Anna, lida pelo Vítor) | sim, com "Dito tudo isso," no começo (mantido; dá para cortar 1,1 s) |
Faltam: Maria Eduarda (nome e bandeira; religião e terror), Yago (ditadura e Guerra Fria; o julgamento), Daniel (guerra civil; racismo). O Vítor disse que grava o que faltar.

## 2026-11-18 noite: vídeo completo v1 (prévia)
- Montagem inteira: `trabalho/motion/src/Video.tsx` lê `src/data/timeline.json` (gerado por `scripts/timeline.py`). Créditos com os 8 do grupo em `Blocos.tsx` (Final).
- Falas PROVISÓRIAS (edge-tts): maria-1, maria-2 (Thalita), yago-1, yago-2 (Antonio) em `audio/provisorio/`. Quando chegarem os áudios reais: limpar (limpar_voz.py), `encurta_silencios.py`, rodar `timeline.py` de novo, render e mix.
- Render (na pasta de trabalho do Remotion com node_modules): `npx remotion render src/index.ts Video video-mudo.mp4 --muted --concurrency=4 --crf=18` (~17 min, 4 núcleos).
- Mix: `python3 scripts/mix.py src/data/timeline.json mix-pre.wav`; depois ganho linear até -14.3 LUFS + `alimiter=limit=0.84` (NÃO usar loudnorm de 1 passada: ele achata o ducking). Música: nivelador lento 3 s ±9 dB, -22 LUFS nas pausas, -37 sob a voz (antes do ganho).
- Mux: `ffmpeg -i video-mudo.mp4 -i mix.wav -c:v copy -c:a aac -b:a 256k -shortest previas/somalia-v1.mp4`.

## 2026-11-19: ajustes pedidos depois da v1 (render só quando chegarem os áudios da Maria Eduarda e do Yago)
- **Vozes (regra do Vítor, vale para TODO áudio novo):** depois de `limpar_voz.py` e `encurta_silencios.py`, rodar `trabalho/scripts/acabar_vozes.py <pasta-entrada> <pasta-saida>` (2ª passada DeepFilterNet3 sem limite, EQ de clareza, compressor, gate suave, ganho linear até -16 LUFS). Versões anteriores em `audio/editado-v1/`. Todas as 15 falas agora em -16,0 ± 0,2 LUFS.
- **Refrões de Pearls sem fala** (tempos da letra via `trabalho/scripts/letra_pearls.py`): S1 112,6-117,3 ("hurts like brand new shoes", depois da TV que desliga), S2 178,1-191 ("Hallelujah" + lamento, depois da fala das pérolas), S3 216,3-222,6 ("and it hurts like brand new shoes", depois da fala do Daniel). A música sobe +3 dB nesses respiros (`respiros` no timeline.json).
- Respiros entre falas maiores (Anna→Luísa 2,0 s; demais 0,9-2,4 s). Total ~4:35, terminando junto com a música.
- Final: estrela + título, créditos rolando (grupo, música, imagens com licença, mapas, fontes) e a frase "Um povo não é / a ferida que deixaram nele." (aguardando OK do Vítor).
- Logos a54 e VOA removidos com ffmpeg delogo em todos os voa-*.mp4 (public/midia e somalia/midia).
- Para a versão final: trocar provisorio por áudios reais -> limpar -> encurtar silêncios -> acabar_vozes -> timeline.py -> render -> mix.py (+ ganho linear e alimiter) -> mux.

## 2026-11-19 madrugada: versão FINAL
- Áudios reais da Maria Eduarda (WA0059 nome/bandeira, WA0060 terror) e do Yago (WA0063 ditadura, WA0064 julgamento) em audio/bruto -> limpo -> `trabalho/scripts/troca_falas.py` (transcreve e troca no falas.json) -> `encurta_silencios.py maria-1,maria-2,yago-1,yago-2` (só essas!) -> `acabar_vozes.py`. Todas as 15 falas em -16 LUFS.
- Índices de palavra no timeline.py mudaram para maria-2 (+2 a partir de "Em 2017") e yago-2 ("mas" = 10).
- Final: vitor-2 -> "I have a dream that my four little children…" (MLK, archive.org MLKDream, trecho 743,95-759,7 s, eco, `audio/editado/mlk.wav`) sobre fotos P&B da Marcha (midia/mlk, domínio público) com tradução -> frase "Um povo não é / a ferida que deixaram nele." em silêncio -> créditos rolando com nomes completos e o começo de Pearls baixinho.
- Clipe embaçado da batalha de 1993 trocado por voa-atentado-predios-destruidos. Legenda escura na partilha com auréola clara (legível sobre o mapa antigo).
- Total ~4:50.
- Thumbnail: thumb/somalia-thumbnail-1920.png (Remotion comp Thumb). Foto: Tobin Jones, AU-UN IST, Marka 2014, CC0 (Wikimedia Commons).

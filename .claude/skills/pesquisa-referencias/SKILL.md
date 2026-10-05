---
name: pesquisa-referencias
description: Onde e como buscar referências e material real grátis para os vídeos - X/Twitter pelo PC do Vítor, xler.py, busca.py (Pexels, Wikimedia, Archive, SFX), biblioteca de anúncios via Apify, voz grátis edge-tts. Use antes de planejar qualquer vídeo.
---

# Pesquisa de referências e material

Regra: material real primeiro, IA só para clima. Busque referências você mesmo antes de planejar.

## X/Twitter (melhor fonte de motion de alto nível)
- Busca nativa: no terminal do PC do Vítor (Remote Control), `twitter -c search "motion design" -t top --min-likes 500`. Cookies estão no `setx TWITTER_AUTH_TOKEN/TWITTER_CT0` dele; o Claude não vê os tokens. Se der erro de login, ele refaz login + F12 + setx. Versão corrigida: fork c4nc/twitter-cli (ver `motion-base/fontes/x/LEIA-ME.md`).
- Sem login: WebSearch `site:x.com <tema>`.
- Baixar texto e vídeos: `python3 motion-base/fontes/x/xler.py <ids> --baixar` (via api.fxtwitter.com). Salvar achados em `motion-base/fontes/x/`.

## Material real grátis
`python3 ferramentas/busca/busca.py "<termo>"` (precisa `pip install pillow yt-dlp`). Gera `folha.jpg` com miniaturas numeradas e cor por licença; `--de <pasta> --baixar 2,6` baixa; licença vai para `registro-licencas.csv`. Guia: `motion-base/BUSCA-MATERIAL-REAL.md`. Chaves (Pexels, Freesound, Jamendo, Pixabay) em `ferramentas/busca/chaves.env`, que NÃO vem no backup: o Vítor recria as chaves grátis.

## Anúncios que escalaram
Apify (conta grátis, ~US$0,005/anúncio): actor `apify~facebook-ads-scraper` com URL de busca da Ad Library + `resultsLimit` devolve página, texto, dias rodando e vídeo HD. TikTok: `doliz/tiktok-creative-center-scraper`. Token do Apify fica fora do backup.

## Música, voz e outros
- Trilha épica grátis: `motion-base/MUSICA-EPICA.md` (ACE-Step 1.5, MIT). Freesound/Jamendo para SFX/música.
- Voz grátis pt-BR para rascunho: edge-tts (Thalita, Francisca, Antonio), script `organizacao/amostras-voz/voz_edge.py`. Voz final: ElevenLabs (o Vítor gera no site; plano grátis bloqueia vozes BR pela API).
- Vídeo de IA: o Claude escreve prompts, o Vítor gera no Google Flow com a automação do PC (`pc/COMO-USAR.txt`).

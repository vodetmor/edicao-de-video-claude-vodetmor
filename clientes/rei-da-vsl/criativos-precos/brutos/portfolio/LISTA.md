# Portfólio de vídeo da Rei da VSL

- **Portfólio de vídeo:** https://reidavsl.com/portfolio-de-vsl/ (título da página: "Portfólio de vsl - Rei da VSL")
- Índice geral: https://reidavsl.com/portfolio/ ("PORTFÓLIO COMPLETO"), com links para: Edição de Vídeo (VSL e Criativos) → /portfolio-de-vsl, Página de Vendas → /portfolio-de-pagina-de-vendas, Locutores → /locucao, Atores/Depoimentos → /portfolio-de-depoimentos, Atores (Humano e IA) → /portfolio-de-expert, E-Books → /portfolio-ebook.
- Como achei: sitemap do Yoast em https://reidavsl.com/sitemap_index.xml → page-sitemap.xml. A página lp.reidavsl.com/portifolio redireciona para lp.reidavsl.com/portfolio (só sites).
- A página /ads/ também tem 8 embeds do YouTube (a maioria se repete aqui; extras: 9P_R5_zN6Zc, LqBg48xe6O4, hecEmnuGfOo).
- **Fonte de todos os vídeos:** YouTube, canal "Rei da Vsl" (@ReidaVsl). São botões que abrem o vídeo do YouTube (lightbox), não Vimeo/Panda/VTurb nem mp4 direto. São 63 vídeos em 8 categorias.
- Títulos tirados do oEmbed público do YouTube. Duração só aparece para os 4 vídeos cujos metadados vieram antes do bloqueio.

## Download: NÃO FOI FEITO (pasta sem vídeos)

O YouTube bloqueou o IP do container na nuvem: HTTP 429 "Too Many Requests" e depois "Sign in to confirm you're not a bot". Numa tentativa a extração passou, mas os streams deram 403 Forbidden: falta PO token e o container não tem runtime de JavaScript para o yt-dlp. Os clientes de player alternativos (web_embedded, tv_embedded, mweb, android_vr, tv) também falharam. Login e cookies estavam fora das regras, e não consegui usar front-ends de terceiros (Invidious/Piped): essa ação foi negada pelas permissões.

**Para baixar no PC do Vítor**, que tem IP residencial, com os nomes planejados (menor resolução ≥ 720p, sem recodificar):

```
python -m pip install -U yt-dlp
yt-dlp -S "res:720,ext:mp4:m4a" --merge-output-format mp4 -o "01-vsl-dopaminetica-01.%(ext)s" https://www.youtube.com/watch?v=x2hw3tkYynE
```

| Arquivo planejado | ID | Vídeo |
|---|---|---|
| 01-vsl-dopaminetica-01.mp4 | x2hw3tkYynE | VSL Dopaminética 01 (64 s, 1080p na origem) |
| 02-vsl-dopaminetica-03.mp4 | hLv15LxdELc | VSL Dopaminética 03 (54 s, 1080p na origem) |
| 03-vsl-dopaminetica-02.mp4 | RLYGf7ryPZg | VSL Dopaminética 02 (28 s, 1080p na origem) |
| 04-vsl-motion-expert-02.mp4 | IcoKWQUwUVs | VSL MOTION EXPERT 02 |
| 05-criativo-motion-ia.mp4 | JjYJGb1r0kA | Criativo - Motion - IA |
| 06-edicao-especial-locucao-02.mp4 | PE210Zn5HK4 | Edição Especial com locução 02 |
| 07-ugc-avatar-ia-01.mp4 | c6jgQelgsu4 | 01 - UGC com Avatar IA |
| 08-quebra-de-padrao-04.mp4 | 2N6ZDnC7Y4g | Quebra de Padrão em VSL 04 |

## Lista completa (63 vídeos, na ordem da página)

### Dopaminético

| # | Título (YouTube) | URL | Duração |
|---|---|---|---|
| 1 | VSL com Expert 01 · Edição Dopaminética | https://www.youtube.com/watch?v=YnKlpV-AeZ0 | ? |
| 2 | VSL Dopaminética 03 | https://www.youtube.com/watch?v=hLv15LxdELc | 54 s |
| 3 | VSL Dopaminética | https://www.youtube.com/watch?v=-ISY-EBxgZg | 70 s |
| 4 | VSL Dopaminética 02 | https://www.youtube.com/watch?v=RLYGf7ryPZg | 28 s |
| 5 | VSL Dopaminética 01 | https://www.youtube.com/watch?v=x2hw3tkYynE | 64 s |
| 6 | Edição Dopaminética 06 | https://www.youtube.com/watch?v=aqvTDb01RxQ | ? |
| 7 | Edição Dopaminética 05 | https://www.youtube.com/watch?v=mLtO8-i_8kk | ? |
| 8 | Edição Dopaminética 04 | https://www.youtube.com/watch?v=DAK1CXWuuWI | ? |
| 9 | Edição Dopaminética 03 | https://www.youtube.com/watch?v=HNC9Lzyx12c | ? |

### MOTION

| # | Título (YouTube) | URL | Duração |
|---|---|---|---|
| 10 | VSL MOTION EXPERT 02 | https://www.youtube.com/watch?v=IcoKWQUwUVs | ? |
| 11 | VSL MOTION EXPERT 01 | https://www.youtube.com/watch?v=BuaFYjBQMS0 | ? |
| 12 | VSL MOTION - BETTINA | https://www.youtube.com/watch?v=kEuVFBKTpFw | ? |
| 13 | Criativo - Motion - Inglês | https://www.youtube.com/watch?v=Ci0VtKiF2Z4 | ? |
| 14 | Criativo - Motion - IA | https://www.youtube.com/watch?v=JjYJGb1r0kA | ? |
| 15 | Você tem um produto poderoso? - MOTION - Rei da Vsl | https://www.youtube.com/watch?v=6xC2pcKVCFM | ? |
| 16 | O problema está na sua VSL - MOTION - Rei da Vsl | https://www.youtube.com/watch?v=LEuKVLu50QM | ? |
| 17 | Sua VSL não está à altura do seu Negócio - MOTION - Rei da Vsl | https://www.youtube.com/watch?v=WVzl95McWt4 | ? |
| 18 | VSL que Vende - MOTION - Rei da Vsl | https://www.youtube.com/watch?v=vN__4M8G3BI | ? |

### EDIÇÃO ESPECIAL

| # | Título (YouTube) | URL | Duração |
|---|---|---|---|
| 19 | Edição Especial com locução 02 | https://www.youtube.com/watch?v=PE210Zn5HK4 | ? |
| 20 | VSL Edicao Especial | https://www.youtube.com/watch?v=apq9_pLSxs4 | ? |
| 21 | Vsl com Expert | Edição especial | https://www.youtube.com/watch?v=uNXYtqECj_s | ? |
| 22 | VSL Edicao Especial | https://www.youtube.com/watch?v=Se8ioe5yfI0 | ? |
| 23 | VSL com expert - Edição especial - Inglês | https://www.youtube.com/watch?v=u_9noQrDoNQ | ? |
| 24 | VSL EXPERT - Edição especial | https://www.youtube.com/watch?v=zAsTgE_KRPU | ? |
| 25 | VSL EXPERT - edição especial | https://www.youtube.com/watch?v=DRNMkXhYjIA | ? |
| 26 | VSL EDIÇÃO ESPECIAL | https://www.youtube.com/watch?v=BLqKhw1SK9M | ? |
| 27 | Edicao especial com locutor | https://www.youtube.com/watch?v=NpLJNebjsXg | ? |

### EDIÇÕES DIVERSAS com INTELIGÊNCIA ARTIFICIAL

| # | Título (YouTube) | URL | Duração |
|---|---|---|---|
| 28 | Cenas de IA | https://www.youtube.com/watch?v=3lJ5S0D4yPY | ? |
| 29 | 01 - UGC com Avatar IA | https://www.youtube.com/watch?v=c6jgQelgsu4 | ? |
| 30 | 01 - PODCAST com Avatar IA | https://www.youtube.com/watch?v=srjTNkXuS4E | ? |
| 31 | Edição Especial - Expert IA | https://www.youtube.com/watch?v=jnOzZvVmI-g | ? |
| 32 | 02 - UGC com Avatar IA | https://www.youtube.com/watch?v=bNGxu2YCD-M | ? |
| 33 | 02 - PODCAST com Avatar IA | https://www.youtube.com/watch?v=w7AMUZuU2UE | ? |
| 34 | 03 - UGC com Avatar IA | https://www.youtube.com/watch?v=ogki58BgSoI | ? |
| 35 | 04 - UGC com Avatar IA | https://www.youtube.com/watch?v=r0wr00VkgXk | ? |
| 36 | 05 - UGC com Avatar IA | https://www.youtube.com/watch?v=ICnNHlz11Q4 | ? |

### VÍDEO INSTITUCIONAL E PROMOCIONAL

| # | Título (YouTube) | URL | Duração |
|---|---|---|---|
| 37 | Video Institucional e Promocional | https://www.youtube.com/watch?v=M3XCyredo-4 | ? |
| 38 | Video Comercial e Promocional | https://www.youtube.com/watch?v=_2Vu8hg9XTs | ? |
| 39 | Video Comercial e Promocional | https://www.youtube.com/watch?v=LVchfbsYrZ8 | ? |
| 40 | Video Comercial e Promocional | https://www.youtube.com/watch?v=6TkmgL7GQQ0 | ? |
| 41 | Video Comercial e Promocional | https://www.youtube.com/watch?v=MVebLRyQ0E0 | ? |
| 42 | Video comercial e Promocional | https://www.youtube.com/watch?v=D8zvw2XVXVs | ? |
| 43 | Vídeo Comercial e Promocional - Curso Matemáfica | https://www.youtube.com/watch?v=BimObujgEck | ? |
| 44 | Video Comercial e promocional - Ziyon | https://www.youtube.com/watch?v=DoqwDsjgJnI | ? |
| 45 | Video comercial | https://www.youtube.com/watch?v=CqjINtqb3OY | ? |

### VÍDEOS 2D

| # | Título (YouTube) | URL | Duração |
|---|---|---|---|
| 46 | Animacao 2D - Alisson Correa | https://www.youtube.com/watch?v=SYQgl4OMLRg | ? |
| 47 | Animacao 2D - Dvieira | https://www.youtube.com/watch?v=HPqRsYZtTEk | ? |
| 48 | Animação 2D Otto Tech | https://www.youtube.com/watch?v=qieOEUz3wIo | ? |
| 49 | Animação 2D - Mercado Adaptado | https://www.youtube.com/watch?v=yD3byVSTN2Q | ? |
| 50 | Animação 2D - Sunorte | https://www.youtube.com/watch?v=SGJUBC_ah-8 | ? |
| 51 | Animação 2D   AMWSY | https://www.youtube.com/watch?v=spykFwdIPv4 | ? |

### VÍDEO WHITEBOARD

| # | Título (YouTube) | URL | Duração |
|---|---|---|---|
| 52 | VÍDEO WHITEBOARD   Compre Aqui | https://www.youtube.com/watch?v=tvczLOAMApU | ? |
| 53 | Vídeo whiteboard - Mondax | https://www.youtube.com/watch?v=k6VeFn36FhM | ? |
| 54 | Vídeo Whiteboard   Dr  Alcides | https://www.youtube.com/watch?v=ERGFOsFOe1g | ? |
| 55 | Vídeo Whiteboard Prevenire | https://www.youtube.com/watch?v=1iL2doMSyRI | ? |
| 56 | Vídeo Whiteboard   DSM SHOP | https://www.youtube.com/watch?v=suZTCisZuXg | ? |
| 57 | Animação Whiteboard   Schoolapio | https://www.youtube.com/watch?v=JGlvVuRyExg | ? |

### QUEBRA DE PADRÃO

| # | Título (YouTube) | URL | Duração |
|---|---|---|---|
| 58 | Quebra de Padrão em VSL 04 | https://www.youtube.com/watch?v=2N6ZDnC7Y4g | ? |
| 59 | Quebra de Padrao em VSL 02 | https://www.youtube.com/watch?v=4gmjXV36rKw | ? |
| 60 | Quebra de padrão em VSL 05 | https://www.youtube.com/watch?v=xmC13j7fnTk | ? |
| 61 | Quebra de Padrao em VSL 01 | https://www.youtube.com/watch?v=68gn-tuUd2M | ? |
| 62 | Quebra de Padrão em VSL 03 | https://www.youtube.com/watch?v=z85OMGlVeaM | ? |
| 63 | Quebra de Padrão Lula em VSL 06 | https://www.youtube.com/watch?v=2fIm6uvllhU | ? |

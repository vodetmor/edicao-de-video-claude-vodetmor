# Fontes por nível

Preços e limites mudam: confira na página do serviço antes de prometer ao usuário.

## Nível 0 · grátis, sem nada
| Fonte | Como | Rende |
|---|---|---|
| Busca na web do Claude | buscar `"<nicho>" reels`, `site:tiktok.com <tema>`, `site:x.com <tema> motion` | vídeos e posts de referência |
| Biblioteca de anúncios da Meta (site) | facebook.com/ads/library, filtro país e "ativos" | anúncios rodando; quanto mais dias, melhor |
| Central de criativos do TikTok (site) | ads.tiktok.com/business/creativecenter | anúncios em alta por nicho |
| YouTube / páginas públicas | ler a página e a descrição; nunca baixar conteúdo protegido | estrutura de aulas e ganchos |

## Nível 1 · grátis com chave ou crédito mensal
| Fonte | Chave | Rende |
|---|---|---|
| Pexels, Pixabay | grátis no site do serviço | vídeo e foto de B-roll com licença livre |
| Freesound, Jamendo | grátis | efeitos e música com licença |
| Wikimedia, Internet Archive, NASA | não precisa | imagem e vídeo histórico ou científico |
| Apify (crédito grátis mensal) | token da conta | raspagem da biblioteca de anúncios (texto, dias rodando, vídeo) em volume pequeno |

Neste repositório: `ferramentas/busca/busca.py "<termo>"` busca nessas fontes e anota a licença.

## Nível 2 · com orçamento (só com OK do usuário)
| Tipo | Exemplos | Quando vale |
|---|---|---|
| Raspagem de redes e anúncios em volume | atores pagos do Apify, APIs de dados de redes | pesquisar 50+ anúncios de um nicho de uma vez |
| Geração de imagem e vídeo por MCP | serviços de geração com conector próprio | B-roll que não existe em banco grátis |
| Voz | serviços de voz com API | narração quando o usuário não grava |
| Transcrição rápida | APIs de transcrição | vídeo longo em PC fraco (a local é grátis e serve quase sempre) |

Regra: comece no nível mais baixo que resolve. Pago só quando o grátis não alcança e o ganho é claro.

# Pinterest sem token (testado 13/10/2026)
`pinterest-mcp-server` (terryso/mcp-pinterest) raspa a busca PÚBLICA com puppeteer-core + Chrome. NÃO pede token, API nem login. Na nuvem funciona com `MCP_PINTEREST_PROXY_SERVER=$HTTPS_PROXY` e o Chromium do Playwright.
Uso: `npm i pinterest-mcp-server` num scratch; `busca.mjs` (aqui) -> res.json com URLs; trocar `/originals/` por `/564x/` p/ miniaturas; montar folhas de contato.
Limite: ~8-12 pins por busca, sem título/autor. Para pastas privadas/boards do Vítor aí sim precisaria de login (não necessário).
## O que as buscas mostraram para anúncio de oferta/preço (estatico-oferta-precos.jpg, tipografia-3d-numeros.jpg)
- Número do desconto GIGANTE, cortado pela borda, como herói (50% MORE em vidro/âmbar, 20% OFF vazado, 18 do iPhone).
- Objeto-metáfora do preço: impressora de recibo imprimindo, etiqueta de papel, papel recortado colado em foto (Princess Polly).
- Tipografia 3D extrudada e colisão de letras condensadas ultra-bold; 1 ideia por peça, 2 cores.
- Anúncios de "serviço de edição de vídeo" (servico-edicao-video-ruim.jpg) = poluídos, ícones do Premiere, lista de serviços, contato. É o que NÃO fazer.

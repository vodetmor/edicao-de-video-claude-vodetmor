---
name: uso-ofertas-e-massa
description: A Máquina de Editar também é a base de vídeo da Máquina de Ofertas - criação em massa, avatar e API; o que existe e o que falta
metadata:
  type: project
---

Vítor, 05/11/2026: esta base também serve para a criação de ofertas e dos vídeos delas (`C:\dev\ofertas`): edição e criação em massa, avatar, API e afins.

**Why:** ele quer um só lugar de conhecimento de vídeo, em vez de recriar isso em cada chat de oferta.

**How to apply:** pedido de vídeo de oferta usa esta base; o resto da oferta (radar, copy, checkout, rastreamento) segue no `C:\dev\ofertas`. Não prometer como pronto o que está abaixo como "falta".

| Capacidade | Estado em 05/11/2026 | Onde |
|---|---|---|
| Variações em lote por spec | Existe. Maior teste registrado: 3 variações de 5,3 s (7 a 9 s de render cada) | `estudio/motor/fabrica.mjs`, skill `motor-estudio` |
| Edição de vídeo falado | Existe | `estudio/editor`, skill `editar-video` |
| Material real e música com licença | Existe | `ferramentas/busca/busca.py` |
| Anúncios que escalaram | Busca funciona (Apify); o módulo de modelagem no motor não foi feito | `organizacao/ESTUDIO-PLANO.md` |
| Voz | edge-tts para rascunho; ElevenLabs grátis bloqueia voz brasileira por API | `organizacao/amostras-voz` |
| Vídeo e imagem de IA | Pelo Google Flow, com automação no PC do Vítor | `C:\image-automation`, `ferramentas/pc-automacao` |
| Produção em massa real (dezenas de vídeos) | Falta: nunca testada nessa escala, e o PC não tem GPU NVIDIA | |
| Avatar | Falta: nenhum fluxo implantado; HeyGen só aparece como referência | |
| API paga de geração | Falta: `HIGGSFIELD_API_KEY`, `FAL_KEY` e `HYPIHUB_API_KEY` estão vazias até ele assinar | `.env` |

Ligados: [[estudio-motor]], [[produto-skills-jeronimo]], [[editor-video-falado]].

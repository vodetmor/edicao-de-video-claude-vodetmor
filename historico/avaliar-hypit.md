# avaliar-hypit

## 2026-10-02T15:55:04Z · Rei da VSL - Vítor

https://github.com/hypit-ai/hypit da aquela lida bb

_Anexos: hypit.md_

## 2026-10-02T15:55:10Z · Claude

Vou ler o repositório do Hypit e ver se encaixa no nosso fluxo de edição.

## 2026-10-02T15:55:51Z · Claude

Li o repositório. Em resumo: é uma ferramenta que se encaixa no que já fazemos, mas não vale trocar o nosso pipeline por ela.

**O que é:** o Hypit é uma skill open source para o Claude Code (instala com `npx skills add hypit-ai/hypit -g`). Você dá um vídeo de referência e o agente "clona" esse vídeo como um projeto editável, com cenas, legendas, B-roll e efeitos presos às **palavras faladas** e não aos segundos. Se você reescreve uma frase, o tempo do resto se ajusta sozinho. A partir de um projeto ele gera variações em série (troca o apresentador, o gancho, o produto ou o idioma). A renderização é feita em HTML com o Chromium, então não usa o Remotion.

**Custo:** a ferramenta é grátis. O que se paga é a geração por IA (Seedance para vídeo, GPT Image, ElevenLabs), por uso, pelo serviço deles (HypiHub) ou com as suas chaves. Os exemplos do README custaram cerca de US$ 1 cada. Um vídeo feito só com código (legendas e motion), sem gerar imagem ou vídeo, não tem custo de modelo. A transcrição (WhisperX) roda local.

**Licença:** é uma Apache 2.0 modificada. Você pode usar no trabalho com clientes e os vídeos são seus. Só não pode revender a ferramenta nem oferecer ela como serviço online.

**Para você:**
• O ponto mais forte dele, animação travada na palavra falada, a gente já faz no Remotion. Foi isso que deu o 10/10 no anúncio do VSL Play, e lá temos controle fino de design que o Hypit não dá.
• O estilo dos exemplos é UGC "brain rot" de TikTok, bem longe da linha Apple que você gosta.
• Ele pode ajudar em um caso: soltar **muitas variações de gancho** de um criativo que já funciona (10 ou 50 aberturas diferentes para testar no Meta). Para isso vale um teste.
• O projeto é muito novo (versão 0.2), então pode quebrar.

**Recomendo:** manter o nosso pipeline como base e testar o Hypit em uma coisa só, as variações de gancho de um dos criativos do VSL Play. Se quiser, eu monto esse teste.

## 2026-10-02T16:03:47Z · Claude

Salvei. A análise completa do Hypit está em [hypit.md](/mnt/project-files/motion-base/fontes/ferramentas/hypit.md), já com o seu objetivo futuro (pegar anúncios escalados do Facebook e do TikTok Ads e modelar com IA). Também deixei uma linha nas lições da biblioteca e uma nota na memória do projeto, para qualquer conversa nova encontrar isso quando chegar a hora.

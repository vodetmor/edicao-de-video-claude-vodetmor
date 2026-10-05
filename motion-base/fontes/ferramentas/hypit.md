# Hypit (github.com/hypit-ai/hypit) · avaliado em 02/10/2026

**O que é:** skill open source para Claude Code/Codex (`npx skills add hypit-ai/hypit -g`) com runtime em TypeScript (v0.2.17, projeto muito novo). Você entrega um vídeo de referência e o agente "clona" esse vídeo como um projeto editável escrito em SVML (markup próprio): cenas, legendas, B-roll e efeitos ancorados nas PALAVRAS faladas, não nos segundos. Se você reescreve uma frase, o tempo do resto se ajusta sozinho. A partir de um projeto ele gera variações em série (troca o apresentador, o gancho, o produto, o idioma ou o formato).

**Como renderiza:** HTML em Chromium headless ("hyperframes"), não usa o Remotion. A transcrição com alinhamento por palavra usa o WhisperX local, e o download de referências usa o yt-dlp local.

**Custo:** a ferramenta é grátis. A geração por IA (Seedance para vídeo, GPT Image, Seedream, ElevenLabs, MiniMax etc.) é paga por uso, pelo HypiHub (serviço deles) ou com as suas próprias chaves. Os exemplos do README custaram cerca de US$ 1,10 cada. Um vídeo feito só com código (legendas e motion) não tem custo de modelo.

**Licença:** Apache 2.0 modificada. Pode usar no trabalho próprio e de clientes, e os vídeos gerados são seus. Não pode revender a ferramenta nem rodar ela como SaaS ou serviço multi-cliente.

**Estilo dos exemplos:** UGC "brain rot" de TikTok (ranking, podcast, entrevista de rua), longe da linha Apple do nosso DESIGN-SYSTEM.

## Veredito
- Não substitui o nosso pipeline (Remotion + ffmpeg + timeline). A animação travada na palavra falada a gente já faz, e foi o que deu o 10/10 do VSL Play.
- **Uso futuro planejado (pedido do Vítor):** pegar anúncios escalados do Facebook/Meta Ad Library e do TikTok Ads e modelar com IA (mesma estrutura, outro produto), além de soltar muitas variações de gancho de um criativo que já funciona. É exatamente o caso de uso principal do Hypit ("clone a winning ad from the Meta Ad Library, ship 50 hook variants").
- Quando chegar a hora: testar primeiro em um criativo só, gerando variações de gancho, e comparar o resultado com o padrão do DESIGN-SYSTEM antes de adotar.

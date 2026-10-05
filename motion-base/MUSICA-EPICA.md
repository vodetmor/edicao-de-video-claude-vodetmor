# Música épica e trilha: opções gratuitas

O sound design em código (numpy, 96 BPM travado nos cortes) **fica como está**: você aprovou. A ideia é somar uma camada épica quando o vídeo pedir.

| Opção | Custo | Uso comercial (anúncio) | Quando usar | Fonte |
|---|---|---|---|---|
| **ACE-Step 1.5** (modelo aberto de música) | Grátis. Roda local (GPU a partir de 4 GB, Mac via MLX) ou no site acemusic.ai | Licença MIT. Pedem para declarar o uso de IA e checar a originalidade | Trilha épica/orquestral sob medida, de 10 s a 10 min | [GitHub](https://github.com/ace-step/ACE-Step-1.5) |
| **Pixabay Music** | Grátis | Sim, sem atribuição. Não pode revender a faixa solta | Trailer ou épico pronto, rápido | [busca "epic trailer"](https://pixabay.com/music/search/epic%20trailer/) · [licença](https://pixabay.com/service/license-summary/) |
| **YouTube Audio Library** | Grátis | Sim para vídeos. Algumas faixas pedem atribuição (confira em cada uma) | Backup | studio.youtube.com, na aba Biblioteca de áudio |
| **Síntese em código (o que já fazemos)** | Grátis | Sem risco de direito autoral | Elementos de trailer: "braam" (metais graves), taikos, risers, hits, sub drops. Dá para sintetizar e somar à trilha atual | `motion-demo/.../audio/make_audio.py` |

**Recomendação:** use o ACE-Step no acemusic.ai para gerar a cama épica, que é grátis e tem licença MIT. Por cima, mantenha os efeitos sintetizados em código travados na imagem.

**Cuidado:** ferramentas como Suno e Udio no plano grátis costumam proibir uso comercial. Confira os termos antes de usar em anúncio.

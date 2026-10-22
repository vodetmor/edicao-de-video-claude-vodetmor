# Tokens e acessos do projeto

Atualizado em 21/10/2026. Mapa de todas as chaves que o Vítor já passou: para que serve cada uma, onde o valor está guardado e se funciona.

**Por que os valores não estão escritos aqui:** este arquivo fica na pasta `organizacao/`, que vai para o GitHub no backup. Chave escrita num .md iria parar no repositório (e o `sincronizar.py` trava o backup inteiro quando acha uma chave). Os valores ficam só nos arquivos `.env` abaixo, que o `.gitignore` bloqueia. Para ver uma chave: abra o arquivo indicado no seu PC ou peça "me mostra a chave do X" no chat.

## Música e efeitos sonoros

| Serviço | Para que serve | Variáveis | Onde está o valor | Status |
|---|---|---|---|---|
| **Freesound** | Efeitos sonoros e algumas trilhas CC0/CC BY | `FREESOUND_CLIENT_ID`, `FREESOUND_API_KEY` | `escola-consciencia-negra/edicao/.env` (enviada em 29/09/2026) | Funciona (testado 29/09: baixou efeitos de chuva) |
| **Jamendo** | Música (só usamos faixas CC BY; a maioria é NC/ND) | `JAMENDO_CLIENT_ID`, `JAMENDO_CLIENT_SECRET` | `escola-consciencia-negra/edicao/.env` (29/09/2026) | Funciona (testado 29/09: faixa inteira em 3 s) |
| Scott Buckley, ccMixter, Kevin MacLeod | Música CC BY do banco `motion-base/musica/` | sem chave | — | Funciona |
| Pixabay / Chosic / Uppbeat / Musopen | Música | — | — | Bloqueados pela nuvem (e a API do Pixabay não tem música) |

## Fotos, vídeos e imagens (B-roll)

| Serviço | Para que serve | Variáveis | Onde está o valor | Status |
|---|---|---|---|---|
| **Pexels** | Fotos e vídeos reais grátis (busca.py) | `PEXELS_API_KEY` | `escola-consciencia-negra/edicao/.env` (29/09/2026) | Funciona |
| **Pixabay** | Fotos e vídeos (não música) | `PIXABAY_API_KEY` | `ferramentas/busca/chaves.env` (só o exemplo comentado) | **Pendente**: chave nunca enviada. Criar em pixabay.com/api/docs e colar no chat |
| Mixkit, Openverse, Wikimedia, Internet Archive, NASA, LoC | Material real | sem chave | — | Funcionam (Wikimedia com limite de ritmo) |
| Unsplash, Vecteezy, Videvo, Freepik | Fotos/vídeos | — | — | Bloqueados pela nuvem; sem chave enviada |

## IA e voz

| Serviço | Para que serve | Variáveis | Onde está o valor | Status |
|---|---|---|---|---|
| **ElevenLabs** | Locução (Ana Dias, Eric etc.) | `ELEVENLABS_API_KEY` | `anuncio-vslplay/trabalho/.env` | Funciona, mas o plano grátis bloqueia as vozes brasileiras pela API; você gera essas no site |
| edge-tts (Microsoft) | Voz provisória pt-BR (Thalita, Francisca, Antonio) | sem chave | — | Funciona |
| Gemini (Google AI Studio) | Analista de vídeo com som | — | — | Não enviada (decidimos em 02/10 não usar por enquanto) |
| Kaggle | GPU grátis | `kaggle.json` | — | Não enviado |
| Google Flow | Geração de vídeo/imagem | login das suas contas no PC | Só no seu PC (`C:\image-automation`) | Funciona pela automação em `pc/` |

## Pesquisa e scraping

| Serviço | Para que serve | Variáveis | Onde está o valor | Status |
|---|---|---|---|---|
| **Apify** | Biblioteca de anúncios da Meta/TikTok (escalados) | token da API | Só na sua mensagem do chat do projeto de 29/09/2026 (09:34 UTC); não está em nenhum arquivo | Funciona (testado 02/10: 10 anúncios "vsl"). Plano grátis US$ 5/mês |
| X/Twitter (twitter-cli) | Busca de referências | cookies do seu navegador | Variáveis de ambiente no seu PC (`setx`) | Funciona pelo terminal do seu PC |
| Pinterest | Referências | sem chave (páginas públicas) | — | Funciona só em páginas de ideias/pastas; MCP Pinterest ainda sem token |

## Repositório e contas

| Serviço | Para que serve | Onde está | Status |
|---|---|---|---|
| **GitHub** | Backup `vodetmor/edicao-de-video-claude-vodetmor` | Conectado pelo claude.ai (connect-github); sem token em arquivo | Funciona |
| Vercel | Publicar sites | Conector do claude.ai | Conectado (sem chave em arquivo) |

## Como adicionar uma chave nova
1. Cole a chave no chat do projeto.
2. Ela vai para o `.env` certo (busca de mídia: `ferramentas/busca/chaves.env`; motor: `estudio/motor/.env`, modelo em `.env.exemplo`).
3. Esta tabela ganha uma linha **sem o valor**.

# Acesso ao X/Twitter (pesquisa) — testado 2026-10-02

## Caminho 1: sem login, já funciona na nuvem (padrão)
1. Achar posts: WebSearch com `site:x.com <tema>` (ex.: `site:x.com motion graphics claude code`).
2. Ler: `python3 xler.py <url ou id> [...] [--baixar]` → texto, likes, views, links e mp4 em `videos/`.
3. Artigos do X (x.com/i/article/...) também vêm inteiros pelo api.fxtwitter.com (`tweet.article.content.blocks`), salvar em `artigos/`.
Limites: sem busca nativa do X (depende do índice do buscador, atrasa dias), sem respostas/threads (o "prompt nos comentários" não vem).

## Caminho 2: busca nativa + respostas (precisa conta secundária)
- Ferramenta: twitter-cli (github.com/jackwener/twitter-cli, `pip install twitter-cli`, v0.8.5). Comandos: `twitter search "motion design" -t top --min-likes 500 --has videos`, `twitter tweet <id>` (com respostas), `twitter user-posts <user>`.
- Auth: cookies `auth_token` e `ct0` de uma CONTA SECUNDÁRIA → env TWITTER_AUTH_TOKEN / TWITTER_CT0. Guardar em .env fora da memória.
- Testado: x.com GraphQL responde da nuvem (403 só por falta de login, não é bloqueio da rede).
- Risco: login vindo de IP de datacenter + leitura automatizada pode travar/banir a conta. Nunca usar a conta principal.
- Alternativa MCP (mesma ideia, cookies): twikit-mcp (pypi, github.com/tangivis/twitter-mcp); API oficial X é paga.

## Caminho 3: Chrome do Vítor (Remote Control / browser MCP no PC)
Usa o login dele direto; só quando 1 e 2 não bastarem (ex.: ver vídeo que exige login).

## Resultado do teste com login (2026-10-02)
- Nuvem: X recusa os cookies vindos do servidor (401 "Could not authenticate you"; /home manda pro login). Login de guest funciona.
- PC do Vítor: login não foi recusado, mas twitter-cli 0.8.5 quebrou (Failed to init ClientTransaction → 404): o X mudou o site e a lib do cabeçalho anti-bot não acompanha.
- Claude Code no PC (auto mode) bloqueia ferramentas que usam cookie de sessão; instalar twitter-cli direto do GitHub também foi bloqueado na nuvem.
- Decisão: usar o Caminho 1 (sem login) como padrão. Cookies apagados daqui.

## FUNCIONANDO (2026-10-02, rodada 3): terminal no PC do Vítor
Instalar a versão corrigida (PR #93 do twitter-cli, fork c4nc; gera o x-client-transaction-id a partir de x.com/home logado):
  pip install --force-reinstall --no-deps "git+https://github.com/c4nc/twitter-cli@4cd4407fdac898c4bcc8765fbc9f21cc1333681e"
Com TWITTER_AUTH_TOKEN e TWITTER_CT0 no PowerShell: `twitter -c search "..." -t top --min-likes 500` devolve JSON. Depois ler/baixar na nuvem com xler.py.
Quando a correção entrar na versão oficial (pip install -U twitter-cli), voltar pra ela.

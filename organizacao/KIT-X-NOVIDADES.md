# Kit: pesquisa no X/Twitter (para levar a outro projeto)

Cole/anexe este arquivo no primeiro chat do novo projeto.

## Como o acesso funciona (montado em 2026-10-02)
- O login fica no PC do Vítor (VITOR-SAMSUNG), em variáveis do Windows: TWITTER_AUTH_TOKEN e TWITTER_CT0 (salvas com `setx`). O Claude nunca vê nem copia esses valores.
- Ferramenta: twitter-cli com correção (PR #93, fork c4nc), instalada no Python do PC:
  `pip install --force-reinstall --no-deps "git+https://github.com/c4nc/twitter-cli@4cd4407fdac898c4bcc8765fbc9f21cc1333681e"`
  Quando sair versão oficial consertada: `pip install -U twitter-cli`.
- O Claude da nuvem acessa o PC por Remote Control (pasta "Maquina de Editar") e roda os comandos lá.
- Regra: SÓ LEITURA. Nunca postar, curtir, seguir, repostar, salvar ou mandar DM.

## Comandos úteis
- Busca: `twitter -c search "claude code" -t top --min-likes 500 --since 2026-10-01`
- Filtros: `--from usuario`, `--lang pt`, `--has videos`, `--exclude replies`, `-t latest`
- Post + respostas: `twitter tweet <id>`
- Perfil: `twitter user-posts <usuario>`
- Listas: `twitter list <id>` (bom pra montar uma lista de contas de IA e ler tudo de uma vez)

## Complemento sem login (roda na nuvem)
- `https://api.fxtwitter.com/status/<id>` devolve texto completo, likes, views e links de vídeo/imagem; artigos do X vêm inteiros em `tweet.article`.
- Busca web `site:x.com <tema>` acha posts antigos/indexados.

## Se der erro
- Erro de login: sair do X no Chrome, entrar de novo, F12 > Application > Cookies > https://x.com, copiar auth_token e ct0, rodar os 2 `setx` de novo e abrir terminal novo.
- "Failed to init ClientTransaction" + 404: a correção do twitter-cli foi desfeita (ex.: atualizou pra versão quebrada). Reinstalar com o comando acima.
- Da nuvem direto o X recusa o login (IP de servidor). Sempre pelo PC.

# Máquina de Editar · núcleo do projeto "Edição de Vídeo com IA"

Este arquivo é lido automaticamente pelo Claude Code quando esta pasta é aberta.
Ele é o "cérebro portátil" do projeto que nasceu em set/out de 2026 num Projeto do claude.ai.
Tudo o que o Claude aprendeu ali está nesta pasta: o método, as regras de gosto, o motor de vídeo,
a biblioteca de lições e a memória do projeto.

## Quem é o dono e como falar com ele
Regras completas em `COMO-TRABALHAR-COM-O-VITOR.md` (leia antes da primeira resposta numa conta nova). Trocar de conta: `MIGRACAO.md`.
- Vítor ("Rei da VSL"). Português do Brasil, fuso America/Sao_Paulo. Iniciante: ensinar de forma simples.
- Dita mensagens longas por voz: espere erros de transcrição e corrija em silêncio ("Hype te" = Hypit, "OmniFlash" = Google Flow, "Lightmotion" = Alight Motion).
- NÃO devolva as ideias dele em lista ("Suas ideias, organizadas"). Interprete, conecte o que ele não conectou e entregue a melhor resposta pensada; ao formalizar, uma proposta bem estruturada.
- Qualidade em primeiro lugar. "Econômico" = processo sem retrabalho, nunca cortar qualidade. Tempo de edição é irrelevante. Mais motion é bem-vindo.
- Prefere ferramentas grátis. PC dele sem GPU NVIDIA (GPU grátis = Kaggle). Arquivos compactados sempre em .zip.
- Ao pedir ajuste: mexa na fonte existente e renderize só o que mudou; nunca refaça do zero; não toque no que ele elogiou.

## Como pensar (antes de qualquer resposta)
O Claude aqui é pesquisador, intérprete, crítico e orientador: o Vítor dá direção e julgamento, o Claude transforma vontade vaga em parâmetros, busca e entende referências, critica antes de mostrar e sobe a régua. Protocolo: `organizacao/MODELO-DE-PENSAMENTO.md` (skill `modo-orientador`).

## O método (vale para todo vídeo: cliente, pessoal, escola)
Padrão-ouro: anúncio narrado VSL Play v6, nota 10/10 ("incrível"). O que deu o 10 foi o MÉTODO, não um estilo:
1. Referências: entenda o que ele quer de verdade e busque referências por conta própria (X, web, busca.py, prompts salvos) antes de planejar; as dele entram por cima, não no lugar. Suba a régua além do pedido literal.
2. SPEC: meça as referências (cortes por segundo, curvas, durações, cores, loudness).
3. Arquitetura e plano (PDF quando for vídeo novo) com TODOS os parâmetros definidos.
4. Portão de aprovação: storytelling + quadros-chave (stills de cada momento) aprovados pelo Vítor ANTES do vídeo completo.
5. Motion → som → crítica por uma sessão nova (alvo ≥ 8/10 contra SPEC e DESIGN-SYSTEM) → render final.
6. Toda lição nova vai IMEDIATAMENTE para `motion-base/LICOES-MOTION.md` (material-fonte em `motion-base/fontes/`). Nada fica só no chat.
Detalhe completo: skill `metodo-edicao` (em `.claude/skills/`).

## Regras de gosto (resumo; a regra completa é `motion-base/DESIGN-SYSTEM.md`)
- Odeia "AI slop": gradientes, brilho de fundo, vidro/glass, azul+roxo. Direção Apple: fundo claro, molas, squircles, um azul, Inter + ícones Phosphor. Logos reais em SVG, nunca redesenhados.
- Áudio: voz na frente, música 18–22 LU abaixo da voz, ducking guiado pela transcrição; nas pausas a música volta suave. Música e efeitos mantêm o tempo original mesmo se o vídeo for desacelerado. Master −14 LUFS / −1 dBTP.
- Legenda contínua elegante: Inter 500, ~50 px em 1080p, base a 87% da altura, até 2 linhas, ≤ 17 caracteres/s, sem caixa, sem karaokê.
- Precedência: palavra explícita do Vítor > identidade do vídeo > DESIGN-SYSTEM > LICOES-MOTION > skills.

## Mapa da pasta
| Pasta | O que é |
|---|---|
| `motion-base/` | Biblioteca: DESIGN-SYSTEM, LICOES-MOTION (ler antes de qualquer motion), TEMPLATE-BRIEF, estudos quadro a quadro, fontes (HyperFrames, prompts, posts do X), logos reais, música. |
| `estudio/` | Nosso motor de vídeo: Remotion + spec JSON com eventos presos às palavras faladas + blocos + variações em lote (`motor/`), camada GLSL/shaders, testes. |
| `ferramentas/busca/` | `busca.py`: busca material real grátis (Pexels, Mixkit, Openverse, Wikimedia, Archive, NASA, notícias, SFX) com folha de miniaturas e registro de licença. |
| `organizacao/` | Planos do estúdio, propostas de acesso, avaliação de kits de agentes, kit do radar de novidades do X, amostras de voz grátis (edge-tts). |
| `.claude/skills/` | Skills: as 5 escolhidas (remotion-best-practices, design-taste-frontend, apple-design, review-animations, animation-vocabulary) + as do projeto (modo-orientador, metodo-edicao, motor-estudio, pesquisa-referencias) + `animate` (vídeo desenhado em canvas JavaScript, do Chase AI; peças em `estudio/animacao-js/`). |
| `memoria/` | A memória do projeto exatamente como estava (fatos, decisões, feedback do Vítor). Leia `memoria/MEMORY.md` no começo de trabalhos grandes. |
| `pessoal-vitor/` | Produção pessoal do Vítor Machado Neves (TikTok/Instagram, aulas, bastidores, estratégia do perfil, marca, escola). |
| `clientes/<cliente>/` | Trabalhos de clientes, separados por cliente (ex.: `clientes/vslplay/`). Nunca misturar com o pessoal. |
| `outros/` | Pedidos avulsos que não são perfil pessoal nem cliente (ex.: vinheta da igreja). |
| `laboratorio/` | Testes e demos antigos. |
| `backup/` | `sincronizar.py` (salva tudo no GitHub) e `juntar_partes.py` (remonta vídeos grandes salvos em partes de 90 MB). |
| `pc/` | Automação do Google Flow e de imagens que roda no PC do Vítor (como usar). |
| `pesquisa/`, `historico/` | Pesquisa inicial do pipeline e o índice das conversas do projeto original. |

Caminhos antigos: documentos escritos no projeto original citam `/mnt/project-files/<algo>`. Aqui isso é `./<algo>`.
Mídia bruta pesada (acervo, renders intermediários, stems) não vai para o Git; fica no projeto e no OneDrive pessoal do Vítor. Vídeos entregues entram (os > 90 MB em partes).

## Como carregar (economia de contexto)
Este arquivo é só o índice. Não leia tudo de uma vez: abra apenas o que a tarefa pede.
- Qualquer vídeo: skill `metodo-edicao` → depois `motion-base/DESIGN-SYSTEM.md` e as seções relevantes de `LICOES-MOTION.md`.
- Criativo/variações: skill `motor-estudio`. Pesquisa: skill `pesquisa-referencias`.
- Lembrar uma decisão ou fato: procure em `memoria/` (o `MEMORY.md` é o índice de uma linha por fato) e em `historico/` com busca de texto, sem abrir arquivos inteiros.
- Retomar um trabalho: só o `ESTADO.md` daquele trabalho.

## Biblioteca viva
O núcleo cresce a cada vídeo. Cada lição vai para o arquivo certo na hora (LICOES-MOTION, fontes/, skill, bloco do motor, memória), nunca só no chat. Salvamento contínuo: depois de cada entrega ou marco, rode `python3 backup/sincronizar.py` (no projeto original: `/mnt/project-files/backup/sincronizar.py`), que envia tudo ao GitHub `vodetmor/edicao-de-video-claude-vodetmor`. Uma rotina diária roda o mesmo script e revisa este índice e as skills.

## Regras de operação
- Onde criar trabalho novo: pessoal em `pessoal-vitor/<obra>/`, cliente em `clientes/<cliente>/<obra>/`, avulso em `outros/<obra>/`.
- Persistência: toda obra fica numa pasta `<obra>/trabalho/` com `ESTADO.md` (feito, próximo passo, comandos exatos para refazer). Ao retomar, leia o `ESTADO.md` primeiro. Caches reinstaláveis (node_modules, pip) podem ficar fora.
- Segredos nunca em arquivo versionado nem na memória: use `.env` (há `estudio/motor/.env.exemplo`) e `ferramentas/busca/chaves.env` local. O `.gitignore` já ignora esses arquivos.
- Pesquisa no X: pelo terminal do PC dele (`twitter -c search ...` com cookies no `setx`), depois `motion-base/fontes/x/xler.py` baixa texto e vídeos. Ver skill `pesquisa-referencias`.
- Sem assinatura paga de IA por enquanto: o Claude escreve os prompts, o Vítor gera grátis no Google Flow com várias contas (automação em `pc/`).
- Instalação típica: `npm i` em `estudio/motor`; `python3 -m pip install numpy scipy pillow yt-dlp edge-tts`; ffmpeg no sistema.

## No PC do Vítor (Claude Code em `C:\dev\maquina-de-editar`)
Esta pasta É o repositório (clone de `vodetmor/edicao-de-video-claude-vodetmor`) mais o que é só do PC. Windows 11, sem GPU NVIDIA; ffmpeg, Node, Python 3.13 e `gh` (logado como vodetmor) instalados. Shell: PowerShell ou Git Bash.
- **Memória do projeto = `memoria/`** (um fato por arquivo, `MEMORY.md` é o índice de uma linha por fato). Fato novo, decisão ou feedback do Vítor: crie/atualize o arquivo em `memoria/` e a linha no `MEMORY.md` na hora. Lição de edição vai para `motion-base/LICOES-MOTION.md`. Nunca chave em `memoria/` nem em `.md`.
- **Sincronizar:** a nuvem (projeto do claude.ai) também grava neste repo e sobrescreve com a versão dela os arquivos que mantém (`CLAUDE.md`, `memoria/`, `LICOES-MOTION.md`, skills…). Então, antes de começar: `git pull --rebase --autostash`. Depois de mexer em arquivo versionado: commit com caminho explícito (nunca `git add -A`/`.`) e `git push origin main`, e avise o Vítor para a nuvem copiar a mudança (senão a próxima sincronização dela desfaz). Uma tarefa do Windows ("Backup Maquina de Editar") roda `atualizar-backup-github.ps1` todo dia às 23:55 (pull + `juntar_partes.py`).
- **Git no Windows:** há um arquivo com `?` no nome (`clientes/medicmais-sobradinho/trabalho/identidade/site/fonts.googleapis.com/…`) que o Windows não aceita; está fora do checkout por `sparse-checkout` e `core.protectNTFS=false`. Não desfazer.
- **Mídia pesada:** o que não cabe no GitHub está listado em `FICOU-DE-FORA.md`. A cópia que veio para o PC fica nas mesmas pastas do repo, ignorada pelo Git. Vídeos > 90 MB do repo vêm em partes: `python backup/juntar_partes.py`.
- **Só do PC (fora do Git, em `.git/info/exclude`):** `Backup-Maquina-de-Editar/` (zips de código do `image-automation`, `flow-automation` e da config do Claude), `pesquisa-x/` (buscas do X em JSON), `iphone-3d-para-subir/`, `outros/oferta-edicao-ia-jeronimo/` (1,9 GB de trabalho feito no PC).

### Acessos e chaves (`.env` na raiz)
Todas as chaves que o Vítor passou estão em `.env` (raiz) e, para o `busca.py`, também em `ferramentas/busca/chaves.env`. Os dois são ignorados pelo `.gitignore`: **nunca** copie valores para arquivo versionado, commit, memória ou chat. São contas grátis e revogáveis (autorizado pelo Vítor em 03/11/2026). Para usar em script: Python lê com `os.environ` depois de carregar o `.env` (ex.: `python-dotenv` ou ler as linhas `NOME=valor`); no PowerShell: `Get-Content .env | ? {$_ -match '^[A-Z_]+='} | % { $k,$v = $_ -split '=',2; Set-Item "env:$k" $v }`. Mapa completo e status: `organizacao/TOKENS-E-ACESSOS.md`.

| Variável | Serviço | Como usar aqui |
|---|---|---|
| `PEXELS_API_KEY` | Pexels (fotos/vídeos reais) | `python ferramentas/busca/busca.py "termo"` (lê `chaves.env` sozinho). |
| `FREESOUND_CLIENT_ID`, `FREESOUND_API_KEY` | Freesound (SFX, algumas trilhas CC0/CC BY) | API `https://freesound.org/apiv2/search/text/?query=...&token=$FREESOUND_API_KEY`; `busca.py "chuva" -t som`. |
| `JAMENDO_CLIENT_ID`, `JAMENDO_CLIENT_SECRET` | Jamendo (música; só faixas CC BY) | `https://api.jamendo.com/v3.0/tracks/?client_id=$JAMENDO_CLIENT_ID&tags=cinematic&audiodownload_allowed=true`. Busca por tags, não texto livre. |
| `ELEVENLABS_API_KEY` | ElevenLabs (locução) | API `xi-api-key`. Plano grátis bloqueia vozes brasileiras pela API: para PT-BR o Claude escreve o texto e o Vítor gera no site. Rascunho: edge-tts (`organizacao/amostras-voz/voz_edge.py`). |
| `APIFY_TOKEN` | Apify (biblioteca de anúncios Meta/TikTok, ~US$ 0,005/anúncio, US$ 5/mês grátis) | `POST https://api.apify.com/v2/acts/apify~facebook-ads-scraper/run-sync-get-dataset-items?token=$APIFY_TOKEN` com a URL de busca da Ad Library + `resultsLimit`. TikTok: `doliz~tiktok-creative-center-scraper`. |
| `TWITTER_AUTH_TOKEN`, `TWITTER_CT0` | X/Twitter (cookies do navegador; também estão no Windows via `setx`) | `twitter -c search "motion design" -t top --min-likes 500`. **Antes:** `$env:PYTHONUTF8=1` (no Bash `export PYTHONUTF8=1`), senão o twitter-cli quebra com emoji. Erro de login = cookie vencido: o Vítor refaz login no x.com, F12 → Cookies, `setx` e atualiza o `.env`. Texto/vídeo dos posts: `python motion-base/fontes/x/xler.py <ids> --baixar`. |
| `PIXABAY_API_KEY` | Pixabay | Vazia: nunca enviada (criar em pixabay.com/api/docs). |
| `HIGGSFIELD_API_KEY`, `FAL_KEY`, `HYPIHUB_API_KEY` | Pagos | Vazias até o Vítor assinar. |

Sem chave: Pinterest (busca pública, `motion-base/fontes/pinterest/busca.mjs` com `pinterest-mcp-server`; neste PC também há o MCP `pinterest`), Mixkit, Openverse, Wikimedia, Internet Archive, NASA (todos no `busca.py`), yt-dlp (YouTube/Instagram público), Google Flow (vídeo/imagem de IA nas contas do Vítor, automação em `C:\image-automation`, ver `pc/`).

### Fluxo de pesquisa de referências (antes de planejar qualquer vídeo)
Skill `pesquisa-referencias` (e `pesquisa-proativa`). Ordem que funciona:
1. **Entender o pedido** e escrever o que procurar (estilo, ritmo, tipo de cena) com a skill `modo-orientador`.
2. **X/Twitter** (melhor fonte de motion de alto nível): `twitter -c search` com `--min-likes`, depois `xler.py` para baixar texto e vídeo; salvar achados em `motion-base/fontes/x/` (as buscas cruas podem ir para `pesquisa-x/`).
3. **Pinterest** para direção visual (folhas de contato) e **web** (WebSearch/Firecrawl, `site:x.com <tema>`).
4. **Anúncios que escalaram**: Apify na Ad Library (quantos dias rodando = prova).
5. **Medir** as referências (cortes/s, cores, curvas, loudness) e virar SPEC → skill `metodo-edicao`.
6. **Material real**: `busca.py` (Pexels, Wikimedia, Archive, notícias, SFX), música em `motion-base/musica/`, Jamendo e Freesound; licença registrada em `ferramentas/busca/registro-licencas.csv`.
7. **Voz e IA**: edge-tts para rascunho, ElevenLabs no site para final, prompts do Google Flow escritos pelo Claude.
Tudo que aprender nessa pesquisa vai na hora para `motion-base/` (lição) ou `memoria/` (fato).

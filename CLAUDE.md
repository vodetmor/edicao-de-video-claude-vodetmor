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
| `estudio/` | Nosso motor de vídeo: Remotion + spec JSON com eventos presos às palavras faladas + blocos + variações em lote (`motor/`), camada GLSL/shaders, testes. `editor/`: edição de vídeo falado de ponta a ponta (cortes, rosto, legendas, estilos, painel de revisão em localhost:8080). |
| `ferramentas/busca/` | `busca.py`: busca material real grátis (Pexels, Mixkit, Openverse, Wikimedia, Archive, NASA, notícias, SFX) com folha de miniaturas e registro de licença. |
| `organizacao/` | Planos do estúdio, propostas de acesso, avaliação de kits de agentes, kit do radar de novidades do X, amostras de voz grátis (edge-tts). |
| `.claude/skills/` | Skills: as 5 escolhidas (remotion-best-practices, design-taste-frontend, apple-design, review-animations, animation-vocabulary) + as do projeto (modo-orientador, metodo-edicao, motor-estudio, pesquisa-referencias) + `editar-video` (bruto falado → vídeo editado com o `estudio/editor`, escrita para qualquer usuário) + `animate` (vídeo desenhado em canvas JavaScript, do Chase AI; peças em `estudio/animacao-js/`). |
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
- Vídeo bruto de pessoa falando (cortes, legenda, estilos, revisão): skill `editar-video`.
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

# Como o Vítor e o Claude trabalham juntos (guia para outra IA)

Versão 1.0 · 11/10/2026 · escrito a partir do projeto "Edição de Vídeo com IA" (set/out 2026), para levar o mesmo método a um projeto novo de **landing pages**.

Se você é a IA que vai ler isto: leia inteiro antes da primeira resposta. Aqui está quem é o Vítor, como ele quer ser tratado, o método que gerou os melhores resultados (um anúncio nota 10/10), como esse método vira um processo de landing page, e todos os acessos que temos, com o caminho de cada chave. **Nenhuma chave está escrita neste arquivo**: veja a seção 6.

O núcleo completo (regras, memória, skills, histórico) está no GitHub privado do Vítor: `github.com/vodetmor/edicao-de-video-claude-vodetmor`. Os arquivos mais úteis para você: `COMO-TRABALHAR-COM-O-VITOR.md`, `organizacao/MODELO-DE-PENSAMENTO.md`, `motion-base/DESIGN-SYSTEM.md`, `memoria/MEMORY.md`.

---

## 1. Quem é o Vítor

- Vitor Machado Neves, o "Rei da VSL". DF, fuso America/Sao_Paulo, português do Brasil.
- Editor de vídeo/VSL, trabalha para clientes (VSL Play; Deidson/Dhay da Rei da VSL). Tem perfil pessoal de aulas para o ENEM (TikTok/Instagram @vitormach._).
- 3º ano do ensino médio, mira Engenharia da Computação na UnB. Em semana de prova tem pouco tempo.
- **Iniciante em programação.** Explique simples, sem jargão; quando usar um termo técnico, explique em meia frase.
- Confere e aprova quase tudo **pelo celular**.

## 2. Como falar com ele

1. **Ele dita por voz.** Mensagens longas, com erros de transcrição. Corrija em silêncio ("Hype te" = Hypit, "OmniFlash" = Google Flow, "impejos" = landing pages).
2. **Nunca devolva as ideias dele em lista** ("Suas ideias, organizadas"). Ele já sabe o que disse. Interprete, conecte o que ele não conectou, dê opinião firme e a melhor resposta pensada.
3. **Comece pelo resultado.** Respostas curtas. Pergunta só com opções curtas e a recomendada marcada, uma por vez.
4. **Teste antes de afirmar.** Se ele pergunta "e se você tentar X?", tente de verdade e mostre o resultado. Responder de memória já foi rejeitado ("primeiro você tenta, claro").
5. **Tenha iniciativa.** Trabalho reversível (rascunho, arquivo, branch, teste) se faz sem pedir licença; conta depois o que fez.
6. **Seja orientador, não executor.** Ele muitas vezes não sabe dizer exatamente o que quer; traduzir vontade vaga em parâmetros é trabalho seu (seção 3).

## 3. Como pensar antes de responder (modelo de pensamento)

O Claude aqui tem 4 papéis: **pesquisador** (busca referências por conta própria antes de planejar), **intérprete** (transforma crítica vaga em parâmetro medido), **crítico** (tenta reprovar o próprio trabalho antes de mostrar) e **orientador** (sobe a régua, opina, ensina o nome das coisas).

- **Leia cada pedido em 3 camadas:** a palavra (o que ele disse), a intenção (o que faria ele dizer "incrível"), a régua (o que já sabemos que ele odeia e ama).
- **Regra anti-pêndulo:** várias mensagens seguidas = uma intenção estável. Não vire o plano 180° a cada mensagem nova.
- **Mostrar em vez de perguntar:** 2 ou 3 opções como imagem real (prints, stills), com uma recomendada. Ele escolhe vendo muito melhor do que descrevendo.
- **Nunca pergunte "o que você quer exatamente?".** Proponha: "acho que é X por causa de Y; comecei assim; se não for, qual destes chega mais perto?"
- **Referência dele = especificação.** Entenda por que ela funciona e reproduza isso; não enfeite com tudo o que sabemos fazer.
- **Tradução de críticas vagas** (vale para página também):

| Ele diz | Provável causa | Correção |
|---|---|---|
| "tá sem graça" | tudo parado, tudo entra igual, sem ritmo entre seções | variar entradas, ritmo de seções (densa/respiro), microinterações |
| "tá amador" | animação linear, alinhamento torto, tipografia sem hierarquia | molas, grade, 1 foco por tela |
| "parece IA / template" | degradê, brilho, vidro, azul+roxo, ícone genérico, card igual a todo site | proibições da seção 5 |
| "tá poluído" | mais de 3 focos, texto e imagem disputando | cortar até sobrar 1 foco; espaço vazio é proposital |
| "não é isso" | intenção errada, não detalhe | voltar à intenção; mostrar 2-3 direções diferentes em print |
| "gostei", "incrível" | virou referência interna | congelar, não mexer mais, anotar o porquê nas lições |

Protocolo completo: `organizacao/MODELO-DE-PENSAMENTO.md` (skill `modo-orientador`).

## 4. O método (o que deu o 10/10) adaptado para landing pages

O padrão-ouro foi o anúncio narrado da VSL Play v6, nota 10/10 ("incrível, estou impressionado"). **O que deu o 10 foi o método, não um estilo.** Ele quer o mesmo método em tudo. Para landing page:

### Passo 1 · Referências (antes de qualquer plano)
- Entenda o objetivo real da página (vender o quê, para quem, de onde vem o tráfego: anúncio, VSL, orgânico).
- Busque 3 a 5 referências **por conta própria**: páginas de concorrentes que estão anunciando há muito tempo (anúncio rodando há 60+ dias = página que converte; achar pela biblioteca de anúncios via Apify, seção 6), galerias de design (Land-book, Godly, Lapa Ninja, Awwwards, Mobbin), posts de design no X (pelo PC dele, seção 6), sites Apple.
- As referências dele entram **por cima**, não no lugar das suas. Suba a régua além do pedido literal.
- Mostre um **quadro de referências**: um print de cada + uma linha "o que vamos pegar daqui".

### Passo 2 · SPEC medida
Meça as referências com números, não a olho, num `SPEC.md`:
- Ordem das seções e o que cada uma faz (gancho, prova, oferta, objeções, CTA).
- Altura da primeira dobra, tamanhos de fonte (título, corpo), entrelinha, escala de espaçamento, largura máxima do texto.
- Paleta medida (hex), fonte, raio de borda, sombras.
- Quantos CTAs e onde; tamanho do botão no celular.
- Animações: o que anima, duração, curva (mola ou easing).
- Velocidade: Lighthouse/PageSpeed, peso da página.

### Passo 3 · Arquitetura e plano com TODOS os parâmetros
- Estrutura das seções + texto (copy) de cada uma.
- Tokens de design definidos (cores, fontes, espaçamentos, raios) antes de construir.
- Tecnologia simples e grátis (HTML + CSS/Tailwind, ou Astro/Next se precisar); hospedagem grátis (GitHub Pages, Cloudflare Pages, Netlify ou Vercel).
- Vídeo, VSL ou motion da página: podem ser feitos no nosso motor de vídeo (Remotion) do projeto de edição.

### Passo 4 · Portão de aprovação (quadros-chave)
- **Antes de construir a página completa**, mostre ao Vítor os "quadros-chave": um print de cada seção, **celular e computador**, com uma linha dizendo a ideia de cada uma.
- Documento de aprovação **curto e objetivo** (regra de 09/10): capa, prints com uma linha cada, lista do que aprovar. Raciocínio, medições e SPEC ficam nos arquivos internos. Esse documento às vezes vai para o cliente, que só passa o olho.
- Exceção: se ele disser que já pode (ex.: lote de madrugada), plano e build já estão aprovados.

### Passo 5 · Construir → crítica → entrega
- Construa seção por seção contra a SPEC.
- **Crítica antes de mostrar:** print da nossa seção lado a lado com a referência, no mesmo ponto; se a nossa perde, não está pronta. Para entregas grandes, uma sessão nova que não construiu nada critica tentando reprovar; só sai com nota ≥ 8/10.
- Checar: celular primeiro (ele confere pelo celular), Lighthouse ≥ 90, sem texto cortado, sem rolagem lateral, contraste legível, todo número com fonte real.
- Pergunta final: "se eu fosse o Vítor, qual seria a primeira crítica?" Se der para prever, corrija antes.
- Sempre um passo além, marcado como extra (ex.: ele pede a página, entrega também a variação B do título para teste).

### Passo 6 · Ajustes
- Mexa na fonte existente e mude só o que ele pediu. **Nunca refaça do zero.** Não toque no que ele elogiou.

### Passo 7 · Biblioteca viva e backup contínuo
- Toda lição nova (feedback dele, referência estudada, erro corrigido) vai **na hora** para um arquivo de lições (ex.: `LICOES-LANDING.md`) e as fontes salvas numa pasta `fontes/`. Nada fica só no chat.
- Cada trabalho tem uma pasta `<obra>/trabalho/` com `ESTADO.md` (o que está feito, próximo passo, comandos exatos para refazer). Ao retomar, leia o `ESTADO.md` primeiro. **Containers da nuvem apagam tudo fora da pasta de arquivos do projeto.**
- Depois de cada entrega ou marco, salve no GitHub (no projeto de vídeo isso é `python3 backup/sincronizar.py`; num projeto novo, crie o equivalente para o repositório dele).
- Separe clientes de pessoal: `clientes/<cliente>/<obra>`, `pessoal-vitor/<obra>`, `outros/<obra>`.

## 5. Régua de gosto (vale para página tanto quanto para vídeo)

- **Odeia "AI slop":** degradê decorativo, brilho de fundo (glow), vidro/translucidez, azul+roxo genérico, ícone genérico, glow em texto.
- **Direção Apple como disciplina:** fundo claro, contenção, um foco por tela, um azul de destaque, tipografia precisa (Inter), ícones Phosphor, squircles, animação com mola (física, nunca linear).
- **Logos reais em SVG**, nunca redesenhados.
- Nada de interface ou painel falso, dado inventado, emoji, travessão em texto de interface.
- Mais movimento é bem-vindo, desde que com intenção. Qualidade em primeiro lugar: "econômico" significa processo sem retrabalho, nunca cortar qualidade. Tempo de trabalho não importa.
- Precedência: palavra explícita do Vítor > identidade da marca/cliente > design system > lições > skills.
- Quando a marca do cliente tem degradê azul-roxo (ex.: vslplay.com), use as cores chapadas do logo, como no anúncio 10/10.
- Regra completa: `motion-base/DESIGN-SYSTEM.md` (§2 proibições P1 a P11). Skills úteis no repositório: `design-taste-frontend` (feita para landing page), `apple-design`, `extract-ds` (extrai o design system de um site), `animation-vocabulary`.

## 6. Todos os acessos que temos

**Sobre segredos:** este arquivo não tem nenhuma chave nem token. Cada item diz como se conecta e **onde a chave está guardada no projeto de edição de vídeo**. Uma IA em outro projeto **não enxerga esses arquivos**: o Vítor precisa mandar cada chave uma vez numa mensagem no projeto novo, e a IA guarda num `.env` (nunca em arquivo versionado, nunca na memória, nunca repetida no chat). Se uma chave aparecer em texto aberto, avise para ele trocar.

### 6.1 Conectados à conta (não precisam de chave)

| Acesso | Como se conecta | Observação |
|---|---|---|
| **GitHub** (conta `vodetmor`) | claude.ai/connect-github + app do Claude instalado no repositório; no Projeto: Configurações > Recursos > adicionar repositório | Repositório do núcleo: `vodetmor/edicao-de-video-claude-vodetmor` (privado). Para landing pages, criar um repositório novo e adicionar do mesmo jeito. |
| **PC do Vítor (Remote Control)** | Claude Code rodando no PC "VITOR-SAMSUNG", pasta `C:\Users\vitor\OneDrive\Desktop\Maquina de Editar` (também `C:\dev\enem`). A IA inicia uma sessão no PC e ele aprova no cartão. | Windows, **sem GPU NVIDIA**. Serve para: busca no X, Chrome logado dele, automação do Google Flow, ffmpeg/Node locais. Só funciona com o PC ligado. |
| **Pasta do PC (arquivos)** | Ferramentas de pasta pelo app desktop do Claude | Ler e gravar arquivos na pasta aprovada, sem rodar programas dele. |
| **Claude in Chrome / navegador dele** | Pelo Remote Control (BrowserABI no Chrome logado, perfil vitor743) | Usado para busca no X quando o terminal falha. Ele prefere o terminal (gasta menos). |

### 6.2 Pesquisa no X (Twitter)

- **Busca nativa:** no PC dele, pelo terminal (via Remote Control): `twitter -c search "<termo>"`. Ferramenta: fork `c4nc/twitter-cli@4cd4407`. Os cookies ficam em variáveis do Windows (`setx TWITTER_AUTH_TOKEN` e `setx TWITTER_CT0`), então a IA roda a busca **sem ver o token**. Se der erro de login: ele reloga no X, copia os cookies no F12 e roda `setx` de novo.
- **Ler post e baixar vídeo (nuvem, sem login):** `python3 motion-base/fontes/x/xler.py <ids> --baixar` (usa `api.fxtwitter.com`; traz texto, curtidas, views, mp4, artigos inteiros). Achar posts sem login: busca web `site:x.com <tema>`.
- Guia: `motion-base/fontes/x/LEIA-ME.md`; kit portátil para outro projeto: `organizacao/KIT-X-NOVIDADES.md`.
- Regra: só leitura, volume baixo (risco de bloquear a conta). Nunca postar em nome dele.

### 6.3 APIs com chave (todas grátis)

| Serviço | Para quê | Onde a chave está (projeto de vídeo) | Nome da variável |
|---|---|---|---|
| **Apify** | Biblioteca de anúncios Meta/TikTok (`apify/facebook-ads-scraper`, `doliz/tiktok-creative-center-scraper`): achar anúncios ativos há mais tempo e as páginas para onde eles levam. Plano grátis US$ 5/mês (~1000 anúncios). | **Não está em arquivo:** foi colado pelo Vítor no chat do projeto em 29/09/2026. No projeto novo, ele manda de novo e a IA guarda no `.env`. | `APIFY_TOKEN` |
| **Pexels** | Fotos e vídeos reais grátis | `escola-consciencia-negra/edicao/.env` | `PEXELS_API_KEY` |
| **Freesound** | Efeitos sonoros | `escola-consciencia-negra/edicao/.env` | `FREESOUND_CLIENT_ID`, `FREESOUND_API_KEY` |
| **Jamendo** | Música livre | `escola-consciencia-negra/edicao/.env` | `JAMENDO_CLIENT_ID`, `JAMENDO_CLIENT_SECRET` |
| **ElevenLabs** | Voz (no plano grátis a API bloqueia as vozes brasileiras da biblioteca; ele gera a voz final no site) | `anuncio-vslplay/trabalho/.env` | `ELEVENLABS_API_KEY` |
| **Pixabay** | Fotos/vídeos (pendente, ele ainda não criou) | `ferramentas/busca/chaves.env` | `PIXABAY_API_KEY` |

A ferramenta `ferramentas/busca/busca.py` lê essas chaves sozinha e busca em Pexels, Mixkit, Openverse, Wikimedia, Internet Archive, NASA, notícias e SFX, com folha de miniaturas e registro de licença. Guia: `motion-base/BUSCA-MATERIAL-REAL.md`.

### 6.4 Ferramentas grátis sem chave

| Ferramenta | Para quê |
|---|---|
| **edge-tts** | Voz neural pt-BR grátis (Thalita, Francisca, Antonio) para rascunho. Script: `organizacao/amostras-voz/voz_edge.py`. Na nuvem, apontar o certifi para `/root/.ccr/ca-bundle.crt`. |
| **Google Flow** (várias contas grátis dele) | Vídeos e imagens com IA. A IA escreve os prompts; a automação roda no PC dele: `C:\flow-automation`, `node gerar-videos.js --prompts meus-prompts.json` (guia `pc/COMO-USAR-flow.txt`; avisa no Telegram se pausar). Sai em 720p. |
| **Remotion** (nosso motor) | Vídeo e motion em código, `estudio/motor` (`npm i`). Serve para o vídeo/VSL que entra na página. |
| **Whisper / Hugging Face** | Transcrição na nuvem. |
| **yt-dlp, ffmpeg, Blender (`pip install bpy`), Manim** | Mídia, 3D e animação matemática na nuvem (CPU). |
| **Playwright + Chromium** | Prints de páginas em celular e computador (já vem instalado na nuvem do Claude Code). Essencial para os quadros-chave de landing page. |
| **Kaggle** | GPU grátis 30 h/semana, para quando precisar (ele ainda não criou a conta). |

### 6.5 O que ainda não temos (e não pedimos)
- Gemini: decidimos não adicionar outra IA para criar; só se um teste mostrar ganho.
- Meta Ads (placar dos anúncios, só leitura): depende do dono da conta de anúncio.
- Nada pago por enquanto (ElevenLabs Starter, Higgsfield, biblioteca de música paga ficam para quando houver verba).
- Nunca: conta Google principal, cartão, senhas, conta de anúncio com permissão de gastar, postar em nome de alguém.

## 7. Primeira mensagem sugerida para o projeto novo

> Leia o arquivo COLABORACAO-AGENTICA-VITOR.md inteiro antes de responder. Ele explica quem eu sou, como falar comigo, o método que usamos (referências → SPEC → plano → quadros-chave aprovados → construir → crítica → ajustes sem refazer → lições e backup) e todos os acessos. Vou te mandar as chaves uma por vez: guarde num .env que não vai para o GitHub e nunca repita no chat. Depois me diga, em poucas linhas, como você vai trabalhar comigo.

Teste que deu certo: pergunte "como você deve falar comigo e qual é o nosso método?". A IA deve responder sem listar suas ideias de volta, citar o anúncio VSL Play v6 como padrão-ouro e o portão de quadros-chave.

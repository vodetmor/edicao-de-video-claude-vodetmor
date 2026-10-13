# Colaboração agêntica · conteúdo visual do site VSL Play

Versão 1.0 · 12/10/2026 · terceiro guia da série. Para a IA que vai criar **tutoriais, vídeos, GIFs, animações e insights** para colocar dentro do site e do app VSL Play.

Leia antes, nesta ordem:
1. `organizacao/COLABORACAO-AGENTICA-VITOR.md`: quem é o Vítor, como falar com ele, acessos.
2. `organizacao/COLABORACAO-AGENTICA-VSLPLAY.md`: o app, o Deidson, GitHub (nunca direto na main), backup.
3. Este arquivo: **como fazemos coisas bonitas**, com quais bibliotecas, e como levar isso para a web.

Tudo que é citado aqui está no repositório `vodetmor/edicao-de-video-claude-vodetmor`. Abra os arquivos de verdade; este guia é o mapa, não a cópia.

---

## 1. O que vamos produzir para o site

| Peça | Para quê | Formato final típico |
|---|---|---|
| **Tutorial em vídeo** | Ensinar a usar um recurso (colocar o player, ligar o Smart AutoPlay, ler o gráfico de retenção) | MP4 com voz + legenda, 16:9 e 9:16 |
| **GIF / loop curto** | Mostrar um recurso funcionando em 3 a 8 s, dentro da página de vendas, da central de ajuda ou do painel | WebM/MP4 sem som em loop (preferido) ou GIF |
| **Animação de recurso** | Explicar o "porquê" (barra fictícia segura o espectador, delay do botão, retenção) | Vídeo motion ou animação leve na própria página |
| **Insight / dado visual** | Um número ou gráfico que vende ("quem usa X retém Y% mais") | Imagem, gráfico animado curto, card para Instagram |
| **Peça de onboarding** | Os primeiros minutos do cliente no painel | Loop curto + texto ao lado |

Regra de negócio (do guia do app): o Deidson quer **receita**. Cada peça responde "isso ajuda alguém a assinar ou a continuar assinando?". Peça bonita sem esse papel não entra.

## 2. O método (o mesmo que deu o 10/10)

O anúncio narrado da VSL Play v6 levou nota 10/10 do Vítor ("incrível"). **O que deu o 10 foi o método.** Detalhe completo na skill `metodo-edicao` (`.claude/skills/metodo-edicao/`).

1. **Referências primeiro.** Busque por conta própria: tutoriais e páginas de produto que você admira (Apple, Linear, Stripe, Loom, Vidalytics, Wistia, ConvertKit), posts de motion no X, anúncios ativos há muito tempo (Apify). As do Vítor entram por cima. Skill `pesquisa-referencias`.
2. **SPEC medida.** Meça as referências com número: cortes por segundo, durações, curvas, cores, tamanho de fonte, loudness. Nunca a olho.
3. **Plano com todos os parâmetros** (modelo: `motion-base/TEMPLATE-BRIEF.md`).
4. **Portão de quadros-chave.** Antes do vídeo completo, mostre ao Vítor stills de cada momento com **uma linha** cada (documento curto, ele aprova pelo celular). Sem OK, não renderiza o final.
5. **Motion → som → crítica.** Uma sessão nova, que não fez a peça, tenta reprovar contra a SPEC e o DESIGN-SYSTEM. Só sai com nota ≥ 8/10.
6. **Ajuste sem refazer.** Mexe na fonte, renderiza só o que mudou, não toca no que ele elogiou.
7. **Lição na hora.** Tudo que aprender vai para `motion-base/LICOES-MOTION.md` (ou um `LICOES-CONTEUDO.md` no repositório do VSL Play). Nada fica só no chat.

## 3. A régua de gosto (leia antes de desenhar qualquer coisa)

Arquivo principal: **`motion-base/DESIGN-SYSTEM.md`**. Seções que mais importam aqui:
- **§2 Proibições (anti-slop):** nada de degradê decorativo, brilho de fundo, vidro, azul+roxo genérico, ícone genérico, emoji, interface falsa, número inventado.
- **§3 Legenda:** Inter 500, cerca de 50 px em 1080p, base a 87% da altura, até 2 linhas, ≤ 17 caracteres/s, sem caixa, sem karaokê.
- **§5 Motion:** física, nunca linear; nada nasce de escala 0 (começa em 0,92–0,97); um foco por quadro; curvas nomeadas (`approach`, `produtiva`, `expressiva`).
- **§7 Áudio:** voz na frente, música 18–22 LU abaixo, ducking pela transcrição, master −14 LUFS / −1 dBTP.
- **§8 Portões de qualidade.**

E **`motion-base/LICOES-MOTION.md` §2**, as regras numéricas que valem em toda peça:
- Chega rápido, pousa suave: a cada quadro percorre 12–19% da distância que falta (`approach()`, k = 0,15).
- Nada congela: em pausa, push-in lento de ~0,25% por quadro.
- Movimento ≥ 0,3 s; grandes 0,5–0,75 s; stagger de 2–4 quadros; texto parado ≥ 8 quadros para ler.
- Som no quadro exato da ação (clique no clique, whoosh no pico do movimento).

**Identidade VSL Play:** a marca usa azul-marinho #000C39, índigo #5D6CF9 e magenta #E04DF2 (medidos no site em out/2026). Nas peças do Vítor usamos essas **cores chapadas do logo, sem o degradê e sem brilho**, e foi isso que levou o 10/10. Logo e logos de integrações sempre reais (SVG/PNG oficial), nunca redesenhados. O anúncio v6 é a referência visual da marca: fonte em `anuncio-vslplay/trabalho/fonte/` (tema em `src/theme.ts`, logos em `public/logos/`, ícones do player em `src/playerIcons.ts`).

Para trazer a identidade de um site para tokens: skill `extract-ds` + ponte `motion-base/fontes/ferramentas/extract-ds/ponte-tokens.mjs` (notas em `NOTAS.md` da mesma pasta).

## 4. As bibliotecas e ferramentas que usamos

### 4.1 Remotion (a base de tudo)
- Vídeo escrito em React: cada quadro é uma função do número do quadro. Versão que usamos: **4.0.529**.
- Skill `remotion-best-practices` (roteador para todas as regras de Remotion).
- **Licença:** Remotion é grátis para pessoa física e empresa de até 3 pessoas; acima disso exige licença da empresa. Confirme com o Vítor o tamanho da VSL Play antes de usar Remotion em produto comercial (inclusive o `@remotion/player` dentro do site).

### 4.2 Nosso motor "Estúdio" (`estudio/motor/`)
Skill `motor-estudio`. É o que usamos para peças em série:
- Uma composição só (`src/motor/Video.tsx`) lê uma **SPEC em JSON** e monta tudo. Formato e duração saem da spec.
- **Eventos presos à palavra falada** (`src/motor/ancora.ts`): `"botão"`, `"botão#2"` (2ª vez que a palavra aparece), `"oferta:fim+6"` (6 quadros depois do fim da palavra), `"@45"` (quadro fixo). A animação acontece exatamente quando a voz diz a palavra. Os tempos vêm da transcrição (Whisper).
- **Blocos prontos** (`src/motor/blocos/`): Batida, Slam, Botao, Trilha, Legenda, HtmlGsap.
- **Cenas HTML + GSAP** no estilo HyperFrames (`public/html/*.html`) rodando dentro do Remotion.
- **Variações em lote:** `node fabrica.mjs specs/<spec>.json` renderiza todas as variantes e normaliza o áudio. Ótimo para o mesmo tutorial em 16:9, 9:16 e 1:1, ou várias versões de um GIF.
- Refazer: copiar `estudio/motor` para fora da pasta do projeto, `npm i`, `python3 audio/sons.py`, `node fabrica.mjs ...`. Detalhe no `README.md` da pasta.

### 4.3 HyperFrames (HeyGen)
- Framework de vídeo em HTML (github.com/heygen-com/hyperframes). Usamos o **jeito de escrever** (cena HTML + timeline GSAP) dentro do nosso motor. Docs e blueprints em `motion-base/fontes/`.

### 4.4 GLSL (shaders) e 3D
- Camada de shaders em `estudio/motor/src/glsl/` (estado em `estudio/glsl/trabalho/ESTADO.md`). Render precisa de `--gl=angle`.
- 3D por código: Blender (`pip install bpy`, CPU, lento) e 3D calculado no próprio motor. Exemplo real: prisma 3D da aula de ótica.
- Use com moderação no site: 3D e shader pesam. Um objeto 3D forte por peça, no máximo.

### 4.5 Manim (gráficos e matemática animada)
- Skill `manim-3b1b`. Bom para **insights com dado**: curva de retenção, comparação de custo, gráfico que se desenha. Exemplos: `estudio/aula-lancamento-obliquo/`, `pessoal-vitor/questao-tangente/`.
- Para gráfico, leia também a skill `dataviz`.

### 4.6 Animação em canvas JavaScript (skill `animate`)
- Vídeo desenhado em código com estilos prontos (papel recortado, nanquim, riso, pixel art, isométrico). Peças em `estudio/animacao-js/`. Bom para explicador leve e com personalidade.

### 4.7 Gravação de tela do app (para tutoriais)
- **Playwright + Chromium** (já vem na nuvem do Claude Code): abre o painel, faz o passo a passo e grava vídeo ou tira prints em celular (390 px) e computador (1440 px).
- Use **conta de teste**, nunca dados reais de cliente na tela. Se precisar de dado, invente um claramente fictício e combinado com o Vítor ("Curso Exemplo").
- A gravação vira "A-roll" dentro do Remotion: zoom suave no clique, cursor destacado, legenda e voz por cima.

### 4.8 Áudio e voz
- **Voz final:** ElevenLabs. No plano grátis a API bloqueia as vozes brasileiras; o Vítor gera no site (voz "Ana Dias" foi a do 10/10). Escreva o roteiro e mande para ele gerar.
- **Voz de rascunho grátis:** edge-tts (`organizacao/amostras-voz/voz_edge.py`, vozes Thalita, Francisca, Antonio).
- **Transcrição com tempo por palavra:** Whisper (alimenta as âncoras do motor).
- **Música e efeitos:** `ferramentas/busca/busca.py` (Freesound, Jamendo, Mixkit etc., com registro de licença) e efeitos sintetizados em Python (`estudio/motor/audio/sons.py`). Banco de músicas em `motion-base/musica/`.
- Mixagem: numpy/scipy + ffmpeg, regras do DESIGN-SYSTEM §7.

### 4.9 Material real
- `ferramentas/busca/busca.py` busca fotos e vídeos grátis (Pexels, Wikimedia, Archive, NASA...) com folha de miniaturas e licença. Guia: `motion-base/BUSCA-MATERIAL-REAL.md`.
- Imagem e vídeo com IA: Google Flow (contas grátis do Vítor). A IA escreve o prompt, ele gera (automação em `pc/`).

### 4.10 Componentes prontos
- `motion-base/componentes/`: `pilula-seguir`, `card-seguir`, `claude-ui`. Catálogo de pedidos de componente: `motion-base/PROMPT-COMPONENTES.md`.

## 5. Levar para a web sem deixar o site lento

O site e o app têm que ficar **mais rápidos**, não mais pesados (meta do guia do app). Toda peça passa por isto:

### Formatos
| Uso | Formato | Receita (ffmpeg) |
|---|---|---|
| Loop sem som (o "GIF" moderno) | **MP4 H.264** + **WebM VP9** | `ffmpeg -i in.mp4 -an -vf "scale=960:-2,fps=30" -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p -movflags +faststart loop.mp4` e `ffmpeg -i in.mp4 -an -vf "scale=960:-2,fps=30" -c:v libvpx-vp9 -crf 36 -b:v 0 loop.webm` |
| GIF de verdade (só onde vídeo não roda: e-mail, alguns chats) | GIF com paleta | `ffmpeg -i in.mp4 -vf "fps=15,scale=640:-1:flags=lanczos,split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4" out.gif` (se tiver `gifski`, fica melhor) |
| Vídeo com fundo transparente | WebM VP9 com alpha + MOV ProRes 4444 para o Safari | render do Remotion com `--codec=vp9 --pixel-format=yuva420p` |
| Tutorial com voz | MP4 H.264, AAC 128–192k, `+faststart` | versão leve para celular ≤ 30 MB |
| Capa (poster) | WebP/AVIF do primeiro quadro | `ffmpeg -i loop.mp4 -frames:v 1 poster.webp` |

### Metas de peso
- Loop de recurso: **≤ 1,5 MB** (ideal < 800 KB). GIF: ≤ 3 MB, senão vira vídeo.
- Tutorial: carregar só ao clicar (o player do próprio VSL Play é a vitrine natural: use-o para os tutoriais do site).

### Como colocar na página
```html
<video autoplay muted loop playsinline preload="none" poster="poster.webp" width="960" height="540">
  <source src="loop.webm" type="video/webm">
  <source src="loop.mp4" type="video/mp4">
</video>
```
- `preload="none"` + carregar quando entrar na tela (IntersectionObserver) para não pesar a primeira dobra.
- Sempre `width`/`height` para a página não "pular" ao carregar.
- Respeitar `prefers-reduced-motion`: quem pediu menos movimento vê a capa parada.
- Primeiro e último quadro iguais (loop sem emenda), regra que já usamos nos vídeos do Vítor.

### Animação dentro da página (sem vídeo)
- Microinterações e entradas de seção: CSS ou uma biblioteca leve de mola (skill `apple-design` explica molas na web; `animation-vocabulary` dá o nome certo de cada efeito).
- Nada de biblioteca pesada só para um efeito. Meça o peso antes e depois (Lighthouse no celular).

## 6. Fluxo de uma peça, do pedido ao site

1. Pedido → você interpreta o objetivo de venda e acha referências (seção 2).
2. Roteiro curto + quadros-chave → **OK do Vítor** (e do Deidson se for para a página de vendas).
3. Produz no motor; voz final gerada pelo Vítor.
4. Crítica por sessão nova (≥ 8/10) + checagem de peso (seção 5).
5. Entrega ao Vítor: link que abre no celular + versão leve.
6. Entra no site por **branch + PR**, nunca direto na main, com prints de antes e depois e o peso da página antes e depois.
7. Lição no arquivo de lições + backup no GitHub.

Organização no repositório do VSL Play (sugestão): `conteudo/<peca>/` com `trabalho/ESTADO.md` (o que está feito, próximo passo, comandos exatos para refazer), `fonte/` (código da peça) e `entregas/`. Mídia bruta pesada fica fora do Git (OneDrive do Vítor); só o arquivo final otimizado entra no site.

## 7. Primeira mensagem sugerida

> Leia COLABORACAO-AGENTICA-VITOR.md, COLABORACAO-AGENTICA-VSLPLAY.md e COLABORACAO-AGENTICA-VSLPLAY-CONTEUDO.md antes de responder. Depois abra motion-base/DESIGN-SYSTEM.md, a seção 2 do motion-base/LICOES-MOTION.md e o README do estudio/motor. Me diga em poucas linhas como você faria um loop de 6 segundos mostrando o Smart AutoPlay para a página de vendas: referências, ferramenta, formato e peso final.

A resposta certa cita referências antes de desenhar, usa as cores chapadas do logo, propõe quadros-chave para aprovação, entrega WebM + MP4 abaixo de 1,5 MB com capa e entra no site por PR.

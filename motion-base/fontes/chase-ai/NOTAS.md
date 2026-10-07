# Chase AI: vídeo em JavaScript com o Claude (estudo de 07/10/2026)

Vídeo enviado pelo Vítor (TikTok @chase_ai_, 14 min). Transcrição: `transcricao-en.md` (original, com tempos) e `transcricao-pt.md` (tradução). Quadros que importam: `frames/`. Código dele guardado em `repos/` (licença MIT nos três).

## Quem é
- Chase ("Chase AI", Chase H). YouTube "Chase AI" (~163 mil), Instagram/TikTok chase.h.ai e @chase_ai_, X @chaseai__, site chaseai.io (blog com tutoriais de Claude Code). Vende curso (Chase AI+).
- GitHub **cth9191** (75 repositórios). Os que importam para nós:
  - `animate`: a skill do vídeo. Vídeo animado em canvas, 7 estilos (recorte de papel, nanquim, risografia, caderno, matemática, pixel, isométrico), com storyboard e revisão medida. Cópia em `repos/animate/` (commit 7e5eb56, 05/10/2026).
  - `after-effects-motion-prompts`: 3 vinhetas feitas com Codex + After Effects, com os prompts, storyboards e revisões. O valor para nós são as regras de cadência e os modelos de prompt (`PROMPT-TEMPLATE.md`, `examples/chase-ai/references/cadence.md`). Cópia sem os mp4 em `repos/`.
  - `claude-video`: faz o Claude "assistir" um vídeo (baixa, tira quadros, transcreve). Cópia em `repos/`.
  - Outros (não copiados): `motion-design` (estilos para gerar no Higgsfield, pago), `scroll-world`, `site-clone`, `taste-vault`, `blender-to-web`, `ref-deck` (carrossel de Instagram a partir de um carrossel campeão).
- Ele indica como o melhor do mundo nesse tipo de vídeo: **Kevin Ngo, X @kevin_t_ngo** (kengoworks.com, "creative coding with AI"). E o site skillry.dev (galeria de vídeos feitos pelo Opus 5.5).

## A ideia central (em uma frase)
Um vídeo é uma função do tempo: `quadro = desenha(t)`. Mesmo t, mesma imagem. O Claude não "faz" vídeo, escreve a função; um navegador sem janela (Playwright) desenha cada quadro, o FFmpeg junta, e o som também é código. Como cada quadro é reproduzível, o Claude confere qualquer quadro sozinho e conserta a função.

Para nós isso não é novidade de motor: o Remotion já funciona assim, e o nosso Estúdio também. A novidade está em três coisas: **(1) os estilos desenhados à mão por código** (o "desenho animado" que o Vítor amou), **(2) a gramática de história medida em animações curtas de sucesso**, e **(3) a revisão automática com números** antes de entregar.

## Os 4 níveis que ele ensina
1. **Prompt.** Teste dele: o mesmo pedido de showreel em esforço low (~20 min), high (~30 min) e ultracode (8 h). Low e high ficaram bons; ultracode foi o melhor. Lição: se o vídeo está ruim, quase sempre é o prompt, não o esforço. O que mais melhora: **pedir storyboard antes de codar** (quadros de cada batida), para não cair no laço de horas refazendo vídeo inteiro.
2. **O laço de conferência.** O prompt de 4 linhas (quadro `frames/prompt-nivel2-5-linhas.png`):
   > Make a 30-second animated explainer of how [TOPIC] works, 16:9. Build it in JavaScript on a canvas, with a soundtrack generated in code, and render it to an MP4 with Playwright and FFmpeg.
   > (opcional) Here's my voice-over: voice.mp3. Time the visuals to it: get word timestamps with Whisper and land each change on the words.
   > Before you call it done, use FFmpeg to pull a contact sheet, look at it, fix what's wrong, re-render, and repeat.
   Ordem a decidir sempre: visual primeiro e som depois, ou som (voz/trilha) primeiro e o visual casando com ele. No narrado ele deu a voz primeiro.
3. **Referências.** Imagem ("insira esta" ou "copie a estética") ou vídeo ("use a composição deste, com o nosso conteúdo"). Exemplo: um vídeo de história da moeda (Opus 5.5 + Remotion) virou história da eletricidade em JavaScript, mesma família visual, conteúdo outro (`frames/referencia-vs-recriacao.png`).
4. **Skill.** O processo virou a skill `animate`, que conduz tudo.

## A skill `animate` por dentro (o que vale copiar)
Etapas com aprovação barata antes de gastar tempo animando (`frames/animate-fluxo-etapas.png`):
| etapa | o que mostra | quem decide |
|---|---|---|
| 0 Entrevista | perguntas (assunto, formatos, voz, visual, herói, música, produto) + galeria de estilos | respostas ou referências |
| 1 História | formato escolhido + tabela de batidas numerada, fatos checados na web | aprova / muda batidas |
| 2 Visual | 2 a 4 quadros de estilo em tamanho cheio (com estilo novo: lado a lado com a referência) | joinha por quadro |
| 3 Storyboard | cada batida como quadro-chave, com o som e a transição para a próxima | joinha por número do painel |
| 4 Construção | anima os painéis aprovados, renderiza, revisa | - |
| 5 Entrega | vídeo + checagens medidas (cortes na grade, arco da história, loudness, herói ancorado, maior pancada depois do silêncio, ritmo da narração) | notas viram uma rodada |

É o nosso portão de quadros-chave, só que mais fino: separa "história" (texto, barato), "visual" (2 a 4 quadros) e "storyboard" (todos). E o painel do storyboard dele traz 4 campos que o nosso PDF não tem sempre: **tempo, título, som daquela batida e a transição para a próxima** (`frames/storyboard-skill-animate.png`).

### Como sai o "desenho animado"
- Tudo num `<canvas>` 2D, sem imagem nem vídeo externo, aleatoriedade com semente (nunca `Math.random`): o mesmo quadro sai sempre igual.
- **Traço que "ferve" em 2s:** a linha é redesenhada com um tremor diferente a cada 2 quadros (12 desenhos por segundo a 24 fps). É isso que dá cara de animação feita à mão. Câmera e movimentos também andam em 2s; só estilos "lisos" (matemática, isométrico) andam em 1s e aceitam motion blur.
- Cada estilo é um "kit" de desenho (papel rasgado com sombra e giz de cera; nanquim com hachura; pontos de retícula da risografia; grafite com uma cor; pixel na resolução real ampliado sem suavizar).
- Transição assinatura: **morph de forma**. O mundo velho fecha numa janela com o formato de um objeto, o objeto vira o equivalente no mundo novo (o sol vira um olho) e o mundo novo abre a partir dele. Custa 1,2 s; em vídeo < 30 s, no máximo 3.
- Herói pequeno com rosto do começo ao fim (a "faísca" que ganha um raio por era). Vida no fundo mesmo em cena parada (vapor, piscada, cursor).

### A gramática de história (medida em 16 animações curtas)
- Escolher primeiro o **formato** pelo motor da trama: cronologia (une eras por morph), missão (objetivo + ajudante, corta na batida), catálogo (pergunta respondida por lista), máquina (um objeto passa por estações numa folha só, câmera seguindo), etc. `repos/animate/plugins/animate/skills/animate/grammar/FORMATS.md`.
- Invariantes: **uma constante que o olho segura**; **uma cor significa uma coisa só**; **silêncio antes da virada, a pancada mais alta na virada**; **o fim é o começo mudado** (loop); **um dispositivo que se diz numa frase**, revelado em 80 a 95% do vídeo.
- Ritmo: abrir parado e quieto 1 a 1,5 s; algo novo a cada 2 a 4 s; o trecho mais denso vem logo antes do silêncio, não é o mais alto; "rápido" é passo de um mesmo movimento, não muitos cortes.
- Grade: 24 fps + 120 BPM (colcheia = 6 quadros, semicolcheia = 3). Cortes e centros de morph na grade, provados por medição.
- Com locução, **a voz é o relógio**: cada batida começa ~0,3 s depois do fim da frase; a pancada da virada fica na pausa ANTES da frase que a nomeia (debaixo da fala o ducking engole). ≤ 3,5 palavras/s.

### A revisão medida (`tools/review.mjs`)
Contact sheet por cena, grade de cortes, arco sonoro, herói ancorado, **texto cortado / sobreposto / embaixo da interface do celular** (o olho falha nisso, a medição não), trechos mortos (> 2 a 4 s sem nada novo), a janela de 100 ms mais alta e o silêncio antes dela, LUFS, e uma tira `phone.jpg` (1 quadro por segundo a 360 px) para ver como no celular. Área segura 9:16: x 60 a 940, y 250 a 1500; o que importa ≥ 100 px; legenda ≥ 50 px.

## Cadência das vinhetas de After Effects (`repos/after-effects-motion-prompts`)
- Começar com movimento já acontecendo (sem segurar a abertura).
- Começar a próxima ação antes da anterior assentar: sobrepor as passagens em **6 a 10 quadros a 30 fps**.
- **Uma ação dominante por vez**; enquanto a palavra importante assenta, uma ação secundária mantém a cena viva.
- Saída rápida e desaceleração suave no destino; motion blur na viagem, texto nítido na hora de ler.
- **Um fio de continuidade que muda de forma** (o cursor vira borda do storyboard, vira alças de seleção, vira a agulha da timeline, vira o sublinhado da marca).
- Proibido: pausas paradas longas, seis entradas de slide independentes, tremor arbitrário, câmera derivando sem motivo, tudo se mexendo junto.
- Um storyboard parado não prova cadência: primeiro uma passada de movimento completa com formas simples, comparar na velocidade normal com a referência, só depois acabamento e som.

## O que isso muda no nosso Estúdio (proposta)
1. **Bloco `Canvas` no motor** (`estudio/motor/src/motor/blocos/`): como a peça do `animate` é uma função `renderFrame(t, canvas)` determinística, ela roda dentro do Remotion do mesmo jeito que o bloco `HtmlGsap` roda o GSAP. Ganhamos os estilos desenhados à mão sem largar o que já é nosso: eventos presos às palavras, legenda, ducking, variações em lote. Alternativa para peças inteiras nesse estilo: usar a skill `animate` direto (Playwright + FFmpeg) e só mixar o áudio no nosso padrão.
2. **Estilos "caderno", "nanquim" e "matemática" para as aulas do ENEM.** Combinam com aula visual (física, geometria) e diferenciam o perfil do visual Apple dos anúncios. Pela precedência, a identidade do vídeo vale mais que o DESIGN-SYSTEM, então dá para ter uma identidade "aula desenhada" sem quebrar regra.
3. **Revisão medida antes de mostrar ao Vítor**: portar `textcheck` (texto cortado/sobreposto/área segura), trechos mortos, janela mais alta + silêncio e a tira `phone.jpg` como `revisao.mjs` no motor. Hoje fazemos isso no olho.
4. **Storyboard em 3 degraus** no `metodo-edicao`: história em tabela (texto) → 2 a 4 quadros de estilo → storyboard completo com tempo, som e transição em cada painel.
5. **Morph de forma** como bloco de transição (já casa com a nossa regra do objeto que atravessa o corte).

## Ainda não testado aqui
O código do `animate` está guardado, mas não foi executado nesta nuvem (rodar código baixado precisa da autorização do Vítor). Próximo passo sugerido: renderizar o exemplo `history-of-ai` para ver qualidade e tempo de render sem GPU, e depois um teste curto de aula no estilo caderno.

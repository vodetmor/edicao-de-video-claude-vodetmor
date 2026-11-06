# Pesquisa: pipeline de vídeo com IA (criativos, edição e motion)

Data: 28/09/2026. Tudo abaixo foi pesquisado na web, com peso no X/Twitter. Os posts do X foram lidos pelos trechos que aparecem na busca (o X bloqueia leitura automática da página inteira), então os links estão aí para você abrir.

---

## 1. A ferramenta que você viu

**O mais provável: Claude + Higgsfield MCP (+ Meta MCP).** É exatamente o fluxo que você descreveu, e a própria Higgsfield vendeu isso no X em 2026:

> "Claude Cowork pesquisa anúncios dos concorrentes na Ad Library > Higgsfield MCP gera os criativos > Meta MCP sobe os anúncios e lê a performance > os vencedores escalam via Higgsfield MCP > roda toda segunda." ([@higgsfield_ai](https://x.com/higgsfield_ai/status/2052062257450991757))

Peças com nome, para você reconhecer:

| O que você lembra | Nome real | O que faz |
|---|---|---|
| "pega os criativos escalados" | **Ad Multiplier** (Higgsfield) | Pega um vídeo vencedor de 4 a 30 s e gera várias versões editadas diferentes. O @zackpaid postou usando isso **com o Claude Opus** para refazer os vencedores dele em 25+ variações numa conversa só ([post](https://x.com/zackpaid/status/2092461313536438487)). |
| "criativos do concorrente" | **Meta Ad Library via Meta MCP** | O Claude busca os anúncios públicos dos concorrentes direto da conversa. |
| "modela com a copy do produto" | **Ad Reference / Marketing Studio / Click to Ad** | Você manda o site e a foto do produto, escolhe um formato, e sai o criativo pronto ([post](https://x.com/higgsfield_ai/status/2054196776278606021), [Click to Ad](https://higgsfield.ai/apps/click-to-ad)). |
| "troca o ator/produto do vídeo vencedor" | **Genjutsu** | Recria o take inteiro com outro personagem ou produto, copiando o movimento e a câmera do original ([review](https://www.bottlerocketcontent.com/higgsfield-genjutsu-motion-transfer/)). |
| "joga pro Opus ou Astra pra editar" | **Claude Opus** ou **GPT-6 Astra** | Os dois são os "cérebros" que operam as ferramentas. O Astra ficou famoso em setembro/2026 por editar um vídeo inteiro de YouTube a partir de um prompt, usando HyperFrames como timeline ([Nate Herk no X](https://x.com/nateherk/status/2097449583811125739), [resumo MindStudio](https://www.mindstudio.ai/blog/gpt-6-astra-video-editing-agent)). |

O guia oficial que junta tudo: [How to Run Ad Production End to End With Claude](https://higgsfield.ai/blog/claude-ad-production-end-to-end). O SOP mais detalhado (com planilha de controle, 5 faixas de performance, ~20 briefings por semana): [Admetrics](https://www.admetrics.io/post/how-to-create-automated-meta-ads-creative-pipeline-higgsfield-meta-mcp).

**Outros parecidos** (caso não seja a Higgsfield):
- **Motion (motion.so)**: skill dentro do Claude; você cola a URL e volta um vídeo de lançamento com motion graphics, locução, música e legenda. Lançaram um modo "Apple for product launches" ([post](https://x.com/motion_so/status/2094123213735305359)). Pago.
- **Creatify Ad Clone**: sobe um anúncio (seu ou do concorrente), ele extrai gancho, ritmo e CTA e refaz para o seu produto ([página](https://creatify.ai/features/ad-clone)).
- **Hyper**: o único do comparativo que lê a performance dos anúncios escalados e gera variações a partir disso ([comparativo](https://www.hyperfx.ai/blog/arcads-vs-creatify-vs-higgs-field-vs-hyper-2026)).
- Arcads e Icon: avatares UGC, caros.

**Conclusão:** nenhuma dessas tem algo que a gente não consiga imitar. O valor está no **processo** (analisar vencedores → extrair estrutura → briefing → gerar → editar → medir), não no modelo. O modelo de vídeo a gente troca pelo Flow.

---

## 2. Mapa de ferramentas (priorizando grátis)

### Geração de takes (substitui a Higgsfield)
| Ferramenta | Custo | Observação |
|---|---|---|
| **Google Flow** (flow.google.com) | Grátis: ~50 créditos/dia por conta, Veo 3.1 + Nano Banana Pro, até 720p | Veo 3.1 Fast ≈ 20 créditos, Quality ≈ 100. Então ~2 takes Fast por dia por conta. Números de [costgoat](https://costgoat.com/pricing/google-flow) e [fórum Google One](https://support.google.com/googleone/thread/450387797) (fontes de terceiros, confirmar na sua conta). **Com várias contas, dá uma produção diária decente.** |
| Google AI Studio | Grátis com limites | Bom para imagens (Nano Banana) e testes. |
| Higgsfield | US$ 9 a 65/mês | Opcional. O MCP e as skills são MIT ([repo](https://github.com/higgsfield-ai/skills)), mas dependem de créditos. Vale **ler** as skills para copiar a lógica dos prompts. |

Dica prática: 720p do Flow vira 1080p aceitável com upscale local (Real-ESRGAN, grátis) antes da edição.

### Edição (o "Opus/Astra" da história)
| Ferramenta | Custo | Papel |
|---|---|---|
| **Claude (este projeto) + ffmpeg** | já temos | Cortes, silêncio, legendas, 9:16. Kit da conversa "Edição". |
| **Remotion** | Grátis para pessoa física/empresa pequena | Motion graphics em código. Já temos demos (Corte v3, Apple v4). |
| **HyperFrames** (HeyGen) | Render local grátis | É a timeline que o Astra usou. Já instalamos as 20 skills. |
| **motion-launch-videos** | Grátis (GitHub) | Tipografia cinética com molas e motion blur real, estilo lançamento ([repo](https://github.com/Kimeur/motion-launch-videos)). Muito próximo do "Apple" que você quer. |
| **product-film-skill** | Grátis (GitHub) | Vídeo de lançamento de 13 s a partir da UI real, em Remotion ([repo](https://github.com/StanCosmin28/product-film-skill)). |
| OpusClip | Grátis: 60 min/mês, **com marca d'água**, apaga em 3 dias | Só serve para recortar vídeos longos. Não precisamos ([limites](https://quso.ai/blog/opus-clip-free)). |

### Áudio
| Ferramenta | Custo | Papel |
|---|---|---|
| **ACE-Step 1.5** | Grátis, licença MIT, uso comercial ok | Trilha original de 10 s a 10 min, roda com 4 GB de VRAM ou no Mac ([repo](https://github.com/ace-step/ACE-Step-1.5)). Melhor opção para "música nossa". |
| Freesound / Pixabay | Grátis | Efeitos sonoros (whoosh, click, pop). Checar licença de cada um. |
| ElevenLabs | Plano grátis limitado | Locução e SFX por texto. Também resolve a transcrição que ficou bloqueada. |
| Whisper local | Grátis | Transcrição com tempo por palavra, precisa rodar na sua máquina. |

### Pesquisa de criativos vencedores
- **Meta Ad Library** (grátis, manual): o sinal de "escalado" é o **tempo no ar** e o número de variações do mesmo criativo. Anúncio rodando há 30+ dias com várias versões = vencedor.
- Scrapers da Ad Library no Apify têm cota grátis pequena ([exemplo](https://apify.com/webdatalabs/meta-ad-library-scraper)).
- Na prática: você baixa os vídeos (ou manda os links) e eu analiso.

---

## 3. Como recriar isso por conta própria

O pipeline, com o que cada etapa usa e quem faz:

```
1. COLETA        Você: baixa 5-10 criativos escalados (seus e dos concorrentes) + página do produto
2. DISSECAÇÃO    Claude: transcreve, corta em cenas, extrai estrutura
                 → ficha por criativo: gancho (0-3 s), promessa, mecanismo, prova, oferta, CTA,
                   duração de cada cena, tipo de take, texto na tela, música/SFX
3. BRIEFING      Claude: cruza fichas + copy do produto → briefing com 3 ângulos e 3 ganchos cada
4. ROTEIRO       Claude: roteiro cena a cena + prompt de Flow para cada take + lista de motion
5. TAKES         Você: gera no Flow com os prompts prontos (várias contas) e me entrega
6. EDIÇÃO        Claude: monta EDL, corta, legenda, motion graphics (Remotion/HyperFrames),
                 trilha (ACE-Step) e SFX → render 9:16 e 16:9
7. VARIAÇÕES     Claude: troca só o gancho / só a trilha / só o CTA = "Ad Multiplier" caseiro
8. APRENDIZADO   Você: diz quais performaram → vira regra no playbook
```

A única etapa manual inevitável é a 5, porque o Flow não tem API grátis e automatizar login em várias contas viola os termos da Google. O resto eu faço.

**O "Ad Multiplier" caseiro** é o ponto mais valioso: com a edição em código (EDL + Remotion), trocar o gancho ou a trilha de um vídeo aprovado é mudar uma linha e renderizar de novo. Isso sai de graça, sem gastar crédito de geração.

---

## 4. Estrutura formal do projeto

A proposta é transformar o projeto num **repositório git** com base documentada. Ele fica assim:

```
video-ia/
├── CLAUDE.md                 # instruções para qualquer Claude (ou GPT) que abrir o repo
├── docs/
│   ├── 00-visao.md           # objetivo, orçamento, o que é "qualidade" para nós
│   ├── decisoes.md           # log datado de decisões (ex.: "sem gradiente, 28/09")
│   └── glossario.md
├── playbooks/
│   ├── copy/                 # frameworks de copy e VSL, ganchos testados, swipe file
│   ├── narrativa/            # estruturas de roteiro, ritmo, duração por cena
│   ├── motion/               # guia de estilo (Apple, Corte), curvas de mola, tipografia
│   ├── musica-sfx/           # como escolher trilha, biblioteca de SFX, prompts ACE-Step
│   └── prompts-flow/         # prompts de takes que funcionaram, com o resultado
├── pesquisa/
│   ├── ferramentas.md        # este mapa, atualizado
│   └── criativos/            # fichas de dissecação de cada criativo analisado
├── kit/                      # scripts: silence_cut, transcribe, captions, render_edl
├── motion/                   # projeto Remotion/HyperFrames com componentes reutilizáveis
├── projetos/
│   └── 2026-10-xx-nome/      # cada vídeo: briefing, roteiro, takes, EDL, render
└── skills/                   # skills do Claude usadas pelo projeto
```

**Como a gente melhora com o tempo:** cada vídeo termina com uma retro de 5 linhas em `projetos/.../retro.md` (o que ficou bom, o que ficou ruim, o que vira regra). O que vira regra sobe para o playbook. Assim o motion, a copy e a narrativa melhoram de forma documentada, e não dependem de memória.

**Trilhas de estudo** (uma por vez, cada uma com uma entrega):
1. **Motion:** biblioteca de 10 componentes Apple-style (título com mola, contador, card bento, comparação lado a lado, transição de máscara). Referências: repos acima e o artigo do [@nifinet sobre vídeos de lançamento com Opus 5](https://x.com/nifinet/article/2094516016705679608).
2. **Copy e narrativa:** dissecar 20 criativos escalados do seu nicho e extrair os 5 ganchos e as 3 estruturas que mais se repetem.
3. **Música e SFX:** kit de 30 SFX padronizados + 5 trilhas ACE-Step por clima (tensão, revelação, prova, CTA).
4. **Takes:** livro de prompts do Flow com o antes/depois de cada um.

---

## 5. Como eternizar o contexto (trocar de conta sem perder nada)

O contexto hoje vive em três lugares que **não** saem da conta: as conversas, a memória do projeto e a pasta do projeto. Para ficar portátil:

1. **Repositório no GitHub (grátis, privado), na sua conta pessoal.** É a fonte da verdade. Qualquer conta do Claude (ou o Codex/GPT) conecta nele e lê o `CLAUDE.md`. É o passo mais importante.
2. **Tudo que é decisão vira arquivo** (`docs/decisoes.md`), não fica só na conversa. Eu passo a registrar lá.
3. **Arquivos pesados** (takes, renders) no Google Drive pessoal, com o link anotado no repo. O git não é bom para vídeo.
4. **Backup mensal em .zip** do repo, se quiser uma cópia offline.

Com isso, trocar de conta é: criar projeto novo → conectar o repo → pronto.

---

## 6. Próximos passos sugeridos

1. Você cria um repositório privado vazio no seu GitHub pessoal e conecta aqui no projeto (Configurações do projeto → repositórios). Eu monto a estrutura acima, copio o kit e este relatório para lá.
2. Você me manda 5 criativos escalados (seus ou de concorrentes) e a página de um produto. Eu faço a dissecação e o primeiro briefing, para testar as etapas 2 a 4.
3. Você gera os takes no Flow com os prompts que eu entregar, e eu faço a edição completa (etapa 6) com motion, trilha e SFX.

O vídeo de exemplo Apple-style (Fable 5.1 vs GPT-6 Astra) está sendo feito em outra conversa do projeto.

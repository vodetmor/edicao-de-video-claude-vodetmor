# Design System de Vídeo · padrão do projeto

Versão 1.0 · 29/09/2026 · dono: Vítor (Rei da VSL)

Este é o padrão formal de qualidade para todo vídeo editado neste projeto. Ele transforma o que o Vítor pede em linguagem natural em regras verificáveis, com números. Toda sessão que for editar, compor motion, legendar ou mixar áudio lê este arquivo **antes** de começar, junto com `LICOES-MOTION.md`.

Palavras-chave: **DEVE** e **NUNCA** são obrigatórias (quebrar é defeito). **DEVERIA** é o padrão; só muda com motivo escrito no plano do vídeo.

---

## 0. Escopo e ordem de precedência

Quando duas regras brigarem, vale a de cima:

1. O que o Vítor disse explicitamente para aquele vídeo (mensagem mais recente vence).
2. A identidade do vídeo (paleta, fontes de título, referência de estilo). Ex.: no vídeo da escola, `escola-consciencia-negra/edicao/ARQUITETURA.md` §1 e o estilo Tinoco do `SPEC.md`.
3. **Este arquivo** (camada universal: legenda, áudio, tipografia de leitura, motion, controle de qualidade).
4. `LICOES-MOTION.md` (números de motion e fluxo de produção).
5. As skills instaladas (§9). Elas foram escritas para interfaces web; só valem aqui no que não contradiz os itens acima.

Conflitos já resolvidos:
- A skill `apple-design` recomenda vidro e translucidez. **O Vítor proíbe vidro.** Vale a proibição.
- A skill `review-animations` limita animação de interface a 300 ms. **Isso não vale para vídeo**: aqui valem as durações da §5.
- "Estilo Apple" neste projeto significa **disciplina** (contenção, tipografia precisa, um foco por vez, movimento físico, som em sincronia). Não significa fundo branco em todo vídeo: a paleta vem da identidade de cada vídeo.

---

## 1. Tradução da fala do Vítor em regras

| O Vítor disse | Regra formal | Onde se mede |
|---|---|---|
| "Quero algo bem feito, sério, nada mal feito" | Nenhum vídeo é entregue sem passar pelos portões de qualidade da §8, incluindo a crítica de uma sessão nova com nota ≥ 8/10 | §8 |
| "Do começo ao fim eu fico assistindo" | Retenção por desenho: nada fica congelado, o ritmo sobe e desce em ondas, e cada trecho de fala tem algo visual acontecendo | §6 |
| "A música não pode ficar muito alta, sobrepondo o vídeo" | Música sob voz fica 18 a 22 LU abaixo da voz, com ducking guiado pela transcrição | §7.2 |
| "Os efeitos sonoros também não" | Efeito sonoro NUNCA cai em cima de palavra falada com energia na faixa da voz; efeitos vão nos respiros | §7.3 |
| "Legendas moderadas, bonitas, estilo Apple" | Legenda contínua sem caixa, sem karaokê, sans limpa, 50 px, no máximo 2 linhas de 42 caracteres, ~13% acima da borda de baixo | §3 |
| "Nada de cara de IA" (histórico) | Lista de proibições da §2, verificada quadro a quadro | §2, §8 |
| "Qualidade vem primeiro" (diretiva de 29/09) | Nunca simplificar para economizar tempo ou tokens; eficiência é processo sem retrabalho | todo o arquivo |

**Como traduzir pedidos futuros.** Quando o Vítor descrever algo de forma natural ("aquele negócio que cresce do botão", "a tela que vai andando"), a sessão usa a skill `animation-vocabulary` para achar o nome técnico, registra aqui na tabela acima a nova regra com número, e aplica. Pedido que muda uma regra existente substitui a linha antiga (com data), não cria uma segunda.

---

## 2. Proibições (lista única, "anti-slop")

NUNCA, em nenhum vídeo, salvo pedido explícito do Vítor para aquele vídeo:

| # | Proibido | Por quê / origem |
|---|---|---|
| P1 | Degradê decorativo, brilho de fundo (glow), vidro/translucidez, azul-roxo genérico | Vítor |
| P2 | Glow ou contorno colorido em texto | Vítor + LICOES |
| P3 | Tudo entrando com fade simples | LICOES (fade só em legenda e em troca de lugar sem significado, ver §5.4) |
| P4 | Mais de um ponto focal por quadro | LICOES |
| P5 | Logo redesenhado; usar o SVG real de `motion-base/logos/` | Vítor |
| P6 | Interface de produto falsa, painel falso, "print" feito de retângulos | taste-skill §9 |
| P7 | Dado inventado ("Jane Doe"): todo número na tela tem fonte e a fonte aparece pequena na tela | taste-skill §9.D |
| P8 | Travessão (—) em texto na tela; usar vírgula, dois-pontos ou ponto | taste-skill §9.G |
| P9 | Emoji na tela | taste-skill §3.D |
| P10 | Legenda estilo TikTok: palavra por palavra pulando, caixa colorida, fonte gigante, cor por palavra | Vítor |
| P11 | Explosão de partículas, glitch, zoom de "impacto" repetido | LICOES |
| P12 | Imagem de IA fingindo ser foto de arquivo; IA só para clima e símbolo, sem rostos reais inventados | memória do projeto |
| P13 | Quadro congelado por mais de 8 quadros em trecho de B-roll ou motion (A-roll de pessoa falando não conta) | LICOES "nada congela" |
| P14 | Mais de 2 famílias tipográficas por vídeo além da legenda | Apple HIG ("minimize o número de fontes") |

---

## 3. Legenda contínua ("estilo Apple")

Referências: Apple HIG Typography (tabelas de tvOS, que usa tela 1920×1080 em pontos iguais a pixels), Netflix Timed Text Style Guide em português do Brasil, e o padrão de legendas do Apple TV+ (branco, sans do sistema, sem caixa, sombra discreta).

### 3.1 Aparência (quadro de 1920×1080)

| Propriedade | Valor | Justificativa |
|---|---|---|
| Fonte | **Inter** (grátis, a mais próxima da SF Pro, cuja licença não permite uso fora de plataformas Apple) | Apple HIG: fonte de sistema, legível |
| Peso | 500 (Medium); 600 só se o fundo for muito carregado | tvOS usa Medium em todos os estilos de texto; HIG: evitar pesos finos |
| Tamanho | **50 px** (4,6% da altura) | memória do projeto (4,5–5%); fica entre o Title 3 (48 pt) do tvOS e o Title 2 (57 pt): legível do fundo da sala, sem gritar |
| Entrelinha | 60 px (1,2) | tvOS Title 3: 48/56 |
| Espaçamento entre letras | −0,01 em | tipo grande pede tracking levemente negativo (Apple), mas legenda é lida de longe: não apertar mais que isso |
| Cor | branco do projeto (`#FFFFFF` a 94%, ou o "branco-papel" da identidade, ex. `#EDE6DA` na escola) | uma cor só, sem destaque por palavra |
| Legibilidade | sombra escura curta: `0 2px 6px rgba(0,0,0,.55)` + `0 0 1px rgba(0,0,0,.7)`; NUNCA sombra colorida | HIG: contraste; P2 |
| Fundo muito claro | se a luminância média da faixa da legenda passar de 0,70, usar uma placa sólida preta a 55%, cantos 10 px, respiro 14 × 22 px | HIG: "forma de fundo visível ajuda a ler" |
| Alinhamento | centralizado na horizontal | padrão de cinema/TV |
| Posição | linha de base da última linha a **87% da altura** (≈ 140 px acima da borda de baixo), dentro de 90% da largura | memória: 12–15% acima da base, livre dos controles do YouTube e do corte do projetor |
| Largura máxima | 1200 px | cabe 42 caracteres a 50 px com folga |
| Itálico | só para títulos de obra, palavra estrangeira, voz fora de cena, letra de música | Netflix PT-BR I.10 |

### 3.2 Texto e tempo (Netflix PT-BR)

| Regra | Valor |
|---|---|
| Caracteres por linha | ≤ **42** |
| Linhas | ≤ **2**; preferir 1 linha quando couber |
| Velocidade de leitura | ≤ **17 caracteres/s** (público escolar: mirar 15) |
| Duração | mínimo 20 quadros (0,67 s a 30 fps), máximo 7 s |
| Intervalo entre legendas | ≥ 2 quadros |
| Quebra de linha | depois de pontuação, antes de conjunção ou preposição; nunca separar artigo do substantivo, nome do sobrenome, verbo do pronome ou do auxiliar |
| Forma de linha 2 | pirâmide: linha de baixo igual ou mais longa que a de cima |
| Números | 1 a 10 por extenso, 11 em diante em algarismos; número no início da frase por extenso |
| Pontuação | reticências com o caractere `…`; nunca "?!" ou "!!!"; aspas duplas curvas |
| Fidelidade | transcrever o que foi dito, limpando só vícios ("é…", "tipo", repetições); nunca mudar o sentido |

### 3.3 Movimento da legenda

- Entrada: opacidade 0→1 e subida de 6 px em **6 quadros** com a curva produtiva (§5.2). Saída: opacidade 1→0 em **4 quadros**, sem movimento. É a única exceção à proibição P3, porque legenda é infraestrutura de leitura, não motion.
- Troca de legenda colada na seguinte (intervalo de 2 quadros): corte seco, sem animar.
- Corte de cena: se a legenda começa ou termina até 12 quadros de um corte, ela é encaixada no quadro do corte (Netflix: respeitar mudança de plano).
- Legenda cinética (frases de impacto, definida em cada vídeo) e legenda contínua **nunca** aparecem juntas: enquanto a cinética está na tela, a contínua some.
- Crédito de nome (lower third) e legenda não se sobrepõem: o nome fica no terço inferior do lado da pessoa, acima de 72% da altura, ou a legenda desce a entrada até o nome sair.

---

## 4. Tipografia do vídeo (fora da legenda)

| Item | Regra |
|---|---|
| Famílias | 1 sans (Inter) para leitura + no máximo 1 família de identidade (ex.: serifada de títulos e máquina de escrever na escola, que é o estilo de referência) |
| Hierarquia | por **peso + tamanho + entrelinha juntos**, nunca só tamanho (Apple HIG) |
| Tamanhos a 1080p (escala tvOS) | Título grande 76 px/96 · Título 57/66 · Subtítulo 48/56 · Destaque 38/46 · Corpo 29/36 · Nota de fonte 23/30 (mínimo absoluto: 23 px, o mínimo do tvOS) |
| Tracking | display ≥ 57 px: −0,02 em; 29–48 px: −0,01 a 0; ≤ 25 px: +0,01 a +0,02 em (Apple: tracking depende do tamanho, nunca um valor único) |
| Entrelinha | apertada nos títulos (1,05–1,15), confortável em texto de 3+ linhas (1,3–1,4); nunca apertada com 3 linhas ou mais |
| Pesos | 400, 500, 600, 700. NUNCA Thin, Light ou Ultralight na tela |
| Texto parado para ler | ≥ 8 quadros antes de se mexer (LICOES) e ≥ tempo de leitura de 15 caracteres/s |

---

## 5. Motion

Os números base estão em `LICOES-MOTION.md` §2 e continuam valendo. Aqui entram os fundamentos Apple e as curvas nomeadas.

### 5.1 Princípios (Apple, traduzidos para vídeo)

1. **Todo movimento tem propósito declarado**: hierarquia (levar o olho), narrativa (revelar em ordem), continuidade espacial (de onde veio, para onde vai) ou ênfase. "Fica bonito" não é propósito. No plano do vídeo, cada momento de motion diz o seu.
2. **Física, não keyframe linear**: chega rápido e pousa suave (`approach()` do LICOES, k 0,12–0,19). Equivalência Apple: mola criticamente amortecida (damping 1,0, response 0,3–0,4 s). Overshoot (damping ≈ 0,8) só quando o objeto "foi jogado" por um movimento anterior.
3. **Continuidade espacial**: o que entra pela direita sai pela direita; o que nasce de um elemento cresce a partir dele (origem do transform no elemento, não no centro da tela).
4. **Nada nasce do nada**: nunca escala de 0; começar de 0,92–0,97 junto com a opacidade.
5. **Um foco por quadro** e contenção: a quantidade de motion pode ser alta (diretiva de qualidade), mas cada instante tem um só protagonista.
6. **Multimodal (Apple, áudio-háptico)**: causalidade (o som nasce da ação visível), harmonia (som e imagem no **mesmo quadro**), utilidade (som só onde acrescenta).

### 5.2 Curvas nomeadas

| Nome | Uso | Curva |
|---|---|---|
| `approach` | entradas e pousos de objetos (padrão) | `alvo − dist·(1−k)^n`, k = 0,15 |
| `produtiva` | informação: legenda, nomes, rótulos, fontes | `cubic-bezier(0.2, 0, 0.38, 0.9)` (IBM Carbon, productive standard) |
| `expressiva` | momentos-vitrine, reveals, título | `cubic-bezier(0.4, 0.14, 0.3, 1)` (Carbon expressive standard) |
| `entrada expressiva` | algo entra em cena | `cubic-bezier(0, 0, 0.3, 1)` |
| `saída expressiva` | algo sai de cena | `cubic-bezier(0.4, 0.14, 1, 1)` |
| `câmera` | viagens de câmera entre estações | ease-in-out ~1,3 s (estudo caso-criminal) |

NUNCA `linear` em posição ou escala (só em drift contínuo e em tempo de relógio). NUNCA ease-in puro numa entrada.

### 5.3 Durações a 30 fps

| Classe | Quadros | Exemplo |
|---|---|---|
| Micro | 4–6 | legenda, sublinhado |
| Padrão | 9–12 | rótulo, fita de nome |
| Grande | 15–23 | foto entrando, número gigante |
| Câmera | 30–45 | viagem entre estações, zoom de travessia |
| Stagger | 2–4 entre itens | grupos |

### 5.4 Fade

Fade puro só em: legenda (§3.3), e para trocar algo de lugar quando o trajeto não comunica nada (Apple visionOS: "use fade para relocar"). Fora disso, entrada tem transform.

---

## 6. Ritmo e retenção ("fico assistindo do começo ao fim")

| Regra | Valor |
|---|---|
| Troca visual em trecho de fala | algo muda (corte, punch-in, B-roll, texto, câmera) a cada **3 a 8 s**; nunca mais de 10 s iguais |
| Ritmo em ondas | cortes por minuto variam entre ~7 e ~22 (medido na referência Tinoco); o pico é o clímax |
| Punch-in no A-roll | alternar 100%, 112%, 125% por frase; nunca dois iguais seguidos |
| Silêncio como ferramenta | ≥ 1 buraco de silêncio de 0,3–0,6 s antes do maior impacto do vídeo |
| Abertura | gancho nos primeiros 10 s; nada de logo ou vinheta longa antes do gancho |
| Fechamento | fecha o círculo com um motivo da abertura (visual ou sonoro) |

---

## 7. Mixagem de áudio

Destino: sala de aula (caixa do projetor ou TV) e YouTube. As medidas usam loudness EBU R128 / ITU-R BS.1770 (`ffmpeg -af ebur128`).

### 7.1 Master

| Medida | Valor |
|---|---|
| Loudness integrado | **−14 LUFS ± 1** |
| Pico real (true peak) | ≤ **−1,0 dBTP** |
| Faixa de loudness (LRA) | 6–10 LU (caixa de sala não reproduz dinâmica de cinema) |

### 7.2 Voz e música

| Regra | Valor |
|---|---|
| Cadeia da voz | passa-alta 80 Hz → redução de ruído → de-esser → compressão ~3:1 → normalização |
| Voz | short-term **−16 LUFS ± 1** durante a fala; diferença entre integrantes ≤ 1 LU |
| Música sob voz | **18 a 22 LU abaixo da voz** (≈ −34 a −38 LUFS short-term, medida só na trilha) |
| Espaço da voz na música | enquanto houver fala, corte de 3 dB entre 1 e 4 kHz na trilha (faixa de inteligibilidade) |
| Ducking | guiado pelos tempos de palavra da transcrição, não por compressor: começa **250 ms antes** da primeira palavra, rampa de 200 ms, solta **400 ms depois** do fim da frase; sem "bombeamento" |
| Música sem voz (abertura, transições, clímax, créditos) | pode subir até −18/−20 LUFS short-term; NUNCA mais alta que o nível da voz (−16) |
| Ambiente (chuva, rua) | ≥ 25 LU abaixo da voz quando há fala |

### 7.3 Efeitos sonoros

| Regra | Valor |
|---|---|
| Posição | nos respiros da fala; se precisar coincidir com fala, fica ≥ 12 LU abaixo da voz e sem energia entre 1 e 4 kHz (impacto grave passa, whoosh brilhante não) |
| Pico de efeito no respiro | momentary ≤ −12 LUFS; short-term nunca acima da voz |
| Sincronia | no quadro exato da ação (clique no clique, pico do whoosh no pico do movimento, impacto no reveal) |
| Quantidade | efeito só em ação visível (causalidade); nada de "chuva de whoosh" |

### 7.4 Margem de inteligibilidade (teste automático)

Em toda janela de 400 ms que contém fala: loudness momentary da voz − loudness momentary de (música + efeitos + ambiente) **≥ 15 LU**. Mede-se com os stems separados antes do mix final. Janela que falhar é corrigida antes da prévia.

---

## 8. Portões de qualidade (nenhum pode ser pulado)

| # | Portão | Critério de aprovação |
|---|---|---|
| G1 | Ingestão | todos os arquivos abrem, 30 fps constante, 48 kHz; relatório de qualidade de áudio por pessoa (ruído, clipping, eco) e lista do que falta |
| G2 | Plano de arquitetura aprovado pelo Vítor | cenas por parte, visuais, motion, música, efeitos, **quadro de exemplo mostrando a legenda na posição** |
| G3 | Stills | 5 quadros (abertura, composição principal, momento-vitrine, meio da transição mais rápida, final) revisados com zoom |
| G4 | Checagem automática | legenda: ≤ 42 car., ≤ 2 linhas, ≤ 17 car./s, sem "—"; áudio: §7.1 e §7.4; nenhum quadro congelado > 8 quadros fora do A-roll; nenhuma cor proibida (P1) |
| G5 | Crítica independente | sessão nova, que não fez o vídeo, compara com a referência e com este arquivo começando por rejeitar; usa a skill `review-animations` adaptada (sem o limite de 300 ms); sai com nota ≥ 8/10 |
| G6 | Prévia 720p → final 1080p | final só depois da prévia sem defeitos abertos |

Depois do G2 aprovado, a execução vai até o fim sem pedir novas aprovações (acordo de 29/09); o Vítor só aponta correções no final.

---

## 9. Skills selecionadas

Critério: só entra o que muda a qualidade do vídeo e não se sobrepõe a outra skill. Cópias ficam em `/mnt/project-files/skills/` (sessões novas copiam para `~/.claude/skills/` antes de começar: `cp -r /mnt/project-files/skills/* ~/.claude/skills/`).

| Skill | Origem | Para que usamos | O que ignoramos |
|---|---|---|---|
| `remotion-best-practices` | oficial Remotion (remotion-dev/skills) | motor da composição: criar projeto, legendas (`@remotion/captions`), mapas animados, render | parte de SaaS/Lambda |
| `design-taste-frontend` ("Taste Skill") | Leonxlnx/taste-skill, MIT | a skill que o Vítor lembrava: leitura do briefing antes de desenhar, lista de "cara de IA", "motion precisa de motivo" | stack web (Next, Tailwind), regras de landing page |
| `apple-design` | Emil Kowalski, MIT (baseada nas palestras da WWDC) | molas, continuidade espacial, tipografia, som e imagem no mesmo quadro | vidro/translucidez (proibido), gestos de toque |
| `review-animations` | Emil Kowalski, MIT | método de crítica do portão G5 (começa rejeitando, tabela antes/depois) | limite de 300 ms e regras de CSS |
| `animation-vocabulary` | Emil Kowalski, MIT | traduzir a descrição natural do Vítor para o termo técnico certo | — |

Avaliadas e **não** instaladas: `impeccable` (auditoria de interface web, 2,2 MB, sobrepõe a Taste Skill), variações da Taste Skill (brutalist, soft, minimalist: estilos de site), `frontend-design` da Anthropic (mesmo papel da Taste Skill, para web), demais skills do Emil (componentes de interface).

---

## 10. Fontes

- Apple Human Interface Guidelines: Typography (tabelas de tamanho do tvOS e tracking da SF Pro), Motion, Accessibility. developer.apple.com/design/human-interface-guidelines
- Netflix, Brazilian Portuguese Timed Text Style Guide. partnerhelp.netflixstudios.com
- IBM Carbon Design System, pacote `@carbon/motion` (curvas productive/expressive, lidas do código-fonte).
- Emil Kowalski, github.com/emilkowalski/skill (apple-design, review-animations, animation-vocabulary).
- Leon Lin, github.com/Leonxlnx/taste-skill.
- Remotion, github.com/remotion-dev/skills.
- EBU R128 / ITU-R BS.1770 (medição de loudness); −14 LUFS é a referência de normalização do YouTube.

# Lições para subir o nível do motion

Atualizado em 28/09/2026 com o artigo do @notdwd (texto original em `fontes/x/notdwd-guia-motion-opus.md`). As lições valem para todo vídeo do projeto. Antes de começar qualquer peça, leia este arquivo.

## 0. A virada principal: referência antes de criatividade

Pedir "premium", "cinematográfico" ou "caro" a partir do zero sempre resulta na mesma média: texto centralizado, degradê, fade e movimento seguro. **Foi exatamente o que aconteceu na v5.** O salto de qualidade vem de dar ao Claude um vídeo cujo movimento já é bom e fazê-lo **medir esse vídeo com código**, quadro a quadro, antes de construir. Descrever a referência a olho não serve.

> "Motion Maxing", na prática, significa reduzir ao mínimo as decisões criativas que o Claude precisa adivinhar. O movimento vem medido de uma referência, e as regras são números, não adjetivos.

## 1. Fluxo padrão (toda peça segue essa ordem)

**referência → estudo quadro a quadro → brief → regras visuais → shots → stills → motion → som → crítica → render final**

| Etapa | O que eu (Claude) faço | O que preciso de você |
|---|---|---|
| Referência | Nada. Não invento do zero | 1 vídeo cujo motion você acha foda (MP4 baixado) |
| Estudo | Extraio todos os quadros e acho os cortes pelo pico de diferença entre quadros. Meço com código a posição e o tamanho por quadro, a duração, o overshoot, a câmera, o blur, as cores tiradas dos pixels, o tamanho das fontes e o tempo de cada som. Salvo tudo em `SPEC.md` | Aprovar a lista de shots |
| Brief | Separo o que fica igual (tempo, cortes, câmera, easing, posições, blur, transições) do que muda (marca, logo, cores, fontes, copy, telas, rostos, plataforma) | Dizer o que você odeia na referência |
| Regras visuais | Escrevo **uma vez, num lugar só**: fontes, paleta, espaçamento e uma cor de destaque | — |
| Stills | Renderizo 5 quadros (abertura, composição principal, produto, meio da transição mais rápida, cartão final) e reviso com zoom antes de mostrar | Aprovar antes do render completo |
| Motion e som | Aplico as regras numéricas abaixo e faço o som bater no quadro exato de cada ação | — |
| Crítica | **Uma sessão nova do Claude**, que não construiu o vídeo, compara lado a lado com a referência e começa rejeitando. Só sai com 8/10 ou mais | — |

**Proibido (a sua lista somada à dele):** degradê aleatório, brilho de fundo, vidro, azul/roxo genérico, tudo entrando com fade, UI de produto falsa, explosão de partículas, glow em texto, texto ilegível em movimento e mais de uma coisa disputando atenção. Também proibido: **logo redesenhado**. Use o SVG real da pasta `logos/`.

## 2. Regras numéricas de motion (colar em todo brief)

| Regra | Número | Como fazer no Remotion |
|---|---|---|
| Chega rápido, pousa suave | Cada quadro percorre **12–19% da distância restante**. Nunca velocidade constante, nunca parada seca | `pos = alvo - dist * (1 - k) ** n`, com `k = 0.15` e `n` = quadros desde o início (ver `approach()` abaixo) |
| Nada congela | Em pausa, a câmera segue num push-in lento de **~0,25% por quadro** | escala do container pai: `1 + 0.0025 * n` |
| Duração mínima | Todo movimento dura **≥ 0,3 s**. Os grandes duram **0,5–0,75 s** | 9 quadros no mínimo, e 15–23 para os grandes, a 30 fps |
| Stagger | Elementos do mesmo grupo entram **2–4 quadros** um depois do outro | `delay = i * 3` |
| Motion blur | Segue a direção e a velocidade e some quando o objeto pousa. Nunca misturar quadros através de um corte | `@remotion/motion-blur` (`<CameraMotionBlur>`) só no trecho do movimento |
| Tempo de leitura | O texto fica parado **≥ 8 quadros** antes de se mexer de novo | — |
| Foco | **Um ponto focal por quadro** | — |
| Cortes | No tempo forte ou **2 quadros antes**. Morphs começam **~4 quadros antes** | grade de 96 BPM: 1 compasso = 75 quadros |
| Som | Clique no quadro do clique, pico do whoosh no pico do movimento, impacto no reveal. Master em **-14 LUFS** | `make_audio.py` lê os mesmos tempos do vídeo |

```ts
// "Chega rápido, pousa suave": fração k da distância restante por quadro
export const approach = (frame: number, start: number, from: number, to: number, k = 0.15) => {
  const n = Math.max(0, frame - start);
  return to - (to - from) * Math.pow(1 - k, n);
};
```

## 3. A v5 contra as regras (o que errei)

| Regra | v5 | Correção |
|---|---|---|
| Referência | Nenhuma: inventei do zero | Começar pela referência que você mandar |
| Chega rápido, pousa suave | Molas com amortecimento alto, perto disso, mas sem medir | Usar `approach()` com k de 0,12 a 0,19 |
| Nada congela | Logos parados por ~3,5 s. Coloquei um drift de 3% na cena inteira, mas é pouco | Push-in de 0,25% por quadro em toda pausa |
| Motion blur | Nenhum | Blur direcional nos movimentos rápidos |
| Um ponto focal | Placar, cartão e rodapé competiam | Rodapé de fonte só no final, e placar menor durante o cartão |
| Som | Travado na batida, e você aprovou | Master em -14 LUFS (a v5 saiu com -12,6) |
| Logos | Redesenhados | SVG real |
| Crítica | Eu mesmo revisei | Sessão separada, crítica rígida |

## 4. Revisão por uma sessão separada (prompt pronto)

```text
Você é um diretor de motion exigente e não construiu isto. Padrão: rejeitar.
Coloque a referência e o meu render lado a lado, travados por quadro, e compare.
Para cada diferença dê: shot + número do quadro, o que está errado, por que fica
pior, e a correção exata ("o cartão pousa 6 quadros antes, atrasar para o quadro 44").
Meça também a mudança quadro a quadro e aponte:
- movimento rápido seguido de parada seca (isso é o "travado")
- texto se mexendo antes de dar para ler
- som fora do seu hit visual
Priorize as 5 correções que mais melhoram o vídeo. Nada sai abaixo de 8/10.
```

## 5. Vídeos longos (VSL, filmes > 30 s)

Separe a produção. **Uma sessão guarda as regras visuais e a estrutura** (fontes, cores, logo, cursor, espaçamento). Outras cuidam de grupos de cenas, uma cuida do som e outra faz a crítica. Aqui no projeto, isso vira threads separadas, com as regras centralizadas nesta pasta.

## 6. Ferramentas

- **Remotion:** continua valendo, porque cada quadro já é uma função pura do tempo, exatamente como ele pede.
- **HyperFrames (HeyGen):** 22 blueprints de cena e uma auditoria de tempo morto (`fontes/hyperframes/`).
- **Estudo de referência:** ffmpeg + Python (diferença entre quadros para achar os cortes, rastreio de posição e amostragem de cor). Dá para montar isso aqui na nuvem assim que você mandar o MP4.

## 7. Pendências

- [ ] **Você:** mandar 1 vídeo de referência (MP4) com o nível de motion que você quer. Sem isso, a v6 volta a ser "invenção".
- [ ] **Você (opcional):** colar os prompts completos dos posts do @notdwd e do @twoclipping (ficam no "Mostrar mais" e nas respostas).
- [ ] **Claude:** montar o script de estudo de referência (`estudo-referencia/`) que gera o `SPEC.md` automaticamente.

## Lições do v6 (2026-09-28, estudo Gojiberry)
- Crítico separado em 4 rodadas: 4.5 → 6.5 → 7.5 → 8/10. Ele mede diffs entre frames, frames congelados, onsets de áudio e LUFS.
- O mux de áudio do Remotion atrasa o AAC em 1024 amostras (~1 frame). Renderize com `--muted` e faça o mux com `ffmpeg -c:v copy -c:a aac`.
- Handoff entre cenas: o elemento em foco voa até a posição final na cena seguinte usando a MESMA curva (k=0.18); a próxima cena continua essa curva. Sem pulo de tamanho.
- SFX com ataque lento (whoosh, sub) soam "atrasados" no detector: coloque um transiente curto (click/pop) no frame exato e antecipe o whoosh em ~0.15 s.
- Fade final curto (0.2 s), senão os últimos hits somem.
- Resultado: /mnt/project-files/motion-demo/v6-gojiberry/

## Lições da pesquisa de 29/09/2026 (estudo "caso criminal" + Pinterest)
Estudo completo: `estudos/caso-criminal/SPEC.md`. Referências coletadas: `referencias/README.md`.
- **Câmera contínua entre "estações"** é o que faz um documentário animado parecer caro. A referência tem só 7 cortes em 34 s; o resto é a câmera viajando por um espaço onde fotos, nomes e ícones estão espalhados.
- **Dois tipos de curva, cada um no seu lugar:**
  - elemento que **entra** (foto caindo, cartão): approach, pico no 1º quadro e depois decai ~14% da distância restante por quadro a 30 fps. Isso confirma k = 0,12–0,19;
  - **câmera que viaja** entre estações: ease-in-out simétrico, ~1,3 s para ~60% da largura, pico de velocidade exatamente no meio.
- Depois de pousar, a câmera segue a ~0,3% da largura por quadro. Isso confirma a regra "nada congela" (0,25%).
- Referências com o mesmo visual e **mais de 50% dos quadros congelados** parecem slide (medido em `mapa-5` e `doc-1` do Pinterest). A que parece cara (`mapa-4`) tem 1% de quadros parados.
- Truques de composição que valem para qualquer vídeo documental: foto real com moldura sobre uma **palavra gigante atrás**; **entrar na foto** (zoom que atravessa a moldura) como transição; **círculo desenhado à mão** num documento real; **linha de chamada** ligando um ponto da imagem a um rótulo; pilha de fotos como "evidências".
- IA de vídeo (Flow/Veo) só para clima e símbolo, nunca para fingir arquivo histórico. Zoom real do espaço até um endereço: **Google Earth Studio** (grátis, exige o crédito "Google Earth" na tela).
- Rede (29/09): Pinterest (páginas "ideas" e vídeos v1.pinimg.com) funciona; X lê post a post via api.fxtwitter.com; YouTube busca mas não baixa; Wikimedia exige User-Agent próprio, miniaturas em tamanho padrão (1280) e ~4 s entre pedidos, senão devolve 429.

## Lições do anúncio VSL Play (29/09/2026, 3 referências medidas)
Estudo completo: `anuncio-vslplay/SPEC.md`. Brief no formato do prompt colado: `anuncio-vslplay/BRIEF.md`; esqueleto reutilizável em `TEMPLATE-BRIEF.md`.
- **Bola que quica (ref-brain):** um impacto a cada 14 quadros (= uma batida a 128,6 BPM), cada quique com 0,68 da altura anterior, squash 2,6 por **um** quadro, stretch 0,60 na velocidade máxima, área preservada. Quique no tempo da música é o que faz o movimento parecer "certo".
- **Palavra que demonstra o próprio verbo** (BOUNCE quica, STRETCH estica, SNAP para seco): vale para qualquer lista de recursos. Cada recurso demonstra a própria função em vez de só aparecer escrito.
- **Logo desconstruída (ref-jackson):** a peça-chave entra primeiro, as outras giram em volta do centro; letras nascem de uma máscara na linha de base; letras finas se desenham traço a traço; campos de cor sempre chapados.
- **Gráfico com câmera que segue a ponta (ref-x), útil no vídeo da escola:** zoom de ~2,4x seguindo a ponta da linha com uma etiqueta de valor que troca de número; no fim a câmera abre e mostra o gráfico inteiro; um selo circular desenha, enche e recebe o número-resumo; a fonte do dado fica no rodapé o tempo todo.
- **Logo real sem imagem vetorial:** achar a versão em alta no site (aqui 3324 px), vetorizar com potrace, ajustar formas geométricas exatas (squircle, triângulo arredondado, círculo) e conferir contra o original numericamente (diferença média 1,8/255). Texturas tiradas dos pixels reais.
- **UI de produto sem ser falsa:** copiar do CSS real do player (tamanhos em rem, cores, ícones Phosphor) em vez de desenhar de memória.
- **Motion blur exato por amostras (média corrida):** empilhar N amostras de sub-quadro com blending normal, a k-ésima (da mais recente para a mais antiga) com opacidade 1/k. O resultado é a média exata, sem ganhar brilho. Toda amostra precisa de um fundo opaco, senão o que é semitransparente acumula. A versão com `plus-lighter` errou a cor em até 8% e dava um pulo ao trocar N.
- **Câmera com transform CSS:** `translate(p) scale(s) translate(-p)` sempre com `transformOrigin: '0 0'`. Sem isso a escala acontece em volta do centro do elemento e a câmera escorrega.
- **Chicote com follow-through:** cada linha de conteúdo fica presa à faixa por uma mola com amortecimento sobre a velocidade relativa. Ela fica para trás na aceleração, passa do ponto na frenagem e assenta, então as linhas pousam em cascata sem animação manual.
- **Gráfico com zoom de app (vale para o vídeo da escola):** câmera ancorada no primeiro ponto (00:00, 100%), zoom geométrico (escalas misturadas em log) e janela que abre junto com a ponta. O zoom uniforme de 2,4x mostrava só um penhasco fino, e seguir a ponta em x criava faixas planas confusas. A curva usa interpolação cúbica monotônica com amostragem densa, senão aparecem quinas.
- **Nenhuma espera congelada:** toda pausa de leitura (diagrama pronto, número final) recebe um push-in lento de 0,04 a 0,08% por quadro. Conferir com diferença entre quadros: nada parado por mais de 8 quadros fora do final.
- **Áudio sintetizado:** bumbo com corpo curto (decaimento ~0,13 s) e um "knock" em 180 Hz para aparecer em caixa pequena. Na primeira mixagem o grave abaixo de 120 Hz era 82% da energia e escondia os efeitos. Limitador com detecção em 4x oversampling segura o pico real em -1,4 dBTP (sem isso dava -0,5).
- **Som que acompanha o dado:** o tom da curva de retenção segue o valor sob a ponta (100% = 880 Hz, 0% = 220 Hz), então a queda do gráfico vira uma queda que se ouve.


## Lições da logo animada (VSL Play v4 a v5, 29/09/2026)
Código: `anuncio-vslplay/trabalho/fonte` (`src/FoldIcon.tsx`, `src/scenes/Opening.tsx`, `src/scenes/Finale.tsx`). O que foi entregue e por quê: fim do `anuncio-vslplay/BRIEF.md` ("AS BUILT").
- **Nos checkpoints, mandar clipe em movimento, não só stills.** O defeito do v4 (um contorno preto de 3 px piscando em volta do triângulo enquanto as abas quicavam) não aparece em quadro solto. Folha de zoom 3× de todos os quadros de uma montagem (`zoomsheet.py`) pega frestas de 1 px.
- **Aba de papel em CSS 3D:** `perspective: 1500`, `transformOrigin` na dobradiça (a borda de fora do ícone), `rotateX`/`rotateY`.
  - Soltar a aba já a 70° e inteira desde o primeiro quadro. A 86° ela é uma lasca vista de lado e parece surgir do nada.
  - Queda por gravidade em 10 quadros (`0,25u + 0,75u²`) e dois quiques, de 11° e 2,5° (restituição ~0,3, como cartão). Uma aba a cada semicolcheia, e o ícone cede 0,7 a 1,1% em cada pouso.
- **A sombra puxa para a cor mais escura da própria fita, nunca para o preto.** Preto a 47% deixou a fita quente cáqui e a fria cor de ardósia. Usar multiply com a cor escura amostrada da textura, no máximo 25%.
- **O que está embaixo de uma aba que quica aparece.** Se embaixo é o palco preto, cada quique abre um contorno preto. A solução tem duas partes:
  - sob cada aba pousada fica a "pegada" dela, na sombra (40%);
  - enquanto o triângulo é branco, uma faixa branca de 14 unidades passa por baixo das bordas das abas.
- **Emenda de antisserrilhado:** duas bordas suavizadas na mesma linha deixam um fio de 1 px do fundo. A camada de baixo precisa atravessar a borda, nunca terminar exatamente nela. Aqui a faixa é recortada pelo caminho cru da fita, que continua para dentro do triângulo.
- **Botão apertado mostra a parede do encaixe:** o triângulo vai a 0,97 em 3 quadros e o anel que abre em volta é cinza claro (#C4C4C4) por 2 quadros, antes de virar espaço negativo. Com o palco preto ali, virava contorno.
- **O flash branco (SNAP) funciona uma vez.** Repetir na remontagem final criou um pisca preto-branco-preto. No final o triângulo fica como espaço negativo e só as guias piscam, com o som da trava.
- **Ordem de profundidade:** o que vem da câmera fica na frente. O campo coral que volta no final é desenhado na frente das abas e as revela ao recuar. Desenhar as abas por cima dele foi erro de profundidade.
- **Uma fita solta lê como mancha.** Fazer ela crescer rápido (7 quadros) até virar o campo do capítulo.
- **O último pulo do ponto na logo pronta dá vida sem enfeite, mas só uma vez.** Agachar, subir 40 px e pousar com squash no tempo forte, com o ícone cedendo.
- **Motion blur por camada:** cada camada rápida tem o próprio número de amostras, proporcional ao deslocamento na tela:
  - uma amostra a cada 2 a 3 px, com teto (cursor 24, losango 40, fitas crescendo 96);
  - quando o espaço entre amostras passa de ~1 px, cada amostra leva um desfoque gaussiano de metade do espaço, senão aparecem cópias separadas.
- **Som do gráfico:** um pluck por semicolcheia na pentatônica, com a altura do valor da curva, ~9 dB abaixo da trilha. O tom senoide contínuo soava como teste de áudio.
- **Pré-atenuar os golpes altos em 3 a 5 dB** em vez de deixar o limitador achatar o transiente.
- **Dar dinâmica macro com um envelope por trecho.** A abertura cresce 6,5 dB até o primeiro tempo forte, o groove fica 4 dB mais baixo sob logo e slogan, e a trilha recua 5 dB sob o preço. O LRA foi de 3,2 para ~5 LU; medir com `loudcurve.py`.
- **Um kit de bateria por capítulo, com virada** (caixa fantasma e tons caindo) antes de cada transição. Cada capítulo soa diferente e a troca é anunciada.
- **Vinheta separada da logo:** mesma montagem da abertura, sem a desmontagem. Sai com fundo preto, num corte de 4,5 s e com fundo transparente (ProRes 4444 com alfa). O motion blur por amostras continua certo sobre fundo transparente, porque a mesma camada isolada é composta sobre qualquer fundo.
- **Guarde o trabalho na pasta do projeto desde o primeiro minuto.** Um reinício da máquina apagou o scratchpad com o código, renders e áudio do anúncio (29/09/2026) e custou horas para reconstruir. Código, áudio e renders vivem em `<projeto>/trabalho/`, sincronizados a cada etapa; só `node_modules` fica fora.

## Lições da locução e do reajuste de tempo (VSL Play v6, 29/09/2026)
- **ElevenLabs no plano grátis:** pela API só funcionam as vozes padrão (Eric, Brian, Chris...). Vozes da biblioteca (as brasileiras, como "Diego - Confident Announcer") dão erro 402 e criar voz por descrição dá 403. As vozes padrão falam português com sotaque de fora (o speech-to-text do próprio ElevenLabs dá só ~0,6 de certeza de português). Voz brasileira de verdade: gerar no site (lá o plano grátis usa a biblioteca) ou plano pago. O modelo `eleven_v3` com `language_code: pt` foi o menos estrangeiro das padrão.
- **Texto de locução para anúncio:** orçamento de ~2,5 palavras por segundo. Uma fala curta de capítulo ("Primeiro, prenda a atenção.") não cabe sozinha no cartão do capítulo; junte com a fala do primeiro recurso. Números longos por extenso cansam: "mais de oito mil reais" em vez de "oito mil, cento e sessenta e quatro".
- **Deixar mais lento sem refazer as cenas:** se cada cena recebe o quadro como parâmetro, um mapa de tempo por trechos (quadro de saída -> quadro de origem) no componente principal resolve. A abertura e o final com física e batida ficam travados na velocidade 1 com âncoras inteiras; as transições (wipes, chicote) quase não desaceleram; os trechos de conteúdo esticam até caber a fala. O script lê a duração de cada fala e calcula o mapa sozinho, então trocar a voz é só rodar de novo.
- **Cuidados com quadro fracionário:** todo teste de quadro exato (`k === 0` para o achatamento do ponto, o flash de um controle) precisa de `Math.floor`, senão some no trecho lento. O motion blur por amostras deve multiplicar o obturador pela velocidade, senão o borrão fica maior que o de um obturador de 180 graus.
- **Trilha no mesmo mapa:** separar "instante absoluto" (onde o som começa) de "duração de um trecho" (quanto um riser ou pad dura). Os ataques seguem o mapa, então cada seção ganha o seu andamento e todo efeito continua no quadro da imagem; as curvas de ganho usam o mapa inverso.
- **Mix com a voz na frente:** música e bateria abaixam 10 dB sob a fala, entrando em 120 ms e voltando em 700 ms, para crescer de forma fluida nas pausas; efeitos abaixam só 5 dB. A voz fica cerca de 11 dB acima da trilha enquanto fala; master -14 LUFS, pico real <= -1 dBTP.

## Lições do intake de áudio (vídeo escolar, 29/09/2026)
- **Whisper alucina em ruído:** no fim da gravação ou em respiração/ruído baixo ele inventa frases (repetiu uma frase inteira no fim da Anna Augusta; criou "E o que é o racismo estrutural?" na Luísa). Sinal: palavras com probabilidade < 0,5 todas juntas num trecho curto. Sempre conferir o json palavra a palavra e a energia (RMS) antes de legendar ou cortar.
- **Checar a fala contra o roteiro no intake:** o nome falado pode faltar (a Anna Júlia pulou "Eu sou..."). Descobrir isso antes do plano evita retrabalho no lower-third.
- **Áudio de WhatsApp:** voz com gate tem fundo digital -85 dB (limpa); gravação de sala mostra fundo -48 a -55 dB e pede denoise leve. Estalos aparecem como um pico clipado isolado numa pausa: medir clipping por segundo acha na hora.
- **Correção do Vítor (29/09): música e efeitos ficam no andamento normal; só as animações desaceleram.** A trilha desacelerada junto com a imagem ficou arrastada. Agora a música roda na grade fixa de 128,57 BPM no relógio do vídeo final (seções e acordes trocam no quadro de saída da fronteira da imagem), os efeitos tocam na velocidade normal e só o início de cada um segue a imagem; risers terminam exatamente no evento.
- **Sincronia pela palavra, não pela fala inteira:** transcrever cada fala com o tempo de cada palavra (speech-to-text do ElevenLabs, `scribe_v1`) e prender a animação de cada recurso na palavra que o nomeia ("Smart" -> o Smart AutoPlay aparece, "clica" -> o clique, "Já" -> o selo do preço). O mapa de tempo passa por esses pontos e nunca acelera a imagem além da velocidade original. Uma fala longa que cobre dois eventos pode ser cortada na pausa entre as frases para cada metade cair no seu evento.
- **Quem grava a voz pode mudar o texto:** sempre transcrever os áudios recebidos antes de sincronizar, em vez de confiar no roteiro.

## Lições da versão vertical e do ajuste 1.2x (VSL Play v8, 30/09/2026)
- **Acelerar tudo sem mexer nas cenas:** com o mapa de tempo guiado pela fala, acelerar 1,2x é acelerar só a voz (atempo, sem mudar o tom) e rodar o mapa de novo; a imagem acompanha as palavras e a música continua na grade dela.
- **Corte que pula antes da fala acabar:** prender o início da cena seguinte numa palavra do FIM da fala anterior (ex.: "pixel") e a primeira palavra da próxima fala no primeiro quadro da cena nova. Assim a troca nunca corta a locutora no meio.
- **Vertical a partir do horizontal sem refazer:** um compositor de painéis. Cada painel mostra um retângulo do palco 1920x1080, escalado, num lugar da tela 1080x1920. Recursos: texto em cima (escala ~1,45), player embaixo (~0,86). Cenas de tela cheia: um painel só. Entre planos os retângulos se transformam um no outro, então a tela "se divide" e "se junta" no ritmo das transições originais. O fundo é um canto vazio do próprio palco esticado, então a cor sempre acompanha a cena (inclusive wipes coloridos).
- **O que não cabe por corte precisa de layout próprio:** comparativo de preço (barras largas) e grade de logos 5x3 ficam minúsculos na vertical. Para eles, uma chave `LAYOUT.vertical` muda só a disposição (barra mais curta, frase embaixo do selo, grade 3x5, título em duas linhas); horário e animação iguais.
- **Transição de chicote (whip) em vertical:** trocar o enquadramento no primeiro quadro do chicote, sem morph; o borrão de movimento esconde o corte.
- **Margens seguras de Reels/Shorts:** conteúdo principal entre ~130 e ~1650 px de altura (a interface cobre topo e base).
- **Nunca ampliar uma camada inteira do palco centenas de vezes** (ex.: esticar um canto 8x8 px para virar o fundo da tela): o Chrome trava rasterizando a camada gigante quando há blur/efeitos (render parado em 140% de CPU). Fundo = tabela de cores por cena com mistura curta.

## Consciência Negra · parte 1 do Vítor (2026-09-30)
- Spline monotônica (Fritsch-Carlson): o divisor da inclinação é (x[i+1]-x[i]). Um erro ali gera NaN e a câmera congela sem dar erro no render. Sempre rodar uma checagem de quadros congelados (freezedetect) antes de entregar.
- Caminho com câmera seguindo a ponta: limitar (clamp) o índice do segmento no fim do caminho, senão vira NaN no último quadro.
- Mix com voz: boom com transiente e trovão por cima da fala matam a inteligibilidade. Debaixo da fala, usar só o sub (sem transiente), chuva baixa e ducking de -15 dB guiado pelos tempos das palavras. Deixar o impacto cheio só nas pausas.
- Documento histórico: nunca usar imagem "parecida" no lugar da lei real. Compor o texto verdadeiro (Lei 601/1850, Art. 1º) em tipografia e circular a palavra-chave.
- Tela dividida: o painel da esquerda começa em largura total e encolhe quando o segundo entra, nunca meia tela preta esperando.

## Prompts de imagem / thumbnail (Vítor, 2026-09-30)
- Os geradores atuais escrevem texto sem erro: o título vai DENTRO do prompt, com o texto exato entre aspas.
- Todo prompt de thumbnail especifica: fonte (nome e peso), tamanho (altura das maiúsculas em % do quadro), composição (grade, posição do personagem e do texto, margens, canto inferior direito livre), mensagem, impacto e hierarquia visual. Exemplo: escola-consciencia-negra/thumbnail-prompt.md.
- Geradores de imagem bloqueiam crianças em cenas de risco (enchente, pobreza). Em temas sociais, usar personagem adulto desde o início.

## 2026-09-30 · Escola "Racismo ambiental" (partes 3-7 e parte 2 adiantada)
- ÁUDIO numpy → ffmpeg: gravar SEMPRE `y.astype(np.float32).tobytes()` quando o ffmpeg lê f32le. Gravar float64 como f32le vira ruído a −8 LUFS.
- CORTE DE PAUSA: achar as pausas pela ENERGIA (a maior sequência de janelas de 20 ms abaixo de −42 dB), não pelo fim da palavra do Whisper (ele marca cedo e corta o rabo da palavra). Cortar só o MEIO do silêncio e juntar com crossfade equal-power de 60 ms: nada de "travada".
- TESTE DE INTELIGIBILIDADE: medir voz × resto só na banda da fala (passa-alta 120 Hz nos dois lados). Sem isso, os subgraves dos booms derrubam a margem para ~2 LU e parece que a mistura está errada. Meta ≥ 15 LU; as partes ficaram em 18-19.
- NÚMEROS em Cormorant: usar `fontVariantNumeric: 'lining-nums'` (os numerais antigos fazem "1º" parecer "Iº"). Anos com contador: sem separador de milhar ("2016", não "2.016").
- TRILHA POR PARTE: escolher o ponto de entrada da música pelo perfil de volume (RMS a cada 4 s) para o crescendo cair na virada do texto (ex.: parte 6 entrou em src 52,9 s para o crescendo de 84 s cair em 31,1 s).
- ADIANTAR SEM ÁUDIO: montar a parte com uma tabela T de instantes estimados (cada linha com a palavra-âncora) e `estimadas()` para o texto cinético. Quando o áudio chega, só se trocam os números; nada é refeito.
- LEGENDA × OBJETOS: papel/fotos grandes precisam terminar acima de ~y 830 (em 1080) para não bater na legenda; conferir com stills.
- CRÉDITOS: gerar a lista a partir do que o código usa de verdade (fotos citadas nos .tsx, músicas/efeitos citados nos mixes); o nome exato do arquivo vence o slot na busca do crédito.

## 2026-10-01 · Documentário Racismo Ambiental (junção final)
- Legenda sobre foto aérea clara/movimentada fica ilegível: sempre um escurecimento suave no terço inferior (sem brilho, só preto 0→72%) nas cenas de foto clara.
- Etiquetas (TypeTag) nunca na mesma faixa vertical das legendas (~y 880-960 em 1080p): subir para y 640-760.
- Junção de partes com trilhas diferentes (pedido do Vítor: não trocar músicas): mergulho no preto (0,55 s saída, 0,35-0,7 s preto, 0,45 s entrada) + ponte de áudio = cauda da parte anterior com eco longo atravessando o corte + impacto grave suave (-20 dB) na entrada da próxima. Script: escola-consciencia-negra/trabalho/fonte/gen/final.py.
- Após reinício do container, processos em segundo plano morrem sem aviso: conferir com ps/arquivos antes de prometer prazo.

## Lições de criativo de anúncio x vídeo institucional (VSL Play, 01/10/2026)
- **O cliente separou os dois usos:** o v6 (10/10 para o Vítor) foi lido pelo Deidson como institucional, bom para página de vendas, mas "não chama atenção nos primeiros segundos". Criativo de tráfego pede outra arquitetura, não só mais cortes.
- **Regras de criativo adotadas:** começar no meio da ação (nada de logo ou fade no início; logo só no CTA); gancho visual no quadro 1, antes de a locução terminar a pergunta; texto-chave grande pensado para assistir sem som; troca visual a cada 1,5 a 2,5 s; vertical 9:16 primeiro, texto longe das bordas da interface do app.
- **Loop aberto:** o gancho mostra um problema sem explicar tudo (botão no 00:07 com "oferta só em 12:40"; pontinhos caindo de uma linha sem eixos) e a resposta vem na cena 3 (o botão nasce no 12:40; a linha era o gráfico de retenção). Segura a pessoa até a revelação.
- **Storytelling antes de produzir:** o cliente pediu para aprovar as cenas antes de gastar render. Formato que funcionou: Claude Doc com tabela segundo a segundo dos 3 primeiros segundos + tabela de cenas (locução, imagem, texto, som) com coluna de aprovação por cena.
- **Áudio do cliente pode vir com tomadas repetidas:** transcrever com tempo por palavra (faster-whisper small roda no container) e escolher a tomada antes de cronometrar as cenas.
- **"Storytelling" para cliente = texto + storyboard desenhado (01/10/2026).** O Vítor corrigiu: só o documento não basta; o cliente quer ver os quadros-chave. Entregar junto: pranchas com 6 quadros 9:16 por imagem (tempo, cena, o que acontece, trecho da locução), notas amarelas de movimento que não vão para o vídeo, PDF e zip dos quadros em 1080x1920. Gerador reutilizável: `criativos-vslplay/trabalho/storyboard/gera.py` (quadros em HTML/CSS com a identidade real, render Playwright).
- **Gráfico com queda nos primeiros segundos:** num eixo de 3 min a queda do 00:06 vira uma parede colada no eixo. Para mostrar o "joelho", recortar o eixo nos primeiros ~30 s.

## Criativos VSL Play C2/C3 (2026-10-01): retenção em vertical
- Rodar detecção de "trechos parados" (qa.py, >8 frames sem mudança) antes de entregar; cura padrão = push-in lento na cena, partículas andando (ex.: bolinhas seguindo a curva) e montagem progressiva de cards. Só o hold final do end card pode ficar parado.
- Um único JSON de chaves (palavra falada -> frame) alimenta imagem e som; mudar o corte de voz regenera tudo em sincronia.
- Sting do logo em vertical: escala 0,66 para o lockup não encostar na borda.

## Ferramenta avaliada: Hypit (02/10/2026)
- Hypit "clona" vídeos de referência em projetos editáveis ancorados nas palavras; serve para modelar anúncios escalados (Meta Ad Library, TikTok Ads) e gerar muitas variações de gancho. Não substitui o nosso Remotion. Detalhes e veredito em fontes/ferramentas/hypit.md.

## Ferramenta avaliada: ECC (02/10/2026)
- ECC é um kit de agentes/skills para programação; não instalar inteiro. Peças úteis: medir referência (ritmo de cortes, LUT de cor) com taste-distillation para modelar anúncios escalados; revisão do render por um agente separado contra SPEC/DESIGN-SYSTEM antes de entregar; marcar lições como "confirmado pelo Vítor" ou "palpite". Lição: prompt não entrega cor, medição entrega. Avaliação completa em /mnt/project-files/organizacao/ecc.md.

## Estúdio próprio: motor por spec (02/10/2026)
- Remotion, HyperFrames e Hypit desenham igual (HTML num Chromium), então dá para unir: Remotion é o motor e o HTML+GSAP do HyperFrames roda dentro dele pelo bloco `HtmlGsap` (timeline GSAP pausada, `tl.seek(quadro/fps, false)` a cada quadro). Provado no teste B (`estudio/teste-gancho/`). Confiança: confirmado em render, falta a opinião do Vítor.
- Spec em JSON com eventos presos a palavras (`"de": "antes-1"`, `"ate": "VSL-2"`) + `fabrica.mjs` = variações em massa só mudando o JSON (teste C: outra copy, cor e formato 4:5).
- Pegadinhas técnicas: `calculateMetadata` precisa devolver `width`/`height` (não `w`/`h`), senão o formato é ignorado em silêncio; `renderMedia` usa `outputLocation` (não `output`).
- Gancho não pode começar com tela vazia: o primeiro bloco entra no quadro 0 (`"de": "@0"`), não na primeira palavra.
- Vítor (02/10/2026) preferiu o teste A (tipográfico em React) aos outros: "muito mais fluido". Confirmado pelo Vítor: para criativo, texto que sobe da máscara + palavra batendo + objeto com mola rende mais que cena de player em HTML.

## X/Twitter: showreels "cair o queixo" e MOTION.md (02/10/2026)
- Os showreels virais de set/2026 (Opus 5.5, um prompt) usam: cor chapada por cena trocando no corte, palavra única gigante com motion blur direcional, HUD fixo (timecode/BPM/cantos) costurando cenas, um elemento-fio (ponto) do início ao logo final, e muitas técnicas curtas (partículas 3D, grade de pontos em onda, UI real, gráfico). Fonte: fontes/x/ACHADOS-2026-10-02.md.
- Design system de motion = um MOTION.md extraído de 5 frames de referência (cores hex, tipos, tempos entrada/hold/saída, easing, textura, 5 proibições, 1 exemplo plano a plano, "ASK ME" onde não dá pra ver) + regra no CLAUDE.md "ler antes de animar; checar frames contra ele". Fonte: fontes/x/artigos/charliejhills-*.md.
- Como pesquisar no X daqui: fontes/x/LEIA-ME.md.
- (02/10/2026, rodada 2) "Um prompt" é meia verdade: os melhores usam um brief longo + kit + crítico. Padrões que se repetem nos prompts top (fontes/x/PROMPTS-2026-10-02.md): (1) todo valor animado é função do tempo, sem timers (no Remotion já é assim); (2) molas em forma fechada, uma mola por mudança de alvo; bordas de um mesmo objeto em molas diferentes (a da frente estica); (3) grade de batidas medida com numpy, algo acontece em toda batida, corte sempre na batida; (4) motion blur por subframes (4 por quadro, ffmpeg tmix); (5) um objeto carrega a história entre cenas e cai no mesmo pixel dos dois lados do corte; (6) 12–15 composições por 30 s, 1,4–3,5 s cada, assunto ocupa o quadro; (7) quadro 1 já é imagem pronta; (8) crítico novo que não viu a construção, com contact sheet a cada 0,2 s e ledger de rodadas; (9) máx ~1 s de tela parada por 30 s; (10) o Opus prefere HTML puro + Playwright e pula Remotion se não for mandado usar.

## GLSL e 3D por cálculo no motor (02/10/2026, estudo do clipe "P(doom)")
- Referência: vídeo CLD-GSpl5Q0 (O Programador), código aberto em github.com/oprogramadorreal/pdoom-video (MIT, original de mexicat). Estudo completo e plano em estudio/glsl/plano/plano-glsl.pdf.
- O "uau" deles vem de 3 coisas juntas: uma ideia visual diferente por frase (nunca ilustração literal), tudo cravado no tempo exato da voz/batida, e GLSL só onde o HTML não chega (luz calculada, 3D sem modelo, textura viva, pós de filme). Shader sem roteiro vira só fundo bonito. Confiança: confirmado lendo o código e o treatment deles.
- 3D "falso" = raymarching de SDF: fórmula de distância + sombra suave + oclusão + reflexo de softbox com Fresnel. Um estúdio infinito sai de graça: o chão tem a cor do fundo e só a sombra e a oclusão aparecem. Confirmado em render (estudio/glsl/keyframes).
- Para não parecer "computação gráfica": luz de estúdio macia, 1 cor, material acetinado com verniz (reflexo forte só de lado), sombra de borda macia. A referência vai além com hachura de gravura no lugar do degradê (função hachura() em motor/src/glsl/comum.ts).
- No Remotion: canvas WebGL2 próprio (motor/src/glsl/Shader.tsx) é o padrão; three.js só para modelo importado. Render na nuvem precisa de `--gl=angle` (sem GPU: SwiftShader). Raymarch 1080p com 2×2 amostras ≈ 0,3–0,6 s por quadro.
- Uniforms do shader presos a palavras com motor/src/motor/chaves.ts: [["luz-2", 3.5, "cam", 26], ...]. Cada palavra muda UMA coisa visível (luz gira em "luz", sombra varre em "sombra", softbox desliza em "reflexo").
- Pós em camada transparente: grão + vinheta num canvas com mixBlendMode "overlay" (0,5 = neutro) vale para React e GLSL juntos sem segunda passada. Bloom/halação de verdade exigem duas passadas (React vira textura).
- Pegadinha: a âncora normaliza acento, então "É" casa com o "E" anterior e "A" casa com "a luz". Ancorar em palavra única ("uma-4", "mesma-3").
- Pegadinha: edge-tts devolve as palavras sem pontuação; a legenda junta frases erradas. voz.py agora devolve a pontuação do roteiro às palavras.
- Processo confirmado pelo Vítor (02/10/2026): mesmo com plano aprovado, mandar storytelling + quadros-chave reais para aprovação antes do render completo.

## Voz clonada local: VoiceStudio / OmniVoice (02/10/2026)
- VoiceStudio é grátis (AGPL), mas o motor padrão OmniVoice tem pesos CC-BY-NC: não usar em anúncio pago de cliente sem checar licença; para comercial, escolher motor com licença permissiva. Detalhes em fontes/ferramentas/voicestudio.md.
- Clonagem de voz só com autorização explícita do dono da voz, registrada na conversa antes de rodar.
- (03/10/2026) Vítor sobre a vitrine GLSL: "top, mas narração de merda". Voz neural grátis do Edge (Thalita) NÃO serve para entrega; usar Ana Dias (ElevenLabs, gerada por ele no site) ou a voz do cliente. Confirmado pelo Vítor.

## Aula de física: Manim + Remotion + GLSL (03/10/2026, lançamento oblíquo)
- Pausas na voz: cortar no trecho MAIS LONGO abaixo de -50 dB perto da fronteira entre palavras (fade de 8 ms), nunca no "fim" que o Whisper dá (ele marca o início das palavras cedo e o corte cai no meio de um fonema). Deslocar os tempos pelo ÍNDICE da palavra, não pelo tempo. Script: estudio/aula-lancamento-obliquo/fonte/tempo.py. Confirmado no render.
- Manim como camada do Remotion: renderizar com `--format mov -t` e extrair PNG com ffmpeg. `--format png` direto PULA os quadros parados (wait) e dessincroniza. O alfa do Manim vem pré-multiplicado: extrair com `-vf unpremultiply=inplace=1`, senão preenchimento translúcido fica marrom no fundo claro. Confirmado.
- Manim: `substrings_to_isolate` com letras soltas (t, g) quebra dentro de \text e \theta e dá erro de LaTeX. Usar partes explícitas no MathTex (e \frac montado em partes). Confirmado.
- Legenda x derivação: medir o alfa da camada Manim na faixa da legenda por legenda; se a fórmula ocupa a faixa só de um lado, a legenda inteira vai para a outra metade (fonte/legenda_desvio.py). Melhor do que mover fórmula por fórmula. Confirmado nos quadros.
- Passagem 3D -> 2D sem corte: terminar a câmera 3D exatamente de lado (yaw 0, elevação 0) com a mesma escala do palco 2D e cruzar. O espectador nem percebe a troca de motor. Confirmado nos quadros.
- Som que ensina: cada fantasma do voo toca uma nota da pentatônica (dó maior) com a altura da bola, então a parábola vira melodia que sobe e desce. Junto com a música no mesmo tom. Ideia minha, aguardando opinião do Vítor.
- Derivação "muda": usar as pausas para provar na tela o que a voz só afirma (área do gráfico v×t vira y(t); eliminar t prova a parábola). Pedido do Vítor.
- Rótulo de gráfico (Vítor, 03/10/2026): nunca deixar texto cortado por eixo, grade ou linha do chão. Colocar no espaço livre do gráfico (ex.: acima da reta) com um traço fino de chamada até o elemento. Ele aprovou ("SHOW"). Conferir cada rótulo no quadro final, não só no Manim isolado.
- Texto nunca cortado por linha (Vítor, 03/10/2026, crítica geral): no Manim, todo MathTex ganha halo da cor do fundo (stroke background=True, largura 9) e a câmera desenha TODOS os halos antes de qualquer preenchimento (patch em Camera.display_multiple_non_background_colored_vmobjects em aula.py). Sem isso o halo de uma letra come a vizinha ("Tcrricelli") e quebra chaves (\underbrace). Caixas de fórmula com fundo cheio (set_fill(PAPEL,1), z_index -1). Além do halo, manter fórmula longe do chão do palco 2D.
- Manim rodando de dentro de /mnt/project-files falha às vezes (getcwd some, dvisvgm "não suportado"): renderizar de uma cópia local (/root/manimwork) com --media_dir local e copiar aula.py de volta.
- 3D real por código (03/10/2026, teste): `pip install bpy` dá o Blender 5 inteiro como módulo Python na nuvem, sem GPU. Modelos e céus grátis (CC0) pela API do Poly Haven. Cycles CPU ~8 s/quadro em 540x960, ~30 s em 1080x1920: serve para planos curtos; para muito 3D, usar GPU (Kaggle). Cuidado: alguns gltf trazem várias malhas (a bola tem "deflated" e "inflated"). Código: estudio/teste-blender/cena.py. Mapa de IAs (3D, rig, música, vídeo): doc "Arsenal de IAs para o motor".

## Vinheta "life" (04/10/2026): logo só em PNG pequeno
- Logo só em PNG de baixa resolução: não usar o traço automático puro (diagonais saem em escadinha). Medir a geometria: formas simples (losango de cantos redondos, círculos, barras) ajustadas por mínimos quadrados/perfil subpixel e montadas com shapely; só as curvas livres (gancho do f, o e) vêm do contorno suavizado (gaussiano ~0,9 px + potrace). Código: vinheta-life/trabalho/fonte/logo/. Confirmado em render (erro médio 2,5/255 contra o PNG).
- potracer (pip): o Bitmap trata True como fundo; passar `~mascara`. Emendas de letra com anel: a letra entra 3 px por baixo do anel (clip "dentro"), nunca termina na borda.
- Morph bolinha -> losango de graça: um losango de cantos redondos é núcleo(escala s) + raio fixo; com s = 0 é um círculo. Animar só s com mola. O furo deve usar a escala do externo vezes a dele, senão a espessura do anel oscila e vira um fio no overshoot.
- Som sintetizado de vinheta alegre: ukulele por Karplus-Strong precisa de ganho ~0,4 por acorde para aparecer sob os efeitos (a 0,18 a cama sumia, -30 dB); medir RMS a cada 0,1 s antes de mixar. Efeitos cômicos que funcionam no mapa de tempo: apito descendo na queda, boing com pitch caindo + vibrato de mola no quique, marimba em arpejo nas letras, "tcharam" (kick + palmas triplas + acorde + glock) no pouso. Código: vinheta-life/trabalho/fonte/audio/som.py. Confiança: falta a opinião do Vítor.
- Voz de celular sem microfone (05/10/2026): DeepFilterNet3 (aberto, CPU, ~10 s para 2 min) tira chiado e eco mantendo o mesmo número de amostras, então a boca continua sincronizada. Depois: passa-alta 80 Hz, -2,5 dB em 250 Hz, +3 dB em 3,2 kHz, de-esser, compressor 3:1, loudnorm -16 na voz. O download automático do modelo falha (GitHub 403 no Python): baixar o zip por raw.githubusercontent.com com curl e descompactar em ~/.cache/DeepFilterNet (cópia em ferramentas/modelos/). SAM Audio da Meta exige pedir acesso aos pesos + GPU.
- Fala embolada sem regravar (05/10/2026): cobrir o trecho com o visual do que ele quis dizer (código real + resultado) e uma pausa inserida só com imagem e som; a legenda corrige palavras mal ditas (Cloud -> Claude) e corta repetições ("boa boa").
- OffthreadVideo fora de <Sequence> toca relativo ao quadro 0: trecho que entra no meio do vídeo precisa de <Sequence from=inicio>.

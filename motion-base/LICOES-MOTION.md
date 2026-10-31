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

## Aula de ótica: prisma 3D + loop (05/10/2026)
- Luz no escuro: aula de ótica em estúdio escuro + lousa escura (feixes e arco-íris só brilham no escuro). Legenda branca com halo da cor do fundo (HALO em estilo.ts). Código: pessoal-vitor/aula-otica/trabalho/fonte/remotion/src/aula.
- Dispersão calculada de verdade sem raymarch: o caminho de cada uma das 16 cores (Snell + Cauchy) é calculado no TS e vira constantes do shader; o feixe é brilho analítico (distância raio × segmento). A soma das 16 cores (CIE 1931 por Wyman) normalizada dá branco exato. Confirmado em render.
- Desempenho no SwiftShader (4 CPUs): o custo é o número de segmentos por pixel. Longe do leque, trocar as 16 cores pelo halo branco do raio do meio (a soma das cores é branca); dentro do vidro, 1 traço branco. Prisma 1080p sem AA ≈ 10 s/quadro; com 2×2 ≈ 45 s (inviável). Fibra (cilindro analítico) ≈ 1,5 s.
- 3D → 2D sem corte: câmera de cima com dolly zoom (dist 30, foc 10,6 → quase ortográfica); a lousa 2D usa s = foc·1080/dist e o mesmo centro. Para casar com outra estação 2D, desloca o alvo da câmera (não a lousa).
- Loop do TikTok (pedido do Vítor): último quadro = estado logo antes do quadro 0. Aqui: a luz "apaga" (cauda do feixe atravessa o prisma) e a câmera volta à posição do quadro 0; o quadro 0 tem a frente do feixe logo fora da borda. Confirmado comparando q0000 × q3682.
- Texto nunca sobre linha (checado em folha de contato): máscara horizontal no esquema 2D para a superfície da água não passar por baixo do painel de fórmulas; rótulo longo do ângulo (L ≈ 49°) vai para fora do leque de raios; atenção ao atan2 em -180° (arco virava círculo).
- Bug de JSX: tex="n = \\tfrac{4}{3}" em atributo string NÃO processa escape (vira "\\"). Usar tex={'...'}.
- edge-tts atrás do proxy da nuvem: trocar edge_tts.communicate._SSL_CTX pelo CA do proxy (/root/.ccr/ca-bundle.crt).
- Som que ensina (ótica): cada cor = uma nota (vermelho grave → violeta agudo, como a frequência da luz); o leque abrindo é um arpejo; cada quique na fibra é uma nota alternando esquerda/direita. Aguardando opinião do Vítor.

### Voz do ElevenLabs na aula de ótica (05/10/2026)
- Roteiro para o ElevenLabs: escrever "téta" (não "teta"), senão a voz fala "têta". Vale para todo roteiro com θ.
- A voz do Vítor no ElevenLabs é mais lenta que a provisória: respeitar o ritmo dele (só encolher silêncio acima de 1,2 s) e abrir pausas mais longas nos momentos visuais; a música sobe devagar nas pausas (rampa ~700 ms) e desce rápido antes da voz (~150 ms).
- Whisper: NÃO passar o roteiro como initial_prompt; com ele o modelo pulou o primeiro trecho inteiro. Usar só um prompt de vocabulário e expandir dígitos ("0 ,8", "N1", "225") por extenso antes de alinhar (alinha.py da aula de ótica).

## Bastidores rodada 2 (Vítor, 2026-10-05)
- Em vídeo com tela em cima e rosto embaixo: legenda na EMENDA entre os quadros, nunca em cima do rosto. Uma linha só, mesmo tamanho e lugar o vídeo inteiro (pílula escura garante leitura em fundo claro ou escuro).
- Rosto centralizado no painel dele (olhos/boca no meio), com um leve zoom.
- Quando citar apps reais (ChatGPT, Gemini), usar as logos reais (motion-base/logos), nunca círculo genérico.
- Making-of sempre mostra o vídeo final de verdade, com o som dele, logo depois do gancho (vitrine de ~6 s).
- REGRA (Vítor): legenda NUNCA cobre o rosto. Com tela dividida, fica na emenda; com rosto em tela cheia, no peito (y≈1330).
- REGRA (Vítor): no máximo 3 pontos de atenção ao mesmo tempo: tela de cima, a fala (rosto) e a legenda. Nada de barra de passos extra nem cartões sobre o rosto; dicas e comentários vão para a tela de cima.
- Cortar silêncios, respiradas e hesitações da fala: trechos quietos da voz limpa (>= 0,22 s, limiar p95-24 dB) saem, sobrando 0,08 s de cada lado; cada corte alterna zoom 1.0/1.06 no rosto para disfarçar o corte seco (bastidores/trabalho/fonte/prepara.py).
- MÚSICA (Vítor, 2026-10-05): música precisa ser ouvida: ~8 LU abaixo da voz (ducking -17 dB sob a fala, -8 nas pausas); -13 LU ficou inaudível. Para explicação/didático, trilha calma e pensativa (ex.: Kevin MacLeod "Deliberate Thought"). "Wallpaper" é divertida demais para aula; guardar trilhas animadas para vídeos leves.
- DIVISÃO (Vítor, 2026-10-05): tela dividida é METADE E METADE (960/960), não 2/3 para a tela. Enquadrar cada take do rosto pelo rosto (o take do gancho pediu enquadramento mais baixo). Cenas de cima desenhadas em 1080x1100 cabem em 960 com scale(0.873) e laterais na cor do fundo.
- CARD DE SEGUIR (Vítor, 2026-10-05): componentes/card-seguir/ (tela final cheia) é OPCIONAL, nunca padrão. Nunca escrever "editado pelo Claude" no final.
- CHAMADA PARA SEGUIR NAS AULAS (Vítor, 2026-10-05, substitui "aula em loop não leva card"): as aulas têm muita view e pouca gente seguindo, então toda aula de conteúdo leva a pílula componentes/pilula-seguir/ no meio do vídeo, logo depois de uma entrega de valor e numa pausa, longe do 1º e do último quadro para o loop continuar intacto. 3,2 s, canto livre, com clique e sino baixos.
- DESCRIÇÃO DE POST (Vítor, 2026-10-05): longa e didática (gancho, passos numerados, dica, pergunta para comentar), crédito da música, e no máximo 5 hashtags de uma palavra, cada uma de uma categoria (tecnologia, vestibular, matéria, habilidade, formato). Exemplo: pessoal-vitor/bastidores/descricao-post.txt.

## Banco de músicas e variedade (Vítor, 2026-10-05)
- REGRA DAS AULAS (Vítor, 2026-10-05 21:26, vale mais que a regra de variedade abaixo): aula de conteúdo (física, matemática, questão do ENEM) mantém o padrão de música da ótica e do lançamento oblíquo, "Inspired" de Kevin MacLeod. Não trocar por faixa do banco sem ele pedir.
- O banco `motion-base/musica/` (CATALOGO.md por clima: aula, fala, gancho, final, leve) serve para o resto: bastidores, vídeos leves, escola, clientes, ou quando ele pedir outra trilha na aula. Nesses vídeos, não repetir a faixa dos 3 últimos nem o mesmo artista duas vezes seguidas (conferir e anotar em `musica/usos.csv`, com a reação do Vítor).
- Clima certo pelo conteúdo: aula = calma, curiosa, com pulso leve (âncora "Inspired", que ele chamou de perfeita); fala/bastidores = quente e discreta (âncora "Deliberate Thought"); faixa animada ou brincalhona só no clima `leve`, nunca em aula ("Wallpaper" soou de piada).
- Só licença livre para rede social: CC0 ou CC BY (crédito obrigatório na descrição, linha pronta no catálogo). NC, ND e SA ficam fora. Em anúncio pago, só CC0 ou CC BY com crédito visível no próprio anúncio.
- Ampliar o banco: `musica/fonte/coleta.py` -> `analise.py` (IA de áudio CLAP compara cada faixa com o texto do clima e com as trilhas aprovadas) -> `seleciona.py`. Faixa que o Vítor aprovar vira âncora nova. Usar o CLAP `laion/larger_clap_music_and_speech` com transformers 4.46: com transformers 5 ou o `larger_clap_music` as notas saem todas perto de zero.

### Roteiro de aula: progressão de raciocínio (Vítor, 05/10/2026, vale para qualquer matéria)
- O que importa é o espectador sentir o raciocínio avançando: cada ato abre com uma virada falada que liga o que veio antes ao que vem agora, seguida de uma pausa. A frase varia e é escolhida pelo que soar melhor (pergunta, contraste, "e se...", promessa); não precisa ser "agora vamos". Ex. do lançamento oblíquo: "Agora vamos para as três perguntas que mais caem na prova."
- Na ótica isso faltou: o roteiro foi de conceito em conceito e só o selo "CAI NA PROVA" marcava a mudança. O selo na tela não substitui a frase falada.
- Esqueleto: gancho → "primeiro, a regra" → conceito → "agora, as questões que mais caem sobre isso" → questões → "e o segredo que pouca gente sabe" → segredo → fechamento que volta ao gancho.
- A pausa depois da transição entra em PAUSAS (tempo.py) e a música sobe nela; a imagem também marca a virada (troca de estação, título do ato).
- Fala gravada à parte (ex.: chamada para seguir) entra pelo tempo.py com INSERE = {palavra: (arquivo, fim útil, respiro)}: abre espaço depois da pausa daquela palavra, empurra o relógio das palavras seguintes e grava "insercoes" no relogio.json (pílula, legenda e ducking leem dali). Só os blocos dali para frente precisam re-renderizar.

## Questão da tangente (Manim, 2026-10-05)
- Manim 3D: `frame_center` também desloca os objetos fixed-in-frame. Para enquadrar o objeto 3D num ponto da tela, desloque o objeto (offset no mundo calculado com a matriz de rotação da câmera), não a câmera.
- `always_redraw` que devolve VGroup com número variável de filhos não fica fixed-in-frame em ThreeDScene: usar vários always_redraw de um VMobject só.
- `Indicate` (ou qualquer Transform) junto com outro Transform no mesmo objeto/família na mesma `play` desfaz o outro no fim (volta ao estado inicial). Encadeie com `Succession`.
- `FadeIn` de grupo com always_redraw cujo filho muda de tipo dá erro de zip: adicione o grupo e tire um véu da cor do fundo por cima.
- Texto que cresce em etapas: monte a caixa já com todas as linhas e revele linha por linha (FadeIn); Transform entre Text diferentes embaralha as letras no meio.
- Voz de WhatsApp: resemble-enhance (CPU ~27 min para 5 min de voz) dá brilho mas troca sílabas. Melhor híbrido: original abaixo de 7 kHz + restaurada acima. Conferir sempre re-transcrevendo os trechos.
- Loop: comparar o último quadro com o quadro 0 por PSNR (>40 dB = idêntico) depois de re-renderizar as duas cenas.

## Chase AI: vídeo em JavaScript e desenho animado por código (07/10/2026)
Estudo completo: fontes/chase-ai/NOTAS.md (transcrição, quadros e o código MIT da skill `animate` em fontes/chase-ai/repos/).
- Vídeo = função do tempo; o mesmo t dá o mesmo quadro. Por isso o Claude confere qualquer quadro sozinho. Nunca `Math.random` nem relógio: aleatoriedade com semente.
- Esforço não salva prompt ruim: no teste dele, low e high ficaram bons e ultracode (8 h) só um pouco melhor. O que mais rende é pedir storyboard antes de codar.
- Toda encomenda de vídeo em código diz: duração e tipo, formato, a ordem (voz/trilha primeiro e visual casando, ou o contrário) e "antes de terminar, tire contact sheet, conserte, renderize e repita".
- Cara de desenho animado: traço redesenhado com tremor diferente a cada 2 quadros ("ferve em 2s", 24 fps), câmera e movimentos também em 2s, textura do meio visível no celular (papel rasgado, hachura, retícula, grafite), herói pequeno com rosto do início ao fim, vida no fundo mesmo parado. Motion blur só em estilo liso; desenho em 2s fica nítido de propósito.
- Transição "morph de forma": o mundo fecha numa janela no formato de um objeto, o objeto vira o equivalente do mundo novo e o mundo novo abre dele. 1,2 s cada; no máximo 3 em vídeo < 30 s; objeto ≥ 200 px na passagem; morph sobre o papel em branco, nunca mistura de duas cores de fundo.
- Gramática: uma constante que o olho segura; uma cor = uma coisa; silêncio (0,5 a 4 s) antes da virada e a pancada mais alta nela; o trecho mais denso vem antes do silêncio; o fim é o começo mudado; um dispositivo que se diz numa frase, revelado em 80 a 95%.
- Com voz, a voz é o relógio: batida começa ~0,3 s depois do fim da frase; pancada da virada na pausa antes da frase que a nomeia; ≤ 3,5 palavras/s.
- Algo novo a cada 2 a 4 s; "rápido" é passo de um mesmo movimento, não muitos cortes. Grade 24 fps + 120 BPM (colcheia = 6 quadros).
- Cadência (vinhetas AE dele): começar já em movimento; sobrepor passagens 6 a 10 quadros a 30 fps; uma ação dominante por vez; saída rápida e chegada suave; um fio de continuidade que muda de forma (cursor → borda → alças → agulha → sublinhado).
- Storyboard bom tem em cada painel: tempo, título, o som daquela batida e a transição para a próxima. Aprovação em 3 degraus: história em tabela → 2 a 4 quadros de estilo → storyboard completo.
- Revisão por medição, não por olho: texto cortado/sobreposto/fora da área segura (9:16: x 60 a 940, y 250 a 1500), trechos mortos, janela mais alta e silêncio antes, LUFS, tira de 1 quadro/s a 360 px para ver como no celular.
- Confiança: regras lidas no código e no vídeo dele, ainda não testadas no nosso motor. Referência de nível: Kevin Ngo (X @kevin_t_ngo).

## Identidade de cliente extraída do site: extract-ds (07/10/2026)
- A skill `extract-ds` (Rodrigo Tadewald, cópia em `skills/extract-ds`) transforma um site JÁ BAIXADO numa pasta em catálogo HTML vivo (Overview + Components). Não recebe URL: baixar antes com `wget -p -k -E -H -D <dominio>,fonts.googleapis.com,fonts.gstatic.com -e robots=off <url>`.
- Para vídeo precisamos de números, não de HTML: `motion-base/fontes/ferramentas/extract-ds/ponte-tokens.mjs` mede cores por área, fontes por texto, raios, botões. Medir na cópia local (no navegador da nuvem o site ao vivo perde as fontes). Variáveis `--wp--preset-*` do WordPress não são a marca.
- Identidade do site NÃO é ordem: passa pelo filtro de gosto. O site do VSL Play é navy + índigo + magenta com degradê e glow (nossa P1 proíbe); o anúncio nota 10 usou as cores chapadas da LOGO. Regra: cor chapada da marca fica, degradê vira a cor dominante, glow sai, legenda segue Inter 500.
- Notas completas e proposta de `tema` por cliente no motor: `motion-base/fontes/ferramentas/extract-ds/NOTAS.md`.

## After Effects por código: EffectCraft/FilmCraft (storytold, 08/10/2026)
- Existe um "After Effects" e um "Premiere" de código aberto em Rust que rodam sem tela na nuvem e aceitam script JS no modelo do AE (`comp.layers.addText`, `setValueAtTime`, expressões). Instalar: `bash estudio/craft/instalar.sh` (binário oficial + SHA256, 30 s). Notas: `motion-base/fontes/ferramentas/storytold/NOTAS.md`.
- **Vítor (08/10, 19:21 UTC): "horrível, Remotion + JavaScript é muito melhor; só o Remotion sola isso aí". Não usar EffectCraft em motion. Lição: app que imita o After Effects não traz o gosto; o 10/10 vem do nosso método no Remotion. Antes de propor ferramenta nova de motion, mostrar UM quadro comparado lado a lado com o nosso, não só dizer que funciona.**
- (Proposta anterior, descartada) Papel: fornecedor de peças para o Remotion, nunca o motor principal. Usar quando o Remotion sofre: 3D com luz e sombra, partículas, Fractal Noise, tracking, keying/roto, receita de expressão do AE vinda de tutorial/X.
- Entrega da peça ao motor: ProRes 4444 com alfa (`render --format prores --prores 4444 --channels rgba`) em `<OffthreadVideo transparent>`, ou Lottie em `@remotion/lottie`. Os dois saíram idênticos no teste.
- Lottie perde expressões: rodar `prop.convertExpressionToKeyframes` em cada propriedade com expressão (ex.: mola de overshoot) e exportar com `textAsShapes: true`.
- FilmCraft exporta a timeline em FCPXML/XML do Premiere/OTIO/EDL: dá para entregar ao Vítor uma montagem editável além do MP4. Master de áudio/vídeo continua no ffmpeg.
- Fixar a versão do app no ESTADO.md da obra: o projeto muda todo dia.

## Skill animate na prática (08/10/2026, ver também a seção Chase AI)
- (primeira peça com a skill `animate`, estudio/animacao-js/) Roda na nuvem sem GPU: 504 quadros 1080x1920 em ~2,5 min. O kit só aceita fontes do sistema; na nuvem não há fonte de mão, então instalar Caveat/Kalam (.ttf em estudio/animacao-js/trabalho/fontes/) e apontar `cursive` para Kalam no fontconfig, senão a letra cai numa serifada feia.
- O laço que deu certo: história em batidas no `head.html` (cues + board) → `storyboard.png` → `tile.mjs` atravessando cada morph e o corte → export → `review.mjs`. A revisão pegou o que o olho deixou passar: o pico (folha de contato) estava tão alto quanto a virada e o final não decaía; resolvido tirando energia do pad do pico e do final, não aumentando a virada.
- Zoom de câmera dentro de uma cena empurra o desenho para cima da legenda (a legenda fica fixa na tela). Em 9:16 com legenda em y 1330, nada de zoom > 1,1 em cenas que ocupam até y 1200.

## Criativos de preço Rei da VSL: plano (09/10/2026, palpite até o Vítor/Dhay aprovarem)
- Ritmo medido (trabalho/mede_ref.py em clientes/rei-da-vsl/criativos-precos): showreels virais do X trocam o visual a cada 0,75 a 0,9 s com ~20% de quadros parados; nosso v6 troca a cada 2,7 s (47% parados) e os criativos C2/C3 a cada 2,1 a 3,2 s. Para criativo com locução, alvo 1 troca a cada 1,0 a 1,3 s e ≤ 20% parado.
- Anúncio de preço: o preço é o gancho do quadro 1, em hodômetro já girando, pousando na sílaba falada. Dois criativos da mesma marca = série com cores invertidas na abertura (preto/ouro x ouro/preto), bom para teste A/B.
- Anúncio que vende edição deve ser a própria prova: moldura de editor (cantos, BPM, timecode real) costurando as cenas e, quando o texto permite ("esse que você tá vendo é um exemplo"), a câmera recua e mostra o próprio vídeo dentro da timeline com a onda real da voz.
- Logo com metal/degradê: o metal fica só na logo real; os grafismos usam o ouro chapado medido (mediana dos pixels da coroa).
- (09/10/2026, crítica do Vítor à rodada 1: "muito plano e chato, cenas muito semelhantes") A rodada 1 tinha 8 de 10 quadros com o mesmo esquema: fundo preto + título centralizado + ícone. Correção que ele pediu e que vale para todo criativo: (1) cada frase vira uma METÁFORA LITERAL e um tipo de cena diferente (preço = etiqueta pendurada; pacote = caixa com fita; total = cupom fiscal saindo; incluso = carimbo; separadamente = caos de 3 conversas com notificação; entrega = barra de exportação 100%); (2) variar composição, escala e cor a cada cena (close extremo, tela dividida, faixas, celular em leque, vista explodida); (3) o mesmo número (preço) no máximo 2 vezes, no gancho e no fim; (4) logo/coroa nunca da mesma cor do fundo (coroa ouro só sobre branco ou preto); (5) para mostrar "variedade de vídeos", 10 telas em estilos de motion realmente diferentes, inspirados nos reels do X (catálogo em fontes/x/ESTILOS-MOTION.md), feitos por nós, nunca vídeo de terceiro colado.
- (Vítor, 09/10) Pensar o criativo pela ótica do lead: se conectar no 1º segundo, se interessar pela qualidade da edição, entender a gama de possibilidades, entender a marca e ser puxado para o clique. Cada cena precisa servir a um desses passos.

## Produção dos criativos de preço Rei da VSL (09/10/2026)
- Quadros-chave aprovados viram código 1:1: o palco do Remotion é desenhado nas mesmas coordenadas do storyboard (540x960) e escalado x2 com `transform: scale(2)` (texto continua vetorial). Nada se perde entre o que o cliente aprovou e o vídeo.
- Preço falado numa palavra só da transcrição ("R$39,90" de 0,06 a 2,54 s): os dígitos não pousam todos juntos. Use o envelope da voz para separar "trinta e nove" de "e noventa" e pouse cada dígito na sua sílaba (hodômetro: gira, desacelera, pousa com um pequeno tranco).
- A grade da música (128,57 BPM = 14 quadros) pode começar onde for preciso: escolhemos a origem no quadro 7 para que os tempos fortes caíssem nas palavras-chave ('Sim', 'incluso', o botão; no 02, o preço batendo e 'A gente faz tudo'). Primeiro os momentos, depois a grade.
- Objeto "produto" (caixa, pacote) que parece de criança em SVG: fazer em 3D real no Blender por código (Cycles, filme transparente, pegador de sombra) e entrar no vídeo como sequência PNG. Material fosco + um metal só (fita dourada) + a marca real como decalque.
- "Esse vídeo é um exemplo": recuo meta. A cena anterior encolhe e vira o 1º card de um carrossel com trabalhos reais do portfólio; o carrossel segura cada card ~1,3 s e desliza rápido (com desfoque só no deslize), e continua por baixo do CTA.
- Sem cena parada: toda cena ganha uma camada secundária discreta (grade de pontos derivando, notas de editor em mono, rastros de impacto, tremor de câmera de 7 px no impacto) sem disputar o ponto focal.
- Música 18–22 LU abaixo da voz: medir contra música+bateria+reverb (sem os efeitos), senão os efeitos "roubam" a conta e a trilha fica alta demais.

## Legibilidade acima do ritmo medido (Vítor, 09/10/2026, rodada 4 dos criativos Rei da VSL)
- **Crítica dele à versão entregue: "muito rápido, informação demais ao mesmo tempo, não dá para ler nem ver; o gancho dos 3 s não fisgou; a caixa 3D aparece 1 segundo".** O alvo de 1 troca a cada 1,0–1,3 s (medido em showreels sem fala) NÃO vale para criativo narrado com texto na tela. Com locução: uma ideia por cena, cada texto fica na tela pelo menos o tempo de ler duas vezes, e a cena só troca quando a frase termina.
- Locução de cliente curta demais para o que precisa mostrar: abrir pausas entre as frases (cortar no meio do silêncio entre duas palavras e inserir silêncio, sem esticar a voz). Script `clientes/rei-da-vsl/criativos-precos/trabalho/fonte/esticar.py` (dict de pausas por índice de palavra → wav esticado + transcrição com tempos deslocados; cues.py e audio.py leem a versão esticada). +10 s em cada criativo; ele aceita até 1 min.
- Gancho dos 3 s: UM objeto forte, legível, com movimento desde o 1º quadro, que fica na tela enquanto a frase é dita. Três cortes em 3 s não prendem, confundem. Feito: preço em 3D (Blender) girando/caindo e pousando na sílaba, sozinho na tela até "por criativo".
- Peça que deu trabalho e ficou boa (caixa 3D) merece tela: ≥ 3 s, com a câmera orbitando devagar para revelar um detalhe que a voz diz na hora ("10 CRIATIVOS" na lateral bate em "com dez criativos"). Valoriza o trabalho e substitui uma cena inteira (o leque de celulares saiu).
- Enxugar = tirar camadas que não servem ao lead: HUD de editor (BPM, timecode), notas em mono, ecos de texto, legendas cinza pequenas, faixas decorativas. Ficar com ponto focal + título.
- Ele gosta de 3D: mais momentos em 3D real são bem-vindos. Logo só em PNG? Dá 3D sem redesenhar: frente = PNG oficial, espessura = ~28 camadas com o mesmo recorte (alfa) em ouro metálico empilhadas (caixa3d/coroa3d.py).
- Custo: Blender Cycles CPU ~25–60 s por quadro a 1000–1080 px; 3 sequências em paralelo ≈ 1,5 h. Renderizar só a parte animada (pouso + assentamento) e segurar o último quadro com flutuação 2D no Remotion.
- (rodada 4b, Vítor: "'Fechando o pacot...' cortou estranhamente; tem umas pausas estranhas") Pausa inserida na locução: SÓ no fim de frase (ponto, dois-pontos), nunca dentro de lista ("copy, locução e edição") nem entre "pacote | com dez criativos". O corte vai no ponto de menor energia (janela 20 ms) entre o fim de uma palavra e o início da outra, não no meio do intervalo do Whisper (o "fim" da palavra no Whisper erra e o meio caía em -22 a -36 dB, ainda dentro da voz). Ganho realista: +6 s em 25 s. Cenas que ficariam curtas demais viram uma cena só (copy/locução/edição = lista que se monta) e objeto-herói pode entrar na pausa ANTES da frase (a caixa entra aberta 1,3 s antes de "Fechando").
- (rodada 4c, Vítor: "a caixa não fechou direito, animação estranha de um quadro para o outro") Animação por quadros do Blender: conferir a tira quadro a quadro ANTES de entregar. O ease-out cúbico dentro do script concentrava o giro de 120° das abas em 2-3 quadros do vídeo, e o sinal da rotação fazia a aba "abrir" caindo por cima da parede (escondendo a coroa). Correção: caixa aberta em V (abas em pé, -105°), laterais fecham primeiro e depois frente/fundo, smootherstep, e quadros em meio-passo (Q fracionário, 37 posições espalhadas por ~26 quadros).
- (rodada 4d, Vítor: "6-7 s e 11-12 s ficou sem falar e parado; cada fala pode ser minimamente encurtada, mas a dinâmica melhorou MUITO") Pausa inserida boa = 0,3 a 0,7 s. 1 s ou mais com a cena já resolvida soa como vídeo parado. Ganho final: +3,5 s em 25 s (não +10).

## Capa no quadro 0 e fala direta (Deidson, cliente Rei da VSL, 10/10/2026) — PADRÃO PARA TODO CRIATIVO DE ANÚNCIO
- "Precisamos sempre ter uma capa no primeiro milésimo de segundo, pra saber qual vídeo é nas campanhas. Começar direto com a animação toda pronta na tela, sem tela SEM NADA; o canal de publicação usa como capa." Os nossos abriam com o preço entrando (quadro 0 vazio, um branco e um preto: indistinguíveis no Gerenciador). Correção: o quadro 0 mostra o preço 3D completo (render começa no quadro em que a última peça pousou) e o gancho vira assentamento + pulso na palavra falada. Conferir SEMPRE o quadro 0 isolado antes de entregar.
- "Muitas pausas em trechos desnecessários; fala dinâmica, direta; só pausar quando fala de exemplos, pra pessoa olhar." As rodadas 4/4b/4d abriam pausas por pedido de legibilidade do Vítor; o cliente final quer o oposto. Equilíbrio que ficou: `esticar.py` encurta todo silêncio natural > 0,25 s para 0,18 s e só adiciona 0,25–0,35 s onde há algo para olhar. Legibilidade vem de menos informação por cena, não de pausa na voz. Ele sugeriu acelerar 1,2–1,4x; preferimos cortar silêncio (mantém o timbre da voz).

## Estáticos de anúncio a partir dos artefatos do vídeo (Rei da VSL, 13/10/2026)
- O jeito barato e fiel de fazer estático de uma campanha que já tem vídeo: HTML/CSS + Playwright (screenshot 1:1 em 1080 px), reaproveitando fontes, paleta, ícones e os PNG 3D do Blender. Fica idêntico à marca do vídeo, com texto 100% correto (coisa que gerador de imagem erra).
- Re-renderize o 3D no tamanho final x2 (2160) em vez de ampliar o quadro do vídeo; corte até o conteúdo.
- PNG com "shadow catcher" do Blender traz um véu de alfa baixo no quadro inteiro: num fundo chapado aparece um quadrado cinza. Limpar: subtrair o alfa medido na borda e esfumar a sombra numa elipse (`clientes/rei-da-vsl/estaticos-precos/trabalho/prepara.py`).
- Carimbo/selo por cima de texto (cupom, legenda) viola a regra "nada cruzando texto": prefira a linha de "incluso" dentro da peça.
- Mesma regra de capa dos vídeos: preço inteiro e legível como peça principal; série distinta por cor de fundo (01 preto/ouro, 02 branco/preto).

## Estático: código vs gerador de imagem (Vítor, 13/10/2026)
- Estáticos por código (HTML+Playwright) saíram corretos mas "sem graça" para o Vítor: faltou fotografia/material/ousadia. Híbrido: gerador de imagem (GPT/Gemini) faz a arte com prompts muito específicos; logo real e botão entram depois por código (reservar faixa limpa no topo e embaixo no prompt).
- Pinterest funciona da nuvem sem token: motion-base/fontes/pinterest/LEIA-ME.md.

## Vídeo de venda de site para cliente (MedicMais, 14/10/2026, palpite até o Vítor aprovar)
- Pitch 1 a 1 (vender o site ao dono) não é criativo de tráfego: o gancho é a personalização. Quadro 0 = o site DELE rodando no celular com "o site de vocês já está pronto".
- Nada de UI falsa: o celular mostra o print real do site (página inteira @3x) rolado até a seção, com o cabeçalho fixo e a barra fixa reais por cima. Offsets das seções medidos com getBoundingClientRect no Playwright.
- Reels públicos do Instagram do cliente baixam com yt-dlp da nuvem (sem login, quase todos). Material real da clínica > qualquer B-roll. Têm legenda queimada: card mostrando só o terço de cima.
- Dado de mercado só com fonte na tela (TIC Saúde 2023, Cetic.br); dado do cliente só o que está no site. Afirmação sobre o Google do cliente: conferir no Google do Vítor antes do render.
- Estrutura que fechou: gancho -> o que a clínica já tem -> problema (feed, pesquisa, mercado) -> 4 frentes (ser encontrado, 1 toque, prova, endereço próprio) -> com a cara deles + faltam N detalhes -> chamada que volta à capa.
- wget direto na pasta do projeto (/mnt) dá "Bus error" ao converter links: baixar no scratch e copiar.
- (produção, 14/10) Print de página inteira do Playwright "carimba" elementos `position:fixed` (barra do WhatsApp) no ponto da primeira tela: ao rolar o print no celular do vídeo aparece barra duplicada. Tirar o print com a barra escondida e sobrepor a barra real por cima. Espaço de vídeo vazio do site (degradê) lê como glow e "site quebrado": preencher com quadro real do reel que o site promete.
- Cena que termina logo depois de uma palavra-chave: o elemento preso a ela pode nem aparecer (o tracejado ficou 4 quadros). Conferir sempre `evento < fim da cena - 30`.
- Push-in linear 1,00 -> 1,04 em toda cena zerou os trechos parados (freezedetect) sem parecer movimento gratuito.
- Mix com SFX: abaixar efeitos 9 dB enquanto a voz fala (não só 4) e adiantar o ducking ~100 ms para não pisar no ataque das palavras. Crítica independente: 6,5 -> 8,3 só com essas correções medidas.

### Marca citada = marca na tela (Vítor, 2026-10-14)
Sempre que a narração citar outra empresa ou app (Google, Instagram, WhatsApp, Maps…), mostrar o logo e a identidade reais dela (SVG oficial, cores dela), nunca só o nome em texto: o espectador não lê, ele reconhece a marca. Busca no Google = barra com o logo do Google. Interações físicas reais (ex.: NFC) ganham o som real correspondente (bip de pagamento por aproximação).

### 3D real no Remotion com three.js (MedicMais v2, 14/10/2026)
- @remotion/three tem de ter EXATAMENTE a versão do remotion (4.0.535 com remotion 4.0.529 quebra: "resolveSequenceDuration is not a function"). `npm i @remotion/three@<versão do remotion>`.
- Render e stills com `--gl=angle` / chromiumOptions {gl:'angle'}. Texturas: TextureLoader dentro de delayRender/continueRender.
- Retrato 9:16: o limite é a LARGURA. Largura visível = 2·d·tan(fov/2)·0,5625. Peça de 1,0 com fov 30 ocupa ~70% da largura a d≈4,8. Câmera perto demais = peça cortada.
- Face impressa (adesivo da placa) fora da caixa de acrílico (z = espessura/2 + 0,0015) e com meshBasicMaterial toneMapped=false; dentro do material com transmission ela some (vira vidro fosco), e com meshStandard + ACES o vermelho da marca fica salmão.
- Celular "encostando" num objeto em cima de balcão: o balcão termina logo à frente do objeto, assim o celular pode descer na frente da borda sem atravessar o tampo.
- Troca de tela do celular (travada -> app -> 1..5 estrelas) = trocar a textura por quadro; mais barato e nítido que animar UI em 3D.

## Emendar uma continuação num vídeo já aprovado, sem retrabalho (MedicMais, 15/10/2026)
- Corte a voz antiga num silêncio entre palavras (fim da última palavra + ~0,2 s, fade de 80 ms), some 0,5 s de silêncio e cole a voz nova: uma faixa só (`locucao-completa.wav`), mixada numa passada (ducking e seções seguem sozinhos).
- Nas cues, a primeira cena nova começa EXATAMENTE no quadro em que a última cena aprovada acabava; assim ela fica idêntica (o push-in do Stage depende do `len`).
- Eventos da segunda locução com nome próprio (prefixo por bloco) e `g(i) = round((OFF + s_i) * 30)`; as cenas antigas não mudam.
- Reaproveite as peças (Phone, Logo, Star, Search, grade de cartões, Tag) e a cena de fecho; o que é novo é só conteúdo.
- Material do PDF do cliente vira imagem real com `pdfimages -png` (junte a máscara alfa `smask` com PIL); o logo oficial sai daí, nunca redesenhado.
- Vídeo do cliente que já tem legenda queimada: para mostrar "a nossa legenda", cubra a faixa da legenda dele com a nossa (caixa branca, Poppins 800), não amplie o vídeo (o rosto sai do quadro).

## Editor de vídeo falado: o que aprendi construindo (29/10/2026, base: curso Máquina de Edição IA + teste no bruto do Jerônimo)
- Pausa se mede pela ENERGIA do áudio, não pelo tempo das palavras do Whisper: ele estica a última palavra por cima do silêncio (no teste, "dias" ia até 3,36 s e a fala só voltava em 5,3 s). Corte deixa um respiro (0,18 s anúncio, 0,24 s conteúdo, 0,40 s aula), nunca zero.
- Vício de fala se compara SEM tirar acento: "ã" normalizado vira "a" (artigo) e o corte comia palavras reais.
- Tomada repetida: frase cujo começo é ≥ 70% igual a uma das 3 seguintes sai; fica a última. "de novo" e "pera" são ambíguos: só sugestão.
- Corte de pedaço sempre no quadro (múltiplo de 1/fps) e fade de 6 ms no áudio de cada junção: sem dessincronizar e sem estalo.
- Rosto: detector YuNet a 480 px + mediana 0,3 s + zona morta 3% + gaussiana 0,5 s = enquadramento que anda como operador, sem tremer.
- Troca de layout (tela cheia → moldura → só explicação): a caixa do apresentador interpola por mola crítica (w 0,26, ~20 quadros); sair de cena = descer para fora do quadro, NUNCA virar fantasma transparente sobre os cartões. Elementos da cena nova esperam ~12 quadros; a legenda some no meio da troca e reaparece no lugar novo.
- Vertical: moldura centrada (a coluna de botões do TikTok/Reels cobre a direita a partir de ~45% da altura); legenda nunca abaixo de ~84%. No split, legenda logo abaixo da emenda, ancorada pelo TOPO (ancorada pela base, a 2ª linha subia para dentro do vídeo).
- Texto de painel em 9:16 a 1080 de largura: título 80 px, item de lista 54 px, número 190 px. Menor que isso some no celular (o mesmo defeito que vimos nos estilos do Jerônimo).
- Legenda palavra a palavra sobre vídeo: o azul da marca some em camisa escura; a palavra ativa usa `destaqueLegenda` (amarelo claro), o azul fica para o papel.
- Revisão sem esperar render: Remotion Player num painel local tocando a composição direto do código; nota presa ao quadro exato vira pedido verificável (tempo + fala daquele trecho).

## Vitrine de estilos e recorte da pessoa (30/10/2026, vídeo do Jerônimo)
- Vítor achou o editor de estilos "simples, comum, todo mundo faz igual" e o painel "horrível": o padrão é o nível das aulas de física e do racismo ambiental. Estilo pronto aplicado sozinho NÃO é entrega de alto nível; precisa de uma ideia de direção por vídeo (aqui: o vídeo troca de estilo na palavra em que o estilo é nomeado, cinco versões tocando ao vivo como cartões e uma câmera passeando entre elas).
- Recorte da pessoa em CPU: rembg `u2net_human_seg` ~1 s/quadro com borda boa em cabelo curto (teste no bruto do Jerônimo); BiRefNet ~45 s/quadro, só para planos curtos. Suavizar a máscara no tempo e erodir 1 px tira o tremido e o halo. Com o recorte: palavra gigante ATRÁS da cabeça, troca do quarto por estúdio (wipe), objetos 3D que passam atrás e na frente (a cena 3D é desenhada duas vezes, metade de trás antes da pessoa, metade da frente depois).
- Palavra atrás da cabeça: o tamanho sai da largura (Archivo 800 a 125% ≈ 0,82 em por letra), senão corta nas bordas; texto de 2 linhas sobe para 5% da altura para a 1ª linha ficar acima da cabeça.
- Vários cartões com o mesmo vídeo: só UMA trilha de voz (cartões mudos), senão dá eco de fase.
- Recorte quadro a quadro (u2net) falha em mão, objeto segurado e pega pedaço do fundo: Vítor viu "cheio de falhas" (30/10). Padrão agora é RVM (Robust Video Matting, ONNX, ~0,4 s/quadro a 720p em CPU): modelo de VÍDEO com memória entre quadros, borda estável, mão e óculos inteiros. Aquecer a memória repetindo o 1º quadro 8 vezes.
- Texto sobre texto e camada da mesma cor (Vítor, 30/10): "BRUTO · SEM EDIÇÃO" caiu em cima da legenda. Toda interface de tela (REC, pílulas, rótulos) fica numa faixa própria no topo, e a legenda tem a faixa de baixo só para ela. Palavra atrás da cabeça: UMA palavra, só sobre fundo liso de contraste (estúdio), nunca sobre o quarto claro; no bruto não entra grafismo (bruto tem que parecer bruto). Se a cabeça tapa mais de ~1/3 da palavra, ela não se lê: troque por palavra mais longa ou mude a altura.
- COR DO TEMA, não cor genérica (Vítor, 30/10, ref. "RECENT EDITS" de Thiago A.): o que faltava nas nossas edições é paleta ligada à marca/assunto. Método: cor da marca ou objeto central → círculo cromático (papel creme ~42° se o tema é quente, tinta do mesmo matiz quase preta, acento = 2ª marca ou complementar dividida) → 60% papel / 30% tema+cinza / 10% tinta / acento ≤ 2%. Texto sempre em tinta; a cor do tema é forma, fundo de cena e sublinhado. Ferramenta `ferramentas/paleta/paleta.py`. Estudo completo: `motion-base/estudos/thiago-a-recent-edits/ESTUDO.md` (4 vozes tipográficas com papel fixo, colagem P&B em retícula, grafismo à mão que comenta a palavra, grão de papel, evento a cada ~0,75 s dentro de cenas de ~3,3 s).

## Vitrine do Jerônimo v5 → v6 (feedback do Vítor, 30/10/2026)
- **Efeito sonoro repetitivo irrita** (o problema não é o tom): som em cada palavra ("um transiente a cada 0,2 s" da referência) NÃO serve com voz falando. Regra: poucos efeitos, só nos momentos fortes, no máximo um a cada ~1,2 s, nunca o mesmo som duas vezes seguidas, alternando os tipos.
- **Música tem que aparecer.** Medir a faixa antes: a geminga começava a −50 LUFS e sumia sob a voz. Cortar a faixa num trecho cheio e normalizar (−16 LUFS) antes do ducking.
- **Objeto real > objeto desenhado por código.** "Programa de edição" desenhado ficou "IA"; usar print real (Wikimedia: DaVinci Resolve 17 com projeto vazio, CC BY-SA 4.0) impresso e colado no papel.
- **Leque atrás da cabeça falha quando a pessoa enche o quadro:** o rosto tampa as versões. Melhor: o vídeo principal encolhe para baixo e as versões abrem em cima.
- Carimbo com `multiply` some em fundo escuro: carimbo com fundo de papel.
- **Vídeo de vitrine de skills (Vítor 30/10/2026, ref. "8 Claude effects"):** mostrar o PROCESSO dentro do app do Claude
  (digita a skill → "Editando com…" → miniatura com dissolução em pixels → zoom para a tela cheia) vende mais que só os
  resultados. Música na frente e poucos efeitos. Ver `estudos/demo-skills-ref/ESTUDO.md`.
- **Bruto oficial do Jerônimo (Vítor 30/10/2026):** "começar com 0 editado e ir melhorando": cru com interface de câmera →
  na palavra "mesmo (assim)" uma linha varre o vídeo e deixa luz/cor tratadas (GRADE + luz quente no rosto + sombra de estúdio)
  → zoom suave que fixa o rosto (rosto.json). Cortes só em pausas ≥ 0,4 s; respiração curta entre frases fica (corte no lugar
  errado quebra o ritmo). Digitação no app: ~8 letras/s até o começo do nome e autocompletar; o app entra no FIM da frase
  anterior para ter tempo. Gráfico com impacto: colunas em cascata com mola + linha + número contando + etiqueta na ponta.
  Música: escolher pela semelhança com a referência (centroide, ataques, bandas) em vez de "energia".
- **"Parece de quem está aprendendo" (Jerônimo, 31/10/2026, comparando com a vitrine do edicaomia.com.br):** o que faltava
  era SISTEMA, não efeito. Um visual só do começo ao fim (fundo grafite, 1 destaque, texto claro), rótulo pequeno + título
  condensado enorme em 2 tons, cartões com borda de 1,5 px e 10% de branco, legenda pequena em caixa escura, pessoa sempre
  produzida (fundo trocado por estúdio com luz da cor do vídeo, cor tratada) inclusive dentro das versões (`baseCartoes`),
  movimento calmo (sem tremido de colagem). Colagem P&B fica para quando o cliente pedir esse universo. Tema 'estudio' na Vitrine.
  Estudo: `estudos/edicaomia-vitrine/ESTUDO.md`.
- **"Não ficou fluido" (Vítor 31/10/2026, v2 → v3):** medir a diferença quadro a quadro acha os saltos. Causas: (1) troca de
  posição por limiar (`sp > 0.5 ? a : b`) em vez de interpolar; (2) entrar no app com corte seco; (3) base de 25 qps. Correções:
  posições sempre interpoladas pela mola; app entra com fade de 6 quadros + mola; saída a 50 qps com o relógio da base
  (`useQuadroBase(fpsBase)` em kit.ts, prop `fpsSaida`), áudio e efeitos escalados por k = saída/base.
- **Legenda dinâmica do tema estúdio (31/10/2026):** blocos de 1 a 3 palavras, cada palavra sobe com mola quando é falada,
  a palavra mais forte (≥ 5 letras) em Bricolage Grotesque 800 condensada e na cor do tema, o resto em Geist 700 branco com
  sombra; sem caixa e sem karaokê. No trecho cru ("0 editado") a legenda é crua: branca, menor, sem destaque.
- **Divisão de tela profissional:** dois cartões arredondados (raio 40, margem e calha de 28 px, borda 1,5 px de 8% branco)
  sobre fundo quase preto, em vez de cortar a tela ao meio com uma fita.
- **Cores do estúdio:** grafite frio (#0D0E10) + luz de recorte neutra atrás da cabeça + toque leve da cor do tema embaixo.
  Brilho laranja forte atrás da pessoa deixa o fundo barrento. Fontes: Bricolage Grotesque (títulos) + Geist (texto).
- **"3D" num vídeo de edição = uso real de 3D, não formas soltas (Jerônimo 31/10/2026):** cubo, anel e esfera girando
  parecem enfeite. Mostre o que editor faz com 3D: mockup de celular 3D (`src/iphone/`, `Celulares3D.tsx`) entrando de
  costas e virando, com a tela mostrando o próprio vídeo editado. Texturas carregadas ANTES de montar o ThreeCanvas.
- **Vídeo falado estilo TikTok (pesquisa 31/10/2026, `estudos/talking-head-tiktok/ESTUDO.md`):** legenda no peito (~55–60%),
  palavra-chave maior com brilho, risco vermelho na palavra negada, selo #N por item da lista, ícone em círculo nos
  substantivos concretos, inserção em tela cheia com logo e print reais quando cita ferramenta, um evento a cada ~1,5 s.

# aula-otica

## 2026-10-05T06:00:17Z · Claude

Vídeo de ótica: refração e dispersão, prisma em 3D como gancho e como final, primeiro e último quadro em loop. Já sai renderizado.

_Anexos: aula-otica.mp4, ROTEIRO-ELEVENLABS.txt, previa-seguir.mp4_

## 2026-10-05T06:00:32Z · Claude

Começo pelo roteiro pronto pro ElevenLabs e pela cena 3D do prisma, reaproveitando o motor da aula de lançamento oblíquo.

## 2026-10-05T10:57:31Z · Claude

Vítor, a aula de ótica está pronta: [aula-otica.mp4](/mnt/project-files/pessoal-vitor/aula-otica/trabalho/renders/aula-otica.mp4) (2:03, horizontal). O último quadro é igual ao primeiro, então o vídeo fecha em loop.

**O que preciso de você:** a voz deste vídeo é provisória, de uma voz grátis. Cola o texto do [ROTEIRO-ELEVENLABS.txt](/mnt/project-files/pessoal-vitor/aula-otica/trabalho/roteiro/ROTEIRO-ELEVENLABS.txt) no ElevenLabs (a mesma voz do lançamento oblíquo) e me manda o mp3. Eu encaixo com um comando, que refaz o tempo, o som e as animações na sua voz e renderiza de novo. São umas 2h30 de render.

**Como ficou:**
- O gancho é um prisma 3D com a dispersão calculada de verdade, 16 cores com a lei de Snell em cada uma. A câmera desce até ficar exatamente de cima e vira a lousa 2D sem corte.
- Os 5 atos estão lá: n = c/v, Snell, a questão que cai na prova (θ₂ ≈ 37°), o ângulo limite (L ≈ 49°) com a fibra óptica em 3D, e a dispersão.
- O final volta ao prisma 3D. A luz apaga e a câmera volta ao quadro de abertura.
- Conferi as fórmulas e os valores de n.
- Nenhum texto fica em cima de linha nem sobre fundo da mesma cor. Conferi quadro a quadro nos pontos-chave.

**Crédito:** quase todo o custo foi tempo de render do 3D na nuvem, não texto. Para o próximo vídeo, o que mais simplifica é encurtar os planos 3D (o prisma leva uns 10 s por quadro). A lousa 2D e as fórmulas saem baratas.

**Na descrição, coloca:** Música: "Inspired" de Kevin MacLeod (incompetech.com), licença CC BY 4.0.

## 2026-10-05T15:21:48Z · Rei da VSL - Vítor

No máximo 5 hastags (é o limite de toda rede social) obrigatoriamente distintas entre si em categorias. Não pdoe ser "#enem e #enem2026"

## 2026-10-05T15:23:03Z · Claude

Sua narração já está encaixada e o vídeo está renderizando de novo. Não precisa fazer nada, te mando quando ficar pronto (umas 2h30).

- As animações e fórmulas seguem cada palavra da sua voz, no seu ritmo. Não cortei os seus silêncios.
- As pausas dos momentos visuais ficaram maiores, e a música sobe devagar nelas e abaixa antes de você voltar a falar. O vídeo ficou com 2:08.
- O "téta" ficou anotado para os próximos roteiros.

## 2026-10-05T15:23:22Z · Claude

Descrição do post da aula de ótica, no mesmo modelo da do lançamento oblíquo.

Esse vídeo foi feito com Claude

Refração e reflexão total caem em física no ENEM e nos vestibulares, e essa aula inteira foi criada pelo Claude (IA da Anthropic): roteiro, fórmulas, animações 3D, legendas e som. Eu não abri nenhum programa de edição.

🛠 COMO FOI FEITO
1. O Claude escreveu o roteiro da aula e conferiu cada fórmula e cada índice de refração.
2. A narração foi gerada na ElevenLabs a partir desse roteiro.
3. O Claude transcreveu a voz palavra por palavra, pra cada animação entrar no momento exato da fala.
4. O prisma 3D foi desenhado por código com shaders GLSL, sem modelo 3D pronto. A luz é calculada de verdade: 16 cores, cada uma com seu próprio índice de refração e a lei de Snell aplicada em cada face do vidro. O arco-íris que aparece não é efeito, é física.
5. A câmera desce até ficar exatamente em cima do prisma e o 3D vira a lousa 2D sem nenhum corte.
6. A fibra óptica também é 3D, com a luz quicando nas paredes por reflexão total.
7. Lousa, fórmulas, legendas e montagem em Remotion (vídeo feito com React).
8. Efeitos sonoros e mixagem por código: cada cor virou uma nota musical (vermelho grave, violeta agudo), então quando a luz se abre você escuta o arco-íris.

💬 O PROMPT (versão curta, pra você testar)
"Você é professor de física e editor de motion graphics. Crie uma aula curta e didática sobre refração da luz pro ENEM: lei de Snell, uma questão resolvida, ângulo limite e reflexão total, e termine na dispersão do prisma. Escreva o roteiro, monte as fórmulas na tela passo a passo, use exemplos visuais, legendas e trilha. Confira todas as fórmulas e me mostre os quadros-chave antes de renderizar."
Dica: peça em etapas (roteiro, depois quadros-chave, depois vídeo) e corrija cada etapa antes de seguir.

🧠 E A EDUCAÇÃO?
A IA não substitui o professor. Ela tira do caminho a parte cara de produzir aula boa. Um prisma 3D com a luz calculada cor por cor antes exigia estúdio e semanas de trabalho; agora cabe num prompt bem pensado. O desafio passa a ser saber perguntar e conferir. Quem aprender a usar IA pra estudar sai na frente no ENEM e no que vier depois.

📌 Salva pra revisar antes da prova e manda pra quem vai fazer o ENEM.

Música: "Inspired" de Kevin MacLeod (incompetech.com), licença CC BY 4.0, creativecommons.org/licenses/by/4.0/

Até o som das cores o Claude compôs 👀

#enem #enem2026 #vestibular #fisicaenem #fisica #optica #refracao #leidesnell #reflexaototal #dispersao #prisma #estudos #estudarparaoenem #claude #ia #[CHAVE APAGADA] #fyp #fy #foryou

## 2026-10-05T15:23:27Z · Claude

Combinado. Troca a última linha da descrição por esta, uma hashtag de cada categoria:

#enem #fisica #refracao #[CHAVE APAGADA] #estudos

As categorias são prova, matéria, tema da aula, IA e público de estudante. Deixei de fora #fyp, que não ajuda no alcance, para sobrar vaga para o tema.

## 2026-10-05T16:56:40Z · Rei da VSL - Vítor

Esperando...

## 2026-10-05T16:56:43Z · Claude

Entendi, você está esperando o vídeo. Vou ver em que ponto o render está agora.

## 2026-10-05T17:17:11Z · Claude

Faltam só os 8 segundos finais, que são o prisma 3D, a parte mais pesada (uns 10 s por quadro). Deve ficar pronto em uns 35 minutos. Te mando assim que terminar e eu conferir o loop.

## 2026-10-05T17:43:15Z · Claude

Pronto, com a sua voz: [aula-otica.mp4](/mnt/project-files/pessoal-vitor/aula-otica/trabalho/renders/aula-otica.mp4). Tem 2:08 e 25 MB, então baixa no celular. Conferi o loop: o último quadro é igual ao primeiro. A descrição é a que te mandei antes, com as 5 hashtags novas no final.

## 2026-10-05T17:49:51Z · Claude

Que bom que gostou! Entendi a crítica e anotei como regra para toda aula de conteúdo, de qualquer matéria. Cada etapa abre com uma frase falada que anuncia a virada, tipo "agora vamos ver as questões que mais caem na prova sobre isso", seguida de uma pausa com a música subindo e a tela mudando junto. O selo "CAI NA PROVA" sozinho não basta.

## 2026-10-05T17:50:48Z · Claude

Entendido, ajustei a regra. O que vale é a progressão de raciocínio. A frase de virada eu escolho em cada roteiro, pode ser pergunta, contraste ou "e se...", não precisa ser "agora vamos".

## 2026-10-05T17:53:39Z · Claude

Entendi: um chamado para seguir nas aulas, sem quebrar o loop. Vou olhar sua marca e desenhar o elemento primeiro.

## 2026-10-05T17:55:06Z · Rei da VSL - Vítor

precisa sim, ja que vc vai fazer me entregue um textinho no elevenlabs para eu colar e funcionar

## 2026-10-05T17:57:28Z · Claude

Criei o chamado para seguir. É uma pílula com a sua foto, o @vitormach._ e o botão "Seguir". Um cursor clica e ele vira "Seguindo ✓", com um clique e um sino baixinhos. Dura 3 segundos e entra no meio da aula, logo depois que a pessoa recebe a resposta da questão (θ₂ ≈ 37°). É a hora em que ela acabou de ganhar algo. O começo e o fim continuam iguais, então o loop não muda.

Veja como fica neste trecho de 6 segundos: [previa-seguir.mp4](/mnt/project-files/pessoal-vitor/aula-otica/trabalho/renders/previa-seguir.mp4). Ela fica no canto superior direito. Se você recortar o vertical pelo centro, ela pode sair do quadro, então me avisa se precisar de outra posição.

A partir de agora ela vai em toda aula. Para colocar na de ótica antes de postar amanhã, só re-renderizo esse trecho, coisa de uns 10 minutos.

## 2026-10-05T17:58:09Z · Claude

Aqui está a frase. Cola no ElevenLabs com a mesma voz da aula:

```
Acertou essa? Me segue, que a próxima cai mais ainda.
```

São uns 2,5 segundos. Ela entra junto com a pílula, logo depois da resposta dos 37 graus, e o clique no botão cai no "me segue". Quando você me mandar o áudio, encaixo na aula de ótica. O resto do vídeo anda uns 2,5 segundos para frente e o loop fica igual. A re-renderização vai desse ponto até o fim, por volta de 1h30, porque inclui o prisma 3D final.

Nas próximas aulas, essa frase já vai dentro do roteiro, então sai na mesma geração da narração. Guardei também 3 variações para não repetir a mesma frase sempre.

## 2026-10-05T20:11:14Z · Claude

Recebi a fala de seguir. Vou encaixar na aula de ótica junto com a pílula e re-renderizar a partir desse ponto.

## 2026-10-05T20:17:16Z · Rei da VSL - Vítor

pode colocar a minha foto de perfil tbm tlgd

## 2026-10-05T20:17:19Z · Claude

Já está: a pílula usa a sua foto de perfil, a mesma do TikTok, ao lado do @vitormach._ e do botão Seguir. Dá para ver na prévia que te mandei, e ela vai assim na versão final que está renderizando agora.

## 2026-10-05T20:24:34Z · Rei da VSL - Vítor

que horas vai? umas 19h ta renderizado ja?

## 2026-10-05T20:24:43Z · Claude

Sim, fica pronto antes das 19h. O trecho até a fibra óptica já renderizou. Faltam os 3 últimos blocos, que são o prisma 3D do final, a parte mais pesada. Devem terminar por volta das 18h45, e eu te mando assim que conferir o loop.

## 2026-10-05T21:16:32Z · Claude

Pronto, já com a fala e a pílula de seguir: [aula-otica.mp4](/mnt/project-files/pessoal-vitor/aula-otica/trabalho/renders/aula-otica.mp4) (2:13, 26 MB). A fala entra logo depois dos 37°, e o cursor clica no "Seguir" no momento em que você diz "me segue". Conferi o loop, e o último quadro continua igual ao primeiro.

## 2026-10-05T22:57:58Z · Rei da VSL - Vítor

e qual o trecho?

## 2026-10-05T22:58:10Z · Claude

Fica em **1:04 a 1:11** do vídeo. Em 1:04 aparece a resposta "θ₂ ≈ 37°" com a moldura verde. Em 1:06 você diz "Acertou essa? Me segue, que a próxima cai mais ainda!". A pílula entra em 1:06, o cursor clica em "Seguir" por volta de 1:07, junto com o "me segue", e ela sai em 1:09. A aula continua em 1:11 com "Chegou mais perto da normal".

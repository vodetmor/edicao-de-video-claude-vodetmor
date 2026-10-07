# shaders-glsl

## 2026-10-02T21:48:51Z · Rei da VSL - Vítor

Você já pensou em criar códigos TypeScript e GLSL? Eu acredito que você já tenha feito isso, mas é bom, pesquisa mais sobre como é que você pode criar a melhor forma possível. Ó, oh, eu vou te mandar um vídeo aí, você transcreve, lê, via YouTube DLP, é, que é um repositório aí que você consegue extrair os transcrições dos vídeos, né? Veja aí esse vídeo, porque ele mostra, a edição ficou maneiríssima, e aí você pode aprender alguma coisa com ela, porque teve TypeScript GLSL, tá? ficou foda, eu não sei se você já faz isso, e é interessante que você já inclua isso no seu parâmetro também, né? pra gente levar o nível das edições, entendeu? Elevar. E aqui é aquela coisa, né? Gostei muito do jeito que você fez. Que é você me dar um processo, ou seja, fazer um plano arquitetado e me entrega em PDF. Como é que você vai construir o vídeo? E você construir esse vídeo, então, assim, se você conseguir fazer isso, vamos dizer assim, cara, tá muito foda. Fecha esse vídeo. https://www.youtube.com/watch?v=CLD-GSpl5Q0

_Anexos: teste-3d-raymarching.png, plano-glsl.pdf, quadros-chave.pdf, isso-nao-foi-filmado.mp4, ROTEIRO-ELEVENLABS.md_

## 2026-10-02T21:49:00Z · Claude

Começo puxando a transcrição e os quadros do vídeo pra entender como ele usou TypeScript e GLSL.

## 2026-10-02T21:53:47Z · Claude

Consigo, sim. O nome disso é **raymarching**: em vez de modelar no Blender, eu descrevo o objeto como uma fórmula matemática e um shader GLSL calcula, pixel por pixel, onde a luz bate, a sombra suave, a oclusão nos cantos e o reflexo do ambiente. É exatamente o que fizeram no vídeo (o monstro, os clipes de papel e a sala do Ilya são isso, o código deles é público e já li tudo).

Acabei de testar dentro do nosso motor aqui na nuvem: um objeto 3D só de código, com sombra e reflexo calculados, em 1080p. Ficou [neste quadro](/mnt/project-files/estudio/glsl/testes/teste-3d-raymarching.png) (ainda é um teste cru, o enquadramento não está bom). Cada segundo de vídeo leva uns 20 s para renderizar, então dá pra fazer.

O vídeo que vou montar vai ter um objeto desses como peça principal. O plano em PDF sai primeiro, e depois eu construo.

## 2026-10-02T21:57:49Z · Rei da VSL - Vítor

Foda demais, mas você consegue adicionar aqui frames pra isso? Você consegue, sei lá, se eu te pedisse, se eu te pedisse pra você gerar é, um cavalo que corresse e ele fosse essa figura 3D aí, você conseguiria gerar aqui frames pra animar esse cavalo? Tipo assim, é cavalo é o nitidamente difícil de se modelar. Né? Eu não preciso que você modele o melhor cavalo. Eu só quero saber se você consegue. Porque se eu quero um vídeo realista de cavalo, eu peço para uma IA geradora de vídeo criar. No seu caso, eu estou pedindo para você criar um modelo 3D, o que muda muita coisa. E eu entendo a dificuldade que é principalmente feito por código. Eu não sei nem fazer isso. Nem pelo Blender, imagina, por código. É, então, eu tenho essa pergunta. Se é possível você animar esses modelos 3D e fazer coisas magníficas, como é que vai ser no futuro? Imagina você tendo você no futuro podendo, sei lá, criar filmes com isso. Fora que já existe MCP para o Blender, um monte de coisa, né? Cara, eu tô muito por dentro das IAs, mas ao mesmo tempo que eu tô dentro das IAs, eu não tenho dinheiro para poder pagar a API, eu queria poder fazer muita coisa, principalmente uma máquina de criativo e anúncios. Foi porque eu tô percebendo o seguinte, o que, imagina essa ideia. Eu te dou tudo, eu te dou uma API do Facebook Ads, eu te dou a API de criar vídeo, eu te dou o recurso para você editar vídeo, eu te dou o plano mais caro do Claude Code, eu te dou todas as disponibilidades. Aí eu falo o seguinte, pesquisa as ofertas mais em escala, é, pegue os vídeos, modele eles, poste nos gerenciadores de anúncios e faça vender. Conecte ao meu checkout faça as análises de métricas e eu só preciso ver a grana caindo no meu bolso. Isso já é possível porque eu já faço isso, né? A diferença é que eu não tenho dinheiro. Então, assim, eu não tô dizendo que isso é impossível ou possível. Isso eu já faço. A diferença é que eu faria mais rápido, e eu poderia ter mais dinheiro para gastar. Ah, Vitor, mas você tá dizendo então que você vai deixar a IA trabalhando sozinha? Não, né, caralho. Eu vou deixar você junto comigo e eu aprovando ou reprovando coisas que eu não gostar. Melhorando página de vendas, melhorando, enfim, a porra toda, até final. Eu não quero ver desgraça, eu quero ver um produto bom, né? Mas você entendeu o nível que eu quero chegar? Tipo assim, vai chegar um ponto que eu só vou precisar falar com voz com você, você vai me entregar tudo pronto. Né? A gente conversando como se fosse uma simples conversa, mas no final sai dinheiro entra dinheiro né? ou seja, eu gasto dinheiro para sair mais dinheiro. Você entra, ah, foda-se, você é uma IA, você deve

## 2026-10-02T21:58:06Z · Claude

Consigo, sim. Um cavalo correndo por código seria feito assim:

1. **Esqueleto:** uns 20 ossos (coluna, pescoço, quatro pernas com três articulações cada).
2. **Galope:** a pose de cada osso calculada em função do tempo, usando como base as fotos do Muybridge (1878), que já mostram quadro a quadro como as patas se movem num galope. O ciclo se repete sem emenda.
3. **Corpo:** cápsulas e elipsoides presos aos ossos e fundidos com aquela "união suave" do raymarching, para virar um corpo único, sem costura. Em cima entram sombra, luz e reflexo, igual ao teste dos anéis.

Ele não sai realista. Fica com cara de escultura: cerâmica, metal ou o estilo gravura do vídeo de referência. É exatamente onde o código ganha da IA de vídeo: forma perfeita, controle de cada quadro e cada passada presa a uma batida ou palavra. Vou fazer um teste curto do cavalo depois do vídeo-vitrine.

Sobre a máquina de anúncios: o caminho é esse, com você aprovando cada passo. Dá para ir montando com o que é grátis (motor, voz, pesquisa nas bibliotecas de anúncios) e plugar as APIs pagas quando o dinheiro entrar. Sua mensagem cortou no fim ("você deve..."). Se tinha mais coisa, manda de novo.

## 2026-10-02T21:58:50Z · Claude

O plano em PDF está pronto: [plano-glsl.pdf](/mnt/project-files/estudio/glsl/plano/plano-glsl.pdf). Não precisa aprovar, já estou construindo.

O principal: o vídeo de referência foi **programado**, não editado. O código dele é público e eu li tudo. O "uau" vem de três coisas juntas: uma ideia visual por frase, tudo cravado no tempo da voz e o GLSL fazendo o que o HTML não faz (luz calculada, 3D sem modelo, textura viva, acabamento de filme). O PDF traz o que levamos de cada técnica, a pesquisa de como encaixar no Remotion (já testado), a arquitetura em camadas e o plano a plano do vídeo de 28 s "Isso não foi filmado", com a locução já gravada e cada efeito preso a uma palavra.

## 2026-10-02T22:00:40Z · Rei da VSL - Vítor

Não precisa recriar o plano, não. Tá aprovado. Estou dizendo que isso para ficar na mente.

## 2026-10-02T22:00:59Z · Rei da VSL - Vítor

Eu tô querendo um, um motion graphics foda, tá? Tenta ver aí o que, que seria um motion graphics foda, tá?

## 2026-10-02T22:12:02Z · Claude

Preciso do seu OK nos quadros-chave antes de renderizar o vídeo completo: [quadros-chave.pdf](/mnt/project-files/estudio/glsl/keyframes/quadros-chave.pdf).

São 12 quadros reais, já saídos do motor (nada é rascunho), com o storytelling em 4 atos: provocação ("não foi filmado, não foi modelado"), revelação (o objeto vira fórmula, a luz, a sombra e o reflexo mudam cada um na sua palavra, e depois o pixel), expansão (o objeto afunda e vira tinta, o papel engole a cena, e o palco escuro mostra o acabamento de cinema lado a lado, sem e com) e assinatura ("Estúdio" com G, L, S, L batendo junto com a voz).

Se aprovar, eu coloco o motion blur no giro, o som e a revisão final, e entrego o vídeo. Se quiser trocar algum momento, me diz o número do quadro.

## 2026-10-02T22:12:29Z · Rei da VSL - Vítor

sim foda aprovadisso

## 2026-10-02T22:28:50Z · Claude

Entendido: plano aprovado, e o processo dos quadros-chave fica como regra (já salvei). Os quadros que mandei acima são desse vídeo.

Sobre motion "foda": nos quadros você vê as composições, mas o que separa motion bom de motion foda é o movimento entre eles. No render completo eu vou puxar isto:
1. **Nada parado:** a câmera não para nunca em volta do objeto, só desacelera nas pausas.
2. **Cada palavra muda o quadro inteiro:** luz, câmera ou forma, não só texto entrando.
3. **Motion blur de verdade** nos giros e nas batidas, calculado por subquadro, como no vídeo de referência.
4. **Um único objeto costurando tudo**, sem corte seco: ele vira fórmula, vira pixel, afunda, vira tinta e volta.
5. **Som cravado no quadro de cada ação.**

Se os quadros estiverem no caminho certo, me dá o OK que eu fecho o vídeo nesse nível.

## 2026-10-02T22:29:01Z · Claude

Aprovado. Vou fechar o vídeo: puxo as técnicas mais fortes das nossas referências, coloco motion blur e som, e renderizo.

## 2026-10-02T23:10:01Z · Rei da VSL - Vítor

te espero ainda está renderizando 853 quadros. e dispense o "teste cavalo galopando" kk

## 2026-10-02T23:40:30Z · Claude

Nada pendente com você. Teste do cavalo dispensado. O servidor reiniciou no meio do render e perdi o progresso (o código e o som estavam salvos). Recomecei em blocos de 2 s que ficam guardados na pasta do projeto, então outro reinício não zera mais nada. Te mando o vídeo assim que fechar.

## 2026-10-02T23:43:18Z · Rei da VSL - Vítor

ent ta so renderizando msm?

## 2026-10-02T23:43:28Z · Claude

Sim, só renderizando. O servidor reiniciou de novo no meio e zerou o render inteiro, que antes não salvava nada pela metade. Agora ele salva cada bloco de 2 s na pasta do projeto: o 1º bloco já fechou e o resto segue. Na nuvem não tem placa de vídeo, então cada quadro 3D é calculado no processador, e por isso demora.

## 2026-10-02T23:47:09Z · Rei da VSL - Vítor

alguma estimativa para quando vai me entregar? só apra eu ficar atento, sem pressa.

## 2026-10-02T23:47:14Z · Claude

Pela velocidade medida no 1º bloco (4,5 min para cada 2 s de vídeo), o render fecha por volta das **21h45** (horário de Brasília). Depois tem a revisão final, então a entrega fica perto das **22h15**. Se o servidor reiniciar de novo, atrasa só o bloco que estava no meio, porque o resto já fica salvo.

## 2026-10-02T23:47:42Z · Rei da VSL - Vítor

pode tirar a etapa de revisão. porque isso é só uma amostra, e eu quero ver.

## 2026-10-02T23:47:45Z · Claude

Combinado, sem revisão: te mando o vídeo assim que o render fechar, por volta das 21h45.

## 2026-10-03T00:44:05Z · Claude

Ficou pronto: [isso-nao-foi-filmado.mp4](/mnt/project-files/estudio/glsl/isso-nao-foi-filmado.mp4). São 28 s em 1920×1080, com áudio no padrão do projeto (−14 LUFS).

Tudo o que aparece é calculado pelo código: o objeto 3D, a luz, a sombra, o reflexo, o raio X, o pixel, a tinta e a transição. Cada mudança cai na palavra falada. A camada GLSL agora faz parte do motor e serve para qualquer vídeo daqui pra frente.

Me diz o que achou e o que você quer subir de nível.

## 2026-10-03T00:49:22Z · Rei da VSL - Vítor

top, mas narração de merda kk

## 2026-10-03T00:50:07Z · Claude

Concordo, kkk. A voz grátis do Edge serve para teste, não para entrega (já anotei como regra). A saída é a mesma do anúncio nota 10: a **Ana Dias** no ElevenLabs, que você gera no site.

Deixei o texto pronto em [ROTEIRO-ELEVENLABS.md](/mnt/project-files/estudio/glsl/trabalho/voz/ROTEIRO-ELEVENLABS.md): são 7 linhas, gera tudo de uma vez e me manda o mp3 aqui. Como todo o movimento está preso às palavras, eu só transcrevo a voz nova e as animações se reencaixam sozinhas no tempo dela. Aí eu refaço o som e renderizo de novo, sem refazer nada do visual.

## 2026-10-03T00:56:32Z · Rei da VSL - Vítor

o que acontece quando vc tenta usar a ana dias via api?

## 2026-10-03T00:56:43Z · Rei da VSL - Vítor

primeiro vc tenta claro, não fale de memoria

## 2026-10-03T00:57:21Z · Claude

A API recusa. No plano grátis, a ElevenLabs não libera as vozes da biblioteca da comunidade pela API, e a Ana Dias é uma delas. A chamada volta com erro de "precisa de plano pago" e não gera áudio. Isso aconteceu no anúncio do VSL Play, por isso você gerou as falas no site.

No site essas vozes funcionam no grátis, então o caminho continua sendo você gerar e me mandar o mp3. Se um dia assinar o Starter (cerca de US$ 5 por mês), a API libera e eu passo a gerar sozinho, frase por frase, já com o tempo de cada palavra.

## 2026-10-03T00:57:26Z · Claude

Justo. Vou testar agora de verdade na API com a Ana Dias e te mostro o resultado.

## 2026-10-03T00:59:05Z · Claude

Testei agora com a sua chave. A API recusa a Ana Dias no plano grátis.

- **Gerar com ela direto:** a API respondeu erro 402 com a mensagem "Free users cannot use library voices via the API. Please upgrade your subscription to use this voice."
- **Adicionar a voz na sua conta e tentar de novo:** ela entrou na sua lista "Minhas vozes", mas o pedido de áudio voltou com o mesmo 402. Testei os modelos multilingual v2 e flash v2.5 e o modo streaming, e os três foram recusados.

Ainda restam 8.238 caracteres no mês, então o limite não é o problema. O bloqueio é do tipo de voz. Pela API, o plano grátis só libera as vozes padrão da ElevenLabs, que eu já testei no anúncio do VSL Play.

No site a Ana Dias funciona no grátis. O caminho é você gerar o roteiro de 7 frases lá e me mandar o mp3.

## 2026-10-03T01:03:24Z · Rei da VSL - Vítor

bloco resolvido

## 2026-10-03T01:03:28Z · Claude

~~Entendi que você liberou a conta. Vou testar a Ana Dias na API de novo agora.~~ [Edit: entendi errado, você estava encerrando o assunto. O teste extra deu o mesmo 402, nada mudou. Fico esperando o mp3 da Ana Dias para refazer a narração.]

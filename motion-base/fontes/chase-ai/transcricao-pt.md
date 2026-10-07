# Transcrição em português: Chase AI, "vídeos com Claude Code + JavaScript"

Tradução fiel da fala (original em `transcricao-en.md`, com os tempos). Entre colchetes: o que aparece na tela.

## [00:00] Abertura
Você não precisa de Remotion, não precisa de After Effects. Só precisa do Claude Code e de JavaScript para criar vídeos assim. Explicativo visual, demo de produto ou motion graphics puro: esse tipo de vídeo está explodindo agora, porque é de graça. Não é um gerador de vídeo por IA. É só o Claude e JavaScript. Hoje vou mostrar como fazer: como escrever o prompt, como trazer imagens de referência e como transformar tudo isso numa skill que leva você do passo zero ao vídeo pronto.

Como o Claude consegue criar vídeo se não é uma ferramenta de geração de vídeo? Ele usa JavaScript, uma linguagem de programação, para criar imagens paradas. Cria um monte de imagens, junta todas, exporta como MP4. Eu pedi para ele criar um vídeo explicando como isso funciona, no estilo 3Blue1Brown, numa tentativa só:

> [vídeo de demonstração, narrado] "Esta animação não foi desenhada à mão e não é vídeo de IA. O Claude escreveu uma função. Dê a ela um tempo t e ela devolve uma imagem. Peça 60 imagens por segundo, toque em ordem, e isso é um vídeo. Mesmo t, mesma imagem, sempre. Então qualquer quadro pode ser redesenhado ou conferido sozinho. Um navegador sem janela desenha cada quadro, o FFmpeg junta tudo, e o som também é uma função de t. O Claude não consegue assistir ao vídeo, mas consegue olhar o quadro, achar o erro e consertar a função. O Claude nunca fez um vídeo. Ele escreveu o que o vídeo é: uma função do tempo."

## [01:49] Como funciona
Cada quadro do vídeo é gerado por código JavaScript. Aquele quadro que você viu é uma função em JavaScript. A cada segundo criamos 60 versões dele e juntamos: um segundo de vídeo. O legal é que o Claude Code confere o próprio trabalho: sejam 60 ou 240 quadros, rodamos o vídeo num navegador sem janela (headless) com algo como o Playwright. É como se o Claude Code tivesse o próprio Chrome para olhar. Ele olha quadro a quadro, diz "isso funciona, isso não, vamos consertar", e quando está satisfeito (ou você aprova) junta tudo com o FFmpeg, que é livre, e sai o vídeo. Dá para colocar som fácil: o vídeo que você viu teve a voz gerada no ElevenLabs. Primeiro ele criou o roteiro, depois os gráficos acompanharam. É tudo código, praticamente de graça: não pago ferramenta externa nenhuma.

## [03:07] Os 4 níveis
Nível 1: como funciona só com prompt. Nível 2: o laço em que ele confere o próprio trabalho. Nível 3: trazer referências, de vídeo ou de estilo por imagens. Nível 4: transformar tudo numa skill que eu fiz e estou entregando, que conduz o processo inteiro.

## [03:37] (Patrocínio: o curso pago dele, Chase AI+, com masterclass de Claude Code e Codex e o "AIOS" dele.)

## [04:07] Nível 1: prompt e nível de esforço
Dei ao Opus 5.5 um prompt simples: "faça um vídeo de motion graphics dinâmico de 15 segundos que mostre o motion designer incrível que você é, como um showreel de currículo, capriche, não use nenhuma skill". Testei em esforço low, high e ultracode. Low levou uns 20 minutos, high uns 30, ultracode levou 8 horas. Prestem atenção na diferença de qualidade: low e high foram bem. O ultracode foi o melhor, mas se você acha que o problema dos seus vídeos é esforço, provavelmente não é; provavelmente é o seu prompt. [mostra os três showreels: fundo claro, número gigante "89%", gráfico de barras com uma barra laranja, timecode e cantos de HUD, 1080p60, trilha de 128 BPM sintetizada em código, 8 cenas de um compasso cada, todo corte no tempo forte.]

Todos ficaram bons, até o low. A capacidade básica do Claude com JavaScript é muito forte; não precisa de prompt maluco para sair algo bom.

## [05:58] Peça um storyboard antes
Mas uma coisa melhora muito o resultado: pedir um storyboard. Antes de mandar o Claude criar um vídeo de 10, 15, 30, 60 segundos ou 5 minutos com um prompt só, peça para ele planejar: criar quadros individuais que representam as batidas do vídeo, para você pôr a mão antes de ele sair codando. Essas criações em JavaScript demoram, principalmente com o laço de conferência. Se eu peço um storyboard, ele me dá "estas são as 7 grandes cenas" e eu vejo os quadros antes de existir o vídeo, e mudo antes de qualquer código. O pior cenário é criar o vídeo inteiro, levar 20 minutos, você não gostar, tentar de novo, e cair num laço de uma a três horas de geração atrás de geração. Pedir storyboard antes economiza muito tempo. [mostra o storyboard "A video is a function": 46,45 s, 1920x1080, 120 BPM, 7 batidas; cada painel tem o tempo, o título, o som daquela batida e a transição para a próxima; "joinha ou não por número do painel".]

## [07:19] Nível 2: estrutura do prompt e dependências
[quadro "Nível 2: as ferramentas e um laço. Quatro linhas. O Claude descobre o resto."]
> Faça um explicativo animado de 30 segundos sobre como [TEMA] funciona, 16:9.
> Construa em JavaScript num canvas, com uma trilha gerada em código, e renderize para MP4 com Playwright e FFmpeg.
> (opcional) Aqui está minha locução: voice.mp3. Sincronize o visual com ela: pegue os tempos das palavras com Whisper e faça cada mudança cair nas palavras.
> Antes de dizer que terminou, use o FFmpeg para tirar uma folha de contatos, olhe, conserte o que estiver errado, renderize de novo e repita.

1) Diga a duração e o tipo de vídeo. 2) Diga o formato: tela cheia ou vertical para rede social. 3) Diga JavaScript. 4) A trilha: pode ser puro código (é o que a maioria usa), mas você pode dar a sua. Dá para trabalhar de trás para frente: no vídeo narrado, eu dei primeiro o áudio da narração e ele fez o visual casar com o áudio. 5) Peça para renderizar em MP4 com Playwright e FFmpeg: o Playwright roda o navegador sem janela para conferir se os quadros fazem sentido; o FFmpeg junta tudo. 6) Opcional: "aqui está a voz, sincronize". 7) No fim: "antes de terminar, tire uma folha de contatos com o FFmpeg, olhe, conserte, renderize e repita". Não precisa ser essa frase exata, mas em algum lugar você tem que dizer "confira seu trabalho antes de terminar".

O Opus 5.5 e o Fable 5.1 são tão bons que mesmo sem você falar isso eles provavelmente fazem, mas entenda como funciona para saber pedir quando não fizerem. Resumo: Playwright, FFmpeg, e decidir a ordem: visual primeiro e áudio depois, ou áudio (trilha ou narração) primeiro e o visual casando com ele. Para narração, ElevenLabs (acho o melhor; acabou de lançar o MCP; uns 5 dólares por mês), mas há muitas opções livres.

## [09:56] Nível 3: referências
Agora vamos além do prompt: imagens ("insira esta imagem" ou "copie a estética dela") ou vídeo ("use a composição deste vídeo como inspiração, com o nosso conteúdo"). O Claude é muito bom nisso. À esquerda, o vídeo de referência (feito com Opus 5.5 e Remotion, sobre a história da moeda); à direita, a nossa recriação em JavaScript, sobre a história da eletricidade. [Lado a lado: papel envelhecido, ano grande em serifa no topo, um objeto desenhado em traço fino no centro, legenda pequena.] A composição ficou muito próxima: parece da mesma família de design, mas o conteúdo é outro.

Onde achar inspiração: o site skillry.dev tem uma categoria de vídeos de IA (vídeos do Opus 5.5); é pago, mas no grátis dá para ver vários. E o Twitter: o Kevin (Kevin Ngo, @kevin_t_ngo) é provavelmente o melhor que existe nesse tipo de vídeo; vale olhar o perfil para ver o nível mais alto.

## [11:43] Nível 4: virar skill
Queremos um procedimento que o Claude repita sempre. O melhor jeito é uma skill, que é o que estou entregando: github.com/cth9191/animate. Ela usa esse formato JavaScript e conduz você. Vem com 7 estilos prontos: recorte de papel, hachura a nanquim, risografia, caderno de esboço, matemática, pixel e isométrico; e você cria estilos novos dando referência de imagem ou vídeo. As etapas: entrevista (assunto, formato, áudio, voz, um personagem-herói que aparece do primeiro ao último quadro), a história, o storyboard para ver cada cena antes de criar tudo, e por fim o código e a entrega. Durante todo o processo o Claude passa pelo vídeo para conferir se tudo sincroniza e faz sentido (o laço Playwright + FFmpeg), automaticamente. Você só responde as perguntas e dá as referências. Instalar é fácil: como plugin, ou entregue a URL ao Claude Code e ele faz tudo, inclusive conferir Playwright, FFmpeg, faster-whisper, e perguntar se você quer o conector do ElevenLabs. É um trabalho em andamento: se melhorar algo, abra um PR.

## [13:39] Fechamento
Esses vídeos em JavaScript são incríveis porque são praticamente de graça: pagamos só com o uso. Não precisa de gerador de imagem ou vídeo de terceiros. A qualidade é muito alta; só precisa saber escrever o prompt e dar referências.

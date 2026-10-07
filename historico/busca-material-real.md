# busca-material-real

## 2026-10-02T16:35:23Z · Claude

O mapeamento completo do Flow fica no [Automação Google Flow](#cmsg_01257unjkPWjtnQPA28xytUS3wxaKvHnuXnbZhukBbLmk8). A parte de buscar material real (estoque, notícias, referências) é outro trabalho, então vou abrir um tópico só pra ela.

_Anexos: BUSCA-MATERIAL-REAL.md, folha.jpg, busca.py_

## 2026-10-02T16:35:30Z · Claude

Vou testar quais bancos de imagem, vídeo e notícia funcionam daqui e montar uma busca única.

## 2026-10-02T16:50:42Z · Claude

Vítor, só falta uma coisa sua, e ela é opcional: criar uma chave grátis do **Pixabay** (faz conta em pixabay.com, abre pixabay.com/api/docs e me manda a "key"). O resto já está funcionando.

Montei o **buscador de material real**. Você diz o que quer e ele procura em várias fontes grátis ao mesmo tempo. Depois monta uma **folha de miniaturas numeradas**, com uma cor pra cada licença. Você escolhe os números, e ele baixa só esses e anota a licença de cada arquivo.

**O que funciona daqui (testei 25 sites):**
1. Vídeo e foto de estoque: Pexels, Mixkit, Openverse (Flickr) e Wikimedia
2. Arquivo histórico: Internet Archive, NASA e Biblioteca do Congresso dos EUA
3. Notícia: Google Notícias (manchetes) e Dailymotion, onde Band, Jovem Pan e Correio postam. Ele baixa, mas só em baixa qualidade (até 384p)
4. YouTube: só busca e link, porque o download é bloqueado daqui
5. Som e música: Freesound e Jamendo

Não funcionam daqui: Unsplash, Vecteezy, Videvo, Vimeo e Bing Imagens. O Coverr funciona, mas quase tudo lá é feito com IA.

**Prova real:** pedi "pessoa assistindo vídeo no celular", em vertical, pra criativo. Vieram 7 opções liberadas pra anúncio e baixei 2. Também busquei "enchente Porto Alegre" como notícia e baixei um trecho de telejornal do Dailymotion.

**Cores da folha:** verde pode ir em anúncio. Amarelo pode, mas com crédito. Azul é só referência (TV ou YouTube, não use em anúncio).

O guia está em `motion-base/BUSCA-MATERIAL-REAL.md`.

## 2026-10-02T20:44:16Z · Rei da VSL - Vítor

mas vc tem o pexels api ne q eu te dei

## 2026-10-02T20:44:20Z · Claude

Tenho sim, e já está em uso. As 4 opções de celular da prova vieram do Pexels com a sua chave. A que falta é a do **Pixabay**, que é outro site de estoque e serve só pra dar mais opções. Ela é opcional: sem ela o buscador já funciona.

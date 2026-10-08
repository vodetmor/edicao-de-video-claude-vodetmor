# Prompt de componentes bonitos (para colar em qualquer IA)

Versão 1 · 08/10/2026. Junta o que aprendemos nos vídeos do X (@twoclipping, @everestchris6, @notdwd, @charliejhills, @0xMovez, @rexan_wong), no estudo do Chase AI, no anúncio VSL Play v6 (nota 10) e nas aulas. Fontes completas no fim.

Como usar: copie tudo o que está dentro do bloco abaixo, preencha o `<pedido>` no final e cole na outra IA (Claude, ChatGPT, Gemini, Cursor). Se a IA tiver acesso a arquivos, mande junto 1 vídeo ou 5 quadros de referência. Quando um vídeo tiver identidade própria (cliente, aula escura), troque só o bloco `<identidade>`; o resto continua valendo.

```text
<papel>
Você é diretor de motion e engenheiro de interface. Faz vídeo e componentes animados em código
(Remotion, HTML + GSAP, canvas ou After Effects: use o que tiver). Cada decisão é julgada contra
o nível Apple / Dribbble, e o trabalho só termina quando aguenta ficar lado a lado com a referência.
</papel>

<como_trabalhar>
1. Referência antes de criatividade. Sem referência, você cai na média: texto centralizado,
   degradê, tudo entrando com fade. Se eu mandar vídeo ou quadros, meça com código (cortes pela
   diferença entre quadros, posição e tamanho por quadro, cores tiradas dos pixels, tempo de cada
   som) e escreva um SPEC antes de construir. Os quadros são a verdade.
2. Separe MANTER (tempo, cortes, câmera, curvas, posições, blur) de TROCAR (marca, cores, fontes,
   texto, telas). Escreva as regras visuais uma vez, num lugar só.
3. Storyboard em tabela antes de animar: tempo, o que aparece, para que serve o momento, som
   daquela batida e qual objeto atravessa para a cena seguinte.
4. Mostre stills antes do vídeo inteiro: abertura, composição principal, momento-vitrine, meio da
   transição mais rápida e quadro final. Confira cada um com zoom.
5. Todo valor animado é função do tempo: mesmo quadro, mesma imagem. Nada de timer, transição CSS
   ou Math.random sem semente.
6. Um crítico novo, que não viu a construção, revisa começando por rejeitar; nada sai abaixo de 8/10.
</como_trabalhar>

<identidade>
Direção Apple: contenção, tipografia precisa, um foco por vez, movimento com massa.
- Fundo claro "papel" #F2F1EE; tinta #111113; texto secundário #8A8A8E; linhas #D9D7D2;
  preto de palco #0B0B0C; branco #FFFFFF.
- UM acento só, chapado: azul (ex. #0071E3) ou a cor chapada da logo da marca. Uma cor = uma
  coisa: se o acento marca "clique", ele não marca mais nada.
- Fonte de leitura: Inter (400, 500, 600, 700). Fonte de impacto opcional: Archivo (900, largura
  condensada). No máximo 2 famílias. Nunca Thin ou Light na tela.
- Ícones Phosphor, todos com o mesmo peso de traço. Logos sempre o SVG real da marca, nunca
  redesenhado.
- Formas: squircle (cantos contínuos), não retângulo com raio comum.
</identidade>

<movimento>
Valores a 30 fps (a 60 fps divida por 2 os quadros e use k60 = 1 - sqrt(1 - k30)).
- Chega rápido, pousa suave: cada quadro percorre 12 a 19% da distância que falta.
  pos = alvo - (alvo - inicio) * (1 - k)^n, com k = 0,15 (n = quadros desde o início).
  Nunca velocidade constante, nunca parada seca.
- Molas em forma fechada (resposta ao degrau), por tipo de elemento:
    · UI rápida (botão, toggle, borda que lidera): w 0,35 rad/quadro, amortecimento 0,75 (~3% de passada)
    · padrão (card, container, câmera): amortecimento 1,0 (sem passada), resposta 0,3 a 0,4 s
    · pesado (tipo grande, logo, 3D): amortecimento 1,0, resposta 0,5 a 0,75 s
    · brincalhão (CTA, mascote): w 0,42, amortecimento 0,5 (passada visível), só um por vídeo
  Valor que muda de alvo várias vezes = soma de uma mola por mudança, cada uma no seu início.
- Curvas nomeadas (quando não for mola):
    · informação (legenda, rótulo, nome): cubic-bezier(0.2, 0, 0.38, 0.9)
    · vitrine / reveal: cubic-bezier(0.4, 0.14, 0.3, 1)
    · entra em cena: cubic-bezier(0, 0, 0.3, 1) · sai de cena: cubic-bezier(0.4, 0.14, 1, 1)
    · câmera entre "estações": ease-in-out simétrico (0.45, 0, 0.55, 1), ~1,3 s
  Nunca linear em posição ou escala. Nunca ease-in puro numa entrada.
- Durações: micro 4 a 6 quadros · padrão 9 a 12 · grande 15 a 23 · câmera 30 a 45.
  Mínimo de qualquer movimento 0,3 s.
- Stagger: itens do mesmo grupo entram 2 a 4 quadros um depois do outro.
- Sobreposição: a próxima ação começa 6 a 10 quadros antes da anterior assentar. Uma ação
  dominante por vez, com ações menores por baixo. O quadro nunca para e recomeça inteiro.
- Nada congela: em toda pausa, push-in lento de 0,04 a 0,25% de escala por quadro. Nenhum trecho
  parado acima de 8 quadros (só o quadro final).
- Leitura: texto fica parado ao menos 8 quadros e o tempo de ler 15 caracteres/s antes de se mexer.
- Nada nasce do nada: escala começa em 0,92 a 0,97 junto com a opacidade, nunca em 0. O que nasce
  de um elemento cresce a partir dele (origem do transform no elemento, não no centro da tela).
- Motion blur só durante a viagem, na direção e na velocidade do movimento, e some no pouso.
  Nunca misturar quadros através de um corte.
- Corte na batida ou 2 quadros antes; morph começa ~4 quadros antes. Grade comum: 120 BPM
  (colcheia = 7,5 quadros a 30 fps) ou a batida medida da música.
</movimento>

<componentes>
CARD
- Squircle, raio 28 px num quadro 1080p (40 px em 9:16 1080x1920), respiro interno 40 a 56 px.
- Fundo branco sobre papel, borda de 1 px #D9D7D2 OU sombra suave, nunca as duas:
  0 18px 40px rgba(17,17,19,0.12). Sombra é preta/tinta, nunca colorida, nunca glow.
- Entrada: sobe 24 a 40 px + escala 0,96 -> 1 com approach k 0,15, opacidade em 4 quadros.
  Grupo de cards: stagger 3 quadros e montagem progressiva, nunca três cards iguais lado a lado
  abaixo de um título (layout de template).
- O assunto ocupa o quadro: card pequeno flutuando no vazio é proibido; a câmera chega nele.

BOTÃO / CTA
- Pílula (raio 999), texto Inter 700, 54 px no 1080p, tracking -0,01 em, cor sólida do acento,
  texto branco, padding 34 x 72 px.
- Nasce com mola brincalhona (w 0,42 · amortecimento 0,5). Clique: o botão vai a 0,97 em 3
  quadros e volta com mola; um anel de 6 px abre de escala 1 a 1,35 e some em 16 quadros.
- Toda ação produz resultado visível: clique vira novo estado ("Seguir" -> "Seguindo ✓"),
  com som de clique no quadro exato do aperto.

CURSOR
- Seta real do sistema, caminho em curva (nunca reta), chega com approach e desacelera antes de
  clicar; pressiona 3 quadros antes do resultado. O cursor pode ser o fio condutor que muda de
  forma: cursor -> borda -> alça de seleção -> agulha da timeline -> sublinhado.

TIPOGRAFIA CINÉTICA (texto de impacto)
- Padrão aprovado: palavra sobe de uma máscara na linha de base (cada linha recortada pela
  própria caixa), stagger de 2 a 3 quadros por palavra, approach k 0,15. É o estilo que mais
  rendeu: texto que sobe da máscara + palavra que bate + objeto com mola.
- Palavra que bate (slam): uma palavra só, Archivo 900 condensada, 200 a 230 px, cai de escala
  2,4 para 1 com k 0,34, blur proporcional à velocidade, tremida curta de ~20 px que decai em
  3,5 quadros no impacto. No máximo 1 por frase.
- Palavra que demonstra o próprio verbo: QUICA quica, ESTICA estica, PARA para seco.
- Display grande (≥ 57 px) com tracking -0,02 em e entrelinha 1,05 a 1,15. Hierarquia por peso +
  tamanho juntos, nunca só tamanho.
- Palavras grandes entram de lados opostos e revelam a cena seguinte. Texto nunca em cima de
  imagem movimentada sem algo atrás para ler, nunca na mesma cor do fundo, nunca cortado ou
  atravessado por linha, eixo ou grade.

LEGENDA CONTÍNUA (fala)
- Inter 500, ~50 px no 1080p (4,6% da altura), entrelinha 1,2, tracking -0,01 em, branco 94%.
- Sombra curta preta: 0 2px 6px rgba(0,0,0,.55) + 0 0 1px rgba(0,0,0,.7). Em fundo muito claro,
  placa preta 55%, raio 10 px.
- Base da última linha a 87% da altura, centralizada, largura máx. 1200 px, até 2 linhas de 42
  caracteres, ≤ 17 caracteres/s, linha de baixo igual ou maior que a de cima.
- Entra: opacidade + subida de 6 px em 6 quadros (curva de informação). Sai: fade de 4 quadros.
- Proibido: palavra por palavra pulando, caixa colorida, karaokê, cor por palavra. Nunca cobre
  rosto; com tela dividida fica na emenda.

NÚMERO / CONTADOR / SELO
- Número gigante conta até o valor com a curva de vitrine; algarismos tabulares (sem tremer de
  largura) e alinhados (lining nums). Selo circular: o traço desenha, enche e recebe o número.
- Todo número tem fonte real, escrita pequena (23 px, cinza) no rodapé. Nada inventado.

GRÁFICO
- A linha se desenha com a câmera seguindo a ponta (zoom ~2,4x) e uma etiqueta de valor que
  troca de número; no fim a câmera abre e mostra o gráfico inteiro.
- Rótulo nunca cortado por eixo ou grade: vai para o espaço livre, com traço fino de chamada
  até o ponto.

ÍCONES E LOGOS
- Phosphor, mesmo peso em todos. Entrada: escala 0,92 -> 1 com mola padrão, sem rotação gratuita.
- Logo real; logo desconstruída: a peça-chave entra primeiro, as outras giram em volta do centro,
  letras nascem de máscara na linha de base, campos de cor sempre chapados.

INTERFACE DE PRODUTO
- Nunca desenhar UI de memória: copiar tamanhos, cores e ícones do CSS ou de prints reais
  (componente de terceiros = só doador de estrutura; cores, fontes e tempos vêm daqui).
- Morph de UI (estilo @twoclipping): uma forma nunca corta; botão -> loader -> check -> player ->
  slider -> toggle -> abas -> gráfico, mudando tamanho, raio e cor, com o conteúdo trocando por
  um blur curto. As duas bordas de um indicador andam em molas diferentes: a da frente estica.

ETIQUETA / CHAMADA / LOWER THIRD
- Rótulo Inter 600, 29 a 38 px, ligado ao objeto por linha fina de 2 px que se desenha antes do
  texto entrar. Fica acima de 72% da altura para não bater na legenda.

TRANSIÇÕES
- Handoff: o objeto em foco voa até a posição dele na cena seguinte com a MESMA curva e cai no
  mesmo pixel dos dois lados do corte.
- O que está na frente vira a transição: título ou objeto vem em direção à câmera enquanto a
  próxima cena já espera por baixo.
- Câmera contínua entre "estações" num mesmo espaço (poucos cortes, câmera viajando).
- Morph de forma: o mundo fecha numa janela no formato de um objeto, o objeto vira o equivalente
  do mundo novo e o novo abre dele. 1,2 s; no máximo 3 em vídeo de 30 s.
- Chicote (whip) com motion blur esconde troca de enquadramento.
- Corte seco só quando tamanho, direção e assunto casam dos dois lados.
- Fade puro só em legenda e para trocar algo de lugar quando o trajeto não diz nada.

FUNDO E TEXTURA
- Cor chapada por cena, trocando no corte, dá ritmo. Grão + vinheta discretos em camada
  overlay são permitidos; degradê decorativo não.
- Estilo desenhado (aula, explicação): traço que "ferve" redesenhado a cada 2 quadros,
  textura visível (papel, hachura, grafite), herói pequeno com rosto do início ao fim.

3D
- Só quando explica algo físico. Luz de estúdio macia de um lado + contraluz, material acetinado,
  sombra de borda macia, uma cor. Câmera entre 35° e 55°. Rótulos em HTML posicionados pelo 3D.
</componentes>

<ritmo>
- Quadro 1 já é imagem pronta, nunca palavra no meio do voo. Gancho nos primeiros segundos.
- 12 a 15 composições a cada 30 s, 1,4 a 3,5 s cada; algo novo a cada 2 a 4 s; variar escala
  (perto, aberto, de cima, tipo em tela cheia), nunca repetir o mesmo layout.
- Silêncio de 0,3 a 0,6 s antes do maior impacto; a pancada mais forte cai na virada.
- O fim é o começo mudado: último quadro casa com o primeiro (loop).
- Tem que fazer sentido sem som.
</ritmo>

<som>
- Som nasce da ação visível e cai no mesmo quadro: clique no aperto, pico do whoosh no pico do
  movimento, impacto no reveal. Whoosh lento: antecipe ~0,15 s e ponha um clique curto no quadro.
- Um whoosh curto por troca de cena real; nada de chuva de efeitos.
- Voz na frente, música 18 a 22 LU abaixo dela, voltando suave nas pausas. Master -14 LUFS,
  pico -1 dBTP.
</som>

<proibido>
Degradê decorativo, brilho de fundo (glow), vidro/translucidez, azul + roxo genérico, glow ou
contorno colorido em texto, tudo entrando com fade, explosão de partículas, glitch, zoom de
"impacto" repetido, UI falsa feita de retângulos, dado inventado, emoji na tela, travessão em
texto na tela, mais de um ponto focal por quadro, logo redesenhado, mola com quique exagerado em
interface, will-change em algo que a câmera escala (texto fica borrado), tempo morto.
</proibido>

<checagem_antes_de_entregar>
Meça, não olhe só: contact sheet a cada 0,2 s + quadros densos em volta de cada transição;
trechos parados (> 8 quadros); texto cortado, sobreposto ou fora da área segura (9:16: x 60 a
940, y 250 a 1500); contraste ≥ 4,5:1; som fora do seu quadro; loudness. Corrija o pior primeiro,
renderize só o que mudou e mande para um crítico novo, mantendo um registro de cada rodada.
</checagem_antes_de_entregar>

<pedido>
O que é: [componente, cena ou vídeo]
Formato: [16:9 1920x1080 ou 9:16 1080x1920, fps, duração]
Para quem e para quê: [público e ação final]
Marca: [logo SVG, cor chapada, fontes] (se nada for dito, use <identidade>)
Referência: [vídeo/quadros anexos ou "use só este prompt"]
Texto e fatos: [o texto exato; números só com fonte]
Comece pelo storyboard em tabela e pelos stills. Só anime depois que eu aprovar.
</pedido>
```

## De onde veio cada parte
- Números de motion, curvas e legenda: `DESIGN-SYSTEM.md` e `LICOES-MOTION.md` §2.
- Molas, kit e blocos reais: `estudio/motor/src/kit.tsx`, `theme.ts`, `motor/blocos/Slam.tsx`, `Botao.tsx`.
- Prompts do X: `fontes/x/PROMPTS-2026-10-02.md` (@twoclipping morph de UI, @everestchris6 princípios e régua de qualidade, @0xMovez molas por tipo), `fontes/x/notdwd-guia-motion-opus.md`, `fontes/x/artigos/charliejhills-*.md` (componente de terceiros como doador de estrutura).
- Cadência, morph de forma e estilo desenhado: `fontes/chase-ai/NOTAS.md`.
- Filtro de marca (cor chapada fica, degradê e glow saem): `fontes/ferramentas/extract-ds/NOTAS.md`.
- Pílula seguir e cursor que clica: `componentes/pilula-seguir/`.

# Estudo · antes/depois em tela dividida de T. Antonie (enviado pelo Vítor em 30/10/2026)

Vídeo vertical de vitrine: "antes" = pessoa falando crua; "depois" = tela dividida. Quadros em `folha.png` e `detalhe.png`
(o vídeo original não fica no repositório).

## O que tem
- **Formato:** metade de cima = painel azul-marinho tipo planta (blueprint) com mockups de interface; metade de baixo = a pessoa.
- **O painel se monta com a fala:** cada frase acende uma peça (quiz com barra de progresso, círculo de rede de pessoas,
  blocos de ícones, gráfico com ponto "Você" → "Destino" em verde). Nada fica parado mais de ~1 s.
- **Legenda grande e branca na emenda** entre as duas metades: a emenda vira a linha de leitura.
- **Barra de progresso e check** = "resultado" sem precisar de texto longo.

## O que ensina
1. A tela dividida é a forma mais barata de mostrar "o que eu digo" e "quem diz" ao mesmo tempo.
2. O painel não é decoração: cada peça é a palavra falada virando objeto de interface.
3. Uma barra que enche até 100% + check é um fecho visual universal de "deu certo".

## Como usamos (motion único da IA, `estudio/editor/remotion/src/MotionIA.tsx`)
Formato do Antonie + linguagem da colagem de Thiago A. (`../thiago-a-recent-edits/ESTUDO.md`): painel de papel
quadriculado em cima, janela de "programa de edição" que cai em stop-motion, carimbo NUNCA ABERTO na palavra "vida",
asterisco real do Claude, linha de corte que junta os clipes, barra QUALIDADE até 100% com check à mão. Ligado na Vitrine
por `palco.ia` (marcas presas às palavras). Legenda fica embaixo (87%), não na emenda: na vertical do Jerônimo a emenda
cai na testa dele.

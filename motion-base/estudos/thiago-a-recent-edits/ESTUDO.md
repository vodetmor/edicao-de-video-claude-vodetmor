# Estudo · "RECENT EDITS" de Thiago A. (editor de vídeo no X), enviado pelo Vítor em 30/10/2026

Vídeo de portfólio, 16:9 a 1280x720 e 29,97 fps. Três edits verticais tocam lado a lado, num laço de ~12,5 s que se repete.
Os edits são para a marca "Sessions" (marca d'água no topo), sobre IA, fundadores e startups. Medido aqui por código
(`folha-2fps.png`, `q*.png`; o vídeo original não fica no repositório). O Vítor chamou de "referência foda de edição e nível".

## O que faz isso parecer caro (medido)
| Camada | Medida | O que ensina |
|---|---|---|
| Ritmo | troca de cena a cada ~3,3 s em cada painel (7 trocas em 25 s); DENTRO da cena, algo entra a cada ~0,75 s | a cena dura, o motion interno é que dá o ritmo |
| Som | trilha sem voz no portfólio, −15,4 LUFS; batidas a cada ~0,75 s (≈ 80/160 BPM) e os elementos entram NA batida | motion preso ao tempo da música, como o nosso preso à palavra |
| Paleta | papel #CDC8B8/#DED9CF/#F6EDE2 ≈ 42% · cinzas quentes #B4AFA1/#6A6763 ≈ 20% · terracota #B04F33 15% · tinta #0E0C0B/#433630 ≈ 16% · verde #1D8372 1% | 60/30/10: neutro de papel, UMA cor de tema, tinta; acento mínimo |
| Cor = tema | terracota = cor da marca Claude/Anthropic; verde #1D8372 ≈ o verde da OpenAI; verde de dinheiro só na cena de dinheiro | a cor vem do ASSUNTO (marcas e objetos citados), não de um "azul padrão" |
| Tipografia | 4 vozes com função: serifa condensada alta ("ACTIONS", "COMPANY"), fita rotuladora preta ("founder"), recortes de papel tipo bilhete ("models,"), letra à mão de marcador ("TO DO LIST", "150 videos"), script ("we're in") | cada voz tem um papel: título, rótulo, citação, anotação |
| Imagem | colagem: fotos P&B em retícula (halftone) recortadas com borda de papel, objetos retrô (Macintosh, prédio, rolo de dinheiro), adesivos | material real tratado, nunca IA "bonita" |
| Grafismo | pincel vermelho sublinhando, setas e rabiscos à mão, asterisco/estrela (o símbolo do Claude), círculos concêntricos, scanline de CRT | o grafismo "comenta" a palavra, como a mão de um editor |
| Textura | grão de papel e de filme o tempo todo, vinheta leve | unifica fotos de origens diferentes |
| Movimento | entrada em stop-motion (poucos quadros, um pouco de tremido), objetos que se multiplicam (Macs tristes surgindo), números com contorno + preenchimento deslocado | imperfeição controlada = feito à mão |

## Metodologia para copiar o NÍVEL (não o visual)
1. **Tema → objetos e marcas.** Liste o que a fala cita (marcas, objetos, números, pessoas). Cada um vira um recorte REAL
   (logo SVG oficial, foto de banco livre em P&B com retícula, objeto recortado).
2. **Círculo cromático a partir do tema.** Pegue a cor da marca ou do objeto central (ex.: Claude = terracota). Monte:
   neutro de papel = a cor complementar quase sem saturação; tinta = o mesmo tom, muito escuro; acento = cor da 2ª marca
   ou a complementar dividida, usada em ≤ 2% da tela. Proporção 60 / 30 / 10. Ferramenta: `ferramentas/paleta/paleta.py`.
3. **Quatro vozes tipográficas com papel fixo:** título (serifa condensada), rótulo (fita preta ou caixa de papel), anotação
   (marcador à mão), número (serifa com contorno e preenchimento deslocado). Nunca mais de duas vozes no mesmo quadro.
4. **Uma cena por ideia, ~3 s; dentro dela um evento a cada ~0,75 s,** preso à palavra (ou à batida, se não houver voz).
5. **Grafismo que comenta:** sublinhado de pincel na palavra-chave, seta à mão apontando o objeto, círculo em volta do número.
6. **Textura única por cima de tudo** (grão de papel + grão de filme) para casar as fontes de imagem.
7. **Som:** cada entrada de elemento tem o seu som curto (papel, carimbo, clique de máquina de escrever, pop); a trilha
   tem pulso claro e os eventos caem na batida.

## Onde entra no nosso motor
- Cartões e grafismos do editor ganham um "tema" (`marca.json`: papel, tinta, cor de tema, acento, vozes tipográficas).
- O vídeo-vitrine do Jerônimo pode sair desse universo: papel + terracota do Claude + tinta, com a pessoa recortada e
  colada no papel, em vez do preto e branco genérico.

# Prompts para o Google Flow · vídeo "Racismo Ambiental"

Feito em 29/09/2026. São os 4 momentos de motion "caro" do vídeo, mais 2 planos de clima. O resto do vídeo é fala + fotos reais com Ken Burns.

## Antes de gerar: 5 regras

1. **IA só para clima e símbolo, nunca para "arquivo".** Não gerar foto histórica falsa (Providência 1897, Warren County 1982, enchentes reais). Num trabalho sobre um problema real, imagem inventada passando por documento é o que pode derrubar a credibilidade do grupo. Arquivo vem de acervo real (ver `FONTES-IMAGENS.md`).
2. **Sem rostos gerados.** Mãos, silhuetas de costas, pés na água, objetos. Rosto de IA em vídeo sobre racismo corre o risco de virar caricatura.
3. **Prompt em inglês** (o Veo entende melhor), 16:9, 8 s, **Veo 3.1 Fast** ou Quality. O plano grátis dá 50 créditos por dia; o Lite custa 10, então cabem ~5 takes por dia. Gere **2 takes** de cada e me mande os dois.
4. **Som do Flow: desligue ou ignore.** A trilha e os efeitos eu faço aqui, sincronizados no quadro. Se não der para desligar, tudo bem, eu tiro o áudio.
5. **Paleta do projeto** já está nos prompts: preto quente, sépia, vermelho-escuro só em detalhe, nada de azul/roxo neon, nada de brilho.

Bloco de estilo (já está colado em cada prompt; se o Flow deixar salvar "estilo", salve este):

```text
Documentary realism, shot on 35mm film, muted warm palette with deep blacks, slightly desaturated, soft natural light, fine film grain, no text, no logos, no people's faces visible.
```

---

## Momento 1 · A Terra girando (abertura do bloco histórico / virada)

Uso: fundo para a frase "Isso tem nome" ou para a entrada do título RACISMO AMBIENTAL. Câmera lenta, silêncio, só o drone grave.

**Opção A (texto → vídeo):**
```text
Extreme wide shot from space, the Earth slowly rotating in darkness, South America turning into view on the right side of the frame, the terminator line between day and night crossing the Atlantic, thin clouds over the Amazon, city lights beginning to glow along the Brazilian coast. The camera holds still with a very slow push-in. Photorealistic, like NASA satellite footage, deep black space with no stars glare, muted natural colors, no text, no logos.
```

**Opção B (quadros → vídeo, mais controle):** no Flow, use "Frames to Video" com a foto **Blue Marble da NASA** (domínio público) como primeiro quadro e deixe o último vazio.
```text
The camera slowly pushes in toward South America as the Earth rotates gently, clouds drifting over the Amazon rainforest, the Brazilian coastline sliding into the center of the frame. Smooth, steady, realistic satellite view, deep black space, muted natural colors, no text.
```

---

## Momento 2 · Zoom do espaço até a favela (Maria Eduarda ou Cainã)

**Recomendação: fazer este no Google Earth Studio, não no Flow.** O Earth Studio é grátis (Chrome no computador, conta Google), usa a imagem real de satélite e o mergulho sai no lugar certo: Brasil → Rio → Morro da Providência (a primeira favela do Brasil, que está no roteiro). O Flow inventa a geografia. A única exigência do Earth Studio é manter o crédito "Google Earth" visível na tela, e ele já põe isso sozinho no render.

Passo a passo no Earth Studio (5 minutos):
1. Entre em `earth.google.com/studio`, faça login e peça acesso (é automático na maioria das contas).
2. "New project" → **Quick Start → Zoom To**.
3. Local: `Morro da Providência, Rio de Janeiro`. Duração: **12 s**, 1920×1080, 30 fps.
4. Render → baixe o ZIP de imagens (ou o vídeo) e me mande.
5. Se der, faça um segundo com `Rocinha, Rio de Janeiro` e um terceiro com `Jardim Gramacho, Duque de Caxias` (antigo lixão).

Eu faço aqui a parte do motion: desacelero no fim com a nossa curva, ponho o nome do lugar em serifada, uma linha de chamada e a data 1897.

**Se quiser tentar no Flow mesmo (quadros → vídeo):** primeiro quadro = Blue Marble (NASA), último quadro = uma foto aérea real de favela (da Agência Brasil, licença CC BY, ver `FONTES-IMAGENS.md`).
```text
One continuous cinematic zoom from space down to the city: the camera dives from orbit through thin clouds toward the coast of Rio de Janeiro, the ocean and mountains growing larger, then descends over a dense hillside neighborhood of small brick houses stacked on the slope, ending on a steady aerial view looking down at the rooftops. Smooth acceleration then a gentle slowdown at the end. Realistic satellite and drone imagery, muted warm colors, no text, no logos.
```

---

## Momento 3 · O contraste: asfalto × periferia (Anna Augusta, tela dividida)

Dois planos com **o mesmo movimento de câmera**, para eu montar lado a lado. Gere os dois no mesmo dia, com a mesma duração.

**3A · bairro central**
```text
Slow aerial drone shot moving forward at a constant low speed over a wealthy city neighborhood: wide paved avenues, tall trees lining the streets, clean sidewalks, a park with green grass, apartment buildings with balconies. Overcast soft daylight. Documentary realism, shot on 35mm film, muted warm palette, slightly desaturated, fine film grain, no text, no logos, no faces visible.
```

**3B · periferia**
```text
Slow aerial drone shot moving forward at a constant low speed over a hillside peripheral neighborhood in Brazil: unpaved dirt roads, an open-air sewage channel running between small unfinished brick houses, exposed water tanks on the rooftops, very few trees, a small stream with trash along its banks. Overcast soft daylight. Documentary realism, shot on 35mm film, muted warm palette, slightly desaturated, fine film grain, no text, no logos, no faces visible.
```

---

## Momento 4 · O clímax: a água entrando em casa (fim da Anna Augusta)

Símbolo, não documento. Sem pessoas. É o plano que vai com o crescendo e o corte seco.

```text
Low angle close-up inside a simple house at night, muddy flood water slowly rising across a cement floor, a pair of child's sandals and a school notebook floating, a single bare light bulb flickering above and reflecting on the water. The camera slowly pushes in toward the notebook. Dark, dramatic, documentary realism, shot on 35mm film, deep blacks, muted warm tones, fine film grain, no text, no faces.
```

Alternativa mais contida (se a primeira ficar "filme de terror"):
```text
Static close-up of a doorway threshold of a simple brick house during heavy rain, brown flood water slowly flowing in over the doorstep and spreading across the cement floor. Overcast dim daylight, documentary realism, shot on 35mm film, muted warm palette, fine film grain, no text, no people.
```

---

## Planos de clima (abertura e fechamento com chuva)

**C1 · Rua alagada em câmera lenta (abre e fecha o vídeo)**
```text
Slow motion, low angle shot at street level on a flooded street in a Brazilian urban periphery during heavy rain at dusk, raindrops hitting the brown water surface, a lone street lamp reflecting, small brick houses and tangled electric wires in the background, out of focus. The camera slowly tracks forward just above the water. Documentary realism, shot on 35mm film, deep blacks, muted warm tones, fine film grain, no text, no faces visible.
```

**C2 · Virada da Maria Alice (esperança, sem rostos)**
```text
Close-up of many hands of different ages working together to lay bricks and plant seedlings in a community garden in a Brazilian neighborhood, morning golden light, dust in the air. The camera slowly dollies sideways along the hands. Warm, hopeful, documentary realism, shot on 35mm film, fine film grain, no text, no faces visible.
```

---

## Como me mandar

- Um arquivo por take, com o nome do momento: `m1-terra-a.mp4`, `m2-zoom-providencia.mp4`, `m3a-centro.mp4`, `m3b-periferia.mp4`, `m4-agua.mp4`, `c1-chuva.mp4`, `c2-maos.mp4`.
- Não precisa escolher o melhor: mande todos, eu escolho e corto o trecho bom (geralmente 3–5 s de cada).
- Tudo que for de IA vai para os créditos finais como "Imagens ilustrativas geradas com Google Flow (Veo)".

# Roteiro visual (`projeto/roteiro-visual.json`)

O Claude escreve; o código desenha. Leia a fala com tempos de `projeto/base-palavras.json` (resuma você mesmo em
frases; não precisa abrir mais nada). Tipos completos: `estudio/editor/remotion/src/tipos.ts`.

```json
{
 "estilo": "split",
 "formato": "9:16",
 "legenda": {"estilo": "limpa"},
 "cenas": [
  {"de": "mas", "ate": "esse:fim", "layout": "split", "elementos": [
    {"tipo": "titulo", "texto": "O que ninguém fala", "apoio": "como editar com qualidade", "de": "ninguém"},
    {"tipo": "passos", "itens": [{"texto": "Gravar", "icone": "video-camera", "de": "editar"},
                                 {"texto": "Editar", "icone": "scissors", "de": "vídeo"}]}]},
  {"de": "você pode", "layout": "cheio", "elementos": [{"tipo": "cta", "texto": "Quero acesso", "de": "acesso"}]}
 ],
 "zooms": [{"de": "qualidade", "nivel": 1.15}]
}
```

## Âncoras (todo `de`/`ate`)
`"palavra"` 1ª ocorrência · `"palavra#2"` 2ª · `"duas palavras"` sequência exata · `"palavra:fim"` fim dela ·
`"palavra+6"` / `"-6"` deslocamento em quadros · `"inicio"` · `"fim"` · `"2.5s"` · `"@45"` (quadro).
Âncora que não existe na fala dá erro claro na renderização: corrija pela transcrição, nunca adivinhe.

## Cenas e layouts
Fora das cenas vale o layout base do estilo. Cena sem `ate` dura até a próxima. Layouts: `cheio` (rosto em tela cheia,
elementos viram cartões por cima), `split` (rosto em cima), `split-cima` (painel em cima), `moldura` (rosto numa
moldura, quadro acima), `tela` (só a explicação; a voz continua). A troca de layout é animada (mola) e os elementos
da cena nova esperam o apresentador sair do caminho.

## Elementos
| tipo | campos | explica |
|---|---|---|
| `titulo` | texto, apoio? | o tema da cena (texto sobe da máscara) |
| `lista` | itens[{texto, de?, icone?}], icone? | itens que entram cada um na sua palavra |
| `numero` | valor, prefixo?, sufixo?, rotulo?, casas? | um número que conta até o valor (só número DITO ou real) |
| `passos` | itens[{texto, icone?, de?}] (2 a 4) | processo: nós ligados por uma linha que se desenha |
| `grafico` | pontos?, rotulo?, nota? | tendência; sem dados reais a nota "ilustrativo" fica visível |
| `comparar` | esquerda{titulo,texto,de?}, direita{...} | antes/depois, errado/certo |
| `icone` | icone, texto? | um conceito num ícone grande |
| `imagem` | arquivo ("assets/x.png"), legenda?, altura? | logo REAL, print real, foto |
| `cta` | texto, apoio? | o próximo passo, com tempo de leitura até o fim |

Ícones: nomes de `estudio/editor/remotion/icones.lista.txt` (`nome` cheio, `nome:linha` traço). Faltou um: acrescente
o nome do phosphoricons.com e rode `npm run icones`.

## Regras de direção
- Uma ideia por cena; um foco por quadro. Algo muda na tela a cada 3 a 8 s; nunca mais de 10 s iguais.
- O elemento entra na palavra que o nomeia, não antes. Título curto (até ~24 caracteres), apoio até ~40.
- Explicação com processo: mostre o processo acontecendo (`passos`, `lista` item a item), não só palavras grandes.
- No CTA volte ao rosto (`cheio` ou `split`): a pessoa convida, a tela confirma.
- `cheio` sem cena usa punch-in automático por frase (desligue com `"automatico": {"zooms": false}`).
- Nada de dado inventado: número, preço e resultado só se foram ditos ou estão no briefing.

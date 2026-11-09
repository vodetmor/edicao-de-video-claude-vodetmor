---
name: pdf-aprovacao
description: Gera o PDF bonito de aprovação de storytelling de um vídeo (capa, quadros-chave com tempo e ideia de uma linha, página de som, checklist "para aprovar"). Use depois de ter os quadros-chave (stills) de um vídeo novo e antes do render completo, ou quando pedirem "PDF de aprovação", "storyboard para aprovar" ou "plano para o cliente".
---

# PDF de aprovação (storytelling + quadros-chave)

É o portão de aprovação do método: o Vítor (ou o cliente) aprova a história e os quadros-chave ANTES do vídeo completo.
O visual é o dos PDFs que ele elogiou ("bonito demais, tá foda"), já na versão curta que ele pediu em 09/10/2026.

## Regra de ouro: curto e objetivo
O PDF vai para cliente que só passa o olho. Então:
- **Capa** (título, uma frase do formato, 1 a 3 quadros de vitrine, números ou atos da história).
- **1 página por vídeo** com os quadros-chave: código + tempo + legenda de UMA linha. Uma frase de "ideia" e, se ajudar, a faixa "jornada" (3 a 5 atos em uma linha cada).
- **1 página de som** (música, voz, volume final e a tabela momento → efeito sonoro).
- **1 página "Para aprovar"** com checkboxes e a dica "para ajustar, cite o código (ex.: muda o A05)".
- NUNCA: raciocínio longo, referências medidas, SPEC, tabelas técnicas. Isso fica interno (SPEC.md, ESTADO.md).

## Como usar
1. Tenha os quadros-chave em imagens (PNG ou JPG) numa pasta, ex.: `trabalho/plano/quadros/A01.png`.
   Nomeie por código: A01, A02… (vídeo A), B01… (vídeo B). O código é o que a pessoa cita para pedir ajuste.
2. Copie `exemplo/plano.json` para a pasta do trabalho e preencha (caminhos de imagem relativos ao plano.json).
3. Rode:
   ```
   python gera_pdf.py caminho/plano.json            # gera aprovacao.html + o PDF ao lado do plano.json
   python gera_pdf.py caminho/plano.json --so-html  # só o HTML, para conferir no navegador
   ```
   Não precisa instalar nada: o PDF sai do Chrome ou do Edge que já estão no PC (modo headless).
   Se não achar o navegador, defina `CHROME=caminho\do\chrome.exe` (ou msedge.exe).
4. Confira o PDF (página por página) antes de mandar. Sobrou texto? Corte.

## O plano.json
| Campo | O que é |
|---|---|
| `titulo`, `arquivo`, `rodape` | título do documento, nome do PDF, texto do rodapé (o número da página entra sozinho) |
| `formato` | proporção dos quadros: `9:16`, `4:5`, `1:1` ou `16:9`. A grade se ajusta sozinha e quebra em mais páginas quando há muitos quadros (máx. por página: 16 em 9:16, 10 em 4:5 e 1:1, 8 em 16:9; mude com `quadros_por_pagina`) |
| `tema` | cores e fonte de título da marca. Sem `tema` sai a direção Apple do DESIGN-SYSTEM (fundo claro, um azul, Inter). Chaves: `acento`, `acento_texto`, `sobre_acento`, `fundo`, `cartao`, `linha`, `tinta`, `tinta_2`, `cinza`, `escuro`, `papel`, `papel_2`, `fonte_titulo` (`Inter` ou `Archivo`), `titulo_caixa_alta`, `capa_escura`, `aprovar_escura` |
| `capa` | `chamada`, `titulo`, `titulo_destaque` (linha na cor de destaque), `texto`, `logo`, `logo_altura_mm`, `imagens` (1 a 3), e `numeros` (um por vídeo) OU `atos` (a história em 3 a 5 atos). Use um dos dois |
| `videos[]` | `etiqueta` (ex.: "Criativo 01 · 25 s · 15 cenas"), `titulo`, `ideia`, `jornada[]` (`titulo`, `texto`), `quadros[]` (`id`, `t`, `legenda`, `img`) |
| `som` | `titulo`, `texto`, `cartoes[]` (`titulo`, `texto`), `efeitos` (lista de pares `[momento, efeito]`) |
| `aprovar` | `titulo`, `itens[]` (`texto`, `nota` opcional), `nota_final` |

Textos aceitam `<b>` (negrito) e `<em>` (cor de destaque). O resto é escapado.

## Gosto (DESIGN-SYSTEM)
- Sem degradê, brilho, vidro ou azul+roxo. Uma cor de destaque só.
- Logo real da marca (PNG/SVG do cliente), nunca redesenhado.
- Sem travessão (—) e sem emoji no texto. Legendas de uma linha, em português simples.
- Cada marca tem seu `tema` (ex.: Rei da VSL = preto, papel e ouro `#DCB906` com Archivo; MedicMais = vermelho `#EB2026`).

## Arquivos
- `gera_pdf.py`: monta o HTML e imprime o PDF (A4 deitado).
- `template/estilo.css`: o visual de todas as páginas (mexa aqui para mudar todos os PDFs).
- `fontes/`: Inter e Archivo (licença OFL, arquivos `OFL-*.txt`).
- `exemplo/`: `plano.json` completo (criativos Rei da VSL), quadros e o PDF gerado `exemplo-aprovacao.pdf`.

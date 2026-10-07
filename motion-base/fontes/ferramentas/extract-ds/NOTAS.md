# extract-ds (Rodrigo Tadewald) · avaliação de 07/10/2026

Fonte: https://github.com/rtadewald/skills/tree/main/extract-ds · cópia em `skills/extract-ds/` (ver ORIGEM.md, repo sem licença).
Teste real: site do cliente VSL Play (vslplay.com, WordPress + Elementor), arquivos em `teste-vslplay/`.

## 1. O que ela faz de verdade

Não é um "extrator de tokens". É um roteiro para o agente **copiar um site pronto que já está numa pasta local** e virar um catálogo HTML vivo, em duas etapas com aprovação:

1. **Overview**: copia o projeto inteiro para `<marca>-design-system/assets/overview/`, troca o título do hero por "<Marca> Design System", troca a copy de marketing por Lorem Ipsum e abre tudo num `design-system.html` com a navbar original e as abas Overview | Components. Para e pede aprovação.
2. **Components**: depois do OK, monta o catálogo a partir do HTML/CSS reais: Backgrounds vivos (com a animação original), cores agrupadas por função (Surfaces, Brand, Text, Borders, States), tipografia em linhas (papel | amostra viva | font-size do CSS), ícones, botões e componentes. Para e pede o segundo OK.

Regras fortes dela: copiar, nunca redesenhar; nunca inventar token ou variante; não abrir navegador nem tirar print (a validação visual é do usuário). É feita para **sites e apps** (o autor usa como base para agentes criarem novas telas no mesmo estilo).

**Limites que o teste mostrou**
- Ela recebe uma pasta, não uma URL. Site de cliente precisa ser baixado antes. Funcionou com `wget -p -k -E -H -D <dominio>,fonts.googleapis.com,fonts.gstatic.com -e robots=off <url>` (34 MB, 137 arquivos, abre offline por `file://` fiel ao original, fontes reais incluídas).
- A saída é HTML para olhar, não dados. O motor precisa de números (JSON). Falta uma ponte, e é essa ponte que nos interessa (seção 3).
- Em Elementor a navbar real não sai limpa; usei uma navbar derivada (a skill permite). A navbar original ficou duplicada dentro do Overview (a skill manda esconder; ajuste fácil).
- No navegador da nuvem o site AO VIVO não carregou as fontes (Roboto caiu para a fonte do sistema); a cópia local carregou. Medir sempre na cópia local.
- Variáveis CSS do WordPress (`--wp--preset--color-*`) são padrão do tema, não da marca. Ignorar; a marca sai dos estilos computados.

## 2. O que o teste encontrou no VSL Play (medido, `teste-vslplay/tema-bruto.json`)

| Função | Valor | Observação |
|---|---|---|
| Fundo principal | `#000C39` navy | maior área da página |
| Superfícies | `#1E2952`, `#192554`, `#2A3665` | cards e faixas |
| Faixa clara | `#FFFFFF`, `#EFEFEF` | logos e depoimentos |
| Acento da marca | `#5D6CF9` índigo | botões, abas, contornos |
| CTA secundário | `#E04DF2` magenta | botão Login, CTA do hero |
| Texto sobre navy | `#D5D5D5`, `#FFFFFF`, lavanda `#C8D4FF` | |
| Fonte | Roboto 700 (títulos, 51 px, caixa alta no hero) / 400 (texto 18 px) / 900 (botões 16 px) | |
| Raios | 10 px botões, 999 px pílulas | |
| Efeitos | título em degradê azul→roxo, glow verde/âmbar nos planos | proibidos pela nossa P1 |

Achado importante: a identidade do SITE é exatamente o "azul+roxo com degradê e brilho" que o Vítor odeia. O anúncio nota 10 usou as cores da LOGO (coral, ciano, violeta chapados), não as do site. Logo: extrair a identidade não é copiar; ela passa pelo nosso filtro de gosto.

## 3. Onde encaixa no método

Referências → **SPEC** → plano. A extração entra como a parte de **identidade** da SPEC de qualquer trabalho de cliente que tenha site:
1. Baixar o site (wget acima) para `clientes/<cliente>/identidade/site/` (fora do Git se pesado).
2. `node ponte-tokens.mjs file://.../index.html <saida>` mede cores por área, fontes por quantidade de texto, tamanhos, raios, sombras, botões + print da página inteira.
3. Filtro de gosto (DESIGN-SYSTEM §2): cores chapadas da marca ficam; degradê vira a cor dominante dele; glow sai; fonte do site vira fonte de título se for boa (senão Inter), legenda continua Inter 500.
4. Resultado: `tema.json` do cliente + uma página-catálogo (a da extract-ds) que o Vítor aprova junto com os quadros-chave.
5. Para fazer um SITE para o cliente, aí sim a extract-ds completa vale como está (catálogo vivo para o agente construir páginas novas no mesmo estilo).

## 4. Proposta para o motor (não aplicada; esperando o OK do Vítor)

Hoje `estudio/motor/src/theme.ts` tem a paleta do VSL Play travada no código e as specs pedem cores por nome (`"cor": "coral"`, `"fundo": "paper"`). Proposta:
- `estudio/motor/temas/<cliente>.json` com papéis fixos: `fundo, superficie, texto, textoSuave, linha, acento, acento2, alerta` + `fonteTitulo, pesoTitulo, fonteTexto, raio` + `fonte` (url e data da medição).
- A spec ganha `"tema": "vslplay-site"`. O `Video.tsx` mistura o tema por cima de `C` (os nomes antigos continuam funcionando, então nada quebra) e carrega a fonte do tema pelo `@remotion/google-fonts`.
- A ponte gera o rascunho do tema; um humano (ou a sessão) escolhe os papéis olhando o catálogo. Nunca 100% automático: o peso por área confunde fundo com marca.
- Ganho: um criativo vira N clientes trocando uma linha da spec; `fabrica.mjs` já renderiza variantes em lote.

Exemplo de tema medido do site (rascunho):
```json
{"id": "vslplay-site", "fonte": {"url": "https://www.vslplay.com", "medido": "2026-10-07"},
 "cores": {"fundo": "#000C39", "superficie": "#1E2952", "texto": "#FFFFFF", "textoSuave": "#C8D4FF",
           "linha": "#2A3665", "acento": "#5D6CF9", "acento2": "#E04DF2", "claro": "#EFEFEF"},
 "fonteTitulo": "Roboto", "pesoTitulo": 700, "fonteTexto": "Inter", "raio": 10}
```

## 5. Do mesmo autor, para olhar depois
O repositório tem também `img-to-html` (mock em imagem → HTML com etapas e aprovação), `plan-screen`, `to-wireframe` e `mediabunny` (áudio/vídeo no navegador). O README cita `ds-from-react`/`ds-from-html` que ainda não estão publicados.

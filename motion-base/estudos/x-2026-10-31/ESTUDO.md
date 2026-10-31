# Pesquisa no X · edição de vídeo falado com IA (31/10/2026)

Busca somente leitura pelo twitter-cli no PC do Vítor: 22 consultas, 259 posts únicos, 25 relevantes.
Resultados brutos (JSON) em `motion-base/fontes/x/busca-2026-10-31/` no PC dele; vídeos baixados com `xler.py`
em `motion-base/fontes/x/videos/` (nome = autor-id).
Lição de busca: `OR` sem parênteses faz o `min_faves` valer só para o último termo (veio jogo, política, fã-edit);
frase exata + min_faves alto volta vazio. Use `(a OR b) termo min_faves:N filter:videos`.

## Referências medidas
| Post | O que é | Medida / técnica |
|---|---|---|
| @rom1trs 2075193811186172355 (1,3 mil ❤) | skill que clona edit viral (clip cru + vídeo ref) | **8 trocas de cena em 9 s**; fundo de cartaz chapado trocando a cada frase; letra condensada gigante ATRÁS da pessoa recortada; papelão; lousa com setas de giz apontando o rosto; olho de peixe; rabiscos amarelos à mão (círculo, sublinhado) |
| @joshaeeee 2103386096411553888 (1,7 mil) | relançamento reeditado pelo Opus 5.5 vs humano | colagem editorial em papel creme; adesivos recortados; serifa itálica + display pesado magenta; número gigante com círculo à mão; bilhete manuscrito; cenas ilustradas em tela cheia |
| @mreflow 2114061786404307119 | 2º vídeo 100% editado por IA, sem instrução, só A-roll + link de um vídeo de referência | **cold open de ~6 s de b-roll** antes do rosto; legenda em CAIXA ALTA 2–3 palavras no terço de CIMA; cartões de dados em tela cheia (barras comparando, destaque na linha dele) |
| @DesignSorceress 2115712741268746339 | tutorial de anúncio feito com Claude, editado com Claude | gancho = palavra da marca gigante sobre a pessoa no quadro 0; legenda 1–2 palavras no topo; corte a cada ~2,6 s alternando rosto e print real em cartão sobre fundo chapado; CTA em pílula amarela "Comente X" |
| @francescoinweb3 2111393917899808880 (2 mil) | prompt liberado: "6 trabalhos pequenos" | referência→`spec.md` (por que funciona: ritmo, 1º movimento, cortes) · dados→`data.json` com fonte · história→`story.md` (1 ponto, 1 número herói, 3 batidas) · motion→`Scene.tsx` · direção→`timing.ts` (nota em palavras muda 1 linha) · entrega→stills checados contra spec e dados, espera aprovação |
| @charliejhills 2105682280765350117 | Opus 5.5 vs Astra vs Fable no mesmo bruto | 1) mesma filmagem + referência 2) cortar pausas e transformar palavras em visual 3) revisar os primeiros 10 s e corrigir rodada a rodada; "a câmera desliza entre tela cheia, um cartão e um círculo pequeno" |
| @HyperFrames_ / @petergyang | copiar estilo de um short de referência | a referência vira estrutura; muda fonte e cor, mantém a ideia estrutural |
| @Voxyz_ai motion-prompt (MIT) | 144 movimentos com nome + spec + código | pedir movimento POR NOME |
| @iamashtonchew | crítica ao Remotion lento / "slop" | render pesado = poucos efeitos por quadro; nós: filtros SVG custam, usar com parcimônia |

## O que mudou na nossa forma de editar
1. Gancho = demonstrar a promessa no primeiro segundo (3 cartazes em 1,4 s), nada de introdução, nada de REC.
2. Troca de fundo POR FRASE como ritmo (16 cenas em 31 s ≈ 1 a cada 1,9 s), com "tapa" de escala 1,035→1 na troca.
3. Pessoa como ADESIVO (borda branca 7 px + sombra dura deslocada), não pessoa "flutuando" em fundo escuro.
4. Rabisco à mão sempre com função: X no programa que ele nunca abriu, círculo em "alta qualidade", setas apontando
   o rosto em "não foi só ele".
5. Mostrar o BRUTO real por 0,7 s no meio ("e mesmo assim") = antes/depois dentro do próprio vídeo.
6. 3D com função de vitrine: carrossel de cartazes de versões girando, os de trás passam ATRÁS do recorte.
7. Legenda em fita de etiqueta preta (Inter 800, 50 px, 3 palavras), fora do gancho.
8. Música nova escolhida por papel: "Spark of Inspiration" (ViraMiller, CC BY 4.0, 112 BPM, energia desde o 1º segundo);
   −20 LU sob a voz, volta nas pausas. Crédito: Música "Spark of Inspiration" de ViraMiller (Freesound), CC BY 4.0.

Código: `estudio/editor/remotion/src/Cartaz.tsx` (composição "Cartaz"), `renderizar.mjs --cartaz <json>`.

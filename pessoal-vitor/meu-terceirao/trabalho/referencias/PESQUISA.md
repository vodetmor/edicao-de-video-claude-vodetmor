# Meu Terceirão · plano de composição audiovisual (PILOTO "Tempo Perdido")

## Contexto
Vídeo de formatura (até 5 min, horizontal 16:9) das turmas 232 e 231, sem fala. A emoção vem de fotos e vídeos da turma, tipografia da letra da música e motion design, com sensação de saudade, cortando na batida. Esta etapa entrega só a composição (o que aparece, quando e como se sente). Como será executado em código fica para depois: o Vítor vai mudar o modelo de execução.
Decidido: piloto de ~60 s com **Tempo Perdido** (Legião Urbana, 5:02) para mostrar como fica. A outra música (Pelo Tempo Que Durar, 3:20) entra como segundo piloto só se ele pedir. Música já baixada em MP3 (`pessoal-vitor/meu-terceirao/trabalho/musica/`).

## O que já existe (inventário real, 232)
- 45 fotos: **31 horizontais** (1600x1200) e **14 verticais** (1200x1600; uma 1066x1600).
- 15 vídeos: 13 horizontais 1024x576 (de 6 s a 82 s) e 2 verticais 464x832 (um de 32 s).
- **231: pasta vazia.** O piloto tem que funcionar só com a 232; a 231 entra depois sem refazer nada.
- Conteúdo visto: dia de fantasia (anos 20, rock, boné, cigarro de papel), foto do grupo na escadaria amarela com moletom creme "TERCEIRÃO", trio no auditório de cadeiras azuis vazio, camisa verde "TERCEIRÃO", cartaz "Mini Terceirinho" com fotos de bebê na parede, lousa de aula de arte (Dadaísmo, Futurismo...).
- As fotos **são de épocas diferentes** (o "2026" dos nomes é só a data em que foram salvas do WhatsApp). Os arquivos perderam a data original, então a **ordem cronológica precisa ser definida por pista visual (uniforme, moletom, fantasia, bebê) e confirmada pelo Vítor**. Isso dá o arco dos 5 atos "Antes -> hoje" de verdade.

## Música e letra (Tempo Perdido)
Letra de memória; **conferir por transcrição com tempo por palavra antes de qualquer tempo ser fixado** (skill `transcrever-audio`). Blocos:
1. "Todos os dias quando acordo / não tenho mais o tempo que passou / mas tenho muito tempo / temos todo o tempo do mundo"
2. "Todos os dias antes de dormir / lembro e esqueço como foi o dia" ("sempre em frente, não temos tempo a perder")
3. "Nosso suor sagrado..." (trecho forte, 'selvagem')
4. "Veja o sol dessa manhã tão cinza..."
5. "Então me abraça forte / e diz mais uma vez / que já estamos distantes de tudo / temos nosso próprio tempo" (x3)
6. "Não tenho medo do escuro / mas deixe as luzes acesas agora ..."
7. "Nem foi tempo perdido / somos tão jovens"

Ideia-mãe: **o vídeo responde ao título.** A música se chama "tempo perdido" e o vídeo prova que "nem foi tempo perdido". A última linha, "nem foi tempo perdido, somos tão jovens", é o clímax (e a única hora em que a imagem quase para).

## Linguagem visual (proposta, o Vítor decide)
- **Sensação:** projetor de slides / álbum que se abre. Quente, desbotado, lento onde a letra é lenta, seco onde a batida bate.
- **Cor:** fundo preto quente; foto com grade quente e preto levantado; tipografia creme. Cores de identidade da turma: creme e azul-marinho do moletom, verde da camisa. **Hex exatos a medir das fotos** (regra do projeto), nada de chute.
- **Tipografia (máx. 2 famílias):** serifa itálica de personalidade para a letra (ex.: Instrument Serif), Inter só para microtexto. Minúsculas, grandes, uma linha por vez.
- **Textura:** grão de filme fino e tremida mínima de 2 quadros na troca de slide. Sem glow, sem degradê decorativo, sem vidro, sem azul+roxo, sem emoji, sem travessão (DESIGN-SYSTEM §2). Vinheta suave só se o Vítor aprovar (é a fronteira de P1).
- **Foto:** nunca esticar. Horizontal ocupa a tela com Ken Burns 1,00 -> 1,06 (1600 px dá folga em 1080p). Vertical vai **em dupla ou tripla lado a lado**, ou com palavra gigante ao lado.
- **Vídeo (1024x576):** só dentro de moldura (~60% da tela) para não amolecer, câmera lenta ~50% (a saudade é lenta), grão por cima. Os verticais 464x832 só como elemento pequeno ou fora.
- **Cor como emoção:** o piloto começa quase P&B desbotado e a cor volta quando a letra diz "tenho muito tempo / temos todo o tempo do mundo".

## Vocabulário de cenas (as 6 composições que se repetem)
| Código | Composição | Uso |
|---|---|---|
| A | **Slide:** foto full-bleed + Ken Burns, troca seca na batida | base |
| B | **Palavra gigante atrás** (tempo, abraça, nosso, jovens), foto com moldura na frente (recorte da pessoa opcional, "wow") | palavra-chave da letra |
| C | **Dupla/tripla** de verticais que entram juntas e se encostam | abraços, amigos |
| D | **Mural:** 1 -> 4 -> 12 fotos pousando uma por batida, câmera recua e revela o todo | "temos nosso próprio tempo" x3 |
| E | **Clipe em moldura** em câmera lenta com a linha da letra embaixo | movimento, risada |
| F | **Foto imóvel + letra quase parada** | clímax e final |

## PILOTO ~60 s (corte editado da música, não os 60 primeiros segundos)
Tempos relativos; os absolutos saem da transcrição. O corte entre os blocos cai em compasso, com crossfade de música.

| Rel. | Letra | Composição | Fotos/vídeos (da 232) | Sensação |
|---|---|---|---|---|
| 0:00-0:08 | intro instrumental | A em P&B, 1 foto a cada 2 batidas, som de carrossel de slide, **sem texto** | cartaz Mini Terceirinho, sala, lousa | o álbum abrindo |
| 0:08-0:28 | bloco 1 inteiro | B + A: uma linha por vez, palavras entram no tempo da voz; "tempo" gigante; **a cor volta em "temos todo o tempo do mundo"** | cotidiano de sala, grupo com fantasia | calma, depois calor |
| 0:28-0:42 | "então me abraça forte... distantes de tudo" | C + E: duplas de verticais se encostam em "abraça"; 1 clipe em câmera lenta | trio no auditório, par de fantasia, abraços | ternura |
| 0:42-0:52 | "temos nosso próprio tempo" x3 | D: 1, 4, 12 fotos, uma por batida; a 3ª repetição recua a câmera e revela o mural | todas as variações | a turma inteira junta |
| 0:52-1:02 | "nem foi tempo perdido / somos tão jovens" | F: **foto da escadaria**, quase parada; "somos tão jovens" entra palavra a palavra; música cai; fade para preto | escadaria (moldura do moletom) | o nó na garganta |

Critério de pronto do piloto: cada corte numa batida, nenhuma palavra fora do tempo da voz, nada congelado fora do clímax, nenhuma foto esticada, e o momento da cor voltando gera reação.

## Vídeo completo (até 5 min) em 5 atos, seguindo a música
Tempo Perdido tem 5:02: cortar a intro e terminar em fade ≤ 5:00.
1. **Antes** (bloco 1): bebê, primeiro dia, P&B. Precisa de fotos antigas.
2. **Dia a dia** (blocos 2-3): sala, lousa, uniforme, intervalos. Ritmo sobe.
3. **A bagunça boa** (4): fantasias, risada, vídeos em câmera lenta. Pico de cor.
4. **Nós** (5 x3): murais, grupo por grupo, 231 e 232 se encontrando no mesmo mural.
5. **Daqui pra frente** (6-7): auditório vazio (cadeiras esperando), escadaria, "somos tão jovens", fade.
Regra: todas ou quase todas as fotos passam, horizontais com mais tempo de tela, verticais em duplas. 45+ fotos x ~4,8 min cabem com folga; o Mural (D) absorve o excedente.

## Referências
- **X (twitter-cli):** 10+ buscas (kinetic typography, nostalgia, saudade, formatura, slideshow). Retorno **inútil**: só posts de ferramentas de IA para vídeo. Pinterest MCP devolveu vazio. Conclusão honesta: não achei referência boa no X, não vou forçar.
- **YouTube (a baixar e medir ao executar, `yt-dlp` + SPEC):** "Ed Sheeran - Photograph (Kinetic Typography)" (q_EjiXSduJg), "Legião Urbana - Tempo Perdido (Tipografia)" (mQe_CESAEjk), "Hozier - Eat Your Young Kinetic Typography" (bVXATN0Qh-I), "Vídeo Formatura - TERCEIRÃO" (k2jVXSE2AKU, para ver o que NÃO fazer). Salvar em `pessoal-vitor/meu-terceirao/trabalho/referencias/`.
- **Interna:** `motion-base/estudos/tinocandotv/ESTUDO.md` (câmera contínua por um mural, palavra gigante atrás, "entrar na foto") e LICOES-MOTION (bola que quica = movimento na batida). Para o Mural (D) e para a palavra gigante (B).

## Riscos e críticas (sinalizo antes de executar)
1. **Direitos da música:** Legião Urbana é obra protegida. Piloto interno e exibição em evento fechado é uso comum; publicar no YouTube/Instagram pode ser derrubado. Decidir antes do final.
2. **Letra de memória:** se a letra na tela errar uma palavra, quebra a emoção. Só vale a letra validada por transcrição.
3. **Datas perdidas:** sem a data original, a linha do tempo depende de classificação visual + confirmação do Vítor (quais fotos são "antes", "meio", "agora"). Se ele tiver fotos mais antigas ainda (infância), o ato 1 fica mais forte.
4. **Baixa resolução dos vídeos** (1024x576 e 464x832): regra de moldura acima.
5. **Fotos da turma com cigarro de papel (fantasia):** em formatura com famílias e escola, confirmar se ficam ou saem.
6. "Tempo Perdido" é uma letra de rock politizado ("sangue amargo", "selvagem") e não só terna. Funciona pelo refrão e pelo "somos tão jovens"; o piloto usa só esses trechos.

## Pendências do Vítor (decisões, nenhuma bloqueia o piloto)
- Aprovar ou ajustar este storyboard em tabela (portão do método) antes do render.
- Indicar a ordem/época das fotos (antigas, meio, recentes), ou autorizar que eu proponha pela aparência.
- Opcional: fotos de infância e o cartaz Mini Terceirinho original.
- Logo da escola (SVG real) e nome oficial para o fecho.
- Fantasia com cigarro de papel: fica ou sai.

## Passo 0 ao sair do plan mode: salvar a pesquisa no PC (pedido do Vítor)
Em `pessoal-vitor/meu-terceirao/trabalho/referencias/`: `PESQUISA.md` (este plano + inventário + links + resultados das buscas do X/Pinterest/YouTube), `letra-tempo-perdido.md` (rascunho a validar) e `ESTADO.md` do trabalho. Sem baixar vídeo de terceiros ainda, só os links. Depois commit com caminho explícito.

## Verificação (quando for executar)
1. Transcrever Tempo Perdido com tempo por palavra e fixar os blocos.
2. Gerar 5 quadros-chave (um por linha da tabela do piloto) e aprovar com o Vítor **antes** do vídeo.
3. Render prévia 720p, medir loudness (-14 LUFS), conferir "ficou como o plano?" quadro a quadro, crítica por sessão nova ≥ 8/10, depois 1080p.
4. Salvar lições em `motion-base/LICOES-MOTION.md` e `ESTADO.md` em `pessoal-vitor/meu-terceirao/trabalho/`.

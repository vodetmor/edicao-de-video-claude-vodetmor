# Estudo TinocandoTV e referências de documentário (05/11/2026)

Pedido do Vítor: "os vídeos do TinocandoTV são feras em edição, é isso que eu quero". Decisão anterior dele (29/09/2026) continua valendo: replicar a gramática de edição, nunca logo, nome, imagens ou identidade do canal.
Estudo anterior, mais detalhado em texto e som do Kafka: `pessoal-vitor/escola-consciencia-negra/edicao/SPEC.md`.
Folhas de quadros: `folhas/` (só no PC, fora do Git, porque são imagens de terceiros e o repositório é público).

## Números medidos

Detecção de cena em 12 fps, 320 px, limiar 0,27. Número aproximado: pega corte seco, não pega fusão, morph nem câmera contínua. Serve para comparar ritmo, não como contagem exata.

| Vídeo | Data | Views | Duração | Cortes/min | Plano mediano | 10% mais longos | Minuto mín/máx |
|---|---|---:|---:|---:|---:|---:|---|
| Tinoco: Judas (`tCXQDKOPPAo`) | 26/07/2026 | 805 mil | 29:28 | 11,0 | 4,25 s | > 10,6 s | 2 / 19 |
| Tinoco: Kafka (`-A_8YE1tipI`) | 27/09/2026 | 722 mil | 20:30 | 11,1 | 4,42 s | > 10,8 s | 6 / 17 |
| Tinoco: Bunker (`FiedBtuANW8`) | 03/10/2026 | 582 mil | 20:59 | 10,5 | 5,17 s | > 9,9 s | 8 / 15 |
| Tinoco: Canudos (`7LBpmjircD4`) | 24/10/2026 | 519 mil | 26:55 | 11,0 | 5,00 s | > 9,4 s | 7 / 15 |
| fern (`MqCk9APctNk`) | 03/05/2026 | 4,4 mi | 30:02 | 11,6 | 1,83 s | > 14,5 s | 1 / 49 |
| Johnny Harris (`O7LvhSQ5Te4`) | 10/09/2026 | 3,7 mi | 51:11 | 11,4 | 3,50 s | > 11,8 s | 3 / 29 |
| LEMMiNO (`kd2KEHvK-q8`) | 14/04/2019 | 30 mi | 24:54 | 1,0 (inválido) | n/a | n/a | n/a |

LEMMiNO: o número não vale como ritmo. O detector não enxerga a montagem dele; a leitura precisa ser feita olhando os quadros.
Loudness medido em 480p variou de -29,9 a -15,9 LUFS entre os três vídeos do Tinoco medidos. Dado inconsistente demais para virar alvo: nosso master continua -14 LUFS.

## O que os números dizem

1. **Os três canais têm a mesma média (11 cortes/min). A diferença é a distribuição.** Tinoco é constante, com ondas moderadas. Fern e Johnny Harris alternam rajadas (até 49 e 29 cortes/min) com planos longos. Não copiar a média: copiar a distribuição do estilo escolhido.
2. **O ritmo do Tinoco é estável entre vídeos** (10,5 a 11,1/min em 4 vídeos): é sistema de produção, não inspiração de cada vídeo.
3. **Revisão da regra anterior:** o DESIGN-SYSTEM cita 7 a 22 cortes/min medidos só no Kafka. Em 4 vídeos, a mediana fica em 10 a 11, com pico entre 15 e 19. O 22 do estudo antigo usou outro limiar e outra resolução.

## O que os quadros mostram (leitura visual, não medida)

1. **Texto entre as camadas da imagem ("parallax"):** no trecho que a direção do canal usa como padrão na vaga de editor (Judas, 1:14; post em `https://x.com/Wendel_Torlien/status/2084381232012431487`), a palavra "JESUS" fica atrás da cruz, e "CRUCIFICADO" é cortada pelo corpo. Imagem recortada em fundo, texto e sujeito é a assinatura. Um editor que se candidatou chama de "estilo Parallax, o estilo que o canal usa".
2. **Identidade por vídeo, não paleta fixa:** Canudos é sépia e papel envelhecido; Bunker é azul-aço e preto; Judas usa pintura a óleo com verde e dourado. A paleta "marrom + vermelho" do nosso SPEC era só do Kafka.
3. **Fonte por tema, sistema fixo:** a fonte de título muda (art nouveau em Judas, gótica e serifada em Bunker), mas a estrutura se repete: etiqueta com nome de pessoa, data ou lugar, capítulo e citação.
4. **Rajada tipográfica:** frases-chave montam palavra a palavra em cima da imagem, com a palavra forte muito maior.
5. **Mapa, documento e planta:** mapas desenhados por cima de papel, recortes de jornal, planta 3D simples do bunker. O conteúdo vira objeto visual.
6. **A-roll mantido simples:** mesmo cenário, com punch-ins; o trabalho visual fica no B-roll.
7. **Abertura repetida:** patrocínio, preto, aviso sobre uso de IA, assinatura, gancho. O aviso diz que IA foi usada como apoio, com direção e verificação humanas.
8. **Equipe real:** nos créditos do Bunker aparecem direção de edição, edição, pesquisa de imagens, revisão histórica e arte de vitrine. A Gazeta SP cita cerca de 20 pessoas no documentário da Grécia. O diferencial é sistema e pesquisa, não um truque.

## O que isso muda para nós

- **Maior lacuna técnica do motor:** não temos bloco de "texto entre camadas". Peças necessárias: recorte automático do sujeito, preenchimento do fundo, profundidade e câmera 2,5D. Ainda não testado. Próximo passo sugerido: prova de 20 segundos.
- **Para ofertas e criativos:** a técnica serve em VSL e anúncio narrado (foto recortada + palavra-chave atrás), mas a edição em ondas de 5 s é para vídeo longo. Criativo curto segue a regra de legibilidade já aprovada pelo Vítor.

## Fila de estudo

| Fonte | Por que vale | Estado |
|---|---|---|
| `https://x.com/naometzger/status/2117702547742060670` | "4 dias ensinando o Claude a editar como a Vox": camadas e parallax, Claude lendo arquivo do After Effects, treino com tutoriais | Só o texto foi lido; vídeo não assistido |
| `https://x.com/WaterrrMiao/status/2116233882584666208` | Documentário de 7 min no HyperFrames no estilo Fern: agente mede ritmo e proporção de 3D, diagrama, documento e filmagem | Só o texto foi lido. Texto de quem vende a ferramenta: confirmar antes de acreditar |
| `https://x.com/BruzakaMotion/status/2084636971343729085` | 3 testes de estilo Tinocando feitos por um editor | Não assistido |
| fern, Johnny Harris, LEMMiNO | Topo internacional em documentário | Folhas de quadros no PC; falta leitura técnica |
| Vídeos de membros do Tinoco (Newton, Getúlio, Césio) | Mais amostra | Bloqueados: só para membros |

Busca do Firecrawl indisponível nesta pesquisa (erro 402, crédito). Fontes externas usadas: X, YouTube e `https://www.gazetasp.com.br/entretenimento/tinocando-tv-lanca-documentario-epico-de-1h42-sobre-a-grecia-antiga/`.

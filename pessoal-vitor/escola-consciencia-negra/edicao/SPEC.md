# SPEC · Estudo da referência "A triste história de Franz Kafka" (Tinoco)

Estudo feito em 29/09/2026 sobre o MP4 enviado pelo Vítor (`/mnt/project-files/YTDown.com_..._FRANZ-KAFKA_001_1080p.mp4`).
Objetivo: entender a gramática de edição, som e texto para **se inspirar, nunca copiar**. Nada de marca, layout exato ou identidade do canal vai para o nosso vídeo.

Material de apoio em `referencia/`: folhas de quadros (`intro1`, `intro2` = 0:00–2:00; `s300` = 5:00; `s600` = 10:00; `s1080` = 18:00; `s1170` = 19:30–20:30), espectrogramas do áudio (`spec_intro`, `spec_end`) e `cortes-segundos.txt` (tempo de cada corte detectado).

## 1. Números medidos

| Item | Valor | Como medi |
|---|---|---|
| Duração | 20:30 | ffmpeg |
| Formato | 1920×1080, 24 fps, AAC 44,1 kHz estéreo | ffmpeg |
| Cortes duros | 234 (≈ 11 por minuto) | detecção de cena (limiar 0,3) |
| Duração do plano | mediana 4,2 s · 10% abaixo de 1,1 s · 10% acima de 10,8 s | intervalos entre cortes |
| Minuto mais rápido | 18:00–19:00, com 22 cortes (clímax: morte e "Queime tudo") | cortes por minuto |
| Minuto mais lento | 20:00–20:30, com 4 cortes (créditos) | cortes por minuto |
| Fundo escuro | ≈ `#211311` (marrom quase preto) | amostra de pixels |
| Destaque | vermelho escuro ≈ `#83251A` (logo e citações); vira ≈ `#B0552B` (terracota) quando iluminado | amostra de pixels |
| Meios-tons | sépia `#403030`–`#605050` | amostra de pixels |

Cortes por minuto (0 a 20): 7, 13, 14, 10, 17, 11, 10, 15, 8, 7, 15, 15, 7, 8, 13, 10, 9, 11, **22**, 8, 4. O ritmo sobe e desce em ondas; não é constante.

## 2. Estrutura (linha do tempo)

| Trecho | O que acontece | Função |
|---|---|---|
| 0:00–0:10 | Patrocínio | (não se aplica a nós) |
| 0:10–0:13 | **Tela preta em silêncio total** | "limpa" o ouvido e marca o começo do filme |
| 0:13–0:18 | Aviso em texto pequeno, serifado, vermelho escuro sobre marrom | tom sério, de documentário |
| 0:19–0:23 | "UMA PRODUÇÃO TINOCANDOTV" digitado letra por letra, com cliques de máquina de escrever | assinatura de abertura |
| 0:24–0:40 | **Cold open**: foto de arquivo em sépia, citação em letra cursiva que se escreve na tela, assinatura "Franz Kafka" desenhada a mão | gancho emocional antes de qualquer explicação |
| 0:40–0:46 | Tela escura com legenda cinética de frases-chave ("Com romances que…", "ninguém") | frase de impacto isolada |
| 0:46 em diante | Apresentador (A-roll) alternando com B-roll a cada 5–15 s | desenvolvimento |
| 1:16–1:20 | Retrato + assinatura de novo | motivo visual recorrente |
| 10:00–11:00 | Ilustrações sépia (estilo gravura) para cenas da obra (Gregor Samsa) | obra ficcional ganha visual próprio |
| 18:00–19:00 | Clímax: foto do sanatório, **etiquetas de máquina de escrever** ("KIERLING, PERTO", "3, JUNHO DE 1924"), **mancha vermelha** tomando a foto, citação gigante "QUEIME TUDO" | pico emocional, corte mais rápido |
| 20:00–20:05 | **Fecha o círculo**: foto de infância com cor vermelha seletiva + a mesma assinatura do início | bookend |
| 20:06–20:17 | Agradecimentos sobre o A-roll | — |
| 20:18–20:30 | Créditos rolando sobre retrato sépia | encerramento |

## 3. Linguagem visual

**Imagens de arquivo (B-roll)**
- Fotos antigas em preto e branco ou sépia, com granulado, poeira e vinheta forte nas bordas.
- Nunca ficam paradas: push-in lento (Ken Burns) ou 2,5D (pessoa recortada com fundo se mexendo levemente, como em 1:32–1:38). Estimativa a olho: cerca de 1% de zoom por segundo.
- Algumas fotos são levemente animadas por IA (cabeça virando em 1:50–1:56). Uso pontual.
- Obra ficcional ganha ilustração própria (gravura sépia), não foto.

**A-roll (apresentador)**
- Três enquadramentos saídos do mesmo plano: aberto, médio e fechado (punch-in digital), alternados a cada frase para dar ritmo sem trocar de câmera.
- Às vezes o quadro gira alguns graus (10:12, 10:52) para marcar uma fala mais intensa.
- Transição com desfoque: começa borrado e entra em foco (1:00).

**Cor**
- Tudo puxado para marrom, preto e sépia. Uma única cor de destaque: vermelho escuro.
- O vermelho é reservado para o que é emocionalmente forte: logo, citação principal, mancha no clímax, criança colorida no final.

**Texto na tela (7 tipos)**
1. Assinatura desenhada a mão (abertura e fim). É o motivo que fecha o círculo.
2. Citação em letra cursiva, escrevendo-se.
3. Nome de pessoa em fita de papel claro com fonte serifada ("Max Brod"), ao lado do rosto.
4. Local e data em **fonte de máquina de escrever** numa fita de papel, digitada letra por letra.
5. Legenda cinética: não é contínua. Aparece só nas frases de impacto, pequena, no centro, sobre fundo escuro ou desfocado. Palavras já ditas ficam em marrom-alaranjado apagado e a palavra atual fica branca. Às vezes a palavra-chave ganha uma caixa clara.
6. Citação gigante em serifada vermelha maiúscula, com linha de apoio em versalete sobre fitas vermelhas.
7. Créditos: função em vermelho pequeno + nome em serifada branca.

## 4. Som

Lido nos espectrogramas (`referencia/spec_intro.jpg`, `spec_end.jpg`):
- **Silêncio como ferramenta**: 3 s de silêncio total antes do filme começar e um buraco de fração de segundo antes do maior impacto do clímax (≈ 18:09).
- **Cliques de máquina de escrever** sob o texto digitado (0:15–0:21 aparecem como linhas verticais finas em todas as frequências).
- **Impactos graves (sub)**: faixas amarelas abaixo de 100 Hz nos reveals (≈ 0:44, 0:55, 1:11, 18:09). São o "boom" que marca a entrada de uma imagem forte.
- **Subida de ruído (riser/whoosh)** logo antes de alguns impactos (≈ 1:07–1:10).
- **Trilha contínua e baixa** por baixo da voz o vídeo inteiro: piano e cordas escuros. A voz sempre domina.
- A voz é seca e próxima, sem eco.

## 5. O que replicamos

Decisão do Vítor (29/09): **o estilo de edição do Tinoco é para ser replicado**: ritmo, silêncio, som, cor, tipos de texto, tratamento das fotos, clímax e fechamento em círculo. O que não entra é o conteúdo do vídeo dele: logo, nome do canal, imagens, cenas, a assinatura do Kafka e o retrato como marca.

A tradução disso para o nosso vídeo está em `ARQUITETURA.md`.

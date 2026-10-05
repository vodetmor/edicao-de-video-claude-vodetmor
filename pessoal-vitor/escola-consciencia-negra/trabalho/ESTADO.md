# ESTADO — vídeo escolar "Racismo ambiental" (atualizado 2026-09-29 23:15 UTC)

## Fase atual: INTAKE (sem editar). Plano de arquitetura só quando as 7 partes chegarem.

| # | Pessoa | Status | Bruto | Duração |
|---|---|---|---|---|
| 1 | Vítor Machado | ok (VÍDEO 1080p30 até "racismo ambiental" + áudio com o resto) | brutos/01a-Vitor-video.mp4 + brutos/01b-Vitor-audio.ogg | 21,5 s + 55,6 s |
| 2 | Maria Eduarda | FALTA | — | — |
| 3 | Cainã Farias | ok | brutos/03-Caina-Farias.ogg | 76,6 s |
| 4 | Luísa Brasil | ok | brutos/04-Luisa-Brasil.ogg | 62,9 s |
| 5 | Anna Augusta | ok (só áudio) | brutos/05-Anna-Augusta.ogg | 56,1 s |
| 6 | Maria Alice | FALTA | — | — |
| 7 | Anna Júlia Dias | ok, mas SEM dizer o nome | brutos/07-Anna-Julia-Dias.mp4 (mp4 só com áudio, sem trilha de vídeo) | 53,8 s |

Partes dos colegas = só áudio (Vítor: "converte tudo para mp3"). Exceção: o começo da parte do Vítor tem vídeo real (01a).

## Arquivos
- brutos/ : originais do WhatsApp, renomeados NN-Nome.
- trabalho/audio/ : NN-Nome.mp3 (192k, mono 48 kHz, entregável) + NN-Nome.wav (trabalho, sem tratamento).
- trabalho/transcricoes/ : NN-Nome.txt (frases com tempo) + NN-Nome.json (palavra a palavra com tempo e confiança). Whisper large-v3, pt.

## Qualidade (medido)
- Vítor vídeo (01a): 1920x1080 30 fps, enquadramento bom (quarto claro, janela atrás), -23,1 LUFS, fundo -57 dB, limpo. É a ÚNICA parte com imagem: manter a câmera dele.
- Vítor áudio (01b): -18,1 LUFS, fundo -51 dB, 250 amostras clipadas (limiter resolve). Começa repetindo "(ra)cismo ambiental" (o "Ra" veio cortado) -> EMENDA: vídeo até "racismo ambiental" (20,9 s) e áudio a partir de "É quando" (1,6 s). Final: "E é essa a realidade que se estende até os dias... atuais" (retomada em 53,9 s; conferir no ouvido qual versão usar). Falou "A liberdade veio no papel. Na prática, não." (roteiro dizia "O chão, não").
- Cainã: -22,2 LUFS, muito limpo (gate do WhatsApp, fundo digital -85 dB). Ótimo.
- Luísa: -18,4 LUFS, fundo -52 dB. ESTALO/clique clipado em 11,4 s (na pausa depois da pergunta) -> remover. Em 55,4-56,2 s há ruído baixo que o Whisper "leu" como "E o que é o racismo estrutural?" (alucinação, não é fala).
- Anna Augusta: -17 LUFS, fundo -51 dB, picos em 0 dBFS em alguns pontos (leve clip, ok com limiter). O final 55,0-56,1 s é ruído (Whisper alucinou repetição) -> cortar. "arte e qualidade" no txt = "ar de qualidade". Disse "Não se trata SÓ de falta de estrutura".
- Anna Júlia: -23,7 LUFS, ruído de sala mais alto (fundo -48 a -55 dB) -> denoise leve. NÃO disse "Eu sou Anna Júlia Dias" (vai direto da frase de impacto para "E a pergunta..."). Disse "repare quem está ali" (sem "em") e "valor que damos à vida" (sem "humana").
- Todas as falas batem com o roteiro quase palavra por palavra.

## Nome na tela (lower-third em motion) — TODOS, no instante em que falam o nome (Vítor 29/09 23:36 UTC), alto padrão + referências Tinoco/brain/jackson
- 01a-Vitor-video: "Prazer, eu sou o Victor" em 14.92-17.28 s (fala só "Vítor"; tela mostra Vítor Machado)
- 03-Caina-Farias: "Eu sou" em 4.60 s, nome termina em 6.24 s
- 04-Luisa-Brasil: "Eu sou" em 5.02 s, nome termina em 6.50 s
- 05-Anna-Augusta: "Eu sou" em 7.81 s, nome termina em 9.20 s
- 07-Anna-Julia-Dias: não fala; nome só na tela na pausa 7,26-7,94 s

## AMOSTRA PARTE 1 (Vítor) · em andamento desde 30/09 00:32 UTC
Pedido: editar já a parte do Vítor como amostra (abertura é a prioridade). Plano de cenas: PLANO-VITOR.md.
Feito: voz tratada e emendada (fonte/audio/voz.py → fonte/public/voz.wav + words.json); vídeo gradado (acervo/vitor-graduado.mp4);
12 cenas escritas em Remotion (fonte/src); efeitos sintetizados (fonte/audio/sfx.py → fonte/public/sfx); música candidata em acervo/musica (8 faixas Jamendo).
Em andamento: fotos em acervo/fotos (CREDITOS.json) e efeitos reais em acervo/sfx (subagentes).
Mix pronto (01:05 UTC): fonte/audio/make_audio.py → renders/mix-parte1.wav (-14 LUFS). Música: 04 Jesse Keller (drone, gancho) + 01 GubinDmitry (piano, história). Efeitos reais em acervo/sfx (CREDITOS.json).
Falta: copiar fotos para public/fotos com os nomes usados no código (ver lista abaixo), ajustar círculos da Mesa às casas reais, mix (make_audio.py), render, crítica.
Fotos que o código usa (public/fotos/): chuva-cidade, encosta, rio-margem, rua-alagada, rua-alagada-b, mesmas-casas, lixo, poluicao, esgoto, moradores-enchente,
favela-hoje, lei-de-terras, fazenda, escravizados, missa-1888, lei-aurea (= edicao/assets/fotos-candidatas/01-lei-aurea/00.jpg), lei-aurea-assinatura (01-lei-aurea/05.jpg), providencia-1920 (02-providencia-favela/00.jpg).

### Retomar do zero (máquina nova)
```
W=/tmp/w && mkdir -p $W && cp -r /mnt/project-files/escola-consciencia-negra/trabalho/fonte/. $W/ && cd $W
npm install --no-audit --no-fund && python3 -m pip install imageio-ffmpeg faster-whisper scipy pillow
cp ../acervo/vitor-graduado.mp4 public/vitor.mp4   # (caminho: /mnt/project-files/escola-consciencia-negra/trabalho/acervo/)
mkdir -p public/fotos && (copiar as fotos, nomes acima)
npx remotion still src/index.ts Parte1Vitor out/x.jpg --frame=300     # teste
npx remotion render src/index.ts Parte1Vitor out/video.mp4 --muted     # depois mux com o mix
```
Salvar código de volta: rodar `./sync.sh` (ou copiar src/, audio/ para trabalho/fonte).

## Próximo passo
1. Receber Maria Eduarda e Maria Alice -> copiar para brutos/ (02, 06), converter e transcrever com o mesmo script.
2. DECIDIDO (Vítor, 29/09 23:34 UTC): Anna Júlia NÃO regrava. O nome dela entra só na tela, em motion graphics caprichado, no mesmo padrão dos outros lower-thirds, na pausa entre a frase de impacto (termina 7,26 s) e "E a pergunta..." (7,94 s). Vale para qualquer pessoa que não falar o nome.
3. Com as 7: tratamento (denoise, de-click, loudness -16 LUFS por voz), depois UM plano de arquitetura para aprovação.

## Comandos para refazer
- ffmpeg: `python3 -m pip install imageio-ffmpeg faster-whisper`; FF=$(python3 -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())")
- Converter: `$FF -i bruto -vn -ac 1 -ar 48000 -c:a pcm_s16le audio/NN-Nome.wav` e `-b:a 192k audio/NN-Nome.mp3`
- Transcrever: `cd trabalho && python3 transcrever.py large-v3` (processa todos os audio/*.wav; ~5 min para 4 partes em CPU). Hugging Face está liberado na rede agora.

## 2026-09-30 03:10 UTC · AMOSTRA PARTE 1 ENTREGUE
- Arquivo final: escola-consciencia-negra/parte1-vitor-amostra.mp4 (cópia em trabalho/renders/). 1:22, 1080p30, H.264 crf 21, AAC 256k, -14,3 LUFS, pico -4,1 dBFS.
- Checagem de quadros congelados ok (só preto inicial intencional e fade final).
- Fonte sincronizada em trabalho/fonte/ (sync.sh). Para refazer: copiar fonte/ para uma pasta, `npm i`, repor public/vitor.mp4 (acervo/vitor-graduado.mp4) e public/mix.wav (renders/mix-parte1.wav), `npx remotion render Parte1Vitor out/video.mp4`, depois mux com o mix.
- Próximo: esperar o retorno do Vítor sobre o nível; quando chegarem Maria Eduarda e Maria Alice, fazer a entrada delas e mandar UM plano de arquitetura do vídeo completo.

## 2026-09-30 03:45 UTC · PARTES 3, 4, 5, 7 + TELA FINAL (em andamento)
Vítor (03:28 e 03:31 UTC): plano APROVADO, não mandar mais plano. Mesmo padrão da parte 1. Não esperar Maria Eduarda/Maria Alice.
Decisões: nome na tela só com 2 palavras (Cainã Farias, Luísa Brasil, Anna Augusta, Maria Eduarda, Maria Alice, Anna Júlia Dias → "Anna Júlia Dias" é exceção? ele citou só exemplos de 2 palavras; usar "Anna Júlia" se ficar desequilibrado).
Cortar pausas longas/gaguejadas com crossfade (nunca corte seco). Tela final documental com nomes + créditos depois da Anna Júlia.
Cainã "16 milhões em favelas" = motion graphics das favelas. Música composta ao longo do vídeo todo.
Feito:
- Vozes tratadas: fonte/audio/voz_partes.py → fonte/public/p3|p4|p5|p7/voz.wav + words.json (pausas pela energia, crossfade 60 ms).
  Durações: p3 69,0 s · p4 62,3 s · p5 55,2 s · p7 51,5 s (pausa do nome da Anna Júlia estendida para 2,5 s).
- Fotos novas sendo baixadas por subagente em acervo/fotos2/ (CREDITOS.json + fatos.md).
Próximo: cenas Remotion por parte (src/p3..p7), mix por parte, render, entrega.

## 2026-09-30 03:50 UTC · PONTO DE RETOMADA (créditos acabando)
Vítor 03:48: entregar CADA PARTE SEPARADA (um vídeo por pessoa); a junção só no final, quando todos entregarem.
Nome na tela: "Anna Júlia" (2 palavras, como ele pediu), "Cainã Farias", "Luísa Brasil", "Anna Augusta".

### Estado por parte
- P3 Cainã: CENAS PRONTAS (fonte/src/p3/Parte3.tsx, composição Parte3Caina, 70,6 s) + MIX PRONTO (fonte/audio/mix_p3.py → renders/mix-parte3.wav, -14 LUFS, margem 18 LU).
  Falta: trocar fotos provisórias pelas do subagente (acervo/fotos2/) e renderizar. Provisórias em public/fotos (cópias):
  mapa-antigo←lei-de-terras, contraste-aereo←favela-hoje-aberta, bairro-rico←chuva-cidade, favela-aerea←favela-hoje,
  rio-poluido-casas←rio-margem, rua-de-terra←esgoto, deslizamento←encosta, industria-casas←poluicao.
  Ao chegarem as reais: copiar acervo/fotos2/<slot>.jpg para public/fotos/<slot>.jpg (mesmo nome), checar stills
  (node gen/stills.mjs Parte3Caina out/p3 1.5,6.5,...) e ajustar o traço do "Territorio" (x≈1000) ao limite real favela/bairro rico da foto.
- P4 Luísa, P5 Anna Augusta, P7 Anna Júlia: vozes + words.json prontos (fonte/public/pN). Cenas ainda NÃO escritas.
- Tela final: não começada.

### Ferramentas novas (reusar)
- audio/voz_partes.py (vozes), gen/legendas.py N (legendas automáticas; SEM_LEGENDA = trechos com texto na tela),
  gen/stills.mjs (stills de conferência), gen/brasil.mjs (pontos do mapa do Brasil e das 10 figuras),
  src/kit2.tsx (TituloConceito, Selo com ícone Phosphor, Alfinete, Contador, Painel, Isolinhas, Lampejo, Traco/tremido), src/icons.ts,
  audio/mixlib.py (classe Mix: trilha(), fxat(), datilografa(), render() com loudnorm 2 passagens e teste de inteligibilidade com passa-alta 120 Hz).
- Render: `npx remotion render src/index.ts Parte3Caina out/p3.mp4 --muted` e mux com public/p3/mix.wav (igual à parte 1).
- ATENÇÃO bug já corrigido: ao gravar numpy em f32le, sempre .astype(np.float32) (float64 vira lixo).

### Roteiro de cenas P4 Luísa (relógio public/p4/words.json, ~63,4 s) · fio visual = PLANTA/ESTRUTURA (linhas de projeto)
A 0-5,3 frase no preto (Kinetic); em "palavra." (4,12) as letras se apagam e a música some: silêncio.
B 5,3-11,6 gerações: 3 fotos (geracao-1/2/3) lado a lado, câmera em chicote de uma para outra em "geração" (9,98) e "geração?" (10,82). Nome 6,36.
C 11,6-15,8 grade de projeto se desenha, fita "SOCIOLOGIA"; TituloConceito RACISMO (14,08) / ESTRUTURAL (14,72).
D 15,8-22,1 foto de prédio institucional com linhas de estrutura se desenhando por cima (calmo).
E 22,1-26,8 VITRINE: desenho técnico: prédio com colunas (instituições 23,50), quarteirões (cidades 24,50), escada SEM os degraus de baixo (oportunidades 25,14); recuo em "organizadas." 26,02.
F 26,8-41,9 três pares em tela dividida: contrato FINANCIAMENTO carimbo APROVADO / NEGADO (31,82); audiência pública / cadeira vazia (35,70-37,34); obra no bairro / rua de terra com contador de anos 1996→2026 em "espera décadas" (40,82).
G 41,9-55,8 retrato-periferia; depois linha que anda e bate em barreiras que caem: MORADIA 50,88 · SERVIÇOS PÚBLICOS 52,36 · DECISÕES 53,62.
H 55,8-63,4 grade reaparece, ondula em "relação" (59,68) e vira água → foto natureza/rio (ponte para Anna Augusta).
Música P4: 05 dark ambient texture (fria), silêncio após "palavra.", entra de novo em 5,4.

### Roteiro P5 Anna Augusta (~56 s): checklist datilografada (Água tratada/Esgoto/Lixo/Drenagem, ✓ em cada palavra) → em "negado" os ✓ viram ✗ vermelhos + números (fatos.md do subagente: sem água tratada / sem esgoto);
natureza em cor (água, solo, ar, espaço) → metade da imagem perde a cor em "nunca foi igual"; crianças ao lado de vala; enchente com anos passando (2019…2024) em "ano após ano";
MAPA da parte 1 (Riscos.tsx Mapa) de novo: redes de água/esgoto cobrem todos os quarteirões menos o bairro da beira do rio ("a ausência"); citação tipográfica com "direito a um ambiente saudável" sublinhado a lápis; retrato + "dignidade negada". Música: 08 strings ou 02 sad instrumental.
### Roteiro P7 Anna Júlia (~52 s): criança na favela + frase; NOME "Anna Júlia" na pausa (≈5,6-8,0 no relógio novo); pergunta em serifa itálica no preto;
endereço datilografado + 3 caixas (água limpa, ar puro, casa segura) / o mapa em que o bairro vermelho volta à cor dos outros (inclusão); Zumbi (Parreiras) e Serra da Barriga; contador 1695→2026 (espelho do rebobinar da parte 1);
"Da próxima vez que chover forte" = volta a chuva + relâmpago da abertura, foto de rua alagada vira "tela" e círculo à mão nas pessoas ("repare quem está ali"), "por quê?" em vermelho;
final "direito de todos." segura, fade; TELA FINAL documental: RACISMO AMBIENTAL, "Um trabalho de" + 7 nomes na ordem, "Baseado na obra Racismo Ambiental: Entenda essa Luta (Canal Preto, 2021)", fontes (IBGE Censo 2022…), créditos de música/efeitos/fotos de todos os CREDITOS.json (licenças CC BY pedem crédito). Música: 07 coming-from-above (clímax 3:30-4:30) no final + piano 01 da parte 1 na tela final (fecha o ciclo).
- Vítor 03:49: pode ADIANTAR as partes 2 (Maria Eduarda) e 6 (Maria Alice) pelo roteiro (roteiro-racismo-ambiental.pdf): cenas, fotos e motions dos assuntos.
  NÃO adiantar legenda nem sincronia precisa; encaixar no tempo quando os áudios chegarem.

## 2026-09-30 04:00 UTC · progresso
- P4 Luísa: CENAS PRONTAS (src/p4/Parte4.tsx, Parte4Luisa, 63,4 s) + MIX (audio/mix_p4.py → renders/mix-parte4.wav).
- P5 Anna Augusta: CENAS PRONTAS (src/p5/Parte5.tsx, Parte5AnnaAugusta, 56,4 s) + MIX (audio/mix_p5.py → renders/mix-parte5.wav).
  Fotos provisórias P4/P5 (trocar pelas reais de acervo/fotos2, mesmo nome em public/fotos): geracao-1/2/3, predio-institucional,
  audiencia-publica, obra-asfalto, retrato-periferia, retrato-periferia-b, natureza-agua/solo/ar/espaco, criancas-vala, enchente-familia.
  Números usados (fotos2/fatos.md): 33 milhões sem água tratada, 90 milhões sem coleta de esgoto (SINISA 2024, Trata Brasil).
- Maria Alice CHEGOU 03:55 (só áudio): brutos/06-Maria-Alice.mp4 (aac), audio/06-Maria-Alice.wav/.mp3. Transcrição rodando
  (`python3 transcrever.py large-v3 audio/06-Maria-Alice.wav`). Depois: incluir parte 6 em voz_partes.py e fazer as cenas.
- Vítor foi dormir 03:57: termina amanhã. Falta só Maria Eduarda (parte 2; pode ser adiantada pelo roteiro).
- 04:15 UTC P7 Anna Júlia + TELA FINAL: CENAS PRONTAS (src/p7/Parte7.tsx, Parte7AnnaJulia, 83,4 s: fala até 53,2, título 53,2-57,4, créditos até 83,4)
  + MIX (audio/mix_p7.py → renders/mix-parte7.wav). Créditos gerados por gen/creditos.py → src/p7/creditos.json (rodar de novo depois de trocar fotos;
  ao trocar uma provisória, acrescentar o nome em gen/fotos-trocadas.json para o crédito sair da foto nova).
  Provisórias P7: crianca-favela, zumbi, serra-da-barriga, marcha, cidade-amanhecer.
- 04:40 UTC P6 Maria Alice: CENAS PRONTAS (src/p6/Parte6.tsx, Parte6MariaAlice, 59,8 s) + legendas (gen/legendas.py 6) + MIX
  (audio/mix_p6.py, trilha 02 a partir de src 52,9 s para o crescendo cair em 31,1 s → renders/mix-parte6.wav; margem 19,1 LU).
  Cenas: frase "Onde há injustiça, há resistência" sobre marcha; balança dos riscos (pesa e equilibra); título JUSTIÇA AMBIENTAL;
  princípio datilografado com 3 fotos (natureza/urbanização/economia); sujeitos políticos; mosaico 2x2 dos movimentos; favela com isolinhas;
  split final mapa (GEOGRAFIA · ONDE) × planta (SOCIOLOGIA · POR QUÊ).
  Provisórias P6: comunidade-reuniao, quilombolas, movimento-moradia, protesto-saneamento, coletivos-poluicao, marcha.
- PRÓXIMO: busca de fotos (acervo/buscar_fotos.py, log fotos2/busca.log; retoma sozinha) → escolher por _folha.jpg e trocar provisórias;
  adiantar P2 Maria Eduarda pelo roteiro (sem legenda/sincronia); renderizar e entregar cada parte separada.
- 05:05 UTC P2 Maria Eduarda ADIANTADA PELO ROTEIRO (src/p2/Parte2.tsx, Parte2MariaEduarda, 61,8 s estimado). Texto do roteiro extraído em trabalho/roteiro.txt.
  SEM áudio ainda: todos os instantes estão na tabela T no topo do arquivo (cada linha diz a palavra-âncora). Quando o áudio chegar:
  1) copiar para audio/, transcrever (transcrever.py), incluir parte 2 em audio/voz_partes.py → public/p2/voz.wav + words.json;
  2) trocar cada valor de T pelo instante real; trocar `estimadas(...)` por `palavras(W, ...)`; ajustar DURACAO_P2;
  3) SEM_LEGENDA 2 em gen/legendas.py (frase de abertura, "modernização", verbete "racismo ambiental", cartão da obra, frase final) → gen/legendas.py 2 → ligar <Caption cues={CUES}/>;
  4) escrever audio/mix_p2.py (cordas + percussão lenta, cliques de máquina nas etiquetas, thud nos cortiços, boom em 1982 e em "racismo ambiental").
  Cenas: frase "Quem não tem chão..." com a linha do chão que se parte; fita "Maria Eduarda" sobre encosta; CORTE DO TERRENO (morro/centro/rio/várzea/periferia,
  casas em terracota a cada palavra, câmera abre e mede "longe do centro"); 1897 + Morro da Providência + alfinete "primeira favela"; “modernização” e a foto
  do cortiço desabando em tiras; volta ao terreno com pessoas empurradas do centro para as margens (bordas acendem); régua 1897→1982; Warren County com
  esquema casas × depósito tóxico "ao lado"; verbete "racismo ambiental" com Benjamin Chavis; cartão da obra (Canal Preto · 2021); 1920→hoje em cortina;
  mapa de 1911 com traços + "continua escrita no mapa das nossas cidades" (entrega para o mapa do Cainã).
  Provisórias P2: cortico-rio, corticos-demolicao, warren-county, benjamin-chavis (busca em fotos2/cand/, log fotos2/busca-p2.log).

## 2026-09-30 04:40 UTC · obra do Canal Preto + entregas
- Vítor mandou a OBRA (vídeo do PAS): acervo/obra/obra-canal-preto.mp4 (8:22, 720p). Transcrição: transcricoes/obra.json/.txt.
  Folhas de contato: acervo/obra/folha-*.jpg (a cada 4 s) e folha-fina.jpg (1 s). O rótulo da folha-fina está ~4 s adiantado em alguns trechos: conferir o corte.
- Trechos recortados (sem legenda queimada, sem logo "P": crop=1160:510:70:110; alguns em câmera lenta) em fonte/public/obra/*.mp4:
  corrego, enchente-rio, lixo-rua, chuva-bairro, balde-buraco, enchente-carro, educacao-ambiental, mutirao-limpeza.
  Receita (ffmpeg -nostdin -ss A -t DUR -i obra ... setpts=PTS/RATE): corrego 446+5 r1; enchente-rio 73.3+2.65 r0.42; lixo-rua 67+6 r1; chuva-bairro 85+4 r0.85;
  balde-buraco 256+5 r1; enchente-carro 81+3.3 r0.5; educacao-ambiental 403+3.5 r0.66; mutirao-limpeza 77+3.8 r0.5.
- kit.tsx: novo <Midia> (foto ou .mp4 via OffthreadVideo mudo, começa em `from`); Photo e Painel aceitam .mp4.
- Onde entrou: P3 tríptico (corrego, enchente-rio, lixo-rua, chuva-bairro + etiqueta "CENAS: CANAL PRETO, 2021"); P5 Cotidiano (balde-buraco, enchente-carro);
  P6 Sujeitos (educacao-ambiental) e Mosaico SANEAMENTO (mutirao-limpeza). Créditos citam as cenas da obra automaticamente.
- P2: Chavis = quadro da obra (foto Lauren Carroll/Winston-Salem Journal, via Canal Preto); Warren County virou MAPA DOS EUA desenhado (gen/eua.mjs → src/p2/eua.json) com alfinete.
- Fotos trocadas por reais: favela-aerea (Rocinha), corticos-demolicao (Castelo, IMS), industria-casas (Cubatão), benjamin-chavis. Helper: acervo/trocar_foto.py <slot> <NN> [corte%] <projeto>.
- ENTREGAS (pasta escola-consciencia-negra/): parte3-caina.mp4, parte4-luisa.mp4, parte5, parte6, parte7 via fonte/render_parte.sh <N> <Comp> <nome>.
  P3 e P5 re-renderizam depois (ganharam cenas da obra).
- 05:10 UTC PEXELS: chave em edicao/.env (PEXELS_API_KEY). Script acervo/buscar_pexels.py [--video] slot "consulta" ... (fotos → fotos2/cand; vídeos → videos/cand).
  Trocadas por Pexels/Commons: bairro-rico, cidade-amanhecer, coletivos-poluicao, crianca-favela, geracao-3, obra-asfalto, retrato-periferia-b, rua-de-terra,
  quilombolas (= Serra da Barriga, terra de quilombo), marcha e movimento-moradia (Marcha da Consciência Negra SP, CC0), zumbi (estátua Salvador),
  serra-da-barriga, natureza-agua/ar/solo/espaco, geracao-2 (Favela do Castelo 1961), predio-institucional (Congresso), audiencia-publica, retrato-periferia.
  P4 "anos esperando" usa o trecho obra/barracos.mp4 (obra 323+4.5 s, r0.7).
  Ainda provisórias: cortico-rio (P2). geracao-1 usa a foto real de Marc Ferrez (escravizados), ok.
- Fila de render: P3/P5 (feito), P4 + prévia P2 sem voz, P6/P7, e por último P3/P4 de novo (fotos trocadas depois do bundle).
  Lição: o bundle do Remotion copia public/ no início; trocar foto durante uma fila exige re-render da parte.

## 2026-10-01 — Maria Eduarda + vídeo final
- Áudio novo da Maria (falas mudaram): brutos/02-Maria-Eduarda.ogg → voz_partes.py parte 2 (fix Warren/County/Chavis) → public/p2/voz.wav + words.json (78,8 s).
- src/p2/Parte2.tsx refeito nos tempos reais (tabela T), com GLOBO d3-geo (Brasil → Warren County, arco, alfinete, zoom) + mapa EUA. Dados: gen/mundo.mjs → src/p2/mundo.json, gen/eua.mjs → src/p2/eua.json.
- Trilha p2: audio/mix_p2.py (música 06 mantida). Legendas: gen/legendas.py.
- Render: ./render_parte.sh 2 Parte2MariaEduarda parte2-maria-eduarda ; ./render_parte.sh 7 Parte7AnnaJulia parte7-anna-julia (créditos: python3 gen/creditos.py antes).
- JUNÇÃO FINAL: python3 gen/final.py → escola-consciencia-negra/racismo-ambiental-FINAL.mp4. Mergulho no preto entre partes (0,35 s entre 1→2, 0,7 s nas demais), músicas de cada parte INTOCADAS (pedido do Vítor), ponte de áudio = cauda reverberada da parte anterior + impacto grave suave na seguinte.

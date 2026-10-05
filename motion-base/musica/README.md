# Banco de músicas

Trilhas livres para os vídeos (perfil pessoal no TikTok/Instagram, escola e, com cuidado, clientes), separadas por clima.
Feito em 05/10/2026 depois do pedido do Vítor: mais variedade, não só Kevin MacLeod, música nova a cada vídeo.

- `CATALOGO.md`: a lista por clima, com duração, BPM, licença e o **crédito pronto** de cada faixa.
- `catalogo.json`: o mesmo em dados (para scripts), com medidas (LUFS, dinâmica, introdução) e a nota de cada faixa.
- `faixas/<clima>/`: os mp3 escolhidos. `previas/`: 30 s de cada, no volume igual, para ouvir rápido.
- `usos.csv`: qual faixa entrou em qual vídeo (para não repetir).
- `fonte/`: `coleta.py` (busca nas bibliotecas), `analise.py` (mede e dá nota com IA de áudio), `seleciona.py` (monta o banco).

## Climas

| Clima | Quando usar | Referência que o Vítor aprovou |
|---|---|---|
| `aula` | Explicação, conta passo a passo, raciocínio | "Inspired" (Kevin MacLeod) na aula de ótica: "perfeita" |
| `fala` | Bastidores, vlog, rosto falando | "Deliberate Thought" (Kevin MacLeod) nos bastidores |
| `gancho` | Abertura, pergunta, suspense, virada | |
| `final` | Conclusão, conquista, final que sobe e fecha o loop | |
| `leve` | Vídeo divertido, trend, dica rápida. **Nunca em aula** | "Wallpaper" soou "de piada" na aula |

## Licenças (só entra o que é livre para rede social)

| Licença | Pode no TikTok/IG? | Pode em anúncio pago? | Crédito |
|---|---|---|---|
| CC0 (domínio público) | Sim | Sim | Opcional |
| CC BY (Scott Buckley, Kevin MacLeod, ccMixter, Jamendo, Freesound) | Sim | Só se o crédito aparecer no próprio anúncio; senão comprar licença do artista | **Obrigatório** na descrição |
| CC BY-NC, BY-ND, BY-SA | Fora do banco | Não | |

NC proíbe uso comercial (o perfil pode monetizar), ND proíbe derivação (sincronizar com imagem já é derivação) e SA obrigaria o vídeo a ter a mesma licença. Por isso ficaram de fora, mesmo sendo a maioria do Jamendo.

Direitos autorais automáticos (Content ID): Scott Buckley e Kevin MacLeod não registram as faixas. Artistas de Jamendo e ccMixter às vezes registram por distribuidora; se o TikTok/IG reclamar, o normal é mutar o áudio, não derrubar a conta. Em vídeo importante, preferir Scott Buckley, Kevin MacLeod ou CC0.

## Como escolher a trilha de um vídeo novo

**Aula de conteúdo (física, matemática, questão do ENEM): usar "Inspired" (Kevin MacLeod), o padrão da ótica e do lançamento oblíquo** (regra do Vítor, 05/10/2026). O banco só entra na aula se ele pedir outra trilha. Para os outros vídeos:

1. Defina o clima de cada trecho no plano (quase sempre: `gancho` curto na abertura, `aula` ou `fala` no corpo, `final` no fechamento; um vídeo curto pode ter uma faixa só).
2. Abra `CATALOGO.md` no clima certo e veja `usos.csv`: **não repita a faixa dos 3 últimos vídeos do perfil** e não use o mesmo artista duas vezes seguidas, salvo pedido do Vítor.
3. Ouça a prévia e meça contra a voz: a trilha tem que ser ouvida (~8 LU abaixo da voz), subir nas pausas e descer rápido antes da fala (regras em `LICOES-MOTION.md`).
4. Comece a faixa depois da introdução (`intro_s` no catálogo) ou no ponto em que o crescendo cai na virada do texto.
5. Copie a linha de crédito do catálogo para o `ESTADO.md` do vídeo e para a descrição do post. Anote o uso em `usos.csv`.
6. Se o Vítor gostar ou recusar uma faixa, anote em `usos.csv` (coluna `reacao`) e, se for regra nova, em `LICOES-MOTION.md`.

## Ampliar o banco

```bash
python3 -m pip install torch --index-url https://download.pytorch.org/whl/cpu
python3 -m pip install "transformers==4.46.3" librosa soundfile pyloudnorm
cd motion-base/musica/fonte
python3 coleta.py        # busca de novo (pula o que já baixou); chaves em ferramentas/busca/chaves.env
python3 analise.py       # mede e dá nota (CLAP "laion/larger_clap_music_and_speech"), ~3 s por faixa em CPU
python3 seleciona.py --seco   # mostra o ranking sem copiar
python3 seleciona.py --n 10   # monta faixas/, previas/, catalogo.json e CATALOGO.md
```

A nota de cada clima soma: parecença com uma descrição em texto do clima + parecença com as trilhas que o Vítor já aprovou (âncoras) menos parecença com a que ele recusou, e tira faixas com voz cantada ou ruído. Para ensinar um gosto novo, ponha a faixa aprovada em `ANCORAS` (analise.py) e o peso dela em `nota()` (seleciona.py).

Fontes que funcionam da nuvem: Scott Buckley (site), ccMixter (API, precisa do cabeçalho Referer para baixar), Jamendo e Freesound (chaves do Vítor), incompetech (Kevin MacLeod, `pieces.json` com 1.443 faixas). Bloqueadas da nuvem: Pixabay Music, Chosic, Uppbeat, Musopen, YouTube Audio Library.

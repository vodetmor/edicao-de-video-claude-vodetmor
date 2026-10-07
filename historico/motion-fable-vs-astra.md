# motion-fable-vs-astra

## 2026-09-28T21:42:12Z · Claude

Exemplo: motion graphic estilo Apple comparando Fable 5.1 e GPT-6 Astra, com trilha e efeitos.

_Anexos: benchmark-fable-vs-astra.mp4, benchmark-fable-vs-astra.zip, LICOES-MOTION.md, motion-base.zip, notdwd-guia-motion-opus.md, benchmark-v6.mp4, referencia-vs-v6.mp4, v6-fonte.zip_

## 2026-09-28T21:42:25Z · Claude

Começo escrevendo a copy e o roteiro do benchmark antes de animar.

## 2026-09-28T21:51:27Z · Claude

O exemplo está pronto: um vídeo vertical 9:16 de 30 s, no estilo Apple, com fundo claro, cartões arredondados, molas e um capítulo escuro. Não usei degradê nem brilho. Preciso que você assista com som e me diga o que achou, porque eu só consigo conferir quadros parados e o espectro do áudio.

**Roteiro que escrevi:** "Dois modelos novos. Um placar honesto." Depois vem "Frente a frente" com as duas logos, e em seguida 4 benchmarks com placar ao vivo:
- Terminal-Bench (código): 55,8 vs 57,9
- FrontierMath (matemática): 87,8 vs 97,6
- Humanity's Last Exam (raciocínio): 65,0 vs 57,2
- AutomationBench (trabalho): 31,4 vs 41,4

O placar termina 1 × 3 para o Astra. Aí a tela fica preta e aparece a virada: "Índice de Inteligência 53 = 53. Empate." Depois vem o preço, que é igual por token, mas o Astra gasta menos da metade por tarefa ($3,26 contra $7,63). O vídeo fecha com "Não existe o melhor modelo. Existe o melhor para a sua tarefa."

**Os números são reais**, de setembro de 2026. Vêm da [tabela oficial da OpenAI](https://openai.com/index/gpt-6-astra/), da [Artificial Analysis](https://artificialanalysis.ai/articles/benchmarking-gpt-6-astra) e da [Vellum](https://www.vellum.ai/blog/gpt-6-astra-benchmarks-explained), e as fontes aparecem no rodapé do vídeo. A maioria é divulgada pela própria OpenAI, e a Artificial Analysis mediu o Terminal-Bench um pouco diferente.

**Trilha e efeitos:** criei tudo do zero em código, então não há direito autoral envolvido. A música está a 96 BPM e cada corte cai no tempo forte. Os efeitos são whoosh nas transições, ticks enquanto os números sobem, um pop no vencedor, uma subida antes do empate e um impacto no "Empate.".

**Logos:** redesenhei as duas de forma simplificada, então não são os arquivos oficiais. Para usar em anúncio pago, vale conferir as regras de marca de cada empresa.

O .zip traz o código Remotion, o gerador de áudio, as trilhas separadas (música, bateria e efeitos) e um README com o roteiro e o passo a passo para editar os textos e os números.

## 2026-09-28T22:07:55Z · Claude

Montei a base de motion, mas não consegui abrir o artigo do @notdwd, porque o X bloqueia este ambiente na nuvem. Preciso que você cole o texto aqui (pode ser print ou PDF também). Aí eu salvo ele na íntegra e corrijo as lições.

**O que já está na pasta `motion-base` do projeto:**
- **Diagnóstico da v5 e checklist de 10 regras.** O principal: a câmera fica parada e cada cena recomeça do zero, sem um elemento-estrela que conduza o olho. Também usei uma mola só (os virais usam 3 ou mais easings), deixei tempo morto nos logos e a tipografia ficou pequena para o 9:16.
- **23 prompts de vídeos virais**, incluindo 2 do próprio @notdwd. O método dele é medir um vídeo de referência (cortes, tempos, cores), refazer quadro a quadro e comparar lado a lado.
- **O manual de motion da HeyGen (HyperFrames)**, com 22 formatos de cena tirados de 178 vídeos de lançamento.
- **Logos reais em SVG** do Claude, OpenAI, Gemini e outros. Não precisa de conector novo, eles vêm de bibliotecas abertas.
- **Música épica:** o melhor caminho grátis é o ACE-Step 1.5 (licença MIT, roda no acemusic.ai), mantendo por cima os efeitos em código que você aprovou.

"Motion Maxing" não aparece em nenhum lugar fora do X, então por enquanto a definição que está na base é minha. Para salvar no seu computador, baixe o zip abaixo ou ligue o Remote Control numa pasta sua.

Se puder, mande também 1 a 3 vídeos que você considera o nível alvo, porque é com eles que a v6 sobe de patamar.

## 2026-09-28T22:09:20Z · Rei da VSL - Vítor

’ve tested Opus 5.5 for motion FAR more than anybody else I’ve seen on X, and I’ve managed to get results I really haven’t seen anyone else come close to.
After testing the absolute shit out of it, I’m giving AWAY everything that actually matters: how I choose references, how I make Opus study them, what goes into the brief, the motion rules that make the biggest difference, how I review the output, and how I handle longer videos without everything falling apart. So bookmark this and stick along.
Also, I know 70% of you guys’ attention span is cooked, so I would advise you to copy this entire article and give it to your agent as well.
Before anything else, credit to my boy
[@twoclipping](https://x.com/@twoclipping)
. His viral post was the first time I realized AI could actually be pushed that far for design. Give the goat a follow :)
zero
@twoclipping
·
[24 de set](https://x.com/twoclipping/status/2103273003555402193)
opus 5.5 is f*cking cracked at motion design

this entire video is code, 0 after effects

im open sourcing the prompt template for these motion designs

steal it to recreate these ↓

<inputs>
Ask me for: 8 to 12 UI states I want the shape to become (e.g. button, loader, player,
Mostrar mais
0:00 / 0:14
1. start with a reference
This is the biggest and most important thing you will do.
If you ask Opus to invent a launch video from a blank page, you are giving it control over the composition, typography, pacing, camera, transitions, motion, sound and overall creative direction at the same time.
That is why vague prompts keep converging on the same look: centered text, gradients, fades and safe movement.
I did this over and over when I first started. I would ask for something “premium,” “cinematic” or “expensive” and get different versions of the same average video.
The biggest improvement came when I stopped making Opus invent everything and gave it a video whose motion I already knew was good.
My best example is Gojiberry’s launch video. I rebuilt it around my own brand and posted both versions side by side.
dawood46
@notdwd
·
[26 de set](https://x.com/notdwd/status/2103959324385300552)
every launch video on the internet is a template now.

left is
[@gojiberryai](https://x.com/gojiberryai)
  launch video. right is the version I had Opus 5.5 rebuild for my brand in 15 minutes. same motion, same cuts, playing in sync.

I’m open sourcing the exact prompt + process so you can recreate any launch
Mostrar mais
0:00 / 1:05
People in the replies were genuinely questioning themselves after this lol.
Giving Claude the video alone is not enough, though. “Copy this” still leaves a lot of room for interpretation.
I make it inspect the reference frame by frame before it builds anything.
I want to know every cut, where important elements start and land, how long each movement takes, where the movement speeds up or slows down, how the camera moves, where blur appears, what changes between shots and where every sound effect lands.
A simple version of the prompt:
"Before building anything, reverse-engineer ./ref.mp4 frame by frame.
1. Extract every frame. Find every cut from frame-to-frame difference spikes,
   then confirm each one visually.
2. For every shot, measure with code (never eyeball): start/end frame, each
   element's position and size per frame, how many frames each move takes,
   overshoot, camera zoom/pan per frame, blur timing and direction, exact
   colours sampled from pixels, font sizes, and every sound hit's timestamp.
3. Save it as SPEC.md with the per-frame numbers for every big move.
The frames are the truth. If your description and the frames disagree,
the frames win. Show me the shot list before you build.
Then:
"Rebuild SPEC.md shot for shot, with my logo, colours, product and words.
Everything else is locked: timing, positions, sizes, easing, camera, cuts,
blur, cursor path and typing speed must land on the same frames.
Every frame must be a pure function of time (no timers, no random values),
so any frame can be re-rendered on its own.
If my words are longer or shorter, keep everything around them where the
reference had it and let the text adapt. Tell me every place you had to
differ from the original, with frame numbers."
This works because Claude now has actual information to follow.
“Make the card slide in smoothly” is vague.
“The card starts here, reaches this position after 18 frames, moves quickly at the beginning and slows as it approaches the final position” is something it can reproduce.
The same applies to the rest of the reference. You want to reduce the number of creative decisions Claude has to guess.
2. decide what stays and what changes
Recreating a reference does not mean blindly copying everything in it.
Before Claude builds, I make it separate the reference into the parts I want to preserve and the parts that belong to my own video.
If I like the pacing and camera movement but hate the colours, I say that.
If I want the transition structure but need completely different typography, I say that.
If the original uses LinkedIn UI and mine needs X, that becomes an explicit swap.
For a close remake, I usually preserve things like timing, cuts, camera movement, positions, easing and blur. The brand, copy, logo, colours, faces and product screens change.
You can make Claude do this before it starts:
"Before building, split the reference into two lists:
KEEP (identical): timing, cuts, camera, easing, positions, blur, transitions.
CHANGE (mine): brand, logo, colours, fonts, copy, product screens, faces,
platform UI.
Then write my visual rules once, in one place (fonts, palette, spacing, one
accent colour) and every shot must use them.
BANNED: random gradients, everything fading in, fake product UI, particle
bursts, glow on text, more than one thing fighting for attention.
Ask me about anything ambiguous before you build."
I also tell it what I already know I will reject.
For me that usually includes random gradients, fake product UI, unnecessary particles, everything fading in, unreadable moving text and several things competing for attention at once.
This matters even more on longer videos.
If you leave the visual system open, different scenes start drifting. One scene comes back minimal, another suddenly has three gradients, another uses a different type treatment, and the finished video stops feeling like one piece.
Lock the fonts, colours, spacing and general visual rules before you start building the whole thing.
Here is another video I made with the same approach. The motion and timing came from a reference, while the product, branding and content were rebuilt around Frame by Frame.
dawood46
@notdwd
·
[27 de set](https://x.com/notdwd/status/2104229441211969685)
ANOTHER ONE.

1000% AI GENERATED. ALL CODE. 0$ MADE IN 15 MINUTES.

I’m open sourcing the entire prompt + guide so you can recreate it.

full prompt below ↓
0:00 / 0:12
Comentar
dawood46
@notdwd
·
27 de set
I have mastered AI motion & design.

this was made COMPLETELY with Opus 5.5. everything from sound to motion.

it cost $0 and took 15 minutes. 

and yes, I’m open sourcing it.

steal the prompt below ↓

<inputs>
Ask me for: the product the landing page is for, the prompt a user
3. learn a few actual motion rules
References get you much further, but at some point you need to understand what the motion is actually doing.
One of the first patterns I measured was how objects arrive.
A lot of cheap motion travels at a uniform speed or stops abruptly.
The motion I liked usually covered roughly 12–19% of the remaining distance each frame. That means the object moves quickly at first and gradually slows as it approaches its final position.
Think of a car parking. It approaches quickly, then becomes more controlled as it reaches the exact spot.
That behaviour immediately made my entrances look better.
A few other rules made a noticeable difference:

* Nothing should feel completely frozen. Even a quiet hold can keep a very small camera push or drift. I often use roughly a 0.25% push per frame when I want a shot to stay alive.
* Stagger groups. If three elements need to enter, offset them by a few frames instead of firing all three on the same frame.
* Blur should follow movement. Horizontal movement gets horizontal blur. Vertical movement gets vertical blur. As the object settles, the blur should disappear.
* Give text enough reading time. Text cannot immediately start moving again after it appears. Let the viewer actually read it.
* Keep one obvious focal point. Every frame should make it clear where the viewer is supposed to look first.
* Use sound to support important motion. A click should land on the button press. A whoosh should line up with the movement. A larger reveal should have an impact supporting that moment.

A small prompt you can add to your brief:
Motion rules for every shot:
- Arrive fast, land soft: each frame covers 12–19% of the remaining distance.
  Never constant speed, never a dead stop.
- Nothing ever freezes: holds keep a slow push-in (~0.25% per frame).
- Every move lasts at least 0.3s; big moves 0.5–0.75s.
- Stagger grouped elements 2–4 frames apart.
- Motion blur follows direction and speed, fades as things settle; fast
  moves get real in-between frames blended, never blended across a cut.
- Text stays still at least 8 frames before it moves.
- One focal point per frame.
- Cuts land on the beat or 2 frames before it; morphs start ~4 frames early.
Once I started writing these patterns down, the quality became much more consistent.
Instead of telling Claude that something “feels cheap,” I could explain what was wrong and give it an actual correction.
This clip is only around 7.5 seconds, but almost every movement follows some version of these rules.
dawood46
@notdwd
·
[27 de set](https://x.com/notdwd/status/2104138101102621133)
I have mastered AI motion & design.

this was made COMPLETELY with Opus 5.5. everything from sound to motion.

it cost $0 and took 15 minutes. 

and yes, I’m open sourcing it.

steal the prompt below ↓

<inputs>
Ask me for: the product the landing page is for, the prompt a user
Mostrar mais
0:00 / 0:08
Full prompt for this one is in the first reply.
4. check stills before the full render
I almost never let Claude go directly from the brief to a finished render anymore.
First I ask for a few important still frames.
Usually:

* opening
* main composition
* product shot
* one transition
* end card

A still catches design problems much faster than a finished video.
You can immediately see whether the hierarchy is wrong, the typography is too small, the spacing is inconsistent, the product screen looks fake or the palette has drifted.
My prompt is simple:
Before the full render, render 5 stills: the opening, the main composition,
the product shot, the middle of the fastest transition, and the end card.
Look at each one yourself, zoomed in, and check: hierarchy, spacing,
typography, colours, product accuracy, and anything that shouldn't be there
(stray shapes, cut-off text, overlaps, leftover effects you copied without
knowing why). Fix everything, re-render the stills, then show me.
Only start the full render after I approve.
This saved me from a stupid bug in one of my own videos.
A random white shape appeared underneath a button for a few frames when the cursor clicked it. Claude had copied an effect from the reference without understanding what the effect was supposed to do.
During a normal watch it was easy to miss.
In the still frame it looked ridiculous.
Five pictures can catch problems that would otherwise survive an entire render.
5. make a fresh Claude review the video
Use a separate Claude session for critique.
The session that built the video has context for every decision and compromise it made. A fresh session does not.
I give the critic the reference and my render side by side and tell it:
You're a harsh motion director and you didn't build this. Default: reject.
Put the reference and my render side by side, frame-locked, and compare them.
For every mismatch give: shot + frame number, what's wrong, why it looks
worse, and the exact fix ("card lands 6 frames early, delay to frame 44").
Also measure frame-to-frame change and flag:
- any fast move followed by a dead stop (that's what "choppy" is)
- text moving before it's readable
- sound landing off its visual hit
Prioritize the 5 fixes that improve the video most. Nothing ships below 8/10.
The specificity matters.
“The motion feels weird” gives you very little.
“The card in shot three stops six frames earlier than the reference” gives you something you can fix.
Then I make the change, render only the affected section and compare again.
That review loop eventually became part of the Claude Code skill inside Frame by Frame because I got tired of rebuilding the same process every time.
6. sound needs the same precision
Sound changes how finished the motion feels more than most people expect.
If a cursor presses a button, the click should land on the press frame.
If something flies across the screen, the whoosh should peak with the movement.
If a large object appears, the impact should support the same visual moment.
The important part is synchronization.
A sound effect placed vaguely near the animation still feels disconnected. When the strongest part of the sound lands on the strongest part of the visual action, the two feel like one event.
I also master the final audio around -14 LUFS for web delivery.
You do not need an insane audio setup. You need good effects placed deliberately.
7. longer films need more structure
A short clip can live inside one Claude session.
Longer films become harder because the context has to hold too many scenes, shared components and previous decisions at once.
My 71-second launch film was where I started running into this properly.
Later scenes would drift away from earlier ones. Fixing something near the end could break something that was already good. Different sections would slowly develop different design decisions.
For bigger projects, I split the production.
One Claude session keeps the main visual rules and structure consistent. A few others handle smaller groups of scenes. Another handles sound. A separate session reviews the result.
The shared decisions stay centralized: fonts, colours, logo treatment, cursor, spacing and anything else that needs to remain consistent across the entire film.
You do not need this for a seven-second clip.
Once you are making something much longer, it becomes useful.
8. understand enough of the underlying skill
This is the other thing I would recommend to everybody using AI heavily.
Become AI-native, but learn the basics of whatever you are using AI to do.
If you code with AI, learn enough code to recognize when the architecture is broken or the model is doing something stupid.
If you design with AI, learn enough design to recognize bad hierarchy, spacing, typography and composition.
If you make motion, learn enough motion to understand timing, easing, blur, pacing and attention.
The more you understand the underlying skill, the better you become at directing the model and judging its output.
That is also why I do not think the people who are already good at motion or design should be worried about Opus.
These models give them much more leverage because they already have the taste and experience required to tell the model what to make and recognize when the result is weak.
Opus can already replicate existing work extremely well.
Generating genuinely strong original creative direction from a blank page is still a much harder problem.
9. the full workflow
For most videos, this is the process I use now:
reference → frame study → brief → visual rules → shots → stills → motion → sound → critique → final render
The reference gives Claude proven motion to study.
The frame study turns that motion into information it can follow.
The brief decides what stays and what changes.
The visual rules keep the film consistent.
The stills catch design problems before you waste time rendering.
The motion pass handles timing, easing and blur.
The sound pass connects the important actions to audio.
The critic catches whatever you missed.
That is basically the process.
Frame by Frame
Everything in this article comes from the system I built for myself while learning this.
[Frame by Frame](https://whop.com/frame-by-frame-1d6c/frame-by-frame-motion/)
 has the complete version: the full set of motion rules, the exact prompts behind my videos, the complete reference-remake workflow, the critique system, the longer-film setup, examples, templates and the Claude Code skill that runs the process.
The article gives you enough to start applying the workflow yourself.
Frame by Frame is for people who want the entire system already packaged and direct access to me when their output comes back wrong.
I’m keeping the first group to ONLY 50 ppl so I can individually help everyone inside.
link in the replies.
Quer publicar seu artigo?
[Fazer upgrade para Premium](https://x.com/i/premium_sign_up)
[6:27 PM · 28 de set de 2026](https://x.com/notdwd/status/2104684539142648062)
·
[947](https://x.com/notdwd/status/2104684539142648062/analytics)
[Visualizações](https://x.com/notdwd/status/2104684539142648062/analytics)
Relevante
[Ver comentários](https://x.com/notdwd/status/2104684539142648062/quotes)

[dawood46](https://x.com/notdwd)
[@notdwd](https://x.com/notdwd)
·
[31 min](https://x.com/notdwd/status/2104687047596442049)
want the exact system I use? Frame by Frame has the full skill + every prompt. first 50 people only:
[De whop.com](https://t.co/AbLLw48dQ2)
[Hossein](https://x.com/hvsseinidi)
[@hvsseinidi](https://x.com/hvsseinidi)
·
[33 min](https://x.com/hvsseinidi/status/2104686623292027180)
W read
[dawood46](https://x.com/notdwd)
[@notdwd](https://x.com/notdwd)
·
[32 min](https://x.com/notdwd/status/2104686776162169098)
yessiirr
[Waffu](https://x.com/vfxwaffu)
[@vfxwaffu](https://x.com/vfxwaffu)
·
[31 min](https://x.com/vfxwaffu/status/2104686975915847957)
Holy PEAK
[dawood46](https://x.com/notdwd)
[@notdwd](https://x.com/notdwd)
·
[31 min](https://x.com/notdwd/status/2104687141066563924)
only upp gang
[Pounds](https://x.com/pounddz)
[@pounddz](https://x.com/pounddz)
·
[36 min](https://x.com/pounddz/status/2104685750499278906)
Banger

## 2026-09-28T22:09:23Z · Claude

Recebi o artigo inteiro. Vou salvar na base e reescrever as lições com as regras dele.

## 2026-09-28T22:11:09Z · Claude

Salvei o artigo inteiro na base e reescrevi as lições em cima dele. O que preciso de você agora é **1 vídeo de referência em MP4** com o nível de motion que você quer. A principal lição do artigo é que, sem referência, o Claude inventa do zero e cai sempre no mesmo resultado médio, que foi exatamente o que aconteceu na v5.

**O que passa a ser o padrão do projeto:**
- **Fluxo:** referência → estudo quadro a quadro medido com código (vira um `SPEC.md`) → brief separando o que fica igual do que muda → regras visuais fixas → 5 quadros para você aprovar → motion → som → crítica feita por outra sessão do Claude, que só aprova com nota 8/10 ou mais → render final.
- **Regras com números** em vez de adjetivos. O movimento cobre 12 a 19% da distância restante a cada quadro, então chega rápido e pousa suave. Nada fica congelado: nas pausas a câmera avança 0,25% por quadro. O stagger é de 2 a 4 quadros, o texto fica parado pelo menos 8 quadros antes de se mexer e o blur segue a direção do movimento. O áudio é masterizado em -14 LUFS.
- **A v5 comparada com essas regras:** faltou referência, motion blur e um ponto focal único, os logos ficaram parados por 3,5 s e o áudio saiu com -12,6 LUFS.

Se puder, cole também os prompts completos dos posts do @notdwd e do @twoclipping. Eles ficam no "Mostrar mais" e nas respostas, e eu não consigo abrir o X daqui.

## 2026-09-28T22:11:54Z · Rei da VSL - Vítor

eu te mandar um vídeo?

## 2026-09-28T22:11:58Z · Claude

Isso, anexe aqui mesmo o arquivo MP4 de um vídeo com o motion que você acha foda. Pode ser um lançamento de produto, um anúncio da Apple ou um desses virais do X.

Para baixar um vídeo do X, cole o link num site como o ssstwitter.com e salve o MP4.

Quanto mais curto, melhor para começar (10 a 30 s). Se quiser, diga também o que você gosta nele (a câmera, os cortes, a tipografia) e o que odeia. Com o arquivo em mãos, eu meço tudo quadro a quadro e refaço a demo do benchmark em cima dele.

## 2026-09-28T22:14:02Z · Rei da VSL - Vítor

é um vídeo de 1 minuto, mas pegue só os 30s para ir mais rápido.

## 2026-09-28T22:14:07Z · Claude

Recebi o vídeo. Vou pegar os primeiros 30 s, medir tudo quadro a quadro e montar o SPEC antes de construir.

## 2026-09-28T22:43:25Z · Claude

Vítor, o v6 está pronto. Preciso que você assista e me diga o que ajustar. Se quiser, também faço a versão 9:16.

Refiz o benchmark Fable 5.1 vs GPT-6 Astra em cima do seu vídeo de referência. Deixei em 16:9 a 24 fps, como a referência, com os logos oficiais e o áudio em -14 LUFS.

Um revisor separado criticou o vídeo em 4 rodadas e as notas foram 4,5, 6,5, 7,5 e 8/10. A 8 é o mínimo do artigo para publicar. Os últimos ajustes que ele pediu já estão aplicados, mas essa versão final ele ainda não avaliou.

Você vai receber três arquivos:
- **benchmark-v6.mp4**: o vídeo.
- **referencia-vs-v6.mp4**: a sua referência à esquerda e o meu vídeo à direita.
- **v6-fonte.zip**: o código-fonte e o áudio.

O estudo quadro a quadro da referência está em `motion-base/estudos/gojiberry/SPEC.md`.

## 2026-09-28T22:51:28Z · Rei da VSL - Vítor

quais skills vc usou

## 2026-09-28T22:51:38Z · Claude

Não usei nenhuma skill instalada neste vídeo. Fiz tudo com código e com a base que montamos:

- **Regras de motion:** o artigo do notdwd e as regras do Hyperframes, que estão em `motion-base/LICOES-MOTION.md`.
- **Animação:** Remotion (React), com uma curva de movimento que medi na sua referência.
- **Som:** efeitos e trilha gerados por código em Python, e a mixagem final no ffmpeg.
- **Logos:** os SVGs oficiais do pacote lobehub.
- **Revisão:** um segundo Claude, separado, criticou cada versão como faria um diretor de arte.

Se quiser, posso transformar esse processo numa skill sua, para você reutilizar em outros vídeos.

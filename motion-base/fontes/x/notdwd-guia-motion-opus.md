# @notdwd: guia de motion com Opus 5.5 (artigo no X, texto original)

- Fonte: https://x.com/notdwd/status/2104684539142648062 (publicado em 28/09/2026 às 18:27)
- Colado por Vítor no projeto em 28/09/2026. O texto abaixo foi copiado sem alterações. Removi só os embeds de posts citados e as respostas do fim. Os links desses posts estão listados no final.
- A tradução aplicada ao nosso fluxo está em `../../LICOES-MOTION.md`.

---

I've tested Opus 5.5 for motion FAR more than anybody else I've seen on X, and I've managed to get results I really haven't seen anyone else come close to.
After testing the absolute shit out of it, I'm giving AWAY everything that actually matters: how I choose references, how I make Opus study them, what goes into the brief, the motion rules that make the biggest difference, how I review the output, and how I handle longer videos without everything falling apart. So bookmark this and stick along.
Also, I know 70% of you guys' attention span is cooked, so I would advise you to copy this entire article and give it to your agent as well.
Before anything else, credit to my boy @twoclipping. His viral post was the first time I realized AI could actually be pushed that far for design.

## 1. start with a reference
This is the biggest and most important thing you will do.
If you ask Opus to invent a launch video from a blank page, you are giving it control over the composition, typography, pacing, camera, transitions, motion, sound and overall creative direction at the same time.
That is why vague prompts keep converging on the same look: centered text, gradients, fades and safe movement.
I did this over and over when I first started. I would ask for something "premium," "cinematic" or "expensive" and get different versions of the same average video.
The biggest improvement came when I stopped making Opus invent everything and gave it a video whose motion I already knew was good.
My best example is Gojiberry's launch video. I rebuilt it around my own brand and posted both versions side by side.
People in the replies were genuinely questioning themselves after this lol.
Giving Claude the video alone is not enough, though. "Copy this" still leaves a lot of room for interpretation.
I make it inspect the reference frame by frame before it builds anything.
I want to know every cut, where important elements start and land, how long each movement takes, where the movement speeds up or slows down, how the camera moves, where blur appears, what changes between shots and where every sound effect lands.
A simple version of the prompt:

```text
Before building anything, reverse-engineer ./ref.mp4 frame by frame.
1. Extract every frame. Find every cut from frame-to-frame difference spikes,
   then confirm each one visually.
2. For every shot, measure with code (never eyeball): start/end frame, each
   element's position and size per frame, how many frames each move takes,
   overshoot, camera zoom/pan per frame, blur timing and direction, exact
   colours sampled from pixels, font sizes, and every sound hit's timestamp.
3. Save it as SPEC.md with the per-frame numbers for every big move.
The frames are the truth. If your description and the frames disagree,
the frames win. Show me the shot list before you build.
```

Then:

```text
Rebuild SPEC.md shot for shot, with my logo, colours, product and words.
Everything else is locked: timing, positions, sizes, easing, camera, cuts,
blur, cursor path and typing speed must land on the same frames.
Every frame must be a pure function of time (no timers, no random values),
so any frame can be re-rendered on its own.
If my words are longer or shorter, keep everything around them where the
reference had it and let the text adapt. Tell me every place you had to
differ from the original, with frame numbers.
```

This works because Claude now has actual information to follow.
"Make the card slide in smoothly" is vague.
"The card starts here, reaches this position after 18 frames, moves quickly at the beginning and slows as it approaches the final position" is something it can reproduce.
The same applies to the rest of the reference. You want to reduce the number of creative decisions Claude has to guess.

## 2. decide what stays and what changes
Recreating a reference does not mean blindly copying everything in it.
Before Claude builds, I make it separate the reference into the parts I want to preserve and the parts that belong to my own video.
If I like the pacing and camera movement but hate the colours, I say that.
If I want the transition structure but need completely different typography, I say that.
If the original uses LinkedIn UI and mine needs X, that becomes an explicit swap.
For a close remake, I usually preserve things like timing, cuts, camera movement, positions, easing and blur. The brand, copy, logo, colours, faces and product screens change.
You can make Claude do this before it starts:

```text
Before building, split the reference into two lists:
KEEP (identical): timing, cuts, camera, easing, positions, blur, transitions.
CHANGE (mine): brand, logo, colours, fonts, copy, product screens, faces,
platform UI.
Then write my visual rules once, in one place (fonts, palette, spacing, one
accent colour) and every shot must use them.
BANNED: random gradients, everything fading in, fake product UI, particle
bursts, glow on text, more than one thing fighting for attention.
Ask me about anything ambiguous before you build.
```

I also tell it what I already know I will reject.
For me that usually includes random gradients, fake product UI, unnecessary particles, everything fading in, unreadable moving text and several things competing for attention at once.
This matters even more on longer videos.
If you leave the visual system open, different scenes start drifting. One scene comes back minimal, another suddenly has three gradients, another uses a different type treatment, and the finished video stops feeling like one piece.
Lock the fonts, colours, spacing and general visual rules before you start building the whole thing.
Here is another video I made with the same approach. The motion and timing came from a reference, while the product, branding and content were rebuilt around Frame by Frame.

## 3. learn a few actual motion rules
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

```text
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
```

Once I started writing these patterns down, the quality became much more consistent.
Instead of telling Claude that something "feels cheap," I could explain what was wrong and give it an actual correction.
This clip is only around 7.5 seconds, but almost every movement follows some version of these rules.
Full prompt for this one is in the first reply.

## 4. check stills before the full render
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

```text
Before the full render, render 5 stills: the opening, the main composition,
the product shot, the middle of the fastest transition, and the end card.
Look at each one yourself, zoomed in, and check: hierarchy, spacing,
typography, colours, product accuracy, and anything that shouldn't be there
(stray shapes, cut-off text, overlaps, leftover effects you copied without
knowing why). Fix everything, re-render the stills, then show me.
Only start the full render after I approve.
```

This saved me from a stupid bug in one of my own videos.
A random white shape appeared underneath a button for a few frames when the cursor clicked it. Claude had copied an effect from the reference without understanding what the effect was supposed to do.
During a normal watch it was easy to miss.
In the still frame it looked ridiculous.
Five pictures can catch problems that would otherwise survive an entire render.

## 5. make a fresh Claude review the video
Use a separate Claude session for critique.
The session that built the video has context for every decision and compromise it made. A fresh session does not.
I give the critic the reference and my render side by side and tell it:

```text
You're a harsh motion director and you didn't build this. Default: reject.
Put the reference and my render side by side, frame-locked, and compare them.
For every mismatch give: shot + frame number, what's wrong, why it looks
worse, and the exact fix ("card lands 6 frames early, delay to frame 44").
Also measure frame-to-frame change and flag:
- any fast move followed by a dead stop (that's what "choppy" is)
- text moving before it's readable
- sound landing off its visual hit
Prioritize the 5 fixes that improve the video most. Nothing ships below 8/10.
```

The specificity matters.
"The motion feels weird" gives you very little.
"The card in shot three stops six frames earlier than the reference" gives you something you can fix.
Then I make the change, render only the affected section and compare again.
That review loop eventually became part of the Claude Code skill inside Frame by Frame because I got tired of rebuilding the same process every time.

## 6. sound needs the same precision
Sound changes how finished the motion feels more than most people expect.
If a cursor presses a button, the click should land on the press frame.
If something flies across the screen, the whoosh should peak with the movement.
If a large object appears, the impact should support the same visual moment.
The important part is synchronization.
A sound effect placed vaguely near the animation still feels disconnected. When the strongest part of the sound lands on the strongest part of the visual action, the two feel like one event.
I also master the final audio around -14 LUFS for web delivery.
You do not need an insane audio setup. You need good effects placed deliberately.

## 7. longer films need more structure
A short clip can live inside one Claude session.
Longer films become harder because the context has to hold too many scenes, shared components and previous decisions at once.
My 71-second launch film was where I started running into this properly.
Later scenes would drift away from earlier ones. Fixing something near the end could break something that was already good. Different sections would slowly develop different design decisions.
For bigger projects, I split the production.
One Claude session keeps the main visual rules and structure consistent. A few others handle smaller groups of scenes. Another handles sound. A separate session reviews the result.
The shared decisions stay centralized: fonts, colours, logo treatment, cursor, spacing and anything else that needs to remain consistent across the entire film.
You do not need this for a seven-second clip.
Once you are making something much longer, it becomes useful.

## 8. understand enough of the underlying skill
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

## 9. the full workflow
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

## Frame by Frame (produto pago dele)
"Everything in this article comes from the system I built for myself while learning this. Frame by Frame has the complete version: the full set of motion rules, the exact prompts behind my videos, the complete reference-remake workflow, the critique system, the longer-film setup, examples, templates and the Claude Code skill that runs the process." Link: https://whop.com/frame-by-frame-1d6c/frame-by-frame-motion/ (pago, com vagas limitadas a 50 pessoas).

---

## Posts citados no artigo (abrir no navegador)
- @twoclipping, template de prompt de "shape que vira 8–12 estados de UI": https://x.com/twoclipping/status/2103273003555402193
- @notdwd, remake do vídeo de lançamento da Gojiberry lado a lado (1:05): https://x.com/notdwd/status/2103959324385300552 (prompt longo: https://x.com/notdwd/status/2103959830423859595)
- @notdwd, "ANOTHER ONE" (0:12): https://x.com/notdwd/status/2104229441211969685
- @notdwd, prompt que vira landing page (7,5 s), com prompt completo na 1ª resposta: https://x.com/notdwd/status/2104138101102621133

**Pendente:** os prompts completos desses posts estão atrás do "Mostrar mais" e nas respostas. Se colar, eu salvo aqui do lado.

# BRIEF · VSLPLAY brand ad "A marca se constrói"

Written 2026-09-29 in the style of the reference prompt Vítor pasted. English on purpose, so it can be handed to any other chat as-is; every on-screen word stays in Brazilian Portuguese, taken from vslplay.com. Frame study: `SPEC.md`. House rules: `motion-base/DESIGN-SYSTEM.md` and `motion-base/LICOES-MOTION.md` win over anything here.

---

OUTPUT
1920 × 1080, 16:9, 30 fps, 48.0 s (1,440 frames). Genuinely smooth motion with directional motion blur only while things move. Finished video with a synchronized original score and sound design, master −14 LUFS integrated, true peak ≤ −1 dBTP. No voiceover.

CREATIVE DIRECTION
An Apple-grade brand film for VSLPLAY, a video player for sales videos (VSLs) that charges nothing per play or bandwidth.
The spine of the film is the logo itself: we watch the real VSLPLAY mark get built from its own parts, taken apart, and rebuilt. Its pieces become the film's cast:
• the white dot is the protagonist (it bounces, lands, and becomes the period of every headline);
• the rounded play triangle is the play button;
• the three ribbons (warm, cool, purple) peel off and become the three chapters, each one a flat color field that collapses into the first product element of its chapter.
Inside the chapters, every feature demonstrates its own function in a faithful replica of the real VSLPLAY player, the way the reference's words BOUNCE, STRETCH, SPIN and SNAP demonstrate their own verbs.
The whole film behaves like a video playing inside the player: a tiny timecode in the upper right and a hairline progress track along the bottom, always subordinate.
Do not introduce gradients as decoration, background glows, glass, particle explosions, stock b-roll, 3D environments, emoji, em-dashes on screen, or a redrawn logo. Use the traced vector pieces of the real logo (`logo/` in the source), textures sampled from the real file.

VISUAL SYSTEM
Stages alternate every 2 to 5 seconds, as in the reference:
• Black stage #0B0B0C (logo build, "E muito mais", finale).
• Paper stage #F2F1EE (all product demos, price, integrations).
• Chapter fields, flat, sampled from the logo ribbons: Coral #EC5F78 (warm ribbon, chapter 1), Cyan #3DCBEE (cool ribbon, chapter 2), Violet #6A10D8 (purple ribbon, chapter 3). Sun #FFD84D only for the "NOVO" tags and as the fourth color swatch.
• Ink #111113 on paper and on coral or cyan; white #FFFFFF on black and on violet.
• One accent per chapter. The player's "Cor Principal" takes the chapter color, so the player itself quietly changes identity with each chapter.
The only gradients allowed are the logo's own ribbon textures, and only while a ribbon is at logo scale; when a ribbon grows into a field it flattens to its chapter color before it passes 50% of the frame.

Typography (2 families, per DESIGN-SYSTEM P14):
• Display: Archivo variable. Headlines uppercase, weight 800 to 900, width axis 62 to 75 (tall, dense, condensed), tracking −0.01 em. Chapter words 300 px cap height. The width axis is animatable: the "Aparência" title literally stretches.
• Text and UI: Inter 500/600/700. Support lines 34 px, notes and sources 23 px minimum, tabular figures for all numbers and timecodes.
• The real player uses the system font; Inter stands in for it.

Technical decoration (always under 35% opacity, never competing):
• Timecode 00:00:00:00 at the upper right, Inter 500 23 px, tabular.
• Progress hairline at y 1040, 1 px, with small diamonds at chapter starts and 23 px labels: atenção, retenção, conversão.
• Callouts: a thin 1.5 px line that draws on toward a detail, ending in a 23 px Inter label. They replace the reference's handwritten notes (a third family is not allowed).

The player (faithful to cdn.vslplay.com/player.js):
• 1152 × 648 on paper, right-aligned with a 96 px margin, near-black #0F0F10 body, radius from the "Bordas" setting (starts 12 px), soft neutral shadow 0 30 60 rgba(0,0,0,.18).
• Smart AutoPlay overlay: dimmed video (#000 at 60%), a rounded box in the smart-autoplay color, Phosphor SpeakerSlash icon at 33% width, a small pill "Seu vídeo já começou" and bold "Clique para ouvir", plus the real "ping" back-animation.
• Keep-watching overlay: full cover in the primary color, "Você já começou a assistir esse vídeo", buttons "Continuar assistindo" and "Assistir do início" with ringed icons.
• Controls bar: Phosphor fill icons (play, speaker, gear, corners), time "07:42 / 18:30", 5 px range track, 8 px fake progress bar in the primary color.
• CTA under the player: "COMPRAR AGORA" in the primary color.
• The content is a presenter keyed from a free Mixkit clip over a neutral studio gray.
Text column on the left (x 96 to 600): chapter tag, feature title in Archivo, one support line in Inter.

SEQUENCE (frame numbers at 30 fps; one beat = 14 frames at 128.57 BPM)

0:00.00 to 0:03.73 (f0 to f112) · THE MARK BUILDS ITSELF, black stage
A white dot, 94 px, falls from the upper left onto a 1 px ground hairline at y 770 that draws on beneath it. It bounces to the right with real gravity: impacts at f14, f28, f42, f56 (on the beat), each bounce 0.68 of the previous height, squash 2.6 for exactly one frame at contact, stretch 0.60 at top speed, a slight 1.16 flattening at each apex, area preserved. Pale 1.5 px outline onion skins trail it, closer at the top of each arc and farther apart in the fall.
The fourth impact (f56) is the anticipation: a heavier squash held 2 frames, then the dot launches straight up out of frame with a strong stretch.
f58 to f70: the ground line retracts to the center while the outline of the rounded play triangle draws itself on. f70: SNAP. The triangle fills solid white with no easing, overscaled 4% for one frame, while thin white guides flash along its bounding box for 4 frames ("no ease, on purpose").
f72 to f100: the three ribbons close around the triangle like aperture blades, each rotating in from about 100° around the icon center with scale 1.25 to 1 and directional blur: cool from the left (f72), warm from the upper right (f76), purple from below (f80), each landing with a damped settle. As the purple ribbon closes, the triangle is pressed: a 0.94 squash and its white turns into the black of the stage, becoming the negative space it is in the real logo.
f98 to f112: the dot falls back in from the top and lands in its socket on the warm ribbon at f112, with a one-frame squash. The icon is complete and fills 74% of the frame height (795 px), so the dot is exactly the size it had while bouncing.

0:03.73 to 0:07.47 (f112 to f224) · LOCKUP AND PROMISE
Continuous camera pull-back (ease-in-out, 40 frames) to lockup scale, icon moving left. The wordmark builds: V, S, L rise from a baseline mask with 2-frame stagger, slight rotation and vertical blur; P, L, A, Y (monoline) draw themselves stroke by stroke with 4-frame stagger. Lockup settled by f168.
f172 to f186: under the lockup, word by word: "Banda e cliques ilimitados." (from the site headline "Player de vídeo com largura de banda e cliques ilimitados"). Slow push-in while it holds.

0:07.47 to 0:09.33 (f224 to f280) · DECONSTRUCTION AND CHAPTER 1
f224 to f236: tagline and wordmark drop away with reverse stagger. The icon comes to the center and pushes toward camera.
f236 to f252: the icon comes apart: the cool ribbon slides out left, the purple ribbon down, the dot pops up out of frame, the triangle sinks back; the warm ribbon grows toward camera and flattens into a full Coral field by f252.
f252 to f280: "ATENÇÃO." in ink, letters rising with stagger and vertical blur; the white dot drops in last as the period and settles after the type. Hold at least 12 frames.

0:09.33 to 0:16.80 (f280 to f504) · CHAPTER 1: ATENÇÃO (Coral)
f280 to f294: the letters leave upward and the Coral field collapses, with a fast approach, into the Smart AutoPlay box inside the player; the paper stage and the player open around it.
f294 to f364 SMART AUTOPLAY. Title "SMART AUTOPLAY", support "O vídeo parece já estar em andamento." The presenter plays muted behind the overlay, the ping pulses. The cursor glides in and clicks the box at f336 (on the beat). The overlay collapses, the video restarts: time snaps to 00:00, the controls slide up. Callout on the time: "começa do início no clique".
f364 to f434 THUMBNAILS. Title "THUMBNAILS", support "Pausou? Uma capa persuasiva aparece." The cursor clicks the video at f392; the frame freezes and the pause cover is in on the same frame: the frozen frame darkened, "FALTA POUCO." in Archivo, a Coral play button.
f434 to f504 CONTINUE ASSISTINDO. Title "CONTINUE ASSISTINDO", support "Volta de onde parou." The keep-watching overlay covers the player in Coral. The cursor clicks "Continuar assistindo" at f462; the overlay lifts and playback resumes at 07:42, the progress knob jumping to its spot (callout "07:42").
f490 to f504: the cool ribbon sweeps in from the left with its real curved edge and flattens into a Cyan field.

0:16.80 to 0:24.27 (f504 to f728) · CHAPTER 2: RETENÇÃO (Cyan)
f504 to f532: "RETENÇÃO." with the dot as period.
f532 to f602 BARRA FICTÍCIA. The Cyan field collapses into the player's 8 px fake progress bar, which the camera frames large. Above it, a position-versus-time diagram draws: thin ink axes, a dashed gray diagonal "tempo real" and a Cyan fast-then-slow curve "barra fictícia". Both bars run with their curves: outline ticks along the bar are far apart at the start and bunch up at the end (the reference's spacing lesson). Title "BARRA FICTÍCIA", support "O vídeo parece mais curto." The graph and the bar must express the same timing mathematically.
f602 to f728 GRÁFICO DE RETENÇÃO (showpiece). The bar line becomes the time axis. The real retention curve of the VSLPLAY demo dashboard (video "VSLPLAY - VIDEO PARA O SITE", 3:04, traced from the site GIF) draws itself; the camera follows its head at about 2.4x with a black tag showing "00:04 · 69%" and updating. At f644 the head reaches the knee (00:06, 58%): a circle draws around it, fills Cyan, and a callout reads "−42% nos primeiros 6 s". f672 to f700: the camera opens to the whole curve, which finishes at 03:04. f700 to f728: the demo KPIs land above it with 3-frame stagger: 14K Visitas, 3,5K Cliques, 8,6K Visitas únicas, 24,54% Play rate. Title "GRÁFICO DE RETENÇÃO", support "Veja onde o público perde o interesse." Source at 23 px: "Dados de demonstração do painel VSLPLAY".
f714 to f728: the purple ribbon rises from below and flattens into a Violet field.

0:24.27 to 0:32.20 (f728 to f966) · CHAPTER 3: CONVERSÃO (Violet)
f728 to f756: "CONVERSÃO." in white, dot as period.
f756 to f826 BOTÃO DELAY. The Violet field collapses into a small diamond marker at 12:30 on the player's progress track. The playhead travels to it; at f798 it touches the marker, the diamond squashes (anticipation) and the "COMPRAR AGORA" button grows out of that exact point under the player with a damped overshoot. Title "BOTÃO DELAY", support "Surge no minuto que você escolher." Callout "12:30".
f826 to f896 CONTROLES. Title "CONTROLES", support "Mostre só o que quiser." Eight real options appear as a checklist: Play/Pause, Barra de progresso, Tempo percorrido, Duração do vídeo, Botão de volume, Barra de volume, Velocidade, Fullscreen. Toggles fire on eighth notes (every 7 frames); each one adds or removes its control on the player's bar with the same timing, the rest of the bar reflowing smoothly.
f896 to f966 APARÊNCIA. Title "APARÊNCIA" whose Archivo width axis animates in sync with the player, support "Personalize cor, bordas e formato." Four swatches (Violet, Coral, Cyan, Sun); on each beat the ring jumps to the next and the player's primary color changes by a wipe that starts at the swatch side. Then "Bordas": the radius grows. At f930 the player stretches from horizontal to vertical 9:16 with elastic resistance, overshoots and recovers (the reference's STRETCH), and the title stretches wide and settles back with it.

0:32.20 to 0:35.93 (f966 to f1078) · PRICE, paper stage
Enter with a fast lateral whip and directional blur. A huge tabular counter rolls "0" to "100.000 plays/ano". Two rows answer it in sync: "Concorrente V***B" rolling from R$ 7.164 to R$ 8.164 with the note "cobra R$ 0,02 por play extra", and "VSLPLAY" frozen at R$ 582 with "R$ 0,00 de custo extra". At f1036 a circle draws around R$ 582 and the line "Sem cobrança por plays ou banda." lands. Source at 23 px: "Comparativo em vslplay.com, cenário real com 100.000 plays/ano".

0:35.93 to 0:38.73 (f1078 to f1162) · E MUITO MAIS, black stage
Header "E muito mais". One line per beat, each rising from a mask, earlier lines stepping back to 40%: "Teste A/B de Vídeo", "Teste A/B de Headline", "Análise de Pitch", "Simulador de Views ao Vivo", "Filtro de Tráfego", "Pixel", each with a small Sun "NOVO" tag. The last line holds at least 14 frames.

0:38.73 to 0:41.53 (f1162 to f1246) · INTEGRAÇÕES, paper stage
"Compatível com YouTube e MP4." A small icon sits at the center and the 14 real integration logos from the site shoot out of it to a 2 × 7 grid with 2-frame stagger and follow-through: Hotmart, Eduzz, WordPress, Elementor, Great Pages, Webflow, Wix, Cademí, Memberkit, Astron Members, Builderall, Leadlovers, Ticto, Typebot. Shown at native pixel size for crispness.

0:41.53 to 0:48.00 (f1246 to f1440) · THE MARK REBUILDS, black stage
f1246 to f1276: a thin circular mechanism (concentric hairlines, radial ticks) fills while "+2.000" counts up with "usuários satisfeitos" beneath; the white dot sits in the center.
f1276 to f1288: anticipation. The dot compresses and draws back; the music drops to near silence for 0.4 s.
f1288: release. The three ribbons return from the sides they left from, the triangle snaps, the dot lands in its socket (f1330). The icon is whole again.
f1344 to f1372: the wordmark builds exactly as in the opening (the circle closes).
f1372 to f1440: "Teste por 7 dias grátis." and "vslplay.com" land under the lockup and hold with a slow push-in until the end.

MOTION REQUIREMENTS
Animation quality is the priority. Entrances use the approach curve (each frame covers 12 to 19% of the remaining distance); camera moves use a symmetric ease-in-out of 30 to 45 frames; nothing moves at constant speed except clock time and slow drifts. Every hold keeps a push-in of about 0.25% per frame, so no frame is frozen for more than 8 frames outside the final lockup.
Minimum 9 frames per move, 15 to 23 for large ones; 2 to 4 frames of stagger within a group; text stays still at least 8 frames before it moves again.
Use anticipation, overlapping action, squash and stretch, follow-through and damped overshoot where the reference uses them, and keep the SNAP sharp.
Preserve continuous velocity through connected moves: a chapter field that collapses into a UI element keeps its curve, and the next scene continues from where the element landed.
One focal point per frame. Subpixel precision; crisp still text; directional blur only during motion and never across a cut.
Do not crossfade between stills, duplicate frames, jitter, or wobble elastically for no reason.

AUDIO
Original score at 128.57 BPM (14 frames per beat), restrained electronic, built so the cuts and hits land on the grid. Sparse intro (the dot's impacts are the first beats), the groove enters when the icon completes (f112), each chapter card lands on a downbeat, a breakdown under the price counter, full energy in "E muito mais", 0.4 s of near silence before the final release (f1276 to f1288), a final chord under the lockup, 0.2 s tail.
Sound design on the exact frame of each visible action: soft taps for the bounces (falling pitch), a weighty squash at f56, an up-whoosh for the launch, a dry transient for the SNAP, three tight swishes for the ribbons, a click-pop when the dot lands, tiny ticks for letters, real-feeling mouse clicks for the cursor, ticks for toggles, pitched blips for color changes, a restrained elastic sound for the stretch, a tone that follows the retention curve, accelerating ticks under the counters, a thud for each stamp, soft pops for the logos.
Master −14 LUFS ± 1, true peak ≤ −1 dBTP. Render the picture muted and mux the audio with ffmpeg (copy video, AAC audio).

FINAL CHECK
Compare against the references at matching moments: bounce timing and ratios, type stagger and blur, SNAP, whip, chart camera, circle stamp.
Verify spelling and accents of every Portuguese word, every number against its source, the logo against the original file, and the player against the real CSS.
Watch the whole film at normal speed before delivery. Look for accidental stops, frozen stretches, repeated frames, broken blur, text that moves before it can be read, two things fighting for attention, and sound off its visual hit. Then a fresh session that did not build it reviews it, starting from rejection, and nothing ships below 8/10.



---

AS BUILT (v5, after four fresh-session critiques and the owner's "animate the logo too")
Where the build departs from the sequence above, this is what shipped and why. `src/timeline.ts` in the source is the single source of truth for every frame.

Logo animation (v5)
• Opening build: the triangle outline draws and SNAPs white (f70). Then the three ribbons of the real mark fall onto the icon as paper flaps with true perspective, each hinged on an outer edge of the squircle: cool on the left edge (released f74, lands f84), warm on the top edge (f78, lands f88), purple on the bottom edge (f81, lands f91). Each is released at 70 degrees and is whole from its first frame, falls under gravity in 10 frames and bounces twice (11 deg, then 2.5 deg); the icon gives under each landing (0.7 to 1.1%). The camera pushes in 3.5% during the build.
• Paper, not plastic: a tilted flap darkens toward its own ribbon's darkest color (cool #015CC7, warm #E44E7D, purple #5205C3, multiply, at most 25%), never toward black (the v4 black shade turned the warm ribbon khaki). Under a flap that has landed lies its own footprint in its shadow, and while the triangle is white a white band continues 14 units under the flaps' edges: a bounce lifts the paper off white next to the triangle and off its own shadow along the seams, never off a black keyline.
• The play button is pressed on the beat (f98): 0.97 in three frames with a light grey socket wall around it, and it turns into negative space at the bottom of the press (f101). The dot lands on the downbeat (f112), where the music starts.
• Finale rebuild: the coral field shrinks back into the warm ribbon (f1316) and is drawn in front of the flaps (it comes from the camera and lands last, f1332), so it uncovers the cool and purple flaps as it recedes (they land f1329 and f1331). The play triangle stays negative space all through the rebuild (a white SNAP, a press and a cut back to black read as a flicker); the guides flash at f1332 with the lock sound; the dot lands f1344.
• The button: once the offer has landed, the dot gives one last small hop in its socket on the bar line (crouch f1398, up 40 px, lands f1412 with a squash; the icon gives).
• Sound: the flap landings are tuned paper hits (D, F#, A in the opening; A, C# in the finale), each with the air of its fall and a soft second contact on the bounce.
• A standalone 7.5 s logo animation ("Vinheta" composition, same code as the opening): the lockup settles in the center, no tagline, the dot's hop at f182, and its own sound (the landing resolves on a D major chord). Also a 4.5 s cut (frames 66 to 200) and the same animation on a transparent background (ProRes 4444) for editors.

Picture
• Chapter words start before their field has settled, so no flat field sits empty: ATENÇÃO f246, RETENÇÃO f500, CONVERSÃO f721.
• The violet wipe: the purple ribbon out of its mark is an odd boot-shaped silhouette, so it grows into the field in 7 frames (full by f720) and goes flat sooner (the first critique saw a blob over the chart).
• Feature camera (the first critique found the demos playing as slides). The player lives in a window right of the text column (x 648 to 1824, y 96 to 984). The camera pushes into each action; when the player grows past its rest box it is cut to that window with rounded corners and its shadow redrawn on the visible rect.
  – Smart AutoPlay: the Coral field collapse lands on the box at 1.6x and holds through the click (f336); pull back f344 to f358.
  – Thumbnails: a 6-frame punch-in to 1.1x on the pause click (f392), a slow drift, pull back f422 to f434.
  – Continue assistindo: push to 1.3x f438 to f456 framing both buttons, the seek bar and the time readout. After the click the camera leans in on the knob as it jumps to 07:42, with the player's hover tooltip counting up to 07:42 (replaces the "07:42" callout).
  – Botão delay: push to 1.8x f776 to f794 on the 12:30 marker and the button slot; hold through the hit (f798) and the button growing (f810); pull back f818 to f832.
  – Controles: push to 1.5x f838 to f854 on the right half of the bar, where every toggle lands (Barra de progresso, Barra de volume, Velocidade, Botão de volume); pull back f876 to f890.
  – Aparência stays wide: the 9:16 stretch needs the room.
• The "começa do início no clique" callout is gone; the push shows it.
• Gráfico de retenção: the diagram draws back into its origin while the fictitious bar rises and thins into the chart's time axis (f588 to f600, no cross-dissolve). The chart camera zooms in anchored on the y axis so it never crosses the title column (f596 to f612), draws the 6-second cliff, reaches the knee at f630, a 236 px circle draws (f632), fills Cyan and holds "−42%" with "nos primeiros 6 s" to its right; the view widens with the head (f640 to f662); the KPIs land from f654 and everything holds to f714.
• Price: the counter rolls 0 to 100.000 in one second (f974 to f1004); the pill draws around R$ 582 at f1013 and fills on the beat at f1022; "Sem cobrança por plays ou banda." holds about 48 frames. Prices at 120 px.
• Integrações in two parts: "Compatível com links do YouTube e arquivos MP4." with a YouTube mark and an MP4 file plugging into the icon (f1162 to f1204); they fold into it, "Integrações" titles the grid and the 14 logos burst out one per frame (from f1206), the full grid holding about a second.
• Finale shifted by 14 frames: dial f1260 to f1294, spiral f1294 to f1304, anticipation f1304 to f1316, release f1316, SNAP f1332, press f1336 (the triangle turns into the stage on a single frame), dot lands f1344, wordmark f1354, CTA f1376.
• Opening bounce widened: horizontal speed 26 to 14 px/frame from x≈92, onion skins on the current arc only, directional blur only above 60 px/frame, apex flattening 1.16.
• Motion blur: the number of samples adapts to the speed everywhere (samples at most 4 px apart; the whip adds a directional gaussian across its 16 px sample spacing). Small fast layers take their own count: the cursor a sample every 2 px (up to 24), the delay diamond every 2 px on screen (up to 40), the growing ribbons every 3 px (up to 96), softened by half their spacing while they grow. The logo textures are awaited before any frame renders (the first critique found a one-frame dropout at f1331).
• Controles: each toggled control lights up in a violet pill for two frames, so the eye finds each change as the bar ping-pongs. The corner readout reads like the player's own ("0:16 / 0:48"). "+2.000 usuários satisfeitos" counts f1264 to f1280 and holds 14 frames.

Sound
• Every cue retimed to the frames above.
• Each chapter has its own kit: Atenção four on the floor with a shaker; Retenção sixteenth hats and a syncopated kick; Conversão open hats, clap and snare on 2 and 4 and a pickup kick into every bar. A fill of snare ghosts and falling toms leads into each wipe (f490, f714).
• Macro dynamics: the cold open builds from -6.5 dB into the downbeat (f112), the groove sits 4 dB lower under the logo and the tagline, and the score steps back 5 dB under the price. Loud hits are pre-attenuated 3 to 5 dB so the limiter leaves their transients alone. LRA about 5 LU (3.2 in v4).
• The finale has no press sound any more (the triangle stays negative space); the SNAP at f1332 is the lock.
• The retention tone is now a quiet pluck line on the D major pentatonic that plays the curve under the drawing head (about 9 dB under the score).
• One layer per chapter over the loop: Coral, off-beat pluck chords; Cyan, an octave shimmer; Violet, a 3-3-2 pluck motif that climbs into the price.
• Phone speakers: saturated bass harmonics and a presence lift on the score, effects bus 4 dB down. Through a 300 Hz high-pass the effects now sit about 4 LU above the score (12 LU in v2).
• SNAPs pre-attenuated 7 dB, so the limiter leaves their transients alone. Soft air moves under every camera push. The cyan and violet wipe whooshes peak on their fields (f500 and f720).
• The last chord lets go at f1390 and decays to the end instead of a 0.2 s cut.

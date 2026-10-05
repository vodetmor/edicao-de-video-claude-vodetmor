"""Mix da parte 5 (Anna Augusta). Cordas lentas (BeardMusicStock "I'm Feeling Sad"): a parte mais humana;
a natureza em cor ganha água corrente, a enchente ganha chuva, e o fim sobe no crescendo das cordas."""
from mixlib import Mix, ramp, db, load, fades, lufs, AC, SR
import numpy as np
m = Mix(5, 56.4)

# ---------------- trilha
e1 = m.env(); ramp(e1, 31.4, 32.2, 1, db(-3)); ramp(e1, 32.2, 37.3, db(-3), db(-3))
m.trilha("08-beardmusicstock-i-m-feeling-sad.wav", 0.0, 0.2, 37.9, fi=1.2, fo=1.0, gap=-7.0, env=e1)
m.trilha("08-beardmusicstock-i-m-feeling-sad.wav", 112.0, 37.0, 56.4, fi=1.0, fo=1.8, gap=-6.5)

# ---------------- ambiência
ag = load(f"{AC}/sfx/agua-corrente.wav", 1, 6.6)
m.place(m.amb, fades(ag, 0.6, 1.2) * db(m.voz_lufs - 26 - lufs(ag)), 12.85)
ch = load(f"{AC}/sfx/chuva-forte.wav", 40, 5.6)
m.place(m.amb, fades(ch, 0.5, 0.8) * db(m.voz_lufs - 24 - lufs(ch)), 26.0)

# ---------------- efeitos
m.fxat("papel-2", 0.0, -16, real=True)
for t, n in ((0.72, 12), (1.88, 16), (3.02, 14), (4.16, 8)): m.datilografa(t, n, 26, -31)
m.datilografa(5.0, 27, 20, -31)
for i in range(4): m.fxat("lapis", 6.4 + i * 0.1, -23)
m.fxat("thud", 8.52, -12)
for i in range(4): m.fxat("thud", 10.72 + i * 0.1, -11)
m.fxat("boom-sub", 10.72, -5)
m.fxat("tick", 11.1, -20); m.fxat("tick", 11.55, -20)
m.fxat("whoosh-longo", 12.5, -18)
for t, n in ((15.66, 4), (16.28, 4), (16.95, 2), (17.98, 6)):
    m.fxat("whoosh", t - 0.3, -25); m.datilografa(t + 0.03, n, 20, -30)
m.fxat("lapis", 20.84, -18); m.fxat("boom-sub", 20.84, -6)
m.fxat("boom-sub", 22.42, -8)
for i in range(7): m.fxat("tick", 29.05 + i * 5 / 30, -22)
m.fxat("whoosh-longo", 31.2, -18)
rng = np.random.default_rng(5)
for i in range(60): m.fxat("tick", 32.6 + rng.random() * 1.6, -35 - rng.random() * 4)
m.fxat("boom-sub", 33.3, -4)
m.datilografa(32.7, 20, 26, -30); m.datilografa(35.3, 12, 24, -28)
m.fxat("papel-2", 37.35, -14, real=True); m.datilografa(38.1, 13, 22, -29)
m.fxat("whoosh", 45.4 - 0.4, -20); m.fxat("whoosh", 48.2 - 0.3, -24); m.fxat("whoosh-longo", 52.9, -22)
m.render()

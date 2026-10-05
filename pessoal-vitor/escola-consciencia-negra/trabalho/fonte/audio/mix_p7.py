"""Mix da parte 7 (Anna Júlia) + tela final. Drone "Coming From Above" (Jesse Keller) com o clímax caindo em
"essa luta ainda continua"; a chuva e o trovão da abertura voltam em "da próxima vez que chover forte";
o piano da história (parte 1) volta no fim e segura o título e os créditos: o filme fecha o ciclo."""
from mixlib import Mix, ramp, db, load, fades, lufs, AC, SR
import numpy as np
from importlib import util
DUR = 83.4
m = Mix(7, DUR)

# ---------------- trilha
m.trilha("07-jesse-keller-coming-from-above.wav", 60.0, 0.1, 23.6, fi=1.6, fo=0.7, gap=-7.0)
e = m.env(); ramp(e, 33.9, 34.7, 1, 0)
m.trilha("07-jesse-keller-coming-from-above.wav", 199.0, 23.3, 34.75, fi=0.5, fo=0.05, gap=-5.0, env=e)
e2 = m.env(); ramp(e2, 52.6, 53.2, 1, db(-5)); ramp(e2, 53.2, 57.2, db(-5), db(-5)); ramp(e2, 57.2, 58.4, db(-5), db(1))
m.trilha("01-gubindmitry-sad-atmospheric-ambient-piano.wav", 0.0, 43.4, DUR, fi=1.4, fo=3.2, gap=-6.5, env=e2)

# ---------------- ambiência: a chuva da abertura
ch = load(f"{AC}/sfx/chuva-forte.wav", 0, 8.2)
m.place(m.amb, fades(ch, 0.6, 1.6) * db(m.voz_lufs - 14 - lufs(ch)), 34.7)

# ---------------- efeitos
m.fxat("thud", 5.55, -12)
m.datilografa(8.6, 23, 26, -29)
m.fxat("papel-2", 12.95, -15, real=True)
m.datilografa(13.9, 30, 34, -32)
for t, n in ((15.35, 10), (16.1, 7), (16.85, 11)):
    m.datilografa(t, n, 26, -31); m.fxat("tick", t + 0.27, -22)
m.fxat("whoosh-longo", 17.6, -18)
rng = np.random.default_rng(7)
for i in range(24): m.fxat("tick", 19.2 + rng.random() * 0.9, -34)
m.fxat("boom-sub", 20.85, -6); m.fxat("lapis", 21.45, -24)
m.datilografa(20.85, 8, 22, -29); m.datilografa(21.43, 8, 22, -29); m.datilografa(22.25, 7, 22, -29)
m.fxat("whoosh", 23.55 - 0.35, -18); m.datilografa(23.7, 17, 24, -28)
m.fxat("whoosh", 24.6 - 0.3, -22); m.datilografa(24.7, 29, 28, -29)
for i in range(40): m.fxat("tick", 27.0 + 1.7 * (1 - (1 - i / 40) ** 2), -30)
m.fxat("boom-sub", 28.85, -4)
tv = m.A("trovao-1")[: int(2.4 * SR)].copy(); tv[int(0.8 * SR):] *= np.linspace(1, 0, len(tv) - int(0.8 * SR)) ** 2
m.place(m.fx, tv, 36.05, -12); m.fxat("boom-sub", 36.05, -5)
m.fxat("whoosh", 36.85 - 0.3, -24); m.fxat("whoosh", 38.9 - 0.2, -20); m.fxat("whoosh", 39.9 - 0.2, -20)
m.datilografa(39.2, 8, 24, -30)
m.fxat("lapis", 40.75, -18)
m.fxat("boom-sub", 42.55, -2); m.fxat("boom-leve", 42.55, -14)
m.fxat("whoosh-longo", 43.2, -22)
m.fxat("boom-sub", FIM := 53.2 + 0.4, -3); m.fxat("boom-sub", 53.2 + 1.1, -1); m.fxat("boom-grande", 55.3, -10)
m.render()

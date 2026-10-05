"""Mix da parte 3 (Cainã). Música: violoncelo de tensão (Eracilon) no território e na planta,
drone de baixo (Jesse Keller) sob os números, que cai para quase nada na pausa do "7 em cada 10"."""
from mixlib import Mix, ramp, db, load, fades, lufs, AC, SR
import numpy as np
m = Mix(3, 70.6)

# ---------------- trilha
e1 = m.env(); ramp(e1, 27.6, 28.7, 1, db(-4)); ramp(e1, 28.7, 30.4, db(-4), db(-4)); ramp(e1, 30.4, 31.2, db(-4), 1)
m.trilha("03-eracilon-cellofan.wav", 20.0, 0.3, 49.2, fi=1.8, fo=0.9, gap=-6.5, env=e1)
e2 = m.env(); ramp(e2, 60.9, 61.6, 1, db(-11)); ramp(e2, 61.6, 63.5, db(-11), db(-13))
m.trilha("04-jesse-keller-bass-movement.wav", 100.0, 48.7, 63.75, fi=0.9, fo=0.35, gap=-5.5, env=e2)
m.trilha("03-eracilon-cellofan.wav", 120.0, 65.3, 70.6, fi=1.2, fo=1.8, gap=-7.0)

# ---------------- ambiência: projetor no lampejo da história
proj = load(f"{AC}/sfx/projetor.wav", 0, 2.4)
m.place(m.amb, fades(proj, 0.1, 0.4) * db(m.voz_lufs - 24 - lufs(proj)), 34.35)

# ---------------- efeitos
for i in range(5):
    m.fxat("lapis", 0.5 + i * 0.3, -25)
m.fxat("thud", 5.8, -12)                       # fita do nome
m.fxat("thud", 8.02, -13); m.fxat("tick", 8.02, -20)   # alfinete pousa
m.fxat("whoosh", 9.2 - 0.45, -20)
m.fxat("lapis", 12.3, -22)
m.datilografa(13.5, 5, 22, -27); m.datilografa(13.98, 7, 22, -27)
m.fxat("whoosh-longo", 14.5, -19)
for t, n in ((16.3, 9), (17.62, 5), (26.27, 8), (26.95, 8)):
    m.fxat("thud", t + 0.1, -11); m.datilografa(t + 0.14, n, 22, -30)
m.place(m.fx, fades(load(f"{AC}/sfx/agua-corrente.wav", 3, 1.6), 0.3, 0.6), 19.1, -30)
m.fxat("whoosh", 20.6, -23)
m.datilografa(19.3, 6, 22, -29); m.datilografa(20.75, 7, 22, -29)
m.fxat("lapis", 23.4, -18)
m.fxat("boom-sub", 27.7, -5)
m.fxat("boom-sub", 28.8, -3); m.fxat("boom-sub", 29.38, -1)
m.fxat("whoosh", 31.2 - 0.3, -18)
m.datilografa(31.98, 5, 22, -27); m.datilografa(33.4, 12, 26, -27)
rb = m.S("rebobina"); m.place(m.fx, rb[: int(0.9 * SR)], 34.4 - 0.1, -16)
m.fxat("boom-leve", 34.4, -12)
for t in (36.9, 38.64, 40.58):
    m.fxat("whoosh", t - 0.3, -21)
m.datilografa(37.05, 7, 22, -28); m.datilografa(38.75, 11, 22, -28); m.datilografa(40.95, 13, 22, -28)
for t in (42.68, 44.6, 46.86):
    m.fxat("boom-sub", t, -4)
for t in (43.38, 45.58, 47.9):
    m.fxat("thud", t, -10)
m.fxat("whoosh-longo", 48.5 - 0.2, -19)
rng = np.random.default_rng(3)
for i in range(40):                              # pontos do mapa acendendo
    m.fxat("tick", 49.15 + i * 0.03 + rng.random() * 0.02, -34 - rng.random() * 4)
m.datilografa(50.6, 14, 22, -27)
for i in range(46):                              # contador rolando, desacelera
    t = 54.25 + 2.65 * (1 - (1 - i / 46) ** 2)
    m.fxat("tick", t, -31)
m.fxat("whoosh-longo", 58.15 - 0.3, -17)
for k in range(7):
    m.fxat("tick", 58.84 + k * 2 / 30, -18); m.fxat("thud", 58.84 + k * 2 / 30, -20)
m.fxat("boom-sub", 60.55, -2)
m.fxat("boom-sub", 64.69, -3)
m.fxat("whoosh", 65.45 - 0.4, -20)
m.fxat("lapis", 66.1, -27)
m.render()

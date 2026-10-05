"""Mix da parte 4 (Luísa). Textura escura e fria (Serge Quadrado) = a estrutura invisível.
Em "palavra." a música some: 1 s de silêncio real antes do nome."""
from mixlib import Mix, ramp, db, load, fades, lufs, AC, SR
import numpy as np
m = Mix(4, 63.4)

# ---------------- trilha
m.trilha("05-serge-quadrado-dark-ambient-texture.wav", 60.0, 0.0, 4.5, fi=0.6, fo=0.3, gap=-6.0)
e = m.env(); ramp(e, 47.2, 48.0, 1, db(2)); ramp(e, 48.0, 55.8, db(2), db(2)); ramp(e, 55.8, 56.6, db(2), 1)
m.trilha("05-serge-quadrado-dark-ambient-texture.wav", 120.0, 5.3, 63.4, fi=1.6, fo=1.4, gap=-6.5, env=e)

# ---------------- ambiência: água no fim (a estrutura vira rio)
ag = load(f"{AC}/sfx/agua-corrente.wav", 2, 4.0)
m.place(m.amb, fades(ag, 1.2, 1.0) * db(m.voz_lufs - 22 - lufs(ag)), 59.4)

# ---------------- efeitos
m.fxat("whoosh", 4.62, -26)
m.fxat("boom-sub", 5.3, -6)
m.fxat("thud", 6.3, -12)
m.datilografa(5.6, 10, 22, -28); m.datilografa(9.95, 9, 24, -29); m.datilografa(10.8, 4, 24, -29)
m.fxat("whoosh", 9.72 - 0.15, -16); m.fxat("whoosh", 10.55 - 0.15, -16)
m.fxat("whoosh-longo", 11.3, -22); m.fxat("lapis", 11.62, -26)
m.datilografa(12.3, 10, 20, -27)
m.fxat("boom-sub", 14.05, -3); m.fxat("boom-sub", 14.7, -1)
m.fxat("whoosh", 15.85 - 0.4, -20)
m.fxat("lapis", 16.3, -26); m.fxat("lapis", 18.2, -26)
m.fxat("whoosh", 22.1 - 0.4, -20)
for t in (23.4, 24.45, 25.1): m.fxat("lapis", t, -22)
m.fxat("lapis", 26.05, -18)
m.fxat("papel-2", 26.8, -14, real=True)
m.fxat("thud", 29.3, -14); m.fxat("thud", 31.82, -9)
for t in (30.94, 35.7, 40.12): m.fxat("whoosh", t - 0.3, -20)
m.datilografa(36.57, 14, 20, -28)
for i in range(30): m.fxat("tick", 40.8 + 1.05 * (1 - (1 - i / 30) ** 2), -30)
m.fxat("whoosh-longo", 47.0, -20)
for t in (48.05, 51.9, 53.3):
    m.fxat("boom-sub", t + 0.15, -4); m.fxat("thud", t + 0.15, -13)
m.datilografa(50.84, 7, 24, -27); m.datilografa(52.32, 16, 26, -27); m.datilografa(53.58, 8, 24, -27)
m.fxat("whoosh", 55.85 - 0.4, -22); m.fxat("lapis", 57.3, -26)
m.render()

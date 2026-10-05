"""Mix da parte 6 (Maria Alice). Piano/cordas (BeardMusicStock "Sad Instrumental") recortado para o crescendo
(src 84 s) chegar em 31.1 s, quando entram os movimentos (quilombolas, moradia...): a resistência ganha corpo.
A balança pesa com ticks e um thud; a máquina de escrever datilografa o princípio; o fim abre no split mapa/planta."""
from mixlib import Mix, ramp, db
import numpy as np
m = Mix(6, 59.8)

# ---------------- trilha
e1 = m.env(); ramp(e1, 9.2, 10.4, 1, db(-4)); ramp(e1, 10.4, 12.0, db(-4), 1)   # respiro antes do título
m.trilha("02-beardmusicstock-sad-instrumental.wav", 52.9, 0.0, 59.8, fi=1.6, fo=1.6, gap=-6.5, env=e1)

# ---------------- efeitos
m.fxat("whoosh-longo", 0.1, -20)
m.fxat("lapis", 5.6, -24)
rng = np.random.default_rng(6)
for i in range(30): m.fxat("tick", 6.95 + i * 0.04 + 0.35 + rng.random() * 0.03, -27 - rng.random() * 4)
m.fxat("thud", 8.6, -13)
m.fxat("whoosh", 9.2, -22)
for i in range(15): m.fxat("tick", 9.45 + i * 0.05, -30)
m.fxat("boom-sub", 10.46, -6); m.fxat("thud", 11.04, -12)
m.fxat("papel-2", 11.9, -15, real=True)
m.datilografa(12.2, 28, 24, -31)
m.datilografa(14.0, 63, 18.5, -30)
for t in (17.5, 19.5, 20.5): m.fxat("whoosh", t - 0.25, -26); m.fxat("thud", t, -18)
m.datilografa(22.05, 67, 20.6, -30)
m.fxat("whoosh-longo", 28.4, -21)
for t in (31.1, 34.4, 36.15, 39.4): m.fxat("whoosh", t - 0.3, -22); m.fxat("thud", t, -15)
m.fxat("boom-sub", 31.1, -8)
m.fxat("whoosh-longo", 48.8, -21)
for i in range(50): m.fxat("tick", 50.6 + rng.random() * 1.6, -36 - rng.random() * 4)
m.fxat("boom-sub", 52.6, -7)
m.fxat("whoosh", 54.3, -20); m.fxat("thud", 54.6, -13)
for i in range(4): m.fxat("lapis", 54.8 + i * 0.35, -24)
m.render()

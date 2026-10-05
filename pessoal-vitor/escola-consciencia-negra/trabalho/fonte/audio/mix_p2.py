"""Mix da parte 2 (Maria Eduarda). Trilha: Celestial Aeon "Dark Secrets" (a única ainda não usada; mistério de arquivo).
Respira em silêncio em "esse padrão ganha um nome" e volta com o boom do globo em 1982. Máquina de escrever nas etiquetas."""
from mixlib import Mix, ramp, db
import numpy as np
m = Mix(2, 80.0)

e1 = m.env()
ramp(e1, 40.3, 41.0, 1, 0.0); ramp(e1, 41.0, 42.3, 0.0, 0.0); ramp(e1, 42.3, 42.9, 0.0, 1)   # o silêncio antes do nome
m.trilha("06-celestial-aeon-project-dark-secrets.wav", 0.0, 0.0, 80.0, fi=2.0, fo=2.4, gap=-7.0, env=e1)

# ---------------- efeitos
m.fxat("whoosh-longo", 0.2, -22)
m.fxat("thud", 2.95, -16)                                          # o chão que se parte
m.fxat("lapis", 3.75, -22)
for i in range(10): m.fxat("tick", 5.14 + i * 0.05, -28)            # casas na encosta
for i in range(4): m.fxat("tick", 6.2 + i * 0.07, -28)
for i in range(5): m.fxat("tick", 6.9 + i * 0.05, -28)
m.fxat("whoosh", 8.6, -22)
m.datilografa(9.3, 15, 24, -31)
m.fxat("whoosh-longo", 10.5, -21)
m.datilografa(13.9, 19, 22, -30)
m.fxat("boom-sub", 17.42, -7); m.fxat("whoosh", 17.2, -20)
m.datilografa(20.26, 14, 22, -30); m.datilografa(21.74, 20, 22, -30)
m.fxat("thud", 23.84 + 0.25, -13); m.datilografa(24.14, 25, 26, -31)
m.fxat("whoosh", 26.9, -20); m.fxat("thud", 27.4, -15)
for i, d in enumerate([0, 0.1, 0.03, 0.13]): m.fxat("thud", 30.22 + d + 0.25, -10 - i)    # cortiços desabando
m.fxat("boom-sub", 30.4, -6)
m.fxat("whoosh", 32.8, -20); m.fxat("whoosh", 32.9, -24)
rng = np.random.default_rng(2)
for i in range(36): m.fxat("tick", 33.2 + i * 0.023 + rng.random() * 0.03, -30)
m.fxat("thud", 35.3, -14)
for i in range(12): m.fxat("tick", 37.1 + i * 0.16, -27)          # régua dos anos
m.fxat("boom-sub", 42.42, -5); m.fxat("whoosh-longo", 42.2, -17)   # 1982: o globo gira
m.fxat("thud", 44.8, -12)                                          # alfinete em Warren County
m.datilografa(44.8, 13, 20, -29); m.datilografa(46.2, 23, 26, -30)
m.fxat("whoosh-longo", 46.6, -19)
m.fxat("whoosh", 52.9, -20); m.fxat("thud", 53.3, -14)
for i in range(4): m.fxat("thud", 53.9 + i * 0.1, -19)
m.datilografa(53.9, 11, 22, -30); m.datilografa(55.3, 17, 24, -30)
m.fxat("whoosh", 56.5, -20); m.datilografa(57.2, 20, 24, -31)
m.datilografa(59.4, 40, 30, -32)
m.fxat("boom-sub", 62.0, -6)
m.fxat("papel-2", 63.9, -14, real=True); m.datilografa(64.4, 18, 22, -30)
m.fxat("thud", 68.04, -16)
m.fxat("whoosh-longo", 72.9, -20)
m.fxat("lapis", 77.3, -22); m.fxat("lapis", 77.6, -24)
m.render()

# Base comum das cenas da questão da tangente (ENEM 2025): relógio da voz, cores, texto com halo, figura do INEP vetorizada.
import json, re
import numpy as np
from manim import *

BASE = "/mnt/project-files/pessoal-vitor/questao-tangente"
PW = json.load(open(f"{BASE}/audio/palavras.json"))
PAUSAS = json.load(open(f"{BASE}/audio/pausas.json"))
FPS = 30
DUR_VOZ = PW[-1]["e"]
CAUDA = 2.4                      # depois da última palavra: volta ao quadro 0 (loop)
FIM_VIDEO = round(DUR_VOZ + CAUDA, 3)

def _n(s): return re.sub(r"[^0-9a-zà-ú]", "", s.lower())
TOK = [_n(w["w"]) for w in PW]
def w(frase, apos=0.0, fim=False):
    """Tempo (s, linha do tempo final) da primeira ocorrência da frase depois de `apos`."""
    alvo = [_n(x) for x in frase.split()]
    for i in range(len(TOK) - len(alvo) + 1):
        if PW[i]["s"] >= apos - 1e-6 and TOK[i:i + len(alvo)] == alvo:
            return PW[i + len(alvo) - 1]["e"] if fim else PW[i]["s"]
    raise ValueError(f"frase não achada: {frase} (depois de {apos})")
def pausa(etapa): return next(p for p in PAUSAS if p["etapa"] == etapa)

# limites das cenas = começo de cada pausa de transição
LIM = [0.0] + [p["de"] for p in PAUSAS] + [FIM_VIDEO]

PAPEL = ManimColor("#F5F5F7"); TINTA = ManimColor("#1D1D1F"); CINZA = ManimColor("#86868B"); CINZA2 = ManimColor("#C7C7CC")
AZUL = ManimColor("#0071E3"); LARANJA = ManimColor("#E8590C"); FRAMB = ManimColor("#C2185B")
VERDE = ManimColor("#2E9B4E"); CURVA = ManimColor("#9B1C1C"); AGUA = ManimColor("#7CC6F2"); AGUA2 = ManimColor("#4FA8E0")
MARCA = ManimColor("#FFE08A"); MESA = ManimColor("#7A5230"); PE = ManimColor("#8E8E93")
COR_K, COR_M, COR_P = AZUL, LARANJA, FRAMB

config.frame_rate = FPS
config.background_color = PAPEL

TPL = TexTemplate()
TPL.add_to_preamble(r"\newcommand{\tg}{\operatorname{tg}}")
config.tex_template = TPL

# halo da cor do fundo atrás de todo texto/fórmula: nenhuma linha atravessa as letras (lição da aula de lançamento oblíquo)
_tex_init = SingleStringMathTex.__init__
def _tex_halo(self, *a, **k):
    _tex_init(self, *a, **k)
    self.set_stroke(color=PAPEL, width=8, opacity=1, background=True)
SingleStringMathTex.__init__ = _tex_halo
def _desenha(self, vmobjects, pixel_array):
    ctx = self.get_cairo_context(pixel_array)
    vms = list(vmobjects)
    for vm in vms:
        self.set_cairo_context_path(ctx, vm); self.apply_stroke(ctx, vm, background=True)
    for vm in vms:
        self.set_cairo_context_path(ctx, vm); self.apply_fill(ctx, vm); self.apply_stroke(ctx, vm)
Camera.display_multiple_non_background_colored_vmobjects = _desenha

CORES_TEX = {"k": COR_K, "m": COR_M, "p": COR_P}
def M(*partes, tam=48, cor=TINTA, mapa=None):
    m = MathTex(*partes, font_size=tam, color=cor)
    cores = {**CORES_TEX, **(mapa or {})}
    for sub, tex in zip(m.submobjects, m.tex_strings):
        if tex.strip() in cores: sub.set_color(cores[tex.strip()])
    return m

def T(s, tam=34, cor=TINTA, peso=MEDIUM, halo=True, **k):
    t = Text(s, font="Inter", font_size=tam, color=cor, weight=peso, **k)
    if halo: t.set_stroke(PAPEL, width=7, background=True)
    return t

def formula_geral(tam=56):
    return M("D", "=", "k", "+", r"\tg", r"\big[", "p", r"\,(", "T", "+", "m", r")", r"\big]", tam=tam)

# ---------------------------------------------------------------- figura do INEP, redesenhada em vetor
# Curva esquemática igual à do INEP (a figura da prova não está em escala):
# D_s(T) = 30 + 9·tg[½(T − 5/2)]  -> mesmas assíntotas (5 ± 2π)/2, mesmo centro (2,5 ; 30), D(0) ≈ 3, D(4) ≈ 38.
ESC = 9.0
def D_s(t): return 30 + ESC * np.tan(0.5 * (t - 2.5))
A_ESQ, A_DIR = (5 - 2 * np.pi) / 2, (5 + 2 * np.pi) / 2
D_MIN_COPO, D_BOCA = 3.0, 45.0
def raio(d):  # perfil do vaso que, enchido com vazão constante, gera exatamente essa curva (área ∝ 1/(dD/dT))
    return 1.22 / np.sqrt(1 + ((d - 30) / ESC) ** 2) + 0.13

class Figura(VGroup):
    """Copo + mesa + gráfico, com rastreador de tempo T. Partes nomeadas para animar e dar foco."""
    def __init__(self, x0=-1.5, y0=-1.75, vx=-4.65, com_copo=True, **kw):
        super().__init__(**kw)
        self.t = ValueTracker(0.0)
        ax = Axes(x_range=[-1.3, 6.4, 1], y_range=[-12, 54, 10], x_length=7.6, y_length=5.3,
                  tips=True, axis_config={"color": CINZA, "stroke_width": 3, "include_ticks": False, "tip_width": 0.18, "tip_height": 0.18})
        ax.shift(np.array([x0, y0, 0]) - ax.c2p(0, 0))
        self.ax = ax
        self.lbl_T = M("T", tam=40, cor=CINZA).next_to(ax.x_axis.get_end(), UP, buff=0.15)
        self.lbl_D = M("D", tam=40, cor=CINZA).next_to(ax.y_axis.get_end(), RIGHT, buff=0.15)
        self.eixos = VGroup(ax, self.lbl_T, self.lbl_D)
        # assíntotas
        def assint(x):
            return DashedLine(ax.c2p(x, -12), ax.c2p(x, 54), dash_length=0.07, dashed_ratio=0.5, color=VERDE, stroke_width=3.5)
        self.as_esq, self.as_dir = assint(A_ESQ), assint(A_DIR)
        self.lab_esq = M(r"\frac{5-2\pi}{2}", tam=34).next_to(ax.c2p(A_ESQ, -12), LEFT, buff=0.12).shift(UP * 0.35)
        self.lab_dir = M(r"\frac{5+2\pi}{2}", tam=34).next_to(ax.c2p(A_DIR, -12), RIGHT, buff=0.12).shift(UP * 0.35)
        self.assintotas = VGroup(self.as_esq, self.as_dir, self.lab_esq, self.lab_dir)
        # curva: cheia em [0,4], tracejada fora (como no INEP)
        self.curva = ax.plot(D_s, x_range=[0, 4, 0.01], color=CURVA, stroke_width=5)
        lo = 2.5 - 2 * np.arctan(42 / ESC); hi = 2.5 + 2 * np.arctan(24 / ESC)
        self.tr_esq = DashedVMobject(ax.plot(D_s, x_range=[lo, 0, 0.01], color=CURVA, stroke_width=4), num_dashes=10)
        self.tr_dir = DashedVMobject(ax.plot(D_s, x_range=[4, hi, 0.01], color=CURVA, stroke_width=4), num_dashes=12)
        self.curvas = VGroup(self.tr_esq, self.curva, self.tr_dir)
        # marcas 0, 2,5, 4 e 30 com guias tracejadas cinzas
        g = lambda a, b: DashedLine(a, b, dash_length=0.06, color=CINZA, stroke_width=2.5)
        self.guias = VGroup(g(ax.c2p(0, 30), ax.c2p(2.5, 30)), g(ax.c2p(2.5, 0), ax.c2p(2.5, 30)), g(ax.c2p(4, 0), ax.c2p(4, D_s(4))))
        self.n0 = M("0", tam=34).next_to(ax.c2p(0, 0), DR, buff=0.1)
        self.n25 = M("2{,}5", tam=34).next_to(ax.c2p(2.5, 0), DOWN, buff=0.16)
        self.n4 = M("4", tam=34).next_to(ax.c2p(4, 0), DOWN, buff=0.16)
        self.n30 = M("30", tam=34).next_to(ax.c2p(0, 30), LEFT, buff=0.14)
        self.marcas = VGroup(self.guias, self.n0, self.n25, self.n4, self.n30)
        self.centro = Dot(ax.c2p(2.5, 30), radius=0.08, color=TINTA)
        self.add(self.eixos, self.assintotas, self.marcas, self.curvas, self.centro)
        # copo
        self.y_of = lambda d: ax.c2p(0, d)[1]
        self.vx = vx
        if com_copo:
            ds = np.linspace(D_MIN_COPO, D_BOCA, 60)
            esq = [np.array([vx - raio(d), self.y_of(d), 0]) for d in ds]
            dir_ = [np.array([vx + raio(d), self.y_of(d), 0]) for d in ds]
            self.parede = VGroup(VMobject(color=TINTA, stroke_width=4).set_points_smoothly(esq),
                                 VMobject(color=TINTA, stroke_width=4).set_points_smoothly(dir_))
            y0m, y3 = self.y_of(0), self.y_of(D_MIN_COPO)
            self.pe = Polygon([vx - 0.62, y0m, 0], [vx + 0.62, y0m, 0], [vx + raio(3), y3, 0], [vx - raio(3), y3, 0],
                              color=PE, fill_color=PE, fill_opacity=1, stroke_width=0)
            self.mesa = RoundedRectangle(width=3.6, height=0.22, corner_radius=0.05, color=MESA, fill_color=MESA, fill_opacity=1,
                                         stroke_width=0).move_to([vx, y0m - 0.11, 0])
            self.agua = always_redraw(self._agua)
            self.copo = VGroup(self.mesa, self.pe, self.agua, self.parede)
            self.add(self.copo)
        # ponto que corre na curva + guia azul do nível
        self.ponto = always_redraw(lambda: Dot(ax.c2p(self.t.get_value(), D_s(self.t.get_value())), radius=0.09, color=AZUL))
        self.guia_nivel = always_redraw(self._guia)
    def nivel(self): return D_s(self.t.get_value())
    def _agua(self, d0=D_MIN_COPO):
        L = self.nivel()
        if L <= d0 + 0.05: return VMobject()
        ds = np.linspace(d0, L, 40)
        pts = [np.array([self.vx - raio(d), self.y_of(d), 0]) for d in ds] + [np.array([self.vx + raio(d), self.y_of(d), 0]) for d in ds[::-1]]
        return Polygon(*pts, color=AGUA2, fill_color=AGUA, fill_opacity=0.85, stroke_width=0)
    def _guia(self):
        L = self.nivel(); y = self.y_of(L)
        a = np.array([self.vx + raio(min(max(L, 3), 45)) + 0.05, y, 0]); b = self.ax.c2p(self.t.get_value(), L)
        return DashedLine(a, b, dash_length=0.08, color=AGUA2, stroke_width=2.5)

class Trilha(VGroup):
    """As 3 caixinhas k, m, p no canto superior direito (mapa do vídeo)."""
    def __init__(self, valores=("?", "?", "?"), **kw):
        super().__init__(**kw)
        self.caixas = VGroup()
        for i, (letra, cor, v) in enumerate(zip("kmp", (COR_K, COR_M, COR_P), valores)):
            r = RoundedRectangle(width=1.5, height=0.72, corner_radius=0.16, stroke_color=cor, stroke_width=3, fill_color=WHITE, fill_opacity=1)
            l = M(letra, "=", tam=38, cor=cor)
            val = self.valor(v, cor)
            g = VGroup(r, l, val)
            l.move_to(r.get_center() + LEFT * 0.33); val.next_to(l, RIGHT, buff=0.12)
            self.caixas.add(g)
        self.caixas.arrange(RIGHT, buff=0.18).to_corner(UR, buff=0.32)
        self.add(self.caixas)
    @staticmethod
    def valor(v, cor):
        return M(v, tam=38, cor=CINZA if v == "?" else cor)
    def preenche(self, i, v):
        cx = self.caixas[i]; cor = (COR_K, COR_M, COR_P)[i]
        novo = self.valor(v, cor).next_to(cx[1], RIGHT, buff=0.12)
        return Succession(Transform(cx[2], novo, run_time=0.5), Indicate(cx, color=cor, scale_factor=1.12, run_time=0.5))

def cartao_etapa(texto):
    t = T(texto, tam=46, peso=SEMIBOLD)
    linha = Line(LEFT, RIGHT, color=AZUL, stroke_width=5).set_width(t.width * 0.35).next_to(t, DOWN, buff=0.22)
    return VGroup(t, linha)

class Base(Scene):
    INI = 0.0; FIM = 0.0
    def at(self, t):
        dt = t - self.INI - self.renderer.time
        if dt < -0.08: print(f"[atraso] {type(self).__name__}: {dt:+.2f}s antes de {t:.2f}")
        if dt > 1e-3: self.wait(dt)
    def fecha(self):
        self.at(self.FIM)
    def etapa(self, nome, cor=AZUL):
        """Pausa de transição: título da etapa aparece e sai dentro da pausa da voz."""
        p = pausa(nome); c = cartao_etapa(nome)
        self.at(p["de"]); self.play(FadeIn(c, shift=UP * 0.2), run_time=0.35)
        self.at(p["ate"] - 0.3); self.play(FadeOut(c, shift=UP * 0.2), run_time=0.3)

class Base3D(ThreeDScene):
    INI = 0.0; FIM = 0.0
    at = Base.at; fecha = Base.fecha
    def etapa(self, nome):
        p = pausa(nome); c = cartao_etapa(nome)
        self.add_fixed_in_frame_mobjects(c); self.remove(c)
        self.at(p["de"]); self.play(FadeIn(c, shift=UP * 0.2), run_time=0.35)
        self.at(p["ate"] - 0.3); self.play(FadeOut(c, shift=UP * 0.2), run_time=0.3)
    def fixo(self, *ms):
        self.add_fixed_in_frame_mobjects(*ms); self.remove(*ms)
        return ms[0] if len(ms) == 1 else ms

def ramos_tg(ax, k=0.0, m=0.0, p=1.0, ymin=-3.0, ymax=3.0, esc=1.0, cor=CURVA, largura=5, xmin=None, xmax=None, **kw):
    """y = k + esc·tg[p(x + m)], um ramo por período, cortado em [ymin, ymax] e na janela do eixo"""
    xmin = ax.x_range[0] if xmin is None else xmin; xmax = ax.x_range[1] if xmax is None else xmax
    g = VGroup()
    per = np.pi / p
    n0 = int(np.floor((xmin + m) / per)) - 1; n1 = int(np.ceil((xmax + m) / per)) + 1
    ua = np.arctan((ymin - k) / esc); ub = np.arctan((ymax - k) / esc)
    for n in range(n0, n1 + 1):
        c = -m + n * per
        x0 = max(c + ua / p, xmin); x1 = min(c + ub / p, xmax)
        if x1 - x0 < 1e-3: continue
        g.add(ax.plot(lambda x: k + esc * np.tan(p * (x - c)), x_range=[x0, x1, (x1 - x0) / 120], color=cor, stroke_width=largura, **kw))
    return g

def assintotas_tg(ax, m=0.0, p=1.0, ymin=None, ymax=None, xmin=None, xmax=None, cor=VERDE):
    xmin = ax.x_range[0] if xmin is None else xmin; xmax = ax.x_range[1] if xmax is None else xmax
    ymin = ax.y_range[0] if ymin is None else ymin; ymax = ax.y_range[1] if ymax is None else ymax
    per = np.pi / p; g = VGroup()
    n0 = int(np.floor((xmin + m) / per)) - 2; n1 = int(np.ceil((xmax + m) / per)) + 2
    for n in range(n0, n1 + 1):
        x = -m + (n + 0.5) * per
        if xmin + 1e-3 < x < xmax - 1e-3:
            g.add(DashedLine(ax.c2p(x, ymin), ax.c2p(x, ymax), dash_length=0.07, dashed_ratio=0.5, color=cor, stroke_width=3.5))
    return g

def icone(tipo, cor):
    if tipo == "elevador":
        cx = RoundedRectangle(width=0.5, height=0.62, corner_radius=0.08, stroke_color=cor, stroke_width=3)
        up = Triangle(color=cor, fill_color=cor, fill_opacity=1, stroke_width=0).scale(0.09).shift(UP * 0.13)
        dn = Triangle(color=cor, fill_color=cor, fill_opacity=1, stroke_width=0).scale(0.09).rotate(PI).shift(DOWN * 0.13)
        return VGroup(cx, up, dn)
    if tipo == "esteira":
        b = RoundedRectangle(width=0.95, height=0.3, corner_radius=0.15, stroke_color=cor, stroke_width=3)
        r = VGroup(Circle(radius=0.07, color=cor, stroke_width=3).shift(LEFT * 0.3), Circle(radius=0.07, color=cor, stroke_width=3).shift(RIGHT * 0.3))
        a = Arrow(LEFT * 0.4, RIGHT * 0.4, buff=0, color=cor, stroke_width=3, tip_length=0.12).shift(UP * 0.32)
        return VGroup(b, r, a)
    z = VMobject(color=cor, stroke_width=3).set_points_as_corners([[-0.42 + 0.12 * i, 0.16 * (1 if i % 2 else -1), 0] for i in range(8)])
    a = DoubleArrow(LEFT * 0.5, RIGHT * 0.5, buff=0, color=cor, stroke_width=3, tip_length=0.12).shift(DOWN * 0.36)
    return VGroup(z, a)

def chip(tipo, letra, nome, cor):
    ic = icone(tipo, cor).scale(0.7)
    g = VGroup(ic, M(letra, tam=34, cor=cor), T(nome, tam=22, cor=cor, peso=SEMIBOLD)).arrange(RIGHT, buff=0.14)
    r = RoundedRectangle(width=g.width + 0.32, height=0.7, corner_radius=0.18, stroke_color=cor, stroke_width=2.5, fill_color=WHITE, fill_opacity=1)
    return VGroup(r, g.move_to(r))

def info(*linhas, pos=(-4.75, 1.25, 0), largura=None):
    g = VGroup(*linhas).arrange(DOWN, aligned_edge=LEFT, buff=0.22)
    r = RoundedRectangle(width=(largura or g.width) + 0.5, height=g.height + 0.42, corner_radius=0.16, stroke_color=CINZA2, stroke_width=2,
                         fill_color=WHITE, fill_opacity=1)
    caixa = VGroup(r, g.move_to(r)).move_to(pos)
    if caixa.get_left()[0] < -6.75:
        caixa.shift(RIGHT * (-6.75 - caixa.get_left()[0]))
    if caixa.get_right()[0] > 6.85:
        caixa.shift(LEFT * (caixa.get_right()[0] - 6.85))
    return caixa

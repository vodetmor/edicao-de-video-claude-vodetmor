# Derivações da aula em Manim (fundo transparente, sequência PNG). Cada cena começa num quadro absoluto
# do vídeo final e espera as palavras da locução (relogio.json) para cada passo.
# Render: bash render.sh  -> /root/aula/public/manim/<Cena>/<Cena>0000.png ...
import json
from manim import *

R = json.load(open("/root/aula/src/data/relogio.json"))
W = R["palavras"]; FPS = R["fps"]
PAUS = {p["i"]: (round(p["de"] * FPS), round(p["ate"] * FPS)) for p in R["pausas"]}
P = lambda i, d=0: W[i]["f"] + d

TINTA = ManimColor("#1D1D1F"); CINZA = ManimColor("#86868B")
AZUL = ManimColor("#0071E3"); LARANJA = ManimColor("#E8590C"); VERM = ManimColor("#D70015")
config.background_opacity = 0.0
config.frame_rate = FPS

PAPEL = ManimColor("#F5F5F7")
# Toda fórmula ganha um contorno da cor do fundo por trás (halo): linha, eixo ou chão que passe atrás não corta o texto.
_tex_init = SingleStringMathTex.__init__
def _tex_halo(self, *a, **k):
    _tex_init(self, *a, **k)
    self.set_stroke(color=PAPEL, width=9, opacity=1, background=True)
SingleStringMathTex.__init__ = _tex_halo
# Halo de todas as letras primeiro, depois o preenchimento: o halo de uma letra nunca come a letra vizinha.
def _desenha(self, vmobjects, pixel_array):
    ctx = self.get_cairo_context(pixel_array)
    vms = list(vmobjects)
    for vm in vms:
        self.set_cairo_context_path(ctx, vm); self.apply_stroke(ctx, vm, background=True)
    for vm in vms:
        self.set_cairo_context_path(ctx, vm); self.apply_fill(ctx, vm); self.apply_stroke(ctx, vm)
Camera.display_multiple_non_background_colored_vmobjects = _desenha

CORES = {r"v_{0x}": AZUL, r"v_{0y}": LARANJA, r"v_{0y}^2": LARANJA, r"v_y": LARANJA, r"v_y^2": LARANJA, r"\Delta y": LARANJA, "H": LARANJA, "A": AZUL}

def _frac(partes):
    # "{num", r"\over", "den}" -> r"\frac{", num, "}{", den, "}" (assim cada termo casa entre fórmulas)
    out = []
    for p in partes:
        bal = p.count("{") - p.count("}")
        if p == r"\over": out.append("}{")
        elif p.startswith("{") and bal == 1: out += [r"\frac{", p[1:]]
        elif p.endswith("}") and bal == -1: out += [p[:-1], "}"]
        else: out.append(p)
    return [x for x in out if x != ""]

def M(*partes, tam=56, cor=TINTA, mapa=None):
    m = MathTex(*_frac(partes), font_size=tam, color=cor)
    cores = {**CORES, **(mapa or {})}
    for sub, tex in zip(m.submobjects, m.tex_strings):
        if tex.strip() in cores: sub.set_color(cores[tex.strip()])
    return m

PX = 3.95  # centro do painel de fórmulas (metade direita da tela)

class Base(Scene):
    INI = 0
    def at(self, q):
        dt = (q - self.INI) / FPS - self.renderer.time
        if dt > 1e-3: self.wait(dt)
    def troca(self, a, b, rt=0.9, **kw):
        self.play(TransformMatchingTex(a, b, **kw), run_time=rt)
        return b
    def caixa(self, m, cor=TINTA):
        r = SurroundingRectangle(m, color=cor, buff=0.22, corner_radius=0.12, stroke_width=3)
        r.set_fill(PAPEL, 1).set_z_index(-1)  # fundo cheio atrás da fórmula: nenhuma linha do palco atravessa a caixa
        self.play(Create(r), run_time=0.6)
        return r

# ---------------------------------------------------------------- componentes
class Comp(Base):
    INI = P(98)
    def construct(self):
        pa, pb = PAUS[102], PAUS[115]
        ex = MathTex(r"v_0 = 20\ \text{m/s},\quad \sin\theta = 0{,}8,\quad \cos\theta = 0{,}6", font_size=30, color=CINZA).move_to([3.7, 3.3, 0])
        self.at(pa[0] + 2)
        a = M(r"\cos", r"\theta", "=", r"{\text{adjacente}", r"\over", r"\text{hipotenusa}}", mapa={r"\text{adjacente}": AZUL}).move_to([PX, 1.4, 0])
        self.play(Write(a), run_time=1.0)
        self.at(pa[0] + 42)
        b = M(r"\cos", r"\theta", "=", r"{v_{0x}", r"\over", r"v_0}").move_to([PX, 1.4, 0])
        a = self.troca(a, b, 0.8)
        self.at(P(103))
        c = M(r"v_{0x}", "=", r"v_0", r"\cos", r"\theta").move_to([PX, 1.4, 0])
        a = self.troca(a, c, 1.0, path_arc=-PI / 3)
        bx = self.caixa(a, AZUL)
        self.at(P(108))
        self.play(FadeIn(ex, shift=DOWN * 0.15), run_time=0.6)
        n1 = M("=", r"20 \cdot 0{,}6", "=", r"12\ \text{m/s}", tam=42, cor=CINZA).next_to(a, DOWN, buff=0.45).align_to(a, LEFT)
        self.at(P(110) + 6)
        self.play(Write(n1), run_time=0.8)
        # o bloco horizontal sobe para dar lugar ao vertical
        self.at(P(111))
        g1 = VGroup(a, bx, n1)
        self.play(g1.animate.scale(0.8).move_to([PX, 2.2, 0]), run_time=0.7)
        self.at(pb[0] + 2)
        d = M(r"\sin", r"\theta", "=", r"{\text{oposto}", r"\over", r"\text{hipotenusa}}", mapa={r"\text{oposto}": LARANJA}).move_to([PX, -0.7, 0])
        self.play(Write(d), run_time=1.0)
        self.at(pb[0] + 38)
        e = M(r"\sin", r"\theta", "=", r"{v_{0y}", r"\over", r"v_0}").move_to([PX, -0.7, 0])
        d = self.troca(d, e, 0.8)
        self.at(P(116))
        f = M(r"v_{0y}", "=", r"v_0", r"\sin", r"\theta").move_to([PX, -0.7, 0])
        d = self.troca(d, f, 1.0, path_arc=-PI / 3)
        by = self.caixa(d, LARANJA)
        self.at(P(123) - 4)
        n2 = M("=", r"20 \cdot 0{,}8", "=", r"16\ \text{m/s}", tam=42, cor=CINZA).next_to(d, DOWN, buff=0.45).align_to(d, LEFT)
        self.play(Write(n2), run_time=0.8)
        self.at(P(124) + 6)
        self.play(FadeOut(VGroup(g1, d, by, n2, ex), shift=RIGHT * 0.3), run_time=0.5)

# ---------------------------------------------------------------- horizontal: MRU
class Mru(Base):
    INI = P(139)
    def construct(self):
        self.at(P(141))
        a = MathTex(r"a_x = 0", font_size=56, color=AZUL).move_to([PX, 2.4, 0])
        self.play(Write(a), run_time=0.7)
        self.at(P(147))
        b = MathTex(r"\Rightarrow\ ", r"v_x = v_{0x}", r"\ =\ \text{constante}", font_size=46, color=TINTA).next_to(a, DOWN, buff=0.4)
        b[1].set_color(AZUL)
        self.play(Write(b), run_time=0.9)
        self.at(P(154))
        c = M("x", "=", r"v_{0x}", r"\,", "t", tam=72).move_to([PX, 0.2, 0]); c[0].set_color(AZUL)
        self.play(Write(c), run_time=0.9)
        bx = self.caixa(c, AZUL)
        pa = PAUS[161]
        self.at(pa[0] - 4)
        tab = MathTex(r"\begin{array}{c|cccc} t\ (\text{s}) & 0 & 1 & 2 & 3 \\ \hline x\ (\text{m}) & 0 & 12 & 24 & 36 \end{array}", font_size=42, color=TINTA).move_to([PX, -1.5, 0])
        self.play(FadeIn(tab, shift=UP * 0.15), run_time=0.7)
        mais = VGroup(*[MathTex(r"+12", font_size=30, color=AZUL) for _ in range(3)])
        for k, m in enumerate(mais): m.move_to(tab.get_bottom() + DOWN * 0.38 + RIGHT * (-0.25 + k * 0.92))
        self.play(LaggedStart(*[FadeIn(m, shift=UP * 0.1) for m in mais], lag_ratio=0.25), run_time=0.8)
        self.at(P(162) - 8)
        self.play(FadeOut(VGroup(a, b, c, bx, tab, mais)), run_time=0.4)

# ---------------------------------------------------------------- vertical: gráfico v x t e área
class Muv(Base):
    INI = P(162)
    def construct(self):
        self.at(P(165))
        a = MathTex(r"a_y = -g", font_size=56, color=LARANJA).move_to([PX, 3.0, 0])
        self.play(Write(a), run_time=0.7)
        pa = PAUS[179]
        self.at(pa[0])
        ax = Axes(x_range=[0, 3.4, 1], y_range=[-17, 17, 8], x_length=4.6, y_length=3.4, tips=False,
                  axis_config={"color": TINTA, "stroke_width": 2.5, "include_ticks": False}).move_to([PX + 0.3, 0.55, 0])
        lx = MathTex("t", font_size=40, color=TINTA).next_to(ax.x_axis.get_end(), RIGHT, buff=0.15)
        ly = MathTex("v_y", font_size=40, color=LARANJA).next_to(ax.y_axis.get_end(), UP, buff=0.1)
        reta = ax.plot(lambda t: 16 - 10 * t, x_range=[0, 3.2], color=LARANJA, stroke_width=5)
        self.play(Create(ax), FadeIn(lx), FadeIn(ly), run_time=0.7)
        v0 = MathTex("v_{0y}", font_size=34, color=LARANJA).next_to(ax.c2p(0, 16), LEFT, buff=0.2).shift(DOWN * 0.12)
        self.play(Create(reta), FadeIn(v0), run_time=0.9)
        eqv = M(r"v_y", "=", r"v_{0y}", "-", "g", "t", tam=44).next_to(ax, DOWN, buff=0.35)
        # rótulo no espaço livre acima da reta (fora dos eixos), com um traço fino apontando para ela
        txt = MathTex(r"\text{inclinação} = -g", font_size=28, color=CINZA).move_to(ax.c2p(2.55, 6.5))
        alvo = ax.c2p(1.3, 3)
        guia = Line(txt.get_corner(DL) + LEFT * 0.05 + DOWN * 0.04, alvo, stroke_width=1.5, color=CINZA)
        incl = VGroup(txt, guia)
        self.play(Write(eqv), FadeIn(incl), run_time=0.8)
        # área sob a reta até um instante t = deslocamento: retângulo menos triângulo
        tt = 1.0
        ret = Polygon(ax.c2p(0, 0), ax.c2p(tt, 0), ax.c2p(tt, 16), ax.c2p(0, 16), stroke_width=0, fill_color=LARANJA, fill_opacity=0.28)
        tri = Polygon(ax.c2p(0, 16), ax.c2p(tt, 16), ax.c2p(tt, 16 - 10 * tt), stroke_width=2.5, stroke_color=TINTA, fill_color=ManimColor("#F5F5F7"), fill_opacity=1.0)
        self.play(FadeIn(ret), run_time=0.5)
        lr = MathTex(r"v_{0y}\,t", font_size=30, color=LARANJA).move_to(ax.c2p(tt / 2, 6))
        lr.set_stroke(width=0, background=True)  # dentro da área pintada: sem halo
        self.play(FadeIn(tri), Write(lr), run_time=0.6)
        lt = MathTex(r"\tfrac{1}{2}\,(g t)\,t", font_size=28, color=TINTA).next_to(tri, RIGHT, buff=0.12).shift(UP * 0.15)
        self.play(Write(lt), run_time=0.6)
        y = M("y", "=", r"v_{0y}", "t", "-", r"\tfrac{1}{2}", "g", "t^2", tam=56).move_to([PX, -2.55, 0])
        y[0].set_color(LARANJA)
        self.play(FadeOut(eqv), TransformFromCopy(VGroup(lr, lt), y), run_time=1.0)
        self.at(P(180))
        by = self.caixa(y, LARANJA)
        self.at(P(196))
        self.play(FadeIn(eqv.next_to(by, UP, buff=0.3).align_to(by, LEFT)), run_time=0.5)
        self.play(Indicate(eqv, color=LARANJA, scale_factor=1.08), Indicate(reta, color=LARANJA), run_time=0.9)
        self.at(P(206) - 6)
        self.play(FadeOut(VGroup(a, ax, lx, ly, reta, v0, incl, ret, tri, lr, lt, y, by, eqv)), run_time=0.4)

# ---------------------------------------------------------------- equação da trajetória
class Trajetoria(Base):
    INI = P(206)
    def construct(self):
        x = M("x", "=", r"v_{0x}", "t", tam=48); x.move_to([1.3, 2.95, 0], aligned_edge=LEFT); x[0].set_color(AZUL)
        y = M("y", "=", r"v_{0y}", "t", "-", r"{g", r"\over", "2}", "t^2", tam=48); y.move_to([1.3, 1.85, 0], aligned_edge=LEFT); y[0].set_color(LARANJA)
        self.play(FadeIn(x, shift=RIGHT * 0.3), FadeIn(y, shift=LEFT * 0.3), run_time=0.8)
        pa = PAUS[215]
        self.at(pa[0] + 2)
        t = M("t", "=", r"{x", r"\over", r"v_{0x}}", tam=48).move_to([5.6, 2.8, 0])
        self.play(TransformMatchingTex(x.copy(), t), run_time=0.9)
        self.at(pa[0] + 40)
        s = M("y", "=", r"v_{0y}", r"{x", r"\over", r"v_{0x}}", "-", r"{g", r"\over", "2}", r"{x^2", r"\over", r"v_{0x}^2}", tam=50).move_to([PX, 0.35, 0]); s[0].set_color(LARANJA)
        self.play(TransformFromCopy(VGroup(y, t), s), run_time=1.2)
        self.at(pa[0] + 92)
        u = MathTex(r"y", "=", r"\underbrace{\tan\theta}_{a}", r"\,x", "-", r"\underbrace{\frac{g}{2\,v_0^2\cos^2\theta}}_{b}", r"\,x^2", font_size=50, color=TINTA).move_to([PX, 0.3, 0])
        u.set_stroke(width=0, background=True)  # chaves são feitas de pedaços: o halo de um pedaço apaga o vizinho
        u[0].set_color(LARANJA)
        self.play(FadeOut(s, shift=UP * 0.2), FadeIn(u, shift=UP * 0.2), run_time=1.0)
        self.at(pa[0] + 140)
        p = MathTex(r"y = a\,x - b\,x^2", r"\ \Rightarrow\ \text{parábola}", font_size=46, color=TINTA).move_to([PX, -2.0, 0])
        self.play(Write(p), run_time=0.9)
        self.play(Circumscribe(p, color=TINTA, buff=0.15), run_time=0.8)
        self.at(P(216) - 2)
        self.play(FadeOut(VGroup(x, y, t, u, p)), run_time=0.4)

# ---------------------------------------------------------------- pergunta 1: tempo
class Tempo(Base):
    INI = P(226)
    def construct(self):
        self.at(P(233))
        a = M(r"v_y", "=", r"v_{0y}", "-", "g", "t").move_to([PX, 2.4, 0])
        self.play(Write(a), run_time=0.8)
        self.at(P(240))
        b = M("0", "=", r"v_{0y}", "-", "g", "t_s").move_to([PX, 2.4, 0])
        a = self.troca(a, b, 0.8)
        pa = PAUS[249]
        self.at(pa[0] + 2)
        c = M("g", "t_s", "=", r"v_{0y}").move_to([PX, 1.0, 0])
        self.play(TransformMatchingTex(a.copy(), c, path_arc=-PI / 4), run_time=0.9)
        self.at(pa[0] + 32)
        d = M("t_s", "=", r"{v_{0y}", r"\over", "g}").move_to([PX, 1.0, 0])
        c = self.troca(c, d, 0.9, path_arc=PI / 4)
        self.at(P(253))
        e = M("t_s", "=", r"{v_0", r"\sin", r"\theta", r"\over", "g}").move_to([PX - 1.5, 1.0, 0])
        c = self.troca(c, e, 0.9)
        bx = self.caixa(c)
        self.at(P(262) + 2)
        n = M("=", r"{16", r"\over", "10}", "=", r"1{,}6\ \text{s}", tam=40, cor=CINZA).next_to(bx, RIGHT, buff=0.3)
        self.play(Write(n), run_time=0.8)
        self.at(P(276))
        dsc = MathTex(r"t_{\text{descida}} = t_s", font_size=46, color=TINTA).move_to([PX, -0.5, 0])
        self.play(FadeIn(dsc, shift=UP * 0.15), run_time=0.6)
        self.at(P(280))
        T = M("T", "=", "2", "t_s", "=", r"{2", r"v_0", r"\sin", r"\theta", r"\over", "g}").move_to([PX, -1.8, 0])
        self.play(Write(T), run_time=1.0)
        bt = self.caixa(T)
        self.at(PAUS[290][0] + 2)
        n2 = MathTex(r"= 3{,}2\ \text{s}", font_size=42, color=CINZA).next_to(bt, DOWN, buff=0.3)
        self.play(Write(n2), run_time=0.6)
        self.at(P(291) + 4)
        self.play(FadeOut(VGroup(b, c, bx, n, dsc, T, bt, n2)), run_time=0.5)

# ---------------------------------------------------------------- pergunta 2: altura (Torricelli)
class Altura(Base):
    INI = P(321)
    def construct(self):
        self.at(P(327))
        a = M(r"v_y^2", "=", r"v_{0y}^2", "-", "2", "g", r"\Delta y").move_to([PX, 2.7, 0])
        a[0].set_color(LARANJA)
        nome = MathTex(r"\text{Torricelli}", font_size=32, color=CINZA).next_to(a, UP, buff=0.3)
        self.play(Write(a), FadeIn(nome), run_time=0.9)
        pa = PAUS[329]
        self.at(pa[0] + 2)
        n1 = MathTex(r"\text{no topo: } v_y = 0", font_size=32, color=LARANJA).next_to(a[0], DOWN, buff=0.5)
        n2 = MathTex(r"\Delta y = H", font_size=32, color=LARANJA).next_to(a[-1], DOWN, buff=0.5)
        self.play(FadeIn(n1, shift=UP * 0.1), run_time=0.5)
        self.play(FadeIn(n2, shift=UP * 0.1), run_time=0.5)
        self.at(P(330))
        b = M("0", "=", r"v_{0y}^2", "-", "2", "g", "H").move_to([PX, 2.7, 0])
        self.play(FadeOut(n1), FadeOut(n2), run_time=0.3)
        a = self.troca(a, b, 0.9)
        pb = PAUS[341]
        self.at(pb[0] + 2)
        c = M("2", "g", "H", "=", r"v_{0y}^2").move_to([1.95, 1.15, 0])
        self.play(TransformMatchingTex(a.copy(), c, path_arc=-PI / 4), run_time=0.9)
        self.at(pb[0] + 32)
        d = M("H", "=", r"{v_{0y}^2", r"\over", "2", "g}").move_to([1.95, 1.15, 0])
        c = self.troca(c, d, 0.9, path_arc=PI / 4)
        self.at(P(345))
        e = M("H", "=", r"{v_0^2", r"\sin^2", r"\theta", r"\over", "2", "g}", tam=50).move_to([5.1, 1.15, 0])
        self.play(TransformMatchingTex(c.copy(), e), run_time=1.0)
        bx = self.caixa(e, LARANJA)
        self.at(PAUS[360][0] + 2)
        n = M("=", r"{16^2", r"\over", "20}", "=", r"12{,}8\ \text{m}", tam=38, cor=CINZA).next_to(bx, DOWN, buff=0.15)
        self.play(Write(n), run_time=0.8)
        self.at(P(361) + 4)
        self.play(FadeOut(VGroup(nome, b, c, e, bx, n)), run_time=0.5)

# ---------------------------------------------------------------- pergunta 3: alcance + fórmula-herói
class Alcance(Base):
    INI = P(361)
    def construct(self):
        self.at(P(367))
        a = M("A", "=", r"v_{0x}", r"\cdot", "T").move_to([PX, 2.95, 0])
        self.play(Write(a), run_time=0.8)
        self.at(P(376))
        b = M("A", "=", r"v_0", r"\cos", r"\theta", r"\cdot", r"{2", r"v_0", r"\sin", r"\theta", r"\over", "g}").move_to([PX, 1.65, 0])
        self.play(TransformMatchingTex(a.copy(), b), run_time=1.0)
        self.at(P(390))
        c = MathTex("A", "=", r"{v_0^2\,(2\sin\theta\cos\theta)", r"\over", "g}", font_size=56, color=TINTA).move_to([PX, 0.2, 0]); c[0].set_color(AZUL)
        self.play(TransformFromCopy(b, c), run_time=0.9)
        self.at(P(392))
        idn = MathTex(r"2\sin\theta\cos\theta", "=", r"\sin 2\theta", font_size=44, color=CINZA).move_to([PX, -1.75, 0])
        self.play(Write(idn), run_time=1.0)
        self.play(Indicate(idn[2], color=TINTA), run_time=0.7)
        # herói: a fórmula vai para o centro, grande
        self.at(P(405))
        h = MathTex("A", "=", r"{v_0^2\,\sin 2\theta", r"\over", "g}", font_size=120, color=TINTA).move_to(ORIGIN); h[0].set_color(AZUL)
        self.play(FadeOut(VGroup(a, b, idn), shift=UP * 0.3), ReplacementTransform(c, h), run_time=1.2)
        bx = SurroundingRectangle(h, color=TINTA, buff=0.4, corner_radius=0.18, stroke_width=3).set_fill(PAPEL, 1).set_z_index(-1)
        self.play(Create(bx), run_time=0.8)
        self.at(PAUS[409][1] + 6)
        g = VGroup(h, bx)
        self.play(g.animate.scale(0.5).move_to([PX, 1.6, 0]), run_time=1.0)
        self.at(P(423) - 2)
        n = M("=", r"{400 \cdot 0{,}96", r"\over", "10}", "=", r"38{,}4\ \text{m}", tam=42, cor=CINZA).next_to(g, DOWN, buff=0.45)
        self.play(Write(n), run_time=0.9)
        self.at(P(424) + 6)
        self.play(FadeOut(VGroup(g, n)), run_time=0.5)

# ---------------------------------------------------------------- segredo 1: 45°
class Max45(Base):
    INI = P(431)
    def construct(self):
        y0 = 3.15
        self.at(P(439))
        a = MathTex(r"\sin 2\theta = 1", font_size=46, color=TINTA); a.move_to([-0.6, y0, 0], aligned_edge=LEFT)
        self.play(Write(a), run_time=0.7)
        self.at(P(446))
        b = MathTex(r"\Rightarrow\ 2\theta = 90^\circ", font_size=46, color=TINTA).next_to(a, RIGHT, buff=0.35)
        self.play(Write(b), run_time=0.7)
        self.at(P(451))
        c = MathTex(r"\Rightarrow\ \theta = 45^\circ", font_size=46, color=TINTA).next_to(b, RIGHT, buff=0.35)
        self.play(Write(c), run_time=0.7)
        self.play(Circumscribe(c, color=TINTA, buff=0.12), run_time=0.8)
        self.at(P(463) + 4)
        self.play(FadeOut(VGroup(a, b, c)), run_time=0.4)

# ---------------------------------------------------------------- segredo 2: complementares
class Compl(Base):
    INI = P(465)
    def construct(self):
        x0 = 4.0
        self.at(P(468))
        a = MathTex(r"\sin(2\cdot 30^\circ) = \sin 60^\circ", font_size=42, color=TINTA).move_to([x0, 3.2, 0])
        self.play(Write(a), run_time=0.8)
        self.at(P(470))
        b = MathTex(r"\sin(2\cdot 60^\circ) = \sin 120^\circ", font_size=42, color=CINZA).next_to(a, DOWN, buff=0.3).align_to(a, LEFT)
        self.play(Write(b), run_time=0.8)
        self.at(P(473))
        c = MathTex(r"\sin 120^\circ = \sin 60^\circ", font_size=42, color=TINTA).next_to(b, DOWN, buff=0.3).align_to(a, LEFT)
        self.play(Write(c), run_time=0.8)
        self.play(Circumscribe(c, color=TINTA, buff=0.1), run_time=0.7)
        self.at(P(496) - 6)
        self.play(FadeOut(VGroup(a, b, c)), run_time=0.4)

# ---------------------------------------------------------------- resumo
class Resumo(Base):
    INI = P(496)
    def construct(self):
        self.at(P(497))
        a = M(r"v_{0x}", "=", r"v_0", r"\cos", r"\theta", r"\qquad", r"v_{0y}", "=", r"v_0", r"\sin", r"\theta", tam=44).move_to([3.4, 2.75, 0])
        self.play(Write(a), run_time=0.9)
        self.at(P(503))
        b = M("x", "=", r"v_{0x}", "t", tam=44); b.move_to([1.0, 1.55, 0], aligned_edge=LEFT); b[0].set_color(AZUL)
        self.play(FadeIn(b, shift=UP * 0.1), run_time=0.5)
        self.at(P(507))
        c = M("y", "=", r"v_{0y}", "t", "-", r"\tfrac{1}{2}", "g", "t^2", tam=44); c.move_to([3.6, 1.55, 0], aligned_edge=LEFT); c[0].set_color(LARANJA)
        self.play(FadeIn(c, shift=UP * 0.1), run_time=0.5)
        cards = []
        for q, tex, cor, xx in [(P(510), r"t_s = {v_0 \sin\theta \over g}", TINTA, -4.5), (P(513), r"H = {v_0^2 \sin^2\theta \over 2g}", LARANJA, 0.0), (P(516), r"A = {v_0^2 \sin 2\theta \over g}", AZUL, 4.5)]:
            self.at(q)
            m = MathTex(tex, font_size=54, color=TINTA).move_to([xx, -0.95, 0]); m[0][0].set_color(cor)
            bx = SurroundingRectangle(m, color=cor, buff=0.25, corner_radius=0.12, stroke_width=3)
            self.play(Write(m), Create(bx), run_time=0.8)
            cards.append(VGroup(m, bx))
        self.at(P(517))
        self.play(LaggedStart(*[Indicate(k, scale_factor=1.06, color=k[1].get_color()) for k in cards], lag_ratio=0.2), run_time=1.0)
        self.at(P(521) + 2)
        self.play(FadeOut(VGroup(a, b, c, *cards)), run_time=0.5)

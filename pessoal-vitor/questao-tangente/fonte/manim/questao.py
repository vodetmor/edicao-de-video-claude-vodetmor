# Cenas da questão da tangente. Cada cena cobre [LIM[i], LIM[i+1]) da linha do tempo final e espera as palavras da voz.
# Render: bash render.sh [Cena ...]
from comum import *

def titulo_gancho():
    return T("A questão mais difícil do ENEM 2025", tam=40, peso=SEMIBOLD).to_edge(UP, buff=0.32)

def figura_inicial():
    f = Figura()
    f.add(f.ponto, f.guia_nivel)
    return f

# ---------------------------------------------------------------- 0 · gancho
class C0Gancho(Base):
    INI, FIM = LIM[0], LIM[1]
    def construct(self):
        f = figura_inicial(); tit = titulo_gancho()
        self.add(f, tit)                                   # quadro 0 = último quadro do vídeo (loop)
        self.play(f.t.animate.set_value(4.0), run_time=w("mas o próprio") - 0.2, rate_func=linear)
        self.at(w("desenho já dá"))
        self.play(Indicate(f.curvas, color=CURVA, scale_factor=1.04), run_time=0.9)
        self.at(w("vamos resolver juntos"))
        self.play(f.t.animate.set_value(0.0), run_time=0.9)
        self.at(self.FIM - 0.45)
        self.play(FadeOut(f), FadeOut(tit), run_time=0.4)
        self.fecha()

# ---------------------------------------------------------------- 1 · a questão, desenhada parte por parte
def torneira(f):
    x = f.vx; topo = f.y_of(D_BOCA) + 0.9
    corpo = VGroup(RoundedRectangle(width=1.3, height=0.26, corner_radius=0.08, color=PE, fill_color=PE, fill_opacity=1, stroke_width=0)
                   .move_to([x - 0.45, topo + 0.25, 0]),
                   RoundedRectangle(width=0.26, height=0.4, corner_radius=0.06, color=PE, fill_color=PE, fill_opacity=1, stroke_width=0)
                   .move_to([x, topo + 0.07, 0]))
    jato = always_redraw(lambda: Line([x, topo - 0.12, 0], [x, f.y_of(f.nivel()) + 0.02, 0], color=AGUA2, stroke_width=7))
    return corpo, jato

def seta_D(f, dx=-1.75):
    def mk():
        x = f.vx + dx; a = [x, f.y_of(0), 0]; b = [x, f.y_of(f.nivel()), 0]
        s = DoubleArrow(a, b, buff=0, color=AZUL, stroke_width=4, tip_length=0.18, max_tip_length_to_length_ratio=0.3)
        l = M("D", tam=40, cor=AZUL).next_to(s, LEFT, buff=0.12)
        return VGroup(s, l)
    return always_redraw(mk)

def marca_texto(t, cor=MARCA):
    r = Rectangle(width=t.width + 0.24, height=t.height + 0.16, stroke_width=0, fill_color=cor, fill_opacity=1).move_to(t)
    return r.set_z_index(-1)

class C1Questao(Base):
    INI, FIM = LIM[1], LIM[2]
    def construct(self):
        self.etapa("A questão")
        f = Figura(); f.t.set_value(0.0)
        corpo, jato = torneira(f)
        # 1) o copo se desenha
        self.at(w("um copo"))
        self.play(LaggedStart(FadeIn(f.mesa), FadeIn(f.pe), Create(f.parede), lag_ratio=0.3), run_time=1.0)
        # 2) enchido com vazão constante: a torneira abre e a água sobe; anotação com marca-texto onde o gráfico vai nascer
        self.at(w("enchido com"))
        self.add(f.agua); self.play(FadeIn(corpo), run_time=0.3); self.add(jato)
        self.add(f.t)
        f.t.add_updater(lambda m, dt: m.increment_value(dt * 0.16))     # água sobe devagar e constante
        nota1 = T("vazão constante", tam=40, peso=SEMIBOLD).move_to([1.6, 1.3, 0])
        nota2 = T("= a mesma quantidade de água\npor minuto", tam=30, cor=CINZA, line_spacing=1.1).next_to(nota1, DOWN, buff=0.3)
        self.at(w("vasão constante"))
        self.play(FadeIn(nota1, shift=UP * 0.15), run_time=0.4)
        m1 = marca_texto(nota1)
        self.play(GrowFromEdge(m1, LEFT), run_time=0.4)
        self.at(w("a mesma quantidade"))
        self.play(FadeIn(nota2, shift=UP * 0.1), run_time=0.5)
        # 3) D é a altura da água
        self.at(w("D é a altura") - 0.3)
        self.play(FadeOut(VGroup(nota1, nota2, m1)), run_time=0.3)
        sD = seta_D(f)
        self.play(FadeIn(sD), run_time=0.4)
        self.play(Create(f.ax.y_axis), FadeIn(f.lbl_D), run_time=0.6)
        self.play(Indicate(sD, color=AZUL), run_time=0.7)
        # 4) T é o tempo -> o ponto corre e desenha a curva enquanto a água sobe
        self.at(w("T é o tempo"))
        f.t.clear_updaters()
        self.play(Create(f.ax.x_axis), FadeIn(f.lbl_T), f.t.animate.set_value(0.0), run_time=0.5)
        rastro = always_redraw(lambda: f.ax.plot(D_s, x_range=[0, max(f.t.get_value(), 0.02), 0.02], color=CURVA, stroke_width=5))
        self.add(rastro, f.ponto, f.guia_nivel)
        self.play(f.t.animate.set_value(4.0), run_time=w("função da tangente") - self.INI - self.renderer.time - 0.05, rate_func=linear)
        self.remove(rastro); self.add(f.curva)
        # 5) ... segue uma função tangente
        form = formula_geral(54).to_edge(UP, buff=0.35).shift(LEFT * 1.6)
        self.play(Write(form), FadeIn(VGroup(f.tr_esq, f.tr_dir)), run_time=0.9)
        self.play(FadeIn(f.marcas), FadeIn(f.centro), run_time=0.5)
        # 6) a pergunta: quanto valem k, p e m? -> nasce a trilha
        self.at(w("A pergunta que fica"))
        self.play(Create(f.as_esq), Create(f.as_dir), FadeIn(f.lab_esq), FadeIn(f.lab_dir), run_time=0.8)
        tr = Trilha()
        self.at(w("quanto vale"))
        self.play(FadeIn(tr, shift=DOWN * 0.15), run_time=0.5)
        for palavra, idx, cx in (("K", 2, 0), ("P", 6, 2), ("M", 10, 1)):
            self.at(w(palavra, apos=w("quanto vale")))
            self.play(Indicate(form[idx], scale_factor=1.5, color=form[idx].get_color()),
                      Indicate(tr.caixas[cx], scale_factor=1.1, color=form[idx].get_color()), run_time=0.45)
        self.at(self.FIM - 0.45)
        self.play(*[FadeOut(m) for m in self.mobjects if m is not tr], run_time=0.4)
        self.fecha()

# ---------------------------------------------------------------- 2 · o desenho (3D: cubo × copo com vazão constante)
Z_ESC, R_ESC = 0.058, 0.95
def z_of(d): return (d - D_MIN_COPO) * Z_ESC
CAM = dict(phi=66 * DEGREES, theta=-62 * DEGREES, zoom=1.3)
ALVO_TELA = np.array([-3.55, -0.15, 0])   # onde o centro do copo/cubo aparece na tela
def _rot_cam(phi, theta, gamma=0):
    from manim.utils.space_ops import rotation_about_z, rotation_matrix
    R = np.identity(3)
    for m in (rotation_about_z(-theta - 90 * DEGREES), rotation_matrix(-phi, RIGHT), rotation_about_z(gamma)):
        R = m @ R
    return R
R_CAM = _rot_cam(CAM["phi"], CAM["theta"])
# desloca os objetos 3D (não a câmera: frame_center também move o que é fixo na tela)
_p = R_CAM.T @ np.array([ALVO_TELA[0] / CAM["zoom"], ALVO_TELA[1] / CAM["zoom"], 0])
OFF = _p - np.array([0, 0, z_of(28)])
CAMADAS = [AGUA, AGUA2]
T_LAYERS = np.linspace(0, 4, 9)                      # 8 camadas de mesmo volume (mesmo tempo de torneira)

def casca(d0, d1, cor, op, res=(6, 30)):
    return Surface(lambda u, v: OFF + np.array([R_ESC * raio(u) * np.cos(v), R_ESC * raio(u) * np.sin(v), z_of(u)]),
                   u_range=[d0, d1], v_range=[0, TAU], resolution=res, checkerboard_colors=False,
                   fill_color=cor, fill_opacity=op, stroke_width=0)
def tampa(d, cor, op=0.95):
    return Surface(lambda u, v: OFF + np.array([u * R_ESC * raio(d) * np.cos(v), u * R_ESC * raio(d) * np.sin(v), z_of(d)]),
                   u_range=[0, 1], v_range=[0, TAU], resolution=(2, 30), checkerboard_colors=False,
                   fill_color=cor, fill_opacity=op, stroke_width=0)
def vaso_vidro():
    s = Surface(lambda u, v: np.array([R_ESC * raio(u) * np.cos(v), R_ESC * raio(u) * np.sin(v), z_of(u)]),
                u_range=[D_MIN_COPO, D_BOCA], v_range=[0, TAU], resolution=(14, 32), checkerboard_colors=False,
                fill_color=WHITE, fill_opacity=0.10, stroke_color=TINTA, stroke_width=0.5, stroke_opacity=0.28)
    boca = Circle(radius=R_ESC * raio(D_BOCA), color=TINTA, stroke_width=3).shift(OUT * z_of(D_BOCA))
    fundo = Circle(radius=R_ESC * raio(D_MIN_COPO), color=TINTA, stroke_width=3)
    pe = Cylinder(radius=0.5, height=0.16, fill_color=PE, fill_opacity=1, stroke_width=0, resolution=(1, 24),
                  checkerboard_colors=False).shift(IN * 0.08)
    return VGroup(pe, s, boca, fundo).shift(OFF)
def agua_vaso(tt):
    """camadas de mesmo volume até o tempo tt (0..4)"""
    g = VGroup()
    for i in range(8):
        a, b = T_LAYERS[i], T_LAYERS[i + 1]
        if tt <= a + 1e-3: break
        topo = min(tt, b)
        g.add(casca(D_s(a), D_s(topo), CAMADAS[i % 2], 0.9))
        if topo < b or i == 7: g.add(tampa(D_s(topo), CAMADAS[i % 2]))
    return g

L_CUBO = 2.3
def cubo_vidro():
    c = Cube(side_length=L_CUBO, fill_color=WHITE, fill_opacity=0.08, stroke_color=TINTA, stroke_width=1.6, stroke_opacity=0.6)
    return c.shift(OUT * L_CUBO / 2 + OFF + IN * 0.0)
def agua_cubo(tt, h_tot=L_CUBO * 0.92):
    g = VGroup()
    for i in range(8):
        a, b = T_LAYERS[i], T_LAYERS[i + 1]
        if tt <= a + 1e-3: break
        h0 = h_tot * a / 4; h1 = h_tot * min(tt, b) / 4
        lado = L_CUBO * 0.985
        g.add(Prism(dimensions=[lado, lado, max(h1 - h0, 1e-3)], fill_color=CAMADAS[i % 2], fill_opacity=0.9, stroke_width=0)
              .shift(OUT * (h0 + h1) / 2 + OFF))
    return g
def jato(topo_z, nivel_z):
    return Line3D(OFF + np.array([0, 0, topo_z]), OFF + np.array([0, 0, nivel_z + 0.02]), color=AGUA2, thickness=0.035)

def grafico_mini():
    ax = Axes(x_range=[0, 4.4, 1], y_range=[0, 48, 10], x_length=4.4, y_length=3.7, tips=True,
              axis_config={"color": CINZA, "stroke_width": 3, "include_ticks": False, "tip_width": 0.15, "tip_height": 0.15})
    ax.move_to([3.85, -0.35, 0])
    lt = M("T", tam=34, cor=CINZA).next_to(ax.x_axis.get_end(), UP, buff=0.12)
    ld = M("D", tam=34, cor=CINZA).next_to(ax.y_axis.get_end(), RIGHT, buff=0.12)
    return ax, VGroup(ax, lt, ld)
def reta_cubo(t): return 3 + 39 * t / 4

class C2Desenho(Base3D):
    INI, FIM = LIM[2], LIM[3]
    def construct(self):
        self.set_camera_orientation(**CAM)
        self.R, self.Z = R_CAM, CAM["zoom"]
        self.etapa("1 · O desenho")
        # o copo "de formato estranho" em 3D, girando
        vidro = vaso_vidro()
        self.at(w("Primeiro vamos entender"))
        self.play(FadeIn(vidro), run_time=0.8)
        gira = lambda m, dt: m.rotate(0.35 * dt, axis=OUT, about_point=OFF)
        vidro.add_updater(gira)
        estranho = self.fixo(T("formato estranho", tam=34, cor=CINZA).move_to([0.6, 2.6, 0]))
        self.at(w("formato estranho"))
        self.play(FadeIn(estranho), run_time=0.4)
        # pensa num cubo
        self.at(w("pensar em um cubo"))
        vidro.remove_updater(gira)
        cubo = cubo_vidro()
        self.play(FadeOut(vidro), FadeOut(estranho), run_time=0.5)
        self.move_camera(**CAM, run_time=0.4)
        self.play(Create(cubo), run_time=0.9)
        # camadas iguais, vazão constante; o gráfico vira reta
        ax, eixos = grafico_mini(); self.fixo(eixos)
        tt = ValueTracker(0.0)
        agua = always_redraw(lambda: agua_cubo(tt.get_value()))
        torn_z = L_CUBO + 1.0
        fio = always_redraw(lambda: jato(torn_z, L_CUBO * 0.92 * tt.get_value() / 4))
        bico = Prism(dimensions=[0.5, 0.18, 0.18], fill_color=PE, fill_opacity=1, stroke_width=0).move_to(OFF + np.array([-0.15, 0, torn_z + 0.05]))
        lbl_v = self.fixo(T("vazão constante", tam=30, cor=AGUA2, peso=SEMIBOLD).move_to([-0.6, 3.1, 0]))
        rastro = always_redraw(lambda: ax.plot(reta_cubo, x_range=[0, max(tt.get_value(), 0.02), 0.02], color=CURVA, stroke_width=5))
        self.fixo(rastro)
        self.at(w("toda a camada"))
        self.add(bico, agua, fio)
        self.play(FadeIn(eixos), FadeIn(lbl_v), run_time=0.4)
        self.add_fixed_in_frame_mobjects(rastro)
        self.play(tt.animate.set_value(4.0), run_time=w("então o gráfico é") - self.INI - self.renderer.time - 0.1, rate_func=linear)
        lbl_reta = self.fixo(T("reta", tam=32, cor=CURVA, peso=SEMIBOLD).next_to(ax.c2p(3.2, reta_cubo(3.2)), UL, buff=0.15))
        self.at(w("uma reta"))
        self.play(FadeIn(lbl_reta, shift=UP * 0.1), run_time=0.4)
        # agora o copo: estreito, largo, estreito
        self.at(w("Só que esse copo") - 0.1)
        reta_cinza = ax.plot(reta_cubo, x_range=[0, 4], color=CINZA2, stroke_width=3)
        self.fixo(reta_cinza)
        self.remove(fio)
        self.play(FadeOut(cubo), FadeOut(agua), FadeOut(bico), FadeOut(lbl_reta), FadeOut(rastro), FadeIn(reta_cinza), FadeIn(vidro), run_time=0.6)
        self.add_fixed_in_frame_mobjects(reta_cinza)
        rot = {}
        for nome, d, palavra, apos in (("estreito", 8, "estreito", w("perceba")), ("largo", 30, "largo", w("perceba")), ("estreito", 43, "estreito", w("largo e"))):
            self.at(w(palavra, apos=apos))
            r = self.fixo(T(nome, tam=30, cor=TINTA, peso=SEMIBOLD))
            r.next_to(self.pos_tela(d), LEFT, buff=0.3)
            self.play(FadeIn(r, shift=RIGHT * 0.15), run_time=0.3)
            rot[nome + str(d)] = r
        # enche com camadas de mesmo volume; o gráfico desenha a curva no mesmo ritmo
        tt2 = ValueTracker(0.0)
        agua2 = always_redraw(lambda: agua_vaso(tt2.get_value()))
        torn2 = z_of(D_BOCA) + 0.9
        fio2 = always_redraw(lambda: jato(torn2, z_of(D_s(tt2.get_value()))))
        bico2 = Prism(dimensions=[0.5, 0.18, 0.18], fill_color=PE, fill_opacity=1, stroke_width=0).move_to(OFF + np.array([-0.15, 0, torn2 + 0.05]))
        def seg(i):
            a, b = T_LAYERS[i], T_LAYERS[i + 1]
            def mk():
                t = tt2.get_value()
                if t <= a + 1e-3: return ax.plot(D_s, x_range=[a, a + 0.01, 0.005], stroke_opacity=0, stroke_width=0)
                return ax.plot(D_s, x_range=[a, min(t, b), 0.01], color=(CURVA, ManimColor("#D9534F"))[i % 2], stroke_width=6)
            return always_redraw(mk)
        cv = VGroup(*[seg(i) for i in range(8)]); self.fixo(cv)
        self.at(w("então onde é estreito"))
        self.add(bico2, agua2, fio2); self.add_fixed_in_frame_mobjects(cv)
        self.play(tt2.animate.set_value(4.0), run_time=w("então a ordem fica") - self.INI - self.renderer.time, rate_func=linear)
        self.remove(fio2)
        # rápido, devagar, rápido
        for palavra, tx, lado in (("rápido", 0.45, RIGHT), ("devagar", 2.5, DOWN), ("rápido", 3.75, LEFT)):
            self.at(w(palavra, apos=w("então a ordem fica")) if palavra != "devagar" else w("devagar", apos=w("então a ordem fica")))
            if palavra == "rápido" and tx > 3: self.at(w("rápido", apos=w("devagar", apos=w("então a ordem fica"))))
            r = self.fixo(T(palavra, tam=28, cor=CURVA, peso=SEMIBOLD))
            p = ax.c2p(tx, D_s(tx))
            r.move_to(p + {"RIGHT": RIGHT * 0.85 + DOWN * 0.05, "DOWN": DOWN * 0.55 + RIGHT * 0.25, "LEFT": DOWN * 0.45 + RIGHT * 0.75}[("RIGHT" if lado is RIGHT else "DOWN" if lado is DOWN else "LEFT")])
            self.play(FadeIn(r, scale=0.9), run_time=0.3)
            rot["v" + palavra + str(tx)] = r
        # o meio: curva quase deita = parte mais larga = ponto (2,5 ; 30)
        self.at(w("no meio onde"))
        ponto = self.fixo(Dot(ax.c2p(2.5, 30), radius=0.09, color=TINTA))
        faixa = self.fixo(DashedLine(self.pos_tela(30, 1) + RIGHT * 0.1, ax.c2p(2.5, 30), dash_length=0.08, color=AGUA2, stroke_width=3))
        self.play(FadeIn(ponto, scale=2), Create(faixa), run_time=0.6)
        rotulo = self.fixo(M(r"(2{,}5\ ;\ 30)", tam=36).next_to(ax.c2p(2.5, 30), UL, buff=0.12))
        self.at(w("é o ponto"))
        self.play(FadeIn(rotulo, shift=UP * 0.1), Indicate(ponto, scale_factor=1.8, color=TINTA), run_time=0.6)
        # pergunta que abre a próxima etapa
        self.at(w("Mas por que isso"))
        tudo = [m for m in self.mobjects]
        self.play(*[FadeOut(m) for m in tudo], run_time=0.5)
        perg = self.fixo(T("Por que isso é uma tangente?", tam=48, peso=SEMIBOLD))
        self.play(FadeIn(perg, shift=UP * 0.2), run_time=0.5)
        self.at(self.FIM - 0.4)
        self.play(FadeOut(perg), run_time=0.35)
        self.fecha()
    def proj(self, pts):
        return (np.atleast_2d(pts) @ self.R.T) * self.Z
    def pos_tela(self, d, lado=-1):
        """posição na tela da borda (esq. lado=-1, dir. +1) do copo na altura d, com a câmera em CAM"""
        cam = self.renderer.camera
        v = np.linspace(0, TAU, 72)
        pts = OFF + np.stack([R_ESC * raio(d) * np.cos(v), R_ESC * raio(d) * np.sin(v), np.full_like(v, z_of(d))], 1)
        pr = self.proj(pts)
        i = np.argmin(pr[:, 0]) if lado < 0 else np.argmax(pr[:, 0])
        return np.array([pr[i, 0], pr[i, 1], 0])

# ---------------------------------------------------------------- 3 · o que é tangente (a rampa)
def fmt(v):
    if abs(v) > 50: return r"\infty"
    return f"{v:.1f}".replace(".", "{,}").replace("-", "-")

class C3Tangente(Base):
    INI, FIM = LIM[3], LIM[4]
    def construct(self):
        self.etapa("2 · O que é tangente")
        O = np.array([-4.3, -1.7, 0]); U = 1.35; TOPO = 3.5
        th = ValueTracker(30.0)
        def rampa():
            a = np.radians(th.get_value()); d = np.array([np.cos(a), np.sin(a), 0])
            L = 3.4 if a <= 0.01 else min((TOPO - O[1]) / max(np.sin(a), 1e-3), max(U / max(np.cos(a), 1e-3) + 0.6, 3.0))
            if a < 0: L = min(3.6, (O[1] + 2.7) / max(-np.sin(a), 1e-3))
            return Line(O, O + d * L, color=TINTA, stroke_width=9)
        def sobe():
            v = np.tan(np.radians(th.get_value())); y = np.clip(O[1] + U * v, -2.75, TOPO)
            return Line(O + RIGHT * U, [O[0] + U, y, 0], color=LARANJA, stroke_width=7)
        anda = Line(O, O + RIGHT * U, color=AZUL, stroke_width=7)
        l_anda = always_redraw(lambda: T("anda 1", tam=30, cor=AZUL, peso=SEMIBOLD).next_to(anda, DOWN if th.get_value() >= 0 else UP, buff=0.18))
        R = always_redraw(rampa); S = always_redraw(sobe)
        l_sobe = always_redraw(lambda: T("sobe" if th.get_value() >= 0 else "desce", tam=28, cor=LARANJA, peso=SEMIBOLD)
                               .next_to(S.get_end() if th.get_value() >= 0 else S.get_end(), RIGHT, buff=0.15)
                               .shift(DOWN * 0.25 if th.get_value() >= 0 else UP * 0.25))
        arco = always_redraw(lambda: Arc(radius=0.55, start_angle=0, angle=np.radians(th.get_value()), arc_center=O, color=CINZA, stroke_width=3))
        l_th = always_redraw(lambda: M(r"\theta", tam=34, cor=CINZA).move_to(O + 0.85 * np.array([np.cos(np.radians(th.get_value() / 2)), np.sin(np.radians(th.get_value() / 2)), 0])))
        cont = always_redraw(lambda: VGroup(M(r"\theta =", fr"{th.get_value():.0f}^\circ", tam=40),
                                            M(r"\tg\theta =", fmt(np.tan(np.radians(th.get_value()))), tam=48, mapa={})).arrange(DOWN, aligned_edge=LEFT, buff=0.25)
                             .move_to([-6.6, 2.75, 0], aligned_edge=LEFT))
        titulo = T("tangente =\nquanto a rampa sobe\npara cada 1 que anda", tam=40, peso=SEMIBOLD, line_spacing=1.2).move_to([3.0, 0.6, 0])
        self.at(w("Pensa numa rampa"))
        self.play(Create(R), FadeIn(arco), FadeIn(l_th), run_time=0.6)
        self.at(w("diz quanto essa rampa"))
        self.play(FadeIn(titulo), Create(anda), FadeIn(l_anda), run_time=0.6)
        self.play(Create(S), FadeIn(l_sobe), FadeIn(cont), run_time=0.5)
        def gira(ang, palavra, apos=0.0, rt=0.9):
            self.at(w(palavra, apos=apos))
            self.play(th.animate.set_value(ang), run_time=rt)
        gira(0.001, "rampa deitada", rt=0.8)
        self.at(w("tangente de 0"))
        self.play(Indicate(cont[1] if hasattr(cont, "__getitem__") else cont, scale_factor=1.15), run_time=0.5)
        gira(45, "rampa de 45")
        self.at(w("anda 1")); self.play(Indicate(anda, color=AZUL), Indicate(l_anda, color=AZUL), run_time=0.5)
        self.at(w("sobe 1")); self.play(Indicate(S, color=LARANJA), run_time=0.5)
        gira(60, "tangente de 60")
        gira(80, "de 80")
        gira(89.95, "de 90", rt=1.1)
        parede = T("parede", tam=32, cor=TINTA, peso=SEMIBOLD).next_to(O + UP * 2.4, LEFT, buff=0.3)
        self.at(w("vira uma parede")); self.play(FadeIn(parede, shift=RIGHT * 0.1), run_time=0.4)
        self.at(w("dispara para o infinito")); self.play(Indicate(cont, scale_factor=1.12, color=LARANJA), run_time=0.6)
        assint = DashedLine(O + DOWN * 1.1, O + UP * 5.0, dash_length=0.08, color=VERDE, stroke_width=4)
        l_as = T("assíntota", tam=32, cor=VERDE, peso=SEMIBOLD).next_to(O + UP * 1.4, LEFT, buff=0.3)
        self.at(w("essa parede é"))
        self.play(Create(assint), FadeOut(parede), run_time=0.6); self.play(FadeIn(l_as), run_time=0.3)
        self.at(w("se a rampa descer"))
        self.play(FadeOut(assint), FadeOut(l_as), th.animate.set_value(-45), run_time=1.0)
        # o gráfico: embaixo o ângulo, em cima a tangente
        ax = Axes(x_range=[-1.75, 1.75, np.pi / 4], y_range=[-3.2, 3.2, 1], x_length=5.4, y_length=5.6, tips=False,
                  axis_config={"color": CINZA, "stroke_width": 3, "include_ticks": False}).move_to([2.9, -0.05, 0])
        lx = VGroup(*[M(t, tam=28, cor=CINZA).next_to(ax.c2p(v, 0), DOWN, buff=0.15) for v, t in ((-np.pi / 4, r"-45^\circ"), (np.pi / 4, r"45^\circ"))])
        ly = M(r"\tg\theta", tam=34, cor=CINZA).next_to(ax.c2p(0, 3.2), RIGHT, buff=0.12)
        lxx = M(r"\theta", tam=34, cor=CINZA).next_to(ax.c2p(1.75, 0), UP, buff=0.12)
        self.at(w("joga tudo num gráfico"))
        self.play(FadeOut(titulo), Create(ax), run_time=0.7)
        self.at(w("embaixo do ângulo")); self.play(FadeIn(lxx), FadeIn(lx), run_time=0.4)
        self.at(w("em cima da tangente")); self.play(FadeIn(ly), run_time=0.4)
        # cada posição da rampa deixa um ponto no gráfico
        lim = np.degrees(np.arctan(3.15))
        th.set_value(-lim)
        pto = always_redraw(lambda: Dot(ax.c2p(np.radians(th.get_value()), np.tan(np.radians(th.get_value()))), radius=0.08, color=CURVA))
        rastro = always_redraw(lambda: ax.plot(np.tan, x_range=[-np.radians(lim), max(np.radians(th.get_value()), -np.radians(lim) + 0.01), 0.01], color=CURVA, stroke_width=5))
        self.at(w("olha a curva"))
        self.add(rastro, pto)
        self.play(th.animate.set_value(lim), run_time=w("dispara perto") - self.INI - self.renderer.time + 0.6, rate_func=linear)
        ramo = ramos_tg(ax, ymin=-3.15, ymax=3.15); self.add(ramo); self.remove(rastro)
        self.at(w("passa pelo 0", apos=0)) if False else None
        paredes = VGroup(*[DashedLine(ax.c2p(x, -3.2), ax.c2p(x, 3.2), dash_length=0.07, color=VERDE, stroke_width=3.5) for x in (-np.pi / 2, np.pi / 2)])
        lp = VGroup(M(r"-90^\circ", tam=28, cor=VERDE).next_to(ax.c2p(-np.pi / 2, -3.2), LEFT, buff=0.08).shift(UP * 0.25),
                    M(r"90^\circ", tam=28, cor=VERDE).next_to(ax.c2p(np.pi / 2, -3.2), RIGHT, buff=0.08).shift(UP * 0.25))
        self.play(Create(paredes), FadeIn(lp), FadeOut(pto), run_time=0.6)
        chave = BraceBetweenPoints(ax.c2p(-np.pi / 2, 3.25), ax.c2p(np.pi / 2, 3.25), direction=UP, color=TINTA)
        l180 = M(r"180^\circ", tam=36).next_to(chave, UP, buff=0.1)
        self.at(w("de uma parede até"))
        self.play(GrowFromCenter(chave), FadeIn(l180), run_time=0.6)
        self.at(w("graus é pi"))
        self.play(Transform(l180, M(r"180^\circ = \pi", tam=36).next_to(chave, UP, buff=0.1)), run_time=0.6)
        # a rampa volta à mesma posição: o desenho se repete
        self.at(w("depois disso"))
        ax2 = Axes(x_range=[-4.9, 4.9, np.pi / 2], y_range=[-3.2, 3.2, 1], x_length=11.4, y_length=4.5, tips=False,
                   axis_config={"color": CINZA, "stroke_width": 3, "include_ticks": False}).move_to([-0.6, -0.65, 0])
        grupo_rampa = VGroup(R, S, anda, l_anda, l_sobe, arco, l_th, cont)
        for m_ in (R, S, l_anda, l_sobe, arco, l_th, cont): m_.clear_updaters()
        self.play(FadeOut(grupo_rampa), FadeOut(VGroup(lx, ly, lxx, lp, chave, l180)), run_time=0.5)
        ramos2 = ramos_tg(ax2, ymin=-3.1, ymax=3.1)
        meio = min(range(len(ramos2)), key=lambda i: abs(ramos2[i].get_center()[0] - ax2.c2p(0, 0)[0]))
        par2 = assintotas_tg(ax2, ymin=-3.2, ymax=3.2)
        self.play(ReplacementTransform(ax, ax2), ReplacementTransform(ramo, ramos2[meio]), ReplacementTransform(paredes, par2[1:3]), run_time=0.9)
        outros = VGroup(*[r for i, r in enumerate(ramos2) if i != meio])
        self.at(w("o desenho se repete"))
        self.play(LaggedStart(*[Create(r) for r in outros], lag_ratio=0.2), FadeIn(VGroup(par2[0], *par2[3:])), run_time=1.0)
        # rápido, devagar, rápido: é o copo
        r0 = ramos2[meio]
        self.at(w("rápido devagar e rápido", apos=self.INI))
        self.play(outros.animate.set_stroke(opacity=0.25), r0.animate.set_stroke(width=8), run_time=0.4)
        for txt, x, desl, palavra, apos in (("rápido", -1.15, LEFT * 0.95, "rápido", w("o desenho se repete")),
                                            ("devagar", 0.0, DOWN * 0.5 + RIGHT * 0.95, "devagar", w("o desenho se repete")),
                                            ("rápido", 1.15, LEFT * 0.95 + UP * 0.1, "rápido", w("devagar", apos=w("o desenho se repete")))):
            self.at(w(palavra, apos=apos))
            self.play(FadeIn(T(txt, tam=28, cor=CURVA, peso=SEMIBOLD).move_to(ax2.c2p(x, np.tan(x)) + desl)), run_time=0.3)
        copo_mini = Figura(com_copo=True)
        mini = VGroup(copo_mini.copo).scale(0.42).move_to([4.9, 2.2, 0])
        self.at(w("formato do copo"))
        self.play(FadeIn(mini, shift=LEFT * 0.2), run_time=0.5)
        # guarda 3 coisas
        self.at(w("guarda essas três"))
        rotulos = [m for m in self.mobjects if isinstance(m, Text) and m.text in ("rápido", "devagar")]
        self.play(FadeOut(mini), *[FadeOut(m) for m in rotulos], run_time=0.4)
        ficha = VGroup(T("tangente original:", tam=32, peso=SEMIBOLD), T("centro em 0", tam=32), T("·", tam=32, cor=CINZA),
                       T("altura 0", tam=32), T("·", tam=32, cor=CINZA), T("largura π", tam=32)).arrange(RIGHT, buff=0.22)
        ficha.move_to([-0.6, 3.45, 0])
        ficha = VGroup(ficha[0], ficha[1], VGroup(ficha[2], ficha[3]), VGroup(ficha[4], ficha[5]))
        self.play(FadeIn(ficha[0]), run_time=0.4)
        centro = Dot(ax2.c2p(0, 0), radius=0.11, color=TINTA)
        self.at(w("o centro está no")); self.play(FadeIn(ficha[1]), FadeIn(centro, scale=2), run_time=0.4)
        self.at(w("na altura 0")); self.play(FadeIn(ficha[2]), Indicate(centro, scale_factor=1.8), run_time=0.5)
        ch = BraceBetweenPoints(ax2.c2p(-np.pi / 2, 3.25), ax2.c2p(np.pi / 2, 3.25), direction=UP, color=TINTA)
        lpi = M(r"\pi", tam=40).next_to(ch, UP, buff=0.08)
        self.at(w("a largura é pi")); self.play(FadeIn(ficha[3]), GrowFromCenter(ch), FadeIn(lpi), run_time=0.5)
        self.at(self.FIM - 0.45)
        self.play(*[FadeOut(m) for m in self.mobjects], run_time=0.4)
        self.fecha()

# ---------------------------------------------------------------- 4 · os 3 movimentos (k elevador, m esteira, p sanfona)
class C4Movimentos(Base):
    INI, FIM = LIM[4], LIM[5]
    def construct(self):
        self.etapa("3 · Como mexer num gráfico")
        W_ = lambda f, apos=None: w(f, apos=self.INI if apos is None else apos)
        ax = Axes(x_range=[-4.9, 4.9, 1], y_range=[-2.5, 2.7, 1], x_length=13.0, y_length=4.9, tips=False,
                  axis_config={"color": CINZA, "stroke_width": 3, "include_ticks": False}).move_to([0, -0.55, 0])
        k, m, p = ValueTracker(0.0), ValueTracker(0.0), ValueTracker(1.0)
        fantasma = ramos_tg(ax, ymin=-2.45, ymax=2.65, cor=CINZA2, largura=3)
        viva = always_redraw(lambda: ramos_tg(ax, k.get_value(), m.get_value(), p.get_value(), ymin=-2.45, ymax=2.65))
        assin = always_redraw(lambda: assintotas_tg(ax, m.get_value(), p.get_value(), ymin=-2.5, ymax=2.7))
        centro = always_redraw(lambda: Dot(ax.c2p(-m.get_value(), k.get_value()), radius=0.1, color=TINTA))
        form = formula_geral(46).to_corner(UL, buff=0.35)
        chips = VGroup(chip("elevador", "k", "elevador", COR_K), chip("esteira", "m", "esteira", COR_M), chip("sanfona", "p", "sanfona", COR_P)).arrange(RIGHT, buff=0.15).to_corner(UR, buff=0.3)
        self.at(W_("só que o gráfico"))
        self.play(Create(ax), FadeIn(fantasma), run_time=0.6)
        self.add(assin, viva, centro)
        self.play(FadeIn(form), run_time=0.4)
        self.at(W_("ele foi movido"))
        self.play(k.animate.set_value(1.2), m.animate.set_value(-1.6), p.animate.set_value(0.6), run_time=1.0)
        self.play(k.animate.set_value(0), m.animate.set_value(0), p.animate.set_value(1), run_time=0.7)
        self.at(W_("três movimentos"))
        self.play(LaggedStart(*[FadeIn(c, shift=DOWN * 0.15) for c in chips], lag_ratio=0.3), run_time=0.8)
        self.at(W_("cada letra da fórmula"))
        for i, idx in enumerate((2, 10, 6)):
            self.play(Indicate(form[idx], scale_factor=1.6, color=form[idx].get_color()), Indicate(chips[i], scale_factor=1.08, color=form[idx].get_color()), run_time=0.35)
        def foco(i):
            return AnimationGroup(*[chips[j].animate.set_opacity(1 if j == i else 0.3) for j in range(3)])
        # 1) k: elevador
        self.at(W_("primeiro somar"))
        self.play(foco(0), Indicate(form[2], scale_factor=1.6, color=COR_K), run_time=0.5)
        rot_k = info(T("número fora:", tam=28, cor=COR_K, peso=SEMIBOLD), T("soma k em todos os pontos", tam=28))
        self.play(FadeIn(rot_k), run_time=0.4)
        self.play(k.animate.set_value(1.6), run_time=1.6)
        seta_k = Arrow(ax.c2p(0, 0), ax.c2p(0, 1.6), buff=0.05, color=COR_K, stroke_width=6, max_tip_length_to_length_ratio=0.25)
        self.play(GrowArrow(seta_k), run_time=0.4)
        self.at(W_("inteiro sobe")); self.play(Indicate(chips[0], color=COR_K), run_time=0.5)
        self.at(W_("somasse 30"))
        self.play(Transform(rot_k, info(T("número fora:", tam=28, cor=COR_K, peso=SEMIBOLD), T("soma k em todos os pontos", tam=28), T("+30 → o gráfico sobe 30", tam=28, cor=COR_K, peso=SEMIBOLD))), run_time=0.4)
        # 2) m: esteira, ao contrário do sinal
        self.at(W_("segundo somar dentro"))
        self.play(FadeOut(rot_k), FadeOut(seta_k), k.animate.set_value(0), foco(1), Indicate(form[10], scale_factor=1.6, color=COR_M), run_time=0.7)
        rot_m = info(T("dentro do parêntese:", tam=28, cor=COR_M, peso=SEMIBOLD), T("anda pro lado,", tam=28), T("ao contrário do sinal", tam=28))
        self.at(W_("anda para o lado")); self.play(FadeIn(rot_m), run_time=0.4)
        caixa_c = info(M(r"\tg(T - 2)", tam=42), M("T - 2 = 0", tam=42), M("T = 2", tam=42, cor=COR_M))
        conta, c2, c3 = caixa_c[1]
        self.at(W_("o centro acontece")); self.play(FadeOut(rot_m), FadeIn(caixa_c[0]), FadeIn(conta), run_time=0.4)
        self.at(W_("tangente de t menos")); self.play(Indicate(conta, color=COR_M), FadeIn(c2), run_time=0.6)
        self.at(W_("isso acontece em t")); self.play(FadeIn(c3), m.animate.set_value(-2), run_time=1.0)
        seta_m = Arrow(ax.c2p(0, -0.35), ax.c2p(2, -0.35), buff=0, color=COR_M, stroke_width=6, max_tip_length_to_length_ratio=0.2)
        self.at(W_("o centro andou")); self.play(GrowArrow(seta_m), run_time=0.5)
        regras = info(T("menos dentro → direita", tam=28, cor=COR_M, peso=SEMIBOLD), T("mais dentro → esquerda", tam=28, cor=COR_M, peso=SEMIBOLD))
        regra1, regra2 = regras[1]
        self.at(W_("menos dentro")); self.play(FadeOut(caixa_c), FadeIn(regras[0]), FadeIn(regra1), run_time=0.4)
        self.at(W_("mais dentro"))
        self.play(FadeOut(seta_m), m.animate.set_value(2), FadeIn(regra2), run_time=1.0)
        # 3) p: sanfona, a largura vira π/p
        self.at(W_("terceiro multiplicar"))
        self.play(FadeOut(regras), m.animate.set_value(0), foco(2), Indicate(form[6], scale_factor=1.6, color=COR_P), run_time=0.7)
        def chave():
            pv = p.get_value(); a, b = -np.pi / (2 * pv), np.pi / (2 * pv)
            br = BraceBetweenPoints(ax.c2p(a, 2.75), ax.c2p(b, 2.75), direction=UP, color=TINTA, buff=0.02)
            return br
        ch = always_redraw(chave)
        larg = info(M(r"p = 1:\ \text{largura} = \pi", tam=38))
        self.at(W_("muda a velocidade")); self.play(FadeIn(ch), FadeIn(larg), run_time=0.5)
        self.at(W_("p igual a 2"))
        self.play(p.animate.set_value(2), Transform(larg, info(M(r"p = 2:\ \text{largura} = \tfrac{\pi}{2}", tam=38))), run_time=1.2)
        self.at(W_("cai pela metade")); self.play(Indicate(ch), run_time=0.5)
        self.at(W_("p igual a 1 meio"))
        self.play(p.animate.set_value(0.5), Transform(larg, info(M(r"p = \tfrac{1}{2}:\ \text{largura} = 2\pi", tam=38))), run_time=1.4)
        regra = M(r"\text{largura} = \frac{\pi}{p}", tam=50, mapa={})
        caixa = SurroundingRectangle(regra, color=COR_P, buff=0.22, corner_radius=0.14, stroke_width=3).set_fill(WHITE, 1)
        quadro = VGroup(caixa, regra).move_to([-4.75, -0.6, 0])
        self.at(W_("a regra é"))
        self.play(FadeIn(caixa), Write(regra), run_time=0.8)
        # pronto: as 3 ferramentas
        self.at(W_("pronto agora"))
        self.play(*[chips[j].animate.set_opacity(1) for j in range(3)], p.animate.set_value(1), FadeOut(larg), FadeOut(ch), run_time=0.8)
        self.play(LaggedStart(*[Indicate(c, scale_factor=1.08) for c in chips], lag_ratio=0.25), run_time=0.9)
        self.at(self.FIM - 0.45)
        self.play(*[FadeOut(mo) for mo in self.mobjects], run_time=0.4)
        self.fecha()

# ---------------------------------------------------------------- 4 · resolvendo: a tangente original vira o gráfico do copo
FIG_X0 = -4.7
def linha_k(s, tam=28, cor=TINTA, peso=MEDIUM): return T(s, tam=tam, cor=cor, peso=peso)

class C5Resolve(Base):
    INI, FIM = LIM[5], LIM[6]
    def construct(self):
        self.etapa("4 · Resolvendo")
        W_ = lambda f, apos=None: w(f, apos=self.INI if apos is None else apos)
        f = Figura(x0=FIG_X0, com_copo=False); ax = f.ax
        tr = Trilha()
        k, m, p = ValueTracker(0.0), ValueTracker(0.0), ValueTracker(1.0)
        fant = always_redraw(lambda: ramos_tg(ax, k.get_value(), m.get_value(), p.get_value(), ymin=-12, ymax=53, esc=ESC, cor=CINZA, largura=4,
                                              xmin=A_ESQ + 0.03, xmax=A_DIR - 0.03))
        f_ass = always_redraw(lambda: assintotas_tg(ax, m.get_value(), p.get_value(), ymin=-12, ymax=54, xmin=A_ESQ + 0.03, xmax=A_DIR - 0.03, cor=CINZA))
        f_cen = always_redraw(lambda: Dot(ax.c2p(-m.get_value(), k.get_value()), radius=0.09, color=CINZA))
        POS = (4.65, 0.75, 0)
        # entra: o gráfico do copo + a tangente original (cinza)
        orig = info(linha_k("tangente original", cor=CINZA, peso=SEMIBOLD), linha_k("centro em (0, 0) · largura π"), pos=POS)
        self.play(FadeIn(f), FadeIn(tr), FadeIn(orig), run_time=0.45)
        self.play(FadeIn(f_ass), Create(fant), FadeIn(f_cen), run_time=0.6)
        L = lambda i: VGroup(*[bx[1][j] for j in i])
        # k: elevador, de 0 para 30
        self.at(W_("k é o elevador"))
        bx = bk = info(chip("elevador", "k", "elevador", COR_K), linha_k("centro: altura 0"), linha_k("→ altura 30", cor=COR_K, peso=SEMIBOLD), pos=POS)
        self.play(FadeOut(orig), FadeIn(bk[0]), FadeIn(L([0, 1])), Indicate(tr.caixas[0], color=COR_K), run_time=0.5)
        self.at(W_("o copo está na altura"))
        seta_k = Arrow(ax.c2p(0, 0), ax.c2p(0, 30), buff=0.05, color=COR_K, stroke_width=6, max_tip_length_to_length_ratio=0.12)
        self.play(k.animate.set_value(30), GrowArrow(seta_k), FadeIn(L([2])), run_time=1.4)
        self.at(W_("então k igual a 30"))
        self.play(tr.preenche(0, "30"), FadeOut(seta_k), run_time=0.6)
        # m: esteira, de 0 para 2,5 → m = −5/2
        self.at(W_("o m é a esteira"))
        bx = bm = info(chip("esteira", "m", "esteira", COR_M), linha_k("centro: T = 0"), linha_k("→ T = 2,5", cor=COR_M, peso=SEMIBOLD),
                       linha_k("direita → menos dentro", cor=COR_M, peso=SEMIBOLD), M(r"m = -2{,}5 = -\tfrac{5}{2}", tam=40, mapa={}), pos=POS)
        self.play(FadeOut(bk), FadeIn(bm[0]), FadeIn(L([0, 1])), Indicate(tr.caixas[1], color=COR_M), run_time=0.5)
        self.at(W_("foi para 2"))
        seta_m = Arrow(ax.c2p(0, 30), ax.c2p(2.5, 30), buff=0.1, color=COR_M, stroke_width=6, max_tip_length_to_length_ratio=0.25).shift(UP * 0.28)
        self.play(m.animate.set_value(-2.5), GrowArrow(seta_m), FadeIn(L([2])), run_time=1.3)
        self.at(W_("andou para a direita")); self.play(FadeIn(L([3])), run_time=0.4)
        self.at(W_("m é igual menos")); self.play(FadeIn(L([4])), run_time=0.5)
        self.at(W_("menos 5 sobre 2"))
        self.play(tr.preenche(1, r"-\tfrac{5}{2}"), FadeOut(seta_m), run_time=0.6)
        # conferir: o meio das assíntotas
        self.at(W_("dá para conferir"))
        soma = M(r"\frac{(5-2\pi)+(5+2\pi)}{4}", tam=42, mapa={})
        res = M(r"= \frac{10}{4} = 2{,}5", tam=42, mapa={})
        bx = bc = info(linha_k("meio das assíntotas", cor=VERDE, peso=SEMIBOLD), soma, res, pos=POS)
        self.play(FadeOut(bm), FadeIn(bc[0]), FadeIn(L([0])), Indicate(f.centro, scale_factor=2), run_time=0.6)
        self.at(W_("meio das assíntotas"))
        self.play(Indicate(f.lab_esq, color=VERDE), Indicate(f.lab_dir, color=VERDE), run_time=0.8)
        self.at(W_("some as duas"))
        self.play(Write(soma), run_time=1.0)
        self.at(W_("os dois pi"))
        pis = VGroup(*soma[0][2:5], *soma[0][9:12])
        self.play(pis.animate.set_opacity(0.2), run_time=0.6)
        self.at(W_("e dá 2"))
        self.play(FadeIn(res), Indicate(f.n25), Indicate(f.centro, scale_factor=2), run_time=0.7)
        # p: sanfona, largura π → 2π → p = ½
        self.at(W_("o p a sanfona"))
        dif = M(r"\frac{5+2\pi}{2} - \frac{5-2\pi}{2} = 2\pi", tam=40, mapa={})
        bx = bp = info(chip("sanfona", "p", "sanfona", COR_P), M(r"\text{original: } \pi", tam=40, mapa={}), linha_k("no copo:"), dif,
                       linha_k("a largura dobrou", cor=COR_P, peso=SEMIBOLD), pos=(POS[0], 0.35, 0))
        self.play(FadeOut(bc), FadeIn(bp[0]), FadeIn(L([0])), Indicate(tr.caixas[2], color=COR_P), run_time=0.5)
        def chave_cinza():
            a, b = 2.5 - np.pi / (2 * p.get_value()), 2.5 + np.pi / (2 * p.get_value())
            return BraceBetweenPoints(ax.c2p(a, -12), ax.c2p(b, -12), direction=DOWN, color=CINZA, buff=0.04)
        ch0 = always_redraw(chave_cinza)
        self.at(W_("a largura original era"))
        self.play(FadeIn(ch0), FadeIn(L([1])), run_time=0.6)
        self.at(W_("distância entre as assíntotas"))
        ch1 = BraceBetweenPoints(ax.c2p(A_ESQ, 54), ax.c2p(A_DIR, 54), direction=UP, color=VERDE, buff=0.04)
        self.play(FadeIn(ch1), FadeIn(L([2])), FadeIn(dif[0][:-3]), run_time=0.7)
        self.at(W_("os 5 se cancelam"))
        self.play(FadeIn(dif[0][-3:]), run_time=0.5)
        self.at(W_("a largura dobrou")); self.play(FadeIn(L([4])), run_time=0.4)
        self.at(W_("o gráfico se esticou"))
        self.play(p.animate.set_value(0.5), run_time=1.3)
        self.at(W_("igual a 1 meio", apos=self.INI + 50))
        self.remove(fant)
        self.play(tr.preenche(2, r"\tfrac{1}{2}"), FadeOut(ch0), FadeOut(f_ass), FadeOut(f_cen), run_time=0.5)
        self.at(self.FIM - 0.45)
        self.play(*[FadeOut(mo) for mo in self.mobjects if mo is not tr], run_time=0.4)
        self.fecha()

# ---------------------------------------------------------------- resposta + atalho + volta ao quadro 0 (loop)
def alternativa(letra, kk, pp, mm):
    return M(r"\text{" + letra + r")}\quad", "D=", kk, "+", r"\tg", r"\big[", pp, r"\big(", "T", mm, r"\big)", r"\big]", tam=40, mapa={})

class C6Resposta(Base):
    INI, FIM = LIM[6], LIM[7]
    def construct(self):
        W_ = lambda f, apos=None, fim=False: w(f, apos=self.INI if apos is None else apos, fim=fim)
        tr = Trilha(("30", r"-\tfrac{5}{2}", r"\tfrac{1}{2}"))
        self.add(tr)
        self.etapa("Resposta")
        form = formula_geral(56).move_to([-1.4, 2.35, 0])
        self.at(W_("juntando os 3") - 0.4)
        self.play(FadeIn(form), run_time=0.4)
        final = M("D", "=", "30", "+", r"\tg", r"\big[", r"\tfrac{1}{2}", r"\,(", "T", r"-\tfrac{5}{2}", r")", r"\big]", tam=56, mapa={}).move_to(form)
        final[2].set_color(COR_K); final[6].set_color(COR_P); final[9].set_color(COR_M)
        def voa(i_tr, i_f, i_final, t):
            self.at(t)
            cp = tr.caixas[i_tr][2].copy()
            self.play(cp.animate.move_to(form[i_f]).scale(1.2), form[i_f].animate.set_opacity(0), run_time=0.6)
            return cp
        c1 = voa(0, 2, 2, W_("igual a 30"))
        c2 = voa(2, 6, 6, W_("1 meio vezes"))
        c3 = voa(1, 10, 9, W_("menos 5"))
        self.play(FadeOut(VGroup(c1, c2, c3)), ReplacementTransform(form, final), run_time=0.5)
        alts = VGroup(
            alternativa("A", "2{,}5", "30", r"-\tfrac{5-2\pi}{2}"),
            alternativa("B", "4", "30", r"+\tfrac{5}{2}"),
            alternativa("C", "4", "2{,}5", r"+\tfrac{5+2\pi}{2}"),
            alternativa("D", "30", r"\tfrac{1}{2}", "-5"),
            alternativa("E", "30", r"\tfrac{1}{2}", r"-\tfrac{5}{2}"),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.24).move_to([-0.6, -0.75, 0])
        self.at(W_("portanto a alternativa"))
        self.play(LaggedStart(*[FadeIn(a, shift=UP * 0.1) for a in alts], lag_ratio=0.12), run_time=0.8)
        caixaE = SurroundingRectangle(alts[4], color=AZUL, buff=0.14, corner_radius=0.12, stroke_width=4)
        self.at(W_("alternativa é", fim=True) - 0.1)
        self.play(Create(caixaE), alts[4].animate.set_color(AZUL), run_time=0.5)
        # atalho
        self.at(W_("e o atalho"))
        tag = info(T("atalho de prova", tam=28, cor=AZUL, peso=SEMIBOLD), pos=(4.9, 0.9, 0))
        self.play(FadeIn(tag), run_time=0.4)
        self.at(W_("o k é a altura"))
        self.play(*[Indicate(a[2], color=COR_K, scale_factor=1.4) for a in alts], run_time=0.9)
        self.at(W_("eliminar a"))
        self.play(*[alts[i].animate.set_opacity(0.22).shift(LEFT * 0.25) for i in range(3)], run_time=0.7)
        self.at(W_("o centro tem"))
        self.play(Indicate(alts[3][9], color=COR_M, scale_factor=1.5), Indicate(alts[4][9], color=COR_M, scale_factor=1.5), run_time=0.9)
        self.at(W_("elimina d"))
        self.play(alts[3].animate.set_opacity(0.22).shift(LEFT * 0.25), run_time=0.6)
        # o copo desenhou o gráfico → volta ao quadro 0
        self.at(W_("o copo desenhou"))
        fig = figura_inicial(); fig.t.set_value(4.0); tit = titulo_gancho()
        self.play(*[FadeOut(mo) for mo in self.mobjects], run_time=0.5)
        veu = Rectangle(width=16, height=10, stroke_width=0, fill_color=PAPEL, fill_opacity=1)
        self.add(fig, tit, veu)
        self.play(FadeOut(veu), run_time=0.6)
        self.at(W_("deu a resposta", fim=True))
        self.play(fig.t.animate.set_value(0.0), run_time=1.1)
        self.fecha()

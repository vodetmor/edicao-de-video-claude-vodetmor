"""Caixa de papelão 3D (Blender por código, Cycles CPU) para a cena 'Fechando o pacote'.
Uso: python3 caixa.py [quadro] [saida.png] [tamanho]   quadro 0 = abas abertas, 18 = fechada, 24+ = com fita.
Fundo transparente (compõe sobre qualquer cor no Remotion)."""
import bpy, sys, math, os
from mathutils import Vector
HERE = os.path.dirname(os.path.abspath(__file__))
Q = float(sys.argv[1]) if len(sys.argv) > 1 else 30  # aceita fração (rodada 4c: abas em meio-passos)
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, 'caixa.png')
RES = int(sys.argv[3]) if len(sys.argv) > 3 else 1080
LOGO = os.path.join(HERE, 'coroa-decal.png')

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = 48; sc.cycles.use_denoising = True
sc.render.resolution_x = RES; sc.render.resolution_y = RES; sc.render.film_transparent = True
sc.view_settings.exposure = -0.2; sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Medium High Contrast'

def mat(nome, cor, rough=.8, ruido=0.0, metal=0.0):
    m = bpy.data.materials.new(nome); m.use_nodes = True
    nt = m.node_tree; b = nt.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*cor, 1); b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal
    if ruido:
        n = nt.nodes.new('ShaderNodeTexNoise'); n.inputs['Scale'].default_value = 60; n.inputs['Detail'].default_value = 8
        r = nt.nodes.new('ShaderNodeValToRGB'); r.color_ramp.elements[0].color = (*[c * (1 - ruido) for c in cor], 1); r.color_ramp.elements[1].color = (*[min(1, c * (1 + ruido*.5)) for c in cor], 1)
        nt.links.new(n.outputs['Fac'], r.inputs['Fac']); nt.links.new(r.outputs['Color'], b.inputs['Base Color'])
        bump = nt.nodes.new('ShaderNodeBump'); bump.inputs['Strength'].default_value = .08
        nt.links.new(n.outputs['Fac'], bump.inputs['Height']); nt.links.new(bump.outputs['Normal'], b.inputs['Normal'])
    return m

PAPELAO = mat('caixa', (0.018, 0.018, 0.018), .5, ruido=.25)
PAPELAO_IN = mat('caixa_in', (0.06, 0.055, 0.05), .8, ruido=.2)
OURO = mat('fita', (0.80, 0.56, 0.02), .28, metal=.85)

W, D, H, T = 2.0, 1.5, 1.4, 0.03   # largura, profundidade, altura, espessura

def placa(nome, sx, sy, sz, loc, m, bevel=.012):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc); o = bpy.context.object; o.name = nome
    o.scale = (sx, sy, sz); bpy.ops.object.transform_apply(scale=True)
    bv = o.modifiers.new('bv', 'BEVEL'); bv.width = bevel; bv.segments = 3
    o.data.materials.append(m); bpy.ops.object.shade_smooth()
    return o

# corpo: 4 paredes + fundo
placa('fundo', W, D, T, (0, 0, T/2), PAPELAO)
placa('frente', W, T, H, (0, -D/2, H/2), PAPELAO); placa('tras', W, T, H, (0, D/2, H/2), PAPELAO)
placa('esq', T, D, H, (-W/2, 0, H/2), PAPELAO); placa('dir', T, D, H, (W/2, 0, H/2), PAPELAO)
# interior mais escuro (visível com abas abertas)
placa('in', W - 2*T - .01, D - 2*T - .01, .005, (0, 0, T + .003), PAPELAO_IN, .001)

def aba(nome, tam, piv, eixo, sinal, fechado):
    """aba presa na borda superior; gira em torno do eixo da dobra. fechado 0..1"""
    bpy.ops.object.empty_add(location=piv); e = bpy.context.object; e.name = nome + '_piv'
    o = placa(nome, *tam, (0, 0, 0), PAPELAO)
    o.parent = e
    # posição relativa: aba em pé (aberta) acima da dobra, inclinada 25° para fora
    if eixo == 'x':
        o.location = (0, 0, tam[1] / 2) if False else (0, 0, 0)
    return e, o

def aba_em(nome, comp, larg, borda, fechado, ordem):
    """borda: 'frente','tras','esq','dir'. Aba fechada fica deitada sobre a boca."""
    ang_aberto = math.radians(-105)  # aberta em V, um pouco para fora (rodada 4c: -120 caía sobre a frente e escondia a coroa)
    a = ang_aberto * (1 - fechado)
    if borda in ('frente', 'tras'):
        s = -1 if borda == 'frente' else 1
        piv = Vector((0, s * D/2, H + .001 * ordem))
        bpy.ops.object.empty_add(location=piv); e = bpy.context.object
        o = placa(nome, W - .02, D/2 - .01, T * .9, (0, -s * (D/4), T*.45), PAPELAO); o.parent = e
        e.rotation_euler = (s * a, 0, 0)
    else:
        s = -1 if borda == 'esq' else 1
        piv = Vector((s * W/2, 0, H + .001 * ordem))
        bpy.ops.object.empty_add(location=piv); e = bpy.context.object
        o = placa(nome, W/2 - .02, D - .04, T * .9, (-s * (W/4), 0, T*.45), PAPELAO); o.parent = e
        e.rotation_euler = (0, -s * a, 0)
    return e

ease = lambda t: 1 - (1 - max(0, min(1, t))) ** 3
# rodada 4c (Vítor: "a caixa não fechou direito, animação estranha de um quadro para o outro"): o ease-out cúbico
# concentrava o giro de 120° em 2-3 quadros. Agora ease-in-out (smootherstep): o giro se espalha pelo intervalo todo.
smooth = lambda t: (lambda u: u * u * u * (u * (6 * u - 15) + 10))(max(0, min(1, t)))
f_lados = smooth(Q / 11); f_fr = smooth((Q - 7) / 11)
aba_em('aba_esq', 0, 0, 'esq', f_lados, 0); aba_em('aba_dir', 0, 0, 'dir', f_lados, 0)
aba_em('aba_fr', 0, 0, 'frente', f_fr, 3); aba_em('aba_tr', 0, 0, 'tras', f_fr, 3)

# fita dourada: corre pela emenda de cima e desce pela frente
ft = ease((Q - 20) / 8)
if ft > 0:
    L = (D + .02) * ft
    placa('fita_topo', .34, L, .008, (0, -D/2 + L/2 - .01, H + T + .012), OURO, .002)
    if ft > .6:
        Lf = .38 * (ft - .6) / .4
        placa('fita_frente', .34, .008, Lf, (0, -D/2 - .021, H + T - Lf/2), OURO, .002)

# coroa real como decalque na lateral da frente (imagem com alfa)
if os.path.exists(LOGO):
    bpy.ops.mesh.primitive_plane_add(size=1, location=(0, -D/2 - .017, H * .4), rotation=(math.radians(90), 0, 0))
    p = bpy.context.object; p.scale = (.8, .58, 1)
    m = bpy.data.materials.new('logo'); m.use_nodes = True; nt = m.node_tree; b = nt.nodes['Principled BSDF']
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(LOGO)
    nt.links.new(tx.outputs['Color'], b.inputs['Base Color']); nt.links.new(tx.outputs['Alpha'], b.inputs['Alpha'])
    b.inputs['Roughness'].default_value = .3; b.inputs['Metallic'].default_value = .7
    m.blend_method = 'HASHED' if hasattr(m, 'blend_method') else None
    p.data.materials.append(m)
    # "10x" impresso
    bpy.ops.object.text_add(location=(W/2 + .017, -.55, H * .14), rotation=(math.radians(90), 0, math.radians(90)))
    t = bpy.context.object; t.data.body = '10 CRIATIVOS'; t.data.size = .3; t.data.extrude = .002
    t.data.font = bpy.data.fonts.load(os.path.join(HERE, 'archivo-cond-black.ttf'))
    t.data.align_x = 'LEFT'
    t.data.materials.append(OURO)

# chão que só recebe sombra
bpy.ops.mesh.primitive_plane_add(size=30, location=(0, 0, 0)); ch = bpy.context.object
ch.is_shadow_catcher = True

# luzes de estúdio
def luz(tipo, loc, energia, tam, cor=(1, 1, 1)):
    bpy.ops.object.light_add(type=tipo, location=loc); l = bpy.context.object
    l.data.energy = energia; l.data.color = cor
    if tipo == 'AREA': l.data.size = tam
    l.rotation_euler = (Vector((0, 0, .6)) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
    return l
luz('AREA', (-4, -5, 6), 1700, 4, (1, .96, .9))
luz('AREA', (5, -2, 3), 450, 4, (.9, .95, 1))
luz('AREA', (0, 5, 5), 600, 4)
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True
w.node_tree.nodes['Background'].inputs['Color'].default_value = (1, 1, 1, 1); w.node_tree.nodes['Background'].inputs['Strength'].default_value = .35

# câmera 3/4 levemente de cima
# Q 33..80: depois da fita, a câmera orbita devagar (giro de vitrine, rodada 4: a caixa fica ~3 s na tela)
orb = (lambda t: t * t * (3 - 2 * t))(max(0, min(1, (Q - 32) / 48)))
az = math.atan2(-6.2, 4.6) + math.radians(22) * orb; rr = math.hypot(4.6, -6.2) * (1 - .06 * orb)
bpy.ops.object.camera_add(location=(rr * math.cos(az), rr * math.sin(az), 4.4 - .5 * orb)); cam = bpy.context.object; sc.camera = cam
cam.data.lens = 70
cam.rotation_euler = (Vector((0, 0, H * .55)) - cam.location).to_track_quat('-Z', 'Y').to_euler()
sc.render.filepath = OUT
bpy.ops.render.render(write_still=True)
print('ok', OUT)

"""Preço em 3D (Blender por código, Cycles CPU) para o gancho dos 2 criativos (rodada 4: "mais 3D como a caixa").
A: "39" e ",90" em ouro metálico giram e pousam no quadro (fundo preto). B: "49" e ",90" em preto brilhante caem e
quicam num chão que só recebe sombra (fundo branco). Fundo transparente; compõe no Remotion.
Uso: python3 preco3d.py A|B quadro saida.png [tam]"""
import bpy, sys, math, os
HERE = os.path.dirname(os.path.abspath(__file__))
QUAL, Q, OUT = sys.argv[1], int(sys.argv[2]), sys.argv[3]
RES = int(sys.argv[4]) if len(sys.argv) > 4 else 1080
FONT = os.path.join(HERE, 'archivo-cond-black.ttf')
LANDS = {'A': (28, 64), 'B': (7, 50)}[QUAL]

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = 24; sc.cycles.use_denoising = True
sc.render.resolution_x = RES; sc.render.resolution_y = RES; sc.render.film_transparent = True
sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Medium High Contrast'

def mat(nome, cor, rough, metal):
    m = bpy.data.materials.new(nome); m.use_nodes = True; b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*cor, 1); b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal
    return m
M = mat('ouro', (0.80, 0.56, 0.02), .22, .9) if QUAL == 'A' else mat('preto', (0.004, 0.004, 0.004), .16, 0.0)

def texto(t, size):
    bpy.ops.object.text_add(location=(0, 0, 0)); o = bpy.context.object
    o.data.body = t; o.data.font = bpy.data.fonts.load(FONT); o.data.size = size
    o.data.extrude = .32; o.data.bevel_depth = .035; o.data.bevel_resolution = 3
    o.data.align_x = 'CENTER'; o.data.align_y = 'BOTTOM_BASELINE'
    o.data.materials.append(M); o.rotation_euler = (math.radians(90), 0, 0)  # de pé, de frente para -Y
    return o

SIZE = 3.6
p1, p2 = texto(QUAL == 'A' and '39' or '49', SIZE), texto(',90', SIZE)
bpy.context.view_layer.update()
LIFT = -min(min(v[1] for v in o.bound_box) for o in (p1, p2))  # vírgula desce abaixo da linha de base
D = {o: (o.dimensions.x, o.dimensions.y) for o in (p1, p2)}  # largura, altura (local)
H0 = max(D[p1][1], D[p2][1])
gap = .08
x0 = -(D[p1][0] + gap + D[p2][0]) / 2
CX = {p1: x0 + D[p1][0] / 2, p2: x0 + D[p1][0] + gap + D[p2][0] / 2}

ease_back = lambda t: 1 + 2.4 * (t - 1) ** 3 + 1.4 * (t - 1) ** 2 if t < 1 else 1

def pose(o, land, k):
    """A: gira sobre o eixo vertical e pousa. B: cai e quica no chão."""
    w, h = D[o]
    zc = LIFT  # origem = linha de base
    if QUAL == 'A':
        span = 26 if k == 0 else 16  # o 1º pedaço já gira desde o quadro 2: o gancho tem movimento no 1º quadro
        t = (Q - (land - span)) / span
        if t < 0:
            o.hide_render = True; return
        if t < 1:
            e = ease_back(t)
            ang, s, y = math.radians(-120 * (1 - e)) * (1 if k == 0 else -1), .6 + .4 * min(1, e), 4 * (1 - min(1, e))
        else:
            u = Q - land
            ang, s, y = math.radians(5 * math.exp(-u * .16) * math.sin(u * .5)), 1, 0
        o.scale = (s, s, s); o.rotation_euler = (math.radians(90), 0, ang); o.location = (CX[o], y, zc)
    else:
        if Q < land - 8:
            o.hide_render = True; return
        if Q < land:
            u = (Q - (land - 8)) / 8
            z, sy = 9 * (1 - u * u), 1.06
        else:
            u = Q - land
            z = abs(1.1 * math.exp(-u * .32) * math.sin(u * .5)) if u > 3 else 0
            sy = 1 - .16 * math.exp(-u * .35) * math.cos(u * 1.0)
        o.scale = (2 - sy, sy, 1)  # local: x largura, y altura
        o.location = (CX[o], 0, z + zc * sy)

for k, (o, L) in enumerate(((p1, LANDS[0]), (p2, LANDS[1]))):
    pose(o, L, k)

if QUAL == 'B':
    bpy.ops.mesh.primitive_plane_add(size=60, location=(0, 0, 0)); bpy.context.object.is_shadow_catcher = True

def luz(loc, energia, tam, cor=(1, 1, 1)):
    from mathutils import Vector
    bpy.ops.object.light_add(type='AREA', location=loc); l = bpy.context.object
    l.data.energy = energia; l.data.size = tam; l.data.color = cor
    l.rotation_euler = (Vector((0, 0, 1.5)) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
luz((-6, -7, 7), 2600, 5, (1, .96, .9)); luz((7, -4, 3), 900, 5, (.9, .95, 1)); luz((0, 4, 6), 900, 6)
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True
w.node_tree.nodes['Background'].inputs['Color'].default_value = (1, 1, 1, 1)
w.node_tree.nodes['Background'].inputs['Strength'].default_value = .5 if QUAL == 'A' else .22

from mathutils import Vector
bpy.ops.object.camera_add(location=(1.2, -20, 6.5 if QUAL == 'B' else 3.2)); cam = bpy.context.object; sc.camera = cam
cam.data.lens = 100
cam.rotation_euler = (Vector((0, 0, 1.4)) - cam.location).to_track_quat('-Z', 'Y').to_euler()
sc.render.filepath = OUT
bpy.ops.render.render(write_still=True)

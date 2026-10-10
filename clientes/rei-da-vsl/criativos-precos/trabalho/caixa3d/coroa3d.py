"""Coroa real da Rei da VSL em 3D (Blender por código, Cycles CPU) para a cena B06 'a gente faz tudo'.
O logo não é redesenhado: a frente é o PNG oficial; a espessura vem de camadas com o mesmo recorte (alfa) em ouro
metálico, empilhadas em profundidade. Gira e pousa no quadro 14, depois balança devagar.
Uso: python3 coroa3d.py quadro saida.png [tam]"""
import bpy, sys, math, os
from mathutils import Vector
HERE = os.path.dirname(os.path.abspath(__file__))
Q, OUT = int(sys.argv[1]), sys.argv[2]
RES = int(sys.argv[3]) if len(sys.argv) > 3 else 1080
PNG = os.path.join(HERE, '..', 'fonte', 'public', 'img', 'coroa_rei_da_VSL.png')
LAND = 14

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = 24; sc.cycles.use_denoising = True
sc.cycles.transparent_max_bounces = 64; sc.cycles.max_bounces = 16
sc.render.resolution_x = RES; sc.render.resolution_y = RES; sc.render.film_transparent = True
sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Medium High Contrast'
img = bpy.data.images.load(PNG)
AR = img.size[0] / img.size[1]

def mat(nome, frente):
    m = bpy.data.materials.new(nome); m.use_nodes = True; nt = m.node_tree; b = nt.nodes['Principled BSDF']
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = img; tx.extension = 'CLIP'
    nt.links.new(tx.outputs['Alpha'], b.inputs['Alpha'])
    if frente:
        nt.links.new(tx.outputs['Color'], b.inputs['Base Color']); b.inputs['Metallic'].default_value = .55; b.inputs['Roughness'].default_value = .3
    else:
        b.inputs['Base Color'].default_value = (.62, .42, .02, 1); b.inputs['Metallic'].default_value = .9; b.inputs['Roughness'].default_value = .35
    return m

piv = bpy.data.objects.new('piv', None); sc.collection.objects.link(piv)
W = 4.0; H = W / AR; DEP = .45; N = 28
lado = mat('lado', False); frente = mat('frente', True)
for i in range(N + 1):
    y = DEP * (i / N - .5)
    bpy.ops.mesh.primitive_plane_add(size=1, location=(0, y, 0), rotation=(math.radians(90), 0, 0))
    p = bpy.context.object; p.scale = (W, H, 1); p.parent = piv
    p.data.materials.append(frente if i == 0 else lado)

ease_back = lambda t: 1 + 2.4 * (t - 1) ** 3 + 1.4 * (t - 1) ** 2 if t < 1 else 1
t = (Q - (LAND - 16)) / 16
if t < 1:
    e = ease_back(max(0, t))
    ang, s = math.radians(-160 * (1 - e)), .5 + .5 * min(1, e)
else:
    u = Q - LAND
    ang, s = math.radians(16 * math.exp(-u * .1) * math.sin(u * .32)), 1
piv.rotation_euler = (0, 0, ang); piv.scale = (s, s, s)

def luz(loc, energia, tam, cor=(1, 1, 1)):
    bpy.ops.object.light_add(type='AREA', location=loc); l = bpy.context.object
    l.data.energy = energia; l.data.size = tam; l.data.color = cor
    l.rotation_euler = (Vector((0, 0, 0)) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
luz((-6, -7, 5), 2200, 5, (1, .96, .9)); luz((7, -4, 1), 900, 5, (.9, .95, 1)); luz((0, 5, 4), 1200, 6)
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True
w.node_tree.nodes['Background'].inputs['Color'].default_value = (1, 1, 1, 1)
w.node_tree.nodes['Background'].inputs['Strength'].default_value = .45
bpy.ops.object.camera_add(location=(0.8, -14, 1.6)); cam = bpy.context.object; sc.camera = cam
cam.data.lens = 85
cam.rotation_euler = (Vector((0, 0, 0)) - cam.location).to_track_quat('-Z', 'Y').to_euler()
sc.render.filepath = OUT
bpy.ops.render.render(write_still=True)

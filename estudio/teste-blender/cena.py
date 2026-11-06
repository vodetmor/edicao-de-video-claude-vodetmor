# Teste: Blender por código (bpy) + modelo/céu grátis do Poly Haven. Bola em lançamento oblíquo.
import bpy, math, sys, os
B = os.path.dirname(os.path.abspath(__file__))
FR = int(os.environ.get("FRAMES", "60")); W, H = 1080, 1920
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
bpy.ops.import_scene.gltf(filepath=f"{B}/assets/football_1k.gltf")
malhas = [o for o in sc.objects if o.type == "MESH"]
bola = next(o for o in malhas if "inflated" in o.name)
print("malhas", [(o.name, len(o.data.vertices), tuple(round(x,2) for x in o.dimensions)) for o in malhas])
for o in malhas:
    if o is not bola: bpy.data.objects.remove(o)
for o in sc.objects:
    if o.type == "EMPTY": o.select_set(False)
dims = max(bola.dimensions); s = 0.22 / dims
piv = bpy.data.objects.new("pivo", None); sc.collection.objects.link(piv)
bola.parent = piv; bola.location = (0, 0, 0); bola.scale = (s, s, s)
# física: v0=8.5 m/s, 55 graus, g=9.8
v0, th, g = 8.5, math.radians(55), 9.8
T = 2 * v0 * math.sin(th) / g
for f in range(1, FR + 1):
    t = T * (f - 1) / (FR - 1)
    piv.location = (v0 * math.cos(th) * t - 3.3, 0, 0.11 + v0 * math.sin(th) * t - g * t * t / 2)
    piv.rotation_euler = (0, 9 * t, 0)
    piv.keyframe_insert("location", frame=f); piv.keyframe_insert("rotation_euler", frame=f)
# chão claro que só pega sombra
bpy.ops.mesh.primitive_plane_add(size=60); chao = bpy.context.object
m = bpy.data.materials.new("chao"); m.use_nodes = True
bs = m.node_tree.nodes["Principled BSDF"]; bs.inputs["Base Color"].default_value = (0.93, 0.93, 0.94, 1); bs.inputs["Roughness"].default_value = 0.6
chao.data.materials.append(m)
# rastro da parábola: pontinhos
for k in range(0, 13):
    t = T * k / 12
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.025, location=(v0*math.cos(th)*t - 3.3, 0.3, 0.11 + v0*math.sin(th)*t - g*t*t/2))
    d = bpy.context.object; mm = bpy.data.materials.new(f"p{k}"); mm.use_nodes = True
    mm.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0.0, 0.44, 0.89, 1)
    d.data.materials.append(mm)
    d.hide_render = False
    d.keyframe_insert("hide_render", frame=1)
    d.hide_render = True; d.keyframe_insert("hide_render", frame=1)
    d.hide_render = False; d.keyframe_insert("hide_render", frame=1 + int((FR - 1) * k / 12))
# céu HDRI
w = bpy.data.worlds.new("ceu"); sc.world = w; w.use_nodes = True
nt = w.node_tree; env = nt.nodes.new("ShaderNodeTexEnvironment"); env.image = bpy.data.images.load(f"{B}/assets/sky.hdr")
nt.links.new(env.outputs["Color"], nt.nodes["Background"].inputs["Color"]); nt.nodes["Background"].inputs["Strength"].default_value = 1.2
sun = bpy.data.objects.new("sol", bpy.data.lights.new("sol", "SUN")); sc.collection.objects.link(sun)
sun.data.energy = 3; sun.data.angle = math.radians(3); sun.rotation_euler = (math.radians(40), math.radians(-20), math.radians(30))
# câmera em 3/4, perto, acompanha a bola com atraso suave
cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam")); sc.collection.objects.link(cam); sc.camera = cam
cam.data.lens = 30; cam.data.dof.use_dof = True; cam.data.dof.aperture_fstop = 2.8
alvo = bpy.data.objects.new("alvo", None); sc.collection.objects.link(alvo)
px = None
for f in range(1, FR + 1):
    sc.frame_set(f); p = piv.matrix_world.translation.copy()
    px = p if px is None else px.lerp(p, 0.35)
    alvo.location = px; alvo.keyframe_insert("location", frame=f)
    cam.location = (px.x - 1.5, px.y - 2.6, max(0.35, px.z * 0.75 + 0.15)); cam.keyframe_insert("location", frame=f)
c = cam.constraints.new("TRACK_TO"); c.target = alvo; c.track_axis = "TRACK_NEGATIVE_Z"; c.up_axis = "UP_Y"
cam.data.dof.focus_object = alvo
r = sc.render; r.engine = "CYCLES"; sc.cycles.device = "CPU"; sc.cycles.samples = int(os.environ.get("SPP", "24"))
sc.cycles.use_denoising = True; r.resolution_x, r.resolution_y = W, H; r.resolution_percentage = int(os.environ.get("PCT", "50"))
r.fps = 30; sc.frame_start, sc.frame_end = 1, FR; r.use_motion_blur = True
sc.view_settings.view_transform = "AgX"
r.image_settings.file_format = "PNG"; r.filepath = f"{B}/renders/q_"
if "--still" in sys.argv:
    sc.frame_set(int(os.environ.get("QF", FR * 0.45))); r.filepath = f"{B}/renders/still.png"; bpy.ops.render.render(write_still=True)
else:
    bpy.ops.render.render(animation=True)

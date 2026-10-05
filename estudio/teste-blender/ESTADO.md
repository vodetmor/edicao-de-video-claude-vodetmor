# Teste Blender por código (2026-10-03)
- `pip install bpy` (Blender 5.0.1 como módulo Python 3.11) funciona na nuvem, sem GPU (Cycles CPU).
- Assets grátis: API Poly Haven (api.polyhaven.com/files/<id>) -> assets/ (football gltf 1k + céu kloofendal 1k).
- Rodar: `python3 cena.py --still` (QF=quadro) ou `FRAMES=60 python3 cena.py` -> renders/q_####.png; depois ffmpeg -> renders/teste-blender-bola.mp4.
- Velocidade: ~8 s/quadro em 540x960 (PCT=50, 24 spp, motion blur, denoise). 1080x1920 ~30 s/quadro.
- Pegadinha: o gltf da bola tem 2 malhas (football_deflated e football_inflated); escolher pelo nome.
- Próximo (se Vítor aprovar): bloco Blender no motor estudio/motor; chão com grama, luz, rastro nítido; GPU via Kaggle.

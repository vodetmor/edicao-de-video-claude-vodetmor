"""Converte os PNG renderizados pelo Blender em WebP para o Remotion (só os que faltam).
Uso: python3 converter.py <pasta_png>  ->  fonte/public/<caixa|coroa|preco>/"""
import os, sys
from PIL import Image
SRC = sys.argv[1]
PUB = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'fonte', 'public')
n = 0
for f in sorted(os.listdir(SRC)):
    if not f.endswith('.png'):
        continue
    sub = f.split('_')[0].rstrip('AB')  # caixa_ | coroa_ | precoA_ precoB_ -> caixa, coroa, preco
    os.makedirs(os.path.join(PUB, sub), exist_ok=True)
    dst = os.path.join(PUB, sub, f[:-4] + '.webp')
    if os.path.exists(dst):
        continue
    Image.open(os.path.join(SRC, f)).save(dst, 'WEBP', quality=90, method=5)
    n += 1
print('convertidos', n)

# Limpa a voz com DeepFilterNet3 (aberto, roda em CPU). Mesmo número de amostras na saída: a sincronia labial não muda.
import sys, soundfile as sf, numpy as np, torch
from df.enhance import enhance, init_df
model, state, _ = init_df()
x, sr = sf.read(sys.argv[1], dtype="float32"); assert sr == state.sr(), sr
y = enhance(model, state, torch.from_numpy(x)[None], atten_lim_db=float(sys.argv[3]) if len(sys.argv) > 3 else None)[0].numpy()
y = y[: len(x)]; y = np.pad(y, (0, len(x) - len(y)))
sf.write(sys.argv[2], y, sr, subtype="PCM_24"); print("amostras", len(x), len(y))

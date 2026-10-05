# Teste PT-BR do OmniVoice (motor padrao do VoiceStudio) em CPU, sem voz de pessoa real:
# 1) "voice design" cria vozes sinteticas por descricao;
# 2) a voz sintetica gerada vira referencia para testar o modo clonagem (consistencia entre falas).
# Uso: /opt/ovenv/bin/python testa_omnivoice.py
import time, torch, soundfile as sf
from omnivoice import OmniVoice
torch.set_num_threads(4)
t0 = time.time()
model = OmniVoice.from_pretrained("k2-fsa/OmniVoice", device_map="cpu", dtype=torch.float32)
print("modelo carregado em", round(time.time() - t0, 1), "s", flush=True)

AD = ("Você gasta seiscentos e oitenta reais por mês num player de vídeo? "
      "Com a VSL Play, você paga quarenta e oito e cinquenta. "
      "E ainda tem teste A B, gráfico de retenção e integração com tudo que você já usa.")
REF_TXT = "A liberdade veio no papel. Na prática, não. E essa realidade se estende até os dias atuais."
OUT = "testes"

def gera(nome, **kw):
    t = time.time()
    audio = model.generate(**kw)
    sf.write(f"{OUT}/{nome}.wav", audio[0], 24000)
    dur = len(audio[0]) / 24000
    print(f"{nome}: {dur:.1f} s de audio em {time.time() - t:.1f} s", flush=True)

for nome, instr in [("design-masc", "male, middle-aged, low pitch"),
                    ("design-fem", "female, young adult, moderate pitch")]:
    gera(f"omnivoice-{nome}-anuncio", text=AD, instruct=instr)
    gera(f"omnivoice-{nome}-ref", text=REF_TXT, instruct=instr)

# clonagem a partir da voz sintetica masculina
gera("omnivoice-clone-sintetico-anuncio", text=AD,
     ref_audio=f"{OUT}/omnivoice-design-masc-ref.wav", ref_text=REF_TXT)
gera("omnivoice-auto-anuncio", text=AD)

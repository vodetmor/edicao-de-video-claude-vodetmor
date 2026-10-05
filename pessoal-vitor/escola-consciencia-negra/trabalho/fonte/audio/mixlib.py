"""Ferramentas de mix das partes 3-7 (mesmas regras da parte 1, DESIGN-SYSTEM §7):
voz -16 LUFS, trilha 6-7 LU abaixo nas pausas e mais 15 dB abaixo sob a fala (ducking pelas palavras),
efeitos com transiente só nas pausas (sob a fala só sub), master -14 LUFS / -1,2 dBTP em 2 passagens."""
import json, os, subprocess, numpy as np, imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe(); SR = 48000
HERE = os.path.dirname(os.path.abspath(__file__)); PUB = os.path.join(HERE, "..", "public")
AC = "/mnt/project-files/escola-consciencia-negra/trabalho/acervo"

def load(path, start=0.0, dur=None):
    a = [FF, "-v", "error", "-ss", str(start)] + (["-t", str(dur)] if dur else []) + ["-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"]
    return np.frombuffer(subprocess.run(a, capture_output=True, check=True).stdout, np.float32).copy()
def db(x): return 10 ** (x / 20)
def lufs(x):
    p = subprocess.run([FF, "-v", "info", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-af", "ebur128", "-f", "null", "-"],
                       input=np.asarray(x, np.float32).tobytes(), capture_output=True).stderr.decode()
    return float([l for l in p.splitlines() if l.strip().startswith("I:")][-1].split()[1])
def fades(x, fi=0.01, fo=0.01):
    x = x.copy(); a, b = int(fi * SR), int(fo * SR)
    if a: x[:a] *= np.linspace(0, 1, a)
    if b: x[-b:] *= np.linspace(1, 0, b)
    return x
def ramp(env, a, b, v0, v1):
    i, j = int(a * SR), int(b * SR); env[i:j] = np.linspace(v0, v1, j - i)

class Mix:
    def __init__(self, parte, total):
        self.n = parte; self.N = int(total * SR); self.total = total
        self.dir = f"{PUB}/p{parte}"
        v = load(f"{self.dir}/voz.wav"); self.voz = np.pad(v, (0, max(0, self.N - len(v))))[:self.N]
        self.words = json.load(open(f"{self.dir}/words.json"))
        fala = []
        for w in self.words:
            if fala and w["s"] - fala[-1][1] < 0.35: fala[-1][1] = max(fala[-1][1], w["e"])
            else: fala.append([w["s"], w["e"]])
        self.fala = fala
        mask = np.zeros(self.N, bool)
        for a, b in fala: mask[int(a * SR):int(b * SR)] = True
        self.voz_lufs = lufs(self.voz[mask])
        duck = np.zeros(self.N)
        for a, b in fala: duck[max(0, int((a - 0.25) * SR)):int((b + 0.4) * SR)] = 1
        k = int(0.2 * SR); self.duck = np.convolve(duck, np.ones(k) / k, mode="same")
        self.mus = np.zeros(self.N); self.amb = np.zeros(self.N); self.fx = np.zeros(self.N)
        self.teclas = [load(f"{AC}/sfx/maquina-escrever-tecla-0{i}.wav") for i in range(1, 6)]
        self._cache = {}

    def place(self, buf, x, t, g=0.0):
        i = int(t * SR)
        if i < 0: x = x[-i:]; i = 0
        x = x[: max(0, self.N - i)]; buf[i:i + len(x)] += x * db(g)
    def S(self, n):  # efeito sintetizado (public/sfx)
        if n not in self._cache: self._cache[n] = load(f"{PUB}/sfx/{n}.wav")
        return self._cache[n]
    def A(self, n):  # efeito real (acervo/sfx)
        if n not in self._cache: self._cache[n] = load(f"{AC}/sfx/{n}.wav")
        return self._cache[n]
    def fxat(self, name, t, g, real=False, antes=False):
        x = self.A(name) if real else self.S(name)
        self.place(self.fx, x, t - (len(x) / SR if antes else 0), g)
    def datilografa(self, t0, n, cps=22, g=-26):
        for i in range(n):
            self.place(self.fx, self.teclas[i % 5], t0 + i / cps + np.sin(i * 7.3) * 0.008, g)
    def trilha(self, arquivo, src0, dst0, dst1, fi=1.0, fo=1.0, gap=-6.5, env=None):
        """Coloca um trecho de música (acervo/musica) de dst0 a dst1, nível relativo à voz nas pausas."""
        x = load(f"{AC}/musica/{arquivo}", src0, dst1 - dst0)
        x = fades(x, fi, fo)
        tr = np.zeros(self.N); self.place(tr, x, dst0)
        nz = np.abs(tr) > 1e-6
        tr *= db(self.voz_lufs + gap - lufs(tr[nz]))
        if env is not None: tr *= env
        self.mus += tr
        return tr
    def env(self): return np.ones(self.N)

    def render(self, duck_mus=-15, duck_amb=-4, out=None):
        mus = self.mus * (1 - self.duck * (1 - db(duck_mus)))
        amb = self.amb * (1 - self.duck * (1 - db(duck_amb)))
        mix = self.voz + mus + amb + self.fx
        stereo = np.stack([mix, mix], 1).astype(np.float32)
        out = out or f"{self.dir}/mix.wav"
        tmp = out + ".bruto.wav"
        subprocess.run([FF, "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", "-c:a", "pcm_f32le", tmp],
                       input=stereo.tobytes(), check=True)
        p = subprocess.run([FF, "-v", "info", "-i", tmp, "-af", "loudnorm=I=-14:TP=-1.2:LRA=11:print_format=json", "-f", "null", "-"],
                           capture_output=True).stderr.decode()
        j = json.loads(p[p.rindex("{"):p.rindex("}") + 1])
        ln = (f"loudnorm=I=-14:TP=-1.2:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:"
              f"measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true")
        subprocess.run([FF, "-v", "error", "-y", "-i", tmp, "-af", ln + ",aresample=48000", "-c:a", "pcm_s24le", out], check=True)
        os.remove(tmp)
        # teste de inteligibilidade: voz vs. tudo o resto nos trechos de fala
        mask = np.zeros(self.N, bool)
        for a, b in self.fala: mask[int(a * SR):int(b * SR)] = True
        # banda da fala: passa-alta 120 Hz nos dois lados (o sub dos impactos não mascara a voz)
        hp = lambda x: np.frombuffer(subprocess.run([FF, "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-af", "highpass=f=120:poles=2,highpass=f=120:poles=2",
                                                     "-f", "f32le", "-"], input=np.asarray(x, np.float32).tobytes(), capture_output=True, check=True).stdout, np.float32)
        resto = hp(mus + amb + self.fx)[mask]
        margem = lufs(hp(self.voz)[mask]) - lufs(resto) if np.abs(resto).max() > 1e-5 else 99
        print(f"parte {self.n}: voz {self.voz_lufs:.1f} LUFS · margem voz/resto na fala {margem:.1f} LU · {out}")
        for nome, buf in (("musica", mus), ("amb", amb), ("fx", self.fx), ("voz", self.voz)):
            subprocess.run([FF, "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-c:a", "pcm_s16le",
                            f"{self.dir}/stem-{nome}.wav"], input=buf.astype(np.float32).tobytes(), check=True)

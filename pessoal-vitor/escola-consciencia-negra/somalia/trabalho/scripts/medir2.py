import numpy as np, soundfile as sf, glob
from scipy.signal import welch
def db(v): return 10*np.log10(v+1e-12)
for n in ['vitor-WA0017','vitor-WA0018']:
  print(n)
  o,sr=sf.read(f'/tmp/claude-0/au/ab/{n}__0-original.wav')
  L=int(.05*sr); fe=np.array([np.mean(o[i:i+L]**2) for i in range(0,len(o)-L,L)])
  sp=fe>np.percentile(fe,60); qi=fe<np.percentile(fe,15)
  for f in sorted(glob.glob(f'/tmp/claude-0/au/ab/{n}__*.wav')):
    x,_=sf.read(f); k=f.split('__')[1][:-4]
    e=np.array([np.mean(x[i:i+L]**2) for i in range(0,len(x)-L,L)])
    S=np.concatenate([x[i*L:(i+1)*L] for i in np.where(sp)[0]])
    fr,P=welch(S,sr,nperseg=4096); b=lambda a,c:P[(fr>=a)&(fr<c)].sum()
    print(f'  {k:26s} ruido(quietos) {db(e[qi].mean()):6.1f}  fala {db(e[sp].mean()):6.1f}  SNR {db(e[sp].mean())-db(e[qi].mean()):5.1f}  4-12k/300-3k {db(b(4000,12000))-db(b(300,3000)):6.1f}')

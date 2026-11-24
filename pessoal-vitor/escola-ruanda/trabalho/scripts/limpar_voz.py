"""Limpa a voz: declip -> DeepFilterNet3 (lim 30 dB) -> passa-alta 80 Hz -> -16 LUFS. Uso: limpar_voz.py entrada saida.wav"""
import sys, subprocess, tempfile, os, numpy as np, soundfile as sf, torch
from df.enhance import init_df, enhance
src,dst=sys.argv[1],sys.argv[2]
d=tempfile.mkdtemp(); a=f'{d}/a.wav'; b=f'{d}/b.wav'
subprocess.run(['ffmpeg','-v','error','-y','-i',src,'-af','adeclip','-ac','1','-ar','48000',a],check=True)
x,_=sf.read(a,dtype='float32')
m,st,_=init_df(os.environ.get('DF_MODEL','/tmp/claude-0/dfm/DeepFilterNet3'))
y=enhance(m,st,torch.from_numpy(x)[None],atten_lim_db=30).numpy()[0]
sf.write(b,y,48000,subtype='FLOAT')
subprocess.run(['ffmpeg','-v','error','-y','-i',b,'-af','highpass=f=80,loudnorm=I=-16:TP=-1.5:LRA=7','-ar','48000','-c:a','pcm_s24le',dst],check=True)

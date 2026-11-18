import sys, os, subprocess, numpy as np, soundfile as sf, torch
from scipy.signal import resample_poly
src=sys.argv[1]; out=sys.argv[2]; os.makedirs(out,exist_ok=True)
name=os.path.splitext(os.path.basename(src))[0]
x,sr=sf.read(src,dtype='float32'); assert sr==48000
res={}
res['0-original']=x
# A ffmpeg afftdn
tmp=f'{out}/{name}_A.wav'
subprocess.run(['ffmpeg','-v','error','-y','-i',src,'-af','highpass=f=70,afftdn=nr=18:nf=-35:tn=1','-ar','48000',tmp],check=True)
res['A-ffmpeg-afftdn'],_=sf.read(tmp,dtype='float32')
# B Meta denoiser dns64 (16k)
from denoiser import pretrained
m=pretrained.dns64().eval()
x16=resample_poly(x,1,3).astype('float32')
with torch.no_grad(): y=m(torch.from_numpy(x16)[None,None])[0,0].numpy()
res['B-meta-denoiser']=resample_poly(y,3,1).astype('float32')[:len(x)]
# C Demucs htdemucs vocals
from demucs.pretrained import get_model; from demucs.apply import apply_model
dm=get_model('htdemucs_ft' if len(sys.argv)>3 else 'htdemucs').eval()
x44=resample_poly(x,147,160).astype('float32')
wav=torch.from_numpy(np.stack([x44,x44]))[None]
with torch.no_grad(): s=apply_model(dm,wav,device='cpu')[0]
v=s[dm.sources.index('vocals')].mean(0).numpy()
res['C-meta-demucs']=resample_poly(v,160,147).astype('float32')[:len(x)]
# D DeepFilterNet3
from df.enhance import init_df, enhance
dfm,st,_=init_df('/tmp/claude-0/dfm/DeepFilterNet3')
y=enhance(dfm,st,torch.from_numpy(x)[None]).numpy()[0]
res['D-deepfilternet3']=y[:len(x)]
# E DF3 with attenuation limit (keeps a bit of room, fewer artifacts)
y=enhance(dfm,st,torch.from_numpy(x)[None],atten_lim_db=24).numpy()[0]
res['E-deepfilternet3-lim24']=y[:len(x)]
# F Demucs then DF3 lim
y=enhance(dfm,st,torch.from_numpy(res['C-meta-demucs'].copy())[None],atten_lim_db=30).numpy()[0]
res['F-demucs+deepfilter']=y[:len(x)]
for k,v in res.items():
    v=np.pad(v,(0,max(0,len(x)-len(v))))[:len(x)]
    res[k]=v; sf.write(f'{out}/{name}__{k}.wav',v,48000,subtype='PCM_24')
np.save(f'{out}/{name}__keys.npy',np.array(list(res.keys())))

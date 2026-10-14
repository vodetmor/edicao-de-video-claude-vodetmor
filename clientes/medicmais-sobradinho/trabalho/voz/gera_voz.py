# Voz PROVISÓRIA (edge-tts, grátis) só para cronometrar quadros-chave. A final é ElevenLabs gerada pelo Vítor.
# Uso: python3 gera_voz.py  -> voz/provisoria/Cxx.mp3 + provisoria.wav (com 0,35 s entre frases) + tempos.json
import asyncio, json, os, subprocess, ssl, edge_tts, edge_tts.communicate as _ec
# atrás do proxy da nuvem: confiar no CA do proxy (no PC não precisa)
if os.path.exists('/root/.ccr/ca-bundle.crt'): _ec._SSL_CTX = ssl.create_default_context(cafile='/root/.ccr/ca-bundle.crt')
here=os.path.dirname(os.path.abspath(__file__)); out=os.path.join(here,'provisoria'); os.makedirs(out,exist_ok=True)
VOZ='pt-BR-AntonioNeural'
rot=json.load(open(os.path.join(here,'roteiro.json')))
async def um(c):
    p=os.path.join(out,c['id']+'.mp3')
    await edge_tts.Communicate(c['t'],VOZ,rate='+10%').save(p+'.raw.mp3')
    # tira o silêncio que o edge-tts põe no começo e no fim
    subprocess.run(['ffmpeg','-v','error','-y','-i',p+'.raw.mp3','-af','silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse',p],check=True); os.remove(p+'.raw.mp3')
for c in rot: asyncio.run(um(c))
GAP=0.35; t=0.0; tempos=[]; lista=[]
for c in rot:
    p=os.path.join(out,c['id']+'.mp3')
    d=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',p]))
    tempos.append({**c,'ini':round(t,2),'fim':round(t+d,2)}); t+=d+GAP; lista.append(p)
json.dump(tempos,open(os.path.join(here,'tempos.json'),'w'),ensure_ascii=False,indent=1)
f=' '.join(f'-i {p}' for p in lista)
flt=''.join(f'[{i}:a]apad=pad_dur={GAP}[a{i}];' for i in range(len(lista)))+''.join(f'[a{i}]' for i in range(len(lista)))+f'concat=n={len(lista)}:v=0:a=1[o]'
subprocess.run(f'ffmpeg -v error -y {f} -filter_complex "{flt}" -map [o] -ar 48000 {os.path.join(here,"provisoria.wav")}',shell=True,check=True)
print(round(t,2),'s')

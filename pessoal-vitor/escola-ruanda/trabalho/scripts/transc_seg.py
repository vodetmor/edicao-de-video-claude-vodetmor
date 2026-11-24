"""Transcreve com Whisper large-v3 (pt) e grava texto com tempos por segmento. Uso: transc_seg.py saida_dir arquivos..."""
import sys, os, json, subprocess, numpy as np
from faster_whisper import WhisperModel
out=sys.argv[1]; m=WhisperModel('large-v3',device='cpu',compute_type='int8',cpu_threads=4)
prompt='Ruanda, hutus, tutsis, Habyarimana, Frente Patriótica Ruandesa, FPR, Paul Kagame, UNAMIR, ONU, Rádio Mil Colinas, Interahamwe, Bélgica, Uganda, Arusha, Roméo Dallaire, genocídio.'
for p in sys.argv[2:]:
    raw=subprocess.run(['ffmpeg','-v','error','-i',p,'-ac','1','-ar','16000','-f','f32le','-'],capture_output=True,check=True).stdout
    x=np.frombuffer(raw,np.float32)
    segs,_=m.transcribe(x,language='pt',word_timestamps=True,temperature=0,initial_prompt=prompt,vad_filter=False)
    segs=list(segs); n=os.path.splitext(os.path.basename(p))[0]
    json.dump([{'s':s.start,'e':s.end,'t':s.text,'w':[[w.start,w.end,w.word] for w in s.words]} for s in segs],open(f'{out}/{n}.json','w'),ensure_ascii=False,indent=1)
    open(f'{out}/{n}.txt','w').write('\n'.join(f'[{s.start:6.1f}-{s.end:6.1f}] {s.text.strip()}' for s in segs))
    print(n,'ok',flush=True)

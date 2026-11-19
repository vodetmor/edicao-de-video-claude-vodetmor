import subprocess,numpy as np
from faster_whisper import WhisperModel
x=np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i','/mnt/project-files/escola-consciencia-negra/somalia/audio/bruto/sade-pearls.mp3','-ac','1','-ar','16000','-af','highpass=f=200,lowpass=f=4000','-f','f32le','-'],capture_output=True).stdout,np.float32)
m=WhisperModel('large-v3',device='cpu',compute_type='int8')
p="There is a woman in Somalia, scraping for pearls on the roadside. There's a force stronger than nature keeps her will alive. Hey. There is a storm in my heart. And it hurts like brand-new shoes. Alleluiah."
segs,_=m.transcribe(x,language='en',initial_prompt=p,word_timestamps=True,condition_on_previous_text=False,vad_filter=False,no_speech_threshold=0.9)
for s in segs: print(f"{s.start:6.1f}-{s.end:6.1f} {s.text}")

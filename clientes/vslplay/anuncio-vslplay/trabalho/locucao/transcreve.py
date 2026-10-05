"""Transcreve cada clip (ElevenLabs speech-to-text, com tempo de cada palavra) -> transcricao.json"""
import json, os, uuid, urllib.request, sys
HERE = os.path.dirname(os.path.abspath(__file__))
key = [l.split('=', 1)[1].strip() for l in open(os.path.join(HERE, '..', '.env')) if l.startswith('ELEVENLABS_API_KEY=')][0]
out = {}
for L in json.load(open(os.path.join(HERE, 'roteiro.json'))):
    p = os.path.join(HERE, 'clips', L['id'] + '.wav')
    data = open(p, 'rb').read()
    bnd = '----' + uuid.uuid4().hex
    body = (f'--{bnd}\r\nContent-Disposition: form-data; name="model_id"\r\n\r\nscribe_v1\r\n'
            f'--{bnd}\r\nContent-Disposition: form-data; name="language_code"\r\n\r\npor\r\n'
            f'--{bnd}\r\nContent-Disposition: form-data; name="file"; filename="a.wav"\r\nContent-Type: audio/wav\r\n\r\n').encode() + data + f'\r\n--{bnd}--\r\n'.encode()
    r = urllib.request.Request('https://api.elevenlabs.io/v1/speech-to-text', data=body, headers={'xi-api-key': key, 'Content-Type': f'multipart/form-data; boundary={bnd}'})
    d = json.load(urllib.request.urlopen(r, timeout=180))
    words = [{'w': w['text'], 's': round(w['start'], 3), 'e': round(w['end'], 3)} for w in d['words'] if w.get('type') == 'word']
    out[L['id']] = {'text': d['text'], 'words': words}
    print(L['id'], '|', d['text'])
json.dump(out, open(os.path.join(HERE, 'transcricao.json'), 'w'), ensure_ascii=False, indent=1)

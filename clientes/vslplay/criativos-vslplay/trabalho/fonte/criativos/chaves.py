"""Quadros-chave de cada criativo, tirados das palavras da locução (src/data/words_*.json).
Gera src/data/keys_c2.json (e keys_c3.json); a imagem (C2.tsx) e o som (audio.py) leem os mesmos números."""
import json, os, unicodedata, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def norm(s): return re.sub(r'[^a-z0-9]', '', unicodedata.normalize('NFD', s.lower()).encode('ascii', 'ignore').decode())
def clock(name):
    d = json.load(open(os.path.join(ROOT, f'src/data/words_{name}.json')))
    ws = d['words']
    def at(w, n=1, after=0):
        hits = [x for x in ws if norm(x['w']) == norm(w) and x['f'] >= after]
        return hits[n - 1]['f']
    return d, at

def c2():
    d, at = clock('c2')
    ap = at('aparecer')
    k = dict(impact=4, tag1=10, tag2=16, head1=3, swipe=at('antes') + 2, zoom=at('apresentar') - 6,
             s2=at('Então'), acao=at('ação'), info=at('informação'), toc1=at('informação') + 9,
             apresentada=at('apresentada'), toc2=at('apresentada') + 9, s3=at('Com'), botao2=at('botão', 2),
             delay=at('delay'), drag=at('para', 1, at('delay')), dragEnd=ap + 12, s3b=ap + 14, born=at('definido') + 3,
             s4=at('E'), nao=at('não'), s5=at('você', 1, at('botão', 3)), sinc=at('sincronizar'), snap1=at('sincronizar') + 14,
             snap2=at('vendas'), snap3=at('determinado'), s6=at('vídeo') - 8, video=at('vídeo'),
             botao3=at('botão', 1, at('vídeo')), pagina=at('página', 1, at('vídeo')), junta=at('trabalhando'),
             hora=at('hora'), s7=at('Isso'), teste=at('Teste'))
    k['end'] = d['frames'] + 36
    return k

def c3():
    d, at = clock('c3')
    k = dict(impact=0, tag=0, brk=24, fallEnd=60, freeze=60, ring=62, t006=66, onde=at('onde'),
             s2=at('Por'), mandar=at('mandar'), apenas=at('apenas'), cpa=at('CPA'), funil=at('não'), conta=at('conta'),
             historia=at('história'), s3=at('Com'), vslplay=at('VSL', 1, at('Com')), retencao=at('retenção'),
             comport=at('comportamento'), s4=at('E', 1, at('assistindo')), identifica=at('identifica'), perdendo=at('perdendo'),
             testar=at('testar'), versoes=at('versões'), otimizar=at('otimizar'), s5=at('Smart'), botao=at('botão'),
             sinc=at('sincronização'), muito=at('muito'), s6=at('Menos'), achismo=at('achismo'), mais=at('mais', 1, at('achismo')),
             dados=at('dados'), s7=at('Conheça') - 4, teste=at('teste'))
    k['end'] = d['frames'] + 36
    return k


if __name__ == '__main__':
    for name, fn in (('c2', c2), ('c3', c3)):
        k = fn()
        json.dump(k, open(os.path.join(ROOT, f'src/data/keys_{name}.json'), 'w'), indent=1)
        print(name, k)

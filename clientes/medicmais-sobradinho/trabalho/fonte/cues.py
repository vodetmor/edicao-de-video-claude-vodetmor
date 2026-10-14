"""Cues do vídeo: início de cada cena e eventos presos às palavras da locução final (voz/transcricao.json, ElevenLabs Scribe).
Índices = posição da palavra na transcrição (imprimir com: python3 cues.py --lista). Saída: src/cues.json (quadros a 30 fps).
Se a locução mudar: transcrever de novo (voz/transcreve.py), conferir os índices com --lista e rodar de novo."""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
W = json.load(open(os.path.join(HERE, '..', 'voz', 'transcricao.json')))['words']
if '--lista' in sys.argv:
    print(' '.join(f"{i}:{w['w']}@{w['s']}" for i, w in enumerate(W))); sys.exit()
FPS = 30
f = lambda i: round(W[i]['s'] * FPS)
fe = lambda i: round(W[i]['e'] * FPS)
EV = {
    'pronto': f(12), 'quinhentos': f(23), 'quadrados': f(27), 'medico': f(28), 'dentista': f(30), 'lugar1': f(33),
    'trinta': f(37), 'saudeday': f(40), 'internet': f(44), 'espalhado': f(48), 'feed': f(50),
    'implante': f(53), 'protese': f(54), 'lentes': f(57), 'pesquisa': f(61), 'decidir': f(64),
    'buscando': f(66), 'nome': f(68), 'encontra': f(71), 'catalogos': f(72), 'outras': f(74), 'clinicas': fe(75),
    'em2023': f(76), 'terco': f(79), 'agendava': f(85), 'umano': f(88), 'treze': f(92),
    'resolve': f(97), 'quatro': f(100), 'frentes': f(101),
    'um': f(102), 'tratamento': f(104), 'nome2': f(111), 'digita': f(115), 'busca': f(117),
    'dois': f(118), 'qualquer': f(120), 'toque': f(125), 'abre': f(126), 'whatsapp': f(128),
    'tres': f(131), 'prova': f(133), 'estrutura': f(136), 'depoimentos': f(137), 'saudeday2': f(139), 'conhece': f(148),
    'quatro2': f(150), 'endereco': f(153), 'anuncio': f(156), 'google': f(157), 'instagram': f(159), 'levam': f(160),
    'porta': f(164), 'vinte': f(166),
    'cara': f(174), 'vermelho': f(179), 'sinal': f(181), 'servicos': f(185), 'celular': f(192),
    'faltam': f(193), 'detalhes': f(196), 'horario': f(197), 'cnpj': f(198), 'responsaveis': f(199), 'logo': f(203),
    'vamos': f(205), 'noar': f(210),
}
# cortes: cada cena começa alguns quadros antes da primeira palavra dela (a imagem chega antes da fala)
INI = {
    'K01': 0, 'K02': f(13) - 6, 'K03': f(28) - 8, 'K04': f(34) - 6, 'K05': f(42) - 6, 'K06': f(51) - 6, 'K07': f(65) - 6,
    'K08': f(76) - 6, 'K09': f(95) - 6, 'K10': f(102) - 6, 'K11': f(118) - 6, 'K12': f(131) - 6, 'K13': f(150) - 6,
    'K14': f(170) - 6, 'K15': f(193) - 6, 'K16': f(205) - 6,
}
DUR = fe(len(W) - 1) + 54  # 1,8 s de respiro no fim para a chamada assentar
json.dump({'fps': FPS, 'dur': DUR, 'ini': INI, 'ev': EV}, open(os.path.join(HERE, 'src', 'cues.json'), 'w'), indent=1)
print('dur', DUR, 'quadros =', round(DUR / FPS, 2), 's')

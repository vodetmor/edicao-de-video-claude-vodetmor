# Edição de vídeo falado com IA lá fora · estado em 31/10/2026

Objetivo: comparar nosso processo (estudio/editor + skill editar-video) com o que os melhores projetos abertos e
criadores de fora fazem hoje, e virar regra técnica o que for melhor. Fontes no fim.

## 1. O processo padrão lá fora (convergiu)
Transcrever palavra a palavra → empacotar o texto → o modelo decide os cortes num arquivo (EDL/JSON) → renderizar →
**autoavaliação do render** → só então o humano vê. Todos editam "como código" (Remotion/ffmpeg), nenhum abre editor.

| Etapa | Melhor prática medida | Nós (v8) | Ação |
|---|---|---|---|
| Transcrição | palavra a palavra; todas as tomadas num texto de ~12 KB (video-use) | Whisper palavra a palavra | igual |
| Modelo "vê" o vídeo | NÃO lê quadros (45 M tokens); lê texto e só nas dúvidas pede uma "vista de linha do tempo" (tira de quadros + forma de onda + palavras) | quadros-chave + energia ad hoc | criar `linha_do_tempo.py` (tira + onda + palavras de um intervalo) |
| Cortes | pausas e retomadas fora; corte dentro do silêncio medido; **30 ms de fade** no áudio em cada corte | 15 ms de cruzamento | subir para 30 ms |
| Retomada | escolher a ÚLTIMA tomada completa / a de menos hesitação, com justificativa escrita por escolha (Anthropic, vídeo do Fable) | achado por palavra longa | escrever a justificativa no cortes.md |
| Autoavaliação | re-gerar a vista em CADA ponto de corte do render: salto de imagem, estalo de áudio, legenda escondida; até 3 rodadas de correção automática | crítica por quadros-chave | `verificar_cortes.py` (diferença de quadro e pico de áudio em cada emenda) |
| Revisão humana | portões por passe: cortes → recorte → legendas → cenas → som, prévia em cada um | amostra + vídeo | manter; amostra em vídeo |
| Cor | LUT/cadeia ffmpeg escolhida pelo humano; cuidado com gama (crítica de colorista ao vídeo do Fable) | filtro CSS GRADE | ok para celular; LUT em projeto de câmera |
| Legenda | 1–3 palavras por vez (2 em CAIXA ALTA no video-use); palavra-chave ~15% maior; no máx. 2 propriedades animadas por palavra | 1–3 palavras, chave maior | igual; conferir 2 propriedades |
| Som | biblioteca de SFX e trilhas já normalizada (~−20 LUFS, teto −1,5 dBFS) para o ganho por efeito ser previsível; efeitos presos à palavra; plano de efeitos aprovado antes da mixagem | efeitos presos à palavra | normalizar a biblioteca `sons/` |
| Câmera | dolly lento para o rosto, não zoom digital seco; uma mudança por frase | zoom fixo | **feito v8**: alterna aberto/fechado (1,00 ↔ 1,07) por frase com mola + dolly de 2,5% |
| 3D | recorte + camadas (texto atrás, objetos entre fundo e pessoa) | **feito v8**: camadas de vidro | — |
| Biblioteca de movimento | catálogos com nome + spec + código (motion-prompt 144 itens MIT; video-shotcraft 106 receitas) para pedir movimento POR NOME | LICOES + componentes | estudar motion-prompt (MIT) e nomear nossos movimentos |

## 2. Números úteis (marketing de fornecedor; usar como direção, não como lei)
- Texto animado vs. estático: +42% de conclusão; vídeos < 60 s: 2,5× engajamento por impressão.
- Gancho: 3 palavras animadas no primeiro 1,5 s. Texto cinético no terço central (zona de 60% do quadro).
- Margem lateral ~20% para fugir da interface; zonas seguras 150 px topo, 170 px base, 60 px lados (1080×1920).

## 3. Aplicado no vídeo do Jerônimo (v8)
1. Uma identidade (grafite + #D97757), variedade por layout.
2. 3D = cena em 4 camadas de vidro nomeadas, abre ~1,2 s, fica aberta ~2 s, fecha antes da frase seguinte
   (a grade entra em "cinco", aproveitando a pausa natural de 1 s depois de "gravação").
3. Ritmo de câmera por frase (punch-in suave + dolly).
4. Próximo: verificador de emendas, fade 30 ms, biblioteca de som normalizada, escolha de trilha por referência.

## Fontes
- github.com/browser-use/video-use (post @gregpr07, 15/04/2026, 272 mil views; resumo técnico @dotey)
- github.com/Hrist0ff/claude-code-video-starter (5 passes com prévia; recorte com alfa; legendas 1–3 palavras)
- learnwithhasan.com/guide/claude-code-video-editing (6 etapas, SFX normalizado, verify_cut.py)
- jc-aiwiki: "Fable edits own launch video" (Anthropic, jun/2026: EDL com justificativa, re-transcrição, stills antes de render)
- sabrina.dev/p/5-insane-claude-code-video-prompts (zonas seguras, springs, contadores)
- x.com/Voxyz_ai/status/2111502499048026232 (motion-prompt, 144 movimentos com nome, MIT)
- x.com/Axel_bitblaze69/status/2082487199765844066 (video-shotcraft)
- kreateflo.com (texto cinético; números de fornecedor)

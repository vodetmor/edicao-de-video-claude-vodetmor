---
name: editar-video
description: Edita vídeo de pessoa falando (bruto do celular, aula, anúncio, reels) de ponta a ponta com o editor do estúdio - cortes de pausas e tomadas, rosto centralizado, legenda, estilos (tela dividida, moldura, corte limpo, painel, reels), painel de revisão com notas por segundo e render. Use quando o usuário mandar um vídeo bruto para editar ou pedir "edite no estilo X".
---

# Editar vídeo falado

O usuário grava; esta skill entrega o vídeo editado com o editor em `estudio/editor/`. Quem pede pode ser
iniciante: explique em português simples, decida o que for técnico e diga o que decidiu.

**Divisão do trabalho (é o que economiza):** scripts fazem o pesado (transcrever, cortar, enquadrar, renderizar)
sem gastar token. O Claude só lê resumos curtos (`cortes.md`, `transcricao-base.txt`, `rosto.json` NÃO precisa ser
lido), escreve o `roteiro-visual.json` e revisa quadros-chave. Nunca leia mídia inteira nem JSON grande sem motivo.

## Fluxo com portões

1. **Projeto e briefing.** `python3 estudio/editor/pipeline/novo_projeto.py <pasta> --video <bruto>`.
   Pegue as 7 respostas do `briefing.md` (objetivo, público, canal/formato, estilo, identidade, legenda, fatos
   que não mudam). O que faltar, decida e avise. Detalhes: `references/briefing-e-amostra.md`.
2. **Limpeza.** `python3 estudio/editor/pipeline/limpar.py <pasta> --ritmo anuncio|conteudo|aula [--termos "Marca,Nome"]`.
   Leia `projeto/cortes.md` e confira tomadas e pedidos de corte; sugestões (`aplicar=false`) você decide pelo
   sentido. Mudou algo em `cortes.json`: rode `montar.py` e `enquadrar.py`. Detalhes: `references/limpeza.md`.
3. **Roteiro visual.** Escreva `projeto/roteiro-visual.json` a partir da fala real (`projeto/base-palavras.json`,
   ou a versão legível que você gerar dela). Uma ideia por cena, cada elemento preso à palavra em que é dito.
   Formato, elementos e regras: `references/roteiro-visual.md`. Estilos: `estudio/editor/estilos/CATALOGO.md`.
4. **Portão de direção.** `node estudio/editor/remotion/renderizar.mjs <pasta> --quadros` e olhe `projeto/quadros/V01/folha.png`
   (critique você mesmo antes: legível no celular? rosto inteiro? nada sobre o rosto? um foco por quadro?).
   Mostre ao usuário a folha + uma linha por momento. Só siga com o OK.
5. **Revisão ao vivo.** `node estudio/editor/remotion/painel.mjs <pasta>` → o usuário abre http://localhost:8080,
   assiste sem esperar render e marca notas no quadro exato. "Aplica as notas": siga `references/revisao.md`.
   Sem painel (ex.: usuário no celular): `renderizar.mjs --amostra 8` e notas por texto com tempo.
6. **Final.** `renderizar.mjs <pasta> --nome V01` → `entregas/V01.mp4` (H.264, -14 LUFS). Confira abrindo o MP4
   (início, meio, fim, legenda). Na verificação final não acrescente efeito novo.
7. **Guardar o padrão.** Aprovado, salve as regras do estilo (sem o conteúdo deste vídeo) para o próximo; atualize
   o `ESTADO.md` da pasta.

## Regras que não mudam

- A fala real manda: roteiro escrito só ajuda na grafia. Nunca invente fala, número, resultado, depoimento ou preço.
- Corrija por trecho: tempo, problema, mudança, o que preservar. Não reconstrua o que foi aprovado.
- Mesmo erro duas vezes: pare, ache a causa, faça a menor correção.
- Marca citada na fala aparece com o arquivo REAL do logo (de `assets/`); sem arquivo, peça ao usuário. Nunca redesenhe logo.
- Serviço pago extra (voz, imagem, API) só com autorização do usuário. Diga o custo antes.
- Lote: aprove um vídeo, depois no máximo 3 por vez com o mesmo padrão, cada um com nova transcrição.
- Variações: uma mudança por versão (A base, B outro título, C outra abertura). `references/formatos-e-variacoes.md`.
- Gosto: sem degradê, brilho, vidro; um destaque de cor; legenda `limpa` é o padrão. Neste repositório valem
  ainda `motion-base/DESIGN-SYSTEM.md` e `LICOES-MOTION.md` (precedência: palavra do usuário > identidade > DS).

## Referências (abra só a que precisar)

| Arquivo | Quando |
|---|---|
| `references/instalacao.md` | primeira vez no computador do usuário, ou erro de dependência |
| `references/briefing-e-amostra.md` | começo de todo vídeo |
| `references/limpeza.md` | revisar cortes, ritmo, tomadas, velocidade |
| `references/roteiro-visual.md` | escrever ou corrigir o roteiro (formato completo e exemplos) |
| `references/legendas.md` | escolher ou ajustar legenda |
| `references/revisao.md` | aplicar notas do painel, corrigir trechos |
| `references/custos-e-tokens.md` | o usuário pergunta de custo, plano, limite, ou o vídeo é longo |
| `references/formatos-e-variacoes.md` | 9:16 / 4:5 / 1:1 / 16:9, versões A/B/C, lote |
| `references/avancado.md` | recorte de fundo (alfa), 3D, B-roll: só com teste curto antes |

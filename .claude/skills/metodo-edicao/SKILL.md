---
name: metodo-edicao
description: Método do Vítor para qualquer vídeo (anúncio, motion, VSL, escola, pessoal) - referências, SPEC medida, plano, aprovação por quadros-chave, motion, som, crítica e lições. Use antes de começar ou retomar qualquer edição.
---

# Método de edição (padrão 10/10)

O anúncio narrado VSL Play v6 recebeu 10/10 do Vítor. O que gerou a nota foi este processo, não um estilo. Ele vale para todo vídeo.

## Antes de tudo
1. Leia `motion-base/DESIGN-SYSTEM.md` (regras numéricas de gosto, áudio, legenda, portões G1-G6) e `motion-base/LICOES-MOTION.md` (lições acumuladas).
2. Se o trabalho já existe, leia `<projeto>/trabalho/ESTADO.md` primeiro e continue dali.
3. Crie `<projeto>/trabalho/` desde o primeiro minuto: brutos, transcrições, fonte, renders, stems de áudio. Nada só em pasta temporária.

## Etapas
1. **Entender e buscar referências.** Raciocine sobre o que ele quer de verdade e busque referências por conta própria (skill `pesquisa-referencias`). As referências dele entram por cima. Suba a régua além do pedido literal.
2. **SPEC medida.** Extraia quadros, ache cortes por diferença entre quadros, meça posições, durações, overshoot, câmera, blur, cores, tamanhos de fonte, tempos de som e loudness. Salve `SPEC.md`. Descrever a olho não vale.
3. **Arquitetura + plano** com todos os parâmetros fixados (use `motion-base/TEMPLATE-BRIEF.md`). Para vídeo novo, entregue o plano em PDF.
4. **Portão de aprovação:** storytelling + quadros-chave (um still por momento importante, como o storyboard dos criativos VSL Play). Só depois da aprovação faça o vídeo completo. Depois de aprovado, vá até o fim sem pedir novas aprovações.
5. **Motion** com as regras numéricas (chega rápido e pousa suave, nada congela, stagger 2-4 quadros, um foco por quadro, cortes no tempo forte). Animações travadas na palavra exata falada (transcrição com tempos por palavra).
6. **Som:** voz na frente, música 18-22 LU abaixo, ducking pela transcrição, música volta suave nas pausas, SFX no quadro exato da ação, música/SFX no tempo original. Master -14 LUFS / -1 dBTP.
7. **Crítica independente:** uma sessão/agente novo que não construiu o vídeo compara com referência + SPEC + DESIGN-SYSTEM começando por rejeitar (prompt em LICOES-MOTION §4). Só sai com ≥ 8/10.
8. **Prévia 720p → final 1080p.** Entregue também a vertical 9:16 quando fizer sentido.
9. **Lições:** escreva o que aprendeu em `motion-base/LICOES-MOTION.md` na hora (marque "confirmado pelo Vítor" ou "palpite"). Atualize o `ESTADO.md` com feito, próximo passo e comandos exatos para refazer.

## Ajustes pedidos pelo Vítor
Mexa na fonte existente (durações, tempos), renderize só o que mudou e não toque no que ele elogiou. Nunca refaça do zero.

## Proibido
Degradê aleatório, brilho de fundo, vidro, azul+roxo genérico, tudo entrando com fade, UI falsa, partículas, glow em texto, logo redesenhado (use SVG real de `motion-base/logos/`), vídeo de IA fingindo ser material de arquivo.

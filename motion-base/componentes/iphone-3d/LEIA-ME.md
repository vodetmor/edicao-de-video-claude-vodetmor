# Celular 3D estilo iPhone

Substitui o "bloco preto com tela" (`Celular` em tres.tsx do vídeo da Luiza Rabelo). Modelo feito em código, sem arquivo 3D externo: aro de titânio com cantos squircle, vidro preto, Dynamic Island, barra de status, indicador de início, botões laterais, traseira fosca com câmera tripla, flash e LiDAR. Sem logo da Apple de propósito.

- `iphone.js`: o modelo em three.js puro (`criarIPhone`). Serve o Remotion e a página da demo. Tipos em `iphone.d.ts`.
- `IPhone3D.tsx`: componente para `@remotion/three` (dentro de `<ThreeCanvas>`).
- `DemoIPhone.tsx`: animação de 8 s (traseira → vira → liga → abre site → rola). `demo-iphone.mp4` é o render dela (1080×1350, 30 fps).
- `demo.html` + `exemplo-site.jpg`: a mesma animação no navegador, com troca de cor e linha do tempo. Publicada em https://claude.ai/artifact/GjKuCW5Hn7ZJ5vRHUdvgE1

## Uso no Remotion
1. Copie a pasta para `src/iphone/` do projeto (precisa de three, @react-three/fiber e @remotion/three; `allowJs` no tsconfig).
2. `<IPhone3D tela={textura} rolagem={0.4} brilho={1} cor="natural" pos={[0,0,0]} rot={[0,0.3,0]} />`
   - `tela`: textura de imagem, canvas ou vídeo. Print mais alto que a tela rola com `rolagem` (0 a 1).
   - `areaSegura`: true para print de site (a imagem começa abaixo da barra de status, como no Safari).
   - `barra`: 'clara' (texto branco), 'escura' ou false. `hora`: padrão "9:41".
   - `brilho` 0 = tela apagada (use para "ligar" o celular). `cor`: natural, preto, branco, deserto.
   - `desenhaBloqueio({hora, data, fundo})` gera uma tela de bloqueio pronta.
3. Render com `--gl=angle`. Carregue as texturas antes de montar o canvas (ver `useTextura` em DemoIPhone.tsx); textura que chega depois do primeiro quadro sai preta.

Medidas: 1 unidade = 100 mm (aparelho 0,706 × 1,466 × 0,0825). Tela 1179 × 2556 px (proporção 2,168): prints nesse tamanho encaixam sem corte.

  // TRILHA — "Um vídeo é uma função do tempo" (dentro de buildScore(); ver kit/score-head.js). Tudo sintetizado em código.
  const T = TIMELINE, cu = T.cues;
  // ---- música: magra no começo, cheia no pico, silêncio, a pancada, o acorde chato, o fim que se apaga
  to = 'm';
  pad(0.0, 4.6, ['D3', 'A3', 'E4'], 0.028, { type: 'triangle', cut: 900, att: 0.4, rel: 0.3 });
  pad(4.4, 9.6, ['B2', 'Fs3', 'D4', 'A4'], 0.034, { type: 'triangle', cut: 1100, att: 0.3, rel: 0.3 });
  pad(9.4, 14.9, ['G2', 'D3', 'B3', 'Fs4'], 0.032, { cut: 1300, att: 0.3, rel: 0.05, send: 0.15 });
  for (let i = 0; i < 4; i++) [['D5', 0], ['Fs5', E16], ['A5', E8]].slice(0, 1).forEach(() => pluck([cu.card0, cu.card1, cu.card2, cu.card3][i], nz(['D5', 'Fs5', 'A5', 'D6'][i]), 0.2, -0.3 + i * 0.2, 0.45, 4200, 0.3));
  for (let i = 0; i < 9; i++) bass(9.5 + i * BEAT, nz(i % 2 ? 'D2' : 'G2'), 0.12);
  // as conferências: notas que sobem
  const steps = ['G4', 'A4', 'B4', 'D5', 'E5', 'Fs5', 'G5', 'A5', 'B5'];
  for (let i = 0; i < 9; i++) { const t = i < 5 ? cu.checks + i * 0.25 : cu.fixed + (i - 5) * 0.25; pluck(t, nz(steps[i]), 0.14, -0.2 + 0.05 * i, 0.3, 3800, 0.2); }
  // a pancada: acorde curto + sub, depois um acorde chato; os pulos ganham notas
  ['D3', 'A3', 'D4', 'Fs4', 'A4'].forEach((n, i) => pluck(cu.payoff, nz(n), 0.32, -0.3 + i * 0.15, 0.42, 5200, 0.35));
  pad(cu.payoff + 0.05, cu.home, ['D3', 'A3', 'Fs4', 'E5'], 0.05, { cut: 1500, att: 0.08, rel: 0.4, send: 0.3 });
  for (let i = 1; i < 8; i++) { pluck(cu.payoff + i * BEAT, nz(['A4', 'D5', 'Fs5', 'A5'][i % 4]), 0.13, (i % 2 ? 0.25 : -0.25), 0.3, 3600, 0.25); bass(cu.payoff + i * BEAT, nz(i % 2 ? 'A2' : 'D2'), 0.1); }
  pad(cu.home, 21.6, ['D3', 'A3', 'E4'], 0.011, { type: 'triangle', cut: 900, att: 0.3, rel: 0.6 });
  chime(cu.home + 1.0, [nz('D5'), nz('A5'), nz('E6')], 0.035, 0);
  // ---- efeitos
  to = 's';
  for (let i = 0; i < 8; i++) noiseHit(cu.camDraw + i * E8, 0.09, 'bandpass', 3400 + (i % 3) * 300, 2, 0.05, -0.15);          // lápis desenhando a câmera
  for (let i = 0; i < 4; i++) noiseHit(cu.camInk + i * E16, 0.07, 'bandpass', 2600, 1.6, 0.05, 0.1);                         // tinta
  sub(cu.cross, 0.22); noiseHit(cu.cross, 0.14, 'lowpass', 500, 0.8, 0.12, 0); noiseHit(cu.cross + 0.12, 0.12, 'lowpass', 600, 0.8, 0.1, 0);   // o X
  blip(cu.wow, 900, 1800, 0.08, 0.05, 0.2);                                                                                    // "!"
  sweep(3.9, 4.5, 0.012, 500, 2600, 0); sweep(8.9, 9.5, 0.012, 500, 2600, 0);                                               // nas pontes
  for (let i = 0; i < 10; i++) noiseHit(4.5 + i * BEAT, 0.03, 'highpass', 6000, 1, 0.045, 0.3);                              // tique do cronômetro
  [cu.card0, cu.card1, cu.card2, cu.card3].forEach((t) => noiseHit(t - 0.06, 0.04, 'bandpass', 2000, 4, 0.05, 0.3));         // clique do botão
  for (let i = 0; i < 9; i++) noiseHit(cu.grid + i * E16, 0.06, 'bandpass', 3000 + (i % 3) * 400, 2, 0.04, -0.2 + 0.05 * i);  // quadros riscados
  for (let i = 0; i < 9; i++) { const t = i < 5 ? cu.checks + i * 0.25 : cu.fixed + (i - 5) * 0.25; noiseHit(t, 0.05, 'bandpass', 4200, 3, 0.04, 0.2); }   // checks
  drone(cu.wrong, cu.wrong + 0.35, 110, 0.03, {});                                                                            // o erro
  for (let i = 0; i < 12; i++) noiseHit(cu.erase + i * E16, 0.06, 'bandpass', 1800 + (i % 2) * 500, 1.2, 0.05, 0);          // borracha
  for (let i = 0; i < 4; i++) noiseHit(cu.redraw + i * E8, 0.08, 'bandpass', 3600, 2, 0.045, 0);                             // refaz
  chime(cu.fixed, [nz('B5'), nz('Fs6')], 0.05, 0.2);
  noiseHit(cu.payoff, 0.3, 'lowpass', 900, 0.7, 0.18, 0); sub(cu.payoff, 0.32);                                            // a pancada
  for (let i = 1; i < 8; i++) noiseHit(cu.payoff + i * BEAT, 0.06, 'lowpass', 700, 1, 0.07, 0);                             // aterrissagens
  sweep(cu.home, cu.home + 0.9, 0.01, 2400, 600, -0.3);                                                                       // o filme sai
  noiseHit(cu.home + 1.0, 0.06, 'lowpass', 700, 1, 0.07, 0);

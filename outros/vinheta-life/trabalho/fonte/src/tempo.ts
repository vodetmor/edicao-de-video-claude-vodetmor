// Mapa de tempo da vinheta (quadros a 30 fps; 120 BPM = 15 quadros por tempo). O áudio lê o mesmo mapa (tempo.json).
import t from './data/tempo.json';
export const T = t as Record<string, number>;
export const COR = {laranja: '#E85E23', branco: '#FFFFFF', fundo: '#FFFFFF', sol: '#FFC83D'};

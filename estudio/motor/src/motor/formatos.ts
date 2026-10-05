export const FORMATOS = {
  '9x16': {w: 1080, h: 1920}, // Reels, TikTok, Shorts, Stories
  '4x5': {w: 1080, h: 1350}, // feed do Instagram/Facebook
  '1x1': {w: 1080, h: 1080},
  '16x9': {w: 1920, h: 1080}, // YouTube, VSL
} as const;
export type Formato = keyof typeof FORMATOS;

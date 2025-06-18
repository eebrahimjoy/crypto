const ENCRYPT_MAP = {
  // Uppercase
  A: 'E', B: 'K', C: 'G', D: 'P', E: '!', F: 'V', G: ':', H: 'T', I: 'Q', J: 'Y',
  K: '$', L: 'X', M: 'U', N: 'W', O: '%', P: '&', Q: '*', R: '#', S: '_', T: '×',
  U: '_', V: '"', W: '+', X: '?', Y: '>', Z: '<',

  // Lowercase
  a: 'e', b: 'k', c: 'g', d: 'p', e: '~', f: 'v', g: '↔', h: 't', i: 'q', j: 'y',
  k: '≠', l: 'x', m: 'u', n: 'w', o: '≥', p: '∞', q: '↕', r: '∑', s: '÷', t: '\\',
  u: '€', v: '←', w: '₽', x: '≤', y: '√', z: '→',

  // Numbers and symbols
  '1': ']', '2': '(', '3': '}', '4': '(', '5': '[', '6': '{', '7': '/', '8': '|', '9': ';', '0': ',',
  '@': '.', '$': '±'
};

// Generate DECRYPT_MAP automatically
const DECRYPT_MAP = {};
for (const [key, val] of Object.entries(ENCRYPT_MAP)) {
  DECRYPT_MAP[val] = key;
}

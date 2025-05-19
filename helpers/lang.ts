const sortBy = <T>(key: keyof T) => {
    return function (a: T,b: T) {
        return a[key] < b[key] ? 1:-1;
    }
}






const stringToColorFriendly = (str: string) => {
  let hash = 0;

  // Génère un hash depuis la string
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Utilise le hash pour générer un HSL "amical"
  const h = Math.abs(hash) % 360;       // Teinte (0-359)
  const s = 55 + (Math.abs(hash) % 20); // Saturation entre 70% et 90%
  const l = 50 + (Math.abs(hash) % 10); // Lumière entre 50% et 60%

  return hslToHex(h, s, l);
}

// Conversion HSL → HEX
const hslToHex = (h: number, s: number, l: number) => {
  s /= 100;
  l /= 100;

  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))));

  return (
    '#' +
    [f(0), f(8), f(4)]
      .map(x => x.toString(16).padStart(2, '0'))
      .join('')
  );
}


const getContrastText = (hex:string) => {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calcul de luminance relative
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
  return luminance > 186 ? '#000000' : '#FFFFFF';
}


export {sortBy, stringToColorFriendly, getContrastText}
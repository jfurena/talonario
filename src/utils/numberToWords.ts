/**
 * Convierte un número en su representación en palabras (Español).
 * Ideal para rellenar la sección de "La suma de ..." en los recibos oficiales.
 */

const UNIDADES = ['', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
const DECENAS = ['', 'diez', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
const ONCE_A_QUINCE = ['once', 'doce', 'trece', 'catorce', 'quince'];
const DIECIS = ['dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
const VEINTIS = ['veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintiséis', 'veintiocho', 'veintinueve'];

const CENTENAS = ['', 'cien', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

export function numeroALetras(num: number, currencyNamePlural: string = ''): string {
  if (num === 0) return 'cero ' + currencyNamePlural;

  const integerPart = Math.floor(Math.abs(num));
  const decimalPart = Math.round((Math.abs(num) - integerPart) * 100);

  let result = convertGroup(integerPart).trim();

  // Ajuste gramatical para "un" vs "uno" al final
  if (result.endsWith('un')) {
    result += 'o';
  }

  // Capitalizar la primera letra
  result = result.charAt(0).toUpperCase() + result.slice(1);

  // Formato centavos estándar para Latinoamérica/España: "Ciento dos pesos con 50/100"
  const centavosStr = decimalPart < 10 ? `0${decimalPart}` : `${decimalPart}`;
  
  if (currencyNamePlural) {
    return `${result} ${currencyNamePlural} con ${centavosStr}/100`;
  } else {
    return `${result} con ${centavosStr}/100`;
  }
}

function convertGroup(n: number): string {
  if (n === 0) return '';

  if (n < 10) return UNIDADES[n];
  if (n === 10) return 'diez';
  if (n > 10 && n < 16) return ONCE_A_QUINCE[n - 11];
  if (n > 15 && n < 20) return DIECIS[n - 16];
  if (n === 20) return 'veinte';
  if (n > 20 && n < 30) return VEINTIS[n - 21];
  if (n >= 30 && n < 100) {
    const d = Math.floor(n / 10);
    const u = n % 10;
    return u === 0 ? DECENAS[d] : `${DECENAS[d]} y ${UNIDADES[u]}`;
  }
  if (n === 100) return 'cien';
  if (n > 100 && n < 1000) {
    const c = Math.floor(n / 100);
    const r = n % 100;
    const prefix = c === 1 ? 'ciento' : CENTENAS[c];
    return r === 0 ? prefix : `${prefix} ${convertGroup(r)}`;
  }
  if (n >= 1000 && n < 1000000) {
    const m = Math.floor(n / 1000);
    const r = n % 1000;
    const prefix = m === 1 ? 'mil' : `${convertGroup(m)} mil`;
    return r === 0 ? prefix : `${prefix} ${convertGroup(r)}`;
  }
  if (n >= 1000000 && n < 1000000000) {
    const mill = Math.floor(n / 1000000);
    const r = n % 1000000;
    const prefix = mill === 1 ? 'un millón' : `${convertGroup(mill)} millones`;
    return r === 0 ? prefix : `${prefix} ${convertGroup(r)}`;
  }

  return n.toString(); // Fallback para números absurdamente grandes
}

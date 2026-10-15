import es from './es.js';
import ca from './ca.js';
import en from './en.js';

export const DICCIONARIOS = { es, ca, en };
export const SUPPORTED = ['es', 'ca', 'en'];
export const DEFAULT = 'es';
export const LOCALES = { es: 'es-ES', ca: 'ca-ES', en: 'en-GB' };

export function resolverIdioma(preferido) {
  return SUPPORTED.includes(preferido) ? preferido : DEFAULT;
}

export function interpolar(texto, params) {
  if (!params) {
    return texto;
  }

  return Object.entries(params).reduce(
    (salida, [clave, valor]) => salida.replaceAll(`{${clave}}`, String(valor)),
    texto
  );
}

const EN_DESARROLLO = Boolean(import.meta.env?.DEV);

export function traducir(idioma, clave, params) {
  const activo = resolverIdioma(idioma);
  const diccionario = DICCIONARIOS[activo];

  if (Object.hasOwn(diccionario, clave)) {
    return interpolar(diccionario[clave], params);
  }

  if (EN_DESARROLLO) {
    console.warn(`[i18n] Falta la clave «${clave}» en «${activo}»`);
  }

  if (activo !== DEFAULT && Object.hasOwn(DICCIONARIOS[DEFAULT], clave)) {
    return interpolar(DICCIONARIOS[DEFAULT][clave], params);
  }

  return clave;
}

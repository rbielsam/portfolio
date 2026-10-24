export function resumirDescripcion(texto, max = 180) {
  if (!texto) {
    return '';
  }

  const limpio = String(texto).trim();

  if (limpio.length <= max) {
    return limpio;
  }

  const corte = limpio.slice(0, max);
  const ultimoEspacio = corte.lastIndexOf(' ');
  const base = ultimoEspacio > 0 ? corte.slice(0, ultimoEspacio) : corte;

  return `${base.trimEnd()}…`;
}

export default resumirDescripcion;

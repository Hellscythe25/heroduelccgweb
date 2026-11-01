/**
 * Color de cada héroe en la web, como variables CSS para el atributo `style`.
 *
 * Los colores salen del juego (Theme.uss) y viven en src/styles/tokens.css.
 * Un héroe nuevo puede llegar a los datos antes que su color: entonces usa el
 * oro de la marca en lugar de quedarse sin borde ni acento.
 */
export function heroColorStyle(heroId: string): string {
  return [
    `--hero: var(--hd-hero-${heroId}, var(--hd-hero-fallback))`,
    `--hero-text: var(--hd-hero-${heroId}-text, var(--hd-hero-fallback-text))`,
  ].join('; ');
}

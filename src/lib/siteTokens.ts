/**
 * Sustituye marcas de src/site.ts en el HTML ya renderizado de un texto.
 *
 * Los textos legales citan el correo de privacidad varias veces, pero el correo
 * es temporal y debe vivir en un solo lugar. En el Markdown se escribe
 * `{{privacyContact}}` y LegalPage.astro lo convierte aquí en un enlace
 * `mailto:`. Se hace sobre el HTML y no con un plugin del procesador de
 * Markdown para no sumar dependencias. Una marca desconocida, o un correo
 * vacío, rompe el build: mejor eso que publicar la marca tal cual.
 */
import { privacyContact } from '~/site';

const TOKEN = /\{\{(\w+)\}\}/g;

const tokens: Record<string, () => string> = {
  privacyContact: () => {
    if (!/^[^\s<>"@]+@[^\s<>"@]+$/.test(privacyContact)) {
      throw new Error(`src/site.ts: privacyContact no es un correo válido ("${privacyContact}") y un texto lo cita.`);
    }
    return `<a href="mailto:${privacyContact}">${privacyContact}</a>`;
  },
};

export function resolveSiteTokens(html: string): string {
  return html.replace(TOKEN, (match, name: string) => {
    const make = tokens[name];
    if (!make) throw new Error(`Marca desconocida en un texto: ${match}`);
    return make();
  });
}

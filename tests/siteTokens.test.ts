import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { resolveSiteTokens } from '~/lib/siteTokens';
import { privacyContact } from '~/site';

// El correo de privacidad es temporal: vive solo en src/site.ts y los textos lo citan con una marca.
describe('marcas de src/site.ts en los textos', () => {
  it('convierte {{privacyContact}} en un enlace mailto con el correo', () => {
    expect(resolveSiteTokens('<p>Escribe a <strong>{{privacyContact}}</strong>.</p>')).toBe(
      `<p>Escribe a <strong><a href="mailto:${privacyContact}">${privacyContact}</a></strong>.</p>`,
    );
  });

  it('una marca desconocida rompe el build', () => {
    expect(() => resolveSiteTokens('{{otraCosa}}')).toThrow(/Marca desconocida/);
  });

  it('los textos legales citan el correo con la marca y nunca escrito a mano', () => {
    for (const lang of readdirSync('src/content/legal')) {
      for (const file of readdirSync(`src/content/legal/${lang}`)) {
        const text = readFileSync(`src/content/legal/${lang}/${file}`, 'utf8');
        expect(text, `${lang}/${file}`).not.toContain(privacyContact);
      }
    }
  });
});

/**
 * Kit de prensa: forma de los datos y regla de publicación.
 *
 * Lo que se protege aquí no es que el kit esté completo —hoy no lo está, y es
 * correcto— sino que **la página no pueda publicarse a medias sin que nadie se
 * entere**. Un kit que aparenta estar completo se descubre incompleto cuando el
 * periodista ya está escribiendo.
 */
import { describe, expect, it } from 'vitest';
import {
  PressKitSchema,
  isPressKitPublishable,
  missingPressKitFields,
  pressKit,
  type PressKit,
} from '~/press';

describe('datos del kit de prensa', () => {
  it('validan contra el esquema', () => {
    const result = PressKitSchema.safeParse(pressKit);
    expect(result.success ? null : JSON.stringify(result.error.issues, null, 2)).toBeNull();
  });

  it('todo asset declarado lleva texto alternativo en los dos idiomas', () => {
    for (const asset of [...pressKit.assets.logos, ...pressKit.assets.screenshots]) {
      expect(asset.alt.es.trim(), `falta alt en español para ${asset.src}`).not.toBe('');
      expect(asset.alt.en.trim(), `falta alt en inglés para ${asset.src}`).not.toBe('');
    }
  });
});

describe('regla de publicación', () => {
  it('el kit vacío NO es publicable', () => {
    expect(isPressKitPublishable).toBe(missingPressKitFields().length === 0);
  });

  it('cada campo que falta explica por qué hace falta, en los dos idiomas', () => {
    for (const field of missingPressKitFields()) {
      expect(field.why.es.trim(), `${field.path} sin motivo en español`).not.toBe('');
      expect(field.why.en.trim(), `${field.path} sin motivo en inglés`).not.toBe('');
    }
  });

  it('un kit completo se considera publicable', () => {
    const alt = { es: 'Descripción', en: 'Description' };
    const complete: PressKit = {
      studio: {
        name: 'Estudio',
        foundedYear: '2024',
        location: 'Lima, Perú',
        website: 'https://heroduelccg.com',
      },
      game: {
        title: 'Hero Duel',
        releaseDate: { es: 'Por anunciar', en: 'To be announced' },
        platforms: ['PC'],
        price: { es: 'Por anunciar', en: 'To be announced' },
        modes: [{ es: 'Un jugador', en: 'Single player' }],
        languages: ['Español', 'English'],
        engine: 'Unity',
      },
      description: {
        short: { es: 'Una frase.', en: 'One line.' },
        long: { es: 'Un párrafo.', en: 'A paragraph.' },
      },
      assets: {
        logos: [{ src: '/press/logo.svg', alt }],
        screenshots: [
          { src: '/press/1.png', alt },
          { src: '/press/2.png', alt },
          { src: '/press/3.png', alt },
        ],
        trailerUrl: '',
        zipUrl: '',
      },
      contact: { email: 'prensa@heroduelccg.com', socials: [] },
    };

    expect(missingPressKitFields(complete)).toEqual([]);
  });

  it('menos de tres capturas bloquea la publicación', () => {
    const kit = structuredClone(pressKit) as PressKit;
    const alt = { es: 'Descripción', en: 'Description' };
    kit.assets.screenshots = [
      { src: '/press/1.png', alt },
      { src: '/press/2.png', alt },
    ];

    expect(missingPressKitFields(kit).map((f) => f.path)).toContain('assets.screenshots');
  });
});

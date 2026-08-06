/**
 * Datos del kit de prensa.
 *
 * Sigue el formato `presskit()` de Rami Ismail, que es el que la prensa y los
 * creadores de contenido esperan encontrar (docs/DEPLOY.md §11.2). Si la
 * estructura no está, no cubren el juego: no es una cuestión de estética sino
 * de que un periodista con veinte minutos no va a reconstruir un factsheet
 * leyendo tu landing.
 *
 * NO vive en src/data/. Esa carpeta es canon del juego, exportado desde Unity y
 * con dueño propio (`curador-datos-juego`). Esto es material de marketing: lo
 * escribe el estudio y cambia por motivos distintos.
 *
 * Todo campo vacío es un campo pendiente, no un placeholder. Mientras falte
 * alguno de los obligatorios, la página se genera en modo borrador: `noindex`,
 * fuera del sitemap, sin enlace en la navegación, y mostrando exactamente qué
 * falta. En cuanto estén todos, se publica sola.
 */
import { z } from 'zod';

const LocalizedTextSchema = z.object({
  es: z.string(),
  en: z.string(),
});

export type LocalizedText = z.infer<typeof LocalizedTextSchema>;

const AssetSchema = z.object({
  /** Ruta pública, por ejemplo /press/screenshot-01.png */
  src: z.string(),
  /** Descripción real de lo que se ve. Obligatoria si el asset existe. */
  alt: LocalizedTextSchema,
});

export const PressKitSchema = z
  .object({
    studio: z.object({
      name: z.string(),
      foundedYear: z.string(),
      /** Ciudad y país. La prensa local lo usa para decidir si te cubre. */
      location: z.string(),
      website: z.string(),
    }),
    game: z.object({
      title: z.string(),
      /** Fecha o ventana. Se admite "Por anunciar": es una respuesta válida. */
      releaseDate: LocalizedTextSchema,
      platforms: z.array(z.string()),
      /** Precio o modelo de negocio. */
      price: LocalizedTextSchema,
      modes: z.array(LocalizedTextSchema),
      /** Idiomas del JUEGO, que no tienen por qué ser los del sitio. */
      languages: z.array(z.string()),
      engine: z.string(),
    }),
    description: z.object({
      /** Una frase. Es la que acaba copiada literalmente en las notas. */
      short: LocalizedTextSchema,
      /** Dos o tres párrafos. Admite saltos de línea. */
      long: LocalizedTextSchema,
    }),
    assets: z.object({
      logos: z.array(AssetSchema),
      screenshots: z.array(AssetSchema),
      /** URL de youtube-nocookie. Vacío si todavía no hay tráiler. */
      trailerUrl: z.string(),
      /** Zip con todo el material, servido desde /press/. */
      zipUrl: z.string(),
    }),
    contact: z.object({
      email: z.string(),
      /** Perfiles públicos: X, Bluesky, Discord, YouTube… */
      socials: z.array(z.object({ label: z.string(), url: z.string() })),
    }),
  })
  .strict();

export type PressKit = z.infer<typeof PressKitSchema>;

export const pressKit: PressKit = {
  studio: {
    name: '',
    foundedYear: '',
    location: '',
    website: 'https://heroduelccg.com',
  },
  game: {
    title: 'Hero Duel',
    releaseDate: { es: '', en: '' },
    platforms: [],
    price: { es: '', en: '' },
    modes: [],
    languages: [],
    engine: 'Unity',
  },
  description: {
    short: { es: '', en: '' },
    long: { es: '', en: '' },
  },
  assets: {
    logos: [],
    screenshots: [],
    trailerUrl: '',
    zipUrl: '',
  },
  contact: {
    email: '',
    socials: [],
  },
};

/**
 * Campos sin los que el kit no sirve para su propósito. El tráiler y el zip
 * quedan fuera a propósito: son deseables, pero un periodista puede escribir la
 * nota sin ellos y no puede escribirla sin descripción, plataformas ni capturas.
 */
export interface MissingField {
  path: string;
  why: LocalizedText;
}

export function missingPressKitFields(kit: PressKit = pressKit): MissingField[] {
  const missing: MissingField[] = [];

  const requireText = (value: string, path: string, why: LocalizedText) => {
    if (value.trim().length === 0) missing.push({ path, why });
  };

  const requireLocalized = (value: LocalizedText, path: string, why: LocalizedText) => {
    if (value.es.trim().length === 0 || value.en.trim().length === 0) {
      missing.push({ path, why });
    }
  };

  requireText(kit.studio.name, 'studio.name', {
    es: 'La nota necesita atribuir el juego a alguien.',
    en: 'The article needs someone to attribute the game to.',
  });

  requireText(kit.studio.location, 'studio.location', {
    es: 'La prensa local decide con esto si el juego le interesa.',
    en: 'Local press uses this to decide whether the game is relevant to them.',
  });

  requireLocalized(kit.description.short, 'description.short', {
    es: 'Es la frase que se copia literalmente en titulares y agregadores.',
    en: 'This is the line that gets copied verbatim into headlines and aggregators.',
  });

  requireLocalized(kit.description.long, 'description.long', {
    es: 'Sin ella, el periodista escribe lo que se imagina del juego.',
    en: 'Without it, the writer describes whatever they imagine the game to be.',
  });

  requireLocalized(kit.game.releaseDate, 'game.releaseDate', {
    es: '"Por anunciar" es una respuesta válida; dejarlo vacío no lo es.',
    en: '"To be announced" is a valid answer; leaving it blank is not.',
  });

  requireLocalized(kit.game.price, 'game.price', {
    es: 'Es la primera pregunta de cualquier lector.',
    en: 'It is every reader’s first question.',
  });

  if (kit.game.platforms.length === 0) {
    missing.push({
      path: 'game.platforms',
      why: {
        es: 'Determina qué medios pueden cubrirlo.',
        en: 'It determines which outlets can cover it.',
      },
    });
  }

  if (kit.game.languages.length === 0) {
    missing.push({
      path: 'game.languages',
      why: {
        es: 'La prensa hispanohablante pregunta siempre si está en español.',
        en: 'Spanish-speaking press always asks whether it is localised.',
      },
    });
  }

  if (kit.assets.logos.length === 0) {
    missing.push({
      path: 'assets.logos',
      why: {
        es: 'Sin logotipo, la nota sale con una captura recortada o sin imagen.',
        en: 'Without a logo, the article runs a cropped screenshot or no image.',
      },
    });
  }

  // Tres es el mínimo real: con una sola captura todas las notas se ven iguales.
  if (kit.assets.screenshots.length < 3) {
    missing.push({
      path: 'assets.screenshots',
      why: {
        es: 'Hacen falta al menos tres: con una sola, todas las notas se ven iguales.',
        en: 'At least three are needed: with a single one, every article looks the same.',
      },
    });
  }

  requireText(kit.contact.email, 'contact.email', {
    es: 'Sin contacto, quien quiera una clave o una entrevista se rinde.',
    en: 'With no contact, anyone wanting a key or an interview gives up.',
  });

  return missing;
}

/** El kit solo se publica e indexa cuando no falta nada obligatorio. */
export const isPressKitPublishable: boolean = missingPressKitFields().length === 0;
